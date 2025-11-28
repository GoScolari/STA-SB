-- ==================================================
-- SCRIPT PARA CREAR USUARIO Y BASE DE DATOS
-- Sistema de Telemetría San Javier
-- ==================================================

-- Crear el usuario para la aplicación
CREATE USER telemetria_user WITH PASSWORD 'telemetria_password_123';

-- Crear la base de datos
CREATE DATABASE telemetria_san_javier
    WITH OWNER = telemetria_user
    ENCODING = 'UTF8'
    LC_COLLATE = 'Spanish_Chile.1252'
    LC_CTYPE = 'Spanish_Chile.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Conectar a la nueva base de datos y dar permisos
\c telemetria_san_javier

-- Dar todos los permisos al usuario
GRANT ALL PRIVILEGES ON DATABASE telemetria_san_javier TO telemetria_user;
GRANT ALL ON SCHEMA public TO telemetria_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO telemetria_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO telemetria_user;

-- Verificar que todo está correcto
\du telemetria_user
\l telemetria_san_javier

-- ==================================================
-- COMPLETADO!
-- ==================================================
