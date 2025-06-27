const nodemailer = require('nodemailer');

// Gmail service configuration
const createTransporter = () => {
    return nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Your Gmail address
            pass: process.env.EMAIL_PASS  // Your Gmail app password
        }
    });
};

// Send notification email to multiple recipients
const sendGroupNotification = async (recipients, subject, message, groupTitle) => {
    try {
        const transporter = createTransporter();
        
        const emailPromises = recipients.map(async (recipient) => {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: recipient.email,
                subject: `[Study Group] ${subject}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #1976d2;">Study Group Notification</h2>
                        <h3 style="color: #333;">Group: ${groupTitle}</h3>
                        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="font-size: 16px; line-height: 1.6; color: #555;">
                                ${message.replace(/\n/g, '<br>')}
                            </p>
                        </div>
                        <p style="color: #666; font-size: 14px;">
                            This email was sent by the administrator of your study group.
                        </p>
                        <hr style="border: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #999; font-size: 12px;">
                            Study Group Finder App - Notification System
                        </p>
                    </div>
                `
            };
            
            return transporter.sendMail(mailOptions);
        });
        
        await Promise.all(emailPromises);
        return { success: true, count: recipients.length };
        
    } catch (error) {
        console.error('Email sending error:', error);
        throw new Error('Failed to send notification emails');
    }
};

module.exports = {
    sendGroupNotification
};