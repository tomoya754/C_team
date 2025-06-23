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
