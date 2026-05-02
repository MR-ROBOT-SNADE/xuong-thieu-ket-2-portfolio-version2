/* =============================================================
                XỬ LÝ GIAO THỨC API LOAD DỮ LIỆU
   ============================================================= */



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

        drawDashBoardChart('coal-chart-tk3', 
            [...window.originalTK3data.labels],
            [...window.originalTK3data.dataNhietri],
            [...window.originalTK3data.dataCcd],
            [...window.originalTK3data.dataTrungbinh],
            [...window.originalTK3data.dataTichluy]
        );

    } catch (error) {
        console.error("Lỗi tải dữ liệu TK3", error);
    }
}