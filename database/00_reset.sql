-- 00_reset.sql · SiQuiero.es (demo)
USE siquiero;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE reserva;
TRUNCATE TABLE servicio;
TRUNCATE TABLE proveedor;
TRUNCATE TABLE categoria;
TRUNCATE TABLE invitado;
TRUNCATE TABLE presupuesto;
TRUNCATE TABLE boda;
TRUNCATE TABLE usuario;

SET FOREIGN_KEY_CHECKS = 1;
