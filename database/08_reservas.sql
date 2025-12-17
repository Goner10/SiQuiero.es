-- 08_reservas.sql
USE siquiero;

INSERT INTO reserva (id_reserva, id_boda, id_servicio, fecha_reserva, estado) VALUES
(1, 1, 1, '2026-01-10', 'Confirmada'),
(2, 1, 4, '2026-02-02', 'Pendiente'),
(3, 1, 9, '2026-03-15', 'Pendiente'),
(4, 2, 3, '2026-02-20', 'Confirmada'),
(5, 2, 11, '2026-03-01', 'Pendiente'),
(6, 3, 2, '2026-01-25', 'Pendiente')
;
