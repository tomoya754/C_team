document.addEventListener('DOMContentLoaded', function() {
// 確認ダイアログ表示
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

// 削除ボタン
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
                            fetchAndDisplayOrders(0);
                        } else {
                            alert('削除に失敗しました');
                        }
                    });
            },
            null
        );
    });
}
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
                    <td class="note-cell">${order.note ? order.note.replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''}</td>
                `;
                // 備考欄セル取得
                const noteCell = tr.querySelector('.note-cell');
                // インライン編集機能
                noteCell.addEventListener('click', function(e) {
                    e.stopPropagation();
                    // すでに編集中なら何もしない
                    if (noteCell.querySelector('textarea')) return;
                    const oldValue = noteCell.textContent;
                    noteCell.innerHTML = `<textarea style="width:90%;min-height:28px;resize:vertical;">${oldValue}</textarea><button class="note-save-btn" style="margin-left:4px;">保存</button>`;
                    const textarea = noteCell.querySelector('textarea');
                    const saveBtn = noteCell.querySelector('.note-save-btn');
                    textarea.focus();
                    // 保存処理
                    function saveNote() {
                        const newNote = textarea.value;
                        fetch(`http://localhost:3000/api/orders/${order.orderId}`, {
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
                // 行クリックで詳細画面へ遷移（備考欄セル以外）
                tr.style.cursor = 'pointer';
                tr.addEventListener('click', function(e) {
                    // ラジオボタンや備考欄のクリックは除外
                    if (e.target.tagName.toLowerCase() === 'input' || e.target.classList.contains('note-save-btn') || e.target.tagName.toLowerCase() === 'textarea') return;
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
