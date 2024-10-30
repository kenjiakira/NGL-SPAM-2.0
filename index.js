const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config(); 

let config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
let intervalMs = config.interval * 1000;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 9999;

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ngl.5koo9.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`)
    .then(() => {
        console.log('Kết nối đến MongoDB thành công!');
    })
    .catch(err => {
        console.error('Kết nối đến MongoDB thất bại:', err);
    });

const userSchema = new mongoose.Schema({
    username: String,
    questions: [String],
    successCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },
    socketId: String
});

const User = mongoose.model('User', userSchema);

app.use(express.static('public'));

const userAgents = [
    
];

let userConfigs = {};

const sendPostRequest = async (userId) => {
    const config = userConfigs[userId];
    if (!config || !config.questions.length) return;

    const { username, questions } = config;
    const question = questions[Math.floor(Math.random() * questions.length)];
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
        config.successCount++;
        const logMessage = `Thành công: Nhận phản hồi cho câu hỏi "${question}". Dữ liệu phản hồi: ${JSON.stringify(response.data)}`;
        console.log(logMessage);
        io.to(userId).emit('log', logMessage);
        io.to(userId).emit('updateCounts', { successCount: config.successCount, failureCount: config.failureCount });
    } catch (error) {
        config.failureCount++;
        const errorMessage = `Thất bại: Yêu cầu thất bại cho câu hỏi "${question}". Lỗi: ${error.message}`;
        console.error(errorMessage);
        io.to(userId).emit('log', errorMessage);
        io.to(userId).emit('updateCounts', { successCount: config.successCount, failureCount: config.failureCount });
    }
};

io.on('connection', (socket) => {
    // Chỉ ghi log khi người dùng mới kết nối lần đầu
    if (!userConfigs[socket.id]) {
        console.log('Khách hàng đã kết nối để cập nhật cấu hình');
    }

    // Khởi tạo cấu hình người dùng
    userConfigs[socket.id] = {
        username: config.username,
        questions: config.questions,
        interval: config.interval,
        successCount: 0,
        failureCount: 0,
        socketId: socket.id
    };

    // Lưu người dùng vào MongoDB
    const newUser = new User({
        username: config.username,
        questions: config.questions,
        socketId: socket.id
    });

    newUser.save()
        .then(() => console.log('Đã lưu thông tin người dùng vào MongoDB'))
        .catch(err => console.error('Lỗi lưu thông tin người dùng:', err));

    const userId = socket.id;
    let intervalId = null; // Để giữ ID của interval

    socket.on('start', () => {
        // Khởi động việc gửi yêu cầu chỉ khi có câu hỏi hợp lệ
        if (userConfigs[userId].questions.length === 0) {
            socket.emit('updateStatus', 'Vui lòng nhập ít nhất một câu hỏi trước khi bắt đầu.');
            return;
        }

        intervalId = setInterval(() => sendPostRequest(userId), userConfigs[userId].interval * 1000);
        socket.emit('updateStatus', 'Đã bắt đầu gửi yêu cầu!');
    });

    socket.on('updateConfig', (newConfig) => {
        userConfigs[userId].username = newConfig.username;
        userConfigs[userId].questions = newConfig.questions.filter(q => q.trim() !== ""); // Lọc các câu hỏi trống
        userConfigs[userId].interval = newConfig.interval;

        // Ngừng và khởi động lại interval
        clearInterval(intervalId); 
        if (userConfigs[userId].questions.length > 0) {
            intervalId = setInterval(() => sendPostRequest(userId), userConfigs[userId].interval * 1000);
        }

        socket.emit('updateStatus', 'Cấu hình đã được cập nhật thành công!');

        // Cập nhật thông tin người dùng trong MongoDB
        User.updateOne({ socketId: userId }, {
            username: newConfig.username,
            questions: newConfig.questions.filter(q => q.trim() !== "")
        }).catch(err => console.error('Lỗi cập nhật thông tin người dùng:', err));
    });

    socket.on('stop', () => {
        clearInterval(intervalId); 
        socket.emit('updateStatus', 'Đã dừng việc gửi yêu cầu!');
    });

    socket.on('disconnect', () => {
        clearInterval(intervalId); 
        delete userConfigs[userId];
    });
});

app.get('/', (req, res) => {
    const logMessage = `Nhận yêu cầu tại / từ IP: ${req.ip} vào lúc ${new Date().toLocaleString()}`;
    console.log(logMessage);
    io.emit('log', logMessage);
    res.send('Máy chủ đang chạy và hoạt động');
});

server.listen(PORT, () => {
    console.log(`Máy chủ đang chạy tại cổng http://localhost:${PORT}`);
});

setInterval(() => {
    const randomQuestion = config.questions[Math.floor(Math.random() * config.questions.length)];
    sendPostRequest(config.username, randomQuestion);
}, intervalMs);
