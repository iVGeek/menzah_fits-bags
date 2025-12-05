/**
 * Email Service for Menzah_fits
 * Sends receipts and notifications via email
 */

const nodemailer = require('nodemailer');
const path = require('path');

/**
 * Create email transporter
 * Configure with environment variables or use default settings
 */
function createTransporter() {
    // Check if SMTP settings are configured in environment
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        return nodemailer.createTransporter({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    // For development/testing: Use ethereal.email (fake SMTP service)
    // In production, you should configure real SMTP settings
    console.warn('⚠️  No SMTP configuration found. Email functionality will not work.');
    console.warn('   Configure SMTP_HOST, SMTP_USER, SMTP_PASS in .env file');
    
    return null;
}

/**
 * Send receipt email to customer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.customerName - Customer name
 * @param {string} options.orderId - Order ID
 * @param {string} options.pdfPath - Path to PDF receipt
 * @param {number} options.total - Order total
 * @returns {Promise<Object>} - Email send result
 */
async function sendReceiptEmail({ to, customerName, orderId, pdfPath, total }) {
    const transporter = createTransporter();
    
    if (!transporter) {
        throw new Error('Email transporter not configured. Please set SMTP environment variables.');
    }

    const mailOptions = {
        from: process.env.SMTP_FROM || '"Menzah_fits" <hello@menzahfits.com>',
        to: to,
        subject: `Your Menzah_fits Order Receipt - #${orderId}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background: linear-gradient(135deg, #2A7B9B 0%, #1E5A73 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                        border-radius: 10px 10px 0 0;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 32px;
                    }
                    .content {
                        background: #f9f9f9;
                        padding: 30px;
                        border-radius: 0 0 10px 10px;
                    }
                    .order-info {
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                    }
                    .order-info h2 {
                        color: #2A7B9B;
                        margin-top: 0;
                    }
                    .highlight {
                        color: #2A7B9B;
                        font-weight: bold;
                        font-size: 18px;
                    }
                    .footer {
                        text-align: center;
                        padding: 20px;
                        color: #666;
                        font-size: 14px;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 30px;
                        background: #2A7B9B;
                        color: white !important;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🧶 Menzah_fits</h1>
                    <p>Handcrafted Coastal Crochet Fashion</p>
                </div>
                <div class="content">
                    <p>Dear ${customerName || 'Valued Customer'},</p>
                    
                    <p>Thank you for your purchase! Your payment has been confirmed and your order is being prepared.</p>
                    
                    <div class="order-info">
                        <h2>Order Confirmed</h2>
                        <p><strong>Order Number:</strong> #${orderId}</p>
                        <p><strong>Total Amount:</strong> <span class="highlight">KES ${total.toLocaleString()}</span></p>
                        <p><strong>Status:</strong> <span style="color: #4FA3C7;">✓ Confirmed</span></p>
                    </div>
                    
                    <p>Your official receipt is attached to this email as a PDF file.</p>
                    
                    <p>We'll notify you when your order is ready for delivery or pickup.</p>
                    
                    <center>
                        <a href="https://wa.me/254700000000?text=Hi!%20I%20have%20a%20question%20about%20order%20${orderId}" class="button">
                            Contact Us on WhatsApp
                        </a>
                    </center>
                    
                    <p><strong>Need Help?</strong><br>
                    Email: hello@menzahfits.com<br>
                    WhatsApp: +254 700 000 000<br>
                    Location: Mombasa, Kenya</p>
                </div>
                <div class="footer">
                    <p>This is an automated email. Please do not reply directly to this message.</p>
                    <p>© ${new Date().getFullYear()} Menzah_fits. All rights reserved.</p>
                </div>
            </body>
            </html>
        `,
        text: `
Dear ${customerName || 'Valued Customer'},

Thank you for your purchase! Your payment has been confirmed.

Order Number: #${orderId}
Total Amount: KES ${total.toLocaleString()}
Status: Confirmed

Your official receipt is attached to this email.

We'll notify you when your order is ready for delivery or pickup.

Need help? Contact us:
Email: hello@menzahfits.com
WhatsApp: +254 700 000 000

© ${new Date().getFullYear()} Menzah_fits. All rights reserved.
        `,
        attachments: [
            {
                filename: `Receipt-${orderId}.pdf`,
                path: pdfPath
            }
        ]
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Email send failed:', error.message);
        throw error;
    }
}

module.exports = {
    sendReceiptEmail,
    createTransporter
};
