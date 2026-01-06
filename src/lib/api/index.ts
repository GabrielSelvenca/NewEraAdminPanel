// Client
export { client } from './client';

// Modules
export { auth } from './auth';
export { games } from './games';
export { gameItems } from './gameItems';
export { products } from './products';
export { partners } from './partners';
export { sales } from './sales';
export { config } from './config';
export { users } from './users';
export { coupons } from './coupons';
export { deliveries } from './deliveries';
export { sellers } from './sellers';
export { mercadopago } from './mercadopago';
export { roblox } from './roblox';
export { upload } from './upload';

// Types
export type {
  LoginResponse,
  Game,
  GameItem,
  Product,
  BotConfig,
  SalesStats,
  Sale,
  SalesResponse,
  AdminUser,
  Stats,
  Partner,
  DiscordServerData,
  Coupon,
  Delivery,
  DeliveryStats,
  MercadoPagoPayment,
  Seller,
  UpdateSellerRequest,
} from './types';

// Legacy compatibility - mantém a API antiga funcionando
import { client } from './client';
import { auth } from './auth';
import { games } from './games';
import { gameItems } from './gameItems';
import { products } from './products';
import { partners } from './partners';
import { sales } from './sales';
import { config } from './config';
import { users } from './users';
import { coupons } from './coupons';
import { deliveries } from './deliveries';
import { sellers } from './sellers';
import { mercadopago } from './mercadopago';
import { roblox } from './roblox';
import { upload } from './upload';

export const api = {
  // Auth
  login: auth.login.bind(auth),
  logout: auth.logout.bind(auth),
  getCurrentUser: auth.getCurrentUser.bind(auth),
  isAuthenticated: auth.isAuthenticated.bind(auth),
  
  // Health
  healthCheck: client.healthCheck.bind(client),
  
  // Games
  getGames: games.getAll.bind(games),
  getGame: games.getById.bind(games),
  createGame: games.create.bind(games),
  createGameFromRoblox: games.createFromRoblox.bind(games),
  updateGame: games.update.bind(games),
  deleteGame: games.delete.bind(games),
  reorderGames: games.reorder.bind(games),
  getGameStats: games.getStats.bind(games),
  getActiveGames: games.getActive.bind(games),

  // Game Items
  getGameItems: gameItems.getByGameId.bind(gameItems),
  getGameItem: gameItems.getById.bind(gameItems),
  createGameItem: gameItems.create.bind(gameItems),
  updateGameItem: gameItems.update.bind(gameItems),
  deleteGameItem: gameItems.delete.bind(gameItems),
  reorderGameItems: gameItems.reorder.bind(gameItems),
  resetGameItemsStock: gameItems.resetStock.bind(gameItems),
  getAvailableGameItems: gameItems.getAvailable.bind(gameItems),
  
  // Products
  getProducts: products.getByGameId.bind(products),
  createProduct: products.create.bind(products),
  updateProduct: products.update.bind(products),
  deleteProduct: products.delete.bind(products),
  refreshProductImage: products.refreshImage.bind(products),
  
  // Sales
  getSalesStats: sales.getStats.bind(sales),
  getSales: sales.getAll.bind(sales),
  getStats: sales.getGeneralStats.bind(sales),
  
  // Config
  getConfig: config.get.bind(config),
  updateConfig: config.update.bind(config),
  notifyBotUpdate: config.notifyBotUpdate.bind(config),
  processPlaceholders: config.processPlaceholders.bind(config),
  getDiscordServerData: config.getDiscordServerData.bind(config),
  
  // Users
  getUsers: users.getAll.bind(users),
  createUser: users.create.bind(users),
  updateUser: users.update.bind(users),
  deleteUser: users.delete.bind(users),
  changePassword: users.changePassword.bind(users),
  getAllowedRoles: users.getAllowedRoles.bind(users),
  
  // Upload
  uploadImage: upload.image.bind(upload),
  
  // Partners
  getPartners: partners.getAll.bind(partners),
  getPartner: partners.getById.bind(partners),
  createPartner: partners.create.bind(partners),
  updatePartner: partners.update.bind(partners),
  deletePartner: partners.delete.bind(partners),
  
  // Mercado Pago
  createPixPayment: mercadopago.createPixPayment.bind(mercadopago),
  getMercadoPagoPayment: mercadopago.getPayment.bind(mercadopago),
  getMercadoPagoPaymentStatus: mercadopago.getPaymentStatus.bind(mercadopago),
  
  // Coupons
  getCoupons: coupons.getAll.bind(coupons),
  getCoupon: coupons.getById.bind(coupons),
  createCoupon: coupons.create.bind(coupons),
  updateCoupon: coupons.update.bind(coupons),
  deleteCoupon: coupons.delete.bind(coupons),
  validateCoupon: coupons.validate.bind(coupons),
  
  // Deliveries
  getDeliveries: deliveries.getAll.bind(deliveries),
  getDelivery: deliveries.getById.bind(deliveries),
  getDeliveryStats: deliveries.getStats.bind(deliveries),
  updateDeliveryStatus: deliveries.updateStatus.bind(deliveries),
  uploadDeliveryProof: deliveries.uploadProof.bind(deliveries),
  
  // Sellers
  getSellers: sellers.getAll.bind(sellers),
  getSeller: sellers.getById.bind(sellers),
  updateSeller: sellers.update.bind(sellers),
  
  // Roblox
  syncRoblox: roblox.sync.bind(roblox),
  importGamepass: roblox.importGamepass.bind(roblox),
  
  // Generic HTTP methods
  get: client.get.bind(client),
  post: client.post.bind(client),
  put: client.put.bind(client),
  delete: client.delete.bind(client),
};
