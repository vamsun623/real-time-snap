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
            await fetch(API_URL, {
                method: "POST",
                mode: "no-cors", // Apps Script doPost 限制
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "record",
                    name: name,
                    isWin: isWin,
                    isDraw: isDraw
                })
            });
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
