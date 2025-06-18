// ハンバーガーメニューの開閉制御
const menuIcon = document.querySelector('.menu-icon');
const sideMenu = document.querySelector('.side-menu');

if (menuIcon && sideMenu) {
    menuIcon.addEventListener('click', () => {
        sideMenu.classList.toggle('open');
    });
    // サイドメニュー外クリックで閉じる
    document.addEventListener('click', (e) => {
        if (!sideMenu.contains(e.target) && !menuIcon.contains(e.target)) {
            sideMenu.classList.remove('open');
        }
    });
}
