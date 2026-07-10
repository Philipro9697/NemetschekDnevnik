using Microsoft.EntityFrameworkCore;
using NemetschekDnevnik.Server.Data;
using NemetschekDnevnik.Server.Models;
using System.ComponentModel.DataAnnotations;
using Xunit;

namespace NemetschekDnevnik.Server.Tests.Data
{
    public class GradeTests
    {
        private DnevnikContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<DnevnikContext>()
                .UseSqlServer("DataSource=:memory:")
                .Options;

            var context = new DnevnikContext(options);
            context.Database.OpenConnection();
            context.Database.EnsureCreated(); 

            return context;
        }

        private void ValidateModel(object model)
        {
            var context = new ValidationContext(model, null, null);

            Validator.ValidateObject(model, context, validateAllProperties: true);
        }

        [Fact]
        public async Task AddGrade_ValueIsLessThanTwo_ShouldThrowException()
        {
            using var context = GetInMemoryDbContext();
            
            var invalidGrade = new Grade
            {
                GradeValue = 1, 
                StudentId = 1,
                SubjectId = 1,
                TeacherId = 1,
                GradeTypeId = 1,
                Comment = "Тест под 2",
                EntryDate = DateOnly.FromDateTime(DateTime.UtcNow)
            };

            context.Grades.Add(invalidGrade);

            await Assert.ThrowsAsync<DbUpdateException>(async () =>
            {
                await context.SaveChangesAsync();
            });
        }

        [Fact]
        public async Task AddGrade_ValueIsGreaterThanSix_ShouldThrowException()
        {
            using var context = GetInMemoryDbContext();
            
            var invalidGrade = new Grade
            {
                GradeValue = 7, 
                StudentId = 1,
                SubjectId = 1,
                TeacherId = 1,
                GradeTypeId = 1,
                Comment = "Тест",
                EntryDate = new DateOnly(2026, 7, 10)
            };

            context.Grades.Add(invalidGrade);

            await Assert.ThrowsAsync<DbUpdateException>(async () =>
            {
                await context.SaveChangesAsync();
            });
        }

        [Fact]
        public async Task AddGrade_ValueIsValid_ShouldSaveSuccessfully()
        {
            using var context = GetInMemoryDbContext();
            
            var gradeType = new GradeType 
            { 
                GradeTypeId = 1, 
                TypeName = "Текущ контрол" 
            };

            var validGrade = new Grade
            {
                GradeValue = 6.00m,
                StudentId = 2,
                SubjectId = 1,
                TeacherId = 5,
                GradeTypeId = 1,
                Comment = "Браво!",
                EntryDate = DateOnly.FromDateTime(DateTime.UtcNow)
            };

            context.Grades.Add(validGrade);
            await context.SaveChangesAsync();

            var savedGrade = await context.Grades.FirstOrDefaultAsync(g => g.GradeValue == validGrade.GradeValue);
            
            Assert.NotNull(savedGrade);
            Assert.Equal(6, savedGrade.GradeValue);
            Assert.Equal("Браво!", savedGrade.Comment);
        }
    }
}