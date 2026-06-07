using Microsoft.EntityFrameworkCore;
namespace Reservation.Data;
public class ReservationDbContext : DbContext
{
    public ReservationDbContext(
        DbContextOptions<ReservationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Reservation> Reservations => Set<Reservation>();
}
