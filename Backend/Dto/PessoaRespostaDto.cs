namespace TesteMaxi.Dto
{
    public class PessoaRespostaDto
    {
        public int Id { get; set; }
        public string? Nome { get; set; }
        public DateOnly DataNascimento { get; set; }
        public int Idade { get; set; }
        public string? Email { get; set; }
    }
}