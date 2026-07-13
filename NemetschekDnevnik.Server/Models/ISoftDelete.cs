namespace NemetschekDnevnik.Server.Models
{
    public interface ISoftDelete
    {
        public bool IsDeleted { get; set; }
    }
}