export type ScrapCategory = 'Paper' | 'Plastics' | 'Metals' | 'EWaste' | 'Glass';

export type UserRole = 'citizen' | 'kabadiwala' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  avatar: string;
  email?: string;
  vehicleType?: string;
  vehiclePlate?: string;
  badgeTier?: string;
  hubLocation?: string;
  isOnline?: boolean;
}

export type VehicleTier = 'eco_cart' | 'cargo_erickshaw' | 'max_tempo';

export interface VehicleOption {
  id: VehicleTier;
  name: string;
  tagline: string;
  capacity: string;
  etaMinutes: number;
  icon: string;
  payoutBonus: string;
  recommendedFor: string;
}

export interface NearbyKabadiwalaDriver {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  phone: string;
  vehicleType: string;
  vehiclePlate: string;
  vehicleTier: VehicleTier;
  lat: number;
  lng: number;
  distanceMeters: number;
  etaMinutes: number;
  isOnline: boolean;
  hub: string;
}

export interface ScrapItem {
  id: string;
  name: string;
  category: ScrapCategory;
  unit: 'kg' | 'pc';
  price: number;
  change24h: number; // percentage, e.g. +2.5 or -1.2
  minPrice?: number;
  maxPrice?: number;
  description: string;
  iconName: string;
  waterSavedPerKg: number; // in liters
  co2SavedPerKg?: number;   // in kg CO2
  co2SavedKg: number;       // in kg CO2
  treesSavedPerKg: number; // fractional tree
}

export interface PickupItem {
  itemId: string;
  itemName: string;
  category: ScrapCategory;
  estimatedWeight: number; // kg or pc
  verifiedWeight?: number;
  ratePerUnit: number;
}

export type PickupStatus = 'requested' | 'assigned' | 'in_progress' | 'arrived' | 'completed' | 'cancelled';

export interface PickupRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  landmark: string;
  city: string;
  lat: number;
  lng: number;
  items: PickupItem[];
  preferredSlot: string;
  scheduledDate: string;
  status: PickupStatus;
  otp: string; // 4-digit code given to citizen, verified by collector
  collectorId?: string;
  collectorName?: string;
  collectorPhone?: string;
  collectorVehicle?: string;
  collectorRating?: number;
  totalEstimatedValue: number;
  finalPayout?: number;
  payoutMethod?: 'UPI' | 'Unified Wallet' | 'Cash';
  upiId?: string;
  photos?: string[];
  notes?: string;
  createdAt: string;
  completedAt?: string;
  rating?: number;
  review?: string;
  feedbackTags?: string[];
  ratedAt?: string;
  tipAmount?: number;
  impact?: {
    waterSavedLiters: number;
    co2SavedKg: number;
    treesPreserved: number;
  };
}

export interface CollectorReview {
  id: string;
  pickupId: string;
  collectorId: string;
  collectorName?: string;
  citizenName: string;
  citizenPhoneMasked?: string;
  rating: number; // 1 to 5
  feedback: string;
  tags: string[]; // e.g. "Accurate Scale", "Punctual Arrival", "Polite & Professional", "Instant UPI Payment"
  tipAmount?: number;
  createdAt: string;
}

export interface CollectorPartner {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  vehicleType: string;
  vehiclePlate: string;
  rating: number;
  totalReviews: number;
  ratingBreakdown?: Record<1 | 2 | 3 | 4 | 5, number>;
  recentReviews?: CollectorReview[];
  totalPickups: number;
  kycStatus: 'verified' | 'pending' | 'action_required';
  badgeTier: 'Gold Partner' | 'Silver Partner' | 'Green Champion';
  totalEarnedToday: number;
  lifetimeEarnings: number;
  todayTargetKg: number;
  todayCollectedKg: number;
  aggregationHub: string;
  aadhaarMasked: string;
  policeVerificationDate: string;
  eprTokensEarned: number;
}

export interface HubInventoryItem {
  id: string;
  category: ScrapCategory;
  name: string;
  currentStockKg: number;
  minimumReserveKg: number;
  estimatedValue: number;
  grade: 'A-Grade' | 'Mixed Industrial' | 'Recyclable Premium';
  readyForAuction: boolean;
}

export interface BiddingTender {
  id: string;
  title: string;
  collectorId: string;
  collectorHub: string;
  scrapType: string;
  category: ScrapCategory;
  quantityKg: number;
  basePricePerKg: number;
  currentHighestBid: number;
  highestBidder: string;
  bidsCount: number;
  timeLeft: string;
  status: 'open' | 'accepted' | 'closed';
  purityGrade: string;
}

export interface EPRCredit {
  id: string;
  tokenCode: string;
  scrapType: string;
  category: ScrapCategory;
  tonnage: number;
  collectorId: string;
  collectorName: string;
  corporateBuyer?: string;
  status: 'minted' | 'transferred' | 'retired';
  incentiveAmount: number;
  issuedDate: string;
  qrPayload: string;
}

export interface ScaleState {
  isConnected: boolean;
  deviceName: string;
  currentWeight: number; // kg
  tareOffset: number;
  isTare: boolean;
  isLocked: boolean;
  batteryLevel: number;
  signalStrength: number;
}

export type SupportedLanguage = 'en' | 'hi' | 'mr' | 'bn' | 'ta';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  details: string;
  type: 'pickup' | 'rate_update' | 'scale' | 'payout' | 'epr' | 'kyc';
}

export type WalletTransactionType = 'scrap_credit' | 'upi_withdrawal';

export interface WalletTransaction {
  id: string;
  type: WalletTransactionType;
  amount: number;
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'processing' | 'failed';
  referenceId: string; // e.g. UTR-491028372109 or SCRAP-PKP-899
  upiId?: string;
  note?: string;
  pickupId?: string;
  category?: ScrapCategory | 'Payout';
  bankName?: string;
}

