using System;
using System.Collections.Generic;

namespace NemetschekDnevnik.Server.Models;

public partial class WeeklyScheduleItem
{
    public int ScheduleItemId { get; set; }

    public int DayOfWeek { get; set; }

    public int? SubjectId { get; set; }

    public int? TeacherId { get; set; }

    public TimeOnly Time { get; set; }

    public int? ClassId { get; set; }

    public string? Location { get; set; }

    public virtual Class? Class { get; set; }

    public virtual ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();

    public virtual Subject? Subject { get; set; }

    public virtual Teacher? Teacher { get; set; }
}
