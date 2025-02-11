create database if not exists hamburgueseria;

use hamburgueseria;

create user if not exists dsw@'%' identified by 'dsw';
GRANT SELECT, UPDATE, INSERT, DELETE ON hamburgueseria.* TO 'dsw'@'%'; 

CREATE TABLE IF NOT EXISTS clientes (
    idCliente INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(255)  NULL,
    apellido VARCHAR(255)  NULL,
    telefono VARCHAR(20) NULL, 
    email VARCHAR(60)  NULL,
    direccion VARCHAR(60) NULL,
    passwordHash VARCHAR(255) NOT NULL,  
    PRIMARY KEY (idCliente)
);

CREATE TABLE IF NOT EXISTS administradores (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NULL,
    codigo VARCHAR(6) NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS pedidos (
    idPedido INT UNSIGNED NOT NULL AUTO_INCREMENT,
    idCliente INT UNSIGNED NOT NULL,
    modalidad VARCHAR(100)  NULL,
    montoTotal DECIMAL(10, 2)  NULL,
    estado VARCHAR(45) NULL,
    eliminado BOOLEAN DEFAULT FALSE,  
    PRIMARY KEY (idPedido),
    CONSTRAINT fk_pedidos_clientes
    FOREIGN KEY (idCliente) REFERENCES clientes(idCliente)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS hamburguesas (
    idHamburguesa INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR (100) NULL,
    descripcion VARCHAR(250) NULL,
    imagen VARCHAR(255) NULL,  
    PRIMARY KEY(idHamburguesa)
);

CREATE TABLE IF NOT EXISTS ingredientes(
    codIngrediente INT UNSIGNED NOT NULL AUTO_INCREMENT,
    descripcion VARCHAR(250) NULL,
    stock INT UNSIGNED NULL,
    PRIMARY KEY(codIngrediente)
);

CREATE TABLE IF NOT EXISTS hamburguesas_pedidos (
    idPedido INT UNSIGNED NOT NULL,
    idHamburguesa INT UNSIGNED NOT NULL,
    cantidad INT UNSIGNED NOT NULL DEFAULT 1,
    PRIMARY KEY (idPedido, idHamburguesa),
    FOREIGN KEY (idPedido) REFERENCES pedidos(idPedido)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (idHamburguesa) REFERENCES hamburguesas(idHamburguesa)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS ingredientes_hamburguesa (
    idHamburguesa INT UNSIGNED NOT NULL,
    codIngrediente INT UNSIGNED NOT NULL,
    cantidad INT UNSIGNED NOT NULL DEFAULT 1,
    PRIMARY KEY (idHamburguesa, codIngrediente),
    FOREIGN KEY (idHamburguesa) REFERENCES hamburguesas(idHamburguesa)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (codIngrediente) REFERENCES ingredientes(codIngrediente)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS precios (
    idHamburguesa INT UNSIGNED NOT NULL,
    fechaVigencia DATE NOT NULL,   
    precio DECIMAL(10, 2) NULL,
    PRIMARY KEY (idHamburguesa, fechaVigencia),
    FOREIGN KEY (idHamburguesa) REFERENCES hamburguesas(idHamburguesa)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


INSERT INTO clientes (nombre, apellido, telefono, email, passwordHash) 
VALUES ('IÑAKI', 'DIAZ', '123-4567', 'iniadiaz@gmail.com', '$2a$10$defaultPlaceholderHash...'),
('Juan', 'Pérez', '555-1234', 'juan.perez@example.com', '$2a$10$defaultPlaceholderHash...'),
('María', 'González', '555-5678', 'maria.gonzalez@example.com', '$2a$10$defaultPlaceholderHash...'),
('Carlos', 'Ramírez', '555-8765', 'carlos.ramirez@example.com', '$2a$10$defaultPlaceholderHash...');

INSERT INTO hamburguesas (nombre, descripcion, imagen) VALUES
('Cheeseburger', 'Hamburguesa con queso, lechuga y tomate', NULL),
('Bacon Burger', 'Hamburguesa con tocino, queso y cebolla', NULL),
('Veggie Burger', 'Hamburguesa vegetariana con aguacate y lechuga', NULL);

INSERT INTO ingredientes (descripcion, stock) VALUES
('Carne de res', 100),
('Queso', 50),
('Lechuga', 40),
('Tomate', 30),
('Tocino', 25),
('Cebolla', 35),
('Aguacate', 20);

INSERT INTO pedidos (idCliente, modalidad, montoTotal) 
VALUES  (1, 'TAKEAWAY', 10000),
        (1, 'DELIVERY', 25000),
        (1, 'TAKEAWAY', 12.50),
        (2, 'TAKEAWAY', 15.75),
        (3, 'DELIVERY', 10.00);

INSERT INTO hamburguesas_pedidos (idPedido, idHamburguesa, cantidad) 
VALUES
(1, 1, 2),  -- Pedido 1: 2 Cheeseburgers
(1, 2, 1),  -- Pedido 1: 1 Bacon Burger
(2, 2, 2),  -- Pedido 2: 2 Bacon Burgers
(3, 3, 1);  -- Pedido 3: 1 Veggie Burger

INSERT INTO ingredientes_hamburguesa (idHamburguesa, codIngrediente, cantidad) VALUES
(1, 1, 1),  -- Cheeseburger: 1 Carne de res
(1, 2, 1),  -- Cheeseburger: 1 Queso
(1, 3, 1),  -- Cheeseburger: 1 Lechuga
(1, 4, 1),  -- Cheeseburger: 1 Tomate
(2, 1, 1),  -- Bacon Burger: 1 Carne de res
(2, 2, 1),  -- Bacon Burger: 1 Queso
(2, 5, 1),  -- Bacon Burger: 1 Tocino
(2, 6, 1),  -- Bacon Burger: 1 Cebolla
(3, 7, 1),  -- Veggie Burger: 1 Aguacate
(3, 3, 1),  -- Veggie Burger: 1 Lechuga
(3, 4, 1);  -- Veggie Burger: 1 Tomate

INSERT INTO precios (idHamburguesa, fechaVigencia, precio) VALUES
(1, '2024-02-01', 7000),  -- Cheeseburger
(2, '2024-03-01', 8500),  -- Bacon Burger
(3, '2024-01-01', 9000);  -- Veggie Burger

-- Insertar un administrador
INSERT INTO administradores (email) VALUES ('hamburgueseriautn@gmail.com');