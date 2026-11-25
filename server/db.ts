import {
  User,
  RankLevel,
  BvTransaction,
  WalletTransaction,
  WithdrawalRequest,
  RankHistory,
  AuditLog,
  AdminSettings,
  VideoTask,
  Product,
  SafeguardClaim,
  AppNotification,
} from '../src/types/index.js';

import {
  initialUsers,
  initialRanks,
  initialSettings,
  initialBvTransactions,
  initialWalletTransactions,
  initialWithdrawalRequests,
  initialRankHistory,
  initialAuditLogs,
  initialVideoTasks,
  initialProducts,
  initialSafeguardClaims,
  initialNotifications,
} from './data.js';

class InMemoryDatabase {
  users: User[] = [...initialUsers];
  ranks: RankLevel[] = [...initialRanks];
  settings: AdminSettings = { ...initialSettings };
  bvTransactions: BvTransaction[] = [...initialBvTransactions];
  walletTransactions: WalletTransaction[] = [...initialWalletTransactions];
  withdrawalRequests: WithdrawalRequest[] = [...initialWithdrawalRequests];
  rankHistory: RankHistory[] = [...initialRankHistory];
  auditLogs: AuditLog[] = [...initialAuditLogs];
  videoTasks: VideoTask[] = [...initialVideoTasks];
  products: Product[] = [...initialProducts];
  safeguardClaims: SafeguardClaim[] = [...initialSafeguardClaims];
  notifications: AppNotification[] = [...initialNotifications];

  // Helper to generate next unique ID
  generateMemberId(): string {
    const nextNum = 100000 + this.users.length + 1;
    return `WDH-${nextNum}`;
  }

  // Find user by ID, mobile, email, or PAN
  findUserById(id: string): User | undefined {
    return this.users.find((u) => u.id.toLowerCase() === id.toLowerCase());
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const user = this.findUserById(id);
    if (!user) return null;
    const { id: _id, role: _r, joinDate: _j, ...allowed } = updates as any;
    Object.assign(user, allowed);
    return user;
  }

  findUserBySponsorCode(code: string): User | undefined {
    return this.users.find(
      (u) =>
        u.id.toLowerCase() === code.toLowerCase() ||
        (code.toUpperCase() === 'COMPANY-ROOT' && u.role === 'superadmin')
    );
  }

