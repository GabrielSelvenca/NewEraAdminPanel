using NovaEraAdmin.Services;

namespace NovaEraAdmin.Forms;

public class LoginForm : Form
{
    private const string API_URL = "https://neweraapi.squareweb.app";
    
    private readonly TextBox _emailBox = new() { PlaceholderText = "Email", Width = 300 };
    private readonly TextBox _passwordBox = new() { PlaceholderText = "Senha", Width = 300, UseSystemPasswordChar = true };
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

        _emailBox.Text = Properties.Settings.Default.Email;
        _passwordBox.Text = Properties.Settings.Default.Password;
        _rememberBox.Checked = !string.IsNullOrEmpty(_emailBox.Text);

        _loginBtn.Click += async (s, e) => await LoginAsync();

        panel.Controls.AddRange([title, _emailBox, _passwordBox, _rememberBox, _loginBtn, _statusLabel]);
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
            BaseUrl = API_URL,
            Email = _emailBox.Text.Trim(),
            Password = _passwordBox.Text.Trim()
        };

        if (await client.LoginAsync())
        {
            if (_rememberBox.Checked)
            {
                Properties.Settings.Default.Email = client.Email;
                Properties.Settings.Default.Password = client.Password;
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
            _statusLabel.Text = "❌ Email ou senha inválidos";
            _statusLabel.ForeColor = Color.Red;
            _loginBtn.Enabled = true;
        }
    }
}
