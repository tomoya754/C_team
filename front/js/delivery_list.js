// サイドバー開閉
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const sidebarBg = document.getElementById('sidebarBg');
const sidebarClose = document.getElementById('sidebarClose');
function openSidebar() {
    sidebar.classList.add('open');
    sidebarBg.classList.add('show');
    menuBtn.style.display = 'none';
    sidebarClose.style.display = 'block';
}
function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarBg.classList.remove('show');
    menuBtn.style.display = 'block';
    sidebarClose.style.display = 'none';
}
menuBtn.onclick = openSidebar;
sidebarClose.onclick = closeSidebar;
sidebarBg.onclick = closeSidebar;

// 納品書一覧をAPIから取得してテーブルに表示
document.addEventListener('DOMContentLoaded', function() {
    fetch('http://localhost:3000/api/deliveries')
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector('.orders-table tbody');
            tbody.innerHTML = '';
            data.forEach(delivery => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${delivery.deliveryId}</td>
                    <td>${delivery.customerName}</td>
                    <td><a href="#">${delivery.orderDetail}</a></td>
                    <td>${delivery.phone}</td>
                    <td>${delivery.deliveryDate}</td>
                    <td>${delivery.deliveryStatus}</td>
                    <td>${delivery.note || ''}</td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => {
            alert('データ取得エラー');
            console.error(err);
        });
});

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
