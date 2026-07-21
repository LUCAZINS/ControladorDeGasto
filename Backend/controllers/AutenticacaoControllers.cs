using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TesteMaxi.Dto;
using TesteMaxi.service;

namespace TesteMaxi.controllers;

[ApiController]
[Route("api/autenticacao")]
public class AutenticacaoController : ControllerBase
{
    private readonly CookieAuthService _cookieAuthService;
    private readonly AuthService _authService;

    public AutenticacaoController(
        CookieAuthService cookieAuthService,
        AuthService authService)
    {
        _cookieAuthService = cookieAuthService;
        _authService = authService;
    }

    [HttpPost("registrar")]
    public async Task<IActionResult> Registrar(
        [FromBody] RegistrarPessoasDto dto)
    {
        try
        {
            var pessoa = await _authService.RegistrarUsuarioAsync(dto);

            await _cookieAuthService.SignInPessoaAsync(pessoa.Id, pessoa.Nome, pessoa.Email);

            return StatusCode(201, new
            {
                message = "Usuário registrado e autenticado com sucesso.",
                usuario = new
                {
                    pessoa.Id,
                    pessoa.Nome,
                    pessoa.Email
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
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        try
        {
            var pessoa = await _authService.LoginPessoaAsync(dto);

            await _cookieAuthService.SignInPessoaAsync(
                pessoa.Id,
                pessoa.Nome,
                pessoa.Email,
                dto.RememberMe
            );

            return Ok(new
            {
                message = "Autenticado com sucesso.",
                usuario = new
                {
                    pessoa.Id,
                    pessoa.Nome,
                    pessoa.Email
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
        catch (Exception)
        {
            return StatusCode(500, new
            {
                message = "Ocorreu um erro ao realizar o login."
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