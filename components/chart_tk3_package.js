

window.TK3Data = {chatluongVoinung: null, chatluongDonung: null, 
                  chatluongQTH: null, chatluongHLC: null, 
                  chatluongQTK: null, chatluongThanghien: null, 
                  chatluongCoke: null, 

                  tieuhaoTrodung: null, tieuhaoDien: null,
                  tieuhaoKhithan: null, tieuhaoQuangchuasat: null, 
                  tieuhaoThan: null};

const colThanTK3 = ["Tiêu hao theo nhiệt trị", "Tiêu hao theo Ccd", "Mức trung bình", "Tiêu hao than tích luỹ (tính theo nhiệt trị)"];

document.addEventListener('TK3DataReady', () => {
    // Bóc tách Than bằng extractChartData [cite: 115]
    window.TK3Data.tieuhaoThan = extractChartData(window.masterSheetDataTK3, "Thời gian (THthan)", "Ca/kíp (THthan)", colThanTK3);
    const container = document.getElementById('tieu-hao-than');
    if (container) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                if (window.TK3Data.tieuhaoThan) clearFilterTK3_Than();
                observer.disconnect(); // Vẽ xong thì ngắt theo dõi để nhẹ hệ thống
            }
        });
        observer.observe(container);
    }
});

/* ----------------------------------------------------------------------------*/
function triggerFilterTK3_Than() {
    const f = smartFilter(window.TK3Data.tieuhaoThan, colThanTK3[0], 'startTK3', 'endTK3', 'shiftTK3');
    
    // Kiểm tra xem mảng dữ liệu có bị rỗng hay không trước khi vẽ
    if (f && f.labels.length > 0) {
        drawCoalConsumeChart('coal-chart-tk3', f.labels, f[colThanTK3[0]], f[colThanTK3[1]], f[colThanTK3[2]], f[colThanTK3[3]], f.isDateFiltered);
    } else {
        console.warn("Dữ liệu lọc bị rỗng! Hãy kiểm tra lại xem tên cột trong Google Sheets có bị dư khoảng trắng không.");
    }
}
function clearFilterTK3_Than() {
    ['startTK3', 'endTK3'].forEach(id => { if(document.getElementById(id)) document.getElementById(id).value = ""; });
    if(document.getElementById('shiftTK3')) document.getElementById('shiftTK3').value = "all";
    
    triggerFilterTK3_Than();
}
/* ---------------------------------------------------------------------------- */