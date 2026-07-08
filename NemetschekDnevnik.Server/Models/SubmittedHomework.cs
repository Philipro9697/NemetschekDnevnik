using System;
using System.Collections.Generic;

namespace NemetschekDnevnik.Server.Models;
public partial class SubmittedHomework
{
    public int SubmissionId { get; set; }

    public int? HomeworkId { get; set; }

    public int? StudentId { get; set; }

    public string? SubmissionText { get; set; }

    public string? FileLink { get; set; }

    public DateTime SubmittedAt { get; set; }

    public string? TeacherFeedback { get; set; }

    public bool IsGraded { get; set; }

    public virtual HomeworkItem? Homework { get; set; }

    public virtual Student? Student { get; set; }
}
