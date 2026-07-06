using System;
using System.Collections.Generic;

namespace ConsoleApp1.Models;

public partial class Admin
{
    public int AdminId { get; set; }

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public virtual User AdminNavigation { get; set; } = null!;
}
