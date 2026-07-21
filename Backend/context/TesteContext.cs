using Microsoft.EntityFrameworkCore;
using TesteMaxi.models;

namespace TesteMaxi.context
{
    public class TesteContext : DbContext
    {
        public TesteContext(DbContextOptions<TesteContext> options) : base(options)
        {
        }
        public DbSet<TransacaoModels> Transacoes { get; set; }
        public DbSet<PessoasModels> Pessoas { get; set; }
        public DbSet<AdminModels> Admins { get; set; }
         protected override void OnModelCreating(
            ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<TransacaoModels>()
                .HasOne(t => t.Pessoa)
                .WithMany(p => p.Transacoes)
                .HasForeignKey(t => t.PessoaId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PessoasModels>()
                .HasIndex(p => p.Email)
                .IsUnique();

            modelBuilder.Entity<AdminModels>()
                .HasIndex(a => a.Email)
                .IsUnique();
        }
        
    }
}