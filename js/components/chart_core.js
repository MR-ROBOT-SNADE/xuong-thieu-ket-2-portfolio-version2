/* HỆ THỐNG VẼ BIỂU ĐỒ TỪ DỮ LIỆU CẬP NHẬT TỪ GOOGLESHEET API */

Chart.register(ChartDataLabels);
let chartInstances = {}, isFlashing = false;

setInterval(() => {
    isFlashing = !isFlashing;
    Object.values(chartInstances).forEach(c => c && c.update('none'));
}, 500);

const getCSS = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const getUI = (id) => document.getElementById(id) ? document.getElementById(id).value : "";

function extractChartData(dataSource, timeCol, shiftCol, dataCols) {
    if (!dataSource?.length) return null;
    let res = { labels: [] };
    dataCols.forEach(c => res[c] = []);
    
    let curDate = "";
    dataSource.forEach(row => {
        if (!row[shiftCol]) return;
        if (row[timeCol]?.trim()) curDate = row[timeCol];
        res.labels.push(`${curDate} - ${row[shiftCol]}`);
        dataCols.forEach(c => res[c].push(row[c] ? parseFloat(row[c].toString().replace(',','.')) : 0));
    });
    return res;
}

function smartFilter(data, primaryKey, startId, endId, shiftId) {
    if (!data?.labels.length) return null;

    const start = getUI(startId), end = getUI(endId), shift = getUI(shiftId) || "all";
    const isDefault = !start && !end && shift === "all"; // Check xem có đang để trống bộ lọc không
    
    // Nếu để trống, tìm 7 ngày gần nhất
    const latest7Days = isDefault ? [...new Set(data.labels.map((l, i) => data[primaryKey][i] > 0 ? l.split(' - ')[0].trim() : null).filter(Boolean))].slice(-7) : [];
    
    const startTs = start ? new Date(start).getTime() : 0;
    const endTs = end ? new Date(end).getTime() : Infinity;

    let res = { labels: [], isDateFiltered: !isDefault && (start !== "" || end !== "") };
    Object.keys(data).filter(k => k !== 'labels').forEach(k => res[k] = []);

    data.labels.forEach((label, i) => {
        const [dPart, sPart] = label.split(' - ').map(s => s.trim());
        const ts = new Date(dPart.split('/').reverse().join('-')).getTime(); // Chuyển dd/mm/yyyy thành timestamp
        
        // Quyết định giữ lại dòng này hay không?
        const keep = isDefault 
            ? (latest7Days.includes(dPart) && data[primaryKey][i] > 0)
            : (ts >= startTs && ts <= endTs && (shift === 'all' || sPart === shift));

        if (keep) {
            res.labels.push(label);
            Object.keys(res).filter(k => k !== 'labels' && k !== 'isDateFiltered').forEach(k => res[k].push(data[k][i]));
        }
    });
    return res;
}

function drawCoalConsumeChart(canvasId, labels, dataNhietri, dataCcd, dataTrungbinh, dataTichluy, isDateFiltered = false) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    if (chartInstances[canvasId]) chartInstances[canvasId].destroy();

    chartInstances[canvasId] = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { type: 'line', label: 'Mức trung bình', data: dataTrungbinh, borderColor: getCSS('--danger-red') || '#e74c3c', backgroundColor: getCSS('--white'), borderWidth: 2, tension: 0.4, pointStyle: 'triangle', radius: 4, fill: false, yAxisID: 'y_primary', order: 1 },
                { type: 'line', label: 'Tiêu hao luỹ kế', data: dataTichluy, borderColor: getCSS('--warning-yellow') || '#f39c12', backgroundColor: getCSS('--white'), borderWidth: 2, tension: 0.4, pointStyle: 'triangle', radius: 4, fill: false, yAxisID: 'y_primary', order: 2 },
                { type: 'bar', label: 'Theo nhiệt trị', data: dataNhietri, backgroundColor: (ctx) => ctx.raw > dataTrungbinh[ctx.dataIndex] ? (isFlashing ? 'rgba(255,0,0,0.9)' : 'rgba(255,0,0,0.3)') : (getCSS('--primary-blue') || '#a40db8'), yAxisID: 'y_secondary', order: 3 },
                { type: 'bar', label: 'Theo Ccd', data: dataCcd, backgroundColor: (ctx) => ctx.raw > dataTrungbinh[ctx.dataIndex] ? (isFlashing ? 'rgba(255,0,0,0.9)' : 'rgba(255,0,0,0.3)') : (getCSS('--success-green') || '#ed5126'), yAxisID: 'y_secondary', order: 4 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
            scales: {
                y_primary: { type: 'linear', position: 'left', title: { display: true, text: 'Trong tháng' } },
                y_secondary: { type: 'linear', position: 'right', title: { display: true, text: 'Trong ngày' }, grid: { drawOnChartArea: false } }
            },
            plugins: { datalabels: { display: (ctx) => !isDateFiltered && ctx.chart.data.labels.length <= 60 && ctx.dataset.type === 'bar', align: 'top', anchor: 'end', font: { weight: 'bold', size: 11 } } }
        }   
    });
}