using System;
using System.Collections.Generic;

namespace NemetschekDnevnik.Server.Models;
public partial class Subject : ISoftDelete
{
    public int SubjectId { get; set; }

    public string SubjectName { get; set; } = null!;

    public bool IsDeleted { get; set; } = false;

    public virtual ICollection<Grade> Grades { get; set; } = new List<Grade>();

    public virtual ICollection<HomeworkItem> HomeworkItems { get; set; } = new List<HomeworkItem>();

    public virtual ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();

    public virtual ICollection<WeeklyScheduleItem> WeeklyScheduleItems { get; set; } = new List<WeeklyScheduleItem>();

    public virtual ICollection<Teacher> Teachers { get; set; } = new List<Teacher>();
}
