// 店舗名→ID変換マップ
const storeNameToId = {
    '全店舗': 0,
    '緑橋本店': 1,
    '深江橋店': 2,
    '今里店': 3
};

// 統計データ取得＆表示関数（検索・ソート・店舗対応）
function fetchAndDisplayStatistics() {
    // 各条件を取得
    const storeSelect = document.querySelector('.store-select');
    const searchInput = document.querySelector('.search-input');
    const sortKeySelect = document.querySelector('.sort-key');
    const sortOrderSelect = document.querySelector('.sort-order');
    const selectedName = storeSelect ? storeSelect.value : '全店舗';
    const storeId = storeNameToId[selectedName] || 0;
    const keyword = searchInput ? searchInput.value.trim() : '';
    let sortKey = 'totalSales';
    let sortOrder = 'desc';
    if (sortKeySelect) {
        const keyText = sortKeySelect.value;
        if (keyText === '累計売上') sortKey = 'totalSales';
        else if (keyText === 'リードタイム') sortKey = 'averageLeadTime';
        else if (keyText === '購入回数') sortKey = 'orderCount';
    }
    if (sortOrderSelect) {
        sortOrder = sortOrderSelect.value === '昇順' ? 'asc' : 'desc';
    }
    let url = `http://localhost:3000/api/statistics?sortKey=${sortKey}&sortOrder=${sortOrder}`;
    if (storeId && storeId !== 0) {
        url += `&storeId=${storeId}`;
    }
    fetch(url)
        .then(res => res.json())
        .then(data => {
            // 検索キーワードでフィルタ（顧客IDまたは顧客名に部分一致）
            if (keyword) {
                const lower = keyword.toLowerCase();
                data = data.filter(stat => {
                    const id = stat.customerId ? stat.customerId.toString().trim().toLowerCase() : '';
                    const name = stat.customerName ? stat.customerName.trim().toLowerCase() : '';
                    return id.includes(lower) || name.includes(lower);
                });
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

// ページロード時に全条件で取得
fetchAndDisplayStatistics();

// 共通で再取得するイベントハンドラ
function setStatisticsListEventHandlers() {
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.querySelector('.search-input');
    const storeSelect = document.querySelector('.store-select');
    const sortKeySelect = document.querySelector('.sort-key');
    const sortOrderSelect = document.querySelector('.sort-order');
    if (searchBtn) {
        searchBtn.addEventListener('click', fetchAndDisplayStatistics);
    }
    if (searchInput) {
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') fetchAndDisplayStatistics();
        });
    }
    if (storeSelect) {
        storeSelect.addEventListener('change', fetchAndDisplayStatistics);
    }
    if (sortKeySelect) {
        sortKeySelect.addEventListener('change', fetchAndDisplayStatistics);
    }
    if (sortOrderSelect) {
        sortOrderSelect.addEventListener('change', fetchAndDisplayStatistics);
    }
}
setStatisticsListEventHandlers();
