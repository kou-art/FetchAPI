namespace Reservation;

public class Reservation
{
    public int Id { get; set; }

    public DateTime StartAt { get; set; }

    public DateTime EndAt { get; set; }

    public string RoomName { get; set; } = "";

    public string ReservedBy { get; set; } = "";
}
