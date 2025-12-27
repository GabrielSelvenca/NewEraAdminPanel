export interface LoginResponse {
  user: {
    id: number;
    username: string;
    name: string;
    role: string;
  };
  expiresIn: number;
}

export interface Game {
  id: number;
  name: string;
  robloxGameId?: string;
  robloxPlaceId?: string;
  imageUrl?: string;
  bannerUrl?: string;
  description?: string;
  creator?: string;
  active: boolean;
  products?: Product[];
  totalSales?: number;
  totalRevenue?: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  type: number;
  delivery: number;
  price?: number;
  robuxAmount: number;
  robloxGamepassId?: string;
  imageUrl?: string;
  active: boolean;
  displayOrder: number;
  gameId: number;
}

export interface BotConfig {
  id: number;
  guildId?: string;
  categoryCarts?: string;
  categoryApproved?: string;
  categoryTickets?: string;
  channelLogsPurchases?: string;
  channelLogsDeliveries?: string;
  channelSetupGamepass?: string;
  channelSetupRobux?: string;
  roleClient?: string;
  roleAdmin?: string;
  storeName?: string;
  storeColor?: string;
  pricePerK: number;
  minOrderAmount?: number;
  maxOrderAmount?: number;
  paymentTimeoutMinutes: number;
  cartInactivityMinutes: number;
  robloxApiKey?: string;
  robloxGameId?: string;
  embedGamepassMessage?: string;
  embedRobuxMessage?: string;
  bannerGamepass?: string;
  bannerRobux?: string;
  refreshRequested?: boolean;
  updatedAt?: string;
}

export interface SalesStats {
  period: number;
  totalSales: number;
  totalRevenue: number;
  totalRobux: number;
  averageTicket: number;
  variation: number;
  previousPeriodSales: number;
  previousPeriodRevenue: number;
  salesByDay: { date: string; vendas: number; receita: number }[];
}

export interface Sale {
  id: number;
  userId: string;
  amount: number;
  robux: number;
  gamepasses: string;
  systemOrigin: string;
  createdAt: string;
}

export interface SalesResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  sales: Sale[];
}

export interface AdminUser {
  id: number;
  username: string;
  name: string;
  role: string;
  active: boolean;
  lastLogin?: string;
}

export interface Stats {
  totalSales: number;
  totalAmount: number;
  totalRobux: number;
}

export interface Partner {
  id: number;
  name: string;
  pixKey: string;
  percentage: number;
  active: boolean;
  totalReceived: number;
  createdAt: string;
}

export interface MercadoPagoPayment {
  paymentId: string;
  status: string;
  statusDetail?: string;
  qrCode: string;
  qrCodeBase64: string;
  amount: number;
  createdAt: string;
  expiresAt?: string;
}

export interface DiscordServerData {
  guildId: string;
  guildName: string;
  guildIcon?: string;
  memberCount: number;
  categories: { id: string; name: string }[];
  textChannels: { id: string; name: string; parentId?: string }[];
  roles: { id: string; name: string; color: string; position: number }[];
  syncedAt: string;
}


export interface Coupon {
  id: number;
  code: string;
  discountType: string;
  discountValue: number;
  expiresAt?: string;
  maxUses?: number;
  currentUses: number;
  active: boolean;
  isValid: boolean;
  isExpired: boolean;
  isMaxUsesReached: boolean;
  createdAt: string;
  createdBy?: number;
}

export interface Delivery {
  id: number;
  saleId: number;
  userId: string;
  robloxUsername: string;
  robloxUserId?: number;
  type: string;
  robuxAmount?: number;
  gamepassIds?: string;
  value: number;
  status: string;
  proofUrl?: string;
  deliveryMethod?: string;
  deliveredBy?: number;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  sale?: {
    id: number;
    amount: number;
    status: string;
    paymentId?: string;
  };
}

export interface DeliveryStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  failed: number;
  totalValue: number;
  avgDeliveryTimeMinutes: number;
}

export interface Seller {
  id: number;
  name: string;
  email: string;
  phone?: string;
  cpfCnpj?: string;
  status: string;
  maxActiveOrders: number;
  cooldownSeconds: number;
  assignedVolume24h: number;
  assignedCount24h: number;
  activeOrders: number;
  lastAssignedAt?: string;
  cooldownUntil?: string;
  totalOrdersCompleted: number;
  totalVolumeCompleted: number;
  robuxBalance: number;
  robuxVerifiedAt?: string;
  robloxUserId?: number;
  robloxUsername?: string;
  lowStockAlertSent: boolean;
  createdAt: string;
}

export interface UpdateSellerRequest {
  name?: string;
  email?: string;
  phone?: string;
  cpfCnpj?: string;
  status?: string;
  maxActiveOrders?: number;
  cooldownSeconds?: number;
}
