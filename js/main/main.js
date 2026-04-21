/* =========================================================
                    HỆ THỐNG GIẢ TẢI TRANG
   ========================================================= */

   document.addEventListener("DOMContentLoaded", () => {

    const navLinks = document.querySelectorAll('.nav-links a');
    
    const allSections = document.querySelectorAll('#trang-chu, .panel-section');
    const loadingScreen = document.getElementById('loading-screen');

    allSections.forEach(sec => sec.style.display = 'none');
    const homeSection = document.getElementById('trang-chu');
    if(homeSection) homeSection.style.display='block';

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetld = this.getAttribute('href');

            if (targetld && targetld.startsWith('#')){
                e.preventDefault();

                const targetSection = document.querySelector(targetld);

                if (targetSection) {
                    loadingScreen.class.List.add('is-loading');

                    setTimeout(() => {
                        loadingScreen.class.List.remove('is-loading');

                        allSections.forEach(sec => sec.style.display='none');

                        targetSection.style.display='block';

                        window.scrollTo({top:targetSection.offsetTop - 100, behavior: 'smooth'});
                    }, 600);
                }
            }
        });
    });
});