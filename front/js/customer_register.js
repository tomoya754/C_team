<<<<<<< HEAD
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

// Excel→CSV変換＆送信
document.getElementById('excelForm').onsubmit = function(e) {
    e.preventDefault();
    const fileInput = document.getElementById('excelFile');
    const file = fileInput.files[0];
    if (!file) {
        alert('ファイルを選択してください');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        let json = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], { header: 1 });

        // 日本語→英語カラム名変換
=======
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
>>>>>>> 2ffc499203424921f3d2e40cad7aefd999207ef7
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
<<<<<<< HEAD
        json[0] = json[0].map(h => headerMap[h] || h);

        // CSVに変換
        const csv = XLSX.utils.sheet_to_csv(XLSX.utils.aoa_to_sheet(json));

        // CSVをFormDataで送信
        const blob = new Blob([csv], { type: 'text/csv' });
        const formData = new FormData();
        formData.append('file', blob, 'customers.csv');

        fetch('http://localhost:3000/api/import/upload-customers', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            alert('登録完了: ' + (data.message || ''));
        })
        .catch(err => {
            alert('登録失敗');
            console.error(err);
        });
    };
    reader.readAsArrayBuffer(file);
};
=======
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
>>>>>>> 2ffc499203424921f3d2e40cad7aefd999207ef7
