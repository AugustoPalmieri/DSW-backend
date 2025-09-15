import { Delivery } from "../delivery/delivery.entity.js";

export class Pedido {
    constructor(
        public fechaPedido: Date,
        public modalidad: string,
        public montoTotal: number,
        public estado: string,
        public idCliente: number,
        public idPedido?: number,
        public hamburguesas?: { idHamburguesa: number; nombre: string; cantidad: number }[]  ,
        public delivery?:Delivery,
    ) {}
}
