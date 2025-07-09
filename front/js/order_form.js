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
            // 注文明細を配列で取得
            const orderDetails = [];
            for (let i = 1; i <= 12; i++) {
                const bookTitle = document.querySelector(`input[name="item${i}"]`)?.value.trim();
                const quantity = Number(document.querySelector(`input[name="qty${i}"]`)?.value);
                const unitPrice = Number(document.querySelector(`input[name="price${i}"]`)?.value);
                if (bookTitle && quantity && unitPrice) {
                    orderDetails.push({ bookTitle, quantity, unitPrice });
                }
            }
            if (!customerId || !orderDate || orderDetails.length === 0) {
                alert('顧客ID・注文日・明細（書名・数量・単価）を入力してください');
                return;
            }
            // APIへ送信
            try {
                const res = await fetch('http://localhost:3000/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ customerId, orderDate, orderDetails })
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
            .then(data => {
                setOrderFormData(data);
                // 注文書No.を自動セット
                const orderNoInput = document.getElementById('orderNoInput');
                if (orderNoInput && data.orderId) orderNoInput.value = data.orderId;
                // 編集時はNo.欄表示
                const orderNoRow = document.getElementById('orderNoRow');
                if (orderNoRow) orderNoRow.style.display = '';
            })
            .catch(() => {
                alert('注文書データの取得に失敗しました');
            });
    } else {
        // 新規作成時：フォームを空に初期化
        document.querySelectorAll('.a4-sheet input, .a4-sheet textarea').forEach(input => {
            input.value = '';
        });
        // 新規作成時はNo.欄非表示
        const orderNoRow = document.getElementById('orderNoRow');
        if (orderNoRow) orderNoRow.style.display = 'none';
    }
    // ▼▼▼ 自動計算機能追加 ▼▼▼
    function calcTotals() {
        let subtotal = 0;
        for (let i = 1; i <= 12; i++) {
            const qty = Number(document.querySelector(`input[name="qty${i}"]`)?.value) || 0;
            const price = Number(document.querySelector(`input[name="price${i}"]`)?.value) || 0;
            const amountInput = document.querySelector(`input[name="amount${i}"]`);
            const amount = qty * price;
            if (amountInput) amountInput.value = amount ? amount : '';
            subtotal += amount;
        }
        const tax = Math.floor(subtotal * 0.1);
        const total = subtotal + tax;
        // テーブル下部
        const totalInputs = document.querySelectorAll('.input-total');
        if (totalInputs.length >= 3) {
            totalInputs[0].value = subtotal;
            totalInputs[1].value = tax;
            totalInputs[2].value = total;
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
});

function getOrderFormData() {
    const data = {};
    document.querySelectorAll('.a4-sheet input, .a4-sheet textarea').forEach(input => {
        data[input.name || input.className + input.type] = input.value;
    });
    return data;
}

function setOrderFormData(data) {
    document.querySelectorAll('.a4-sheet input, .a4-sheet textarea').forEach(input => {
        const key = input.name || input.className + input.type;
        if (data[key] !== undefined) input.value = data[key];
    });
}
