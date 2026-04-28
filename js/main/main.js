/* =========================================================
                    HỆ THỐNG GIẢ TẢI TRANG
   ========================================================= */


document.addEventListener("DOMContentLoaded", () => {
    const allLinks = document.querySelectorAll('a[href^="#"]');
    const allSections = document.querySelectorAll('#trang-chu, .panel-section');
    const loadingScreen = document.getElementById('loading-screen');
    const sidebarBtn = document.getElementById('sidebar-toggle');

    function initPage() {
        const currentHash = window.location.hash ||
        allSections.forEach(sec => sec.style.display = 'none');
        const targetSection = document.querySelector(currentHash);
        if (targetSection) {
            targetSection.style.display = 'block';
            updateSidebar(currentHash);
        }
    }
    initPage();
    
    // Mặc định ẩn hết, chỉ bật trang chủ
    allSections.forEach(sec => sec.style.display = 'none');
    const homeSection = document.getElementById('trang-chu');
    if(homeSection) homeSection.style.display='block';

    allLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetSection = document.querySelector(targetId);

            if (targetSection){
                e.preventDefault(); // CHẶN KHÔNG CHO URL ĐỔI TÊN

                if (loadingScreen) {
                    loadingScreen.style.display='block';
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                        allSections.forEach(sec => sec.style.display='none');
                        targetSection.style.display='block';
                        window.scrollTo({top:targetSection.offsetTop - 120, behavior: 'smooth'});
                        
                        updateSidebarVisibility(targetId);
                    }, 500);
                }
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", function() {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');

    if(slides.length > 0) {
        setInterval(function() {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide+1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 4000);
    }
});



/* ===================================================================================
                    HỆ THỐNG TỰ ĐỘNG LẤY DỮ LIỆU CẬP NHẬT                               
   =================================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    loadCoalConsumeDataTK3();

    const TIME_INTERVAL = 28800000;

    setInterval(() => {
        console.log("Đã qua 6 tiếng. Đang tự động lấy dữ liệu mới từ dữ liệu nguồn");
        loadCoalConsumeDataTK3();
    }, TIME_INTERVAL);
});