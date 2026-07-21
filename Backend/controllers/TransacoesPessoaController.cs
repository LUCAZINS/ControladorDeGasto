using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TesteMaxi.Dto;
using TesteMaxi.service;

namespace TesteMaxi.controllers;

[ApiController]
[Route("api/minhas-transacoes")]
[Authorize(Roles = "Pessoa")]
public class TransacoesPessoaController : ControllerBase
{
    private readonly TransacaoService _transacaoService;

    public TransacoesPessoaController(TransacaoService transacaoService)
    {
        _transacaoService = transacaoService;
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] CriarTransacaoDto dto)
    {
        try
        {
            var pessoaId = ObterPessoaId();
            var transacao = await _transacaoService.CriarParaPessoaAsync(pessoaId, dto);

            return StatusCode(201, new
            {
                message = "Transação criada com sucesso.",
                transacao
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Ocorreu um erro ao criar a transação." });
        }
    }

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        try
        {
            var pessoaId = ObterPessoaId();
            var transacoes = await _transacaoService.ListarPorPessoaAsync(pessoaId);

            return Ok(new
            {
                message = "Transações da pessoa autenticada.",
                transacoes
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Ocorreu um erro ao listar as transações." });
        }
    }

    [HttpGet("totais")]
    public async Task<IActionResult> Totais()
    {
        try
        {
            var pessoaId = ObterPessoaId();
            var totais = await _transacaoService.ConsultarTotaisPorPessoaAsync(pessoaId);

            return Ok(new
            {
                message = "Totais da pessoa autenticada.",
                totais
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Ocorreu um erro ao consultar os totais." });
        }
    }
    [HttpPut("{id:guid}")]
public async Task<IActionResult> Editar(
    Guid id,
    [FromBody] AtualizarTransacaoDto dto)
{
    try
    {
        var pessoaId = ObterPessoaId();

        var transacao = await _transacaoService
            .EditarParaPessoaAsync(pessoaId, id, dto);

        return Ok(new
        {
            message = "Transação atualizada com sucesso.",
            transacao
        });
    }
    catch (UnauthorizedAccessException ex)
    {
        return Unauthorized(new { message = ex.Message });
    }
    catch (KeyNotFoundException ex)
    {
        return NotFound(new { message = ex.Message });
    }
    catch (InvalidOperationException ex)
    {
        return Conflict(new { message = ex.Message });
    }
    catch (Exception)
    {
        return StatusCode(500, new
        {
            message = "Ocorreu um erro ao atualizar a transação."
        });
    }
}

[HttpDelete("{id:guid}")]
public async Task<IActionResult> Excluir(Guid id)
{
    try
    {
        var pessoaId = ObterPessoaId();

        await _transacaoService.ExcluirParaPessoaAsync(pessoaId, id);

        return Ok(new
        {
            message = "Transação excluída com sucesso."
        });
    }
    catch (UnauthorizedAccessException ex)
    {
        return Unauthorized(new { message = ex.Message });
    }
    catch (KeyNotFoundException ex)
    {
        return NotFound(new { message = ex.Message });
    }
    catch (InvalidOperationException ex)
    {
        return Conflict(new { message = ex.Message });
    }
    catch (Exception)
    {
        return StatusCode(500, new
        {
            message = "Ocorreu um erro ao excluir a transação."
        });
    }
}

    private int ObterPessoaId()
    {
        var pessoaIdTexto = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(pessoaIdTexto, out var pessoaId))
        {
            throw new UnauthorizedAccessException("Pessoa não autenticada.");
        }

        return pessoaId;
    }
}