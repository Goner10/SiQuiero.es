-- 04_invitados.sql
USE siquiero;

INSERT INTO invitado (id_invitado, id_boda, nombre, email, telefono, confirmacion_asistencia) VALUES
(1, 1, 'Ana Pérez', 'ana.perez@demo.com', '611000111', 1),
(2, 1, 'Miguel Torres', 'miguel.torres@demo.com', '611000222', 0),
(3, 1, 'Sergio López', NULL, '611000333', 1),
(4, 2, 'Carmen Ruiz', 'carmen.ruiz@demo.com', '611000444', 1),
(5, 2, 'David Gil', 'david@demo.com', '611000555', 0),
(6, 3, 'Paula Mora', 'paula.mora@demo.com', '611000666', 1)
;
