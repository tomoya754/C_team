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

let deleteMode = false;

// ラジオボタン常時表示
function fetchAndDisplayDeliveries(storeId = 0) {
    let url = 'http://localhost:3000/api/deliveries';
    if (storeId && storeId !== 0) {
        url += `?storeId=${storeId}`;
    }
    fetch(url)
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector('.orders-table tbody');
            tbody.innerHTML = '';
            data.forEach(delivery => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><input type='radio' name='deleteRadio' value='${delivery.deliveryId}'></td>
                    <td>${delivery.deliveryId}</td>
                    <td><a href="/html/delivery_form.html?deliveryId=${delivery.deliveryId}" class="customer-link">${delivery.customerName}</a></td>
                    <td>${delivery.orderDetail}</td>
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
}

// 納品書一覧をAPIから取得してテーブルに表示
document.addEventListener('DOMContentLoaded', function() {
    // 初期表示（全店舗）
    fetchAndDisplayDeliveries(0);
    // 店舗切り替えイベント
    const storeSelect = document.getElementById('storeSelect');
    if (storeSelect) {
        storeSelect.addEventListener('change', function() {
            const storeId = Number(storeSelect.value) || 0;
            fetchAndDisplayDeliveries(storeId);
        });
    }
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

// 確認ダイアログ表示
function showDeleteConfirmDialog(onYes, onNo) {
    // 既存ダイアログがあれば削除
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

// 削除ボタン
const deleteBtn = document.querySelector('.delete-btn');
if (deleteBtn) {
    deleteBtn.addEventListener('click', function() {
        const checked = document.querySelector("input[name='deleteRadio']:checked");
        if (!checked) {
            alert('削除する納品書を選択してください');
            return;
        }
        const deliveryId = checked.value;
        showDeleteConfirmDialog(
            () => {
                fetch(`http://localhost:3000/api/deliveries/${deliveryId}`, { method: 'DELETE' })
                    .then(res => {
                        if (res.ok) {
                            alert(`納品書${deliveryId}削除しました`);
                            fetchAndDisplayDeliveries(0);
                        } else {
                            alert('削除に失敗しました');
                        }
                    });
            },
            null
        );
    });
}
