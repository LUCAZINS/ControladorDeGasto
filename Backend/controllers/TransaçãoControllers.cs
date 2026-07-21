using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TesteMaxi.Dto;
using TesteMaxi.service;

namespace TesteMaxi.controllers;
[ApiController]
[Route("api/transacoes")]
[Authorize(Roles = "Admin")]
public class TransaçãoControllers : ControllerBase
{
	private readonly TransacaoService _transacaoService;

	public TransaçãoControllers(TransacaoService transacaoService)
	{
		_transacaoService = transacaoService;
	}

	[HttpPost]
	public async Task<IActionResult> Criar([FromBody] CriarTransacaoDto dto)
	{
		try
		{
			var adminId = ObterAdminId();
			var transacao = await _transacaoService.CriarAsync(adminId, dto);

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
			var adminId = ObterAdminId();
			var transacoes = await _transacaoService.ListarAsync(adminId);

			return Ok(new
			{
				message = "Transações do admin autenticado.",
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
			var adminId = ObterAdminId();
			var totais = await _transacaoService.ConsultarTotaisAsync(adminId);

			return Ok(new
			{
				message = "Totais calculados com sucesso.",
				totais
			});
		}
		catch (UnauthorizedAccessException ex)
		{
			return Unauthorized(new { message = ex.Message });
		}
		catch (Exception)
		{
			return StatusCode(500, new { message = "Ocorreu um erro ao consultar os totais." });
		}
	}
	
	[HttpPut("{id:guid}")]
public async Task<IActionResult> Editar(Guid id, [FromBody] AtualizarTransacaoDto dto)
{
    try
    {
        var adminId = ObterAdminId();

        var transacao = await _transacaoService.EditarAsync(adminId, id, dto);

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
        var adminId = ObterAdminId();

        await _transacaoService.ExcluirAsync(adminId, id);

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

	private int ObterAdminId()
	{
		var adminIdTexto = User.FindFirstValue(ClaimTypes.NameIdentifier);

		if (!int.TryParse(adminIdTexto, out var adminId))
		{
			throw new UnauthorizedAccessException("Administrador não autenticado.");
		}

		return adminId;
	}
}
