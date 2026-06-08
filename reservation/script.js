const formattedToday = new Date().toISOString().split('T')[0];;
// min属性に今日の日付を設定する
document.getElementById('bookingDate').min = formattedToday;

        const connection = new signalR.HubConnectionBuilder()
.withUrl("https://localhost:7209/reservationHub")
.build();
const API_URL = 'https://localhost:7209/api/reservation';
let allReservations = [];
// =====================
// SignalR
// =====================
connection.on("ReservationUpdated", async () => {
    console.log("予約更新通知受信");

    await loadReservations();
});
connection.start()
    .then(() => console.log("SignalR接続成功"))
    .catch(err => console.error("SignalR接続失敗", err));
// =====================
// メッセージ表示
// =====================
function clearMessage() {
    document.getElementById("message-area").innerHTML = "";
}
function showError(message) {
    document.getElementById("message-area").innerHTML = `
        <div class="alert alert-danger" role="alert">
            ${message}
        </div>
    `;
}
// =====================
// 初期化
// =====================
function initApp() {
    const today = new Date().toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" ,
        year: "numeric",  // 年を数字で（2026）
        month: "2-digit", // 月を2桁で（06）
        day: "2-digit"    // 日を2桁で（08）
})
    .replaceAll('/', '-');
    console.log(today);
    document.getElementById('display-date').value = today;
    document.getElementById('bookingDate').value = today;
    loadReservations();
}
// =====================
// 一覧表示
// =====================
function filterDisplay() {
    const targetDate =
        document.getElementById('display-date').value;
    const tbody =
        document.getElementById('reservation-list');
    const filteredData =
    allReservations.filter(item => {

        const jstDate = new Date(item.startAt)
            .toLocaleDateString("ja-JP", {
                timeZone: "Asia/Tokyo",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            })
            .replaceAll('/', '-'); // スラッシュをハイフンに変換

        // 日本時間同士で比較する
        return jstDate === targetDate;
    });
    if (filteredData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    選択された日付（${targetDate}）の予約はありません。
                </td>
            </tr>
        `;
        return;
    }
    tbody.innerHTML = filteredData.map(item => {

    const startAt = new Date(item.startAt);
    const endAt = new Date(item.endAt);

    const date = startAt.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" ,
        year: "numeric",  // 年を数字で（2026）
        month: "2-digit", // 月を2桁で（06）
        day: "2-digit"    // 日を2桁で（08）
})
    .replaceAll('/', '-');;

    const startTime =
        startAt.toLocaleTimeString(
            [],
            { hour: '2-digit', minute: '2-digit' }
        );

    const endTime =
        endAt.toLocaleTimeString(
            [],
            { hour: '2-digit', minute: '2-digit' }
        );

    return `
        <tr>
            <td>${date}</td>
            <td><strong>${item.roomName}</strong></td>
            <td>${startTime} - ${endTime}</td>
            <td>${item.reservedBy}</td>
            <td>
                <button
                    class="btn btn-danger"
                    onclick="deleteReservation(${item.id})">
                    削除
                </button>
            </td>
        </tr>
    `;
    }).join('');
}
// =====================
// GET
// =====================
async function loadReservations() {
    try {
        const response =
            await fetch(API_URL);
        if (response.ok) {
            allReservations = await response.json();
            filterDisplay();
        }
    } catch (e) {
        console.error("GETエラー:",e);
    }
}
// =====================
// POST
// =====================
document.getElementById('booking-form')
    .addEventListener('submit',
        async (e) => {
            e.preventDefault();
            
            const payload = {
                date: document.getElementById('bookingDate').value,
                roomName: document.getElementById('roomName').value,
                startTime: document.getElementById('startTime').value,
                endTime: document.getElementById('endTime').value,
                reservedBy: document.getElementById('reservedBy').value
            };
            if (payload.startTime >= payload.endTime) {
                showError("終了時刻は開始時刻より後にしてください。");
                return;
            }
            try {
                const response = await fetch(API_URL,
                        {
                            method: 'POST',
                            headers: {'Content-Type':'application/json'},
                            body:JSON.stringify(payload)
                        }
                    );
                if (response.ok) {
                    clearMessage();
                    document.getElementById('display-date').value = payload.date;
                    document.getElementById('reservedBy').value = '';
                    // 自分の画面も即更新
                    await loadReservations();
                }
                else if (response.status === 400) {
                    const errorObj =await response.json();
                    showError(errorObj.message);
                }
                else {
                    showError('エラーが発生しました。');
                }
            } catch (e) {
                console.error("POST追加エラー:",e);
            }
        }
    );
// =====================
// DELETE
// =====================
async function deleteReservation(id) {
    if (!confirm('本当に削除しますか？'))
        return;
    try {
        const response =await fetch(`${API_URL}/delete/${id}`,
                {
                    method: 'POST'
                }
            );
        if (response.ok) {
            // 自分の画面も即更新
            await loadReservations();
        }
    } catch (e) {
        console.error("POST削除エラー:",e);
    }
}
// =====================
// 起動
// =====================
initApp();

// const API_URL = 'https://localhost:7209/api/reservation';  
// let allReservations = []; 
// function clearMessage() { 
//     document.getElementById("message-area").innerHTML = ""; 
// } 
// function showError(message) { 
//     document.getElementById("message-area").innerHTML = <div class="alert alert-danger" role="alert"> ${message} </div> ; 
// } 
// function initApp() { 
//     const today = new Date().toISOString().split('T')[0]; 
//     document.getElementById('display-date').value = today; 
//     document.getElementById('bookingDate').value = today; 
//     loadReservations(); 
// } 
// function filterDisplay() { 
//     const targetDate = document.getElementById('display-date').value; 
//     const tbody = document.getElementById('reservation-list'); 
//     const filteredData = allReservations.filter(item => item.date === targetDate); 
//     if (filteredData.length === 0) { 
//         tbody.innerHTML = <tr><td colspan="5">選択された日付（${targetDate}）の予約はありません。</td></tr>;
//         return; 
//     } 
//     tbody.innerHTML = filteredData.map(item => { const endHour = item.startHour + item.duration; 
//     return 
//     <tr> <td>${item.date}</td> 
//     <td><strong>${item.roomName}</strong></td> 
//     <td>${item.startHour}:00 - ${endHour}:00 (${item.duration}時間)</td> 
//     <td>${item.reservedBy}</td> 
//     <td><button class="btn btn-danger" onclick="deleteReservation(${item.id})">削除</button></td> </tr> ;
//     }).join(''); 
// } 
// async function loadReservations() { 
//     try { 
//         const response = await fetch(API_URL); 
//         if (response.ok) { 
//             allReservations = await response.json(); 
//             filterDisplay();
//         } 
//     } catch (e) { 
//         console.error("GETエラー:", e); 
//     } 
// } // POST: 予約の追加（重複エラーハンドリング対応） 
// document.getElementById('booking-form').addEventListener('submit', async (e) => 
//     { e.preventDefault(); const payload = { 
//         date: document.getElementById('bookingDate').value, 
//         roomName: document.getElementById('roomName').value, 
//         startHour: parseInt(document.getElementById('startHour').value), 
//         duration: parseInt(document.getElementById('duration').value), 
//         reservedBy: document.getElementById('reservedBy').value }; 
//         try { 
//             const response = await fetch(API_URL, 
//                 { method: 'POST', headers: { 'Content-Type': 'application/json' }, 
//                 body: JSON.stringify(payload) }); 
//                 if (response.ok) {  
//                     clearMessage(); 
//                     allReservations = await response.json(); 
//                     document.getElementById('display-date').value = payload.date; 
//                     filterDisplay(); 
//                     document.getElementById('reservedBy').value = ''; 
//                 } else if (response.status === 400) {  
//                     const errorObj = await response.json(); 
//                     showError(errorObj.message); 
//                 } else { showError('エラーが発生しました．'); } 
//         } catch (e) { console.error("POST追加エラー:", e); } 
//     }); 
// async function deleteReservation(id) { 
//     if (!confirm('本当に削除しますか？')) return; 
//     try { 
//         const response = await fetch(`${API_URL}/delete/${id}`, { method: 'POST' }); 
//         if (response.ok) { 
//             allReservations = await response.json(); 
//             filterDisplay(); 
//         } 
//     } catch (e) { console.error("POST削除エラー:", e); } } 
//     initApp();