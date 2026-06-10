using Microsoft.EntityFrameworkCore;
using Reservation.Data;
using Reservation.Hubs;
using System.Text.Json;

namespace Reservation;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
            options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        });
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowAll",
                policy =>
                {
                    policy.AllowAnyOrigin()   // Ç«ÇÃPCÇ©ÇÁÇ≈Ç‡ãñâ¬
                          .AllowAnyHeader()   // Ç«ÇÒÇ»ÉwÉbÉ_Å[Ç≈Ç‡ãñâ¬
                          .AllowAnyMethod();  // GETÇ‚POSTÇ»Ç«âΩÇ≈Ç‡ãñâ¬
                });
        });
        builder.Services.AddDbContext<ReservationDbContext>(
        options =>
            options.UseSqlite("Data Source=reservation.db"));

        builder.Services.AddSignalR();

        // Add services to the container.

        // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }
        app.UseCors("AllowAll");
        app.UseHttpsRedirection();

        app.UseAuthorization();


        app.MapControllers();

        app.MapHub<ReservationHub>("/reservationHub");

        app.Run();
    }
}
