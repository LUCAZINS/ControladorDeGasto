using TesteMaxi.models;

namespace TesteMaxi.Dto
{
    public class CriarTransacaoDto
    {
        public string Descricao { get; set; } = string.Empty;

        public decimal Valor { get; set; }

        public EnumTipoTransacao TipoTransacao { get; set; }

        public int PessoaId { get; set; }
    }
}