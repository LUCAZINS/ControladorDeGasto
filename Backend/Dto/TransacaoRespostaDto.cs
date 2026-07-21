namespace TesteMaxi.Dto
{
    public class TransacaoRespostaDto
    {
        public Guid Id { get; set; }
        public string? Descricao { get; set; }
        public decimal Valor { get; set; }
        public string? TipoTransacao { get; set; }
        public int PessoaId { get; set; }
        public string? PessoaNome { get; set; }
    }
}