// 店舗名→ID変換マップ
const storeNameToId = {
    '全店舗': 0,
    '緑橋本店': 1,
    '深江橋店': 2,
    '今里店': 3
};

// 統計データ取得＆表示関数
function fetchAndDisplayStatistics(storeId = 0) {
    let url = 'http://localhost:3000/api/statistics';
    if (storeId && storeId !== 0) {
        url += `?storeId=${storeId}`;
    }
    fetch(url)
        .then(res => res.json())
        .then(data => {
            // ここでテーブル描画処理を実装
            // 例: console.log(data);
        })
        .catch(err => {
            console.error('統計データ取得エラー:', err);
        });
}

// ページロード時に全店舗で取得
fetchAndDisplayStatistics(0);

// 店舗選択時のイベント
const storeSelect = document.querySelector('.store-select');
if (storeSelect) {
    storeSelect.addEventListener('change', function() {
        const selectedName = storeSelect.value;
        const storeId = storeNameToId[selectedName] || 0;
        fetchAndDisplayStatistics(storeId);
    });
}
