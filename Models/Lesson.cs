using System;
using System.Collections.Generic;

namespace NemetschekDnevnik.Server.Models;

public partial class Lesson
{
    public int LessonId { get; set; }

    public DateOnly Date { get; set; }

    public TimeOnly Time { get; set; }

    public int? SubjectId { get; set; }

    public int? TeacherId { get; set; }

    public int? ClassId { get; set; }

    public int? ScheduleItemId { get; set; }

    public virtual ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();

    public virtual Class? Class { get; set; }

    public virtual WeeklyScheduleItem? ScheduleItem { get; set; }

    public virtual Subject? Subject { get; set; }

    public virtual Teacher? Teacher { get; set; }
}
