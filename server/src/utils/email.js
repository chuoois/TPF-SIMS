const nodemailer = require("nodemailer");

/**
 * Cấu hình SMTP transporter
 */
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Gửi email mật khẩu mới cho người dùng
 * @param {string} toEmail - Email người nhận
 * @param {string} newPassword - Mật khẩu mới
 */
const sendNewPasswordEmail = async (toEmail, newPassword) => {
    const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: toEmail,
        subject: "Mật khẩu mới của bạn",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Đặt lại mật khẩu</h2>
        <p>Chúng tôi đã tạo mật khẩu mới cho tài khoản của bạn.</p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #666;">Mật khẩu mới của bạn:</p>
          <p style="margin: 10px 0 0; font-size: 22px; font-weight: bold; color: #333; letter-spacing: 2px;">${newPassword}</p>
        </div>
        <p style="color: #e74c3c; font-size: 13px;">Vui lòng đăng nhập và đổi mật khẩu ngay sau khi nhận được email này.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng liên hệ quản trị viên.</p>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendNewPasswordEmail };
