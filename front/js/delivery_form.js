// delivery_form.js
// 納品書の保存・印刷ボタン機能

document.addEventListener('DOMContentLoaded', function () {

    // 保存ボタンのイベントリスナー
    // 保存ボタンの処理にundeliveredQuantity更新を追加
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async function (e) {
            e.preventDefault();

            // 保存ボタンのイベントリスナーが重複しないようにする
            saveBtn.disabled = true;

            try {
                // 入力値の取得
                const customerId = document.querySelector('input[name="customerId"]')?.value.trim();
                const customerName = document.querySelector('input[name="customerName"]')?.value.trim();
                const deliveryNo = document.querySelector('input[placeholder="XXXXXXXXXX"]')?.value.trim();
                const deliveryDate = document.querySelector('input[type="date"]')?.value.trim();
                const items = [];
                for (let i = 1; i <= 12; i++) {
                    const item = document.querySelector(`input[name="item${i}"]`)?.value.trim();
                    const qty = document.querySelector(`input[name="qty${i}"]`)?.value.trim();
                    const price = document.querySelector(`input[name="price${i}"]`)?.value.trim();
                    const amount = document.querySelector(`input[name="amount${i}"]`)?.value.trim();
                    const orderDetailId = document.querySelector(`input[name="orderDetailId${i}"]`)?.value.trim();
                    const orderId = document.querySelector(`input[name="orderId${i}"]`)?.value.trim();
                    if (item || qty || price || amount) {
                        items.push({
                            bookTitle: item,
                            quantity: qty,
                            unitPrice: price,
                            amount,
                            orderDetailId,
                            orderId
                        });
                    }
                }

                // バリデーション
                if (!customerId) {
                    alert('顧客IDを入力してください');
                    saveBtn.disabled = false;
                    return;
                }
                if (items.length === 0) {
                    alert('明細を1つ以上追加してください');
                    saveBtn.disabled = false;
                    return;
                }

                // サーバーに送るデータ
                const data = {
                    customerId,
                    customerName,
                    deliveryNo,
                    deliveryDate,
                    items
                };
                console.log('送信データ:', data);

                // fetchでPOST
                const res = await fetch('http://localhost:3000/api/deliveries', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (!res.ok) {
                    throw new Error(`HTTPエラー: ${res.status}`);
                }
                const result = await res.json();
                alert('保存しました');

                // undeliveredQuantityを更新
                await updateUndeliveredQuantities(items);
            } catch (err) {
                console.error(err);
                alert('保存に失敗しました');
            } finally {
                saveBtn.disabled = false;
            }
        });
    }
    // 読み込み（自動）
    const saved = localStorage.getItem('deliveryFormData');
    if (saved) {
        setDeliveryFormData(JSON.parse(saved));
    }
    // 印刷ボタン
    const printBtn = document.getElementById('printBtn');
    if (printBtn) {
        printBtn.addEventListener('click', function () {
            window.print();
        });
    }
    // ▼▼▼ 自動計算機能追加 ▼▼▼
    function calcTotals() {
        let subtotal = 0;
        let hasInput = false;
        for (let i = 1; i <= 12; i++) {
            const qtyVal = document.querySelector(`input[name="qty${i}"]`)?.value;
            const priceVal = document.querySelector(`input[name="price${i}"]`)?.value;
            const qty = Number(qtyVal);
            const price = Number(priceVal);
            const amountInput = document.querySelector(`input[name="amount${i}"]`);
            const amount = (qtyVal !== '' && priceVal !== '') ? qty * price : '';
            if (amountInput) amountInput.value = amount !== '' ? amount : '';
            if ((qtyVal && qtyVal !== '0') || (priceVal && priceVal !== '0')) hasInput = true;
            subtotal += amount !== '' ? amount : 0;
        }
        const tax = hasInput ? Math.floor(subtotal * 0.1) : 0;
        const total = hasInput ? subtotal + tax : 0;
        // テーブル下部
        const totalInputs = document.querySelectorAll('.input-total');
        if (totalInputs.length >= 3) {
            totalInputs[0].value = hasInput ? subtotal : 0;
            totalInputs[1].value = hasInput ? tax : 0;
            totalInputs[2].value = hasInput ? total : 0;
        }
        // 上部合計金額
        const totalAmount = document.getElementById('totalAmount');
        if (totalAmount) totalAmount.textContent = total;
    }
    // 数量・単価入力時に自動計算
    for (let i = 1; i <= 12; i++) {
        const qtyInput = document.querySelector(`input[name="qty${i}"]`);
        const priceInput = document.querySelector(`input[name="price${i}"]`);
        if (qtyInput) qtyInput.addEventListener('input', calcTotals);
        if (priceInput) priceInput.addEventListener('input', calcTotals);
    }
    // 初期化時も計算
    calcTotals();

    // 新規作成・編集判定
    const urlParams = new URLSearchParams(window.location.search);
    const deliveryId = urlParams.get('deliveryId');
    if (deliveryId) {
        // 編集時：APIから納品書データを取得してセット
        fetch(`http://localhost:3000/api/deliveries/${deliveryId}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTPエラー: ${res.status}`);
                }
                return res.json();
            })
            .then(async data => {
                setDeliveryFormData(data);
                // 納品書No.を自動セット
                const deliveryNoInput = document.getElementById('deliveryNoInput');
                if (deliveryNoInput && data.deliveryId) {
                    deliveryNoInput.value = data.deliveryId;
                }
                // 編集時はNo.欄表示
                const deliveryNoRow = document.getElementById('deliveryNoRow');
                if (deliveryNoRow) deliveryNoRow.style.display = '';
                // 顧客IDをreadonlyに
                const customerIdInput = document.getElementById('customerId');
                if (customerIdInput) customerIdInput.readOnly = true;
                // 顧客名をAPIから取得して表示
                if (data.customerId) {
                    try {
                        const res = await fetch(`http://localhost:3000/api/customers/${data.customerId}`);
                        if (res.ok) {
                            const customer = await res.json();
                            const customerNameInput = document.getElementById('customerName');
                            const addressInput = document.getElementById('customerAddress');
                            if (customerNameInput && data.customerName) {
                                customerNameInput.value = data.customerName;
                            }
                            if (addressInput && data.address) {
                                addressInput.value = data.address;
                            }
                        }
                    } catch { }
                }
            })
    } else {
        // 新規作成時：フォームを空に初期化
        document.querySelectorAll('.a4-sheet input, .a4-sheet textarea').forEach(input => {
            input.value = '';
        });
        // 納品日を本日にセット
        const deliveryDateInput = document.querySelector('.a4-sheet input[type="date"]');
        if (deliveryDateInput) {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            deliveryDateInput.value = `${yyyy}-${mm}-${dd}`;
        }
        // 納品書No.を非表示
        const deliveryNoRow = document.getElementById('deliveryNoRow');
        if (deliveryNoRow) deliveryNoRow.style.display = 'none';
    }
    // 顧客ID入力時に顧客名・住所を自動取得
    const customerIdInput = document.getElementById('customerId');
    const customerNameInput = document.getElementById('customerName');
    const addressInput = document.getElementById('customerAddress');
    if (customerIdInput) {
        customerIdInput.addEventListener('change', async function () {
            const customerId = customerIdInput.value.trim();
            if (!customerId) {
                if (customerNameInput) customerNameInput.value = '';
                if (addressInput) addressInput.value = '';
                return;
            }
            try {
                const res = await fetch(`http://localhost:3000/api/customers/${customerId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (customerNameInput) customerNameInput.value = data.customerName || '';
                    if (addressInput) addressInput.value = data.address || '';
                } else {
                    if (customerNameInput) customerNameInput.value = '';
                    if (addressInput) addressInput.value = '';
                }
            } catch {
                if (customerNameInput) customerNameInput.value = '';
                if (addressInput) addressInput.value = '';
            }
        });
    }

    // 顧客データをロードしてフォームにセットする関数
    async function loadCustomerData() {
        try {
            const res = await fetch('http://localhost:3000/api/customers/debug/all');
            if (res.ok) {
                const customers = await res.json();
                const customerIdInput = document.getElementById('customerId');
                const customerNameInput = document.getElementById('customerName');
                const addressInput = document.getElementById('customerAddress');

                if (customerIdInput && customerNameInput && addressInput) {
                    const customerId = customerIdInput.value.trim();
                    const customer = customers.find(c => c.customerId.toString() === customerId);
                    if (customer) {
                        customerNameInput.value = customer.customerName || '';
                        addressInput.value = customer.address || '';
                    } else {
                        customerNameInput.value = '';
                        addressInput.value = '';
                    }
                }
            }
        } catch (error) {
            console.error('顧客データのロードに失敗しました:', error);
        }
    }

    // ページロード時に顧客データをセット
    window.addEventListener('DOMContentLoaded', loadCustomerData);
});

function getDeliveryFormData() {
    const data = {};
    document.querySelectorAll('.a4-sheet input').forEach(input => {
        data[input.name || input.className + input.type] = input.value;
    });
    return data;
}

function setDeliveryFormData(data) {
    document.querySelectorAll('.a4-sheet input').forEach(input => {
        const key = input.name || input.className + input.type;
        if (data[key] !== undefined) input.value = data[key];
    });
}

// 検索ダイアログUI生成
async function showCustomerSearchDialog() {
    document.getElementById('customerSearchDialog')?.remove();
    // 顧客ID取得
    const customerId = document.querySelector('input[name="customerId"]')?.value.trim();
    if (!customerId) {
        alert('顧客IDを入力してください');
        return;
    }
    // APIから未納品明細取得
    let undeliveredList = [];
    try {
        const res = await fetch(`http://localhost:3000/api/order_details/undelivered?customerId=${encodeURIComponent(customerId)}`);
        const json = await res.json();
        undeliveredList = Array.isArray(json) ? json : [];
    } catch (err) {
        alert('未納品明細の取得に失敗しました');
        return;
    }
    // ダイアログ本体
    const dialog = document.createElement('div');
    dialog.id = 'customerSearchDialog';
    dialog.style.position = 'fixed';
    dialog.style.left = '0';
    dialog.style.top = '0';
    dialog.style.width = '100vw';
    dialog.style.height = '100vh';
    dialog.style.background = 'rgba(0,0,0,0.12)';
    dialog.style.zIndex = '9999';
    dialog.style.display = 'flex';
    dialog.style.alignItems = 'center';
    dialog.style.justifyContent = 'center';
    // 明細リストHTML生成
    let detailsHtml = '';
    if (undeliveredList.length === 0) {
        detailsHtml = `<div style='color:#c00;font-size:1.1em;'>未納品の注文明細はありません</div>`;
    } else {
        // ヘッダー
        detailsHtml = `<div style='display:flex;font-weight:bold;border-bottom:1px solid #ccc;padding-bottom:4px;margin-bottom:8px;'>
            <span style='width:32px;'></span>
            <span style='width:110px;'>注文書No.</span>
            <span style='width:110px;'>注文明細No.</span>
            <span style='width:160px;'>書名</span>
            <span style='width:80px;'>残数</span>
            <span style='width:80px;'>単価</span>
            <span style='width:120px;'>注文日</span>
        </div>`;
        detailsHtml += undeliveredList.map(detail => `
            <div style='display:flex;align-items:center;margin-bottom:8px;'>
                <input type='checkbox' style='width:32px;height:20px;margin-right:8px;'
                    data-detailid='${detail && detail.orderDetailId ? detail.orderDetailId : ''}'
                    data-title='${detail && detail.bookTitle ? detail.bookTitle : ''}'
                    data-qty='${detail && detail.undeliveredQuantity ? detail.undeliveredQuantity : ''}'
                    data-price='${detail && detail.unitPrice ? detail.unitPrice : ''}'
                    data-orderid='${detail && detail.orderId ? detail.orderId : ''}'>
                <span style='width:110px;'>${detail && detail.orderId ? detail.orderId : ''}</span>
                <span style='width:110px;'>${detail && detail.orderDetailId ? detail.orderDetailId : ''}</span>
                <span style='width:160px;'>${detail && detail.bookTitle ? detail.bookTitle : ''}</span>
                <span style='width:80px;'>${detail && detail.undeliveredQuantity ? detail.undeliveredQuantity : ''}</span>
                <span style='width:80px;'>${detail && detail.unitPrice ? detail.unitPrice : ''}</span>
                <span style='width:120px;'>${detail && detail.orderDate ? formatDate(detail.orderDate) : ''}</span>
            </div>
        `).join('');
        // 日付をYYYY-MM-DD形式に整形する関数
        function formatDate(dateStr) {
            if (!dateStr) return '';
            // すでにYYYY-MM-DDならそのまま返す
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        }
    }
    dialog.innerHTML = `
      <div style="background:#fff;padding:24px 32px 16px 32px;border-radius:8px;min-width:700px;max-width:90vw;box-shadow:0 4px 24px #0002;">
        <div style='font-size:1.1em;margin-bottom:8px;'>顧客ID: ${customerId}</div>
        <div style='margin-bottom:16px;'>${detailsHtml}</div>
        <div style='display:flex;justify-content:flex-end;gap:12px;margin-top:16px;'>
          <button id='selectAllBtn' style='background:#fff2e0;border:1px solid #e0a060;color:#a06000;padding:6px 18px;font-size:1em;'>すべて選択</button>
          <button id='decideBtn' style='background:#e0f0ff;border:1px solid #3399cc;color:#006699;padding:6px 18px;font-size:1em;'>決定</button>
          <button id='cancelBtn' style='background:#f7f7f7;border:1px solid #aaa;color:#444;padding:6px 18px;font-size:1em;'>キャンセル</button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);
    // 閉じる
    dialog.querySelector('#cancelBtn').onclick = () => dialog.remove();
    // ダイアログの決定ボタン処理を拡張
    dialog.querySelector('#decideBtn').onclick = () => {
        const selectedDetails = [];
        let subtotal = 0;
        dialog.querySelectorAll("input[type='checkbox']:checked").forEach(cb => {
            const qty = cb.nextElementSibling?.value || '1';
            const price = cb.dataset.price || '0';
            const amount = qty * price;
            const detail = {
                title: cb.dataset.title || '',
                qty,
                price,
                amount
            };
            selectedDetails.push(detail);
            subtotal += amount; // 小計を計算
        });

        // 納品書の明細テーブルに反映
        selectedDetails.forEach((detail, index) => {
            if (index < 12) { // 最大12行まで
                const itemInput = document.querySelector(`input[name='item${index + 1}']`);
                const qtyInput = document.querySelector(`input[name='qty${index + 1}']`);
                const priceInput = document.querySelector(`input[name='price${index + 1}']`);
                const amountInput = document.querySelector(`input[name='amount${index + 1}']`);

                if (itemInput) itemInput.value = detail.title;
                if (qtyInput) qtyInput.value = detail.qty;
                if (priceInput) priceInput.value = detail.price;
                if (amountInput) amountInput.value = detail.amount;
            }
        });

        // 小計、消費税、合計金額を計算して表示
        const tax = Math.floor(subtotal * 0.1); // 消費税10%
        const total = subtotal + tax;
        const totalInputs = document.querySelectorAll('.input-total');
        if (totalInputs.length >= 3) {
            totalInputs[0].value = subtotal;
            totalInputs[1].value = tax;
            totalInputs[2].value = total;
        }
        const totalAmount = document.getElementById('totalAmount');
        if (totalAmount) totalAmount.textContent = total;

        dialog.remove();
    };
    // すべて選択
    dialog.querySelector('#selectAllBtn').onclick = () => {
        dialog.querySelectorAll("input[type='checkbox']").forEach(cb => cb.checked = true);
    };
    dialog.querySelectorAll("input[type='checkbox']").forEach(cb => {
        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.min = '1';
        qtyInput.max = cb.dataset.qty || '1';
        qtyInput.value = '1';
        qtyInput.style.width = '60px';
        qtyInput.style.marginLeft = '8px';
        cb.parentElement.appendChild(qtyInput);
    });
}
// 検索ボタンにイベント付与
window.addEventListener('DOMContentLoaded', function () {
    const searchBtn = document.querySelector('.a4-sheet button');
    if (searchBtn && searchBtn.textContent.includes('検索')) {
        searchBtn.onclick = showCustomerSearchDialog;
    }
});




