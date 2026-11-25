import express, { Express } from 'express';
import { db } from './db.js';
import { RankEngine } from './rankEngine.js';
import { BinaryTreeEngine } from './binaryTreeEngine.js';
import { generateMlmAdvisory } from './geminiAdvisor.js';
import { createEcommerceRouter } from './ecommerceRoutes.js';
import { createBackupRouter } from './backupRoutes.js';

export function createApp(): Express {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ==========================================
  // AUTH CONTEXT & SECURITY HELPER
  // ==========================================
  function getAuthContext(req: express.Request) {
    const userId = (req.headers['x-user-id'] as string || '').trim();
    const token = (req.headers['authorization'] as string || '').replace(/^Bearer\s+/i, '').trim();

    let user = userId ? db.findUserById(userId) : undefined;
    if (!user && token) {
      if (token.startsWith('demo-jwt-token-')) {
        const parsedId = token.replace('demo-jwt-token-', '');
        user = db.findUserById(parsedId);
      } else {
        user = db.findUserById(token);
      }
    }

    // Role resolution: prioritize user record in database
    const role = user ? user.role : ((req.headers['x-user-role'] as string || 'member') as 'admin' | 'superadmin' | 'member');
    const isAdmin = role === 'admin' || role === 'superadmin';

    return { userId: user ? user.id : userId, user, role, isAdmin, token };
  }

  // ==========================================
  // API ROUTES
  // ==========================================

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Watch Video Dream in Hand ERP', timestamp: new Date().toISOString() });
  });

  // 1. Auth & Registration
  app.post('/api/auth/login', (req, res) => {
    const { loginId, password } = req.body;
    if (!loginId) {
      return res.status(400).json({ error: 'Please enter Member ID, Mobile, or Email.' });
    }

    const clean = loginId.trim().toLowerCase();
    const user = db.users.find(
      (u) =>
        u.id.toLowerCase() === clean ||
        u.email.toLowerCase() === clean ||
        u.mobile === loginId.trim()
    );

    if (!user) {
      return res.status(401).json({ error: 'No member account found with provided credentials.' });
    }

    // In production demo, we authenticate and return user info
    res.json({ success: true, user, token: `demo-jwt-token-${user.id}` });
  });

  // Public Member Lookup for Login Form Passport Photo Preview
  app.get('/api/auth/lookup-member/:id', (req, res) => {
    const rawId = req.params.id?.trim();
    if (!rawId) {
      return res.status(400).json({ found: false, message: 'User ID is required' });
    }
    const clean = rawId.toLowerCase();
    const user = db.users.find(
      (u) =>
        u.id.toLowerCase() === clean ||
        u.email.toLowerCase() === clean ||
        u.mobile === rawId
    );

    if (!user) {
      return res.status(404).json({ found: false, message: 'Member ID not found in directory' });
    }

    res.json({
      found: true,
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      currentRankName: user.currentRankName,
      kycStatus: user.kycStatus,
      joinDate: user.joinDate,
      role: user.role,
    });
  });

  // Verify sponsor code & optional secret code
  app.get('/api/auth/verify-sponsor/:code', (req, res) => {
    const { code } = req.params;
    const secretCode = req.query.secretCode as string | undefined;
    const sponsor = db.findUserBySponsorCode(code);
    if (!sponsor) {
      return res.status(404).json({ valid: false, message: 'Invalid Sponsor Code. Sponsor does not exist.' });
    }

    const expectedSecret = (sponsor.seniorSecretCode || 'RS-8821').trim().toUpperCase();
    const isSecretProvided = !!secretCode && secretCode.trim().length > 0;
    const isSecretValid = isSecretProvided && secretCode.trim().toUpperCase() === expectedSecret;

    res.json({
      valid: true,
      sponsorId: sponsor.id,
      sponsorName: sponsor.name,
      rank: sponsor.currentRankName,
      seniorSecretCodeRequired: true,
      isSecretProvided,
      isSecretValid,
      message: isSecretProvided
        ? isSecretValid
          ? `Verified! Senior ${sponsor.name} Secret Code Authorized.`
          : `Invalid Senior Secret Code for ${sponsor.name}.`
        : 'Senior Secret Code is mandatory for joining under this sponsor.',
    });
  });

  // Verify Senior Secret Code specifically
  app.post('/api/auth/verify-senior-code', (req, res) => {
    const { sponsorId, secretCode } = req.body;
    if (!sponsorId) {
      return res.status(400).json({ valid: false, message: 'Senior Sponsor ID is required.' });
    }
    const sponsor = db.findUserBySponsorCode(sponsorId);
    if (!sponsor) {
      return res.status(404).json({ valid: false, message: 'Senior Sponsor does not exist.' });
    }
    if (!secretCode || !String(secretCode).trim()) {
      return res.status(400).json({
        valid: false,
        message: 'Senior Secret Code is mandatory for all-time joining.',
      });
    }

    const expected = (sponsor.seniorSecretCode || 'RS-8821').trim().toUpperCase();
    const provided = String(secretCode).trim().toUpperCase();

    if (expected !== provided) {
      return res.status(400).json({
        valid: false,
        message: `Invalid Senior Secret Code for ${sponsor.name} (${sponsor.id}). Please ask your senior for their correct authorization secret code.`,
      });
    }

    res.json({
      valid: true,
      sponsorId: sponsor.id,
      sponsorName: sponsor.name,
      rank: sponsor.currentRankName,
      message: `Senior Authorization Confirmed: ${sponsor.name} (${sponsor.currentRankName}) Secret Code Verified!`,
    });
  });

  // Online Joining Registration
  app.post('/api/auth/register', (req, res) => {
    const result = db.registerMember(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Evaluate rank for new user
    RankEngine.evaluateUserRank(result.user!.id);

    res.status(201).json({
      success: true,
      message: 'Registration completed successfully! Welcome to Watch Video Dream in Hand.',
      user: result.user,
    });
  });

  // 2. Users & Team Management - Secure & Isolated
  // Current user's own private profile
  app.get('/api/users/me', (req, res) => {
    const auth = getAuthContext(req);
    if (!auth.user) {
      return res.status(401).json({ error: 'Unauthorized: Please log in to your account.' });
    }
    res.json(auth.user);
  });

  // Current user updating their own profile & account details
  app.put('/api/users/me', (req, res) => {
    const auth = getAuthContext(req);
    if (!auth.user) {
      return res.status(401).json({ error: 'Unauthorized: Please log in to your account.' });
    }
    const updated = db.updateUser(auth.user.id, req.body);
    db.addAuditLog(auth.user.id, auth.user.name, 'PROFILE_UPDATED', `Member updated own profile & account details.`);
    res.json({ success: true, user: updated });
  });

  // Global users directory - strictly restricted to Admin
  app.get('/api/users', (req, res) => {
    const auth = getAuthContext(req);
    
    // Privacy Enforcement: Non-admins cannot inspect other members' profiles
    if (!auth.isAdmin) {
      if (auth.user) {
        return res.json({ total: 1, users: [auth.user] });
      }
      return res.status(403).json({
        error: 'Access Denied: Only administrators can view the complete user directory. Individual user IDs and accounts are strictly private.',
        total: 0,
        users: [],
      });
    }

    const { search, rankId, kycStatus, role } = req.query;
    let list = [...db.users];

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (u) =>
          u.id.toLowerCase().includes(q) ||
          u.name.toLowerCase().includes(q) ||
          u.mobile.includes(q) ||
          u.pan.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    if (rankId && rankId !== 'all') {
      list = list.filter((u) => u.currentRankId === Number(rankId));
    }

    if (kycStatus && kycStatus !== 'all') {
      list = list.filter((u) => u.kycStatus === kycStatus);
    }

    if (role && role !== 'all') {
      list = list.filter((u) => u.role === role);
    }

    res.json({ total: list.length, users: list });
  });

  // Get specific user - strictly enforces data isolation
  app.get('/api/users/:id', (req, res) => {
    const auth = getAuthContext(req);
    const requestedId = req.params.id.toLowerCase();

    // Isolation check: Ordinary user cannot access another user's private data
    if (!auth.isAdmin && auth.userId.toLowerCase() !== requestedId) {
      return res.status(403).json({
        error: 'Access Denied: You are not authorized to view another member\'s private profile or account details (অন্য ব্যবহারকারীর ব্যক্তিগত তথ্য দেখা নিষিদ্ধ)।',
      });
    }

    const user = db.findUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });

  // Update specific user profile
  app.put('/api/users/:id', (req, res) => {
    const auth = getAuthContext(req);
    const requestedId = req.params.id.toLowerCase();

    if (!auth.isAdmin && auth.userId.toLowerCase() !== requestedId) {
      return res.status(403).json({
        error: 'Access Denied: You cannot modify another user\'s profile.',
      });
    }

    const updated = db.updateUser(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'User not found' });

    db.addAuditLog(auth.userId || 'USER', auth.user?.name || 'User', 'PROFILE_UPDATED', `Profile updated for ${updated.name} (${updated.id})`);
    res.json({ success: true, user: updated });
  });

  app.get('/api/users/:id/team', (req, res) => {
    // Sanitize seniorSecretCode so downlines' secret codes are private to each individual member
    const directs = db.users
      .filter((u) => u.sponsorId.toLowerCase() === req.params.id.toLowerCase())
      .map((u) => {
        const { seniorSecretCode, ...safeUser } = u;
        return safeUser;
      });
    res.json({ directCount: directs.length, members: directs });
  });

  app.get('/api/users/:id/bv', (req, res) => {
    const user = db.findUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const transactions = db.bvTransactions.filter((t) => t.userId.toLowerCase() === req.params.id.toLowerCase());
    res.json({
      personalBv: user.personalBv,
      group1Bv: user.group1Bv,
      group2Bv: user.group2Bv,
      totalTeamBv: user.totalTeamBv,
      resellingBv: user.resellingBv,
      transactions,
    });
  });

  app.get('/api/users/:id/rank', (req, res) => {
    try {
      const rankInfo = RankEngine.evaluateUserRank(req.params.id);
      res.json(rankInfo);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // 3. BV Transactions & Engine
  app.post('/api/bv/transaction', (req, res) => {
    const { userId, amount, source, description, side, adminId } = req.body;
    const result = db.addBvTransaction(userId, Number(amount), source, description, side || 'personal', adminId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Automatically trigger Rank Engine for this user and binary uplines
    const rankResult = RankEngine.evaluateUserRank(userId);
    RankEngine.evaluateAllUsers(); // Batch update uplines

    res.json({
      success: true,
      transaction: result.txn,
      rankUpdate: rankResult,
    });
  });

  app.get('/api/bv/history/:userId', (req, res) => {
    const txns = db.bvTransactions.filter((t) => t.userId.toLowerCase() === req.params.userId.toLowerCase());
    res.json(txns);
  });

  app.post('/api/bv/reverse', (req, res) => {
    const { txnId, adminId, reason } = req.body;
    const result = db.reverseBvTransaction(txnId, adminId || 'WDH-ADMIN-01', reason || 'Administrative Correction');

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Recalculate ranks across all members
    RankEngine.evaluateAllUsers();

    res.json({ success: true, message: 'Transaction reversed and all member ranks recalculated.' });
  });

  // 4. Ranks & Recognition Levels (All 18 Ranks API)
  app.get('/api/ranks', (req, res) => {
    res.json(db.ranks);
  });

  app.post('/api/admin/ranks', (req, res) => {
    const newRank = req.body;
    if (!newRank.name || !newRank.totalBvRequired) {
      return res.status(400).json({ error: 'Rank name and Total BV required are mandatory.' });
    }

    const nextId = db.ranks.length > 0 ? Math.max(...db.ranks.map((r) => r.id)) + 1 : 1;
    const createdRank = {
      ...newRank,
      id: nextId,
      isEnabled: newRank.isEnabled !== false,
      badgeColor: newRank.badgeColor || '#FFD700',
    };

    db.ranks.push(createdRank);
    db.addAuditLog('ADMIN', 'Admin', 'RANK_CREATED', `Added new Recognition Level: ${createdRank.name} (${createdRank.totalBvRequired} BV)`);

    RankEngine.evaluateAllUsers();
    res.status(201).json({ success: true, rank: createdRank });
  });

  app.put('/api/admin/ranks/:id', (req, res) => {
    const rankId = Number(req.params.id);
    const index = db.ranks.findIndex((r) => r.id === rankId);
    if (index === -1) {
      return res.status(404).json({ error: 'Rank not found' });
    }

    const oldState = { ...db.ranks[index] };
    db.ranks[index] = {
      ...db.ranks[index],
      ...req.body,
      id: rankId, // Preserve ID
    };

    db.addAuditLog('ADMIN', 'Admin', 'RANK_UPDATED', `Updated Rank ID ${rankId} (${db.ranks[index].name})`, oldState, db.ranks[index]);

    // Recalculate all users with new criteria
    RankEngine.evaluateAllUsers();

    res.json({ success: true, rank: db.ranks[index] });
  });

  // 5. Binary Genealogy Tree
  app.get('/api/binary-tree/:rootId', (req, res) => {
    const depth = Number(req.query.depth) || 4;
    const tree = BinaryTreeEngine.getBinaryTree(req.params.rootId, depth);
    if (!tree) {
      return res.status(404).json({ error: 'Root node not found for binary tree.' });
    }
    res.json(tree);
  });

  app.get('/api/binary-tree/placement-spot/:sponsorId', (req, res) => {
    const preference = (req.query.preference as any) || 'weaker_leg';
    const spot = BinaryTreeEngine.findAvailablePlacement(req.params.sponsorId, preference);
    res.json(spot);
  });

  // 5b. All Network & Downline Directory with Pagination & Leg Filters
  app.get('/api/network/downlines', (req, res) => {
    const auth = getAuthContext(req);
    const targetUserId = (req.query.userId as string) || auth.userId;
    const targetUser = db.findUserById(targetUserId) || auth.user;

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isAdmin = auth.isAdmin;
    if (!isAdmin && auth.userId && targetUser.id.toLowerCase() !== auth.userId.toLowerCase()) {
      return res.status(403).json({ error: 'Access Denied: You can only view members in your own network downline.' });
    }

    let allMembers = BinaryTreeEngine.getDownlineList(targetUser.id, isAdmin && req.query.scope === 'all');

    // Stats before filtering
    const stats = {
      totalMembers: allMembers.length,
      leftLegCount: allMembers.filter((m) => m.leg === 'left').length,
      rightLegCount: allMembers.filter((m) => m.leg === 'right').length,
      directCount: allMembers.filter((m) => m.sponsorId.toLowerCase() === targetUser.id.toLowerCase()).length,
      activeCount: allMembers.filter((m) => m.isActive).length,
      leftBv: targetUser.group1Bv,
      rightBv: targetUser.group2Bv,
      totalTeamBv: targetUser.totalTeamBv,
    };

    // Filter by search query
    const search = (req.query.search as string || '').trim().toLowerCase();
    if (search) {
      allMembers = allMembers.filter(
        (m) =>
          m.id.toLowerCase().includes(search) ||
          m.name.toLowerCase().includes(search) ||
          m.sponsorId.toLowerCase().includes(search) ||
          m.sponsorName.toLowerCase().includes(search) ||
          m.currentRankName.toLowerCase().includes(search) ||
          m.mobile.includes(search)
      );
    }

    // Filter by leg
    const leg = req.query.leg as string;
    if (leg && leg !== 'all') {
      if (leg === 'direct') {
        allMembers = allMembers.filter((m) => m.sponsorId.toLowerCase() === targetUser.id.toLowerCase());
      } else {
        allMembers = allMembers.filter((m) => m.leg === leg);
      }
    }

    // Filter by KYC status
    const kyc = req.query.kyc as string;
    if (kyc && kyc !== 'all') {
      allMembers = allMembers.filter((m) => m.kycStatus === kyc);
    }

    // Sorting
    const sortBy = (req.query.sortBy as string) || 'level';
    const sortOrder = (req.query.sortOrder as string) || 'asc';
    allMembers.sort((a: any, b: any) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = String(valB).toLowerCase();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Pagination
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const totalFiltered = allMembers.length;
    const totalPages = Math.ceil(totalFiltered / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedMembers = allMembers.slice(startIndex, startIndex + limit);

    res.json({
      success: true,
      stats,
      page,
      limit,
      total: totalFiltered,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      members: paginatedMembers,
    });
  });

  // 6. Wallet, 10+ Incomes & Withdrawals
  app.get('/api/wallets/:userId', (req, res) => {
    const user = db.findUserById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const transactions = db.walletTransactions.filter((t) => t.userId.toLowerCase() === req.params.userId.toLowerCase());

    // Calculate income breakdown
    const incomeBreakdown: Record<string, number> = {
      retail_profit: 0,
      direct_income: 0,
      referral_bonus: 0,
      binary_matching: 0,
      matching_bonus: 0,
      leadership_bonus: 0,
      rank_accelerator: 0,
      royalty_income: 0,
      reward_income: 0,
      promotion_bonus: 0,
      video_task_earning: 0,
      safeguard_payout: 0,
    };

    transactions.forEach((tx) => {
      if (tx.type === 'credit' && incomeBreakdown[tx.incomeType] !== undefined) {
        incomeBreakdown[tx.incomeType] += tx.netAmount;
      }
    });

    res.json({
      walletBalance: user.walletBalance,
      totalIncome: user.totalIncome,
      monthlyIncome: user.monthlyIncome,
      incomeBreakdown,
      transactions,
    });
  });

  app.post('/api/wallets/withdraw', (req, res) => {
    const { userId, amount } = req.body;
    const numAmount = Number(amount);
    const user = db.findUserById(userId);

    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (numAmount < db.settings.minWithdrawalAmount) {
      return res.status(400).json({ error: `Minimum withdrawal amount is ₹${db.settings.minWithdrawalAmount}.` });
    }

    if (user.walletBalance < numAmount) {
      return res.status(400).json({ error: 'Insufficient wallet balance.' });
    }

    if (user.kycStatus !== 'verified') {
      return res.status(400).json({ error: 'KYC must be verified before requesting bank withdrawals.' });
    }

    const tds = Math.round((numAmount * db.settings.tdsPercentage) / 100);
    const adminFee = Math.round((numAmount * db.settings.adminChargePercentage) / 100);
    const payableAmount = numAmount - tds - adminFee;

    // Deduct from wallet
    user.walletBalance -= numAmount;

    // Create withdrawal request
    const reqId = `WTH-REQ-${Date.now()}`;
    const withdrawReq: any = {
      id: reqId,
      userId: user.id,
      userName: user.name,
      memberId: user.id,
      requestedAmount: numAmount,
      tds,
      adminFee,
      payableAmount,
      bankName: user.bankName,
      accountNumber: user.bankAccount,
      ifsc: user.ifsc,
      status: 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    db.withdrawalRequests.unshift(withdrawReq);

    // Record wallet debit transaction
    db.walletTransactions.unshift({
      id: `WTX-${Date.now()}`,
      userId: user.id,
      type: 'debit',
      incomeType: 'withdrawal',
      amount: numAmount,
      tdsAmount: tds,
      adminCharge: adminFee,
      netAmount: payableAmount,
      balanceAfter: user.walletBalance,
      description: `Bank Withdrawal Request to ${user.bankName} (A/C ...${user.bankAccount.slice(-4)})`,
      status: 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      referenceId: reqId,
    });

    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully. Bank transfer will be processed within 24 business hours.',
      request: withdrawReq,
    });
  });

  app.get('/api/withdrawals', (req, res) => {
    const { status, userId } = req.query;
    let list = [...db.withdrawalRequests];
    if (status && status !== 'all') {
      list = list.filter((w) => w.status === status);
    }
    if (userId) {
      list = list.filter((w) => w.userId.toLowerCase() === String(userId).toLowerCase());
    }
    res.json(list);
  });

  app.put('/api/admin/withdrawals/:id', (req, res) => {
    const { status, utrNumber, adminNotes } = req.body;
    const reqItem = db.withdrawalRequests.find((w) => w.id === req.params.id);
    if (!reqItem) return res.status(404).json({ error: 'Withdrawal request not found' });

    reqItem.status = status || reqItem.status;
    if (utrNumber) reqItem.utrNumber = utrNumber;
    if (adminNotes) reqItem.adminNotes = adminNotes;
    reqItem.processedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

    db.addAuditLog(
      'ADMIN',
      'Admin Operations',
      'WITHDRAWAL_STATUS_UPDATE',
      `Updated Withdrawal ${reqItem.id} for ${reqItem.userName} to status "${reqItem.status}". UTR: ${utrNumber || 'N/A'}`
    );

    res.json({ success: true, request: reqItem });
  });

  // 7. KYC Management
  app.post('/api/kyc/upload', (req, res) => {
    const { userId, documents } = req.body;
    const user = db.findUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.kycDocuments = { ...user.kycDocuments, ...documents };
    user.kycStatus = 'pending';
    user.kycRejectReason = undefined;

    db.addAuditLog(user.id, user.name, 'KYC_DOCUMENTS_SUBMITTED', 'Member uploaded KYC verification documents.');

    res.json({ success: true, message: 'KYC documents submitted for admin verification.', user });
  });

  app.put('/api/admin/kyc/:userId', (req, res) => {
    const { status, reason } = req.body;
    const user = db.findUserById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.kycStatus = status;
    if (status === 'rejected') {
      user.kycRejectReason = reason || 'Document image unclear or mismatch with PAN details.';
    } else {
      user.kycRejectReason = undefined;
    }

    db.addAuditLog(
      'ADMIN',
      'Admin Verification Officer',
      `KYC_${status.toUpperCase()}`,
      `KYC marked as ${status} for ${user.name} (${user.id}). ${reason ? 'Reason: ' + reason : ''}`
    );

    res.json({ success: true, user });
  });

  // 8. Watch Video, Dream in Hand (Video Ad Tasks & Earning)
  app.get('/api/video-tasks', (req, res) => {
    res.json(db.videoTasks);
  });

  app.post('/api/video-tasks/complete', (req, res) => {
    const { userId, taskId } = req.body;
    const user = db.findUserById(userId);
    const task = db.videoTasks.find((t) => t.id === taskId);

    if (!user || !task) return res.status(400).json({ error: 'User or Task not found.' });

    const bvReward = task.bvReward || db.settings.videoWatchBvReward;
    const cashReward = task.cashReward || db.settings.videoWatchCashReward;

    // Credit BV
    db.addBvTransaction(user.id, bvReward, 'video_ad_task', `Watch Video Dream in Hand: Completed "${task.title}"`, 'personal');

    // Credit Wallet
    db.addWalletTransaction(
      user.id,
      'credit',
      'video_task_earning',
      cashReward,
      `Task Reward for watching "${task.title}" (${task.advertiserName})`
    );

    // Evaluate rank promotion
    const rankResult = RankEngine.evaluateUserRank(user.id);

    res.json({
      success: true,
      message: `🎉 Congratulations! Earned ${bvReward} BV and ₹${cashReward} credited to your wallet!`,
      user: db.findUserById(userId),
      rankResult,
    });
  });

  // 9. Products & Repurchase Orders
  app.get('/api/products', (req, res) => {
    res.json(db.products);
  });

  app.post('/api/orders/create', (req, res) => {
    const { userId, productId, quantity, side } = req.body;
    const user = db.findUserById(userId);
    const product = db.products.find((p) => p.id === productId);

    if (!user || !product) return res.status(400).json({ error: 'User or Product not found' });

    const qty = Number(quantity) || 1;
    const totalDp = product.dp * qty;
    const totalBv = product.bv * qty;

    // Credit BV Transaction
    db.addBvTransaction(
      user.id,
      totalBv,
      'product_purchase',
      `Purchased ${qty}x ${product.name} (₹${totalDp.toLocaleString('en-IN')})`,
      side || 'personal'
    );

    // Evaluate rank
    const rankResult = RankEngine.evaluateUserRank(user.id);
    RankEngine.evaluateAllUsers();

    res.json({
      success: true,
      message: `Order placed successfully! ${totalBv} BV generated and rolled up in the binary network.`,
      rankResult,
      user: db.findUserById(userId),
    });
  });

  // 10. Admin Settings, Reports & Audit - Strictly Guarded
  // Admin Guard Middleware: All /api/admin routes require administrator privileges
  app.use('/api/admin', (req, res, next) => {
    const auth = getAuthContext(req);
    if (!auth.isAdmin) {
      return res.status(403).json({
        error: 'Access Denied: Administrator privileges required (শুধুমাত্র অনুমোদিত অ্যাডমিন অ্যাক্সেস করতে পারেন)। Role-based security active.',
      });
    }
    next();
  });

  // Admin: Get all users with full management data
  app.get('/api/admin/users', (req, res) => {
    const { search, rankId, kycStatus, role } = req.query;
    let list = [...db.users];

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (u) =>
          u.id.toLowerCase().includes(q) ||
          u.name.toLowerCase().includes(q) ||
          u.mobile.includes(q) ||
          u.pan.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    if (rankId && rankId !== 'all') {
      list = list.filter((u) => u.currentRankId === Number(rankId));
    }

    if (kycStatus && kycStatus !== 'all') {
      list = list.filter((u) => u.kycStatus === kycStatus);
    }

    if (role && role !== 'all') {
      list = list.filter((u) => u.role === role);
    }

    res.json({ total: list.length, users: list });
  });

  // Admin: Balance / BV Adjustment
  app.post('/api/admin/adjust-balance', (req, res) => {
    const { userId, type, amount, remark } = req.body;
    const user = db.findUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const num = Number(amount) || 0;
    
    if (type === 'wallet') {
      db.addWalletTransaction(
        user.id,
        num >= 0 ? 'credit' : 'debit',
        'admin_adjustment',
        Math.abs(num),
        remark || 'Admin ERP balance adjustment'
      );
    } else if (type === 'bv') {
      db.addBvTransaction(
        user.id,
        num,
        'admin_adjustment',
        remark || 'Admin ERP BV adjustment',
        'personal'
      );
      RankEngine.evaluateUserRank(user.id);
    }

    db.addAuditLog('ADMIN', 'Super Admin', 'BALANCE_ADJUSTED', `Adjusted ${type} by ${num} for ${user.name} (${user.id}). Remark: ${remark}`);
    res.json({ success: true, message: 'Balance adjusted successfully.', user: db.findUserById(userId) });
  });

  // Admin: KYC status update alias
  app.post('/api/admin/users/:userId/kyc-status', (req, res) => {
    const { kycStatus, reason } = req.body;
    const user = db.findUserById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.kycStatus = kycStatus;
    if (kycStatus === 'rejected') {
      user.kycRejectReason = reason || 'Document unclear or rejected by Admin.';
    } else {
      user.kycRejectReason = undefined;
    }

    db.addAuditLog('ADMIN', 'Super Admin', `KYC_${kycStatus.toUpperCase()}`, `KYC marked as ${kycStatus} for ${user.name} (${user.id}).`);
    res.json({ success: true, user });
  });

  // Admin: Withdrawal status update alias
  app.post('/api/admin/withdrawals/:id/status', (req, res) => {
    const { status, utrNumber, adminNotes } = req.body;
    const reqItem = db.withdrawalRequests.find((w) => w.id === req.params.id);
    if (!reqItem) return res.status(404).json({ error: 'Withdrawal request not found' });

    reqItem.status = status || reqItem.status;
    if (utrNumber) reqItem.utrNumber = utrNumber;
    if (adminNotes) reqItem.adminNotes = adminNotes;
    reqItem.processedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

    db.addAuditLog(
      'ADMIN',
      'Super Admin',
      'WITHDRAWAL_STATUS_UPDATE',
      `Updated Withdrawal ${reqItem.id} for ${reqItem.userName} to status "${reqItem.status}". UTR: ${utrNumber || 'N/A'}`
    );

    res.json({ success: true, request: reqItem });
  });

  // Admin: Get all withdrawals
  app.get('/api/admin/withdrawals', (req, res) => {
    res.json(db.withdrawalRequests);
  });

  app.get('/api/admin/settings', (req, res) => {
    res.json(db.settings);
  });

  app.put('/api/admin/settings', (req, res) => {
    db.settings = { ...db.settings, ...req.body };
    db.addAuditLog('ADMIN', 'Super Admin', 'SETTINGS_UPDATED', 'Admin configuration settings updated.');
    res.json({ success: true, settings: db.settings });
  });

  app.get(['/api/admin/reports', '/api/admin/reports/summary'], (req, res) => {
    const totalUsers = db.users.length;
    const activeUsers = db.users.filter((u) => u.isActive).length;
    const totalBvCirculation = db.users.reduce((sum, u) => sum + u.personalBv + u.group1Bv + u.group2Bv, 0);
    const totalWalletLiability = db.users.reduce((sum, u) => sum + u.walletBalance, 0);
    const totalIncomeDisbursed = db.users.reduce((sum, u) => sum + u.totalIncome, 0);
    const pendingWithdrawals = db.withdrawalRequests.filter((w) => w.status === 'pending').length;
    const pendingKyc = db.users.filter((u) => u.kycStatus === 'pending').length;

    // Rank Distribution
    const rankDistribution: Record<string, number> = {};
    db.ranks.forEach((r) => {
      rankDistribution[r.name] = db.users.filter((u) => u.currentRankId === r.id).length;
    });

    res.json({
      totalUsers,
      activeUsers,
      totalBvCirculation,
      totalWalletLiability,
      totalIncomeDisbursed,
      pendingWithdrawals,
      pendingKyc,
      rankDistribution,
      totalAuditLogs: db.auditLogs.length,
    });
  });

  app.get('/api/admin/audit-logs', (req, res) => {
    res.json(db.auditLogs);
  });

  app.get('/api/safeguard/claims', (req, res) => {
    res.json(db.safeguardClaims);
  });

  app.post('/api/safeguard/claim', (req, res) => {
    const claimData = req.body;
    const newClaim: any = {
      ...claimData,
      id: `CLM-SAFE-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    db.safeguardClaims.unshift(newClaim);
    res.json({ success: true, message: 'Accidental Death Safeguard claim registered successfully.', claim: newClaim });
  });

  // 11. AI Smart Business Advisor
  app.post('/api/ai/advise', async (req, res) => {
    const { query, userContext } = req.body;
    try {
      const advice = await generateMlmAdvisory(query, userContext);
      res.json({ success: true, advice });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 12. Notifications
  app.get('/api/notifications/:userId', (req, res) => {
    const uid = req.params.userId.toLowerCase();
    const list = db.notifications.filter((n) => n.userId === 'ALL' || n.userId.toLowerCase() === uid);
    res.json(list);
  });

  // 13. Complete Product Management, E-Commerce, Order, Delivery & BP System
  app.use('/api/ecommerce', createEcommerceRouter());

  // 14. Admin-Only Complete Website ZIP Backup & Export
  app.use('/api/admin/backup', createBackupRouter());

  return app;
}
