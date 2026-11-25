import { db } from './db.js';
import { User, RankLevel, RankHistory } from '../src/types/index.js';

export interface RankCalculationResult {
  userId: string;
  previousRankId: number;
  newRankId: number;
  isPromoted: boolean;
  isDemoted: boolean;
  currentRank: RankLevel | null;
  nextRank: RankLevel | null;
  totalBv: number;
  group1Bv: number;
  group2Bv: number;
  progressPercent: number;
  remainingTotalBv: number;
  remainingGroup1Bv: number;
  remainingGroup2Bv: number;
  promotionRewardUnlocked?: string;
  safeguardUnlocked?: number;
}

export class RankEngine {
  /**
   * Recalculate rank for a specific user based on dynamic BV and admin-configured ranks
   */
  static evaluateUserRank(userId: string): RankCalculationResult {
    const user = db.findUserById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    const previousRankId = user.currentRankId;

    // Calculate user's active valid BV volumes
    // Group 1 (weaker vertical) and Group 2 (stronger vertical)
    const legA = user.group1Bv;
    const legB = user.group2Bv;
    const weakerLegBv = Math.min(legA, legB);
    const strongerLegBv = Math.max(legA, legB);
    const totalBv = user.personalBv + user.group1Bv + user.group2Bv;

    // Get enabled ranks sorted ascending by totalBvRequired
    const enabledRanks = db.ranks
      .filter((r) => r.isEnabled)
      .sort((a, b) => a.id - b.id);

    let qualifiedRank: RankLevel | null = null;

    // Evaluate upward from Rank 1 to 18
    for (const rank of enabledRanks) {
      const meetsTotalBv = totalBv >= rank.totalBvRequired;
      const meetsGroup1 = weakerLegBv >= rank.group1BvRequired;
      const meetsGroup2 = strongerLegBv >= rank.group2BvRequired;

      if (meetsTotalBv && meetsGroup1 && meetsGroup2) {
        qualifiedRank = rank;
      } else {
        // Since ranks are progressive, once a condition is not met, higher ranks cannot be qualified
        break;
      }
    }

    const newRankId = qualifiedRank ? qualifiedRank.id : 0;
    const newRankName = qualifiedRank ? qualifiedRank.name : 'Direct Seller Associate';

    const isPromoted = newRankId > previousRankId;
    const isDemoted = newRankId < previousRankId;

    // Update user rank state
    user.currentRankId = newRankId;
    user.currentRankName = newRankName;

    let promotionRewardUnlocked: string | undefined;
    let safeguardUnlocked: number | undefined;

    // Handle Promotion
    if (isPromoted && qualifiedRank) {
      if (qualifiedRank.promotionReward && !user.promotionsWon.includes(qualifiedRank.promotionReward)) {
        user.promotionsWon.push(qualifiedRank.promotionReward);
        promotionRewardUnlocked = qualifiedRank.promotionReward;
      }

      if (qualifiedRank.safeguardAmount && qualifiedRank.safeguardAmount > 0) {
        user.safeguardEligible = true;
        user.safeguardAmount = Math.max(user.safeguardAmount, qualifiedRank.safeguardAmount);
        safeguardUnlocked = qualifiedRank.safeguardAmount;
      }

      // Record in permanent rank history
      const oldRankObj = db.ranks.find((r) => r.id === previousRankId);
      const historyEntry: RankHistory = {
        id: `RHIST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: user.id,
        userName: user.name,
        oldRankId: previousRankId,
        oldRankName: oldRankObj ? oldRankObj.name : 'Associate',
        newRankId: qualifiedRank.id,
        newRankName: qualifiedRank.name,
        totalBvAtPromotion: totalBv,
        group1Bv: weakerLegBv,
        group2Bv: strongerLegBv,
        promotedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        rewardUnlocked: promotionRewardUnlocked,
        safeguardUnlocked: safeguardUnlocked,
      };

      db.rankHistory.unshift(historyEntry);

      // Create Step Accelerator Cash Bonus into Wallet
      const acceleratorBonus = qualifiedRank.id * 2500;
      db.addWalletTransaction(
        user.id,
        'credit',
        'rank_accelerator',
        acceleratorBonus,
        `Rank Step Accelerator Cash Reward for achieving Rank ${qualifiedRank.id} (${qualifiedRank.name})`,
        historyEntry.id
      );

      // System notification
      db.notifications.unshift({
        id: `NOTIF-${Date.now()}`,
        userId: user.id,
        title: `🏆 Congratulations! Promoted to ${qualifiedRank.name}`,
        message: `You have successfully achieved Rank ${qualifiedRank.id} (${qualifiedRank.name}) with ${totalBv.toLocaleString('en-IN')} Total BV. Check your rewards!`,
        type: 'rank',
        read: false,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      });

      // Audit Log
      db.addAuditLog(
        'RANK_ENGINE',
        'Automated Engine',
        'RANK_PROMOTION',
        `User ${user.name} (${user.id}) auto-promoted from ${oldRankObj?.name || 'Associate'} to ${qualifiedRank.name}. Total BV: ${totalBv}, G1: ${weakerLegBv}, G2: ${strongerLegBv}`
      );
    }

    // Determine Next Rank Details for progress tracking
    const nextRank = enabledRanks.find((r) => r.id > newRankId) || null;
    let progressPercent = 100;
    let remainingTotalBv = 0;
    let remainingGroup1Bv = 0;
    let remainingGroup2Bv = 0;

    if (nextRank) {
      remainingTotalBv = Math.max(0, nextRank.totalBvRequired - totalBv);
      remainingGroup1Bv = Math.max(0, nextRank.group1BvRequired - weakerLegBv);
      remainingGroup2Bv = Math.max(0, nextRank.group2BvRequired - strongerLegBv);

      const totalPct = Math.min(100, (totalBv / nextRank.totalBvRequired) * 100);
      const g1Pct = Math.min(100, (weakerLegBv / nextRank.group1BvRequired) * 100);
      const g2Pct = Math.min(100, (strongerLegBv / nextRank.group2BvRequired) * 100);

      progressPercent = Math.round((totalPct + g1Pct + g2Pct) / 3);
    }

    return {
      userId: user.id,
      previousRankId,
      newRankId,
      isPromoted,
      isDemoted,
      currentRank: qualifiedRank,
      nextRank,
      totalBv,
      group1Bv: weakerLegBv,
      group2Bv: strongerLegBv,
      progressPercent,
      remainingTotalBv,
      remainingGroup1Bv,
      remainingGroup2Bv,
      promotionRewardUnlocked,
      safeguardUnlocked,
    };
  }

  /**
   * Run rank engine for all users in the system (batch processing / audit)
   */
  static evaluateAllUsers(): RankCalculationResult[] {
    return db.users.map((u) => this.evaluateUserRank(u.id));
  }
}
