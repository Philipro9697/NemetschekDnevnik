using System;
using System.Collections.Generic;

namespace NemetschekDnevnik.Server.Models;

public partial class Subject
{
    public int SubjectId { get; set; }

    public string SubjectName { get; set; } = null!;

    public virtual ICollection<Grade> Grades { get; set; } = new List<Grade>();

    public virtual ICollection<HomeworkItem> HomeworkItems { get; set; } = new List<HomeworkItem>();

    public virtual ICollection<WeeklySchedule> WeeklySchedules { get; set; } = new List<WeeklySchedule>();

    public virtual ICollection<Teacher> Teachers { get; set; } = new List<Teacher>();
}
