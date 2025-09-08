const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "hanspardeep04@gmail.com", // ✅ your actual Gmail
        pass: "huwy mibx ittt pisi"      // ✅ your App Password (looks perfect)
    }
});

function sendOTP(email, otp) {
    const mailOptions = {
        from: "hanspardeep04@gmail.com",  // ✅ match your Gmail
        to: email,
        subject: "Your OTP - SafeTransfer",
        text: `Your OTP for SafeTransfer login is: ${otp}`
    };

    return transporter.sendMail(mailOptions);
}

module.exports = sendOTP;
