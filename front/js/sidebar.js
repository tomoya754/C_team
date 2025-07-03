// サイドバーの開閉制御
window.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarBg = document.getElementById('sidebarBg');
    const sidebarClose = document.getElementById('sidebarClose');

    // サイドバーを開く
    menuBtn.addEventListener('click', function() {
        sidebar.classList.add('open');
        sidebarBg.classList.add('active');
        sidebarClose.style.display = 'block';
        menuBtn.style.display = 'none';
    });

    // サイドバーを閉じる
    function closeSidebar() {
        sidebar.classList.remove('open');
        sidebarBg.classList.remove('active');
        sidebarClose.style.display = 'none';
        menuBtn.style.display = 'block';
    }
    sidebarClose.addEventListener('click', closeSidebar);
    sidebarBg.addEventListener('click', closeSidebar);

    // ウィンドウリサイズ時の調整（必要なら）
    window.addEventListener('resize', function() {
        if(window.innerWidth > 900) {
            closeSidebar();
        }
    });
});
