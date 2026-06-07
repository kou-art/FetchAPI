using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Reservation.Data;
using Microsoft.AspNetCore.SignalR;
using Reservation.Hubs;

namespace Reservation.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ReservationController : ControllerBase
{
    private readonly ReservationDbContext _db;
    private readonly IHubContext<ReservationHub> _hub;

    public ReservationController(ReservationDbContext db, IHubContext<ReservationHub> hub)
    {
        _db = db;
        _hub = hub;
    }
    private static int _nextId = 3;

    // 1. GET: 予約状況の取得
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var reservations =
            await _db.Reservations.ToListAsync();
        return Ok(reservations);
    }

    // 2. POST: 予約の追加（日付を受け取る）
    [HttpPost]
    public async Task<IActionResult> Post([FromBody] CreateReservationDto dto)
    {
        bool isOverlapped = await _db.Reservations.AnyAsync(r =>
                            r.Date == dto.Date &&
                            r.RoomName == dto.RoomName &&
                            dto.StartHour < r.StartHour + r.Duration &&
                            dto.StartHour + dto.Duration > r.StartHour);
        if (isOverlapped)
        {
            // 400エラーとエラーメッセージを返して追加をブロックする
            return BadRequest(new { message = "指定された時間帯は、既に他の予約が入っています。" });
        }
        Reservation newReservation = new()
        {
            Date = dto.Date,
            RoomName = dto.RoomName,
            StartHour = dto.StartHour,
            Duration = dto.Duration,
            ReservedBy = dto.ReservedBy
        };

        await _db.Reservations.AddAsync(newReservation);

        await _db.SaveChangesAsync();
        await _hub.Clients.All.SendAsync("ReservationUpdated");
        return Ok(await _db.Reservations.ToListAsync());
    }

    // 3. POST: 予約の削除
    [HttpPost("delete/{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var reservation =
        await _db.Reservations.FirstOrDefaultAsync(r => r.Id == id);

        if (reservation != null)
        {
            _db.Reservations.Remove(reservation);

            await _db.SaveChangesAsync();
            await _hub.Clients.All.SendAsync("ReservationUpdated");
        }

        return Ok(await _db.Reservations.ToListAsync()); // 最新データをリターン
    }
}

// 日付（Date）フィールドを追加したデータ構造

public record CreateReservationDto(DateOnly Date, string RoomName, int StartHour, int Duration, string ReservedBy);
