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
            data.forEach(order => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${order.orderId}</td>
                    <td>${order.customerId}</td>
                    <td>${order.customerName}</td>
                    <td>${order.orderDetail}</td>
                    <td>${order.phone}</td>
                    <td>${order.orderDate}</td>
                    <td>${order.note || ''}</td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => {
            console.error('注文データ取得エラー:', err);
        });
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
                <td><a href="/html/order_form.html?orderId=${order.orderId}" class="customer-link">${order.customerName}</a></td>
                <td>${order.orderDetail}</td>
                <td>${order.phone}</td>
                <td>${order.orderDate}</td>
                <td>${order.note || ''}</td>
            `;
            tbody.appendChild(tr);

        });
    })
}

// 注文書一覧をAPIから取得してテーブルに表示
fetchAndDisplayOrders();

    function showDeleteConfirmDialog(onYes, onNo) {
        document.getElementById('deleteConfirmDialog')?.remove();
        const dialog = document.createElement('div');
        dialog.id = 'deleteConfirmDialog';
        dialog.style.position = 'fixed';
        dialog.style.left = '0';
        dialog.style.top = '0';
        dialog.style.width = '100vw';
        dialog.style.height = '100vh';
        dialog.style.background = 'rgba(0,0,0,0.18)';
        dialog.style.zIndex = '9999';
        dialog.style.display = 'flex';
        dialog.style.alignItems = 'center';
        dialog.style.justifyContent = 'center';
        dialog.innerHTML = `
          <div style="background:#fff;padding:28px 32px 20px 32px;border-radius:8px;min-width:260px;max-width:90vw;box-shadow:0 4px 24px #0002;text-align:center;">
            <div style='font-size:1.1em;margin-bottom:18px;'>ゴミ箱に移動しても<br>よろしいですか？</div>
            <div style='display:flex;justify-content:center;gap:18px;'>
              <button id='deleteYesBtn' style='background:#e53935;color:#fff;border:none;padding:7px 28px;font-size:1em;border-radius:4px;'>はい</button>
              <button id='deleteNoBtn' style='background:#fff;border:1.5px solid #888;color:#444;padding:7px 28px;font-size:1em;border-radius:4px;'>いいえ</button>
            </div>
          </div>
        `;
        document.body.appendChild(dialog);
        dialog.querySelector('#deleteYesBtn').onclick = () => { dialog.remove(); onYes(); };
        dialog.querySelector('#deleteNoBtn').onclick = () => { dialog.remove(); if(onNo) onNo(); };
    }

    const deleteBtn = document.querySelector('.delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            const checked = document.querySelector("input[name='deleteRadio']:checked");
            if (!checked) {
                alert('削除する注文書を選択してください');
                return;
            }
            const orderId = checked.value;
            showDeleteConfirmDialog(
                () => {
                    fetch(`http://localhost:3000/api/orders/${orderId}`, { method: 'DELETE' })
                        .then(res => {
                            if (res.ok) {
                                alert(`注文書${orderId}削除しました`);
                                fetchAndDisplayOrders();
                            } else {
                                alert('削除に失敗しました');
                            }
                        });
                },
                null
            );
        });
    }
});
