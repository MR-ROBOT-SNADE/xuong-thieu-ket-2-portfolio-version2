/* ==============================================================
            KÍCH HOẠT VẼ BIỂU ĐỒ GỘP TK3 & TK4
   ============================================================== */

/* Biến toàn cục giữ nguyên */
let isTK3CoalLoaded = false;
let isTK4CoalLoaded = false;



/* Mỗi lần có biểu đồ mới thì khai báo thêm cục dữ liệu vào đây */
window.MergedCoalDataNhietri = null;
window.MergedCoalDataCcd = null;

/* Đặt tên cột cho chuẩn với database hiện tại đang sử dụng */
const colThanNhietri = [
    "Tiêu hao theo nhiệt trị", 
    "Mức trung bình", 
    "Tiêu hao than tích luỹ (tính theo nhiệt trị)"
];
const colThanCcd = [
    "Tiêu hao theo Ccd",
    "Mức trung bình",
    "Tiêu hao than tích luỹ (tính theo Ccd)"
];

/* Nghe sự kiện bên api_loaded để kích hoạt load dữ liệu từ gg sheet, không thay đổi gì */
document.addEventListener('TK3DataReady', () => { isTK3CoalLoaded = true; checkAndMergeCoalData(); });
document.addEventListener('TK4DataReady', () => { isTK4CoalLoaded = true; checkAndMergeCoalData(); });

function checkAndMergeCoalData() {
    if (!isTK3CoalLoaded || !isTK4CoalLoaded) return;


    /* Nếu có biểu đồ mới, khai báo tương tự vào đây */

    // Bộ biểu đồ tiêu hao than
    const tk3ExtractedNhietri = extractChartData(window.masterSheetDataTK3, "Thời gian (THthan)", "Ca/kíp (THthan)", colThanNhietri);
    const tk4ExtractedNhietri = extractChartData(window.masterSheetDataTK4, "Thời gian (THthan)", "Ca/kíp (THthan)", colThanNhietri);
    const tk3ExtractedCcd = extractChartData(window.masterSheetDataTK3, "Thời gian (THthan)", "Ca/kíp (THthan)", colThanCcd);
    const tk4ExtractedCcd = extractChartData(window.masterSheetDataTK4, "Thời gian (THthan)", "Ca/kíp (THthan)", colThanCcd);
    
    if (tk3ExtractedNhietri && tk4ExtractedNhietri && tk3ExtractedCcd && tk4ExtractedCcd) {
        // MAPPING CHUẨN XÁC: Đặt key cho khớp với từng loại biểu đồ
        window.MergedCoalDataNhietri = {
            labels: tk3ExtractedNhietri.labels,
            nhietriTK3: tk3ExtractedNhietri["Tiêu hao theo nhiệt trị"],
            nhietriTK4: tk4ExtractedNhietri["Tiêu hao theo nhiệt trị"],
            trungbinh: tk3ExtractedNhietri["Mức trung bình"],
            tichluyTK3: tk3ExtractedNhietri["Tiêu hao than tích luỹ (tính theo nhiệt trị)"],
            tichluyTK4: tk4ExtractedNhietri["Tiêu hao than tích luỹ (tính theo nhiệt trị)"],
        };
        window.MergedCoalDataCcd = {
            labels: tk3ExtractedCcd.labels,
            CcdTK3: tk3ExtractedCcd["Tiêu hao theo Ccd"],
            CcdTK4: tk4ExtractedCcd["Tiêu hao theo Ccd"],
            trungbinh: tk3ExtractedCcd["Mức trung bình"],
            tichluyTK3: tk3ExtractedCcd["Tiêu hao than tích luỹ (tính theo Ccd)"],
            tichluyTK4: tk4ExtractedCcd["Tiêu hao than tích luỹ (tính theo Ccd)"],
        };

        /* Biến kiểm tra, xem xét khai báo thêm */
        const container = document.getElementById('tieu-hao-than');
        if (container) {
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    // Nhớ khai báo thêm các biến của biểu đồ khác, nếu có thêm biểu đồ vào đây, kèm theo truyền vào hậu tố của nó
                    clearUniversalFilter('nhietri');
                    clearUniversalFilter('ccd');
                    observer.disconnect();
                }
            });
            observer.observe(container);
        }
    }
}

