import { Request, Response, NextFunction } from "express";
import { PedidoRepository } from "./pedido.repository.js";
import { Pedido } from "./pedido.entity.js";

const repository_4 = new PedidoRepository();

// Middleware para sanitizar los datos de entrada
function sanitizePedidoInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedEnter = {
        idPedido: req.body.idPedido,
        modalidad: req.body.modalidad,
        estado: req.body.estado,
        idCliente: req.body.idCliente,
    };
    next();
}

// Función para obtener todos los pedidos
async function findAll(req: Request, res: Response) {
    const pedidos = await repository_4.findAll();
    res.json({ data: pedidos });
}

// Función para obtener un pedido por ID
async function findOne(req: Request, res: Response) {
    const pedido = await repository_4.findOne({ id: req.params.idPedido });
    if (!pedido) {
        res.status(404).send({ message: 'Pedido Not Found' });
    } else {
        res.json(pedido);
    }
}

// Función para agregar un nuevo pedido
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
        return res.status(201).send({ message: 'PEDIDO CREADO', data: pedido });
    } catch (error: any) {
        return res.status(400).send({ message: error.message });
    }
}

// Función para actualizar un pedido (tanto la modalidad como las hamburguesas)
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
            return res.status(404).send({ message: 'Pedido Not Found' });
        }
        return res.status(200).send({ message: 'PEDIDO MODIFICADO CORRECTAMENTE', data: pedido });
    } catch (error: any) {
        return res.status(400).send({ message: error.message });
    }
}

// Función para eliminar un pedido
async function remove(req: Request, res: Response) {
    const id = req.params.idPedido;
    const pedido = await repository_4.delete({ id });
    if (!pedido) {
        res.status(404).send({ message: 'PEDIDO Not Found' });
    } else {
        res.status(200).send({ message: 'PEDIDO ELIMINADO CORRECTAMENTE' });
    }
}

// **Nueva función para actualizar el estado de un pedido**
async function updateEstado(req: Request, res: Response) {
    const idPedido = req.params.idPedido;
    const { estado } = req.body;

    // Validar que el estado se haya proporcionado
    if (!estado) {
        return res.status(400).send({ message: 'El estado es obligatorio' });
    }

    // Buscar el pedido
    const pedido = await repository_4.findOne({ id: idPedido });
    if (!pedido) {
        return res.status(404).send({ message: 'Pedido no encontrado' });
    }

    // Actualizar solo el estado
    pedido.estado = String(estado);  // Asegurarse que el estado sea un string

    try {
        const updatedPedido = await repository_4.updateEstado(idPedido, pedido.estado); // Llamar a la función del repositorio para actualizar el estado
        return res.status(200).send({ message: 'Estado del pedido actualizado correctamente', data: updatedPedido });
    } catch (error: any) {
        return res.status(400).send({ message: error.message });
    }
}


export { sanitizePedidoInput, findAll, findOne, add, update, remove, updateEstado};
