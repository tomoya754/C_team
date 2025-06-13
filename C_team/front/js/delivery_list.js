// 検索ボタンのクリックイベント
const searchBtn = document.getElementById('searchBtn');
if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        const keyword = document.getElementById('searchInput').value;
        alert('検索: ' + keyword);
    });
}

// フィルターボタンのクリックイベント
const filterBtn = document.getElementById('filterBtn');
if (filterBtn) {
    filterBtn.addEventListener('click', () => {
        alert('フィルター機能は未実装です');
    });
}

// 新規納品書作成ボタン
const createBtn = document.getElementById('createBtn');
if (createBtn) {
    createBtn.addEventListener('click', () => {
        alert('新規納品書作成画面へ遷移（未実装）');
    });
}

// 納品書削除ボタン
const deleteBtn = document.getElementById('deleteBtn');
if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
        alert('選択した納品書を削除（未実装）');
    });
}
