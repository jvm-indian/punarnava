import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  UserRole,
  SupportedLanguage,
  ScrapItem,
  PickupRequest,
  CollectorPartner,
  HubInventoryItem,
  BiddingTender,
  EPRCredit,
  ScaleState,
  AuditLogEntry,
  PickupItem,
  AuthUser,
  VehicleTier,
  NearbyKabadiwalaDriver,
  CollectorReview,
  WalletTransaction,
} from '../types';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import {
  INITIAL_SCRAP_ITEMS,
  INITIAL_PICKUPS,
  CURRENT_COLLECTOR,
  INITIAL_HUB_INVENTORY,
  INITIAL_BIDDING_TENDERS,
  INITIAL_EPR_CREDITS,
  INITIAL_AUDIT_LOGS,
  REGIONAL_TRANSLATIONS,
  PRESET_USERS,
  NEARBY_KABADIWALAS,
  INITIAL_WALLET_TRANSACTIONS,
} from '../data/mockData';

export interface UberDispatchState {
  status: 'idle' | 'searching' | 'matched' | 'arriving' | 'arrived' | 'completed';
  selectedTier: VehicleTier;
  assignedDriver: NearbyKabadiwalaDriver | null;
  eta: number; // minutes
  distanceMeters: number;
}

interface AppContextType {
  // Authentication & Partner Role Isolation
  currentUser: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  loginAsUser: (user: AuthUser) => void;
  loginByRole: (role: UserRole) => void;
  logout: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;

  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: keyof typeof REGIONAL_TRANSLATIONS['en']) => string;

  // Scrap items & rates
  scrapItems: ScrapItem[];
  updateScrapRate: (itemId: string, newPrice: number) => void;
  lastRateUpdate: string;

  // Pickups & Uber-Style Dispatch
  pickups: PickupRequest[];
  activePickup: PickupRequest | null;
  setActivePickupId: (id: string | null) => void;
  createPickupRequest: (newPickup: Omit<PickupRequest, 'id' | 'createdAt' | 'status' | 'otp'>) => PickupRequest;
  updatePickupStatus: (pickupId: string, status: PickupRequest['status']) => void;
  verifyPickupOtpAndComplete: (
    pickupId: string,
    enteredOtp: string,
    verifiedItems: PickupItem[],
    payoutMethod: 'UPI' | 'Unified Wallet' | 'Cash'
  ) => { success: boolean; message: string; payoutAmount?: number };

  // Uber-like On-Demand Dispatching
  nearbyDrivers: NearbyKabadiwalaDriver[];
  uberDispatch: UberDispatchState;
  requestUberKabadiwala: (tier: VehicleTier, items: PickupItem[], address: string, upiId?: string) => void;
  cancelUberRequest: () => void;
  driverIsOnline: boolean;
  toggleDriverOnline: () => void;
  incomingRideAlert: PickupRequest | null;
  acceptIncomingRide: (pickupId: string) => void;
  declineIncomingRide: () => void;

  // Collector Partner & Rating Profile
  collector: CollectorPartner;
  updateCollectorKyc: (status: CollectorPartner['kycStatus']) => void;
  ratePickupCollector: (
    pickupId: string,
    collectorId: string,
    rating: number,
    feedback: string,
    tags: string[],
    tipAmount?: number
  ) => Promise<{ success: boolean; message: string; newRating: number }>;
  ratingModalPickup: PickupRequest | null;
  openRatingModal: (pickup: PickupRequest) => void;
  closeRatingModal: () => void;

  // Bluetooth Scale
  scaleState: ScaleState;
  connectScale: () => void;
  disconnectScale: () => void;
  tareScale: () => void;
  setManualScaleWeight: (weight: number) => void;
  lockScaleReading: () => void;
  simulateWeightChange: (delta: number) => void;

  // Hub Inventory & Bidding
  hubInventory: HubInventoryItem[];
  addStockToHub: (category: HubInventoryItem['category'], name: string, weightKg: number) => void;
  biddingTenders: BiddingTender[];
  createBiddingTender: (data: Omit<BiddingTender, 'id' | 'collectorId' | 'collectorHub' | 'bidsCount' | 'status'>) => void;
  placeBidOnTender: (tenderId: string, bidAmountPerKg: number, bidderName: string) => void;
  acceptWinningBid: (tenderId: string) => void;

  // EPR Credits
  eprCredits: EPRCredit[];
  mintEprToken: (scrapType: string, category: EPRCredit['category'], tonnage: number) => EPRCredit;
  claimEprTokenByCorp: (tokenId: string, corporateBuyer: string) => void;

  // Audit Logs
  auditLogs: AuditLogEntry[];
  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;

  // Voice & Offline
  voiceSoundEnabled: boolean;
  setVoiceSoundEnabled: (enabled: boolean) => void;
  speakVoice: (text: string, forceLang?: SupportedLanguage) => void;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  pendingOfflineCount: number;
  syncOfflineQueue: () => void;

  // Selected Service City (The Kabadiwala signature city network)
  selectedCity: string;
  setSelectedCity: (city: string) => void;

  // Digital Wallet & Instant UPI Withdrawal
  walletBalance: number;
  walletTransactions: WalletTransaction[];
  totalEarningsFromScrap: number;
  totalWithdrawnToUpi: number;
  isWithdrawModalOpen: boolean;
  setIsWithdrawModalOpen: (open: boolean) => void;
  isPassbookOpen: boolean;
  setIsPassbookOpen: (open: boolean) => void;
  withdrawToUpi: (
    amount: number,
    upiId: string,
    note?: string
  ) => Promise<{ success: boolean; utr: string; message: string; transaction: WalletTransaction }>;

  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Current authenticated user (Strict role control - starts null for guest)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('Delhi NCR');

  const role = currentUser?.role ?? null;
  const isAuthenticated = currentUser !== null;

  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [scrapItems, setScrapItems] = useState<ScrapItem[]>(INITIAL_SCRAP_ITEMS);
  const [lastRateUpdate, setLastRateUpdate] = useState<string>('Today at 08:30 AM');
  const [pickups, setPickups] = useState<PickupRequest[]>(INITIAL_PICKUPS);
  const [activePickupId, setActivePickupId] = useState<string | null>('PKP-901');
  const [collector, setCollector] = useState<CollectorPartner>(CURRENT_COLLECTOR);
  const [hubInventory, setHubInventory] = useState<HubInventoryItem[]>(INITIAL_HUB_INVENTORY);
  const [biddingTenders, setBiddingTenders] = useState<BiddingTender[]>(INITIAL_BIDDING_TENDERS);
  const [eprCredits, setEprCredits] = useState<EPRCredit[]>(INITIAL_EPR_CREDITS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Uber-style dispatch state
  const [nearbyDrivers] = useState<NearbyKabadiwalaDriver[]>(NEARBY_KABADIWALAS);
  const [uberDispatch, setUberDispatch] = useState<UberDispatchState>({
    status: 'idle',
    selectedTier: 'cargo_erickshaw',
    assignedDriver: NEARBY_KABADIWALAS[0],
    eta: 4,
    distanceMeters: 450,
  });

  // Driver App state (for Kabadiwala)
  const [driverIsOnline, setDriverIsOnline] = useState<boolean>(true);
  const [incomingRideAlert, setIncomingRideAlert] = useState<PickupRequest | null>(null);

  // Rating Modal state for Citizen Feedback
  const [ratingModalPickup, setRatingModalPickup] = useState<PickupRequest | null>(null);
  const openRatingModal = useCallback((pickup: PickupRequest) => {
    setRatingModalPickup(pickup);
  }, []);
  const closeRatingModal = useCallback(() => {
    setRatingModalPickup(null);
  }, []);

  // Digital Scrap Earnings Wallet & UPI Withdrawal
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>(INITIAL_WALLET_TRANSACTIONS);
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    const credits = INITIAL_WALLET_TRANSACTIONS.filter((t) => t.type === 'scrap_credit').reduce((sum, t) => sum + t.amount, 0);
    const debits = INITIAL_WALLET_TRANSACTIONS.filter((t) => t.type === 'upi_withdrawal').reduce((sum, t) => sum + t.amount, 0);
    return Math.max(0, Number((credits - debits).toFixed(2)));
  });
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isPassbookOpen, setIsPassbookOpen] = useState(false);

  const totalEarningsFromScrap = walletTransactions
    .filter((t) => t.type === 'scrap_credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawnToUpi = walletTransactions
    .filter((t) => t.type === 'upi_withdrawal')
    .reduce((sum, t) => sum + t.amount, 0);

  // Bluetooth scale simulated state
  const [scaleState, setScaleState] = useState<ScaleState>({
    isConnected: true,
    deviceName: 'Punarnava-BT-Scale-Pro v3.2',
    currentWeight: 18.5,
    tareOffset: 0,
    isTare: false,
    isLocked: false,
    batteryLevel: 94,
    signalStrength: 88,
  });

  // Voice & Offline
  const [voiceSoundEnabled, setVoiceSoundEnabled] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [pendingOfflineCount, setPendingOfflineCount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  }, []);

  const t = useCallback(
    (key: keyof typeof REGIONAL_TRANSLATIONS['en']): string => {
      const langDict = REGIONAL_TRANSLATIONS[language] || REGIONAL_TRANSLATIONS.en;
      return langDict[key] || REGIONAL_TRANSLATIONS.en[key] || key;
    },
    [language]
  );

  const speakVoice = useCallback(
    (text: string, forceLang?: SupportedLanguage) => {
      if (!voiceSoundEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }

      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const targetLang = forceLang || language;

        const langCodes: Record<SupportedLanguage, string> = {
          en: 'en-IN',
          hi: 'hi-IN',
          mr: 'mr-IN',
          bn: 'bn-IN',
          ta: 'ta-IN',
        };

        utterance.lang = langCodes[targetLang] || 'en-IN';
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis unavailable:', err);
      }
    },
    [voiceSoundEnabled, language]
  );

  const addAuditLog = useCallback((entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditLogEntry = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...entry,
    };
    setAuditLogs((prev) => [newEntry, ...prev.slice(0, 40)]);
  }, []);

  // Authentication & Role Switching
  const loginAsUser = useCallback((user: AuthUser) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);
    showToast(`🔑 Switched session: Logged in as ${user.name} (${user.role.toUpperCase()})`);
  }, [showToast]);

  const loginByRole = useCallback((targetRole: UserRole) => {
    const target = PRESET_USERS.find((u) => u.role === targetRole) || PRESET_USERS[0];
    setCurrentUser(target);
    setIsLoginModalOpen(false);
    showToast(`🔑 Access Granted to ${targetRole.toUpperCase()} Portal as ${target.name}`);
  }, [showToast]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    showToast('👋 Successfully logged out of session.');
  }, [showToast]);

  // Driver Online / Offline Toggle (like Uber Driver)
  const toggleDriverOnline = useCallback(() => {
    setDriverIsOnline((prev) => {
      const next = !prev;
      showToast(next ? '🟢 You are ONLINE: Receiving nearby doorstep scrap requests!' : '⚪ You are OFFLINE: Not receiving scrap requests.');
      speakVoice(next ? 'You are online. Scrap requests enabled.' : 'You are offline.');
      return next;
    });
  }, [showToast, speakVoice]);

  // Uber-style On-Demand Request Kabadiwala
  const requestUberKabadiwala = useCallback(
    (tier: VehicleTier, items: PickupItem[], address: string, upiId?: string) => {
      setUberDispatch((prev) => ({
        ...prev,
        status: 'searching',
        selectedTier: tier,
      }));

      speakVoice('Searching for nearest Kabadiwala partner in your sector.');

      // After 2.2 seconds simulated radar dispatch, match closest partner!
      setTimeout(() => {
        const matchingDriver = nearbyDrivers.find((d) => d.vehicleTier === tier) || nearbyDrivers[0];
        const newId = `PKP-${Math.floor(200 + Math.random() * 800)}`;
        const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();

        const totalEst = items.reduce((sum, it) => sum + it.estimatedWeight * it.ratePerUnit, 0);

        const newPickup: PickupRequest = {
          id: newId,
          customerName: currentUser?.name || 'Citizen User',
          customerPhone: currentUser?.phone || '+91 98700 12345',
          customerAddress: address || 'Flat 402, Oakwood Heights, Sector 4',
          landmark: 'Opposite Metro Pillar 112',
          city: 'New Delhi / NCR',
          lat: 28.5355,
          lng: 77.2410,
          items,
          preferredSlot: 'Instant On-Demand (~4 mins)',
          scheduledDate: new Date().toISOString().split('T')[0],
          status: 'in_progress',
          otp: randomOtp,
          collectorId: matchingDriver.id,
          collectorName: matchingDriver.name,
          collectorPhone: matchingDriver.phone,
          collectorVehicle: `${matchingDriver.vehicleType} (${matchingDriver.vehiclePlate})`,
          collectorRating: matchingDriver.rating,
          totalEstimatedValue: totalEst,
          payoutMethod: 'UPI',
          upiId: upiId || 'ananya.sharma@okaxis',
          createdAt: new Date().toISOString(),
          impact: {
            waterSavedLiters: Math.round(totalEst * 2.5),
            co2SavedKg: Number((totalEst * 0.18).toFixed(1)),
            treesPreserved: Number((totalEst * 0.0012).toFixed(2)),
          },
        };

        setPickups((prev) => [newPickup, ...prev]);
        setActivePickupId(newId);

        setUberDispatch({
          status: 'matched',
          selectedTier: tier,
          assignedDriver: matchingDriver,
          eta: matchingDriver.etaMinutes,
          distanceMeters: matchingDriver.distanceMeters,
        });

        // Trigger incoming ride ping to Kabadiwala Driver app!
        setIncomingRideAlert(newPickup);

        addAuditLog({
          actor: currentUser?.name || 'Citizen User',
          role: 'Citizen User',
          action: 'Uber Scrap Dispatched',
          details: `Instant on-demand Kabadiwala ${matchingDriver.name} dispatched with ${matchingDriver.vehicleType}. OTP: ${randomOtp}`,
          type: 'pickup',
        });

        showToast(`🛺 KABADIWALA DISPATCHED! ${matchingDriver.name} is ${matchingDriver.distanceMeters}m away! OTP: [${randomOtp}]`);
        speakVoice(`Kabadiwala partner found! ${matchingDriver.name} is arriving in ${matchingDriver.etaMinutes} minutes. Doorstep OTP is ${randomOtp.split('').join(' ')}`);
      }, 2200);
    },
    [currentUser, nearbyDrivers, addAuditLog, showToast, speakVoice]
  );

  const cancelUberRequest = useCallback(() => {
    setUberDispatch((prev) => ({ ...prev, status: 'idle' }));
    setIncomingRideAlert(null);
    showToast('Scrap collection request cancelled.');
  }, [showToast]);

  const acceptIncomingRide = useCallback(
    (pickupId: string) => {
      setIncomingRideAlert(null);
      setUberDispatch((prev) => ({ ...prev, status: 'arriving' }));
      updatePickupStatus(pickupId, 'in_progress');
      showToast(`⚡ Pickup Accepted! Route directions loaded on screen.`);
      speakVoice(`Pickup accepted. Proceeding to customer doorstep.`);
    },
    [showToast, speakVoice]
  );

  const declineIncomingRide = useCallback(() => {
    setIncomingRideAlert(null);
    showToast('Scrap request passed to next nearest partner.');
  }, [showToast]);

  // Update scrap rate (Admin function)
  const updateScrapRate = useCallback(
    (itemId: string, newPrice: number) => {
      setScrapItems((prev) =>
        prev.map((item) => {
          if (item.id === itemId) {
            const oldPrice = item.price;
            const changePercent = Number((((newPrice - oldPrice) / oldPrice) * 100).toFixed(1));
            return {
              ...item,
              price: newPrice,
              change24h: changePercent,
            };
          }
          return item;
        })
      );

      const target = scrapItems.find((i) => i.id === itemId);
      const name = target?.name || itemId;
      const timeStr = `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      setLastRateUpdate(timeStr);

      addAuditLog({
        actor: currentUser?.name || 'Admin / Refinery Market Maker',
        role: 'Admin / Refinery Market Maker',
        action: 'Price Adjusted',
        details: `${name} updated to ₹${newPrice}/${target?.unit || 'kg'}`,
        type: 'rate_update',
      });

      showToast(`⚡ Rate Broadcast: ${name} is now ₹${newPrice}/${target?.unit || 'kg'}`);
      if (voiceSoundEnabled) {
        speakVoice(`Alert: Scrap price for ${name} updated to rupees ${newPrice}`);
      }
    },
    [scrapItems, addAuditLog, showToast, speakVoice, voiceSoundEnabled, currentUser]
  );

  // Bluetooth scale operations
  const connectScale = useCallback(() => {
    setScaleState((prev) => ({ ...prev, isConnected: true }));
    addAuditLog({
      actor: CURRENT_COLLECTOR.id,
      role: 'Kabadiwala Partner',
      action: 'Scale Paired',
      details: 'Connected to Punarnava-BT-Scale-Pro via BLE protocol.',
      type: 'scale',
    });
    showToast('⚖️ Bluetooth Smart Scale Connected! Ready for live weighing.');
    speakVoice('Digital scale connected and calibrated.');
  }, [addAuditLog, showToast, speakVoice]);

  const disconnectScale = useCallback(() => {
    setScaleState((prev) => ({ ...prev, isConnected: false }));
    showToast('Bluetooth scale disconnected.');
  }, [showToast]);

  const tareScale = useCallback(() => {
    setScaleState((prev) => ({
      ...prev,
      tareOffset: prev.currentWeight,
      currentWeight: 0.0,
      isTare: true,
      isLocked: false,
    }));
    showToast('⚖️ Scale Tared to 0.00 kg (Container weight deducted)');
    speakVoice('Scale tared. Net zero.');
  }, [showToast, speakVoice]);

  const setManualScaleWeight = useCallback((weight: number) => {
    setScaleState((prev) => ({
      ...prev,
      currentWeight: Math.max(0, Number(weight.toFixed(2))),
      isLocked: false,
    }));
  }, []);

  const simulateWeightChange = useCallback((delta: number) => {
    setScaleState((prev) => {
      const next = Math.max(0, Number((prev.currentWeight + delta).toFixed(2)));
      return { ...prev, currentWeight: next, isLocked: false };
    });
  }, []);

  const lockScaleReading = useCallback(() => {
    setScaleState((prev) => ({ ...prev, isLocked: !prev.isLocked }));
    showToast(scaleState.isLocked ? 'Scale reading unlocked' : `🔒 Weight locked at ${scaleState.currentWeight.toFixed(2)} kg`);
    if (!scaleState.isLocked) {
      speakVoice(`Weight locked at ${scaleState.currentWeight.toFixed(1)} kilograms`);
    }
  }, [scaleState.isLocked, scaleState.currentWeight, showToast, speakVoice]);

  // Create new pickup request (Citizen)
  const createPickupRequest = useCallback(
    (newPickupData: Omit<PickupRequest, 'id' | 'createdAt' | 'status' | 'otp'>): PickupRequest => {
      const newId = `PKP-${Math.floor(100 + Math.random() * 900)}`;
      const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();

      let totalWeight = 0;
      let totalWater = 0;
      let totalCo2 = 0;
      let totalTrees = 0;

      newPickupData.items.forEach((item) => {
        totalWeight += item.estimatedWeight;
        const meta = scrapItems.find((s) => s.id === item.itemId);
        if (meta) {
          totalWater += item.estimatedWeight * meta.waterSavedPerKg;
          totalCo2 += item.estimatedWeight * (meta.co2SavedPerKg || meta.co2SavedKg);
          totalTrees += item.estimatedWeight * meta.treesSavedPerKg;
        }
      });

      const newPickup: PickupRequest = {
        id: newId,
        ...newPickupData,
        status: 'assigned',
        otp: randomOtp,
        collectorId: CURRENT_COLLECTOR.id,
        collectorName: CURRENT_COLLECTOR.name,
        collectorPhone: CURRENT_COLLECTOR.phone,
        collectorVehicle: `${CURRENT_COLLECTOR.vehicleType} (${CURRENT_COLLECTOR.vehiclePlate})`,
        collectorRating: CURRENT_COLLECTOR.rating,
        createdAt: new Date().toISOString(),
        impact: {
          waterSavedLiters: Math.round(totalWater),
          co2SavedKg: Number(totalCo2.toFixed(1)),
          treesPreserved: Number(totalTrees.toFixed(2)),
        },
      };

      setPickups((prev) => [newPickup, ...prev]);
      setActivePickupId(newId);

      addAuditLog({
        actor: newPickup.customerName,
        role: 'Citizen User',
        action: 'Pickup Scheduled',
        details: `Booked pickup ${newId} with ${newPickup.items.length} categories. Assigned to ${CURRENT_COLLECTOR.name}`,
        type: 'pickup',
      });

      showToast(`🎉 Pickup Scheduled! Doorstep Verification OTP is [${randomOtp}]`);
      speakVoice(`Pickup booked. Collector ${CURRENT_COLLECTOR.name} assigned.`);

      return newPickup;
    },
    [scrapItems, addAuditLog, showToast, speakVoice]
  );

  const updatePickupStatus = useCallback(
    (pickupId: string, status: PickupRequest['status']) => {
      setPickups((prev) =>
        prev.map((p) => {
          if (p.id === pickupId) {
            return { ...p, status };
          }
          return p;
        })
      );
      showToast(`Pickup status updated to "${status.replace('_', ' ').toUpperCase()}"`);
    },
    [showToast]
  );

  // Complete pickup with OTP and verified scale readings
  const verifyPickupOtpAndComplete = useCallback(
    (
      pickupId: string,
      enteredOtp: string,
      verifiedItems: PickupItem[],
      payoutMethod: 'UPI' | 'Unified Wallet' | 'Cash'
    ) => {
      const targetPickup = pickups.find((p) => p.id === pickupId);
      if (!targetPickup) {
        return { success: false, message: 'Pickup not found.' };
      }

      if (enteredOtp.trim() !== targetPickup.otp.trim()) {
        return { success: false, message: 'Invalid OTP! Please ask customer for the 4-digit code on their screen.' };
      }

      let finalTotal = 0;
      let totalWeighedKg = 0;
      const updatedItems = verifiedItems.map((item) => {
        const weight = item.verifiedWeight ?? item.estimatedWeight;
        totalWeighedKg += weight;
        const lineTotal = weight * item.ratePerUnit;
        finalTotal += lineTotal;
        return {
          ...item,
          verifiedWeight: weight,
        };
      });

      setPickups((prev) =>
        prev.map((p) => {
          if (p.id === pickupId) {
            return {
              ...p,
              items: updatedItems,
              status: 'completed',
              finalPayout: finalTotal,
              payoutMethod,
              completedAt: new Date().toISOString(),
            };
          }
          return p;
        })
      );

      // Update collector stats
      setCollector((prev) => ({
        ...prev,
        totalPickups: prev.totalPickups + 1,
        totalEarnedToday: prev.totalEarnedToday + Math.round(finalTotal * 0.15),
        lifetimeEarnings: prev.lifetimeEarnings + Math.round(finalTotal * 0.15),
        todayCollectedKg: Number((prev.todayCollectedKg + totalWeighedKg).toFixed(1)),
      }));

      // Update Uber dispatch state
      setUberDispatch((prev) => ({ ...prev, status: 'completed' }));

      // Credit citizen digital scrap wallet
      const newCreditTxn: WalletTransaction = {
        id: `TXN-WLT-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'scrap_credit',
        amount: finalTotal,
        title: `Doorstep Scrap Sold - Order #${targetPickup.id}`,
        description: `Weighed ${totalWeighedKg.toFixed(1)} kg certified scrap via Bluetooth scale`,
        timestamp: new Date().toISOString(),
        status: 'completed',
        referenceId: `SCRAP-${targetPickup.id}`,
        pickupId: targetPickup.id,
        category: updatedItems[0]?.category || 'Paper',
      };
      setWalletTransactions((prev) => [newCreditTxn, ...prev]);
      setWalletBalance((prev) => Number((prev + finalTotal).toFixed(2)));

      // Add to hub inventory
      updatedItems.forEach((item) => {
        setHubInventory((prevHub) => {
          const match = prevHub.find((h) => h.category === item.category);
          if (match) {
            return prevHub.map((h) =>
              h.id === match.id
                ? {
                    ...h,
                    currentStockKg: Number((h.currentStockKg + (item.verifiedWeight || item.estimatedWeight)).toFixed(1)),
                    estimatedValue: h.estimatedValue + (item.verifiedWeight || item.estimatedWeight) * item.ratePerUnit,
                  }
                : h
            );
          }
          return prevHub;
        });
      });

      addAuditLog({
        actor: `COL-8492 (${CURRENT_COLLECTOR.name})`,
        role: 'Kabadiwala Partner',
        action: 'Hand-off Verified & Paid',
        details: `OTP [${enteredOtp}] verified for ${targetPickup.customerName}. Disbursed ₹${finalTotal.toFixed(0)} via ${payoutMethod}.`,
        type: 'payout',
      });

      showToast(`✅ Pickup ${pickupId} Verified! Instant Payout of ₹${finalTotal.toFixed(0)} sent to ${targetPickup.customerName}.`);
      speakVoice(`Hand-off complete. Total payout of rupees ${Math.round(finalTotal)} sent via ${payoutMethod}.`);

      return { success: true, message: 'Pickup successfully verified and payout dispatched!', payoutAmount: finalTotal };
    },
    [pickups, addAuditLog, showToast, speakVoice]
  );

  const updateCollectorKyc = useCallback(
    (status: CollectorPartner['kycStatus']) => {
      setCollector((prev) => ({ ...prev, kycStatus: status }));
      showToast(`Collector KYC status updated to: ${status.toUpperCase()}`);
    },
    [showToast]
  );

  // Rate Kabadiwala Collector Partner and persist to Firestore database
  const ratePickupCollector = useCallback(
    async (
      pickupId: string,
      collectorId: string,
      rating: number,
      feedback: string,
      tags: string[],
      tipAmount?: number
    ): Promise<{ success: boolean; message: string; newRating: number }> => {
      const citizenName = currentUser?.name || 'Citizen User';
      const reviewId = `REV-${Date.now().toString().slice(-4)}`;
      const timestamp = new Date().toISOString();

      // Compute weighted aggregate rating
      const currentReviews = collector.totalReviews || 1248;
      const currentRating = collector.rating || 4.9;
      const newTotalReviews = currentReviews + 1;
      const calculatedNewRating = Number((((currentRating * currentReviews) + rating) / newTotalReviews).toFixed(2));

      // Compute star rating breakdown
      const starKey = Math.min(5, Math.max(1, Math.round(rating))) as 1 | 2 | 3 | 4 | 5;
      const currentBreakdown = collector.ratingBreakdown || { 5: 1142, 4: 86, 3: 15, 2: 4, 1: 1 };
      const updatedBreakdown = {
        ...currentBreakdown,
        [starKey]: (currentBreakdown[starKey] || 0) + 1,
      };

      const newReview: CollectorReview = {
        id: reviewId,
        pickupId,
        collectorId,
        collectorName: collector.name,
        citizenName,
        citizenPhoneMasked: currentUser?.phone
          ? `${currentUser.phone.slice(0, 5)}*****`
          : '+91 98*** 54321',
        rating,
        feedback,
        tags,
        tipAmount: tipAmount || 0,
        createdAt: timestamp,
      };

      // 1. Update reactive collector profile state
      setCollector((prev) => ({
        ...prev,
        rating: calculatedNewRating,
        totalReviews: newTotalReviews,
        ratingBreakdown: updatedBreakdown,
        recentReviews: [newReview, ...(prev.recentReviews || [])],
        badgeTier: calculatedNewRating >= 4.8 ? 'Gold Partner' : calculatedNewRating >= 4.5 ? 'Silver Partner' : 'Green Champion',
      }));

      // 2. Update reactive pickup order state
      setPickups((prev) =>
        prev.map((p) => {
          if (p.id === pickupId) {
            return {
              ...p,
              rating,
              review: feedback,
              feedbackTags: tags,
              ratedAt: timestamp,
              tipAmount: tipAmount || 0,
            };
          }
          return p;
        })
      );

      // 3. Log verifiable ecosystem audit trail
      addAuditLog({
        actor: citizenName,
        role: 'Citizen User',
        action: 'Collector Rated & Reviewed',
        details: `Gave ${rating}★ to partner ${collector.name} (ID: ${collectorId}) for Pickup #${pickupId}. Feedback: "${feedback.slice(0, 50)}${feedback.length > 50 ? '...' : ''}". New average: ${calculatedNewRating}★ (${newTotalReviews} reviews)`,
        type: 'pickup',
      });

      // 4. Persist to Firestore database
      try {
        await setDoc(doc(db, 'reviews', reviewId), newReview);
        await setDoc(
          doc(db, 'collectors', collectorId),
          {
            id: collectorId,
            name: collector.name,
            rating: calculatedNewRating,
            totalReviews: newTotalReviews,
            badgeTier: calculatedNewRating >= 4.8 ? 'Gold Partner' : calculatedNewRating >= 4.5 ? 'Silver Partner' : 'Green Champion',
            updatedAt: timestamp,
          },
          { merge: true }
        );
        await setDoc(
          doc(db, 'pickups', pickupId),
          {
            rating,
            review: feedback,
            feedbackTags: tags,
            ratedAt: timestamp,
            tipAmount: tipAmount || 0,
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Firestore database sync note (local reactive state updated successfully):', err);
      }

      showToast(`⭐ Verified review recorded! ${collector.name}'s rating is now ${calculatedNewRating}★ (${newTotalReviews} reviews)`);
      speakVoice(`Thank you! Your ${rating} star rating has been permanently verified on the Punarnava partner ledger.`);

      return {
        success: true,
        message: 'Rating and feedback logged successfully to verified partner profile!',
        newRating: calculatedNewRating,
      };
    },
    [currentUser, collector, addAuditLog, showToast, speakVoice]
  );

  // Instant UPI Withdrawal Mock Transaction Handler
  const withdrawToUpi = useCallback(
    async (
      amount: number,
      upiId: string,
      note?: string
    ): Promise<{ success: boolean; utr: string; message: string; transaction: WalletTransaction }> => {
      const sanitizedAmount = Number(amount);
      if (isNaN(sanitizedAmount) || sanitizedAmount <= 0) {
        throw new Error('Please enter a valid withdrawal amount greater than ₹0.');
      }
      if (sanitizedAmount > walletBalance) {
        throw new Error(`Insufficient wallet balance. You have ₹${walletBalance.toFixed(2)} available.`);
      }

      // Simulate realistic NPCI UPI 2.0 gateway transaction latency
      await new Promise((resolve) => setTimeout(resolve, 1600));

      // Generate a realistic 12-digit Indian Bank UTR (Unique Transaction Reference)
      const randomSix = Math.floor(100000 + Math.random() * 900000);
      const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const utr = `UTR-${dateCode}-${randomSix}`;

      // Detect recipient bank from UPI handle
      let bankName = 'Verified Bank UPI Account';
      const handle = upiId.toLowerCase();
      if (handle.includes('okaxis')) bankName = 'Axis Bank';
      else if (handle.includes('okhdfc') || handle.includes('hdfcbank')) bankName = 'HDFC Bank';
      else if (handle.includes('okicici') || handle.includes('icici')) bankName = 'ICICI Bank';
      else if (handle.includes('oksbi') || handle.includes('sbi')) bankName = 'State Bank of India';
      else if (handle.includes('paytm')) bankName = 'Paytm Payments Bank';
      else if (handle.includes('ybl') || handle.includes('ibl')) bankName = 'Yes Bank (PhonePe)';

      const newTxn: WalletTransaction = {
        id: `TXN-WLT-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'upi_withdrawal',
        amount: sanitizedAmount,
        title: 'Instant Withdrawal to Bank UPI',
        description: `Transferred to UPI VPA ${upiId} via NPCI IMPS Gateway (Ref: ${utr})`,
        timestamp: new Date().toISOString(),
        status: 'completed',
        referenceId: utr,
        upiId,
        bankName,
        note: note || 'Scrap Monetization Payout',
        category: 'Payout',
      };

      setWalletBalance((prev) => Math.max(0, Number((prev - sanitizedAmount).toFixed(2))));
      setWalletTransactions((prev) => [newTxn, ...prev]);

      addAuditLog({
        actor: currentUser?.name || 'Citizen User (Ananya)',
        role: 'Citizen User',
        action: 'UPI Withdrawal',
        details: `Disbursed ₹${sanitizedAmount.toFixed(2)} to UPI ID ${upiId}. Bank UTR: ${utr}`,
        type: 'payout',
      });

      showToast(`⚡ ₹${sanitizedAmount.toFixed(0)} sent to ${upiId} (UTR: ${utr})`);
      speakVoice(`Instant withdrawal of rupees ${Math.round(sanitizedAmount)} successful to your UPI.`);

      return {
        success: true,
        utr,
        message: `₹${sanitizedAmount.toFixed(2)} transferred to ${upiId}`,
        transaction: newTxn,
      };
    },
    [walletBalance, currentUser, addAuditLog, showToast, speakVoice]
  );

  // Hub inventory & Bidding
  const addStockToHub = useCallback(
    (category: HubInventoryItem['category'], name: string, weightKg: number) => {
      setHubInventory((prev) => [
        ...prev,
        {
          id: `hub-${Date.now()}`,
          category,
          name,
          currentStockKg: weightKg,
          minimumReserveKg: 100,
          estimatedValue: weightKg * 25,
          grade: 'Recyclable Premium',
          readyForAuction: true,
        },
      ]);
      showToast(`Added ${weightKg} kg of ${name} to Indiranagar Hub stock.`);
    },
    [showToast]
  );

  const createBiddingTender = useCallback(
    (data: Omit<BiddingTender, 'id' | 'collectorId' | 'collectorHub' | 'bidsCount' | 'status'>) => {
      const newTender: BiddingTender = {
        id: `TND-${Math.floor(700 + Math.random() * 300)}`,
        collectorId: CURRENT_COLLECTOR.id,
        collectorHub: CURRENT_COLLECTOR.aggregationHub,
        bidsCount: 0,
        status: 'open',
        ...data,
      };
      setBiddingTenders((prev) => [newTender, ...prev]);
      addAuditLog({
        actor: CURRENT_COLLECTOR.name,
        role: 'Kabadiwala Partner',
        action: 'Bulk Auction Created',
        details: `Posted ${data.quantityKg} kg ${data.scrapType} on Industrial Recycler Bidding Portal.`,
        type: 'rate_update',
      });
      showToast(`📢 Bulk Lot Posted for Industrial Bidding: ${data.title}`);
    },
    [addAuditLog, showToast]
  );

  const placeBidOnTender = useCallback(
    (tenderId: string, bidAmountPerKg: number, bidderName: string) => {
      setBiddingTenders((prev) =>
        prev.map((t) => {
          if (t.id === tenderId) {
            return {
              ...t,
              currentHighestBid: bidAmountPerKg,
              highestBidder: bidderName,
              bidsCount: t.bidsCount + 1,
            };
          }
          return t;
        })
      );
      addAuditLog({
        actor: bidderName,
        role: 'Industrial Buyer',
        action: 'Bid Placed',
        details: `Placed bid of ₹${bidAmountPerKg}/kg on Tender ${tenderId}`,
        type: 'rate_update',
      });
      showToast(`💰 New Highest Bid: ₹${bidAmountPerKg}/kg by ${bidderName}!`);
      speakVoice(`New bid placed on lot by ${bidderName}. Rate rupees ${bidAmountPerKg} per kilogram.`);
    },
    [addAuditLog, showToast, speakVoice]
  );

  const acceptWinningBid = useCallback(
    (tenderId: string) => {
      const target = biddingTenders.find((t) => t.id === tenderId);
      if (!target) return;

      setBiddingTenders((prev) =>
        prev.map((t) => (t.id === tenderId ? { ...t, status: 'accepted' } : t))
      );

      const totalRevenue = target.quantityKg * target.currentHighestBid;

      setCollector((prev) => ({
        ...prev,
        totalEarnedToday: prev.totalEarnedToday + Math.round(totalRevenue * 0.12),
        lifetimeEarnings: prev.lifetimeEarnings + Math.round(totalRevenue * 0.12),
      }));

      addAuditLog({
        actor: CURRENT_COLLECTOR.name,
        role: 'Kabadiwala Partner',
        action: 'Tender Deal Accepted',
        details: `Accepted ${target.highestBidder}'s winning bid at ₹${target.currentHighestBid}/kg. Payout: ₹${totalRevenue.toLocaleString()}`,
        type: 'payout',
      });

      showToast(`🤝 Deal Closed with ${target.highestBidder}! Total Value: ₹${totalRevenue.toLocaleString()}`);
      speakVoice(`Tender accepted with ${target.highestBidder}. Direct bank settlement initiated.`);
    },
    [biddingTenders, addAuditLog, showToast, speakVoice]
  );

  // EPR Credit Minting & Transfer
  const mintEprToken = useCallback(
    (scrapType: string, category: EPRCredit['category'], tonnage: number): EPRCredit => {
      const code = `PUN-EPR-${category.toUpperCase()}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const ratePerTonne = category === 'Plastics' ? 1500 : category === 'EWaste' ? 3000 : 1000;
      const incentive = Math.round(tonnage * ratePerTonne);

      const newToken: EPRCredit = {
        id: `EPR-${Date.now().toString().slice(-4)}`,
        tokenCode: code,
        scrapType,
        category,
        tonnage,
        collectorId: CURRENT_COLLECTOR.id,
        collectorName: CURRENT_COLLECTOR.name,
        corporateBuyer: 'Pending Corporate Compliance Matching',
        status: 'minted',
        incentiveAmount: incentive,
        issuedDate: new Date().toISOString().split('T')[0],
        qrPayload: `https://punarnava.org/epr/verify/${code}`,
      };

      setEprCredits((prev) => [newToken, ...prev]);
      setCollector((prev) => ({
        ...prev,
        eprTokensEarned: prev.eprTokensEarned + 1,
      }));

      addAuditLog({
        actor: 'CPCB EPR Verified Node',
        role: 'Ecosystem Auditor',
        action: 'EPR Credit Minted',
        details: `Issued ${code} for ${tonnage} MT of ${scrapType}. Incentive: ₹${incentive}`,
        type: 'epr',
      });

      showToast(`🌿 EPR Credit Token Minted: ${code} (+₹${incentive} incentive)`);
      speakVoice(`EPR credit token generated. Green incentive added.`);

      return newToken;
    },
    [addAuditLog, showToast, speakVoice]
  );

  const claimEprTokenByCorp = useCallback(
    (tokenId: string, corporateBuyer: string) => {
      setEprCredits((prev) =>
        prev.map((c) => {
          if (c.id === tokenId) {
            return {
              ...c,
              corporateBuyer,
              status: 'transferred',
            };
          }
          return c;
        })
      );
      showToast(`🏢 EPR Token transferred to ${corporateBuyer} for EPR compliance certificate.`);
    },
    [showToast]
  );

  // Offline queue simulation
  const syncOfflineQueue = useCallback(() => {
    if (pendingOfflineCount > 0) {
      showToast(`🔄 Synced ${pendingOfflineCount} cached transactions with PUNARNAVA central ledger!`);
      setPendingOfflineCount(0);
    }
  }, [pendingOfflineCount, showToast]);

  const activePickup = pickups.find((p) => p.id === activePickupId) || pickups[0] || null;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        role,
        isAuthenticated,
        loginAsUser,
        loginByRole,
        logout,
        isLoginModalOpen,
        setIsLoginModalOpen,
        language,
        setLanguage,
        t,
        scrapItems,
        updateScrapRate,
        lastRateUpdate,
        pickups,
        activePickup,
        setActivePickupId,
        createPickupRequest,
        updatePickupStatus,
        verifyPickupOtpAndComplete,
        nearbyDrivers,
        uberDispatch,
        requestUberKabadiwala,
        cancelUberRequest,
        driverIsOnline,
        toggleDriverOnline,
        incomingRideAlert,
        acceptIncomingRide,
        declineIncomingRide,
        collector,
        updateCollectorKyc,
        ratePickupCollector,
        ratingModalPickup,
        openRatingModal,
        closeRatingModal,
        scaleState,
        connectScale,
        disconnectScale,
        tareScale,
        setManualScaleWeight,
        lockScaleReading,
        simulateWeightChange,
        hubInventory,
        addStockToHub,
        biddingTenders,
        createBiddingTender,
        placeBidOnTender,
        acceptWinningBid,
        eprCredits,
        mintEprToken,
        claimEprTokenByCorp,
        auditLogs,
        addAuditLog,
        voiceSoundEnabled,
        setVoiceSoundEnabled,
        speakVoice,
        isOffline,
        setIsOffline,
        pendingOfflineCount,
        syncOfflineQueue,
        toastMessage,
        showToast,
        selectedCity,
        setSelectedCity,
        walletBalance,
        walletTransactions,
        totalEarningsFromScrap,
        totalWithdrawnToUpi,
        isWithdrawModalOpen,
        setIsWithdrawModalOpen,
        isPassbookOpen,
        setIsPassbookOpen,
        withdrawToUpi,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
