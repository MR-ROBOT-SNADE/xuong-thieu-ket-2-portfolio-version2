/* =============================================================
                XỬ LÝ GIAO THỨC API LOAD DỮ LIỆU
   ============================================================= */


/* Code thử cho TK3, dự phòng khi cải tiến
async function loadCoalConsumeDataTK3() {
    try {
        const queryURL = API_KEY_TK3 + '?limit=10';

        const rows = await fetchGoogleSheetData(queryURL);
        if (!rows) return;

        window.originalTK3data = {
            labels: [], dataNhietri: [], dataCcd: [], dataTrungbinh: [], dataTichluy: []
        };

        let currentDate = "";
        
        rows.forEach(row => {
            if(row["Ca/kíp (THthan)"]) {

                if(row["Thời gian (THthan)"] && row["Thời gian (THthan)"].trim() !== "") {
                    currentDate = row["Thời gian (THthan)"];
                }

                const labelItem = `${currentDate} - ${row["Ca/kíp (THthan)"]}`;

                const parseData = (value) => {
                    if (!value) return 0;
                    return parseFloat(value.toString().replace(',','.'));
                }

                window.originalTK3data.labels.push(labelItem);
                window.originalTK3data.dataNhietri.push(parseData(row["Tiêu hao theo nhiệt trị"]));
                window.originalTK3data.dataCcd.push(parseData(row["Tiêu hao theo Ccd"]));
                window.originalTK3data.dataTrungbinh.push(parseData(row["Mức trung bình"]));
                window.originalTK3data.dataTichluy.push(parseData(row["Tiêu hao than tích luỹ (tính theo nhiệt trị)"]));
            }
        });

        clearFilterTK3();

    } catch (error) {
        console.error("Lỗi tải dữ liệu TK3", error);
    }
} */



/* ===================================================================
                HỆ THỐNG TẢI DỮ LIỆU TỐI ƯU HOÁ CHO DÙNG CHUNG 
   =================================================================== */

window.masterSheetDataTK3 = [];
window.masterSheetDataTK4 = [];

async function loadGoogleSheetData() {
    try {
        const queryTK3 = API_KEY_TK3 + '?limit=10';
        const queryTK4 = API_KEY_TK4 + '?limit=10';

        console.log("Loading data from googlesheet")

        const [rowsTK3, rowsTK4] = await Promise.all([
            fetchGoogleSheetData(queryTK3),
            fetchGoogleSheetData(queryTK4)
        ])

        if (rowsTK3) {
            window.masterSheetDataTK3 = rowsTK3;
            document.dispatchEvent(new CustomEvent('TK3DataReady'));
        }

        if (rowsTK4) {
            window.masterSheetDataTK4 = rowsTK4;
            document.dispatchEvent(new CustomEvent('TK4DataReady'));
        }
        
        console.log("Loaded all data from googlesheet database!");

    } catch (error) {
        console.log("Lỗi tải dữ liệu hệ thống!", error);
    }
}