import { db } from './db.js';
import { User } from '../src/types/index.js';

export interface BinaryTreeNodeDTO {
  id: string;
  name: string;
  rankName: string;
  rankId: number;
  personalBv: number;
  group1Bv: number; // Left
  group2Bv: number; // Right
  totalTeamBv: number;
  leftCount: number;
  rightCount: number;
  directCount: number;
  joinDate: string;
  avatarUrl: string;
  sponsorName: string;
  sponsorId: string;
  kycStatus: string;
  left: BinaryTreeNodeDTO | null;
  right: BinaryTreeNodeDTO | null;
  position?: 'left' | 'right';
}

export interface NetworkMemberDTO {
  id: string;
  name: string;
  avatarUrl: string;
  mobile: string;
  email: string;
  currentRankId: number;
  currentRankName: string;
  sponsorId: string;
  sponsorName: string;
  binaryParentId: string | null;
  binaryPosition: 'left' | 'right' | null;
  leg: 'left' | 'right' | 'direct' | 'root';
  level: number;
  personalBv: number;
  totalTeamBv: number;
  group1Bv: number;
  group2Bv: number;
  leftTeamCount: number;
  rightTeamCount: number;
  kycStatus: string;
  joinDate: string;
  isActive: boolean;
}

export class BinaryTreeEngine {
  /**
   * Retrieves full downline member list for a user or entire organization for admin
   */
  static getDownlineList(rootUserId: string, isAdmin: boolean = false): NetworkMemberDTO[] {
    const rootUser = db.findUserById(rootUserId);
    if (!rootUser) return [];

    const toDTO = (user: User, leg: 'left' | 'right' | 'direct' | 'root', level: number): NetworkMemberDTO => ({
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      mobile: user.mobile,
      email: user.email,
      currentRankId: user.currentRankId,
      currentRankName: user.currentRankName,
      sponsorId: user.sponsorId,
      sponsorName: user.sponsorName,
      binaryParentId: user.binaryParentId,
      binaryPosition: user.binaryPosition,
      leg,
      level,
      personalBv: user.personalBv,
      totalTeamBv: user.totalTeamBv,
      group1Bv: user.group1Bv,
      group2Bv: user.group2Bv,
      leftTeamCount: user.leftTeamCount,
      rightTeamCount: user.rightTeamCount,
      kycStatus: user.kycStatus,
      joinDate: user.joinDate,
      isActive: user.isActive !== false,
    });

    if (isAdmin) {
      return db.users.map((u) => {
        let leg: 'left' | 'right' | 'direct' | 'root' = 'root';
        if (u.binaryPosition === 'left') leg = 'left';
        else if (u.binaryPosition === 'right') leg = 'right';
        return toDTO(u, leg, 1);
      });
    }

    const results: NetworkMemberDTO[] = [];
    const visited = new Set<string>();

    // Add root user
    results.push(toDTO(rootUser, 'root', 0));
    visited.add(rootUser.id.toLowerCase());

    const traverseSubtree = (parentId: string, leg: 'left' | 'right', currentLevel: number) => {
      const children = db.users.filter((u) => u.binaryParentId?.toLowerCase() === parentId.toLowerCase());
      for (const child of children) {
        if (!visited.has(child.id.toLowerCase())) {
          visited.add(child.id.toLowerCase());
          results.push(toDTO(child, leg, currentLevel));
          traverseSubtree(child.id, leg, currentLevel + 1);
        }
      }
    };

    const leftDirectChild = db.users.find(
      (u) => u.binaryParentId?.toLowerCase() === rootUser.id.toLowerCase() && u.binaryPosition === 'left'
    );
    if (leftDirectChild) {
      visited.add(leftDirectChild.id.toLowerCase());
      results.push(toDTO(leftDirectChild, 'left', 1));
      traverseSubtree(leftDirectChild.id, 'left', 2);
    }

    const rightDirectChild = db.users.find(
      (u) => u.binaryParentId?.toLowerCase() === rootUser.id.toLowerCase() && u.binaryPosition === 'right'
    );
    if (rightDirectChild) {
      visited.add(rightDirectChild.id.toLowerCase());
      results.push(toDTO(rightDirectChild, 'right', 1));
      traverseSubtree(rightDirectChild.id, 'right', 2);
    }

    // Direct sponsored members
    const directs = db.users.filter((u) => u.sponsorId.toLowerCase() === rootUser.id.toLowerCase());
    for (const direct of directs) {
      if (!visited.has(direct.id.toLowerCase())) {
        visited.add(direct.id.toLowerCase());
        const leg = direct.binaryPosition === 'left' ? 'left' : 'right';
        results.push(toDTO(direct, leg, 1));
        traverseSubtree(direct.id, leg, 2);
      }
    }

    return results;
  }
  /**
   * Builds a recursive binary tree representation starting from a root user ID up to a max depth
   */
  static getBinaryTree(rootUserId: string, maxDepth: number = 4): BinaryTreeNodeDTO | null {
    const rootUser = db.findUserById(rootUserId);
    if (!rootUser) return null;

    return this.buildSubtree(rootUser, 1, maxDepth);
  }

