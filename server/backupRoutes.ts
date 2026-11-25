import crypto from 'crypto';
import express, { Router } from 'express';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { db as coreDb } from './db.js';
import { ecommerceDb } from './ecommerceDb.js';

const TEMP_BACKUP_PREFIX = 'wdh_website_backup_';
const TEMP_BACKUP_TTL_MS = 10 * 60 * 1000; // 10 minutes max retention

const ALLOWED_ROOT_DIRS = ['src', 'server', 'public'];
const ALLOWED_ROOT_FILES = [
  'index.html',
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  'server.ts',
  'app.js',
  'README.md',
  'metadata.json',
  '.env.example',
  '.gitignore',
];

function isSensitiveOrExcludedName(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  if (lower === '.env.example') return false;
  if (lower === '.env' || lower.startsWith('.env.')) return true;
  if (
    lower.endsWith('.pem') ||
    lower.endsWith('.key') ||
    lower.endsWith('.p12') ||
    lower.endsWith('.pfx') ||
    lower.endsWith('.crt') ||
    lower.endsWith('.secret') ||
    lower.endsWith('.db') ||
    lower.endsWith('.db-wal') ||
    lower.endsWith('.db-shm') ||
    lower.endsWith('.sqlite') ||
    lower.endsWith('.sqlite3') ||
    lower.endsWith('.log')
  ) {
    return true;
  }
  if (lower.includes('credentials') || lower === '.ds_store' || lower === 'thumbs.db') {
    return true;
  }
  return false;
}

function cleanupStaleTempBackups() {
  try {
    const tmpDir = os.tmpdir();
    const entries = fs.readdirSync(tmpDir, { withFileTypes: true });
    const now = Date.now();
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (!entry.name.startsWith(TEMP_BACKUP_PREFIX) || !entry.name.endsWith('.zip')) continue;
      const fullPath = path.resolve(tmpDir, entry.name);
      if (!fullPath.startsWith(path.resolve(tmpDir) + path.sep)) continue;
      const stat = fs.statSync(fullPath);
      if (now - stat.mtimeMs > TEMP_BACKUP_TTL_MS) {
        fs.unlinkSync(fullPath);
      }
    }
  } catch {
    // Non-fatal cleanup sweep
  }
}

// Periodic background cleanup so expired temporary archives never accumulate
const cleanupTimer = setInterval(cleanupStaleTempBackups, 5 * 60 * 1000);
if (typeof cleanupTimer.unref === 'function') {
  cleanupTimer.unref();
}

