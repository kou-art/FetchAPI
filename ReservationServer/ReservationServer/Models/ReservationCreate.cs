using System.ComponentModel.DataAnnotations;

namespace ReservationServer.Models;

public class ReservationCreate
{
    [Required]
    [StringLength(20)]
    public string ConfrenceName { get; set; }


    [Required]
    [Range(typeof(DateOnly), "1753-01-01", "9999-12-31")]
    public DateOnly Date { get; set; }


    [Required]
    [Range(typeof(TimeOnly), "09:00", "18:00")]
    public TimeOnly StartTime { get; set; }


    [Required]
    [Range(typeof(TimeOnly), "09:00", "18:00")]
    public TimeOnly EndTime { get; set; }


    [Required]
    [StringLength(20)]
    public string ReservationName { get; set; }
}
