// 顧客情報Excel→CSV変換＆アップロード
// 必要: xlsx, papaparse

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const fileInput = document.querySelector('input[type="file"][accept=".xlsx"]');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
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
        const csvArray = [headers, ...dataRows];
        const csv = csvArray.map(row => row.map(v => v === undefined ? '' : v).join(',')).join('\n');
        // CSVをBlobにしてFormDataで送信
        const csvBlob = new Blob([csv], { type: 'text/csv' });
        const formData = new FormData();
        formData.append('file', csvBlob, file.name.replace(/\.xlsx$/, '.csv'));
        try {
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
        }
    });
});
