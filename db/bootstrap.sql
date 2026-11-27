CREATE DATABASE IF NOT EXISTS hamburgueseria_sql
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

CREATE DATABASE IF NOT EXISTS hamburgueseria_sql_test
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

CREATE USER IF NOT EXISTS 'dsw'@'localhost' IDENTIFIED BY 'dsw';

GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES
  ON hamburgueseria_sql.* TO 'dsw'@'localhost';

GRANT ALL PRIVILEGES
  ON hamburgueseria_sql_test.* TO 'dsw'@'localhost';

FLUSH PRIVILEGES;
