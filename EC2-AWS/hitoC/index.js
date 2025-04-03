const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware để parse JSON
app.use(bodyParser.json());

// Queue lưu trữ tạm thời trong bộ nhớ
const queue = [
    {
        id: 1612345678901,
        body: 'Message 1',
        visibilityTimeout: "22:21:00s",
    },
    {
        id: 1612345678902,
        body: 'Message 2',
        visibilityTimeout: null,
    },
    {
        id: 1612345678903,
        body: 'Message 3',
        visibilityTimeout: null,
    },
    {
        id: 1612345678904,
        body: 'Message 4',
        visibilityTimeout: null,
    },
    {
        id: 1612345678905,
        body: 'Message 5',
        visibilityTimeout: null,
    }
];

// Thời gian ẩn message (30 giây)
const VISIBILITY_TIMEOUT = 30000;

// Endpoint để gửi message vào queue
app.post('/send', (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // Thêm message vào queue với trạng thái mặc định
    queue.push({
        id: Date.now(), // ID duy nhất cho message
        body: message,
        visibilityTimeout: null, // Không bị ẩn ban đầu
    });

    console.log(`Message added to queue: ${message}`);
    res.status(200).json({ success: true, message: 'Message added to queue' });
});

// Endpoint để polling message từ queue
app.get('/poll', (req, res) => {
    const now = Date.now();

    // lần 1: now = 22:20:30s // lúc get message
    // lần 2: now = 22:20:35s // lúc mesage bị ẩn
    // lần 3: now = 22:22:00s // lúc message hết thời gian ẩn

    // Tìm message khả dụng (không bị ẩn hoặc đã hết thời gian ẩn)
    const messageIndex = queue.findIndex(
        (msg) => !msg.visibilityTimeout || msg.visibilityTimeout <= now
    );

    if (messageIndex === -1) {
        return res.status(200).json({ success: true, message: 'Queue is empty' });
    }

    // Lấy message và cập nhật visibilityTimeout
    const message = queue[messageIndex];
    message.visibilityTimeout = now + VISIBILITY_TIMEOUT;

    console.log(`Message polled from queue: ${message.body}`);
    res.status(200).json({ success: true, message: message.body, id: message.id });
});

// Endpoint để xóa message khỏi queue
app.post('/delete', (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Message ID is required' });
    }

    // Tìm và xóa message theo ID
    const messageIndex = queue.findIndex((msg) => msg.id === id);

    if (messageIndex === -1) {
        return res.status(404).json({ error: 'Message not found' });
    }

    const deletedMessage = queue.splice(messageIndex, 1);
    console.log(`Message deleted from queue: ${deletedMessage[0].body}`);
    res.status(200).json({ success: true, message: 'Message deleted successfully' });
});

// Start server
app.listen(port, () => {
    console.log(`Queue server is running on http://localhost:${port}`);
});