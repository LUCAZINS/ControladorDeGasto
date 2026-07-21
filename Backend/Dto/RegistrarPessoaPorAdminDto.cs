namespace TesteMaxi.Dto
{
    public class RegistrarPessoaPorAdminDto
    {
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public DateOnly? DataNascimento { get; set; }
    }
}
