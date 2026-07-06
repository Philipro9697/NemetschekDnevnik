using System;
using System.Collections.Generic;

namespace NemetschekDnevnik.Server.Models;

public partial class Attendance
{
    public int LessonId { get; set; }

    public int StudentId { get; set; }

    public string Status { get; set; } = null!;

    public virtual WeeklySchedule Lesson { get; set; } = null!;

    public virtual Student Student { get; set; } = null!;
}
