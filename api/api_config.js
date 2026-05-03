/* CẤU HÌNH API DỮ LIỆU */

const API_KEY_TK3 = 'https://script.google.com/macros/s/AKfycbxl2vmeyXEtNXXCsL__sAkOGJ7QqjAKLfUxlmz5h4eDZ4f8Jhs3R7PIg8jCHwUEcrS0Rg/exec';
const API_KEY_TK4 = '';


const SHEET_ID_TK3 = '643230965';
const SHEET_ID_TK4 = '';

async function fetchGoogleSheetData(url) {
    try {
        const response = await fetch(url);
        const jsonResponse = await response.json();
        if (!jsonResponse || jsonResponse.status !== "success" || !jsonResponse.data || jsonResponse.data.length === 0) {
            console.warn("Không tìm thấy dữ liệu API tại URL: ",url);
            return null;
        }

        return jsonResponse.data;
    } catch (error) {
        console.error("Lỗi kết nối tải dữ liệu từ api", error);
        return null;
    }
}