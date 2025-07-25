// 統計情報テーブルの顧客IDリストを取得し、差分同期APIに送信する関数
async function syncCustomersFromStatistics() {
    // テーブルから顧客IDリストを取得
    const rows = document.querySelectorAll('.statistics-list-table tbody tr');
    const customerIds = [];
    rows.forEach(tr => {
        const idCell = tr.querySelector('td');
        if (idCell) {
            const val = idCell.textContent.trim();
            if (val && !isNaN(val)) customerIds.push(Number(val));
        }
    });
    if (customerIds.length === 0) {
        alert('同期対象の顧客がありません');
        return;
    }
    // APIに送信
    try {
        const res = await fetch('http://localhost:3000/api/customers/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerIds })
        });
        const result = await res.json();
        if (result.success) {
            alert('顧客データの同期が完了しました');
            fetchAndDisplayStatistics(); // 再取得
        } else {
            alert('同期に失敗しました: ' + (result.error || '')); 
        }
    } catch (e) {
        alert('同期エラー: ' + e.message);
    }
}

// 同期ボタンを画面に追加
window.addEventListener('DOMContentLoaded', function() {
    const btn = document.createElement('button');
    btn.textContent = '統計一覧の顧客で同期';
    btn.className = 'sync-customers-btn';
    btn.style.margin = '10px';
    btn.addEventListener('click', syncCustomersFromStatistics);
    const table = document.querySelector('.statistics-list-table');
    if (table && table.parentNode) {
        table.parentNode.insertBefore(btn, table);
    }
});
// 店舗名→ID変換マップ
const storeNameToId = {
    '全店舗': 0,
    '緑橋本店': 1,
    '深江橋店': 2,
    '今里店': 3
};

// 統計データ取得＆表示関数（検索キーワード対応）
function fetchAndDisplayStatistics(storeId = 0, keyword = '') {
    // 並び替え条件取得
    const sortKeySelect = document.querySelector('.sort-key');
    const sortOrderSelect = document.querySelector('.sort-order');
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

// 並び替え条件変更時のイベント
const sortKeySelect = document.querySelector('.sort-key');
const sortOrderSelect = document.querySelector('.sort-order');
if (sortKeySelect) {
    sortKeySelect.addEventListener('change', function() {
        const storeSelect = document.querySelector('.store-select');
        const selectedName = storeSelect ? storeSelect.value : '全店舗';
        const storeId = storeNameToId[selectedName] || 0;
        const keyword = document.querySelector('.search-input').value.trim();
        fetchAndDisplayStatistics(storeId, keyword);
    });
}
if (sortOrderSelect) {
    sortOrderSelect.addEventListener('change', function() {
        const storeSelect = document.querySelector('.store-select');
        const selectedName = storeSelect ? storeSelect.value : '全店舗';
        const storeId = storeNameToId[selectedName] || 0;
        const keyword = document.querySelector('.search-input').value.trim();
        fetchAndDisplayStatistics(storeId, keyword);
    });
}
