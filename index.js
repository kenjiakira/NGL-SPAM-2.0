const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
const intervalMs = config.interval * 1000;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/604.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
    'Mozilla/5.0 (Linux; Android 9; SAMSUNG SM-G960F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Mobile Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36',
    'Mozilla/5.0 (Linux; U; Android 8.0.0; en-us; SM-G935F Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/62.0.3202.84 Mobile Safari/537.36'
];

let successCount = 0;
let failureCount = 0;

const sendPostRequest = async (username, question) => {
    const deviceId = uuidv4();
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

    const data = `username=${encodeURIComponent(username)}&question=${encodeURIComponent(question)}&deviceId=${deviceId}&gameSlug=&referrer=`;

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': '*/*',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': userAgent,
        'Referer': 'https://ngl.link/',
        'Origin': 'https://ngl.link',
    };

    try {
        const response = await axios.post('https://ngl.link/api/submit', data, {
            headers,
            timeout: 10000
        });
        successCount++;
        const logMessage = `Thành công: Nhận phản hồi cho câu hỏi "${question}". Dữ liệu phản hồi: ${JSON.stringify(response.data)}`;
        console.log(logMessage);
        io.emit('log', logMessage);
        io.emit('updateCounts', { successCount, failureCount });
    } catch (error) {
        failureCount++;
        const errorMessage = `Thất bại: Yêu cầu thất bại cho câu hỏi "${question}". Lỗi: ${error.message}`;
        console.error(errorMessage);
        io.emit('log', errorMessage);
        io.emit('updateCounts', { successCount, failureCount });
    }
};

io.on('connection', (socket) => {
    console.log('Một khách hàng đã kết nối để theo dõi nhật ký thời gian thực');
});

app.get('/', (req, res) => {
    const logMessage = `Nhận yêu cầu tại / từ IP: ${req.ip} vào lúc ${new Date().toLocaleString()}`;
    console.log(logMessage);
    io.emit('log', logMessage);
    res.send('Máy chủ đang chạy và hoạt động');
});

server.listen(PORT, () => {
    console.log(`Máy chủ đang chạy tại cổng ${PORT}`);
});

setInterval(() => {
    const randomQuestion = config.questions[Math.floor(Math.random() * config.questions.length)];
    sendPostRequest(config.username, randomQuestion);
}, intervalMs);
