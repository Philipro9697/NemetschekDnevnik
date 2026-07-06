using System;
using System.Collections.Generic;

namespace NemetschekDnevnik.Server.Models;

public partial class Teacher
{
    public int TeacherId { get; set; }

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string PhoneNumber { get; set; } = null!;

    public virtual ICollection<Class> Classes { get; set; } = new List<Class>();

    public virtual ICollection<Grade> Grades { get; set; } = new List<Grade>();

    public virtual User TeacherNavigation { get; set; } = null!;

    public virtual ICollection<WeeklySchedule> WeeklySchedules { get; set; } = new List<WeeklySchedule>();

    public virtual ICollection<Subject> Subjects { get; set; } = new List<Subject>();
}
