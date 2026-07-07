using System;
using System.Collections.Generic;

namespace NemetschekDnevnik.Server.Models;

public partial class Attendance
{
    public int LessonId { get; set; }

    public int StudentId { get; set; }

    public bool IsAbsent { get; set; }

    public bool IsExcused { get; set; }

    public virtual Lesson Lesson { get; set; } = null!;

    public virtual Student Student { get; set; } = null!;
}
