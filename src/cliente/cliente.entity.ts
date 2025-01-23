
export class Cliente{
    constructor(
        public nombre:string,
        public apellido:string,
        public telefono:string,
        public email: string,
        public direccion:string,
        public passwordHash: string,
        public idCliente?: number
    ){}
}