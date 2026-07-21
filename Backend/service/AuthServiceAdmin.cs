using Microsoft.EntityFrameworkCore;
using TesteMaxi.context;
using TesteMaxi.Dto;
using TesteMaxi.helpers;
using TesteMaxi.models;

namespace TesteMaxi.service
{
    public class AdminAuthService
    {
        private readonly TesteContext _context;

        public AdminAuthService(TesteContext context)
        {
            _context = context;
        }
        public async Task<AdminModels> RegistrarAdminAsync(RegistrarAdminDto dto)
        {
            var emailNormalizado = dto.Email.Trim().ToLower();

            var emailJaCadastrado = await _context.Admins
                .AnyAsync(a => a.Email == emailNormalizado);

            if (emailJaCadastrado)
            {
                throw new InvalidOperationException("E-mail já cadastrado.");
            }

            var salt = SenhaHelper.CreateSalt();
            var hash = SenhaHelper.HashPassword(dto.Password, salt);

            var admin = new AdminModels
            {
                Nome = dto.Nome.Trim(),
                Email = emailNormalizado,
                SenhaSalt = Convert.ToBase64String(salt),
                SenhaHash = Convert.ToBase64String(hash)
            };

            _context.Admins.Add(admin);
            await _context.SaveChangesAsync();

            return admin;
        }

        public async Task<AdminModels> LoginAsync(LoginDto dto)
        {
            var email = dto.Email.Trim().ToLower();

            var admin = await _context.Admins
                .FirstOrDefaultAsync(a => a.Email == email);

            if (admin == null ||
                string.IsNullOrWhiteSpace(admin.SenhaSalt) ||
                string.IsNullOrWhiteSpace(admin.SenhaHash))
            {
                throw new UnauthorizedAccessException(
                    "Credenciais inválidas."
                );
            }

            var salt = Convert.FromBase64String(
                admin.SenhaSalt
            );

            var hashEsperado = Convert.FromBase64String(
                admin.SenhaHash
            );

            var hashCalculado = SenhaHelper.HashPassword(
                dto.Password,
                salt
            );

            if (!hashCalculado.SequenceEqual(hashEsperado))
            {
                throw new UnauthorizedAccessException(
                    "Credenciais inválidas."
                );
            }

            return admin;
        }


    }
}