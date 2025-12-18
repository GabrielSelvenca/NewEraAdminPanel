using NovaEraAdmin.Models;
using NovaEraAdmin.Services;
using System.Text.Json.Serialization;

namespace NovaEraAdmin.Forms;

public class MainForm : Form
{
    private readonly ApiClient _client;
    
    // Layout
    private Panel _sidebar = null!;
    private Panel _content = null!;
    private Panel _currentPanel = null!;
    private Button? _activeButton;
    
    // Cores do tema
    private static readonly Color BgDark = Color.FromArgb(18, 18, 18);
    private static readonly Color BgCard = Color.FromArgb(28, 28, 28);
    private static readonly Color BgSidebar = Color.FromArgb(22, 22, 22);
    private static readonly Color AccentGreen = Color.FromArgb(34, 197, 94);
    private static readonly Color TextPrimary = Color.FromArgb(245, 245, 245);
    private static readonly Color TextSecondary = Color.FromArgb(160, 160, 160);

    public MainForm(ApiClient client)
    {
        _client = client;
        InitializeUI();
        Load += async (s, e) => await LoadDashboard();
    }

    private void InitializeUI()
    {
        Text = "Nova Era Admin";
        Size = new Size(1200, 750);
        MinimumSize = new Size(900, 600);
        StartPosition = FormStartPosition.CenterScreen;
        BackColor = BgDark;
        
        // Sidebar
        _sidebar = new Panel
        {
            Dock = DockStyle.Left,
            Width = 220,
            BackColor = BgSidebar,
            Padding = new Padding(0, 20, 0, 20)
        };
        
        // Logo/Title
        var logo = new Label
        {
            Text = "🎮 Nova",
            Font = new Font("Segoe UI", 20, FontStyle.Bold),
            ForeColor = AccentGreen,
            Dock = DockStyle.Top,
            Height = 60,
            TextAlign = ContentAlignment.MiddleCenter,
            Padding = new Padding(0)
        };
        
        // Menu buttons
        var menuPanel = new FlowLayoutPanel
        {
            Dock = DockStyle.Fill,
            FlowDirection = FlowDirection.TopDown,
            Padding = new Padding(10, 20, 10, 10),
            AutoScroll = true
        };
        
        var btnDash = CreateMenuButton("📊  Dashboard", () => _ = LoadDashboard());
        var btnGames = CreateMenuButton("🎮  Jogos", () => _ = LoadGames());
        var btnConfig = CreateMenuButton("⚙️  Configurações", () => _ = LoadConfig());
        
        menuPanel.Controls.AddRange(new Control[] { btnDash, btnGames, btnConfig });
        
        _sidebar.Controls.Add(menuPanel);
        _sidebar.Controls.Add(logo);
        
        // Content area
        _content = new Panel
        {
            Dock = DockStyle.Fill,
            BackColor = BgDark,
            Padding = new Padding(30)
        };
        
        Controls.Add(_content);
        Controls.Add(_sidebar);
        
        // Seleciona Dashboard por padrão
        _activeButton = btnDash;
        btnDash.BackColor = BgCard;
    }

    private Button CreateMenuButton(string text, Action onClick)
    {
        var btn = new Button
        {
            Text = text,
            Width = 195,
            Height = 45,
            FlatStyle = FlatStyle.Flat,
            BackColor = Color.Transparent,
            ForeColor = TextPrimary,
            Font = new Font("Segoe UI", 11),
            TextAlign = ContentAlignment.MiddleLeft,
            Padding = new Padding(15, 0, 0, 0),
            Cursor = Cursors.Hand,
            Margin = new Padding(0, 2, 0, 2)
        };
        btn.FlatAppearance.BorderSize = 0;
        btn.FlatAppearance.MouseOverBackColor = Color.FromArgb(40, 40, 40);
        
        btn.Click += (s, e) =>
        {
            if (_activeButton != null)
                _activeButton.BackColor = Color.Transparent;
            btn.BackColor = BgCard;
            _activeButton = btn;
            onClick();
        };
        
        return btn;
    }

    private void SetContent(Panel panel)
    {
        _content.Controls.Clear();
        panel.Dock = DockStyle.Fill;
        _content.Controls.Add(panel);
        _currentPanel = panel;
    }

