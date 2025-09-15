import { Request, Response } from "express"
import { ClienteRepository } from "./cliente.repository.js"
import bcrypt from "bcryptjs"
import transporter from "../mailService.js"

const repository = new ClienteRepository()
const resetCodes = new Map<string, { code: string, expires: number }>()

async function sendCode(req: Request, res: Response) {
    const { email } = req.body
    
    if (!email) {
        return res.status(400).json({ error: "Email es requerido" })
    }

    const cliente = await repository.findByEmail(email)
    if (!cliente) {
        return res.status(404).json({ error: "Email no encontrado" })
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = Date.now() + 10 * 60 * 1000 // 10 minutes
    
    resetCodes.set(email, { code, expires })
    
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Código de recuperación de contraseña',
            html: `
                <h2>Código de recuperación</h2>
                <p>Tu código de verificación es: <strong>${code}</strong></p>
                <p>Este código expira en 10 minutos.</p>
            `
        })
        res.status(200).json({ message: "Código enviado al email" })
    } catch (error) {
        console.error('Error enviando email:', error)
        console.log(`Código para ${email}: ${code}`) // Fallback
        res.status(200).json({ message: "Código enviado al email" })
    }
}

async function verifyCode(req: Request, res: Response) {
    const { email, code } = req.body
    
    if (!email || !code) {
        return res.status(400).json({ error: "Email y código son requeridos" })
    }

    const storedData = resetCodes.get(email)
    if (!storedData) {
        return res.status(400).json({ error: "Código no encontrado" })
    }

    if (Date.now() > storedData.expires) {
        resetCodes.delete(email)
        return res.status(400).json({ error: "Código expirado" })
    }

    if (storedData.code !== code) {
        return res.status(400).json({ error: "Código incorrecto" })
    }
    
    res.status(200).json({ message: "Código verificado correctamente" })
}

async function resetPassword(req: Request, res: Response) {
    const { email, newPassword } = req.body
    
    if (!email || !newPassword) {
        return res.status(400).json({ error: "Email y nueva contraseña son requeridos" })
    }

    const storedData = resetCodes.get(email)
    if (!storedData) {
        return res.status(400).json({ error: "Debe verificar el código primero" })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    try {
        const cliente = await repository.findByEmail(email)
        if (!cliente) {
            return res.status(404).json({ error: "Cliente no encontrado" })
        }

        await repository.update(cliente.idCliente!.toString(), { passwordHash: hashedPassword } as any)
        resetCodes.delete(email)
        
        res.status(200).json({ message: "Contraseña actualizada correctamente" })
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar contraseña" })
    }
}

export { sendCode, verifyCode, resetPassword }