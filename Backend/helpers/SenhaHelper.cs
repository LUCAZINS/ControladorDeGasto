using System.Security.Cryptography;

namespace TesteMaxi.helpers
{
    public class SenhaHelper
    {
        public static byte[] CreateSalt(int size = 16)
    {
        var salt = new byte[size];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(salt);
        return salt;
    }

    public static byte[] HashPassword(
        string password,
        byte[] salt,
        int iterations = 100_000,
        int length = 32)
    {
        return Rfc2898DeriveBytes.Pbkdf2(
            password: password,
            salt: salt,
            iterations: iterations,
            hashAlgorithm: HashAlgorithmName.SHA256,
            outputLength: length);
    }
    }
}