/* HỆ THỐNG LỌC XÀI CHUNG CHO TOÀN BỘ CÁC BIỂU ĐỒ */
const chartConfigs = {
    'nhietri': {
        dataSource: () => window.MergedCoalDataNhietri, // Dùng arrow function để luôn lấy data mới nhất
        keyTK3: 'nhietriTK3',
        keyTK4: 'nhietriTK4',
        canvasId: 'coal-chart-nhietri',
        filterSuffix: '-nhietri' // Luôn để đuôi id bên kia là (start,end,sinterline) + phần ký tự này
    },
    'ccd': {
        dataSource: () => window.MergedCoalDataCcd,
        keyTK3: 'CcdTK3',
        keyTK4: 'CcdTK4',
        canvasId: 'coal-chart-ccd',
        filterSuffix: '-ccd' // Luôn để đuôi id bên kia là (start,end,sinterline) + phần ký tự này
    }
    // 💡 SAU NÀY CÓ BIỂU ĐỒ ĐIỆN, CHỈ CẦN THÊM VÀO ĐÂY:
    // 'dien': { dataSource: () => window.MergedDienData, keyTK3: 'dienTK3', keyTK4: 'dienTK4', canvasId: 'chart-dien', filterSuffix: '-dien' }
};

// 2. HÀM LỌC CHUNG
function applyUniversalFilter(chartType) {
    const config = chartConfigs[chartType];
    const data = config ? config.dataSource() : null;
    
    if (!data) return;

    // Tự động ghép nối ID dựa vào hậu tố cấu hình
    const s_start = `start${config.filterSuffix}`;
    const s_end   = `end${config.filterSuffix}`;
    const s_shift = `shift${config.filterSuffix}`;
    const s_line  = `sinterline${config.filterSuffix}`;

    const lineFilter = document.getElementById(s_line) ? document.getElementById(s_line).value : 'all';
    
    // Gọi hàm smartFilter gốc
    const f = smartFilter(data, config.keyTK3, s_start, s_end, s_shift);
    // Đây chỉ là vẽ biểu đồ than thôi, nếu vẽ biểu đồ khác, thì khai báo 1 biểu đồ khác đã được cấu hình vẽ bên chart_core.js vào
    // Xài cấu trúc if  tương tự thế này
    if (f && f.labels.length > 0) {
        drawCoalConsumeChart(
            config.canvasId, 
            f.labels, 
            f[config.keyTK3],  // Tự lấy mảng data TK3 tương ứng
            f[config.keyTK4],  // Tự lấy mảng data TK4 tương ứng
            f.trungbinh, 
            f.tichluyTK3, 
            f.tichluyTK4, 
            lineFilter
        );
    } else {
        console.warn(`Dữ liệu lọc ${chartType} rỗng.`);
    }
}

// 3. HÀM XOÁ LỌC CHUNG
function clearUniversalFilter(chartType) {
    const config = chartConfigs[chartType];
    if (!config) return;

    const suffix = config.filterSuffix;
    ['start', 'end'].forEach(prefix => {
        const el = document.getElementById(`${prefix}${suffix}`);
        if (el) el.value = "";
    });
    
    const shiftEl = document.getElementById(`shift${suffix}`);
    if (shiftEl) shiftEl.value = "all";
    
    const lineEl = document.getElementById(`sinterline${suffix}`);
    if (lineEl) lineEl.value = "all";
    
    // Xoá xong thì kích hoạt vẽ lại
    applyUniversalFilter(chartType);
}