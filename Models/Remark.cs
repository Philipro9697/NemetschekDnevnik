using System;
using System.Collections.Generic;

namespace NemetschekDnevnik.Models;

public partial class Remark
{
    public int RemarkId { get; set; }

    public int? StudentId { get; set; }

    public int? TeacherId { get; set; }

    public string Type { get; set; } = null!;

    public string Text { get; set; } = null!;

    public DateTime DateCreated { get; set; }

    public virtual Student? Student { get; set; }

    public virtual Teacher? Teacher { get; set; }
}
