const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// เชื่อมต่อ Database
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Schema ข้อมูลนักเรียน
const UserSchema = new mongoose.Schema({
    name: String, lastname: String, email: String, 
    courseName: String, batch: String, password: String, status: String
});
const User = mongoose.model('User', UserSchema);

// ตั้งค่าอีเมลผู้ส่ง
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// API ลงทะเบียน
app.post('/api/register', async (req, res) => {
    try {
        const { name, lastname, email, courseName, batch } = req.body;
        
        // สร้าง Password 6 ตัว (ตัวพิมพ์ใหญ่ + ตัวเลข)
        const password = Math.random().toString(36).slice(-6).toUpperCase();

        const newUser = new User({ name, lastname, email, courseName, batch, password, status: 'Pending' });
        await newUser.save();

        // --- แก้ไขเนื้อหาอีเมลตรงนี้ ---
        await transporter.sendMail({
            from: '"โรงเรียนอุบลบุรีรักษ์การบริบาล" <urrschool@gmail.com>', // ชื่อผู้ส่ง
            to: 'urrschool@gmail.com, apipoooo@gmail.com', // ส่งถึง Admin
            subject: `[Admin] คำขอลงทะเบียนใหม่: ${name} ${lastname}`,
            html: `
                <h2>มีนักเรียนใหม่ลงทะเบียนเรียน</h2>
                <p><b>โรงเรียนอุบลบุรีรักษ์การบริบาล</b></p>
                <hr>
                <p><b>ชื่อ-นามสกุล:</b> ${name} ${lastname}</p>
                <p><b>หลักสูตร:</b> ${courseName}</p>
                <p><b>รุ่นที่:</b> ${batch}</p>
                <p><b>อีเมลนักเรียน:</b> ${email}</p>
                <p><b>Password ที่ระบบสร้างให้:</b> <span style="color:blue; font-size:18px;">${password}</span></p>
                <hr>
                <p><i>กรุณาตรวจสอบและอนุมัติผ่านระบบ Admin</i></p>
            `
        });

        res.json({ success: true, message: 'ส่งข้อมูลการลงทะเบียนเรียบร้อยแล้ว' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด: ' + error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
