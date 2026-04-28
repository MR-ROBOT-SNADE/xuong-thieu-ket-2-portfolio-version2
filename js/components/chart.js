/* HỆ THỐNG VẼ BIỂU ĐỒ TỪ DỮ LIỆU CẬP NHẬT TỪ GOOGLESHEET API */

let chartInstances = {};

function getCSSvariable(variableName) {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim()
}

/* Hàm vẽ biểu đồ dùng chung cho biểu đồ cluster line column như tiêu hao than,... */
function drawDashBoardChart(canvasId, labels, dataNhietri, dataCcd, dataTrungbinh, dataTichluy) {
    const canvas = document.getElementById(canvasId);

    if (!canvas) return;

    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    const ctx = canvas.getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    type: 'line',
                    label: 'Mức trung bình',
                    data: dataTrungbinh,
                    borderColor: getCSSvariable('--danger-red') || '#e74c3c',
                    backgroundColor: getCSSvariable('--white') || '#ffffff',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: false,
                    yAxisID: 'y',
                    order: 1
                },
                {
                    type: 'line',
                    label: 'Tiêu hao than luỹ kế',
                    data: dataTichluy,
                    borderColor: getCSSvariable('--warning-yellow') || '#f39c12',
                    backgroundColor: getCSSvariable('--white') || '#ffffff',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.3,
                    fill: false,
                    yAxisID: 'y1',
                    order: 2
                },
                {
                    type: 'bar',
                    label: 'Tiêu hao than theo nhiệt trị',
                    data: dataNhietri,
                    backgroundColor: getCSSvariable('--primary-blue') || '#a40db8',
                    borderColor: getCSSvariable('--bg-dark') || '#2c3e50',
                    borderWidth: 1,
                    yAxisID: 'y',
                    order: 3
                },
                {
                    type: 'bar',
                    label: 'Tiêu hao than theo Ccd',
                    data: dataCcd,
                    backgroundColor: getCSSvariable('--success-green') || '#ed5126',
                    borderColor: getCSSvariable('--bg-dark') || '#2c3e50',
                    borderWidth: 1,
                    yAxisID: 'y',
                    order: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                y: {
                    type: 'linear', display: true, position: 'left',
                    title: { display: true, text: 'Tiêu hao/Trung bình' },
                    beginAtZero: true
                },
                y1: {
                    type: 'linear', display: true, position: 'right',
                    title: { display: true, text: 'Tích luỹ' },
                    beginAtZero: true,
                    grid: { drawOnChartArea: false }
                }
            },
            plugins: { legend: {position: 'top' }}
        }   
    });
}


/* =======================================================================
                    HỆ THỐNG TEST GIAO DIỆN KHI KHÔNG DÙNG API
   ======================================================================= */












   

async function loadCoalConsumeDataTK3() {
    try {
        const queryURL = API_KEY_TK3 + '?limit=15';

        const response = await fetch(queryURL);
        const jsonResponse = await response.json();

        if(!jsonResponse || jsonResponse.status !== "success" || !jsonResponse.data || jsonResponse.data.length === 0){
            console.log("Data not found or API error");
            return;
        }

        const rows = jsonResponse.data;
        const labels = [];
        const dataNhietri = [];
        const dataCcd = [];
        const dataTrungbinh = [];
        const dataTichluy = [];

        let currentDate = "";
        rows.forEach(row => {
            if(row["Ca/kíp (THthan)"]) {

                if(row["Thời gian (THthan)"] && row["Thời gian (THthan)"].trim() !== "") {
                    currentDate = row["Thời gian (THthan)"];
                }

                labels.push(`${currentDate} - ${row["Ca/kíp (THthan)"]}`);

                const parseData = (value) => {
                    if (!value) return 0;
                    return parseFloat(value.toString().replace(',','.'));
                }

                dataNhietri.push(parseData(row["Tiêu hao theo nhiệt trị"]));
                dataCcd.push(parseData(row["Tiêu hao theo Ccd"]));
                dataTrungbinh.push(parseData(row["Mức trung bình"]));
                dataTichluy.push(parseData(row["Tiêu hao than tích luỹ (tính theo nhiệt trị)"]));
            }
        });

        drawDashBoardChart('coal-chart-tk3', labels, dataNhietri, dataCcd, dataTrungbinh, dataTichluy);
    } catch (error) {
        console.error("Lỗi tải dữ liệu TK3", error);
    }
}