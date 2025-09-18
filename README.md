# 🍔 Sistema de Gestión Integral de Hamburguesería
## **Universidad Tecnologica Nacional**
## **Desarrollo de Software**

## Participantes
 Nombre | Legajo |
|--------|--------|
| Diaz, Iñaki Enrique | 48944 |
| Palmieri, Augusto | 51705 |

## <img src="\uploads\u14.png" alt= "imagen presentacion" width="600"/>

# DSW-backend - API Hamburguesería

API REST para sistema de gestión integral de hamburguesería desarrollada con Node.js, Express y TypeScript.

## Tecnologías

- Node.js + Express
- TypeScript
- MySQL
- JWT para autenticación
- Multer para subida de archivos
- Nodemailer para emails

## Requisitos previos

- Node.js 18+
- MySQL 8.0+
- npm o pnpm

## Instalación
npm install

# Desarrollo
npm run start:dev

# El servidor corre en http://localhost:3000

## Endpoints princpales
# Clientes
POST /api/clientes - Registrar cliente

GET /api/clientes - Listar clientes

PUT /api/clientes/:id - Actualizar cliente

# Hamburguesas
GET /api/hamburguesas - Listar hamburguesas

POST /api/hamburguesas - Crear hamburguesa

PUT /api/hamburguesas/:id - Actualizar hamburguesa

# Pedidos
POST /api/pedidos - Crear pedido

GET /api/pedidos - Listar pedidos

PUT /api/pedidos/:id - Actualizar estado

# Ingredientes
GET /api/ingredientes - Listar ingredientes

POST /api/ingredientes - Crear ingrediente

## testing
- npm test

## Archivo .env
JWT_SECRET=tu_clave_secreta

EMAIL_USER=tu_email@gmail.com

EMAIL_PASSWORD=tu_password_app
