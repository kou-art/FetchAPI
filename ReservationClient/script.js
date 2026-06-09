const API_URL = 'https://localhost:7291/api/reservations';
let allReservations = [];
const today = new Date().toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" ,
        year: "numeric",  // 年を数字で（2026）
        month: "2-digit", // 月を2桁で（06）
        day: "2-digit"    // 日を2桁で（08）
    })
    .replaceAll('/', '-');
document.getElementById('bookingDate').min = today;
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
function initApp() { 
    document.getElementById('display-date').value = today; 
    document.getElementById('bookingDate').value = today; 
    loadReservations(); 
} 
function filterDisplay() { 
     const targetDate = document.getElementById('display-date').value; 
     const tbody = document.getElementById('reservation-list'); 
     const filteredData = allReservations.filter(item => item.startDate.split('T')[0] === targetDate); 
     if (filteredData.length === 0) { 
         tbody.innerHTML = `<tr><td colspan="5">選択された日付（${targetDate}）の予約はありません。</td></tr>`;       
         return; 
     } 
     tbody.innerHTML = filteredData.map(item => { 
     return `
     <tr>
     <td><strong>${item.conferenceName}</strong></td> 
     <td>${item.startDate.split('T')[1].slice(0, 5)} - ${item.endDate.split('T')[1].slice(0, 5)}</td> 
     <td>${item.reservationName}</td> 
     <td><button class="btn btn-danger" onclick="deleteReservation(${item.id})">削除</button></td> </tr> `;
     }).join(''); 
} 
async function loadReservations() {
    clearMessage();
    const displayDate = document.getElementById('display-date').value;
    if (!displayDate) return;

    try {
        // コントローラーの [FromQuery] DateOnly date に合わせてパラメータを付与
        const response = await fetch(`${API_URL}?date=${displayDate}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) { 
            allReservations = await response.json(); 
            filterDisplay();
        } 

    } catch (error) {
        console.error("GETエラー:", error);
    }
}

async function createReservation(event) {
    event.preventDefault(); // フォームのデフォルトの画面リロードを防止
    clearMessage();

    const conferenceName = document.getElementById('conferenceName').value;
    const bookingDate = document.getElementById('bookingDate').value;
    const startTimeRaw = document.getElementById('startTime').value; 
    const endTimeRaw = document.getElementById('endTime').value;     
    const reservationName = document.getElementById('reservationName').value;

    // サーバーの TimeOnly 変換失敗を防ぐため、秒数（:00）を強制付与する
    const formatTimeOnly = (timeStr) => {
        if (!timeStr) return "00:00:00";
        return timeStr.split(':').length === 2 ? `${timeStr}:00` : timeStr;
    };

    // サーバーの camelCase ポリシーに合わせたオブジェクト構造
    const bodyData = {
        confrenceName: conferenceName, // C#の「ReservationCreate.ConfrenceName」に対応
        date: bookingDate,
        startTime: formatTimeOnly(startTimeRaw),
        endTime: formatTimeOnly(endTimeRaw),
        reservationName: reservationName
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(bodyData)
        });

        // コントローラー内のバリデーションに引っかかった場合
        if (response.status === 400) {
            const errorText = await response.text();
            showError(errorText); 
            return;
        }
        else if (response.ok) {  
            clearMessage();
            document.getElementById('display-date').value = bodyData.date;  
            document.getElementById('bookingDate').value = today; 
            document.getElementById('reservationName').value = '';
            document.getElementById('startTime').value = '';
            document.getElementById('endTime').value = '';
            loadReservations(); 
        }

    } catch (error) {
        console.error("POST追加エラー:", error);
    }
}
async function deleteReservation(id) {
    clearMessage();

    try {
        // コントローラーの [HttpDelete("{id}")] に合わせてパスにIDを結合
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json'
            },
        });

        if (response.ok) {
            await loadReservations();
        }
    } catch (error) {
        console.error("DELETE削除エラー:", error);
    }
}

// 表示日付（display-date）が変更されたら、自動でその日の予約一覧をリロードする
document.getElementById('display-date').addEventListener('change', loadReservations);

// 予約フォーム（IDは仮に booking-form としています）の送信イベントにフックする
const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
    bookingForm.addEventListener('submit', createReservation);
}


initApp();