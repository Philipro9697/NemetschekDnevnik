using System;
using System.Collections.Generic;


namespace NemetschekDnevnik.Server.Models;
public partial class Class
{
    public int ClassId { get; set; }

    public int ClassGrade { get; set; }

    public string ClassLetter { get; set; } = null!;

    public int? HeadTeacherId { get; set; }

    public virtual Teacher? HeadTeacher { get; set; }

    public virtual ICollection<HomeworkItem> HomeworkItems { get; set; } = new List<HomeworkItem>();

    public virtual ICollection<WeeklySchedule> WeeklySchedules { get; set; } = new List<WeeklySchedule>();

    public virtual ICollection<Student> Students { get; set; } = new List<Student>();
}
