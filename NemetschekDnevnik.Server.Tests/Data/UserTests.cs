using Microsoft.EntityFrameworkCore;
using NemetschekDnevnik.Server.Data;
using NemetschekDnevnik.Server.Models;
using System.ComponentModel.DataAnnotations;
using Xunit;

namespace NemetschekDnevnik.Server.Tests.Data
{
    public class UserTests
    {
        private DnevnikContext GetDefaultDbContext()
        {
            var options = new DbContextOptionsBuilder<DnevnikContext>()
                .UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=Dnevnik;Trusted_Connection=True;") // Използваме твоя SQL Server
                .Options;

            return new DnevnikContext(options);
        }

        private void ValidateModel(object model)
        {
            var context = new ValidationContext(model, null, null);
            Validator.ValidateObject(model, context, validateAllProperties: true);
        }

        [Fact]
        public async Task DeleteUser_UserIsStudent_ShouldCascadeDeleteStudentProfile()
        {
            using var context = GetDefaultDbContext();

            var testUser = new User
            {
                Email = "test1@dnevnik.bg",
                FirstName = "Тест1",
                LastName = "Тест1",
                PhoneNumber = "0876459001",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                Role = "ученик",
                IsApproved = true,
                CreatedAt = DateTime.Now.AddMonths(-2)
            };

            context.Users.Add(testUser);
            await context.SaveChangesAsync();

            var testStudent = new Student
            {
                StudentId = testUser.UserId,
            };

            context.Students.Add(testStudent);
            await context.SaveChangesAsync();

            context.Users.Remove(testUser);
            await context.SaveChangesAsync(); 

            var deletedUser = await context.Users.FirstOrDefaultAsync(u => u.UserId == testUser.UserId);

            var deletedStudent = await context.Students.FirstOrDefaultAsync(s => s.StudentId == testUser.UserId);

            Assert.Null(deletedUser);
            Assert.Null(deletedStudent); 
        }

        [Fact]
        public async Task DeleteUser_UserIsParent_ShouldCascadeDeleteParentProfile()
        {
            using var context = GetDefaultDbContext();

            var testUser = new User
            {
                Email = "test2@dnevnik.bg",
                FirstName = "Тест2",
                LastName = "Тест2",
                PhoneNumber = "0876459002",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                Role = "родител",
                IsApproved = true,
                CreatedAt = DateTime.Now.AddMonths(-2)
            };

            context.Users.Add(testUser);
            await context.SaveChangesAsync(); 

            var testParent = new Parent
            {
                ParentId = testUser.UserId 
            };

            context.Parents.Add(testParent);
            await context.SaveChangesAsync();

            context.Users.Remove(testUser);
            await context.SaveChangesAsync();

            var deletedUser = await context.Users.FirstOrDefaultAsync(u => u.UserId == testUser.UserId);
            var deletedParent = await context.Parents.FirstOrDefaultAsync(p => p.ParentId == testUser.UserId);

            Assert.Null(deletedUser);
            Assert.Null(deletedParent); 
        }

        [Fact]
        public async Task AddUser_DuplicateEmail_ShouldThrowException()
        {
            using var context = GetDefaultDbContext();

            var duplicateEmail = $"duplicate_test_{Guid.NewGuid()}@school.com";

            var user1 = new User
            {
                Email = duplicateEmail,
                FirstName = "Тест3",
                LastName = "Тест3",
                PhoneNumber = "0876459003",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                Role = "родител",
                IsApproved = true,
                CreatedAt = DateTime.Now.AddMonths(-2)
            };

            var user2 = new User
            {
                Email = duplicateEmail,
                FirstName = "Тест4",
                LastName = "Тест4",
                PhoneNumber = "0876459004",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                Role = "родител",
                IsApproved = true,
                CreatedAt = DateTime.Now.AddMonths(-2)
            };

            context.Users.Add(user1);
            await context.SaveChangesAsync();

            context.Users.Add(user2);
            
            await Assert.ThrowsAsync<DbUpdateException>(async () => 
            {
                await context.SaveChangesAsync();
            });

            context.Users.Remove(user1);
            await context.SaveChangesAsync();
        }

        [Fact]
        public void AddUser_InvalidEmailFormat_ShouldThrowValidationException()
        {
            var invalidUser = new User
            {
                Email = "bad-email-format",
                FirstName = "Тест",
                LastName = "Тест",
                PhoneNumber = "0876459000",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                Role = "ученик",
                IsApproved = true,
                CreatedAt = DateTime.Now.AddMonths(-2)
            };

            Assert.Throws<ValidationException>(() => ValidateModel(invalidUser));
        }

        [Fact]
        public async Task Test_SoftDelete_Functionality()
        {
            using var context = GetDefaultDbContext();
            var uniqueEmail = $"soft_delete_test_{Guid.NewGuid()}@dnevnik.bg";

            var testUser = new User
            {
                Email = uniqueEmail,
                FirstName = "Тестов",
                LastName = "Тестов",
                PhoneNumber = "0876459585",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                Role = "ученик",
                IsApproved = true,
                CreatedAt = DateTime.Now.AddMonths(-2)
            };

            context.Users.Add(testUser);
            await context.SaveChangesAsync();

            context.Users.Remove(testUser);
            await context.SaveChangesAsync(); 
            
            var foundUserNormal = await context.Users.FirstOrDefaultAsync(u => u.Email == uniqueEmail);
            Assert.Null(foundUserNormal); 
            
            var foundUserAdmin = await context.Users
                .IgnoreQueryFilters() 
                .FirstOrDefaultAsync(u => u.Email == uniqueEmail);

            Assert.NotNull(foundUserAdmin); 
            Assert.True(foundUserAdmin.IsDeleted); 
        }
    }
}