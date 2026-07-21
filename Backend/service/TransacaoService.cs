using Microsoft.EntityFrameworkCore;
using TesteMaxi.Dto;
using TesteMaxi.context;
using TesteMaxi.models;

namespace TesteMaxi.service
{
    public class TransacaoService
    {
        private readonly TesteContext _context;

        public TransacaoService(TesteContext context)
        {
            _context = context;
        }

        public async Task<TransacaoRespostaDto> CriarAsync(
            int adminId,
            CriarTransacaoDto dto)
        {
            var pessoa = await _context.Pessoas
                .FirstOrDefaultAsync(p => p.Id == dto.PessoaId && p.AdminId == adminId);

            if (pessoa == null)
                throw new KeyNotFoundException("Pessoa não encontrada.");

            var idade = CalcularIdade(pessoa.DataNascimento);
            if (idade < 18 && dto.TipoTransacao == EnumTipoTransacao.receita)
            {
                throw new InvalidOperationException(
                    "Para pessoas menores de 18 anos, apenas despesas podem ser cadastradas.");
            }

            var transacao = new TransacaoModels
            {
                Descricao = dto.Descricao.Trim(),
                Valor = dto.Valor,
                TipoTransacao = dto.TipoTransacao,
                PessoaId = pessoa.Id
            };

            _context.Transacoes.Add(transacao);
            await _context.SaveChangesAsync();

            return await ObterRespostaAsync(transacao.Id);
        }

        public async Task<TransacaoRespostaDto> CriarParaPessoaAsync(
            int pessoaId,
            CriarTransacaoDto dto)
        {
            var pessoa = await _context.Pessoas
                .FirstOrDefaultAsync(p => p.Id == pessoaId);

            if (pessoa == null)
                throw new KeyNotFoundException("Pessoa não encontrada.");

            var idade = CalcularIdade(pessoa.DataNascimento);
            if (idade < 18 && dto.TipoTransacao == EnumTipoTransacao.receita)
            {
                throw new InvalidOperationException(
                    "Para pessoas menores de 18 anos, apenas despesas podem ser cadastradas.");
            }

            var transacao = new TransacaoModels
            {
                Descricao = dto.Descricao.Trim(),
                Valor = dto.Valor,
                TipoTransacao = dto.TipoTransacao,
                PessoaId = pessoa.Id
            };

            _context.Transacoes.Add(transacao);
            await _context.SaveChangesAsync();

            return await ObterRespostaAsync(transacao.Id);
        }


        public async Task<List<TransacaoRespostaDto>> ListarAsync(int adminId)
        {
            var transacoes = await _context.Transacoes
                .AsNoTracking()
                .Include(t => t.Pessoa)
                .Where(t => t.Pessoa != null && t.Pessoa.AdminId == adminId)
                .OrderByDescending(t => t.Id)
                .ToListAsync();

            return transacoes
                .Select(MapearParaResposta)
                .ToList();
        }

        public async Task<List<TransacaoRespostaDto>> ListarPorPessoaAsync(int pessoaId)
        {
            var transacoes = await _context.Transacoes
                .AsNoTracking()
                .Include(t => t.Pessoa)
                .Where(t => t.PessoaId == pessoaId)
                .OrderByDescending(t => t.Id)
                .ToListAsync();

            return transacoes
                .Select(MapearParaResposta)
                .ToList();
        }

        public async Task<ConsultaTotaisDto> ConsultarTotaisAsync(int adminId)
        {
            var pessoas = await _context.Pessoas
                .AsNoTracking()
                .Where(p => p.AdminId == adminId)
                .OrderBy(p => p.Nome)
                .ToListAsync();

            var transacoes = await _context.Transacoes
                .AsNoTracking()
                .Include(t => t.Pessoa)
                .Where(t => t.Pessoa != null && t.Pessoa.AdminId == adminId)
                .ToListAsync();

            var totaisPessoas = pessoas.Select(pessoa =>
            {
                var receitas = transacoes
                    .Where(t => t.PessoaId == pessoa.Id && t.TipoTransacao == EnumTipoTransacao.receita)
                    .Sum(t => t.Valor);

                var despesas = transacoes
                    .Where(t => t.PessoaId == pessoa.Id && t.TipoTransacao == EnumTipoTransacao.despesa)
                    .Sum(t => t.Valor);

                return new TotalPessoaDto
                {
                    PessoaId = pessoa.Id,
                    Nome = pessoa.Nome,
                    TotalReceitas = receitas,
                    TotalDespesas = despesas,
                    Saldo = receitas - despesas
                };
            }).ToList();

            var totalGeralReceitas = totaisPessoas.Sum(p => p.TotalReceitas);
            var totalGeralDespesas = totaisPessoas.Sum(p => p.TotalDespesas);

            return new ConsultaTotaisDto
            {
                Pessoas = totaisPessoas,
                TotalGeralReceitas = totalGeralReceitas,
                TotalGeralDespesas = totalGeralDespesas,
                SaldoLiquidoGeral = totalGeralReceitas - totalGeralDespesas
            };
        }

        public async Task<ConsultaTotaisDto> ConsultarTotaisPorPessoaAsync(int pessoaId)
        {
            var pessoa = await _context.Pessoas
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == pessoaId);

