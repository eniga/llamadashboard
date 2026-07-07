using LlamaDashboard.Services;
using LlamaDashboard.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

builder.Services.AddSingleton<IConfigService, ConfigService>();
builder.Services.AddSingleton<IGpuService, NvidiaSmiGpuService>();
builder.Services.AddScoped<ILlamaCppService>(sp =>
{
    var config = sp.GetRequiredService<IConfigService>();
    return new LlamaCppService(config.GetLlamaCppUrl(), config.GetLlamaCppApiKey());
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAntiforgery();

app.MapRazorPages();
app.MapRazorComponents<LlamaDashboard.App>()
   .AddInteractiveServerRenderMode();

app.Run();
