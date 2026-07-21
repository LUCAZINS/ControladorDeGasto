using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace TesteMaxi.service
{
    public class CookieAuthService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CookieAuthService(IHttpContextAccessor accessor)
        {
            _httpContextAccessor = accessor;
        }

       public async Task SignInPessoaAsync(
        int pessoaId, 
       string pessoaName,
       string pessoaEmail,
       bool isPersistent = true)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier,pessoaId.ToString()),
                new Claim( ClaimTypes.Name,pessoaName ?? string.Empty), 
                new Claim(ClaimTypes.Email, pessoaEmail ?? string.Empty),
                new Claim(ClaimTypes.Role,"Pessoa"),
                new Claim("TipoUsuario","Pessoa")
            };

            var identity = new ClaimsIdentity(
                claims,
                CookieAuthenticationDefaults.AuthenticationScheme
            );

            var principal = new ClaimsPrincipal(identity);

            var propriedades = new AuthenticationProperties
            {
                IsPersistent = isPersistent
            };

            if (isPersistent)
            {
                propriedades.ExpiresUtc = DateTimeOffset.UtcNow.AddDays(30);
            }

            var httpContext = _httpContextAccessor.HttpContext
                ?? throw new InvalidOperationException(
                    "Não foi possível acessar o contexto HTTP."
                );

            await httpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                principal,
                propriedades
            );
        }

        public async Task SignInAdminAsync(
            int adminId,
         string adminName, 
         string adminEmail, 
         bool isPersistent = true)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, adminId.ToString()),
                new Claim( ClaimTypes.Name,adminName ?? string.Empty), 
                new Claim( ClaimTypes.Email, adminEmail ?? string.Empty),
                new Claim( ClaimTypes.Role, "Admin"),
                new Claim("TipoUsuario", "Admin")
            };

            var identity = new ClaimsIdentity(
                claims, CookieAuthenticationDefaults.AuthenticationScheme);

            var principal = new ClaimsPrincipal(identity);

            var properties = new AuthenticationProperties
            {
                IsPersistent = isPersistent
            };

            if (isPersistent)
            {
                properties.ExpiresUtc = DateTimeOffset.UtcNow.AddDays(30);
            }

            var httpContext = _httpContextAccessor.HttpContext
                ?? throw new InvalidOperationException(
                    "Não foi possível acessar o contexto HTTP."
                );

            await httpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                principal,
                properties
            );
        }
    }
}