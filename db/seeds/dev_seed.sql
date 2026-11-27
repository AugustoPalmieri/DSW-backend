INSERT IGNORE INTO administradores (id, email)
VALUES (1, 'hamburgueseriautn@gmail.com');

INSERT IGNORE INTO delivery (idDelivery, precio, fechaActualizacion)
VALUES (1, 2500.00, NOW());

INSERT IGNORE INTO ingredientes (codIngrediente, descripcion, stock, activo) VALUES
(1, 'Carne de res', 100, 1),
(2, 'Queso cheddar', 80, 1),
(3, 'Lechuga', 60, 1),
(4, 'Tomate', 60, 1),
(5, 'Panceta', 50, 1),
(6, 'Cebolla', 50, 1),
(7, 'Pan brioche', 100, 1);

INSERT IGNORE INTO hamburguesas (idHamburguesa, nombre, descripcion, imagen, activa) VALUES
(1, 'Cheeseburger', 'Medallon de carne con doble cheddar en pan brioche', NULL, 1),
(2, 'Bacon Burger', 'Medallon de carne, cheddar, panceta crocante y cebolla', NULL, 1),
(3, 'Clasica Completa', 'Medallon de carne, cheddar, lechuga y tomate', NULL, 1);

INSERT IGNORE INTO ingredientes_hamburguesa (idHamburguesa, codIngrediente, cantidad) VALUES
(1, 1, 1),
(1, 2, 2),
(1, 7, 1),
(2, 1, 1),
(2, 2, 1),
(2, 5, 2),
(2, 6, 1),
(2, 7, 1),
(3, 1, 1),
(3, 2, 1),
(3, 3, 1),
(3, 4, 1),
(3, 7, 1);

INSERT IGNORE INTO precios (idHamburguesa, fechaVigencia, precio) VALUES
(1, '2025-01-01', 9500.00),
(2, '2025-01-01', 11000.00),
(3, '2025-01-01', 10000.00);
