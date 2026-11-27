CREATE TABLE IF NOT EXISTS administradores (
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  codigo VARCHAR(6) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS clientes (
  idCliente INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(255) DEFAULT NULL,
  apellido VARCHAR(255) DEFAULT NULL,
  telefono VARCHAR(20) DEFAULT NULL,
  email VARCHAR(60) DEFAULT NULL,
  direccion VARCHAR(255) DEFAULT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (idCliente)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS delivery (
  idDelivery INT NOT NULL AUTO_INCREMENT,
  precio DECIMAL(10,2) DEFAULT NULL,
  fechaActualizacion DATETIME DEFAULT NULL,
  PRIMARY KEY (idDelivery)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS hamburguesas (
  idHamburguesa INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) DEFAULT NULL,
  descripcion VARCHAR(250) DEFAULT NULL,
  imagen VARCHAR(255) DEFAULT NULL,
  activa TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (idHamburguesa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS ingredientes (
  codIngrediente INT UNSIGNED NOT NULL AUTO_INCREMENT,
  descripcion VARCHAR(250) DEFAULT NULL,
  stock INT UNSIGNED DEFAULT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (codIngrediente)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS pedidos (
  idPedido INT UNSIGNED NOT NULL AUTO_INCREMENT,
  idCliente INT UNSIGNED NOT NULL,
  modalidad VARCHAR(100) DEFAULT NULL,
  montoTotal DECIMAL(10,2) DEFAULT NULL,
  estado VARCHAR(45) DEFAULT NULL,
  eliminado TINYINT(1) DEFAULT 0,
  PRIMARY KEY (idPedido),
  KEY fk_pedidos_clientes (idCliente),
  CONSTRAINT fk_pedidos_clientes
    FOREIGN KEY (idCliente) REFERENCES clientes (idCliente)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS hamburguesas_pedidos (
  idPedido INT UNSIGNED NOT NULL,
  idHamburguesa INT UNSIGNED NOT NULL,
  cantidad INT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (idPedido, idHamburguesa),
  KEY idHamburguesa (idHamburguesa),
  CONSTRAINT hamburguesas_pedidos_ibfk_1
    FOREIGN KEY (idPedido) REFERENCES pedidos (idPedido)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT hamburguesas_pedidos_ibfk_2
    FOREIGN KEY (idHamburguesa) REFERENCES hamburguesas (idHamburguesa)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS ingredientes_hamburguesa (
  idHamburguesa INT UNSIGNED NOT NULL,
  codIngrediente INT UNSIGNED NOT NULL,
  cantidad INT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (idHamburguesa, codIngrediente),
  KEY codIngrediente (codIngrediente),
  CONSTRAINT ingredientes_hamburguesa_ibfk_1
    FOREIGN KEY (idHamburguesa) REFERENCES hamburguesas (idHamburguesa)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT ingredientes_hamburguesa_ibfk_2
    FOREIGN KEY (codIngrediente) REFERENCES ingredientes (codIngrediente)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS precios (
  idHamburguesa INT UNSIGNED NOT NULL,
  fechaVigencia DATE NOT NULL,
  precio DECIMAL(10,2) DEFAULT NULL,
  PRIMARY KEY (idHamburguesa, fechaVigencia),
  CONSTRAINT precios_ibfk_1
    FOREIGN KEY (idHamburguesa) REFERENCES hamburguesas (idHamburguesa)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
