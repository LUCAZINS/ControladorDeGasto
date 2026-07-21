namespace TesteMaxi.Dto
{
    public class TotalPessoaDto
    {
        public int PessoaId { get; set; }

        public string? Nome { get; set; }

        public decimal TotalReceitas { get; set; }

        public decimal TotalDespesas { get; set; }

        public decimal Saldo { get; set; }
    }
}