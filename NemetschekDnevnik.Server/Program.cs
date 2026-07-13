using NemetschekDnevnik.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.EntityFrameworkCore;
using NemetschekDnevnik.Server.Middleware;
using NemetschekDnevnik.Server.Services;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using DotNetEnv;

DotNetEnv.Env.Load();

// Add services to the container.
var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<DnevnikContext>(options =>
    options.UseSqlServer(connectionString));


const string FrontendCorsPolicy = "FrontendClient";

builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddAuthentication(IdentityConstants.ApplicationScheme)
    .AddCookie(IdentityConstants.ApplicationScheme);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
});

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();
builder.Services.AddAuthorization();

builder.Services.AddDbContext<DnevnikContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "Server=localhost\\SQLEXPRESS;Database=Dnevnik;Integrated Security=True;TrustServerCertificate=True"));

builder.Services.AddScoped<IUserProfileService, UserProfileService>();

builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddHostedService<DatabaseMaintenanceService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<DnevnikContext>();

    context.Database.Migrate();

    NemetschekDnevnik.Server.Data.DbSeeder.SeedAllData(context);
}

app.UseDefaultFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.

//app.UseHttpsRedirection();

app.UseCors(FrontendCorsPolicy);

app.UseAuthentication();
app.UseMiddleware<EnsureApprovedUserMiddleware>();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
