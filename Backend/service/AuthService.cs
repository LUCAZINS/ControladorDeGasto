using Microsoft.EntityFrameworkCore;
using TesteMaxi.context;
using TesteMaxi.Dto;
using TesteMaxi.helpers;
using TesteMaxi.models;

namespace TesteMaxi.service
{
    public class AuthService
    {
        private readonly TesteContext _context;

        public AuthService(TesteContext context)
        {
            _context = context;
        }

        public async Task<PessoasModels> RegistrarUsuarioAsync(RegistrarPessoasDto dto)
        {
            var emailNormalizado = dto.Email.Trim().ToLower();

            var emailJaCadastrado = await _context.Pessoas
                .AnyAsync(p => p.Email == emailNormalizado);

            if (emailJaCadastrado)
            {
                throw new InvalidOperationException("E-mail já cadastrado.");
            }

            var salt = SenhaHelper.CreateSalt();
            var hash = SenhaHelper.HashPassword(dto.Password, salt);

            var pessoa = new PessoasModels
            {
                Nome = dto.Nome.Trim(),
                Email = emailNormalizado,
                SenhaSalt = Convert.ToBase64String(salt),
                SenhaHash = Convert.ToBase64String(hash)
            };

            _context.Pessoas.Add(pessoa);
            await _context.SaveChangesAsync();

            return pessoa;
        }
        public async Task<PessoasModels> LoginPessoaAsync(LoginDto dto)
        {
            var email = dto.Email.Trim().ToLower();

            var pessoa = await _context.Pessoas
                .FirstOrDefaultAsync(p => p.Email == email);

            if (pessoa == null)
                throw new UnauthorizedAccessException("Credenciais inválidas.");

            if (string.IsNullOrWhiteSpace(pessoa.SenhaSalt) ||
                string.IsNullOrWhiteSpace(pessoa.SenhaHash))
                throw new UnauthorizedAccessException("Credenciais inválidas.");

            var salt = Convert.FromBase64String(pessoa.SenhaSalt);
            var hashEsperado = Convert.FromBase64String(pessoa.SenhaHash);

            var hashCalculado = SenhaHelper.HashPassword(dto.Password, salt);

            if (!hashCalculado.SequenceEqual(hashEsperado))
                throw new UnauthorizedAccessException("Credenciais inválidas.");

            return pessoa;
        }


        

    }
}