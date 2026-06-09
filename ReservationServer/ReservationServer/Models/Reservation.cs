namespace ReservationServer.Models;

public class Reservation
{
    public int Id { get; set; }


    public string ConferenceName { get; set; }


    public DateTime StartDate { get; set; }


    public DateTime EndDate { get; set; }


    public string ReservationName { get; set; }
}