  checkDuplicateUser(pan: string, mobile: string, email: string): { duplicate: boolean; reason?: string } {
    const cleanPan = (pan || '').trim().toUpperCase();
    const cleanMobile = (mobile || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (cleanPan && this.users.some((u) => u.pan.toUpperCase() === cleanPan)) {
      return { duplicate: true, reason: `PAN Number "${cleanPan}" is already registered with an existing member.` };
    }
    if (this.users.some((u) => u.mobile === cleanMobile)) {
      return { duplicate: true, reason: `Mobile Number "${cleanMobile}" is already associated with an account.` };
    }
    if (this.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { duplicate: true, reason: `Email Address "${cleanEmail}" is already in use.` };
    }
    return { duplicate: false };
  }

  // Create new member registration
  registerMember(userData: Partial<User>): { success: boolean; user?: User; error?: string } {
    if (!userData.mobile || !userData.email || !userData.name) {
      return { success: false, error: 'Mandatory fields missing (Name, Mobile, Email).' };
    }

    const dupCheck = this.checkDuplicateUser(userData.pan || '', userData.mobile, userData.email);
    if (dupCheck.duplicate) {
      return { success: false, error: dupCheck.reason };
    }

    const sponsor = this.findUserBySponsorCode(userData.sponsorId || 'WDH-100001');
    if (!sponsor) {
      return { success: false, error: `Invalid Sponsor Code "${userData.sponsorId}". Sponsor does not exist.` };
    }

    // MANDATORY SENIOR SECRET CODE ENFORCEMENT FOR ALL TIME JOINING
    const providedSecretCode = (userData.seniorSecretCode || '').trim().toUpperCase();
    if (!providedSecretCode) {
      return {
        success: false,
        error: 'Senior Secret Code is strictly mandatory for all-time joining. Please ask your Senior Sponsor for their Secret Code.',
      };
    }

    const expectedSecretCode = (sponsor.seniorSecretCode || 'RS-8821').trim().toUpperCase();
    if (providedSecretCode !== expectedSecretCode) {
      return {
        success: false,
        error: `Invalid Senior Secret Code for Senior ${sponsor.name} (${sponsor.id}). Joining requires official authorization from your senior sponsor.`,
      };
    }

    const newId = this.generateMemberId();
    // Generate new unique Senior Secret Code for this new member so they can sponsor others
    const initials = (userData.name.trim().split(/\s+/).map((w) => w[0]).join('') || 'WD').toUpperCase().slice(0, 2);
    const generatedSecret = `${initials}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Determine binary placement if not specified
    let parentId = userData.binaryParentId || sponsor.id;
    let position: 'left' | 'right' = userData.binaryPosition || (sponsor.leftTeamCount <= sponsor.rightTeamCount ? 'left' : 'right');

    const newUser: User = {
      id: newId,
      name: userData.name.trim(),
      fatherHusbandName: userData.fatherHusbandName || '',
      address: userData.address || '',
      city: userData.city || 'New Delhi',
      state: userData.state || 'Delhi',
      pincode: userData.pincode || '110001',
      mobile: userData.mobile.trim(),
      email: userData.email.trim().toLowerCase(),
      pan: (userData.pan || '').trim().toUpperCase(),
      aadhaar: userData.aadhaar || '',
      bankName: userData.bankName || '',
      bankAccount: userData.bankAccount || '',
      ifsc: (userData.ifsc || '').trim().toUpperCase(),
      nomineeName: userData.nomineeName || '',
      nomineeRelation: userData.nomineeRelation || 'Spouse',
      sponsorId: sponsor.id,
      sponsorName: sponsor.name,
      role: 'member',
      joinDate: new Date().toISOString().split('T')[0],
      avatarUrl: userData.avatarUrl || (userData as any).photoDoc || (userData as any).photo || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80`,
      kycStatus: userData.kycDocuments?.panCard ? 'pending' : 'not_submitted',
      kycDocuments: userData.kycDocuments || {},
      personalBv: 0,
      directTeamBv: 0,
      totalTeamBv: 0,
      group1Bv: 0,
      group2Bv: 0,
      resellingBv: 0,
      currentRankId: 0,
      currentRankName: 'Direct Seller Associate',
      walletBalance: 0,
      totalIncome: 0,
      monthlyIncome: 0,
      leftTeamCount: 0,
      rightTeamCount: 0,
      directMembersCount: 0,
      binaryParentId: parentId,
      binaryPosition: position,
      placementType: userData.placementType || 'auto',
      safeguardEligible: false,
      safeguardAmount: 0,
      promotionsWon: [],
      seniorSecretCode: generatedSecret,
      isActive: true,
      status: 'active',
    };

    this.users.push(newUser);

    // Update sponsor stats
    sponsor.directMembersCount += 1;
    if (position === 'left') {
      sponsor.leftTeamCount += 1;
    } else {
      sponsor.rightTeamCount += 1;
    }

    // Add Audit Log
    this.addAuditLog('SYSTEM', 'Registration Engine', 'MEMBER_REGISTERED', `New member ${newUser.name} (${newUser.id}) registered under sponsor ${sponsor.name} (${sponsor.id})`);

    // Add notification
    this.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      userId: sponsor.id,
      title: '👥 New Direct Team Member Joined!',
      message: `${newUser.name} has joined your direct network with ID ${newUser.id}.`,
      type: 'system',
      read: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });

    return { success: true, user: newUser };
  }

  // Add BV Transaction & Rollup to uplines
  addBvTransaction(
    userId: string,
    amount: number,
    source: BvTransaction['source'],
    description: string,
    side: 'left' | 'right' | 'personal' = 'personal',
    adminId?: string
  ): { success: boolean; txn?: BvTransaction; error?: string } {
    if (amount <= 0) {
      return { success: false, error: 'BV Amount must be greater than zero.' };
    }

    const user = this.findUserById(userId);
    if (!user) {
      return { success: false, error: `User with ID ${userId} not found.` };
    }

    const txnId = `BV-TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newTxn: BvTransaction = {
      id: txnId,
      userId: user.id,
      userName: user.name,
      amount,
      source,
      description,
      side,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'verified',
      adminVerified: true,
      adminId: adminId || 'SYSTEM',
    };

    this.bvTransactions.unshift(newTxn);

    // Update User's personal/team BV
    if (side === 'personal') {
      user.personalBv += amount;
      if (source === 'reselling') {
        user.resellingBv += amount;
      }
    } else if (side === 'left') {
      user.group1Bv += amount;
      user.totalTeamBv += amount;
    } else if (side === 'right') {
      user.group2Bv += amount;
      user.totalTeamBv += amount;
    }

    // Roll up BV to Upline in Binary Tree
    this.rollupBvToUplines(user, amount);

    return { success: true, txn: newTxn };
  }

  // Roll up BV to binary ancestors
  private rollupBvToUplines(originUser: User, bvAmount: number) {
    let currentChild = originUser;
    let depth = 0;

    while (currentChild.binaryParentId && depth < 20) {
      const parent = this.findUserById(currentChild.binaryParentId);
      if (!parent) break;

      if (currentChild.binaryPosition === 'left') {
        parent.group1Bv += bvAmount;
      } else {
        parent.group2Bv += bvAmount;
      }
      parent.totalTeamBv += bvAmount;

      // Check if direct sponsor
      if (originUser.sponsorId === parent.id) {
        parent.directTeamBv += bvAmount;
      }

      currentChild = parent;
      depth++;
    }
  }

  // Reverse BV Transaction
  reverseBvTransaction(txnId: string, adminId: string, reason: string): { success: boolean; error?: string } {
    const txn = this.bvTransactions.find((t) => t.id === txnId);
    if (!txn) return { success: false, error: 'Transaction not found.' };
    if (txn.status === 'cancelled') return { success: false, error: 'Transaction is already cancelled.' };

    txn.status = 'cancelled';

    const user = this.findUserById(txn.userId);
    if (user) {
      if (txn.side === 'personal') {
        user.personalBv = Math.max(0, user.personalBv - txn.amount);
      } else if (txn.side === 'left') {
        user.group1Bv = Math.max(0, user.group1Bv - txn.amount);
        user.totalTeamBv = Math.max(0, user.totalTeamBv - txn.amount);
      } else if (txn.side === 'right') {
        user.group2Bv = Math.max(0, user.group2Bv - txn.amount);
        user.totalTeamBv = Math.max(0, user.totalTeamBv - txn.amount);
      }
    }

    this.addAuditLog(adminId, 'Admin', 'BV_TRANSACTION_REVERSED', `Reversed BV transaction ${txnId} (${txn.amount} BV) for ${txn.userName}. Reason: ${reason}`);

    return { success: true };
  }

  // Add Wallet Transaction
  addWalletTransaction(
    userId: string,
    type: 'credit' | 'debit',
    incomeType: WalletTransaction['incomeType'],
    amount: number,
    description: string,
    referenceId?: string
  ): { success: boolean; txn?: WalletTransaction; error?: string } {
    const user = this.findUserById(userId);
    if (!user) return { success: false, error: 'User not found.' };

    let tdsAmount = 0;
    let adminCharge = 0;
    let netAmount = amount;

    if (type === 'credit' && incomeType !== 'admin_adjustment') {
      tdsAmount = Math.round((amount * this.settings.tdsPercentage) / 100);
      adminCharge = Math.round((amount * this.settings.adminChargePercentage) / 100);
      netAmount = amount - tdsAmount - adminCharge;
    }

    if (type === 'credit') {
      user.walletBalance += netAmount;
      user.totalIncome += netAmount;
      user.monthlyIncome += netAmount;
    } else {
      if (user.walletBalance < amount) {
        return { success: false, error: 'Insufficient wallet balance.' };
      }
      user.walletBalance -= amount;
    }

    const newTxn: WalletTransaction = {
      id: `WTX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: user.id,
      type,
      incomeType,
      amount,
      tdsAmount,
      adminCharge,
      netAmount,
      balanceAfter: user.walletBalance,
      description,
      status: 'completed',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      referenceId,
    };

    this.walletTransactions.unshift(newTxn);
    return { success: true, txn: newTxn };
  }

  // Add Audit Log
  addAuditLog(adminId: string, adminName: string, action: string, details: string, previousState?: any, newState?: any) {
    const log: AuditLog = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      adminId,
      adminName,
      action,
      details,
      previousState,
      newState,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    this.auditLogs.unshift(log);
  }
}

export const db = new InMemoryDatabase();
