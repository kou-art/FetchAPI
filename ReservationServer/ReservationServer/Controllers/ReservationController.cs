using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ReservationServer.Models;
using ReservationServer.Repositries;

namespace ReservationServer.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ReservationsController : ControllerBase
{
    private readonly IReservationRepositry _reservation;


    public ReservationsController(IReservationRepositry reservation)
    {
        _reservation = reservation;
    }


    [HttpGet]
    public async Task<IActionResult> GetReservations([FromQuery] DateOnly date)
    {


        var reservations = await _reservation.GetShowAsync(date);

        return Ok(reservations);
    }


    [HttpPost]
    public async Task<IActionResult> PostReservationsAsync([FromBody] ReservationCreate input)
    {

        DateTime startTime = input.Date.ToDateTime(input.StartTime);
        DateTime endTime = input.Date.ToDateTime(input.EndTime);

        if (startTime >= endTime)
        {
            return BadRequest("終了時刻は開始時刻以降にしてください");
            // logを入れる
        }

        //var aaaa = _reservation.GetShowAsync(DateTime.Now);
        var existingReservations = await _reservation.GetShowAsync(input.Date);



        Reservation newInput = new()
        {
            ConferenceName = input.ConfrenceName,
            StartDate = startTime,
            EndDate = endTime,
            ReservationName = input.ReservationName,
        };

        await _reservation.PostInsertAsync(newInput);

        return Ok();
    }


    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReservationsAsync(int id)
    {
        await _reservation.DeleteAsync(id);

        return Ok();

    }
}
