export type Role = 'admin' | 'superadmin' | 'member';

export type KycStatus = 'pending' | 'verified' | 'rejected' | 'not_submitted';

export type IncomeType =
  | 'retail_profit'
  | 'direct_income'
  | 'referral_bonus'
  | 'binary_matching'
  | 'matching_bonus'
  | 'leadership_bonus'
  | 'rank_accelerator'
  | 'royalty_income'
  | 'reward_income'
  | 'promotion_bonus'
  | 'video_task_earning'
  | 'safeguard_payout'
  | 'withdrawal'
  | 'admin_adjustment';

export interface User {
  id: string; // e.g. WDH-100001
  name: string;
  fatherHusbandName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  mobile: string;
  email: string;
  pan: string;
  aadhaar?: string;
  bankName: string;
  bankAccount: string;
  ifsc: string;
  nomineeName: string;
  nomineeRelation: string;
  sponsorId: string;
  sponsorName: string;
  role: Role;
  joinDate: string;
  avatarUrl: string;
  kycStatus: KycStatus;
  kycRejectReason?: string;
  kycDocuments: {
    photo?: string;
    panCard?: string;
    bankProof?: string;
    aadhaarCard?: string;
  };
  personalBv: number;
  directTeamBv: number;
  totalTeamBv: number;
  group1Bv: number; // Left leg / Group 1 (Weaker or Leg A)
  group2Bv: number; // Right leg / Group 2 (Stronger or Leg B)
  resellingBv: number;
  currentRankId: number;
  currentRankName: string;
  walletBalance: number;
  totalIncome: number;
  monthlyIncome: number;
  leftTeamCount: number;
  rightTeamCount: number;
  directMembersCount: number;
  binaryParentId: string | null;
  binaryPosition: 'left' | 'right' | null;
  placementType: 'auto' | 'manual';
  safeguardEligible: boolean;
  safeguardAmount: number;
  promotionsWon: string[];
  seniorSecretCode?: string; // Senior Secret Authorization Code (Mandatory for all joining)
  isActive: boolean;
  status: 'active' | 'suspended' | 'pending_approval';
  passwordHash?: string;
}

export type UserProfile = User;

export interface RankLevel {
  id: number; // 1 to 18
  name: string;
  totalBvRequired: number;
  group1BvRequired: number; // Weaker leg
  group2BvRequired: number; // Stronger leg
  promotionReward?: string;
  safeguardAmount?: number;
  badgeColor: string;
  leadershipBonusPercent: number;
  royaltyPoolPercent: number;
  isEnabled: boolean;
  description?: string;
}

export interface BvTransaction {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  source: 'product_purchase' | 'team_repurchase' | 'reselling' | 'video_ad_task' | 'admin_adjustment' | 'direct_referral';
  referenceOrderId?: string;
  description: string;
  side?: 'left' | 'right' | 'personal';
  createdAt: string;
  status: 'verified' | 'pending' | 'cancelled';
  adminVerified: boolean;
  adminId?: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  incomeType?: IncomeType;
  category?: string;
  amount: number;
  bvAmount?: number;
  tdsAmount?: number;
  adminCharge?: number;
  netAmount?: number;
  balanceAfter?: number;
  description: string;
  status: 'completed' | 'pending' | 'reversed';
  createdAt: string;
  referenceId?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  memberId?: string;
  amount?: number;
  requestedAmount?: number;
  tds?: number;
  tdsDeducted?: number;
  adminFee?: number;
  payableAmount?: number;
  netPayable?: number;
  bankName: string;
  bankAccount?: string;
  accountNumber?: string;
  ifsc: string;
  status: 'pending' | 'approved' | 'rejected' | 'transferred';
  utrNumber?: string;
  adminNotes?: string;
  createdAt: string;
  processedAt?: string;
}

export interface RankHistory {
  id: string;
  userId: string;
  userName: string;
  oldRankId: number;
  oldRankName: string;
  newRankId: number;
  newRankName: string;
  totalBvAtPromotion: number;
  group1Bv: number;
  group2Bv: number;
  promotedAt: string;
  rewardUnlocked?: string;
  safeguardUnlocked?: number;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetUserId?: string;
  targetUserName?: string;
  details: string;
  previousState?: any;
  newState?: any;
  timestamp: string;
}

export interface AdminSettings {
  companyName: string;
  supportEmail?: string;
  supportPhone?: string;
  currency?: string;
  bvToInrRatio?: number;
  binaryMatchingPercentage?: number;
  binaryMatchingRatePercent?: number;
  directReferralBonusPercent?: number;
  tdsPercentage: number;
  adminFeePercentage?: number;
  adminChargePercentage?: number;
  minWithdrawal?: number;
  minWithdrawalAmount?: number;
  dailyVideoTaskLimit?: number;
  videoWatchBvReward?: number;
  videoWatchCashReward?: number;
  autoPlacementRule?: 'extreme_left' | 'extreme_right' | 'weaker_leg' | 'balanced';
  safeguardEnabled?: boolean;
  announcementNotice: string;
}

export type MlmSettings = AdminSettings;

