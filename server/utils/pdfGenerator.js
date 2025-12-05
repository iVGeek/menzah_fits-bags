/**
 * PDF Receipt Generator for Menzah_fits
 * Generates professional PDF receipts for orders
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a PDF receipt for an order
 * @param {Object} order - The order object
 * @param {string} outputPath - Path where PDF should be saved
 * @returns {Promise<string>} - Path to generated PDF
 */
async function generateReceipt(order, outputPath) {
    return new Promise((resolve, reject) => {
        try {
            // Create PDF document
            const doc = new PDFDocument({ 
                size: 'A4',
                margin: 50
            });

            // Pipe to file
            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);

            // Add business header
            doc.fontSize(24)
               .fillColor('#2A7B9B')
               .text('Menzah_fits', { align: 'center' })
               .fontSize(12)
               .fillColor('#666666')
               .text('Handcrafted Coastal Crochet Fashion', { align: 'center' })
               .text('Mombasa, Kenya', { align: 'center' })
               .text('Email: hello@menzahfits.com', { align: 'center' })
               .moveDown(2);

            // Receipt title
            doc.fontSize(20)
               .fillColor('#000000')
               .text('RECEIPT', { align: 'center' })
               .moveDown();

            // Order information
            doc.fontSize(12)
               .fillColor('#333333');

            const orderDate = new Date(order.createdAt || order.date);
            const receiptNo = `MENZAH-${order.id || order._id || 'TEMP'}`;

            doc.text(`Receipt No: ${receiptNo}`, 50, doc.y)
               .text(`Date: ${orderDate.toLocaleDateString('en-KE', { 
                   year: 'numeric', 
                   month: 'long', 
                   day: 'numeric' 
               })}`, 50, doc.y)
               .text(`Status: ${(order.status || 'confirmed').toUpperCase()}`, 50, doc.y)
               .moveDown();

            // Customer information
            doc.fontSize(14)
               .fillColor('#2A7B9B')
               .text('Customer Information', 50, doc.y)
               .moveDown(0.5);

            doc.fontSize(12)
               .fillColor('#333333')
               .text(`Name: ${order.customerName || 'N/A'}`, 50, doc.y)
               .text(`Email: ${order.customerEmail || 'N/A'}`, 50, doc.y)
               .text(`Phone: ${order.customerPhone || 'N/A'}`, 50, doc.y)
               .moveDown(2);

            // Items table header
            doc.fontSize(14)
               .fillColor('#2A7B9B')
               .text('Order Items', 50, doc.y)
               .moveDown(0.5);

            // Table header
            const tableTop = doc.y;
            doc.fontSize(10)
               .fillColor('#FFFFFF')
               .rect(50, tableTop, 495, 25)
               .fill('#2A7B9B')
               .fillColor('#FFFFFF')
               .text('Item', 60, tableTop + 8, { width: 200 })
               .text('Qty', 270, tableTop + 8, { width: 50 })
               .text('Price', 330, tableTop + 8, { width: 100 })
               .text('Total', 440, tableTop + 8, { width: 100 });

            // Table items
            let yPosition = tableTop + 35;
            doc.fillColor('#333333');

            (order.items || []).forEach((item, index) => {
                const bgColor = index % 2 === 0 ? '#F5F5F5' : '#FFFFFF';
                doc.rect(50, yPosition - 5, 495, 25)
                   .fill(bgColor);

                doc.fillColor('#333333')
                   .fontSize(10)
                   .text(item.name || item.productName || 'Item', 60, yPosition, { width: 200 })
                   .text(item.quantity?.toString() || '1', 270, yPosition, { width: 50 })
                   .text(`KES ${(item.price || 0).toLocaleString()}`, 330, yPosition, { width: 100 })
                   .text(`KES ${(item.subtotal || item.price * item.quantity || 0).toLocaleString()}`, 440, yPosition, { width: 100 });

                yPosition += 30;
            });

            // Totals section
            yPosition += 20;
            doc.fontSize(12)
               .fillColor('#333333');

            const subtotal = order.subtotal || order.total || 0;
            const deliveryFee = order.deliveryFee || 0;
            const total = order.total || 0;

            doc.text('Subtotal:', 350, yPosition)
               .text(`KES ${subtotal.toLocaleString()}`, 440, yPosition, { align: 'right', width: 100 });
            
            yPosition += 20;
            doc.text('Delivery Fee:', 350, yPosition)
               .text(`KES ${deliveryFee.toLocaleString()}`, 440, yPosition, { align: 'right', width: 100 });

            yPosition += 20;
            doc.fontSize(14)
               .fillColor('#2A7B9B')
               .text('TOTAL:', 350, yPosition)
               .text(`KES ${total.toLocaleString()}`, 440, yPosition, { align: 'right', width: 100 });

            // Payment method
            yPosition += 40;
            doc.fontSize(12)
               .fillColor('#333333')
               .text(`Payment Method: ${order.paymentMethod || 'N/A'}`, 50, yPosition)
               .moveDown(2);

            // Footer
            doc.fontSize(10)
               .fillColor('#666666')
               .text('Thank you for your purchase!', { align: 'center' })
               .moveDown(0.5)
               .text('For inquiries, contact us at hello@menzahfits.com or WhatsApp: +254700000000', { align: 'center' })
               .moveDown(0.5)
               .fontSize(8)
               .text('This is a computer-generated receipt and does not require a signature.', { align: 'center' });

            // Finalize PDF
            doc.end();

            stream.on('finish', () => {
                resolve(outputPath);
            });

            stream.on('error', (error) => {
                reject(error);
            });

        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    generateReceipt
};
