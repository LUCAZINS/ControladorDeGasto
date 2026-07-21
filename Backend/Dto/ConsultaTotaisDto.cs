namespace TesteMaxi.Dto
{
    public class ConsultaTotaisDto
    {
        public List<TotalPessoaDto> Pessoas { get; set; } = [];

        public decimal TotalGeralReceitas { get; set; }

        public decimal TotalGeralDespesas { get; set; }

        public decimal SaldoLiquidoGeral { get; set; }
    }
}