using NovaEraAdmin.Models;
using NovaEraAdmin.Services;

namespace NovaEraAdmin.Forms;

public class ConfigForm : Form
{
    private readonly ApiClient _client;
    private BotConfig? _config;

    // Discord IDs
    private readonly TextBox _guildIdBox = new() { Width = 300, PlaceholderText = "ID do Servidor" };
    private readonly TextBox _logsChannelBox = new() { Width = 300, PlaceholderText = "Canal de Logs Compras" };
    private readonly TextBox _logsDeliveryBox = new() { Width = 300, PlaceholderText = "Canal de Logs Entregas" };
    private readonly TextBox _cartsBox = new() { Width = 300, PlaceholderText = "Categoria Carrinhos" };
    private readonly TextBox _approvedBox = new() { Width = 300, PlaceholderText = "Categoria Aprovados" };
    private readonly TextBox _ticketsBox = new() { Width = 300, PlaceholderText = "Categoria Tickets" };
    private readonly TextBox _clientRoleBox = new() { Width = 300, PlaceholderText = "Cargo Cliente" };
    private readonly TextBox _adminRoleBox = new() { Width = 300, PlaceholderText = "Cargo Admin" };

    // Store
    private readonly TextBox _storeNameBox = new() { Width = 300, PlaceholderText = "Nome da Loja" };
    private readonly TextBox _storeColorBox = new() { Width = 300, PlaceholderText = "Cor (hex)" };
    private readonly NumericUpDown _priceBox = new() { Width = 300, DecimalPlaces = 2, Maximum = 1000 };

    // Timeouts
    private readonly NumericUpDown _paymentTimeoutBox = new() { Width = 300, Minimum = 1, Maximum = 60 };
    private readonly NumericUpDown _cartTimeoutBox = new() { Width = 300, Minimum = 1, Maximum = 60 };

    // Roblox
    private readonly TextBox _robloxKeyBox = new() { Width = 300, PlaceholderText = "Roblox API Key", UseSystemPasswordChar = true };
    private readonly TextBox _robloxGameBox = new() { Width = 300, PlaceholderText = "Game ID" };

    private readonly Button _saveBtn = new() { Text = "💾 Salvar Configurações", Width = 300, Height = 40 };
    private readonly Label _statusLabel = new() { Width = 300, Height = 25 };

    public ConfigForm(ApiClient client)
    {
        _client = client;
        Text = "⚙️ Configurações do Bot";
        Size = new Size(800, 650);
        StartPosition = FormStartPosition.CenterParent;
        FormBorderStyle = FormBorderStyle.FixedDialog;
        MaximizeBox = false;
        AutoScroll = true;

        SetupUI();
        Load += async (s, e) => await LoadConfigAsync();
    }

