import { Request, Response, NextFunction } from "express";
import { PedidoRepository } from "./pedido.repository.js";
import { Pedido } from "./pedido.entity.js";
import nodemailer from 'nodemailer';
import { HamburguesaRepository } from "../hamburguesa/hamburguesa.repository.js";
const repository_4 = new PedidoRepository();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'hamburgueseriautn@gmail.com', 
        pass: 'bfqm szfa orru xghw' 
    }
});
function sanitizePedidoInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedEnter = {
        idPedido: req.body.idPedido,
        modalidad: req.body.modalidad,
        estado: req.body.estado,
        idCliente: req.body.idCliente,
        hamburguesas: req.body.hamburguesas,
    };
    next();
}
async function findAll(req: Request, res: Response) {
    const pedidos = await repository_4.findAll();
    res.json({ data: pedidos });
}
async function findOne(req: Request, res: Response) {
    const pedido = await repository_4.findOne({ id: req.params.idPedido });
    if (!pedido) {
        res.status(404).send({ message: 'Pedido No Encontrado' });
    } else {
        res.json(pedido);
    }
}
async function add(req: Request, res: Response) {
    const enter = req.body.sanitizedEnter;
    const hamburguesas = req.body.hamburguesas;

    if (!hamburguesas || hamburguesas.length === 0) {
        return res.status(400).send({ message: 'Debe incluir al menos una hamburguesa en el pedido' });
    }

    const pedidoEnter = new Pedido(enter.modalidad, 0, enter.estado, enter.idCliente);
    pedidoEnter.hamburguesas = hamburguesas;

    try {
        const pedido = await repository_4.add(pedidoEnter);
        if (pedido) {
            await sendConfirmationEmail(pedido);
        } else {
            console.error('Pedido no encontrado');
        }
        return res.status(201).send({ message: 'PEDIDO CREADO', data: pedido });
    } catch (error: any) {
        return res.status(400).send({ message: error.message });
    }
}
async function update(req: Request, res: Response) {
    req.body.sanitizedEnter.idPedido = req.params.idPedido;

    const hamburguesas = req.body.hamburguesas;

    if (!hamburguesas || hamburguesas.length === 0) {
        return res.status(400).send({ message: 'Debe incluir al menos una hamburguesa en el pedido' });
    }

    const pedidoEnter = new Pedido(
        req.body.sanitizedEnter.modalidad,
        0, 
        req.body.sanitizedEnter.estado,
        req.body.sanitizedEnter.idCliente
    );

    pedidoEnter.idPedido = parseInt(req.params.idPedido, 10);
    pedidoEnter.hamburguesas = hamburguesas;

    try {
        const pedido = await repository_4.update(req.params.idPedido, pedidoEnter);
        if (!pedido) {
            return res.status(404).send({ message: 'Pedido No Encontrado' });
        }
        await sendConfirmationEmail(pedido);

        return res.status(200).send({ message: 'PEDIDO MODIFICADO CORRECTAMENTE', data: pedido });
    } catch (error: any) {
        return res.status(400).send({ message: error.message });
    }
}
async function remove(req: Request, res: Response) {
    const id = req.params.idPedido;

    const pedido = await repository_4.findOne({ id });
    if (!pedido) {
        return res.status(404).send({ message: 'Pedido no encontrado' });
    }

    if (pedido.estado !== 'ENTREGADO') {
        return res.status(400).send({ message: 'No se puede eliminar un pedido que no ha sido entregado' });
    }

    try {
        await repository_4.delete({ id });
        return res.status(200).send({ message: 'Pedido eliminado correctamente' });
    } catch (error: any) {
        return res.status(400).send({ message: `Error al eliminar el pedido: ${error.message}` });
    }
}

async function updateEstado(req: Request, res: Response) {
    const idPedido = req.params.idPedido;
    const { estado } = req.body;

    if (!estado) {
        return res.status(400).send({ message: 'El estado es obligatorio' });
    }

    const pedido = await repository_4.findOne({ id: idPedido });
    if (!pedido) {
        return res.status(404).send({ message: 'Pedido no encontrado' });
    }

    pedido.estado = String(estado); 

    try {
        const updatedPedido = await repository_4.updateEstado(idPedido, pedido.estado);
        return res.status(200).send({ message: 'Estado del pedido actualizado correctamente', data: updatedPedido });
    } catch (error: any) {
        return res.status(400).send({ message: error.message });
    }
}

async function sendConfirmationEmail(pedido: Pedido) {
    try {
        const cliente = await repository_4.getClienteById(pedido.idCliente);
        
        if (!cliente || !cliente.email) {
            console.log('No se encontró el correo del cliente');
            return;
        }

        
        const hamburguesaRepository = new HamburguesaRepository();  

        const hamburguesasConPrecio = await Promise.all(pedido.hamburguesas!.map(async (h) => {
            const precioHamburguesa = await hamburguesaRepository.getPrecioById(h.idHamburguesa);  
            return { ...h, precio: precioHamburguesa };
        }));

        
        const total = hamburguesasConPrecio.reduce((acc, h) => acc + (h.precio || 0) * h.cantidad, 0);

    
        const mailOptions = {
            from: 'hamburgueseriautn@gmail.com', 
            to: cliente.email,
            subject: `Confirmación de Pedido - ${pedido.idPedido}`,
            html: `
                <h1 style="color: #333; font-family: Arial, sans-serif;">Confirmación de Pedido</h1>
                <p>Hola <strong>${cliente.nombre}</strong>,</p>
                <p>Tu pedido ha sido confirmado. Aquí están los detalles:</p>
                <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif;">
                    <tr>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Modalidad</th>
                        <td style="border: 1px solid #ddd; padding: 8px;">${pedido.modalidad}</td>
                    </tr>
                    <tr>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Estado</th>
                        <td style="border: 1px solid #ddd; padding: 8px;">${pedido.estado}</td>
                    </tr>
                    <tr>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Hamburguesas</th>
                        <td style="border: 1px solid #ddd; padding: 8px;">
                            <ul>
                                ${hamburguesasConPrecio.map(h => `<li>${h.nombre} x ${h.cantidad} - $${h.precio! * h.cantidad}</li>`).join('')}
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Total</th>
                        <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">$${total.toFixed(2)}</td>
                    </tr>
                </table>
                <p style="margin-top: 20px; font-size: 16px;">Gracias por tu compra. Te esperamos pronto en nuestra hamburguesería :).</p> 
                <p style="margin-top: 20px; font-size: 16px;">Dirección: Zeballos 1341 </p>  
                <p style="margin-top: 20px; font-size: 16px;">Mail de contacto: <strong>hamburgueseriautn@gmail.com</strong> </p>            `
               
                
        };

    
        await transporter.sendMail(mailOptions);
        console.log('Correo enviado exitosamente');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
    }
}
export { sanitizePedidoInput, findAll, findOne, add, update, remove, updateEstado };
