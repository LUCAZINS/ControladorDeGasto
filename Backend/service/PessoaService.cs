using Microsoft.EntityFrameworkCore;
using TesteMaxi.context;
using TesteMaxi.Dto;
using TesteMaxi.models;
using TesteMaxi.helpers;

namespace TesteMaxi.service
{
    public class PessoaService
    {
        private readonly TesteContext _context;

        public PessoaService(TesteContext context)
        {
            _context = context;
        }

        public async Task<PessoaRespostaDto> BuscarPorIdAsync(int pessoaId)
        {
            var pessoa = await _context.Pessoas
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == pessoaId);

            if (pessoa == null)
                throw new KeyNotFoundException("Pessoa não encontrada.");

            return MapearParaResposta(pessoa);
        }

        public async Task<PessoasModels> BuscarEntidadePorIdAsync(int pessoaId)
        {
            var pessoa = await _context.Pessoas
                .FirstOrDefaultAsync(p => p.Id == pessoaId);

            if (pessoa == null)
                throw new KeyNotFoundException("Pessoa não encontrada.");

            return pessoa;
        }

        public static int CalcularIdade(DateOnly dataNascimento)
        {
            var hoje = DateOnly.FromDateTime(DateTime.Today);

            var idade = hoje.Year - dataNascimento.Year;

            if (dataNascimento > hoje.AddYears(-idade))
            {
                idade--;
            }

            return idade;
        }

        public async Task<List<PessoaRespostaDto>> ListarPorAdminAsync(int adminId)
        {
            var pessoas = await _context.Pessoas
                .AsNoTracking()
                .Where(p => p.AdminId == adminId)
                .OrderBy(p => p.Nome)
                .ToListAsync();

            return pessoas
                .Select(MapearParaResposta)
                .ToList();
        }

        public async Task<PessoaRespostaDto> BuscarPorIdDoAdminAsync(
            int adminId,
            int pessoaId)
        {
            var pessoa = await _context.Pessoas
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == pessoaId && p.AdminId == adminId);

            if (pessoa == null)
                throw new KeyNotFoundException("Pessoa não encontrada.");

            return MapearParaResposta(pessoa);
        }

        public async Task<List<PessoaRespostaDto>> ListarAsync()
        {
            var pessoas = await _context.Pessoas
                .AsNoTracking()
                .OrderBy(p => p.Nome)
                .ToListAsync();

            return pessoas
                .Select(MapearParaResposta)
                .ToList();
        }

        public async Task<PessoaRespostaDto> AtualizarAsync(
            int pessoaId,
            AtualizarPessoaDto dto)
        {
            var pessoa = await _context.Pessoas
                .FirstOrDefaultAsync(p => p.Id == pessoaId);

            if (pessoa == null)
                throw new KeyNotFoundException("Pessoa não encontrada.");

            if (!string.IsNullOrWhiteSpace(dto.Nome))
            {
                pessoa.Nome = dto.Nome.Trim();
            }

            if (dto.DataNascimento.HasValue)
            {
                if (dto.DataNascimento.Value > DateOnly.FromDateTime(DateTime.Today))
                    throw new InvalidOperationException(
                        "A data de nascimento não pode ser futura.");

                pessoa.DataNascimento = dto.DataNascimento.Value;
            }

            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                var emailNormalizado = dto.Email.Trim().ToLower();

                var emailEmUso = await _context.Pessoas.AnyAsync(p =>
                    p.Email == emailNormalizado &&
                    p.Id != pessoaId);

                if (emailEmUso)
                    throw new InvalidOperationException(
                        "Este e-mail já está sendo utilizado.");

                pessoa.Email = emailNormalizado;
            }

            await _context.SaveChangesAsync();

            return MapearParaResposta(pessoa);
        }

        public async Task<PessoaRespostaDto> AtualizarPorAdminAsync(
            int adminId,
            int pessoaId,
            AtualizarPessoaDto dto)
        {
            var pessoa = await _context.Pessoas
                .FirstOrDefaultAsync(p => p.Id == pessoaId && p.AdminId == adminId);

            if (pessoa == null)
                throw new KeyNotFoundException("Pessoa não encontrada.");

            if (!string.IsNullOrWhiteSpace(dto.Nome))
            {
                pessoa.Nome = dto.Nome.Trim();
            }

            if (dto.DataNascimento.HasValue)
            {
                if (dto.DataNascimento.Value > DateOnly.FromDateTime(DateTime.Today))
                    throw new InvalidOperationException(
                        "A data de nascimento não pode ser futura.");

                pessoa.DataNascimento = dto.DataNascimento.Value;
            }

            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                var emailNormalizado = dto.Email.Trim().ToLower();

                var emailEmUso = await _context.Pessoas.AnyAsync(p =>
                    p.Email == emailNormalizado &&
                    p.Id != pessoaId);

                if (emailEmUso)
                    throw new InvalidOperationException(
                        "Este e-mail já está sendo utilizado.");

                pessoa.Email = emailNormalizado;
            }

            await _context.SaveChangesAsync();

            return MapearParaResposta(pessoa);
        }

        public async Task ExcluirAsync(int pessoaId)
        {
            var pessoa = await _context.Pessoas
                .FirstOrDefaultAsync(p => p.Id == pessoaId);

            if (pessoa == null)
                throw new KeyNotFoundException("Pessoa não encontrada.");

            _context.Pessoas.Remove(pessoa);

            await _context.SaveChangesAsync();
        }

        public async Task ExcluirPorAdminAsync(int adminId, int pessoaId)
        {
            var pessoa = await _context.Pessoas
                .FirstOrDefaultAsync(p => p.Id == pessoaId && p.AdminId == adminId);

            if (pessoa == null)
                throw new KeyNotFoundException("Pessoa não encontrada.");

            _context.Pessoas.Remove(pessoa);

            await _context.SaveChangesAsync();
        }

        private static PessoaRespostaDto MapearParaResposta(
            PessoasModels pessoa)
        {
            return new PessoaRespostaDto
            {
                Id = pessoa.Id,
                Nome = pessoa.Nome,
                DataNascimento = pessoa.DataNascimento,
                Idade = CalcularIdade(pessoa.DataNascimento),
                Email = pessoa.Email
            };
        }

        public async Task<PessoaRespostaDto> CriarPorAdminAsync(
            int adminId,
            RegistrarPessoaPorAdminDto dto)
        {
            var emailNormalizado = dto.Email.Trim().ToLower();

            var emailEmUso = await _context.Pessoas
                .AnyAsync(p => p.Email == emailNormalizado);

            if (emailEmUso)
                throw new InvalidOperationException("Este e-mail já está sendo utilizado.");

            var salt = SenhaHelper.CreateSalt();
            var hash = SenhaHelper.HashPassword(dto.Password, salt);

            var pessoa = new PessoasModels
            {
                Nome = dto.Nome.Trim(),
                Email = emailNormalizado,
                SenhaSalt = Convert.ToBase64String(salt),
                SenhaHash = Convert.ToBase64String(hash),
                AdminId = adminId,
                DataNascimento = dto.DataNascimento ?? default
            };

            _context.Pessoas.Add(pessoa);
            await _context.SaveChangesAsync();

            return MapearParaResposta(pessoa);
        }
    }
}