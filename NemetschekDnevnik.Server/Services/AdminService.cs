using Microsoft.EntityFrameworkCore;
using NemetschekDnevnik.Server.DTOs;
using NemetschekDnevnik.Server.Models;

namespace NemetschekDnevnik.Server.Services;

public class AdminService : IAdminService
{
    private static readonly string[] CreatableRoles = { "Teacher", "Student", "Parent" };

    private readonly DnevnikContext _db;
    private readonly IStudentService _studentService;
    public AdminService(DnevnikContext db, IStudentService studentService)
    {
        _db = db;
        _studentService = studentService;
    }

    private static UserAccountDto ToUserAccountDto(User user) => new()
    {
        UserId = user.UserId,
        Email = user.Email,
        Role = user.Role,
        FirstName = user.FirstName,
        LastName = user.LastName,
        PhoneNumber = user.PhoneNumber,
        IsApproved = user.IsApproved
    };

    public async Task<UserAccountDto?> GetUserProfileAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return null;

        return ToUserAccountDto(user);
    }

    public async Task<IEnumerable<UserAccountDto>> GetAllUsersAsync()
    {
        var users = await _db.Users.ToListAsync();
        return users.Select(ToUserAccountDto);
    }

    public async Task<List<TeacherDto>> GetAllTeachers()
    {
        return await _db.Teachers
            .Select(t => new TeacherDto
            {
                TeacherId = t.TeacherId,
                FirstName = t.TeacherNavigation.FirstName,
                LastName = t.TeacherNavigation.LastName,
                Email = t.TeacherNavigation.Email,
                PhoneNumber = t.TeacherNavigation.PhoneNumber,
                SubjectNames = t.Subjects.Select(s => s.SubjectName).ToList()
            })
            .ToListAsync();
    }

    public async Task<List<ParentDto>> GetAllParents()
    {
        return await _db.Parents
            .Select(t => new ParentDto
            {
                ParentId = t.ParentId,
                FirstName = t.ParentNavigation.FirstName,
                LastName = t.ParentNavigation.LastName,
                Email = t.ParentNavigation.Email,
                PhoneNumber = t.ParentNavigation.PhoneNumber
            })
            .ToListAsync();
    }
    
    public async Task<List<StudentInfoDto>> GetAllStudents()
    {
        var students = await _db.Students
            .Include(s => s.StudentNavigation)
            .Include(s => s.Class)
            .ToListAsync();

        return students.Select(_studentService.GetStudentInfo).ToList();
    }

    public async Task<UserAccountDto?> CreateAsync(CreateUserDto dto)
    {
        if (!CreatableRoles.Contains(dto.Role))
            return null;

        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            return null;

        using var transaction = await _db.Database.BeginTransactionAsync();

        var user = new User
        {
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = dto.Role,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            PhoneNumber = dto.PhoneNumber,
            IsApproved = true
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        switch (dto.Role)
        {
            case "Teacher":
                _db.Teachers.Add(new Teacher { TeacherId = user.UserId });
                break;
            case "Student":
            {
                var student = new Student { StudentId = user.UserId };

                if (dto.ParentId.HasValue)
                {
                    var parent = await _db.Parents.FindAsync(dto.ParentId.Value);
                    if (parent != null)
                    {
                        student.ParentId = parent.ParentId;
                    }
                }

                if (dto.ClassId.HasValue)
                {
                    var schoolClass = await _db.Classes.FindAsync(dto.ClassId.Value);
                    if (schoolClass != null)
                    {
                        student.ClassId = schoolClass.ClassId;
                    }
                }

                _db.Students.Add(student);
                break;
            }
            case "Parent":
                _db.Parents.Add(new Parent { ParentId = user.UserId });
                break;
        }

        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        return ToUserAccountDto(user);
    }

    public async Task<UserAccountDto?> ApproveAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return null;

        user.IsApproved = true;
        await _db.SaveChangesAsync();

        return ToUserAccountDto(user);
    }

    public async Task<UserAccountDto?> BlockAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return null;

        user.IsApproved = false;
        await _db.SaveChangesAsync();

        return ToUserAccountDto(user);
    }

    public async Task<bool> DeleteAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return false;

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<UserAccountDto?> UpdateAsync(int id, UpdateUserDto dto)
{
    // 1. Locate the base user entity
    var user = await _db.Users.FindAsync(id);
    if (user == null)
        return null;

    // 2. Prevent duplicate emails across accounts if the email is being changed
    if (user.Email != dto.Email && await _db.Users.AnyAsync(u => u.Email == dto.Email))
        return null;

    using var transaction = await _db.Database.BeginTransactionAsync();

    // 3. Update the core identity fields
    user.Email = dto.Email;
    user.FirstName = dto.FirstName;
    user.LastName = dto.LastName;
    user.PhoneNumber = dto.PhoneNumber;
    user.IsApproved = dto.IsApproved;

    // Optional: Synchronize role changes if the admin modified the account type
    if (user.Role != dto.Role && CreatableRoles.Contains(dto.Role))
    {
        user.Role = dto.Role;
    }

    // 4. Update the password only if a new one was provided in the dialog
    if (!string.IsNullOrWhiteSpace(dto.Password))
    {
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
    }

    await _db.SaveChangesAsync();

    // 5. Synchronize sub-table structural assignments based on the user's role
    switch (user.Role)
    {
        case "Student":
        {
            var student = await _db.Students.FindAsync(id);
            if (student == null)
            {
                student = new Student { StudentId = id };
                _db.Students.Add(student);
            }

            if (dto.ClassId.HasValue)
            {
                var schoolClass = await _db.Classes.FindAsync(dto.ClassId.Value);
                if (schoolClass != null)
                {
                    student.ClassId = schoolClass.ClassId;
                }
            }
            else
            {
                student.ClassId = null;
            }
            break;
        }

        case "Teacher":
        {
            // Include the subjects collection to support updating many-to-many mappings
            var teacher = await _db.Teachers
                .Include(t => t.Subjects)
                .FirstOrDefaultAsync(t => t.TeacherId == id);

            if (teacher == null)
            {
                teacher = new Teacher { TeacherId = id };
                _db.Teachers.Add(teacher);
                await _db.SaveChangesAsync();
            }

            // Sync the chosen subjects if the DTO array was provided
            if (dto.SubjectIds != null)
            {
                teacher.Subjects.Clear();
                var selectedSubjects = await _db.Subjects
                    .Where(s => dto.SubjectIds.Contains(s.SubjectId)) 
                    .ToListAsync();

                foreach (var subject in selectedSubjects)
                {
                    teacher.Subjects.Add(subject);
                }
            }

            // Optional: If your schema maps the Class Teacher relationship 
            // directly onto the Teacher entity, assign it here:
            // teacher.ClassTeacherOfId = dto.ClassTeacherOfId;
            
            break;
        }
    }

    // 6. Persist sub-table alterations and commit the transaction safely
    await _db.SaveChangesAsync();
    await transaction.CommitAsync();

    return ToUserAccountDto(user);
}

    public async Task<List<ClassDto>> GetAllClassesAsync()
{
    return await _db.Classes
        .Select(c => new ClassDto
        {
            ClassId = c.ClassId,
            ClassGrade = c.ClassGrade,
            ClassLetter = c.ClassLetter,
            // If your Class entity has a navigation property for the Head Teacher, map it here:
            HeadTeacherId = c.HeadTeacherId, 
            HeadTeacherFirstName = c.HeadTeacher != null ? c.HeadTeacher.TeacherNavigation.FirstName : string.Empty,
            HeadTeacherLastName = c.HeadTeacher != null ? c.HeadTeacher.TeacherNavigation.LastName : string.Empty
        })
        .ToListAsync();
}
}
