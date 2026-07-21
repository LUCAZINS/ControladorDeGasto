using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TesteMaxi.Dto;
using TesteMaxi.service;

[ApiController]
[Route("api/admin/autenticacao")]
public class AdminAutenticacaoController : ControllerBase
{
    private readonly AdminAuthService _adminAuthService;
    private readonly CookieAuthService _cookieAuthService;

    public AdminAutenticacaoController(
        AdminAuthService adminAuthService,
        CookieAuthService cookieAuthService)
    {
        _adminAuthService = adminAuthService;
        _cookieAuthService = cookieAuthService;
    }

    [HttpPost("registrar")]
    public async Task<IActionResult> Registrar([FromBody] RegistrarAdminDto dto)
    {
        try
        {
            var admin = await _adminAuthService.RegistrarAdminAsync(dto);

            await _cookieAuthService.SignInAdminAsync(admin.Id, admin.Nome ?? string.Empty, admin.Email ?? string.Empty, true);

            return StatusCode(201, new
            {
                message = "Administrador registrado e autenticado com sucesso.",
                admin = new
                {
                    admin.Id,
                    admin.Nome,
                    admin.Email
                }
            });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
        catch (Exception)
        {
            return StatusCode(500, new
            {
                message = "Ocorreu um erro ao registrar o usuário."
            });
        }
    
    }
    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginDto dto)
    {
        try
        {
            var admin = await _adminAuthService.LoginAsync(dto);

            await _cookieAuthService.SignInAdminAsync(
                admin.Id,
                admin.Nome,
                admin.Email,
                dto.RememberMe
            );

            return Ok(new
            {
                message = "Administrador autenticado.",
                admin = new
                {
                    admin.Id,
                    admin.Nome,
                    admin.Email
                }
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
    }
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(
            CookieAuthenticationDefaults.AuthenticationScheme
        );

        return Ok(new
        {
            message = "Logout efetuado com sucesso."
        });
    }

[Authorize]
[HttpGet("status")]
public IActionResult Status()
{
    var idClaim = User.FindFirstValue(
        ClaimTypes.NameIdentifier
    );

    var nome = User.FindFirstValue(
        ClaimTypes.Name
    );

    var email = User.FindFirstValue(
        ClaimTypes.Email
    );

    var tipoUsuario =
        User.FindFirstValue("TipoUsuario")
        ?? User.FindFirstValue(ClaimTypes.Role);

    if (string.IsNullOrWhiteSpace(idClaim))
    {
        return Unauthorized(new
        {
            message = "Usuário não autenticado."
        });
    }

    return Ok(new
    {
        usuario = new
        {
            id = int.Parse(idClaim),
            nome,
            email,
            tipoUsuario
        }
    });
}
}