    private void SetupUI()
    {
        var mainPanel = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 2,
            Padding = new Padding(20),
            AutoScroll = true
        };
        mainPanel.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 50));
        mainPanel.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 50));

        // Left Column - Discord
        var leftPanel = new FlowLayoutPanel { FlowDirection = FlowDirection.TopDown, AutoSize = true, WrapContents = false };
        leftPanel.Controls.Add(new Label { Text = "🎮 Discord IDs", Font = new Font("Segoe UI", 12, FontStyle.Bold), Height = 30 });
        leftPanel.Controls.Add(CreateField("Servidor (Guild ID):", _guildIdBox));
        leftPanel.Controls.Add(CreateField("Canal Logs Compras:", _logsChannelBox));
        leftPanel.Controls.Add(CreateField("Canal Logs Entregas:", _logsDeliveryBox));
        leftPanel.Controls.Add(CreateField("Categoria Carrinhos:", _cartsBox));
        leftPanel.Controls.Add(CreateField("Categoria Aprovados:", _approvedBox));
        leftPanel.Controls.Add(CreateField("Categoria Tickets:", _ticketsBox));
        leftPanel.Controls.Add(CreateField("Cargo Cliente:", _clientRoleBox));
        leftPanel.Controls.Add(CreateField("Cargo Admin:", _adminRoleBox));

        // Right Column - Store & Roblox
        var rightPanel = new FlowLayoutPanel { FlowDirection = FlowDirection.TopDown, AutoSize = true, WrapContents = false };
        rightPanel.Controls.Add(new Label { Text = "🏪 Loja", Font = new Font("Segoe UI", 12, FontStyle.Bold), Height = 30 });
        rightPanel.Controls.Add(CreateField("Nome da Loja:", _storeNameBox));
        rightPanel.Controls.Add(CreateField("Cor (hex):", _storeColorBox));
        rightPanel.Controls.Add(CreateField("Preço por 1K Robux:", _priceBox));
        rightPanel.Controls.Add(CreateField("Timeout Pagamento (min):", _paymentTimeoutBox));
        rightPanel.Controls.Add(CreateField("Timeout Carrinho (min):", _cartTimeoutBox));

        rightPanel.Controls.Add(new Label { Text = "🎯 Roblox API", Font = new Font("Segoe UI", 12, FontStyle.Bold), Height = 30, Margin = new Padding(0, 20, 0, 0) });
        rightPanel.Controls.Add(CreateField("API Key:", _robloxKeyBox));
        rightPanel.Controls.Add(CreateField("Game ID:", _robloxGameBox));

        rightPanel.Controls.Add(_saveBtn);
        rightPanel.Controls.Add(_statusLabel);

        _saveBtn.Click += async (s, e) => await SaveConfigAsync();

        mainPanel.Controls.Add(leftPanel, 0, 0);
        mainPanel.Controls.Add(rightPanel, 1, 0);
        Controls.Add(mainPanel);
    }

    private static Panel CreateField(string label, Control input)
    {
        var panel = new Panel { Height = 50, Width = 320 };
        var lbl = new Label { Text = label, Dock = DockStyle.Top, Height = 20 };
        input.Dock = DockStyle.Bottom;
        panel.Controls.AddRange([lbl, input]);
        return panel;
    }

    private async Task LoadConfigAsync()
    {
        try
        {
            _config = await _client.GetAsync<BotConfig>("/api/config");
            if (_config == null) return;

            _guildIdBox.Text = _config.GuildId ?? "";
            _logsChannelBox.Text = _config.ChannelLogsPurchases ?? "";
            _logsDeliveryBox.Text = _config.ChannelLogsDeliveries ?? "";
            _cartsBox.Text = _config.CategoryCarts ?? "";
            _approvedBox.Text = _config.CategoryApproved ?? "";
            _ticketsBox.Text = _config.CategoryTickets ?? "";
            _clientRoleBox.Text = _config.RoleClient ?? "";
            _adminRoleBox.Text = _config.RoleAdmin ?? "";
            _storeNameBox.Text = _config.StoreName ?? "Nova Era Store";
            _storeColorBox.Text = _config.StoreColor ?? "#257e24";
            _priceBox.Value = _config.PricePerK;
            _paymentTimeoutBox.Value = _config.PaymentTimeoutMinutes;
            _cartTimeoutBox.Value = _config.CartInactivityMinutes;
            _robloxKeyBox.Text = _config.RobloxApiKey ?? "";
            _robloxGameBox.Text = _config.RobloxGameId ?? "";
        }
        catch (Exception ex)
        {
            _statusLabel.Text = $"Erro: {ex.Message}";
            _statusLabel.ForeColor = Color.Red;
        }
    }

    private async Task SaveConfigAsync()
    {
        _saveBtn.Enabled = false;
        _statusLabel.Text = "Salvando...";
        _statusLabel.ForeColor = Color.Blue;

        try
        {
            var update = new
            {
                guildId = _guildIdBox.Text.Trim(),
                channelLogsPurchases = _logsChannelBox.Text.Trim(),
                channelLogsDeliveries = _logsDeliveryBox.Text.Trim(),
                categoryCarts = _cartsBox.Text.Trim(),
                categoryApproved = _approvedBox.Text.Trim(),
                categoryTickets = _ticketsBox.Text.Trim(),
                roleClient = _clientRoleBox.Text.Trim(),
                roleAdmin = _adminRoleBox.Text.Trim(),
                storeName = _storeNameBox.Text.Trim(),
                storeColor = _storeColorBox.Text.Trim(),
                pricePerK = _priceBox.Value,
                paymentTimeoutMinutes = (int)_paymentTimeoutBox.Value,
                cartInactivityMinutes = (int)_cartTimeoutBox.Value,
                robloxApiKey = _robloxKeyBox.Text.Trim(),
                robloxGameId = _robloxGameBox.Text.Trim()
            };

            await _client.PutAsync("/api/config", update);
            _statusLabel.Text = "✅ Salvo com sucesso!";
            _statusLabel.ForeColor = Color.Green;
        }
        catch (Exception ex)
        {
            _statusLabel.Text = $"❌ Erro: {ex.Message}";
            _statusLabel.ForeColor = Color.Red;
        }
        finally
        {
            _saveBtn.Enabled = true;
        }
    }
}