    // ==================== DASHBOARD ====================
    private async Task LoadDashboard()
    {
        var panel = new Panel { BackColor = BgDark };
        
        var title = CreateTitle("Dashboard");
        title.Dock = DockStyle.Top;
        
        var cardsPanel = new FlowLayoutPanel
        {
            Dock = DockStyle.Top,
            Height = 120,
            Padding = new Padding(0, 10, 0, 10),
            BackColor = Color.Transparent
        };
        
        SetContent(panel);
        panel.Controls.Add(cardsPanel);
        panel.Controls.Add(title);
        
        // Carrega dados
        try
        {
            var stats = await _client.GetAsync<Stats>("/api/payments/stats");
            var games = await _client.GetAsync<List<Game>>("/api/games");
            
            cardsPanel.Controls.Add(CreateStatCard("💰 Faturamento", $"R$ {stats?.TotalAmount ?? 0:N2}"));
            cardsPanel.Controls.Add(CreateStatCard("📦 Vendas", $"{stats?.TotalSales ?? 0}"));
            cardsPanel.Controls.Add(CreateStatCard("🎮 Jogos", $"{games?.Count ?? 0}"));
            cardsPanel.Controls.Add(CreateStatCard("💎 Robux", $"{stats?.TotalRobux ?? 0:N0}"));
        }
        catch (Exception ex)
        {
            cardsPanel.Controls.Add(new Label { Text = $"Erro: {ex.Message}", ForeColor = Color.Salmon, AutoSize = true });
        }
    }

    private Panel CreateStatCard(string label, string value)
    {
        var card = new Panel
        {
            Width = 180,
            Height = 90,
            BackColor = BgCard,
            Margin = new Padding(0, 0, 15, 0),
            Padding = new Padding(15)
        };
        
        var lblValue = new Label
        {
            Text = value,
            Font = new Font("Segoe UI", 20, FontStyle.Bold),
            ForeColor = AccentGreen,
            Dock = DockStyle.Top,
            Height = 40
        };
        
        var lblLabel = new Label
        {
            Text = label,
            Font = new Font("Segoe UI", 10),
            ForeColor = TextSecondary,
            Dock = DockStyle.Bottom,
            Height = 25
        };
        
        card.Controls.Add(lblLabel);
        card.Controls.Add(lblValue);
        return card;
    }

