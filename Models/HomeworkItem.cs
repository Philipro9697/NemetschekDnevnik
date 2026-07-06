using System;
using System.Collections.Generic;

namespace ConsoleApp1.Models;

public partial class HomeworkItem
{
    public int HomeworkId { get; set; }

    public int? ClassId { get; set; }

    public int? SubjectId { get; set; }

    public DateOnly DateDue { get; set; }

    public string? SubjectLink { get; set; }

    public virtual Class? Class { get; set; }

    public virtual Subject? Subject { get; set; }
}
