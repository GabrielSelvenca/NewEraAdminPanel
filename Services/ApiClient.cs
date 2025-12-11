using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace NovaEraAdmin.Services;

public class ApiClient
{
    private readonly HttpClient _client = new();
    private string? _token;
    private DateTime _tokenExpires;

    public string BaseUrl { get; set; } = "http://localhost:5000";
    public string? ApiKey { get; set; }
    public string? ApiSecret { get; set; }
    public bool IsAuthenticated => !string.IsNullOrEmpty(_token) && DateTime.Now < _tokenExpires;

    public async Task<bool> LoginAsync()
    {
        if (string.IsNullOrEmpty(ApiKey) || string.IsNullOrEmpty(ApiSecret))
            return false;

        try
        {
            var payload = JsonSerializer.Serialize(new { apiKey = ApiKey, apiSecret = ApiSecret });
            var content = new StringContent(payload, Encoding.UTF8, "application/json");
            var response = await _client.PostAsync($"{BaseUrl}/api/auth/login", content);

            if (!response.IsSuccessStatusCode) return false;

            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<LoginResponse>(json);

            if (result?.token == null) return false;

            _token = result.token;
            _tokenExpires = DateTime.Now.AddHours(23);
            return true;
        }
        catch { return false; }
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

    private record LoginResponse(string? token, string? expiresAt);
}
