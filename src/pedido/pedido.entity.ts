export class Pedido {
    constructor(
        public modalidad: string,
        public montoTotal: number,
        public estado: string,
        public idCliente: number,
        public idPedido?: number,
        public hamburguesas?: { idHamburguesa: number; nombre: string; cantidad: number }[]  
    ) {}
}
