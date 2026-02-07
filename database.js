// Google Sheets Database Interface
// 使用者需要在下方填入部署後的 Apps Script URL
const API_URL = "https://script.google.com/macros/s/AKfycbxysNR6MmdOwlZ1c0On8gN4auK3PZAosVI0QsN1rZzEopXHqIem5YQRjOsNk9n9FUrS/exec";

const Database = {
    async recordResult(name, result) {
        if (!name) return;

        const isWin = result === 'win';
        const isDraw = result === 'draw';

        // 先存到 LocalStorage 作為備份
        this.saveLocal(name, result);

        if (!API_URL) {
            console.warn("API_URL 未設定，僅儲存於本地。");
            return;
        }

        try {
            // 使用 GET 請求傳送資料，避免 CORS 複雜度以及 Apps Script POST 重定向問題
            const url = new URL(API_URL);
            url.searchParams.append('action', 'record');
            url.searchParams.append('name', name);
            url.searchParams.append('isWin', isWin);
            url.searchParams.append('isDraw', isDraw);

            // 用 fetch 的 no-cors 模式，雖然看不到回應但請求會發出去
            fetch(url.toString(), { mode: 'no-cors' });
            console.log("資料已發送至試算表: " + url.toString());
            // 暫時加上一個通知，確認程式碼有執行到這
            alert("正在上傳戰績至 Google 表格...");
        } catch (e) {
            console.error("Database Error:", e);
        }
    },

    async getStats(name) {
        if (!name) return { wins: 0, losses: 0, draws: 0 };

        if (!API_URL) {
            return this.getLocal(name);
        }

        try {
            // 注意：因為 no-cors 模式無法取得回傳值，
            // 正常的做法是使用 LocalStorage 累加，或者讓伺服器端處理 Redirect。
            // 這裡我們先回傳本地數據並嘗試與遠端同步
            return this.getLocal(name);
        } catch (e) {
            return this.getLocal(name);
        }
    },

    // 輔助工具：本地備份
    saveLocal(name, result) {
        let stats = JSON.parse(localStorage.getItem(`stats_${name}`)) || { wins: 0, losses: 0, draws: 0 };
        if (result === 'win') stats.wins++;
        else if (result === 'draw') stats.draws++;
        else stats.losses++;
        localStorage.setItem(`stats_${name}`, JSON.stringify(stats));
    },

    getLocal(name) {
        return JSON.parse(localStorage.getItem(`stats_${name}`)) || { wins: 0, losses: 0, draws: 0 };
    }
};
