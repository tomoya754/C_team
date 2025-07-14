document.addEventListener('DOMContentLoaded', function() {
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

// 店舗名→ID変換用マップ
const storeNameToId = {
    '全店舗': 0,
    '緑橋本店': 1,
    '深江橋店': 2,
    '今里店': 3
};

// 注文データ取得＆表示関数
function fetchAndDisplayOrders(storeId = 0) {
    let url = 'http://localhost:3000/api/orders';
    if (storeId && storeId !== 0) {
        url += `?storeId=${storeId}`;
    }
    fetch(url)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('orders-tbody');
            tbody.innerHTML = '';
            // orderIdで重複排除
            const uniqueOrders = [];
            const seenIds = new Set();
            data.forEach(order => {
                if (!seenIds.has(order.orderId)) {
                    uniqueOrders.push(order);
                    seenIds.add(order.orderId);
                }
            });
            uniqueOrders.forEach(order => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><input type="radio" name="deleteRadio" value="${order.orderId}"></td>
                    <td>${order.orderId}</td>
                    <td>${order.customerId}</td>
                    <td>${order.customerName}</td>
                    <td>${order.orderDetail}</td>
                    <td>${order.phone}</td>
                    <td>${order.orderDate}</td>
                    <td>${order.note || ''}</td>
                `;
                // 行クリックで詳細画面へ遷移
                tr.style.cursor = 'pointer';
                tr.addEventListener('click', function(e) {
                    // ラジオボタンのクリックは除外
                    if (e.target.tagName.toLowerCase() === 'input') return;
                    window.location.href = `/html/order_form.html?orderId=${order.orderId}`;
                });
                tbody.appendChild(tr);
            });
        })
        .catch(err => {
            console.error('注文データ取得エラー:', err);
        });
}

// ページロード時に全店舗で取得
fetchAndDisplayOrders(0);

// 店舗選択時のイベント
const storeSelect = document.querySelector('.store-select');
if (storeSelect) {
    storeSelect.addEventListener('change', function() {
        const selectedName = storeSelect.value;
        const storeId = storeNameToId[selectedName] || 0;
        fetchAndDisplayOrders(storeId);
    });
}});
