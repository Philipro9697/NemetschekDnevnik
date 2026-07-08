namespace NemetschekDnevnik.Server.Models
{
    public class RefreshToken
    {
        public int ID { get; set; }
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public bool IsRevoked { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;
    }
}
