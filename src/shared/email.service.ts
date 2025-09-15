import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
})

export async function sendResetCode(email: string, code: string) {
    console.log('EMAIL_USER:', process.env.EMAIL_USER)
    console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD)
    console.log('EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD?.length)
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Código de recuperación de contraseña',
        html: `
            <h2>Código de recuperación</h2>
            <p>Tu código de verificación es: <strong>${code}</strong></p>
            <p>Este código expira en 10 minutos.</p>
        `
    }

    console.log('Enviando email a:', email)
    const result = await transporter.sendMail(mailOptions)
    console.log('Email enviado:', result.messageId)
}