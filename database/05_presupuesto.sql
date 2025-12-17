-- 05_presupuesto.sql
USE siquiero;

INSERT INTO presupuesto (id_presupuesto, id_boda, concepto, cantidad_estimada, cantidad_real) VALUES
(1, 1, 'Lugar (finca / masía)', 6000.0, NULL),
(2, 1, 'Catering', 6500.0, NULL),
(3, 1, 'Fotografía y vídeo', 1800.0, NULL),
(4, 1, 'Música (DJ / grupo)', 900.0, NULL),
(5, 1, 'Decoración', 650.0, NULL),
(6, 2, 'Lugar (salón)', 4500.0, NULL),
(7, 2, 'Catering', 5200.0, NULL),
(8, 2, 'Fotografía', 1200.0, NULL),
(9, 3, 'Lugar', 3500.0, NULL),
(10, 3, 'Catering', 4200.0, NULL)
;
