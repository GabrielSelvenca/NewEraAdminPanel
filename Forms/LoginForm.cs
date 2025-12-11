using NovaEraAdmin.Services;

namespace NovaEraAdmin.Forms;

public class LoginForm : Form
{
    private readonly TextBox _urlBox = new() { PlaceholderText = "URL da API", Width = 300 };
    private readonly TextBox _keyBox = new() { PlaceholderText = "API Key", Width = 300 };
    private readonly TextBox _secretBox = new() { PlaceholderText = "API Secret", Width = 300, UseSystemPasswordChar = true };
    private readonly Button _loginBtn = new() { Text = "Entrar", Width = 300, Height = 40 };
    private readonly Label _statusLabel = new() { Text = "", Width = 300, ForeColor = Color.Red };
    private readonly CheckBox _rememberBox = new() { Text = "Lembrar credenciais", Width = 300 };

    [System.ComponentModel.DesignerSerializationVisibility(System.ComponentModel.DesignerSerializationVisibility.Hidden)]
    public ApiClient? Client { get; private set; }

    public LoginForm()
    {
        Text = "Nova Era Admin - Login";
        Size = new Size(400, 350);
        StartPosition = FormStartPosition.CenterScreen;
        FormBorderStyle = FormBorderStyle.FixedDialog;
        MaximizeBox = false;

        var panel = new FlowLayoutPanel
        {
            Dock = DockStyle.Fill,
            FlowDirection = FlowDirection.TopDown,
            Padding = new Padding(40, 30, 40, 30),
            WrapContents = false
        };

        var title = new Label { Text = "🔐 Nova Era Admin", Font = new Font("Segoe UI", 16, FontStyle.Bold), Width = 300, Height = 40 };

        // URL padrão para produção
        _urlBox.Text = string.IsNullOrEmpty(Properties.Settings.Default.ApiUrl) 
            ? "https://novaera-api.squareweb.app" 
            : Properties.Settings.Default.ApiUrl;
        _keyBox.Text = Properties.Settings.Default.ApiKey;
        _secretBox.Text = Properties.Settings.Default.ApiSecret;
        _rememberBox.Checked = !string.IsNullOrEmpty(_keyBox.Text);

        _loginBtn.Click += async (s, e) => await LoginAsync();

        panel.Controls.AddRange([title, _urlBox, _keyBox, _secretBox, _rememberBox, _loginBtn, _statusLabel]);
        Controls.Add(panel);

        AcceptButton = _loginBtn;
    }

    private async Task LoginAsync()
    {
        _loginBtn.Enabled = false;
        _statusLabel.Text = "Conectando...";
        _statusLabel.ForeColor = Color.Blue;

        var client = new ApiClient
        {
            BaseUrl = string.IsNullOrWhiteSpace(_urlBox.Text) ? "http://localhost:5000" : _urlBox.Text.Trim(),
            ApiKey = _keyBox.Text.Trim(),
            ApiSecret = _secretBox.Text.Trim()
        };

        if (await client.LoginAsync())
        {
            if (_rememberBox.Checked)
            {
                Properties.Settings.Default.ApiUrl = client.BaseUrl;
                Properties.Settings.Default.ApiKey = client.ApiKey;
                Properties.Settings.Default.ApiSecret = client.ApiSecret;
                Properties.Settings.Default.Save();
            }
            else
            {
                Properties.Settings.Default.Reset();
            }

            Client = client;
            DialogResult = DialogResult.OK;
            Close();
        }
        else
        {
            _statusLabel.Text = "❌ Falha na autenticação";
            _statusLabel.ForeColor = Color.Red;
            _loginBtn.Enabled = true;
        }
    }
}
