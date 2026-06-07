namespace Reservation;

public class Reservation
{
    public int Id { get; set; }

    public DateOnly Date { get; set; }

    public string RoomName { get; set; } = string.Empty;

    public int StartHour { get; set; }

    public int Duration { get; set; }

    public string ReservedBy { get; set; } = string.Empty;
}
