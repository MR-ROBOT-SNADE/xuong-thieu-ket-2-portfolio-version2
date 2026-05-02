/* HỆ THỐNG VẼ BIỂU ĐỒ TỪ DỮ LIỆU CẬP NHẬT TỪ GOOGLESHEET API */

let chartInstances = {};
let isFlashing = false;
window.originalTK3data = null;

setInterval(() => {
    isFlashing = !isFlashing;
    Object.values(chartInstances).forEach(chart => {
        if(chart) chart.update('none');
    });
}, 500);

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

    chartInstances[canvasId] = new Chart(ctx, {
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
                    tension: 0.4,
                    pointStyle: 'triangle',
                    radius: 4,
                    fill: false,
                    yAxisID: 'y_primary',
                    order: 1
                },
                {
                    type: 'line',
                    label: 'Tiêu hao than luỹ kế',
                    data: dataTichluy,
                    borderColor: getCSSvariable('--warning-yellow') || '#f39c12',
                    backgroundColor: getCSSvariable('--white') || '#ffffff',
                    borderWidth: 2,
                    tension: 0.4,
                    pointStyle: 'triangle',
                    radius: 4,
                    fill: false,
                    yAxisID: 'y_primary',
                    order: 2
                },
                {
                    type: 'bar',
                    label: 'Tiêu hao than theo nhiệt trị',
                    data: dataNhietri,
                    backgroundColor: (context) => {
                        const val = context.raw;
                        const avg = dataTrungbinh[context.dataIndex];
                        if (val > avg) {
                            return isFlashing ? 'rgba(255, 0, 0, 0.9)' : 'rgba(255, 0, 0, 0.3)';
                        }
                        return getCSSvariable('--primary-blue') || '#a40db8';
                    },
                    borderColor: getCSSvariable('--bg-dark') || '#2c3e50',
                    borderWidth: 1,
                    yAxisID: 'y_secondary',
                    order: 3
                },
                {
                    type: 'bar',
                    label: 'Tiêu hao than theo Ccd',
                    data: dataCcd,
                    backgroundColor: (context) => {
                        const val = context.raw;
                        const avg = dataTrungbinh[context.dataIndex];
                        if (val > avg) {
                            return isFlashing ? 'rgba(255, 0, 0, 0.9)' : 'rgba(255, 0, 0, 0.3)';
                        }
                        return getCSSvariable('--success-green') || '#ed5126';
                    },
                    borderColor: getCSSvariable('--bg-dark') || '#2c3e50',
                    borderWidth: 1,
                    yAxisID: 'y_secondary',
                    order: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                y_primary: {
                    type: 'linear', display: true, position: 'left',
                    title: { display: true, text: 'Tiêu hao trong tháng' },
                    beginAtZero: true
                },
                y_secondary: {
                    type: 'linear', display: true, position: 'right',
                    title: { display: true, text: 'Tiêu hao trong ngày' },
                    beginAtZero: true,
                    grid: { drawOnChartArea: false }
                }
            },
            plugins: { legend: {position: 'top' }}
        }   
    });
}


/* =======================================================================
                      HỆ THỐNG XỬ LÝ LỌC DỮ LIỆU TK3
   ======================================================================= */
function applyFilterTK3() {
    if (!window.originalTK3data) return;
    const startDateStr = document.getElementById('startDateFilterTK3').value;
    const endDateStr = document.getElementById('endDateFilterTK3').value;
    const shiftFilter = document.getElementById('shiftFilterTK3').value;

    const startTimestamp = startDateStr ? new Date(startDateStr).getTime() : null;
    const endTimestamp = endDateStr ? new Date(endDateStr).getTime() : null;

    let flabels = [], fNhietri = [], fCcd = [], fTrungbinh = [], fTichluy = [];

    window.originalTK3data.labels.forEach((label,index) => {
        const parts = label.split(' - ');
        const datePart = parts[0] ? parts[0].trim() : "";
        const shiftPart = parts[1] ? parts[1].trim() : "";

        let matchDate = true;
        let matchShift = true;

        if (startTimestamp || endTimestamp) {
            const [d, m, y] = datePart.split('/');
            const rowTimestamp = new Date(`${y}-${m}-${d}`).getTime();

            if (startTimestamp && rowTimestamp < startTimestamp) matchDate = false;
            if (endTimestamp && rowTimestamp > endTimestamp) matchDate = false;
        }

        if (shiftFilter !== 'all' && shiftPart !== shiftFilter) {
            matchShift = false;
        }

        if (matchDate && matchShift) {
            flabels.push(label);
            fNhietri.push(window.originalTK3data.dataNhietri[index]);
            fCcd.push(window.originalTK3data.dataCcd[index]);
            fTrungbinh.push(window.originalTK3data.dataTrungbinh[index]);
            fTichluy.push(window.originalTK3data.dataTichluy[index]);
        }
    });
    
    drawDashBoardChart('coal-chart-tk3', flabels, fNhietri, fCcd, fTrungbinh, fTichluy);
}

function clearFilterTK3() {
    document.getElementById('startDateFilterTK3').value = "";
    document.getElementById('endDateFilterTK3').value = ""; 
    document.getElementById('shiftFilterTK3').value="all";
    if (window.originalTK3data) {
        drawDashBoardChart('coal-chart-tk3',
            [...window.originalTK3data.labels],
            [...window.originalTK3data.dataNhietri],
            [...window.originalTK3data.dataCcd],
            [...window.originalTK3data.dataTrungbinh],
            [...window.originalTK3data.dataTichluy]
        );
    }
}
