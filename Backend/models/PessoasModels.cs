using System.Text.Json.Serialization;

namespace TesteMaxi.models
{
    public class PessoasModels
    {
        public int Id { get; set; } 
        public string? Nome { get; set; }
        public DateOnly DataNascimento { get; set; }   
        public List<TransacaoModels>? Transacoes { get; set; }
        public int AdminId { get; set; }
        public AdminModels? Admin { get; set; }
        public string? Email { get; set; }
        [JsonIgnore]
        public string? SenhaHash { get; set; }
        [JsonIgnore]
        public string? SenhaSalt { get; set; }

    }
}