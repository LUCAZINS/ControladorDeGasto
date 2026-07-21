namespace TesteMaxi.models
{
    public class TransacaoModels
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string? Descricao { get; set; }
        public decimal Valor { get; set; }
        public EnumTipoTransacao TipoTransacao { get; set; }
        public int PessoaId { get; set; }
        public PessoasModels? Pessoa { get; set; }
    }
}