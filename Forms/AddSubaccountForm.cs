using NovaEraAdmin.Models;
using NovaEraAdmin.Services;

namespace NovaEraAdmin.Forms;

public class AddSubaccountForm : Form
{
    private readonly ApiClient _client;
    private readonly TextBox _nameBox = new() { PlaceholderText = "Nome completo *", Width = 350 };
    private readonly TextBox _cpfBox = new() { PlaceholderText = "CPF (apenas números) *", Width = 350 };
    private readonly TextBox _emailBox = new() { PlaceholderText = "Email *", Width = 350 };
    private readonly TextBox _phoneBox = new() { PlaceholderText = "Telefone (opcional)", Width = 350 };
    private readonly TextBox _addressBox = new() { PlaceholderText = "Endereço (opcional)", Width = 350 };
    private readonly TextBox _numberBox = new() { PlaceholderText = "Número (opcional)", Width = 350 };
    private readonly TextBox _provinceBox = new() { PlaceholderText = "Bairro (opcional)", Width = 350 };
    private readonly TextBox _postalBox = new() { PlaceholderText = "CEP (opcional)", Width = 350 };
    private readonly Button _saveBtn = new() { Text = "💾 Cadastrar Parceiro", Width = 350, Height = 40 };
    private readonly Label _statusLabel = new() { Text = "", Width = 350 };

    public AddSubaccountForm(ApiClient client)
    {
        _client = client;
        Text = "Adicionar Parceiro (Subconta Asaas)";
        Size = new Size(450, 500);
        StartPosition = FormStartPosition.CenterParent;
        FormBorderStyle = FormBorderStyle.FixedDialog;
        MaximizeBox = false;

        var panel = new FlowLayoutPanel
        {
            Dock = DockStyle.Fill,
            FlowDirection = FlowDirection.TopDown,
            Padding = new Padding(30, 20, 30, 20),
            WrapContents = false
        };

        var title = new Label { Text = "🏦 Novo Parceiro", Font = new Font("Segoe UI", 14, FontStyle.Bold), Width = 350, Height = 35 };
        var info = new Label { Text = "O parceiro receberá pagamentos diretamente na conta bancária vinculada ao CPF.", Width = 350, Height = 40 };

        _saveBtn.Click += async (s, e) => await SaveAsync();

        panel.Controls.AddRange([title, info, _nameBox, _cpfBox, _emailBox, _phoneBox, _addressBox, _numberBox, _provinceBox, _postalBox, _saveBtn, _statusLabel]);
        Controls.Add(panel);
    }

    private async Task SaveAsync()
    {
        if (string.IsNullOrWhiteSpace(_nameBox.Text) || string.IsNullOrWhiteSpace(_cpfBox.Text) || string.IsNullOrWhiteSpace(_emailBox.Text))
        {
            _statusLabel.Text = "❌ Preencha os campos obrigatórios";
            _statusLabel.ForeColor = Color.Red;
            return;
        }

        _saveBtn.Enabled = false;
        _statusLabel.Text = "Cadastrando...";
        _statusLabel.ForeColor = Color.Blue;

        try
        {
            var request = new CreateSubaccountRequest(
                _nameBox.Text.Trim(),
                _cpfBox.Text.Trim().Replace(".", "").Replace("-", ""),
                _emailBox.Text.Trim(),
                string.IsNullOrWhiteSpace(_phoneBox.Text) ? null : _phoneBox.Text.Trim(),
                string.IsNullOrWhiteSpace(_addressBox.Text) ? null : _addressBox.Text.Trim(),
                string.IsNullOrWhiteSpace(_numberBox.Text) ? null : _numberBox.Text.Trim(),
                string.IsNullOrWhiteSpace(_provinceBox.Text) ? null : _provinceBox.Text.Trim(),
                string.IsNullOrWhiteSpace(_postalBox.Text) ? null : _postalBox.Text.Trim().Replace("-", "")
            );

            var success = await _client.PostAsync("/api/asaas/subaccounts", request);

            if (success)
            {
                MessageBox.Show("✅ Parceiro cadastrado com sucesso!\n\nEle receberá os pagamentos automaticamente.", "Sucesso", MessageBoxButtons.OK, MessageBoxIcon.Information);
                DialogResult = DialogResult.OK;
                Close();
            }
            else
            {
                _statusLabel.Text = "❌ Erro ao cadastrar";
                _statusLabel.ForeColor = Color.Red;
                _saveBtn.Enabled = true;
            }
        }
        catch (Exception ex)
        {
            _statusLabel.Text = $"❌ {ex.Message}";
            _statusLabel.ForeColor = Color.Red;
            _saveBtn.Enabled = true;
        }
    }
}
