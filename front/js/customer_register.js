// 顧客情報Excel→CSV変換＆アップロード
// 必要: xlsx, papaparse

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const fileInput = document.querySelector('input[type="file"][accept=".xlsx"]');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
        try {
            if (!fileInput.files.length) {
                alert('ファイルを選択してください');
                return;
            }
            const file = fileInput.files[0];
            // xlsxファイルを読み込んでCSVに変換
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            let json = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            // 1行目（日本語ヘッダー）を英名に変換
            const headerMap = {
                '顧客ID': 'customerId',
                '店舗名': 'shopName',
                '顧客名': 'customerName',
                '担当者名': 'staffName',
                '住所': 'address',
                '電話番号': 'phone',
                '配達先条件等': 'deliveryCondition',
                '備考': 'note',
                '顧客登録日': 'registeredAt'
            };
            const headers = json[0].map(h => headerMap[h] || h);
            const dataRows = json.slice(1);
            // 日付フォーマット変換関数
            function formatDate(val) {
              if (!val) return '';
              if (typeof val === 'number') {
                const date = XLSX.SSF.parse_date_code(val);
                if (date) {
                  const mm = String(date.m).padStart(2, '0');
                  const dd = String(date.d).padStart(2, '0');
                  return `${date.y}-${mm}-${dd}`;
                }
              }
              const d = new Date(val);
              if (!isNaN(d)) {
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                return `${yyyy}-${mm}-${dd}`;
              }
              return String(val).trim();
            }
            const csvArray = [
              headers,
              ...dataRows
                .filter(row => row.some(cell => cell !== undefined && String(cell).trim() !== ''))
                .map(row => headers.map((h, i) => {
                  let v = row[i] === undefined ? '' : String(row[i]).trim();
                  if (h === 'customerId') v = v.replace(/[^0-9]/g, '');
                  if (h === 'registeredAt') v = formatDate(row[i]);
                  return v;
                }))
            ];
            const csv = csvArray.map(row => row.join(',')).join('\n');
            // CSVをBlobにしてFormDataで送信
            const csvBlob = new Blob([csv], { type: 'text/csv' });
            const formData = new FormData();
            formData.append('file', csvBlob, file.name.replace(/\.xlsx$/, '.csv'));
            const res = await fetch('http://localhost:3000/api/import/upload-customers', {
                method: 'POST',
                body: formData
            });
            const result = await res.json();
            if (res.ok) {
                alert('アップロード成功: ' + result.message);
            } else {
                alert('アップロード失敗: ' + (result.error || 'エラー'));
            }
        } catch (err) {
            alert('通信エラー');
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });
});
