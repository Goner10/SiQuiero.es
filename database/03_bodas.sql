-- 03_bodas.sql
USE siquiero;

INSERT INTO boda (id_boda, id_usuario, fecha_evento, ubicacion, num_invitados, nombre_evento, presupuesto_total, estado) VALUES
(1, 1, '2026-06-20', 'Valencia', 120, 'Boda Gonzalo & Sara', 18000.0, 'Planificacion'),
(2, 2, '2026-09-12', 'Castellón', 80, 'Boda Laura & Dani', 14000.0, 'Planificacion'),
(3, 4, '2026-05-03', 'Alicante', 60, 'Boda Marta & Alex', 11000.0, 'Planificacion')
;
