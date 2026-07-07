using System;
using System.Collections.Generic;

namespace NemetschekDnevnik.Server.Models;

public partial class HomeworkItem
{
    public int HomeworkId { get; set; }

    public int? ClassId { get; set; }

    public int? SubjectId { get; set; }

    public int? TeacherId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public DateTime DateAssigned { get; set; }

    public DateTime DateDue { get; set; }

    public string? ResourceLink { get; set; }

    public virtual Class? Class { get; set; }

    public virtual Subject? Subject { get; set; }

    public virtual ICollection<SubmittedHomework> SubmittedHomeworks { get; set; } = new List<SubmittedHomework>();

    public virtual Teacher? Teacher { get; set; }
}
