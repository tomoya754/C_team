// delivery_form.js
// 納品書の保存・印刷ボタン機能

document.addEventListener('DOMContentLoaded', function() {
    // 保存ボタン
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const formData = getDeliveryFormData();
            localStorage.setItem('deliveryFormData', JSON.stringify(formData));
            const name = document.querySelector('.order-to-name input')?.value || '';
            alert(`納品書（${name || '無名'}）保存しました`);
            window.location.href = 'delivery_list.html';
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
        printBtn.addEventListener('click', function() {
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

    const urlParams = new URLSearchParams(window.location.search);
    const deliveryId = urlParams.get('deliveryId');
    if (deliveryId) {
        // 編集時：APIから納品書データを取得してセット
        fetch(`http://localhost:3000/api/deliveries/${deliveryId}`)
            .then(res => res.json())
            .then(data => {
                setDeliveryFormData(data);
                // 納品No.を自動セット
                const deliveryNoInput = document.getElementById('deliveryNoInput');
                if (deliveryNoInput && data.deliveryId) deliveryNoInput.value = data.deliveryId;
                // 編集時はNo.欄表示
                const deliveryNoRow = document.getElementById('deliveryNoRow');
                if (deliveryNoRow) deliveryNoRow.style.display = '';
            })
            .catch(() => {
                alert('納品書データの取得に失敗しました');
            });
    } else {
        // 新規作成時：フォームを空に初期化
        document.querySelectorAll('.a4-sheet input, .a4-sheet textarea').forEach(input => {
            input.value = '';
        });
        // 新規作成時はNo.欄非表示
        const deliveryNoRow = document.getElementById('deliveryNoRow');
        if (deliveryNoRow) deliveryNoRow.style.display = 'none';
    }
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
function showCustomerSearchDialog() {
    // 既存ダイアログがあれば削除
    document.getElementById('customerSearchDialog')?.remove();
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
    // ダイアログ内容
    dialog.innerHTML = `
      <div style="background:#fff;padding:24px 32px 16px 32px;border-radius:8px;min-width:700px;max-width:90vw;box-shadow:0 4px 24px #0002;">
        <div style='font-size:1.1em;margin-bottom:8px;'>250001/大阪情報専門学校</div>
        <div style='display:flex;align-items:center;gap:8px;margin-bottom:12px;'>
          <input type='text' value='T：4' style='font-size:1.1em;width:120px;padding:4px 8px;'>
          <button style='padding:2px 8px;'>↻</button>
          <input type='text' placeholder='' style='flex:1;font-size:1.1em;padding:4px 8px;'>
        </div>
        <div style='margin-bottom:16px;'>
          <div style='display:flex;align-items:center;margin-bottom:8px;'>
            <input type='checkbox' checked style='width:20px;height:20px;margin-right:8px;'>
            <span style='flex:1;'>T4/セキュリティエンジニアの知識地図/上野 宣/技術評論社</span>
            <select style='font-size:1em;margin-left:8px;'>
              <option>1冊</option><option>2冊</option><option>3冊</option>
            </select>
          </div>
          <div style='display:flex;align-items:center;margin-bottom:8px;'>
            <input type='checkbox' style='width:20px;height:20px;margin-right:8px;'>
            <span style='flex:1;'>T4/スッキリわかるPythonによる機械学習入門 第2版/黒澤 秋良/インプレス</span>
            <select style='font-size:1em;margin-left:8px;'>
              <option>1冊</option><option>2冊</option><option>3冊</option>
            </select>
          </div>
          <div style='display:flex;align-items:center;margin-bottom:8px;'>
            <input type='checkbox' style='width:20px;height:20px;margin-right:8px;'>
            <span style='flex:1;'>T5/生成AIアプリ開発大全──Difyの探求と実践活用/小野 哲/技術評論社</span>
            <select style='font-size:1em;margin-left:8px;'>
              <option>1冊</option><option>2冊</option><option>3冊</option>
            </select>
          </div>
        </div>
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
    // 決定ボタン（例：選択内容を反映する処理をここに追加可）
    dialog.querySelector('#decideBtn').onclick = () => {
        // 必要ならここで値を反映
        dialog.remove();
    };
    // すべて選択
    dialog.querySelector('#selectAllBtn').onclick = () => {
        dialog.querySelectorAll("input[type='checkbox']").forEach(cb => cb.checked = true);
    };
}
// 検索ボタンにイベント付与
window.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.querySelector('.a4-sheet button');
    if (searchBtn && searchBtn.textContent.includes('検索')) {
        searchBtn.onclick = showCustomerSearchDialog;
    }
});

document.getElementById('saveBtn').onclick = function (e) {
    e.preventDefault();

    // 入力値の取得
    const customerId = document.querySelector('input[name="customerId"]')?.value || '';
    const customerName = document.querySelector('input[name="customerName"]')?.value || '';
    const deliveryNo = document.querySelector('input[placeholder="XXXXXXXXXX"]')?.value || '';
    const deliveryDate = document.querySelector('input[type="date"]')?.value || '';
    // 明細テーブルの取得
    const items = [];
    for (let i = 1; i <= 12; i++) {
        const item = document.querySelector(`input[name="item${i}"]`)?.value || '';
        const qty = document.querySelector(`input[name="qty${i}"]`)?.value || '';
        const price = document.querySelector(`input[name="price${i}"]`)?.value || '';
        const amount = document.querySelector(`input[name="amount${i}"]`)?.value || '';
        if (item || qty || price || amount) {
            items.push({ item, qty, price, amount });
        }
    }

    // サーバーに送るデータ
    const data = {
        customerId,
        customerName,
        deliveryNo,
        deliveryDate,
        items
    };

    // fetchでPOST
    fetch('http://localhost:3000/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
        alert('保存しました');
        // 必要なら画面遷移やリセット
    })
    .catch(err => {
        alert('保存に失敗しました');
        console.error(err);
    });
};
