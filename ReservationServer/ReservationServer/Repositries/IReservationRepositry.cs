using ReservationServer.Models;

namespace ReservationServer.Repositries;

public interface IReservationRepositry
{
    public Task<List<Reservation>> GetShowAsync(DateOnly startDate);

    public Task PostInsertAsync(Reservation reservation);

    public Task DeleteAsync(int id);
}
