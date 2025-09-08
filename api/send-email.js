const nodemailer = require('nodemailer');

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
    
    try {
        const { 
            from_email, 
            full_name, 
            org_name, 
            phone, 
            filename, 
            attachment,
            extra_attachment_1,
            extra_filename_1,
            extra_attachment_2,
            extra_filename_2,
            styles, 
            colors, 
            goal,
            shipping_address,
            funds_address,
            payee,
            notes,
            mascot,
            projected_earnings
        } = req.body;
        
        // Build attachments array
        const attachments = [];
        
        // Main design
        if (attachment && filename) {
            let base64Data = attachment;
            if (attachment.includes(',')) {
                base64Data = attachment.split(',')[1];
            }
            attachments.push({
                filename: filename,
                content: base64Data,
                encoding: 'base64'
            });
        }
        
        // Extra design 1
        if (extra_attachment_1 && extra_filename_1) {
            let base64Data = extra_attachment_1;
            if (extra_attachment_1.includes(',')) {
                base64Data = extra_attachment_1.split(',')[1];
            }
            attachments.push({
                filename: extra_filename_1,
                content: base64Data,
                encoding: 'base64'
            });
        }
        
        // Extra design 2
        if (extra_attachment_2 && extra_filename_2) {
            let base64Data = extra_attachment_2;
            if (extra_attachment_2.includes(',')) {
                base64Data = extra_attachment_2.split(',')[1];
            }
            attachments.push({
                filename: extra_filename_2,
                content: base64Data,
                encoding: 'base64'
            });
        }
        
        const mailOptions = {
            from: `"KC Cups Form" <${process.env.SMTP_USER}>`,
            to: process.env.RECIPIENT_EMAIL,
            replyTo: from_email,
            subject: `New Design: ${full_name} - ${org_name || 'No Org'}`,
            html: `
                <h2>New Fundraiser Submission</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background: #f5f5f5;">
                        <td style="padding: 10px;"><strong>Name:</strong></td>
                        <td style="padding: 10px;">${full_name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;"><strong>Email:</strong></td>
                        <td style="padding: 10px;">${from_email}</td>
                    </tr>
                    <tr style="background: #f5f5f5;">
                        <td style="padding: 10px;"><strong>Phone:</strong></td>
                        <td style="padding: 10px;">${phone || 'Not provided'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;"><strong>Organization:</strong></td>
                        <td style="padding: 10px;">${org_name || 'Not provided'}</td>
                    </tr>
                    <tr style="background: #f5f5f5;">
                        <td style="padding: 10px;"><strong>Mascot:</strong></td>
                        <td style="padding: 10px;">${mascot || 'Not provided'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;"><strong>Products:</strong></td>
                        <td style="padding: 10px;">${styles || 'Not selected'}</td>
                    </tr>
                    <tr style="background: #f5f5f5;">
                        <td style="padding: 10px;"><strong>Colors:</strong></td>
                        <td style="padding: 10px;">${colors || 'Not selected'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;"><strong>Goal:</strong></td>
                        <td style="padding: 10px;">${goal || 0} items = $${projected_earnings || 0}</td>
                    </tr>
                    <tr style="background: #f5f5f5;">
                        <td style="padding: 10px;"><strong>Ship To:</strong></td>
                        <td style="padding: 10px;">${shipping_address || 'Not provided'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;"><strong>Funds To:</strong></td>
                        <td style="padding: 10px;">${funds_address || shipping_address || 'Not provided'}</td>
                    </tr>
                    <tr style="background: #f5f5f5;">
                        <td style="padding: 10px;"><strong>Payee:</strong></td>
                        <td style="padding: 10px;">${payee || 'Not specified'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;"><strong>Notes:</strong></td>
                        <td style="padding: 10px;">${notes || 'None'}</td>
                    </tr>
                    <tr style="background: #f5f5f5;">
                        <td style="padding: 10px;"><strong>Files Attached:</strong></td>
                        <td style="padding: 10px;">${attachments.length} design file(s)</td>
                    </tr>
                </table>
            `,
            attachments: attachments
        };
        
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true });
        
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
}