    // ==================== JOGOS ====================
    private async Task LoadGames()
    {
        var panel = new Panel { BackColor = BgDark };
        
        var title = CreateTitle("Jogos e Produtos");
        title.Dock = DockStyle.Top;
        
        // Toolbar
        var toolbar = new FlowLayoutPanel
        {
            Dock = DockStyle.Top,
            Height = 50,
            BackColor = Color.Transparent,
            Padding = new Padding(0, 10, 0, 0)
        };
        
        var btnSync = CreateButton("🔗 Sincronizar do Roblox", AccentGreen);
        btnSync.Click += (s, e) => ShowSyncDialog();
        
        var btnRefresh = CreateButton("🔄 Atualizar", BgCard);
        btnRefresh.Click += async (s, e) => await LoadGames();
        
        toolbar.Controls.AddRange(new Control[] { btnSync, btnRefresh });
        
        // Grid
        var grid = CreateGrid();
        grid.Columns.AddRange(new DataGridViewColumn[]
        {
            new DataGridViewTextBoxColumn { Name = "Id", HeaderText = "ID", Width = 50 },
            new DataGridViewTextBoxColumn { Name = "Name", HeaderText = "Nome", Width = 200 },
            new DataGridViewTextBoxColumn { Name = "RobloxId", HeaderText = "Universe ID", Width = 120 },
            new DataGridViewTextBoxColumn { Name = "Products", HeaderText = "Produtos", Width = 80 },
            new DataGridViewTextBoxColumn { Name = "Active", HeaderText = "Status", Width = 80 }
        });
        
        grid.CellDoubleClick += (s, e) =>
        {
            if (e.RowIndex >= 0)
            {
                var gameId = (int)grid.Rows[e.RowIndex].Cells["Id"].Value;
                _ = ShowGameProducts(gameId);
            }
        };
        
        SetContent(panel);
        panel.Controls.Add(grid);
        panel.Controls.Add(toolbar);
        panel.Controls.Add(title);
        
        // Carrega dados
        try
        {
            var games = await _client.GetAsync<List<Game>>("/api/games");
            grid.Rows.Clear();
            foreach (var g in games ?? [])
            {
                grid.Rows.Add(g.Id, g.Name, g.RobloxGameId ?? "-", g.Products?.Count ?? 0, g.Active ? "✅ Ativo" : "❌ Inativo");
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Erro: {ex.Message}", "Erro", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }

    private async Task ShowGameProducts(int gameId)
    {
        var game = await _client.GetAsync<Game>($"/api/games/{gameId}");
        if (game == null) return;
        
        var panel = new Panel { BackColor = BgDark };
        
        var title = CreateTitle($"📦 {game.Name} - Produtos");
        title.Dock = DockStyle.Top;
        
        // Toolbar
        var toolbar = new FlowLayoutPanel
        {
            Dock = DockStyle.Top,
            Height = 50,
            BackColor = Color.Transparent,
            Padding = new Padding(0, 10, 0, 0)
        };
        
        var btnBack = CreateButton("← Voltar", BgCard);
        btnBack.Click += async (s, e) => await LoadGames();
        
        var btnSync = CreateButton("🔄 Re-sincronizar", AccentGreen);
        btnSync.Click += async (s, e) =>
        {
            if (string.IsNullOrEmpty(game.RobloxGameId))
            {
                MessageBox.Show("Este jogo não tem Universe ID do Roblox!", "Erro", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }
            // Re-sync
            await _client.PostAsync<SyncResponse>("/api/roblox/sync", new { placeIdOrUrl = game.RobloxGameId });
            await ShowGameProducts(gameId);
            MessageBox.Show("Produtos atualizados!", "Sucesso", MessageBoxButtons.OK, MessageBoxIcon.Information);
        };
        
        toolbar.Controls.AddRange(new Control[] { btnBack, btnSync });
        
        // Grid
        var grid = CreateGrid();
        grid.Columns.AddRange(new DataGridViewColumn[]
        {
            new DataGridViewTextBoxColumn { Name = "Name", HeaderText = "Nome", Width = 200 },
            new DataGridViewTextBoxColumn { Name = "Robux", HeaderText = "Robux", Width = 80 },
            new DataGridViewTextBoxColumn { Name = "Price", HeaderText = "Preço", Width = 100 },
            new DataGridViewTextBoxColumn { Name = "GamepassId", HeaderText = "Gamepass ID", Width = 120 },
            new DataGridViewTextBoxColumn { Name = "Active", HeaderText = "Status", Width = 80 }
        });
        
        SetContent(panel);
        panel.Controls.Add(grid);
        panel.Controls.Add(toolbar);
        panel.Controls.Add(title);
        
        // Carrega produtos
        var products = await _client.GetAsync<List<Product>>($"/api/products/game/{gameId}");
        foreach (var p in products ?? [])
        {
            var price = p.Price.HasValue ? $"R$ {p.Price:F2}" : $"~R$ {p.RobuxAmount * 0.028m:F2}";
            grid.Rows.Add(p.Name, p.RobuxAmount, price, p.RobloxGamepassId ?? "-", p.Active ? "✅" : "❌");
        }
    }

    private void ShowSyncDialog()
    {
        var dialog = new Form
        {
            Text = "Sincronizar Jogo do Roblox",
            Size = new Size(500, 220),
            StartPosition = FormStartPosition.CenterParent,
            BackColor = BgDark,
            FormBorderStyle = FormBorderStyle.FixedDialog,
            MaximizeBox = false,
            MinimizeBox = false
        };

        var lblInfo = new Label
        {
            Text = "Cole o link do jogo do Roblox.\nO sistema importará automaticamente o nome, descrição e todas as gamepasses.",
            Location = new Point(20, 20),
            Size = new Size(440, 40),
            ForeColor = TextSecondary
        };

        var txtUrl = new TextBox
        {
            Location = new Point(20, 70),
            Width = 440,
            Height = 30,
            BackColor = BgCard,
            ForeColor = TextPrimary,
            Font = new Font("Segoe UI", 11),
            BorderStyle = BorderStyle.FixedSingle
        };

        var btnSync = new Button
        {
            Text = "🔄 Sincronizar",
            Location = new Point(20, 120),
            Size = new Size(150, 40),
            FlatStyle = FlatStyle.Flat,
            BackColor = AccentGreen,
            ForeColor = Color.White,
            Font = new Font("Segoe UI", 11, FontStyle.Bold),
            Cursor = Cursors.Hand
        };
        btnSync.FlatAppearance.BorderSize = 0;

        var lblStatus = new Label
        {
            Text = "",
            Location = new Point(180, 130),
            Size = new Size(280, 25),
            ForeColor = TextSecondary
        };

        btnSync.Click += async (s, e) =>
        {
            if (string.IsNullOrWhiteSpace(txtUrl.Text))
            {
                MessageBox.Show("Digite o link do jogo!", "Erro", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            btnSync.Enabled = false;
            lblStatus.Text = "⏳ Buscando...";

            try
            {
                var result = await _client.PostAsync<SyncResponse>("/api/roblox/sync", new { placeIdOrUrl = txtUrl.Text.Trim() });

                if (result?.Success == true)
                {
                    MessageBox.Show(
                        $"✅ {result.Message}\n\n" +
                        $"Gamepasses: {result.Stats?.GamepassesFound ?? 0}\n" +
                        $"Adicionadas: {result.Stats?.Added ?? 0}\n" +
                        $"Atualizadas: {result.Stats?.Updated ?? 0}",
                        "Sucesso", MessageBoxButtons.OK, MessageBoxIcon.Information);
                    dialog.Close();
                    await LoadGames();
                }
                else
                {
                    lblStatus.Text = "❌ Erro ao sincronizar";
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Erro: {ex.Message}", "Erro", MessageBoxButtons.OK, MessageBoxIcon.Error);
                lblStatus.Text = "";
            }
            finally
            {
                btnSync.Enabled = true;
            }
        };

        dialog.Controls.AddRange(new Control[] { lblInfo, txtUrl, btnSync, lblStatus });
        dialog.ShowDialog();
    }

    // ==================== CONFIGURAÇÕES ====================
    private async Task LoadConfig()
    {
        var panel = new Panel { BackColor = BgDark, AutoScroll = true };
        
        var title = CreateTitle("Configurações do Bot");
        title.Dock = DockStyle.Top;
        
        SetContent(panel);
        panel.Controls.Add(title);
        
        // Carrega config
        BotConfig? config = null;
        try
        {
            config = await _client.GetAsync<BotConfig>("/api/config");
        }
        catch { }
        
        config ??= new BotConfig();
        
        var form = new FlowLayoutPanel
        {
            Dock = DockStyle.Fill,
            FlowDirection = FlowDirection.TopDown,
            Padding = new Padding(0, 60, 0, 0),
            AutoScroll = true
        };
        
        var txtGuild = CreateField("Guild ID (Servidor)", config.GuildId ?? "");
        var txtCartsCategory = CreateField("Categoria Carrinhos", config.CategoryCarts ?? "");
        var txtApprovedCategory = CreateField("Categoria Aprovados", config.CategoryApproved ?? "");
        var txtLogsChannel = CreateField("Canal de Logs", config.ChannelLogsPurchases ?? "");
        var txtAdminRole = CreateField("Cargo Admin", config.RoleAdmin ?? "");
        var txtClientRole = CreateField("Cargo Cliente", config.RoleClient ?? "");
        var txtStoreName = CreateField("Nome da Loja", config.StoreName ?? "Nova Era Store");
        var txtPricePerK = CreateField("Preço por 1000 Robux", config.PricePerK.ToString("F2"));
        
        var btnSave = CreateButton("💾 Salvar Configurações", AccentGreen);
        btnSave.Width = 200;
        btnSave.Height = 45;
        btnSave.Margin = new Padding(0, 20, 0, 0);
        
        btnSave.Click += async (s, e) =>
        {
            config.GuildId = GetFieldValue(txtGuild);
            config.CategoryCarts = GetFieldValue(txtCartsCategory);
            config.CategoryApproved = GetFieldValue(txtApprovedCategory);
            config.ChannelLogsPurchases = GetFieldValue(txtLogsChannel);
            config.RoleAdmin = GetFieldValue(txtAdminRole);
            config.RoleClient = GetFieldValue(txtClientRole);
            config.StoreName = GetFieldValue(txtStoreName);
            if (decimal.TryParse(GetFieldValue(txtPricePerK), out var price))
                config.PricePerK = price;
            
            await _client.PutAsync("/api/config", config);
            MessageBox.Show("Configurações salvas!", "Sucesso", MessageBoxButtons.OK, MessageBoxIcon.Information);
        };
        
        form.Controls.AddRange(new Control[] { txtGuild, txtCartsCategory, txtApprovedCategory, txtLogsChannel, txtAdminRole, txtClientRole, txtStoreName, txtPricePerK, btnSave });
        panel.Controls.Add(form);
    }

    private Panel CreateField(string label, string value)
    {
        var container = new Panel { Width = 400, Height = 70, Margin = new Padding(0, 0, 0, 5) };
        
        var lbl = new Label
        {
            Text = label,
            ForeColor = TextSecondary,
            Font = new Font("Segoe UI", 9),
            Dock = DockStyle.Top,
            Height = 20
        };
        
        var txt = new TextBox
        {
            Text = value,
            BackColor = BgCard,
            ForeColor = TextPrimary,
            Font = new Font("Segoe UI", 11),
            BorderStyle = BorderStyle.FixedSingle,
            Dock = DockStyle.Bottom,
            Height = 35,
            Tag = label
        };
        
        container.Controls.Add(txt);
        container.Controls.Add(lbl);
        return container;
    }

    private static string GetFieldValue(Panel field)
    {
        foreach (Control c in field.Controls)
            if (c is TextBox txt) return txt.Text;
        return "";
    }

    // ==================== HELPERS ====================
    private Label CreateTitle(string text)
    {
        return new Label
        {
            Text = text,
            Font = new Font("Segoe UI", 22, FontStyle.Bold),
            ForeColor = TextPrimary,
            Height = 50,
            Padding = new Padding(0, 0, 0, 10)
        };
    }

    private Button CreateButton(string text, Color bgColor)
    {
        var btn = new Button
        {
            Text = text,
            Width = 180,
            Height = 38,
            FlatStyle = FlatStyle.Flat,
            BackColor = bgColor,
            ForeColor = TextPrimary,
            Font = new Font("Segoe UI", 10),
            Cursor = Cursors.Hand,
            Margin = new Padding(0, 0, 10, 0)
        };
        btn.FlatAppearance.BorderSize = 0;
        return btn;
    }

    private DataGridView CreateGrid()
    {
        return new DataGridView
        {
            Dock = DockStyle.Fill,
            BackgroundColor = BgDark,
            ForeColor = TextPrimary,
            GridColor = Color.FromArgb(40, 40, 40),
            BorderStyle = BorderStyle.None,
            CellBorderStyle = DataGridViewCellBorderStyle.SingleHorizontal,
            ColumnHeadersDefaultCellStyle = new DataGridViewCellStyle
            {
                BackColor = BgCard,
                ForeColor = TextPrimary,
                Font = new Font("Segoe UI", 10, FontStyle.Bold),
                Padding = new Padding(10)
            },
            DefaultCellStyle = new DataGridViewCellStyle
            {
                BackColor = BgDark,
                ForeColor = TextPrimary,
                SelectionBackColor = Color.FromArgb(40, 40, 40),
                SelectionForeColor = AccentGreen,
                Font = new Font("Segoe UI", 10),
                Padding = new Padding(10)
            },
            RowHeadersVisible = false,
            AllowUserToAddRows = false,
            AllowUserToDeleteRows = false,
            ReadOnly = true,
            SelectionMode = DataGridViewSelectionMode.FullRowSelect,
            AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill,
            RowTemplate = { Height = 45 },
            ColumnHeadersHeight = 50
        };
    }
}

// Response model para sincronização
public class SyncResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("message")]
    public string? Message { get; set; }

    [JsonPropertyName("stats")]
    public SyncStats? Stats { get; set; }
}

public class SyncStats
{
    [JsonPropertyName("gamepassesFound")]
    public int GamepassesFound { get; set; }

    [JsonPropertyName("added")]
    public int Added { get; set; }

    [JsonPropertyName("updated")]
    public int Updated { get; set; }
}
