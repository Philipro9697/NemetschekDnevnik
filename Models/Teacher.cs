using System;
using System.Collections.Generic;

namespace NemetschekDnevnik.Models;

public partial class Teacher
{
    public int TeacherId { get; set; }

    public virtual ICollection<Class> Classes { get; set; } = new List<Class>();

    public virtual ICollection<Grade> Grades { get; set; } = new List<Grade>();

    public virtual ICollection<HomeworkItem> HomeworkItems { get; set; } = new List<HomeworkItem>();

    public virtual ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();

    public virtual ICollection<Remark> Remarks { get; set; } = new List<Remark>();

    public virtual User TeacherNavigation { get; set; } = null!;

    public virtual ICollection<WeeklyScheduleItem> WeeklyScheduleItems { get; set; } = new List<WeeklyScheduleItem>();

    public virtual ICollection<Subject> Subjects { get; set; } = new List<Subject>();
}
