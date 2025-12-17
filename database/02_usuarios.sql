-- 02_usuarios.sql
USE siquiero;

-- Password en claro para que vuestro login actual funcione (comparación directa).
INSERT INTO usuario (id_usuario, nombre, apellidos, email, `contraseña`, telefono) VALUES
(1, 'Gonzalo', 'Martí', 'gonzalo@demo.com', '$2b$10$nTRSbPURo22glmGZtzLKTu.A/rSVmani65RwUZF74NamIX8nio8lq', '600111222'),
(2, 'Laura', 'Serrano', 'laura@demo.com', '$2b$10$nTRSbPURo22glmGZtzLKTu.A/rSVmani65RwUZF74NamIX8nio8lq', '600222333'),
(3, 'Pablo', 'Navarro', 'pablo@demo.com', '$2b$10$nTRSbPURo22glmGZtzLKTu.A/rSVmani65RwUZF74NamIX8nio8lq', '600333444'),
(4, 'Marta', 'Vidal', 'marta@demo.com', '$2b$10$nTRSbPURo22glmGZtzLKTu.A/rSVmani65RwUZF74NamIX8nio8lq', '600444555')
;
