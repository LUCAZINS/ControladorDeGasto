using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TesteMaxi.Dto;
using TesteMaxi.service;

namespace TesteMaxi.controllers;

[ApiController]
[Route("api/pessoas")]
[Authorize(Roles = "Pessoa")]
public class PessoasController : ControllerBase
{
    private readonly PessoaService _pessoaService;

    public PessoasController(PessoaService pessoaService)
    {
        _pessoaService = pessoaService;
    }

    [HttpGet("me")]
    public async Task<IActionResult> BuscarMeuPerfil()
    {
        try
        {
            var pessoaId = ObterPessoaId();

            var pessoa = await _pessoaService.BuscarPorIdAsync(pessoaId);

            return Ok(pessoa);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
        catch (Exception)
        {
            return StatusCode(500, new
            {
                message = "Ocorreu um erro ao buscar o perfil."
            });
        }
    }

    [HttpPut("me")]
    public async Task<IActionResult> AtualizarMeuPerfil(
        [FromBody] AtualizarPessoaDto dto)
    {
        try
        {
            var pessoaId = ObterPessoaId();

            var pessoaAtualizada = await _pessoaService
                .AtualizarAsync(pessoaId, dto);

            return Ok(new
            {
                message = "Perfil atualizado com sucesso.",
                pessoa = pessoaAtualizada
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
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
                message = "Ocorreu um erro ao atualizar o perfil."
            });
        }
    }

    [HttpDelete("me")]
    public async Task<IActionResult> ExcluirMinhaConta()
    {
        try
        {
            var pessoaId = ObterPessoaId();

            await _pessoaService.ExcluirAsync(pessoaId);

            return Ok(new
            {
                message = "Conta excluída com sucesso."
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
        catch (Exception)
        {
            return StatusCode(500, new
            {
                message = "Ocorreu um erro ao excluir a conta."
            });
        }
    }

    private int ObterPessoaId()
    {
        var pessoaIdTexto = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        );

        if (!int.TryParse(pessoaIdTexto, out var pessoaId))
        {
            throw new UnauthorizedAccessException(
                "Usuário não autenticado."
            );
        }

        return pessoaId;
    }
}