export function createBackupRouter(): Router {
  const router = Router();

  // Strict server-side admin verification (derives role solely from coreDb, never trusting client role headers)
  function requireVerifiedAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
    const rawHeaderId = String(req.headers['x-user-id'] || '').trim();
    const rawAuth = String(req.headers['authorization'] || '').replace(/^Bearer\s+/i, '').trim();

    let tokenUserId = '';
    if (rawAuth.startsWith('demo-jwt-token-')) {
      tokenUserId = rawAuth.replace('demo-jwt-token-', '').trim();
    } else if (rawAuth) {
      tokenUserId = rawAuth;
    }

    const lookupId = tokenUserId || rawHeaderId;
    const user = lookupId ? coreDb.findUserById(lookupId) : undefined;
    const isAdmin = user ? user.role === 'admin' || user.role === 'superadmin' : false;

    if (!user || !isAdmin) {
      return res.status(403).json({
        error: 'Access Denied: Verified Administrator privileges are required to export website backups.',
      });
    }

    (req as any).verifiedAdmin = user;
    next();
  }

  function collectAccessibleProjectFiles(projectRoot: string) {
    const files: Array<{ absPath: string; zipPath: string }> = [];
    const includedDirs: string[] = [];
    const skippedItems: string[] = [];

    const walkDir = (dirAbsPath: string, zipRelDir: string) => {
      const entries = fs.readdirSync(dirAbsPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isSymbolicLink()) {
          skippedItems.push(`${zipRelDir}/${entry.name} (symlink excluded)`);
          continue;
        }
        const entryAbs = path.resolve(dirAbsPath, entry.name);
        if (!entryAbs.startsWith(projectRoot + path.sep)) {
          continue;
        }
        const entryZipPath = zipRelDir ? `${zipRelDir}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
          if (['node_modules', '.git', '.aistudio', 'data', 'dist'].includes(entry.name)) {
            skippedItems.push(`${entryZipPath}/ (excluded)`);
            continue;
          }
          walkDir(entryAbs, entryZipPath);
        } else if (entry.isFile()) {
          if (isSensitiveOrExcludedName(entry.name)) {
            skippedItems.push(`${entryZipPath} (sensitive/excluded)`);
            continue;
          }
          files.push({ absPath: entryAbs, zipPath: entryZipPath });
        }
      }
    };

    const hasSourceDirs = fs.existsSync(path.join(projectRoot, 'src')) && fs.existsSync(path.join(projectRoot, 'server'));

    for (const dirName of ALLOWED_ROOT_DIRS) {
      const dirAbs = path.resolve(projectRoot, dirName);
      if (dirAbs.startsWith(projectRoot + path.sep) && fs.existsSync(dirAbs) && fs.statSync(dirAbs).isDirectory()) {
        includedDirs.push(dirName);
        walkDir(dirAbs, dirName);
      }
    }

    // Fallback when deployed as a compiled bundle without src/ or server/ directories
    if (!hasSourceDirs) {
      const distAbs = path.resolve(projectRoot, 'dist');
      if (distAbs.startsWith(projectRoot + path.sep) && fs.existsSync(distAbs) && fs.statSync(distAbs).isDirectory()) {
        includedDirs.push('dist');
        const walkDist = (dirAbsPath: string, zipRelDir: string) => {
          const entries = fs.readdirSync(dirAbsPath, { withFileTypes: true });
          for (const entry of entries) {
            if (entry.isSymbolicLink()) continue;
            const entryAbs = path.resolve(dirAbsPath, entry.name);
            if (!entryAbs.startsWith(projectRoot + path.sep)) continue;
            const entryZipPath = `${zipRelDir}/${entry.name}`;
            if (entry.isDirectory()) {
              walkDist(entryAbs, entryZipPath);
            } else if (entry.isFile() && !entry.name.endsWith('.map') && !isSensitiveOrExcludedName(entry.name)) {
              files.push({ absPath: entryAbs, zipPath: entryZipPath });
            }
          }
        };
        walkDist(distAbs, 'dist');
      }
    }

    for (const fileName of ALLOWED_ROOT_FILES) {
      if (isSensitiveOrExcludedName(fileName)) continue;
      const fileAbs = path.resolve(projectRoot, fileName);
      if (fileAbs.startsWith(projectRoot + path.sep) && fs.existsSync(fileAbs) && fs.statSync(fileAbs).isFile()) {
        files.push({ absPath: fileAbs, zipPath: fileName });
      }
    }

    return {
      files,
      includedDirs,
      skippedItems,
      hasFullSource: hasSourceDirs,
    };
  }

  // Inspect accessible backup scope & hosting capability
  router.get('/info', requireVerifiedAdmin, (_req, res) => {
    const projectRoot = path.resolve(process.cwd());
    const scan = collectAccessibleProjectFiles(projectRoot);
    const dateStr = new Date().toISOString().split('T')[0];

    res.json({
      filename: `Website_Full_Backup_${dateStr}.zip`,
      hasFullSource: scan.hasFullSource,
      accessibleFileCount: scan.files.length,
      includedDirs: scan.includedDirs,
      databaseExportIncluded: true,
      environmentLimitationNote: scan.hasFullSource
        ? 'Full project source files, assets, configs, and sanitized SQLite schema/catalog backup are accessible.'
        : 'Running in compiled runtime environment without raw source folders; exporting accessible production files, configs, and sanitized database backup.',
    });
  });

  // Generate & stream complete website ZIP backup
  router.post('/download', requireVerifiedAdmin, async (req, res) => {
    cleanupStaleTempBackups();

    const adminUser = (req as any).verifiedAdmin;
    const projectRoot = path.resolve(process.cwd());
    const dateStr = new Date().toISOString().split('T')[0];
    const backupFileName = `Website_Full_Backup_${dateStr}.zip`;
    const tempZipPath = path.resolve(os.tmpdir(), `${TEMP_BACKUP_PREFIX}${crypto.randomUUID()}.zip`);

    let cleanedUp = false;
    const removeTempZip = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      try {
        if (fs.existsSync(tempZipPath)) {
          fs.unlinkSync(tempZipPath);
        }
      } catch {
        // Ignore cleanup errors
      }
    };

    try {
      const scan = collectAccessibleProjectFiles(projectRoot);
      const dbBackup = ecommerceDb.getSanitizedBackupData();

      const sanitizedSettings = {
        companyName: coreDb.settings.companyName,
        minWithdrawalAmount: coreDb.settings.minWithdrawalAmount,
        tdsPercentage: coreDb.settings.tdsPercentage,
        adminChargePercentage: coreDb.settings.adminChargePercentage,
        binaryMatchingPercentage: coreDb.settings.binaryMatchingPercentage,
        directReferralBonusPercent: coreDb.settings.directReferralBonusPercent,
        videoWatchBvReward: coreDb.settings.videoWatchBvReward,
        videoWatchCashReward: coreDb.settings.videoWatchCashReward,
        announcementNotice: coreDb.settings.announcementNotice,
      };

      const sanitizedApplicationData = {
        exportedAt: new Date().toISOString(),
        securityNotice:
          'Personal user records, passwords, senior secret codes, payment keys, API tokens, and customer PII are intentionally excluded from this export.',
        settings: sanitizedSettings,
        ranks: coreDb.ranks,
        videoTasks: coreDb.videoTasks,
        ecommerceCategories: dbBackup.categories,
        ecommerceProducts: dbBackup.products,
        aggregateMetrics: dbBackup.aggregateStats,
      };

      const manifest = {
        websiteName: 'Watch Video, Dream in Hand Direct Selling Pvt. Ltd.',
        backupFileName,
        generatedAt: new Date().toISOString(),
        generatedByAdminId: adminUser.id,
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          hasFullSourceAccess: scan.hasFullSource,
          includedRootDirectories: scan.includedDirs,
          accessibleProjectFilesCount: scan.files.length,
          limitationNote: scan.hasFullSource
            ? 'Full accessible website source code, public assets, configs, and sanitized database export included.'
            : 'Compiled/restricted host filesystem: exported all accessible runtime/config files plus sanitized database export.',
        },
        securityExclusions: [
          '.env and environment secret files (only .env.example template included)',
          'Private cryptographic keys, certificates, and payment gateway credentials',
          'Live SQLite binary database files containing customer/member PII',
          'Passwords, authentication tokens, and member secret codes',
          'node_modules/, .git/, logs, and local temporary folders',
        ],
        restoreInstructions: {
          localOrVps: ['1. Extract ZIP archive', '2. Copy .env.example to .env and configure your keys', '3. Run: npm install', '4. Run: npm run build', '5. Run: npm start'],
          hostycareCpanel: [
            '1. Extract ZIP archive and run npm install && npm run build (or upload built dist/)',
            '2. In cPanel > Setup Node.js App, set Node 20.x/22.x, Production mode, Startup file: app.js',
            '3. Configure NODE_ENV=production and optional keys in cPanel Environment Variables',
            '4. Click Run NPM Install and Restart App',
          ],
        },
      };

      const { ZipArchive } = await import('archiver');
      await new Promise<void>((resolve, reject) => {
        const output = fs.createWriteStream(tempZipPath);
        const archive = new ZipArchive({ zlib: { level: 6 } });

        output.on('close', () => resolve());
        output.on('error', (err) => reject(err));
        archive.on('error', (err) => reject(err));

        archive.pipe(output);

        for (const item of scan.files) {
          archive.file(item.absPath, { name: item.zipPath });
        }

        archive.append(dbBackup.schemaSql, { name: 'database-backup/schema.sql' });
        archive.append(JSON.stringify(sanitizedApplicationData, null, 2), {
          name: 'database-backup/application-data-sanitized.json',
        });
        archive.append(JSON.stringify(manifest, null, 2), {
          name: 'database-backup/BACKUP_MANIFEST.json',
        });

        archive.finalize();
      });

      const stat = fs.statSync(tempZipPath);
      if (stat.size <= 0) {
        removeTempZip();
        return res.status(500).json({ error: 'Generated ZIP backup was empty. Please try again.' });
      }

      coreDb.addAuditLog(
        adminUser.id,
        adminUser.name,
        'WEBSITE_ZIP_BACKUP_EXPORTED',
        `Administrator downloaded complete website ZIP backup (${backupFileName}, ${scan.files.length} project files, ${stat.size} bytes).`
      );

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${backupFileName}"`);
      res.setHeader('Content-Length', String(stat.size));
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('X-Backup-File-Name', backupFileName);
      res.setHeader('X-Backup-File-Count', String(scan.files.length + 3));

      const readStream = fs.createReadStream(tempZipPath);
      res.on('finish', removeTempZip);
      res.on('close', removeTempZip);
      readStream.on('error', (err) => {
        console.error('Backup stream error:', err);
        removeTempZip();
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed while streaming ZIP backup.' });
        } else {
          res.end();
        }
      });

      readStream.pipe(res);
    } catch (err: any) {
      console.error('Backup generation error:', err);
      removeTempZip();
      if (!res.headersSent) {
        return res.status(500).json({
          error: err?.message || 'Unable to generate website ZIP backup on this server.',
        });
      }
    }
  });

  return router;
}
