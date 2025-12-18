using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace NovaEraAdmin.Services;

public class ApiClient
{
    private readonly HttpClient _client = new();
    private string? _token;
    private DateTime _tokenExpires;

    public string BaseUrl { get; set; } = "https://neweraapi.squareweb.app";
    public string? Email { get; set; }
    public string? Password { get; set; }
    public string? UserName { get; private set; }
    public string? UserRole { get; private set; }
    public bool IsAuthenticated => !string.IsNullOrEmpty(_token) && DateTime.Now < _tokenExpires;

    public string? LastError { get; private set; }

    public async Task<bool> LoginAsync()
    {
        LastError = null;
        
        if (string.IsNullOrEmpty(Email) || string.IsNullOrEmpty(Password))
        {
            LastError = "Email ou senha vazios";
            return false;
        }

        try
        {
            var payload = JsonSerializer.Serialize(new { email = Email, password = Password });
            var content = new StringContent(payload, Encoding.UTF8, "application/json");
            var response = await _client.PostAsync($"{BaseUrl}/api/admin/login", content);

            var json = await response.Content.ReadAsStringAsync();
            
            if (!response.IsSuccessStatusCode)
            {
                LastError = $"API: {response.StatusCode} - {json}";
                return false;
            }

            var result = JsonSerializer.Deserialize<AdminLoginResponse>(json);

            if (result?.token == null)
            {
                LastError = "Token não retornado";
                return false;
            }

            _token = result.token;
            _tokenExpires = DateTime.Now.AddHours(23);
            UserName = result.user?.name;
            UserRole = result.user?.role;
            return true;
        }
        catch (Exception ex)
        {
            LastError = ex.Message;
            return false;
        }
    }

    public async Task<T?> GetAsync<T>(string endpoint)
    {
        if (!IsAuthenticated && !await LoginAsync()) return default;

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);
        var response = await _client.GetAsync($"{BaseUrl}{endpoint}");
        if (!response.IsSuccessStatusCode) return default;

        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<T>(json);
    }

    public async Task<T?> PostAsync<T>(string endpoint, object data)
    {
        if (!IsAuthenticated && !await LoginAsync()) return default;

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);
        var payload = JsonSerializer.Serialize(data);
        var content = new StringContent(payload, Encoding.UTF8, "application/json");
        var response = await _client.PostAsync($"{BaseUrl}{endpoint}", content);

        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<T>(json);
    }

    public async Task<bool> PostAsync(string endpoint, object data)
    {
        if (!IsAuthenticated && !await LoginAsync()) return false;

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);
        var payload = JsonSerializer.Serialize(data);
        var content = new StringContent(payload, Encoding.UTF8, "application/json");
        var response = await _client.PostAsync($"{BaseUrl}{endpoint}", content);
        return response.IsSuccessStatusCode;
    }

    public async Task<T?> DeleteAsync<T>(string endpoint)
    {
        if (!IsAuthenticated && !await LoginAsync()) return default;

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);
        var response = await _client.DeleteAsync($"{BaseUrl}{endpoint}");
        if (!response.IsSuccessStatusCode) return default;

        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<T>(json);
    }

    public async Task<bool> DeleteAsync(string endpoint)
    {
        if (!IsAuthenticated && !await LoginAsync()) return false;

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);
        var response = await _client.DeleteAsync($"{BaseUrl}{endpoint}");
        return response.IsSuccessStatusCode;
    }

    public async Task<T?> PutAsync<T>(string endpoint, object data)
    {
        if (!IsAuthenticated && !await LoginAsync()) return default;

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);
        var payload = JsonSerializer.Serialize(data);
        var content = new StringContent(payload, Encoding.UTF8, "application/json");
        var response = await _client.PutAsync($"{BaseUrl}{endpoint}", content);

        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<T>(json);
    }

    public async Task PutAsync(string endpoint, object data)
    {
        if (!IsAuthenticated && !await LoginAsync()) return;

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);
        var payload = JsonSerializer.Serialize(data);
        var content = new StringContent(payload, Encoding.UTF8, "application/json");
        await _client.PutAsync($"{BaseUrl}{endpoint}", content);
    }

    private record AdminLoginResponse(string? token, AdminUserInfo? user, int? expiresIn);
    private record AdminUserInfo(int id, string? email, string? name, string? role);
}
