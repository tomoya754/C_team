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

// 注文書一覧をAPIから取得してテーブルに表示
fetch('http://localhost:3000/api/orders')
    .then(res => res.json())
    .then(data => {
        const tbody = document.getElementById('orders-tbody');
        tbody.innerHTML = '';
        data.forEach(order => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${order.orderId}</td>
                <td>${order.customerId}</td>
                <td>${order.customerName}</td>
                <td>${order.orderDetail}</td>
                <td>${order.phone}</td>
                <td>${order.orderDate}</td>
                <td>-</td>
                <td>${order.note || ''}</td>
            `;
            tbody.appendChild(tr);
        });
    })
    .catch(err => {
        console.error('注文データ取得エラー:', err);
    });
