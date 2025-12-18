using System.Text.Json.Serialization;

namespace NovaEraAdmin.Models;

public record Partner(
    [property: JsonPropertyName("id")] int Id,
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("pixKey")] string PixKey,
    [property: JsonPropertyName("percentage")] decimal Percentage,
    [property: JsonPropertyName("totalReceived")] decimal TotalReceived,
    [property: JsonPropertyName("active")] bool Active
);

public record Sale(
    [property: JsonPropertyName("id")] int Id,
    [property: JsonPropertyName("userId")] string UserId,
    [property: JsonPropertyName("amount")] decimal Amount,
    [property: JsonPropertyName("robux")] int Robux,
    [property: JsonPropertyName("createdAt")] DateTime CreatedAt,
    [property: JsonPropertyName("splits")] List<Split>? Splits
);

public record Split(
    [property: JsonPropertyName("id")] int Id,
    [property: JsonPropertyName("partnerId")] int PartnerId,
    [property: JsonPropertyName("partnerName")] string PartnerName,
    [property: JsonPropertyName("amount")] decimal Amount,
    [property: JsonPropertyName("percentage")] decimal Percentage,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("pixKey")] string PixKey
);

public record Stats(
    [property: JsonPropertyName("totalSales")] int TotalSales,
    [property: JsonPropertyName("totalAmount")] decimal TotalAmount,
    [property: JsonPropertyName("totalRobux")] int TotalRobux,
    [property: JsonPropertyName("partnerStats")] List<PartnerStats>? PartnerStats
);

public record PartnerStats(
    [property: JsonPropertyName("partnerId")] int PartnerId,
    [property: JsonPropertyName("partnerName")] string PartnerName,
    [property: JsonPropertyName("totalReceived")] decimal TotalReceived,
    [property: JsonPropertyName("totalSplits")] int TotalSplits,
    [property: JsonPropertyName("pendingAmount")] decimal PendingAmount
);

public record Subaccount(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("email")] string Email,
    [property: JsonPropertyName("walletId")] string WalletId,
    [property: JsonPropertyName("cpfCnpj")] string CpfCnpj
);

public record CreateSubaccountRequest(
    string Name,
    string CpfCnpj,
    string Email,
    string? Phone = null,
    string? Address = null,
    string? AddressNumber = null,
    string? Province = null,
    string? PostalCode = null
);

public record AsaasPaymentList(
    [property: JsonPropertyName("data")] List<AsaasPayment> Data,
    [property: JsonPropertyName("totalCount")] int TotalCount
);

public record AsaasPayment(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("value")] decimal Value,
    [property: JsonPropertyName("netValue")] decimal NetValue,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("billingType")] string BillingType,
    [property: JsonPropertyName("description")] string? Description,
    [property: JsonPropertyName("dateCreated")] string DateCreated,
    [property: JsonPropertyName("dueDate")] string DueDate
);

public record AsaasBalance(
    [property: JsonPropertyName("balance")] decimal Balance,
    [property: JsonPropertyName("totalPending")] decimal TotalPending
);

public record ClearDataResponse(
    [property: JsonPropertyName("message")] string Message
);

public class BotConfig
{
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("guildId")] public string? GuildId { get; set; }
    [JsonPropertyName("channelLogsPurchases")] public string? ChannelLogsPurchases { get; set; }
    [JsonPropertyName("channelLogsDeliveries")] public string? ChannelLogsDeliveries { get; set; }
    [JsonPropertyName("categoryCarts")] public string? CategoryCarts { get; set; }
    [JsonPropertyName("categoryApproved")] public string? CategoryApproved { get; set; }
    [JsonPropertyName("categoryTickets")] public string? CategoryTickets { get; set; }
    [JsonPropertyName("roleClient")] public string? RoleClient { get; set; }
    [JsonPropertyName("roleAdmin")] public string? RoleAdmin { get; set; }
    [JsonPropertyName("storeName")] public string? StoreName { get; set; }
    [JsonPropertyName("storeColor")] public string? StoreColor { get; set; }
    [JsonPropertyName("pricePerK")] public decimal PricePerK { get; set; }
    [JsonPropertyName("paymentTimeoutMinutes")] public int PaymentTimeoutMinutes { get; set; }
    [JsonPropertyName("cartInactivityMinutes")] public int CartInactivityMinutes { get; set; }
    [JsonPropertyName("robloxApiKey")] public string? RobloxApiKey { get; set; }
    [JsonPropertyName("robloxGameId")] public string? RobloxGameId { get; set; }
}

public class Game
{
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;
    [JsonPropertyName("robloxGameId")] public string? RobloxGameId { get; set; }
    [JsonPropertyName("robloxPlaceId")] public string? RobloxPlaceId { get; set; }
    [JsonPropertyName("imageUrl")] public string? ImageUrl { get; set; }
    [JsonPropertyName("bannerUrl")] public string? BannerUrl { get; set; }
    [JsonPropertyName("description")] public string? Description { get; set; }
    [JsonPropertyName("creator")] public string? Creator { get; set; }
    [JsonPropertyName("active")] public bool Active { get; set; } = true;
    [JsonPropertyName("products")] public List<Product>? Products { get; set; }
}

public class Product
{
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;
    [JsonPropertyName("description")] public string? Description { get; set; }
    [JsonPropertyName("type")] public int Type { get; set; }
    [JsonPropertyName("delivery")] public int Delivery { get; set; }
    [JsonPropertyName("price")] public decimal? Price { get; set; }
    [JsonPropertyName("robuxAmount")] public int RobuxAmount { get; set; }
    [JsonPropertyName("robloxGamepassId")] public string? RobloxGamepassId { get; set; }
    [JsonPropertyName("imageUrl")] public string? ImageUrl { get; set; }
    [JsonPropertyName("active")] public bool Active { get; set; } = true;
    [JsonPropertyName("displayOrder")] public int DisplayOrder { get; set; }
    [JsonPropertyName("gameId")] public int GameId { get; set; }
}

public class GamepassInfo
{
    [JsonPropertyName("id")] public long Id { get; set; }
    [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;
    [JsonPropertyName("description")] public string? Description { get; set; }
    [JsonPropertyName("priceInRobux")] public long? PriceInRobux { get; set; }
    [JsonPropertyName("imageUrl")] public string? ImageUrl { get; set; }
    [JsonPropertyName("creatorId")] public long CreatorId { get; set; }
    [JsonPropertyName("creatorName")] public string? CreatorName { get; set; }
    [JsonPropertyName("isForSale")] public bool IsForSale { get; set; }
}
