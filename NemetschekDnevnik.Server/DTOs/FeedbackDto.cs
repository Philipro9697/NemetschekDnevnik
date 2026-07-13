using System.ComponentModel.DataAnnotations;

namespace NemetschekDnevnik.Server.DTOs;

public class FeedbackDto
{
    [Required]
    public string Feedback { get; set; }
}