export interface VideoTask {
  id: string;
  title: string;
  category: string;
  videoUrl: string;
  durationSec: number;
  bvReward: number;
  cashReward: number;
  adMobType: 'banner' | 'interstitial' | 'rewarded' | 'app_open' | 'native';
  thumbnail: string;
  advertiserName: string;
  description: string;
  completedToday?: boolean;
}

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  mrp: number;
  dpPrice?: number;
  dp?: number;
  bv: number;
  imageUrl?: string;
  image?: string;
  description: string;
  inStock?: boolean;
  rating?: number;
}

export type Product = ProductItem;

export interface SafeguardClaim {
  id: string;
  userId: string;
  userName: string;
  memberId: string;
  nomineeName: string;
  nomineeRelation: string;
  nomineeMobile: string;
  nomineeBank: string;
  nomineeAccount: string;
  nomineeIfsc: string;
  rankName: string;
  benefitAmount: number;
  incidentDate: string;
  incidentDetails: string;
  policeReportDoc?: string;
  deathCertDoc?: string;
  status: 'pending' | 'under_investigation' | 'approved' | 'settled' | 'rejected';
  utrNumber?: string;
  createdAt: string;
  settledAt?: string;
}

export interface AppNotification {
  id: string;
  userId: string | 'ALL';
  title: string;
  message: string;
  type: 'rank' | 'wallet' | 'kyc' | 'task' | 'safeguard' | 'system';
  read: boolean;
  createdAt: string;
}

export interface BinaryNode {
  user: User;
  left: BinaryNode | null;
  right: BinaryNode | null;
  depth: number;
}

// ==========================================
// E-COMMERCE, ORDERS, DELIVERY & BP SYSTEM
// ==========================================

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned';

export type PaymentMethod = 'COD' | 'ONLINE_RAZORPAY';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';
export type DeliveryStatus =
  | 'Pending'
  | 'Packed'
  | 'Shipped'
  | 'In Transit'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Returned'
  | 'Cancelled';

export interface ProductSpecification {
  key: string;
  value: string;
}

export interface ProductVariation {
  name: string;
  options: string[];
}

export interface EcommerceProduct {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  discountedPrice: number | null;
  bpValue: number;
  stockQuantity: number;
  availabilityStatus: 'in_stock' | 'out_of_stock' | 'limited';
  deliveryCharge: number;
  isFeatured: boolean;
  isActive: boolean;
  images: string[];
  specifications: ProductSpecification[];
  variations: ProductVariation[];
  totalSold: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  subcategories: string[];
}

export interface EcommerceCartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  selectedVariations: Record<string, string>;
  product: EcommerceProduct;
}

export interface EcommerceOrderItem {
  id: string;
  orderId: string;
  productId: string;
  productSku: string;
  productName: string;
  productImage: string;
  unitPrice: number;
  unitDiscountedPrice: number | null;
  effectiveUnitPrice: number;
  unitBp: number;
  quantity: number;
  lineTotal: number;
  lineBp: number;
  selectedVariations: Record<string, string>;
}

export interface OrderDeliveryInfo {
  partnerName: string;
  trackingNumber: string;
  shipmentDate: string;
  estimatedDeliveryDate: string;
  deliveryCharges: number;
  trackingUrl: string;
  deliveryStatus: DeliveryStatus;
  notes: string;
  updatedAt: string;
}

export interface OrderStatusHistoryEntry {
  id: string;
  orderId: string;
  status: string;
  note: string;
  updatedBy: string;
  createdAt: string;
}

export interface EcommerceOrder {
  id: string;
  userId: string;
  customerName: string;
  mobile: string;
  whatsapp: string;
  email: string;
  deliveryAddress: string;
  cityTownVillage: string;
  district: string;
  state: string;
  pincode: string;
  deliveryInstructions: string;
  subtotal: number;
  discountTotal: number;
  deliveryCharges: number;
  finalAmount: number;
  totalBp: number;
  orderStatus: OrderStatus;
  bpCreditStatus: 'Pending' | 'Credited' | 'Reversed' | 'Cancelled';
  bpCreditedAt: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTransactionId: string | null;
  paymentDate: string | null;
  refundStatus: 'None' | 'Requested' | 'Refunded';
  delivery: OrderDeliveryInfo;
  items: EcommerceOrderItem[];
  statusHistory: OrderStatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface BpTransaction {
  id: string;
  userId: string;
  userName?: string;
  orderId: string;
  type: 'credit' | 'reversal' | 'adjustment';
  bpAmount: number;
  balanceAfter: number;
  status: 'credited' | 'reversed' | 'pending';
  description: string;
  itemsSummary: string;
  createdBy: string;
  createdAt: string;
}

export interface BpWalletSummary {
  userId: string;
  totalBpBalance: number;
  totalBpEarned: number;
  totalBpReversed: number;
  pendingOrderBp: number;
  transactions: BpTransaction[];
}

export interface EcommerceAdminSummary {
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalSales: number;
  totalBpCredited: number;
  pendingBp: number;
  recentOrders: EcommerceOrder[];
  bestSellingProducts: EcommerceProduct[];
}