  private static buildSubtree(user: User, currentDepth: number, maxDepth: number): BinaryTreeNodeDTO {
    // Find left and right direct children in binary structure
    const leftChild = db.users.find((u) => u.binaryParentId === user.id && u.binaryPosition === 'left');
    const rightChild = db.users.find((u) => u.binaryParentId === user.id && u.binaryPosition === 'right');

    const node: BinaryTreeNodeDTO = {
      id: user.id,
      name: user.name,
      rankName: user.currentRankName,
      rankId: user.currentRankId,
      personalBv: user.personalBv,
      group1Bv: user.group1Bv,
      group2Bv: user.group2Bv,
      totalTeamBv: user.totalTeamBv,
      leftCount: user.leftTeamCount,
      rightCount: user.rightTeamCount,
      directCount: user.directMembersCount,
      joinDate: user.joinDate,
      avatarUrl: user.avatarUrl,
      sponsorName: user.sponsorName,
      sponsorId: user.sponsorId,
      kycStatus: user.kycStatus,
      position: user.binaryPosition || undefined,
      left: null,
      right: null,
    };

    if (currentDepth < maxDepth) {
      if (leftChild) {
        node.left = this.buildSubtree(leftChild, currentDepth + 1, maxDepth);
      }
      if (rightChild) {
        node.right = this.buildSubtree(rightChild, currentDepth + 1, maxDepth);
      }
    }

    return node;
  }

  /**
   * Find available placement spot in binary tree for a sponsor
   */
  static findAvailablePlacement(
    sponsorId: string,
    preference: 'weaker_leg' | 'extreme_left' | 'extreme_right' | 'balanced'
  ): { parentId: string; position: 'left' | 'right' } {
    const sponsor = db.findUserById(sponsorId) || db.users[0];

    if (preference === 'extreme_left') {
      let curr = sponsor;
      while (true) {
        const leftChild = db.users.find((u) => u.binaryParentId === curr.id && u.binaryPosition === 'left');
        if (!leftChild) {
          return { parentId: curr.id, position: 'left' };
        }
        curr = leftChild;
      }
    }

    if (preference === 'extreme_right') {
      let curr = sponsor;
      while (true) {
        const rightChild = db.users.find((u) => u.binaryParentId === curr.id && u.binaryPosition === 'right');
        if (!rightChild) {
          return { parentId: curr.id, position: 'right' };
        }
        curr = rightChild;
      }
    }

    // Default: Weaker leg or balanced
    const leftChild = db.users.find((u) => u.binaryParentId === sponsor.id && u.binaryPosition === 'left');
    const rightChild = db.users.find((u) => u.binaryParentId === sponsor.id && u.binaryPosition === 'right');

    if (!leftChild) return { parentId: sponsor.id, position: 'left' };
    if (!rightChild) return { parentId: sponsor.id, position: 'right' };

    // If both direct children exist, place under the weaker child
    if (sponsor.group1Bv <= sponsor.group2Bv) {
      return this.findAvailablePlacement(leftChild.id, 'extreme_left');
    } else {
      return this.findAvailablePlacement(rightChild.id, 'extreme_right');
    }
  }
}
