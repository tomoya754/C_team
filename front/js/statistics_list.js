// 店舗名→ID変換マップ
const storeNameToId = {
    '全店舗': 0,
    '緑橋本店': 1,
    '深江橋店': 2,
    '今里店': 3
};

// 統計データ取得＆表示関数（検索キーワード対応）
function fetchAndDisplayStatistics(storeId = 0, keyword = '') {
    let url = 'http://localhost:3000/api/statistics';
    if (storeId && storeId !== 0) {
        url += `?storeId=${storeId}`;
    }
    fetch(url)
        .then(res => res.json())
        .then(data => {
            // 検索キーワードでフィルタ（顧客IDまたは顧客名に完全一致）
            if (keyword) {
                const lower = keyword.toLowerCase();
                data = data.filter(stat =>
                    (stat.customerId && stat.customerId.toLowerCase() === lower) ||
                    (stat.customerName && stat.customerName.toLowerCase() === lower)
                );
            }
            // 統計情報テーブルのtbodyを取得
            const tbody = document.querySelector('.statistics-list-table tbody');
            if (!tbody) return;
            tbody.innerHTML = '';
            if (!data || data.length === 0) {
                // データがない場合は空行を表示
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">データがありません</td></tr>';
                return;
            }
            data.forEach(stat => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${stat.customerId || ''}</td>
                    <td>${stat.customerName || ''}</td>
                    <td>${stat.address || ''}</td>
                    <td>￥${stat.totalSales != null ? stat.totalSales.toLocaleString() : ''}</td>
                    <td>${stat.averageLeadTime || '-'}</td>
                    <td>${stat.orderCount || ''}回</td>
                    <td>${stat.lastOrderDate || ''}</td>
                    <td>${stat.note || ''}</td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => {
            console.error('統計データ取得エラー:', err);
        });
}

// ページロード時に全店舗で取得
fetchAndDisplayStatistics(0);

// 検索ボタンのイベント
const searchBtn = document.querySelector('.search-btn');
const searchInput = document.querySelector('.search-input');
if (searchBtn) {
    searchBtn.addEventListener('click', function() {
        const keyword = searchInput.value.trim();
        const storeSelect = document.querySelector('.store-select');
        const selectedName = storeSelect ? storeSelect.value : '全店舗';
        const storeId = storeNameToId[selectedName] || 0;
        fetchAndDisplayStatistics(storeId, keyword);
    });
}

// 検索ボックスでエンターキー押下時も検索
if (searchInput) {
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const keyword = searchInput.value.trim();
            const storeSelect = document.querySelector('.store-select');
            const selectedName = storeSelect ? storeSelect.value : '全店舗';
            const storeId = storeNameToId[selectedName] || 0;
            fetchAndDisplayStatistics(storeId, keyword);
        }
    });
}

// 店舗選択時のイベント
const storeSelect = document.querySelector('.store-select');
if (storeSelect) {
    storeSelect.addEventListener('change', function() {
        const selectedName = storeSelect.value;
        const storeId = storeNameToId[selectedName] || 0;
        const keyword = document.querySelector('.search-input').value.trim();
        fetchAndDisplayStatistics(storeId, keyword);
    });
}
