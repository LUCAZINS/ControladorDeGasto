using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TesteMaxi.Dto;
using TesteMaxi.service;

namespace TesteMaxi.controllers;

[ApiController]
[Route("api/admin/pessoas")]
[Authorize(Roles = "Admin")]
public class AdminPessoasController : ControllerBase
{
    private readonly PessoaService _pessoaService;

    public AdminPessoasController(PessoaService pessoaService)
    {
        _pessoaService = pessoaService;
    }

    [HttpGet]
    public async Task<IActionResult> ListarMinhasPessoas()
    {
        try
        {
            var adminId = ObterAdminId();

            var pessoas = await _pessoaService.ListarPorAdminAsync(adminId);

            return Ok(new
            {
                message = "Pessoas do admin autenticado.",
                pessoas
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Ocorreu um erro ao listar as pessoas." });
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> BuscarPessoaPorId([FromRoute] int id)
    {
        try
        {
            var adminId = ObterAdminId();

            var pessoa = await _pessoaService.BuscarPorIdDoAdminAsync(adminId, id);

            return Ok(pessoa);
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
            return StatusCode(500, new { message = "Ocorreu um erro ao buscar a pessoa." });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CriarPessoa([FromBody] RegistrarPessoaPorAdminDto dto)
    {
        try
        {
            var adminIdTexto = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(adminIdTexto, out var adminId))
            {
                return Unauthorized(new { message = "Administrador não autenticado." });
            }

            var pessoa = await _pessoaService.CriarPorAdminAsync(adminId, dto);

            return StatusCode(201, new
            {
                message = "Pessoa criada com sucesso.",
                pessoa = new { pessoa.Id, pessoa.Nome, pessoa.Email }
            });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Ocorreu um erro ao criar a pessoa." });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> AtualizarPessoa([FromRoute] int id, [FromBody] AtualizarPessoaDto dto)
    {
        try
        {
            var adminId = ObterAdminId();

            var pessoaAtualizada = await _pessoaService.AtualizarPorAdminAsync(adminId, id, dto);

            return Ok(new
            {
                message = "Pessoa atualizada com sucesso.",
                pessoa = pessoaAtualizada
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
            return StatusCode(500, new { message = "Ocorreu um erro ao atualizar a pessoa." });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> ExcluirPessoa([FromRoute] int id)
    {
        try
        {
            var adminId = ObterAdminId();

            await _pessoaService.ExcluirPorAdminAsync(adminId, id);

            return Ok(new
            {
                message = "Pessoa excluída com sucesso."
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
            return StatusCode(500, new { message = "Ocorreu um erro ao excluir a pessoa." });
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
