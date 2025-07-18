// order_form.js
// 注文書の保存・印刷ボタン機能

document.addEventListener('DOMContentLoaded', function() {
    // 保存ボタン
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.type = 'button'; // 保存ボタンのtypeをbuttonに強制
        saveBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            // 入力値を取得
            const customerId = document.querySelector('input[type="text"]')?.value.trim();
            const orderDate = document.querySelector('input[type="date"]')?.value;
            // 備考取得
            const note = document.querySelector('.order-remark-row textarea')?.value || '';
            // 注文明細を配列で取得
            const orderDetails = [];
            let hasOrderError = false;
            for (let i = 1; i <= 12; i++) {
                const bookTitle = document.querySelector(`input[name="item${i}"]`)?.value.trim();
                const quantity = document.querySelector(`input[name="qty${i}"]`)?.value.trim();
                const unitPrice = document.querySelector(`input[name="price${i}"]`)?.value.trim();
                // 3項目すべて空ならスキップ
                if (!bookTitle && !quantity && !unitPrice) continue;
                // 1つでも空ならエラー
                if (!bookTitle || !quantity || !unitPrice) {
                    hasOrderError = true;
                }
                orderDetails.push({
                    bookTitle,
                    quantity: Number(quantity),
                    unitPrice: Number(unitPrice)
                });
            }
            if (!customerId) {
                alert('顧客IDは必須です');
                return;
            }
            // 顧客ID存在チェック
            try {
                const res = await fetch(`http://localhost:3000/api/customers/${customerId}`);
                if (!res.ok) {
                    alert('該当の顧客IDの顧客は存在しません');
                    return;
                }
                const data = await res.json();
                if (!data || !(data.customerId || data.id)) {
                    alert('該当の顧客IDの顧客は存在しません');
                    return;
                }
            } catch {
                alert('該当の顧客IDの顧客は存在しません');
                return;
            }
            if (orderDetails.length === 0) {
                alert('注文日・明細（書名・数量・単価）を入力してください');
                return;
            }
            if (hasOrderError) {
                alert('明細の書名・数量・単価はすべて必須です');
                return;
            }
            if (!orderDate) {
                alert('注文日を入力してください');
                return;
            }
            // 編集時はPUT、新規はPOST
            const urlParams = new URLSearchParams(window.location.search);
            const orderId = urlParams.get('orderId');
            let apiUrl = 'http://localhost:3000/api/orders';
            let method = 'POST';
            let body = { customerId, orderDate, orderDetails, note };
            if (orderId) {
                apiUrl = `http://localhost:3000/api/orders/${orderId}`;
                method = 'PUT';
                body.orderId = orderId;
            }
            // APIへ送信
            try {
                const res = await fetch(apiUrl, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                if (res.ok) {
                    alert('注文書を保存しました');
                    window.location.href = 'order_list.html';
                } else {
                    const err = await res.json();
                    alert('保存に失敗しました: ' + (err.error || 'エラー'));
                }
            } catch (err) {
                alert('通信エラー');
            }
        });
    }
    // 読み込み（自動）
    const saved = localStorage.getItem('orderFormData');
    if (saved) {
        setOrderFormData(JSON.parse(saved));
    }
    // 印刷ボタン
    const printBtn = document.getElementById('printBtn');
    if (printBtn) {
        printBtn.addEventListener('click', function() {
            window.print();
        });
    }
    // 新規作成・編集判定
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    if (orderId) {
        // 編集時：APIから注文書データを取得してセット
        fetch(`http://localhost:3000/api/orders/${orderId}`)
            .then(res => res.json())
            .then(async data => {
                setOrderFormData(data);
                if (typeof calcTotals === 'function') calcTotals(); // ←ここで再計算を明示的に呼ぶ
                // 注文書No.を自動セット
                const orderNoInput = document.getElementById('orderNoInput');
                if (orderNoInput && data.orderId) orderNoInput.value = data.orderId;
                // 編集時はNo.欄表示
                const orderNoRow = document.getElementById('orderNoRow');
                if (orderNoRow) orderNoRow.style.display = '';
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
                            if (customerNameInput) customerNameInput.value = customer.customerName || '';
                        }
                    } catch {}
                }
                // 編集時のみ印刷ボタンを表示
                const printBtn = document.getElementById('printBtn');
                if (printBtn) printBtn.style.display = '';
            })
            .catch(() => {
                alert('注文書データの取得に失敗しました');
            });
    } else {
        // 新規作成時：フォームを空に初期化
        document.querySelectorAll('.a4-sheet input, .a4-sheet textarea').forEach(input => {
            input.value = '';
        });
        // 注文日を本日にセット
        const orderDateInput = document.querySelector('.a4-sheet input[type="date"]');
        if (orderDateInput) {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            orderDateInput.value = `${yyyy}-${mm}-${dd}`;
        }
        // 注文書No.を非表示
        const orderNoRow = document.getElementById('orderNoRow');
        if (orderNoRow) orderNoRow.style.display = 'none';
        // 新規作成時は印刷ボタンを非表示
        const printBtn = document.getElementById('printBtn');
       
    }
    // 顧客ID入力時に顧客名・住所を自動取得
    const customerIdInput = document.getElementById('customerId');
    const customerNameInput = document.getElementById('customerName');
    const addressInput = document.getElementById('customerAddress');
    if (customerIdInput) {
        customerIdInput.addEventListener('change', async function() {
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
    // ▼▼▼ 自動計算機能追加 ▼▼▼
    function calcTotals() {
        let subtotal = 0;
        for (let i = 1; i <= 12; i++) {
            const qty = Number(document.querySelector(`input[name="qty${i}"]`)?.value) || 0;
            const price = Number(document.querySelector(`input[name="price${i}"]`)?.value) || 0;
            const amountInput = document.querySelector(`input[name="amount${i}"]`);
            const amountUnit = document.getElementById(`amount${i}-unit`);
            const amount = qty * price;
            if (amountInput) amountInput.value = amount ? amount : '';
            if (amountUnit) amountUnit.style.display = (amount > 0) ? '' : 'none';
            subtotal += amount;
        }
        const tax = Math.floor(subtotal * 0.1);
        const total = subtotal + tax;
        // テーブル下部
        const totalInputs = document.querySelectorAll('.input-total');
        // 単位表示用span取得
        const subtotalUnit = document.getElementById('subtotal-unit');
        const taxUnit = document.getElementById('tax-unit');
        const totalUnit = document.getElementById('total-unit');
        if (totalInputs.length >= 3) {
            totalInputs[0].value = subtotal;
            totalInputs[1].value = tax;
            totalInputs[2].value = total;
            // 小計・消費税・合計金額の単位表示制御
            if (subtotalUnit) subtotalUnit.style.display = (subtotal > 0) ? '' : 'none';
            if (taxUnit) taxUnit.style.display = (tax > 0) ? '' : 'none';
            if (totalUnit) totalUnit.style.display = (total > 0) ? '' : 'none';
            // 小計・消費税・合計金額を編集不可に
            totalInputs[0].readOnly = true;
            totalInputs[1].readOnly = true;
            totalInputs[2].readOnly = true;
            totalInputs[0].tabIndex = -1;
            totalInputs[1].tabIndex = -1;
            totalInputs[2].tabIndex = -1;
            totalInputs[0].style.background = '';
            totalInputs[1].style.background = '';
            totalInputs[2].style.background = '';
        }
        // 上部合計金額
        const totalAmount = document.getElementById('totalAmount');
        if (totalAmount) totalAmount.textContent = total;
    }
    // 数量・単価入力時に自動計算
    for (let i = 1; i <= 12; i++) {
        const qtyInput = document.querySelector(`input[name="qty${i}"]`);
        const priceInput = document.querySelector(`input[name="price${i}"]`);
        const amountInput = document.querySelector(`input[name="amount${i}"]`);
        // 金額は入力不可
        if (amountInput) {
            amountInput.readOnly = true;
            amountInput.tabIndex = -1;
            amountInput.style.background = '';
        }
        // 数量・単価は正の整数のみ（eや小数点・記号入力不可）
        if (qtyInput) {
            qtyInput.setAttribute('min', '1');
            qtyInput.setAttribute('step', '1');
            qtyInput.setAttribute('inputmode', 'numeric');
            qtyInput.setAttribute('pattern', '[0-9]*');
            qtyInput.addEventListener('keydown', function(e) {
                if (e.key === 'e' || e.key === '.' || e.key === '-' || e.key === '+') {
                    e.preventDefault();
                }
            });
            qtyInput.addEventListener('input', function() {
                if (qtyInput.value !== '' && (!/^[1-9][0-9]*$/.test(qtyInput.value))) {
                    qtyInput.value = '';
                }
            });
        }
        if (priceInput) {
            priceInput.setAttribute('min', '1');
            priceInput.setAttribute('step', '1');
            priceInput.setAttribute('inputmode', 'numeric');
            priceInput.setAttribute('pattern', '[0-9]*');
            priceInput.addEventListener('keydown', function(e) {
                if (e.key === 'e' || e.key === '.' || e.key === '-' || e.key === '+') {
                    e.preventDefault();
                }
            });
            priceInput.addEventListener('input', function() {
                if (priceInput.value !== '' && (!/^[1-9][0-9]*$/.test(priceInput.value))) {
                    priceInput.value = '';
                }
            });
        }
    }
    // 数量・単価入力時に自動計算（再度明示的にcalcTotalsを呼ぶ）
    for (let i = 1; i <= 12; i++) {
        const qtyInput = document.querySelector(`input[name="qty${i}"]`);
        const priceInput = document.querySelector(`input[name="price${i}"]`);
        if (qtyInput) qtyInput.addEventListener('input', calcTotals);
        if (priceInput) priceInput.addEventListener('input', calcTotals);
    }
    // 書名入力制御：一つ上の明細が空なら次の書名は入力不可
    for (let i = 2; i <= 12; i++) {
        const prevItemInput = document.querySelector(`input[name="item${i-1}"]`);
        const itemInput = document.querySelector(`input[name="item${i}"]`);
        const qtyInput = document.querySelector(`input[name="qty${i}"]`);
        const priceInput = document.querySelector(`input[name="price${i}"]`);
        if (itemInput && prevItemInput) {
            itemInput.addEventListener('focus', function() {
                if (!prevItemInput.value.trim()) {
                    itemInput.blur();
                }
            });
        }
        // 書名が未入力なら数量・単価も入力不可（disabled制御）
        if (qtyInput && itemInput) {
            qtyInput.disabled = !itemInput.value.trim();
            itemInput.addEventListener('input', function() {
                qtyInput.disabled = !itemInput.value.trim();
                if (!itemInput.value.trim()) qtyInput.value = '';
            });
        }
        if (priceInput && itemInput) {
            priceInput.disabled = !itemInput.value.trim();
            itemInput.addEventListener('input', function() {
                priceInput.disabled = !itemInput.value.trim();
                if (!itemInput.value.trim()) priceInput.value = '';
            });
        }
    }
    // 1行目の数量・単価も書名が未入力になったら値を消す＋単位・金額も消す
    const item1Input = document.querySelector('input[name="item1"]');
    const qty1Input = document.querySelector('input[name="qty1"]');
    const price1Input = document.querySelector('input[name="price1"]');
    const amount1Input = document.querySelector('input[name="amount1"]');
    const qty1Unit = document.getElementById('qty1-unit');
    const price1Unit = document.getElementById('price1-unit');
    const amount1Unit = document.getElementById('amount1-unit');
    if (item1Input && qty1Input && price1Input && amount1Input) {
        item1Input.addEventListener('input', function() {
            qty1Input.disabled = !item1Input.value.trim();
            price1Input.disabled = !item1Input.value.trim();
            if (!item1Input.value.trim()) {
                qty1Input.value = '';
                price1Input.value = '';
                amount1Input.value = '';
                if (qty1Unit) qty1Unit.style.display = 'none';
                if (price1Unit) price1Unit.style.display = 'none';
                if (amount1Unit) amount1Unit.style.display = 'none';
            }
        });
        // 初期状態も反映
        qty1Input.disabled = !item1Input.value.trim();
        price1Input.disabled = !item1Input.value.trim();
    }
    // 2行目以降も書名が未入力になったら数量・単価・金額・単位を消す
    for (let i = 2; i <= 12; i++) {
        const itemInput = document.querySelector(`input[name="item${i}"]`);
        const qtyInput = document.querySelector(`input[name="qty${i}"]`);
        const priceInput = document.querySelector(`input[name="price${i}"]`);
        const amountInput = document.querySelector(`input[name="amount${i}"]`);
        const qtyUnit = document.getElementById(`qty${i}-unit`);
        const priceUnit = document.getElementById(`price${i}-unit`);
        const amountUnit = document.getElementById(`amount${i}-unit`);
        if (itemInput && qtyInput && priceInput && amountInput) {
            itemInput.addEventListener('input', function() {
                qtyInput.disabled = !itemInput.value.trim();
                priceInput.disabled = !itemInput.value.trim();
                if (!itemInput.value.trim()) {
                    qtyInput.value = '';
                    priceInput.value = '';
                    amountInput.value = '';
                    if (qtyUnit) qtyUnit.style.display = 'none';
                    if (priceUnit) priceUnit.style.display = 'none';
                    if (amountUnit) amountUnit.style.display = 'none';
                }
            });
        }
    }
    // 明細の上詰め処理
    function shiftOrderDetailsUp() {
        // 下から上に向かって、1つ上が全て空欄、かつ自分が書名・数量・単価いずれか入力済みのとき上詰め
        for (let i = 2; i <= 12; i++) {
            const itemInput = document.querySelector(`input[name="item${i}"]`);
            const qtyInput = document.querySelector(`input[name="qty${i}"]`);
            const priceInput = document.querySelector(`input[name="price${i}"]`);
            const amountInput = document.querySelector(`input[name="amount${i}"]`);
            const qtyUnit = document.getElementById(`qty${i}-unit`);
            const priceUnit = document.getElementById(`price${i}-unit`);
            const amountUnit = document.getElementById(`amount${i}-unit`);
            const prevItemInput = document.querySelector(`input[name="item${i-1}"]`);
            const prevQtyInput = document.querySelector(`input[name="qty${i-1}"]`);
            const prevPriceInput = document.querySelector(`input[name="price${i-1}"]`);
            const prevAmountInput = document.querySelector(`input[name="amount${i-1}"]`);
            const prevQtyUnit = document.getElementById(`qty${i-1}-unit`);
            const prevPriceUnit = document.getElementById(`price${i-1}-unit`);
            const prevAmountUnit = document.getElementById(`amount${i-1}-unit`);
            // 1つ上が全て空欄、かつ自分がいずれか入力済みなら上詰め
            if (
                prevItemInput && prevQtyInput && prevPriceInput &&
                !prevItemInput.value.trim() && !prevQtyInput.value.trim() && !prevPriceInput.value.trim() &&
                itemInput && qtyInput && priceInput &&
                (itemInput.value.trim() || qtyInput.value.trim() || priceInput.value.trim())
            ) {
                prevItemInput.value = itemInput.value;
                prevQtyInput.value = qtyInput.value;
                prevPriceInput.value = priceInput.value;
                if (prevAmountInput) prevAmountInput.value = amountInput ? amountInput.value : '';
                if (prevQtyUnit) prevQtyUnit.style.display = (qtyInput.value) ? '' : 'none';
                if (prevPriceUnit) prevPriceUnit.style.display = (priceInput.value) ? '' : 'none';
                if (prevAmountUnit) prevAmountUnit.style.display = (amountInput && amountInput.value) ? '' : 'none';
                itemInput.value = '';
                qtyInput.value = '';
                priceInput.value = '';
                if (amountInput) amountInput.value = '';
                if (qtyUnit) qtyUnit.style.display = 'none';
                if (priceUnit) priceUnit.style.display = 'none';
                if (amountUnit) amountUnit.style.display = 'none';
            }
        }
        enforceInputLockAfterShift();
    }
    // 上詰め後に、下の行の数量・単価が書名未入力なら必ずdisabled＆値クリア＆単位非表示にする
    function enforceInputLockAfterShift() {
        for (let i = 1; i <= 12; i++) {
            const itemInput = document.querySelector(`input[name="item${i}"]`);
            const qtyInput = document.querySelector(`input[name="qty${i}"]`);
            const priceInput = document.querySelector(`input[name="price${i}"]`);
            const qtyUnit = document.getElementById(`qty${i}-unit`);
            const priceUnit = document.getElementById(`price${i}-unit`);
            if (qtyInput && itemInput) {
                if (!itemInput.value.trim()) {
                    qtyInput.disabled = true;
                    qtyInput.value = '';
                    if (qtyUnit) qtyUnit.style.display = 'none';
                } else {
                    qtyInput.disabled = false;
                }
            }
            if (priceInput && itemInput) {
                if (!itemInput.value.trim()) {
                    priceInput.disabled = true;
                    priceInput.value = '';
                    if (priceUnit) priceUnit.style.display = 'none';
                } else {
                    priceInput.disabled = false;
                }
            }
        }
    }
    // 書名・数量・単価がすべて消されたときに上詰め
    for (let i = 1; i <= 12; i++) {
        const itemInput = document.querySelector(`input[name="item${i}"]`);
        const qtyInput = document.querySelector(`input[name="qty${i}"]`);
        const priceInput = document.querySelector(`input[name="price${i}"]`);
        if (itemInput) itemInput.addEventListener('input', shiftOrderDetailsUp);
        if (qtyInput) qtyInput.addEventListener('input', shiftOrderDetailsUp);
        if (priceInput) priceInput.addEventListener('input', shiftOrderDetailsUp);
    }
    // 初期化時も計算
    calcTotals();
});

function getOrderFormData() {
    const data = {};
    document.querySelectorAll('.a4-sheet input, .a4-sheet textarea').forEach(input => {
        data[input.name || input.className + input.type] = input.value;
    });
    return data;
}

function setOrderFormData(data) {
    // 顧客情報セット
    if (data.customerId !== undefined) {
        const customerIdInput = document.getElementById('customerId');
        if (customerIdInput) customerIdInput.value = data.customerId;
    }
    if (data.customerName !== undefined) {
        const customerNameInput = document.getElementById('customerName');
        if (customerNameInput) customerNameInput.value = data.customerName;
    }
    if (data.address !== undefined) {
        const addressInput = document.getElementById('customerAddress');
        if (addressInput) addressInput.value = data.address;
    }
    // 注文日
    if (data.orderDate !== undefined) {
        const orderDateInput = document.querySelector('input[type="date"]');
        if (orderDateInput) {
            orderDateInput.value = data.orderDate;
        }
    }
    // 注文明細セット（itemX, qtyX, priceX, amountX, 単位表示も）
    if (Array.isArray(data.orderDetails)) {
        for (let i = 1; i <= 12; i++) {
            const detail = data.orderDetails[i-1];
            const itemInput = document.querySelector(`input[name="item${i}"]`);
            const qtyInput = document.querySelector(`input[name="qty${i}"]`);
            const priceInput = document.querySelector(`input[name="price${i}"]`);
            const amountInput = document.querySelector(`input[name="amount${i}"]`);
            const qtyUnit = document.getElementById(`qty${i}-unit`);
            const priceUnit = document.getElementById(`price${i}-unit`);
            const amountUnit = document.getElementById(`amount${i}-unit`);
            if (detail) {
                if (itemInput) itemInput.value = detail.bookTitle || '';
                if (qtyInput) {
                    qtyInput.value = detail.quantity || '';
                    qtyInput.disabled = false;
                }
                if (priceInput) {
                    priceInput.value = detail.unitPrice || '';
                    priceInput.disabled = false;
                }
            } else {
                if (itemInput) itemInput.value = '';
                if (qtyInput) {
                    qtyInput.value = '';
                    qtyInput.disabled = true;
                }
                if (priceInput) {
                    priceInput.value = '';
                    priceInput.disabled = true;
                }
            }
            // 金額・単位再計算
            if (amountInput && qtyInput && priceInput) {
                const amount = Number(qtyInput.value) * Number(priceInput.value);
                amountInput.value = amount ? amount : '';
                if (qtyUnit) qtyUnit.style.display = (qtyInput.value && qtyInput.value !== '0') ? '' : 'none';
                if (priceUnit) priceUnit.style.display = (priceInput.value && priceInput.value !== '0') ? '' : 'none';
                if (amountUnit) amountUnit.style.display = (amount > 0) ? '' : 'none';
            }
        }
    }
    // 備考
    if (data.note !== undefined) {
        const remarkInput = document.querySelector('.order-remark-row textarea');
        if (remarkInput) remarkInput.value = data.note;
    }
    // 金額再計算
    if (typeof calcTotals === 'function') calcTotals();
}
