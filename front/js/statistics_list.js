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
                    <td class="note-cell">${stat.note ? stat.note.replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''}</td>
                `;
                // 備考欄インライン編集
                const noteCell = tr.querySelector('.note-cell');
                noteCell.addEventListener('click', function(e) {
                    e.stopPropagation();
                    if (noteCell.querySelector('textarea')) return;
                    const oldValue = noteCell.textContent;
                    noteCell.innerHTML = `<textarea style="width:90%;min-height:28px;resize:vertical;">${oldValue}</textarea><button class="note-save-btn" style="margin-left:4px;">保存</button>`;
                    const textarea = noteCell.querySelector('textarea');
                    const saveBtn = noteCell.querySelector('.note-save-btn');
                    textarea.focus();
                    function saveNote() {
                        const newNote = textarea.value;
                        fetch(`http://localhost:3000/api/statistics/${stat.customerId}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ note: newNote })
                        }).then(res => {
                            if (res.ok) {
                                noteCell.innerHTML = newNote.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                            } else {
                                alert('備考の保存に失敗しました');
                                noteCell.innerHTML = oldValue;
                            }
                        }).catch(() => {
                            alert('通信エラー');
                            noteCell.innerHTML = oldValue;
                        });
                        document.removeEventListener('mousedown', outsideClickHandler, true);
                    }
                    saveBtn.addEventListener('click', saveNote);
                    textarea.addEventListener('keydown', function(ev) {
                        if (ev.key === 'Enter' && !ev.shiftKey) {
                            ev.preventDefault();
                            saveNote();
                        } else if (ev.key === 'Escape') {
                            noteCell.innerHTML = oldValue;
                            document.removeEventListener('mousedown', outsideClickHandler, true);
                        }
                    });
                    // 備考欄以外クリックでキャンセル
                    function outsideClickHandler(ev) {
                        if (!noteCell.contains(ev.target)) {
                            noteCell.innerHTML = oldValue;
                            document.removeEventListener('mousedown', outsideClickHandler, true);
                        }
                    }
                    setTimeout(() => {
                        document.addEventListener('mousedown', outsideClickHandler, true);
                    }, 0);
                });
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
