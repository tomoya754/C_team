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
        const orderNoInput = document.querySelector('.a4-sheet input[placeholder="XXXXXXXXXX"]');
        if (orderNoInput) {
            orderNoInput.style.display = 'none';
            const orderNoLabel = orderNoInput.parentElement.querySelector('span');
            if (orderNoLabel) orderNoLabel.style.display = 'none';
        }
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
