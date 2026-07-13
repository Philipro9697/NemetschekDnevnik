using Microsoft.EntityFrameworkCore;
using NemetschekDnevnik.Server.Data;
using NemetschekDnevnik.Server.Models;
using System.ComponentModel.DataAnnotations;
using Xunit;

namespace NemetschekDnevnik.Server.Tests.Data
{
    public class SubjectTests
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

        [Fact]
        public async Task Test_Subject_SoftDelete()
        {
            using var context = GetInMemoryDbContext();
            
            var subject = new Subject { 
                SubjectName = "Немски език - Тест Soft Delete" 
            };
            context.Subjects.Add(subject);
            await context.SaveChangesAsync();

            context.Subjects.Remove(subject);
            await context.SaveChangesAsync();

            var activeSubject = await context.Subjects.FirstOrDefaultAsync(s => s.SubjectName == "Немски език - Тест Soft Delete");
            Assert.Null(activeSubject);

            var deletedSubject = await context.Subjects
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(s => s.SubjectName == "Немски език - Тест Soft Delete");

            Assert.NotNull(deletedSubject);
            Assert.True(deletedSubject.IsDeleted);
        }
    }
}