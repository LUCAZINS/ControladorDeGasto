using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using TesteMaxi.context;
using TesteMaxi.service;

var builder = WebApplication.CreateBuilder(args);

// Banco de dados
builder.Services.AddDbContext<TesteContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("ConexaoPadrao"))
    .EnableSensitiveDataLogging());

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173", "http://localhost:5174")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Controllers
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new()
    {
        Title = "TesteMaxi API",
        Version = "v1"
    });
});

// Services
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<CookieAuthService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<PessoaService>();
builder.Services.AddScoped<AdminAuthService>();
builder.Services.AddScoped<TransacaoService>();
// Autenticação por cookie
builder.Services
    .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
{
    options.LoginPath = "/api/autenticacao/login";
    options.LogoutPath = "/api/autenticacao/logout";

    options.LoginPath = "/api/admin/autenticacao/login";
    options.LogoutPath = "/api/admin/autenticacao/logout";

    options.Cookie.Name = "TesteMaxiAuth";
    options.Cookie.HttpOnly = true;

    options.Cookie.SecurePolicy =
        builder.Environment.IsDevelopment()
            ? CookieSecurePolicy.SameAsRequest
            : CookieSecurePolicy.Always;

    options.Cookie.SameSite =
        builder.Environment.IsDevelopment()
            ? SameSiteMode.Lax
            : SameSiteMode.None;

    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode =
            StatusCodes.Status401Unauthorized;

        return Task.CompletedTask;
    };

    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode =
            StatusCodes.Status403Forbidden;

        return Task.CompletedTask;
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("Frontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();