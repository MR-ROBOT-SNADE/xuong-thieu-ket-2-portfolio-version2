/* ==============================================================
            KÍCH HOẠT VẼ BIỂU ĐỒ GỘP TK3 & TK4
   ============================================================== */

let isTK3CoalLoaded = false;
let isTK4CoalLoaded = false;
window.MergedCoalData = null;

/* Đặt tên cột chuẩn khớp 100% với ảnh Google Sheets hiện tại của bạn */
const colThanTarget = [
    "Tiêu hao theo nhiệt trị", 
    "Mức trung bình", 
    "Tiêu hao than tích luỹ (tính theo nhiệt trị)"
];

document.addEventListener('TK3DataReady', () => { isTK3CoalLoaded = true; checkAndMergeCoalData(); });
document.addEventListener('TK4DataReady', () => { isTK4CoalLoaded = true; checkAndMergeCoalData(); });

function checkAndMergeCoalData() {
    if (!isTK3CoalLoaded || !isTK4CoalLoaded) return;

    const tk3Extracted = extractChartData(window.masterSheetDataTK3, "Thời gian (THthan)", "Ca/kíp (THthan)", colThanTarget);
    const tk4Extracted = extractChartData(window.masterSheetDataTK4, "Thời gian (THthan)", "Ca/kíp (THthan)", colThanTarget);

    if (tk3Extracted && tk4Extracted) {
        // MAPPING CHUẨN XÁC: Đặt key khớp với tham số của hàm triggerFilterThan
        window.MergedCoalData = {
            labels: tk3Extracted.labels,
            nhietriTK3: tk3Extracted["Tiêu hao theo nhiệt trị"],
            nhietriTK4: tk4Extracted["Tiêu hao theo nhiệt trị"],
            trungbinh: tk3Extracted["Mức trung bình"],
            tichluyTK3: tk3Extracted["Tiêu hao than tích luỹ (tính theo nhiệt trị)"],
            tichluyTK4: tk4Extracted["Tiêu hao than tích luỹ (tính theo nhiệt trị)"]
        };

        const container = document.getElementById('tieu-hao-than');
        if (container) {
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    clearFilterThan(); 
                    observer.disconnect();
                }
            });
            observer.observe(container);
        }
    }
}

/* ----------------------------------------------------------------------------*/
function triggerFilterThan() {
    if (!window.MergedCoalData) return;

    // Truyền đúng key 'nhietriTK3' để hàm filter định vị mảng chuẩn
    const f = smartFilter(window.MergedCoalData, 'nhietriTK3', 'start', 'end', 'shift');

    const lineFilter = document.getElementById('sinterline') ? document.getElementById('sinterline').value : 'all';
    
    if (f && f.labels.length > 0) {
        drawCoalConsumeChart(
            'coal-chart-nhietri', 
            f.labels, 
            f.nhietriTK3, 
            f.nhietriTK4, 
            f.trungbinh, 
            f.tichluyTK3, 
            f.tichluyTK4, 
            lineFilter
        );
    } else {
        console.warn("Dữ liệu lọc rỗng, không thể vẽ biểu đồ.");
    }
}

function clearFilterThan() {
    ['start', 'end'].forEach(id => { if(document.getElementById(id)) document.getElementById(id).value = ""; });
    if(document.getElementById('shift')) document.getElementById('shift').value = "all";
    if(document.getElementById('sinterline')) document.getElementById('sinterline').value = "all";
    
    triggerFilterThan();
}
/* ---------------------------------------------------------------------------- */