using System.Text.Json.Serialization;

namespace TesteMaxi.models
{
    public class AdminModels
    {
        public int Id { get; set; } 
        public string? Nome { get; set; }
        public DateOnly? DataNascimento { get; set; }   
        public string? Email { get; set; }
        public List<PessoasModels>? Pessoas { get; set; }

        [JsonIgnore]
        public string? SenhaHash { get; set; }
        [JsonIgnore]
        public string? SenhaSalt { get; set; }
    }
}