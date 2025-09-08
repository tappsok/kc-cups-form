const nodemailer = require('nodemailer');

export default async function handler(req, res) {
    // Security headers
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Verify request has required fields
    const { from_email, full_name } = req.body;
    if (!from_email || !full_name) {
        return res.status(400).json({ error: 'Missing required fields' });
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
            org_name, 
            phone, 
            filename, 
            attachment, 
            styles, 
            colors, 
            goal 
        } = req.body;
        
        let base64Data = null;
        if (attachment && attachment.includes(',')) {
            base64Data = attachment.split(',')[1];
        }
        
        const mailOptions = {
            from: `"KC Cups Form" <${process.env.SMTP_USER}>`,
            to: process.env.RECIPIENT_EMAIL,
            replyTo: from_email,
            subject: `New Design: ${full_name} - ${org_name || 'No Org'}`,
            html: `
                <h2>New Fundraiser Submission</h2>
                <p><strong>Name:</strong> ${full_name}</p>
                <p><strong>Email:</strong> ${from_email}</p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Organization:</strong> ${org_name || 'Not provided'}</p>
                <hr>
                <p><strong>Products:</strong> ${styles || 'Not selected'}</p>
                <p><strong>Colors:</strong> ${colors || 'Not selected'}</p>
                <p><strong>Goal:</strong> ${goal || 'Not set'} items</p>
                ${filename ? `<p><strong>File:</strong> ${filename}</p>` : ''}
            `
        };
        
        if (base64Data && filename) {
            mailOptions.attachments = [{
                filename: filename,
                content: base64Data,
                encoding: 'base64'
            }];
        }
        
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true });
        
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
}