using Microsoft.EntityFrameworkCore;
using NemetschekDnevnik.Server.Middleware;
using NemetschekDnevnik.Server.Models;
using NemetschekDnevnik.Server.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();
builder.Services.AddAuthorization();

builder.Services.AddDbContext<NemetschekSchoolDiaryContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "Server=localhost\\SQLEXPRESS;Database=NemetschekSchoolDiary;Integrated Security=True;TrustServerCertificate=True"));

builder.Services.AddScoped<IUserProfileService, UserProfileService>();

var app = builder.Build();

app.UseDefaultFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.

app.UseHttpsRedirection();

app.UseMiddleware<EnsureApprovedUserMiddleware>();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