            if (pessoa == null)
                throw new KeyNotFoundException("Pessoa não encontrada.");

            var transacoes = await _context.Transacoes
                .AsNoTracking()
                .Where(t => t.PessoaId == pessoaId)
                .ToListAsync();

            var totalReceitas = transacoes
                .Where(t => t.TipoTransacao == EnumTipoTransacao.receita)
                .Sum(t => t.Valor);

            var totalDespesas = transacoes
                .Where(t => t.TipoTransacao == EnumTipoTransacao.despesa)
                .Sum(t => t.Valor);

            return new ConsultaTotaisDto
            {
                Pessoas =
                [
                    new TotalPessoaDto
                    {
                        PessoaId = pessoa.Id,
                        Nome = pessoa.Nome,
                        TotalReceitas = totalReceitas,
                        TotalDespesas = totalDespesas,
                        Saldo = totalReceitas - totalDespesas
                    }
                ],
                TotalGeralReceitas = totalReceitas,
                TotalGeralDespesas = totalDespesas,
                SaldoLiquidoGeral = totalReceitas - totalDespesas
            };
        }

        private async Task<TransacaoRespostaDto> ObterRespostaAsync(Guid transacaoId)
        {
            var transacao = await _context.Transacoes
                .AsNoTracking()
                .Include(t => t.Pessoa)
                .FirstAsync(t => t.Id == transacaoId);

            return MapearParaResposta(transacao);
        }

        private static TransacaoRespostaDto MapearParaResposta(TransacaoModels transacao)
        {
            return new TransacaoRespostaDto
            {
                Id = transacao.Id,
                Descricao = transacao.Descricao,
                Valor = transacao.Valor,
                TipoTransacao = transacao.TipoTransacao.ToString(),
                PessoaId = transacao.PessoaId,
                PessoaNome = transacao.Pessoa?.Nome
            };
        }

        private static int CalcularIdade(DateOnly dataNascimento)
        {
            var hoje = DateOnly.FromDateTime(DateTime.Today);

            var idade = hoje.Year - dataNascimento.Year;

            if (dataNascimento > hoje.AddYears(-idade))
            {
                idade--;
            }

            return idade;
        }
        public async Task<TransacaoModels> EditarAsync(
            int adminId,
            Guid transacaoId,
            AtualizarTransacaoDto dto)
        {
            var admin = await _context.Admins.FindAsync(adminId);

            if (admin == null)
                throw new UnauthorizedAccessException("Administrador não encontrado.");

            var transacao = await _context.Transacoes
                .FirstOrDefaultAsync(t => t.Id == transacaoId);

            if (transacao == null)
                throw new KeyNotFoundException("Transação não encontrada.");

            transacao.Descricao = dto.Descricao;
            transacao.Valor = dto.Valor;
            transacao.TipoTransacao = dto.TipoTransacao;

            await _context.SaveChangesAsync();

            return transacao;
        }
        
        public async Task<TransacaoRespostaDto> EditarParaPessoaAsync(
    int pessoaId,
    Guid transacaoId,
    AtualizarTransacaoDto dto)
    {
    var pessoa = await _context.Pessoas.FindAsync(pessoaId);

    if (pessoa == null)
        throw new UnauthorizedAccessException("Pessoa não encontrada.");

    var transacao = await _context.Transacoes
        .FirstOrDefaultAsync(t =>
            t.Id == transacaoId &&
            t.PessoaId == pessoaId);

    if (transacao == null)
        throw new KeyNotFoundException("Transação não encontrada.");

    var idade = CalcularIdade(pessoa.DataNascimento);

    if (idade < 18 &&
        dto.TipoTransacao == EnumTipoTransacao.receita)
    {
        throw new InvalidOperationException(
            "Para pessoas menores de 18 anos, apenas despesas são permitidas.");
    }

    transacao.Descricao = dto.Descricao.Trim();
    transacao.Valor = dto.Valor;
    transacao.TipoTransacao = dto.TipoTransacao;

    await _context.SaveChangesAsync();

    return await ObterRespostaAsync(transacao.Id);
    }




        public async Task ExcluirAsync(int adminId, Guid transacaoId)
    {
        var admin = await _context.Admins.FindAsync(adminId);

        if (admin == null)
            throw new UnauthorizedAccessException("Administrador não encontrado.");

        var transacao = await _context.Transacoes
            .FirstOrDefaultAsync(t => t.Id == transacaoId);

        if (transacao == null)
            throw new KeyNotFoundException("Transação não encontrada.");

        _context.Transacoes.Remove(transacao);

        await _context.SaveChangesAsync();
    }
    public async Task ExcluirParaPessoaAsync(
    int pessoaId,
    Guid transacaoId)
    {
    var pessoaExiste = await _context.Pessoas
        .AnyAsync(p => p.Id == pessoaId);

    if (!pessoaExiste)
        throw new UnauthorizedAccessException("Pessoa não encontrada.");

    var transacao = await _context.Transacoes
        .FirstOrDefaultAsync(t =>
            t.Id == transacaoId &&
            t.PessoaId == pessoaId);

    if (transacao == null)
        throw new KeyNotFoundException("Transação não encontrada.");

    _context.Transacoes.Remove(transacao);

    await _context.SaveChangesAsync();
    }
    }
    
}