using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NemetschekDnevnik.Server.Models;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NemetschekDnevnik.Server.Services;

public class DatabaseMaintenanceService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DatabaseMaintenanceService> _logger;

    public DatabaseMaintenanceService(IServiceProvider serviceProvider, ILogger<DatabaseMaintenanceService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Стартиране на автоматична поддръжка на базата данни...");

            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<DnevnikContext>();

                    var expiredTokens = context.RefreshTokens
                        .Where(t => t.ExpiresAt < DateTime.UtcNow);
                    
                    context.RefreshTokens.RemoveRange(expiredTokens);

                    // var oldLogs = context.Logs.Where(l => l.Timestamp < DateTime.UtcNow.AddDays(-30));
                    // context.Logs.RemoveRange(oldLogs);

                    await context.SaveChangesAsync(stoppingToken);
                    _logger.LogInformation("Поддръжката приключи успешно.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Грешка по време на поддръжка на базата данни.");
            }

            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }
}