using ReservationServer.Models;
using System.Diagnostics.CodeAnalysis;
using Dapper;
using Microsoft.Data.SqlClient;

namespace ReservationServer.Repositries;

public class ReservationsRepositry : IReservationRepositry
{
    private readonly IConfiguration _config;
    private readonly string connectionString;
    public ReservationsRepositry(IConfiguration config)
    {
        _config = config;
        connectionString = _config.GetConnectionString("DefaultConnection");
    }

    private List<Reservation> reservations;

    public async Task<List<Reservation>> GetShowAsync(DateOnly startDate)
    {

        using (var connection = new SqlConnection(connectionString))
        {
            var sql = @"SELECT id AS Id,
                            conference_name AS ConferenceName,
                            start_date AS StartDate,
                            end_date AS EndDate,
                            reservation_name AS ReservationName
                            FROM reservation";

            reservations = (await connection
                .QueryAsync<Reservation>(sql)
                ).ToList();

            return reservations;

        }
    }

    public async Task PostInsertAsync(Reservation reservation)
    {
        using (var connection = new SqlConnection(connectionString))
        {
            var sql = @"INSERT INTO reservation
                            (
                                conference_name,
                                start_date,
                                end_date,
                                reservation_name
                            )
                            VALUES
                            (
                                @ConferenceName,
                                @StartDate,
                                @EndDate,
                                @ReservationName
                            )";

            await connection.ExecuteAsync(sql, reservation);
        }

    }

    public async Task DeleteAsync(int id)
    {
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.ExecuteAsync("DELETE FROM reservation WHERE Id = @Id", new { Id = id });
        }

    }
}
