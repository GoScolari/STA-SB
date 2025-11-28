@echo off
echo ================================================
echo CONFIGURACION SIMPLE DE BASE DE DATOS
echo ================================================
echo.
echo Este script intentara conectarse a PostgreSQL.
echo.
echo OPCIONES:
echo 1. Si conoces la contraseña de 'postgres'
echo 2. Si NO conoces la contraseña
echo.
set /p OPCION="Elige opcion (1 o 2): "

if "%OPCION%"=="1" goto CON_PASSWORD
if "%OPCION%"=="2" goto SIN_PASSWORD

:CON_PASSWORD
echo.
set /p DB_PASSWORD="Ingresa la contraseña del usuario postgres: "
goto CREAR_DB

:SIN_PASSWORD
echo.
echo Intentando contraseñas comunes...
set DB_PASSWORD=postgres
goto CREAR_DB

:CREAR_DB
echo.
echo ================================================
echo CREANDO BASE DE DATOS Y USUARIO
echo ================================================

:: Crear archivo temporal con comandos SQL
echo -- Crear usuario > setup.sql
echo CREATE USER telemetria_user WITH PASSWORD 'telemetria_password_123'; >> setup.sql
echo. >> setup.sql
echo -- Crear base de datos >> setup.sql
echo CREATE DATABASE telemetria_san_javier OWNER telemetria_user; >> setup.sql
echo. >> setup.sql
echo -- Dar permisos >> setup.sql
echo GRANT ALL PRIVILEGES ON DATABASE telemetria_san_javier TO telemetria_user; >> setup.sql

echo.
echo Ejecutando comandos SQL...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -f setup.sql

if %errorlevel% neq 0 (
    echo.
    echo ================================================
    echo ERROR: No se pudo conectar a PostgreSQL
    echo ================================================
    echo.
    echo Posibles causas:
    echo 1. La contraseña es incorrecta
    echo 2. PostgreSQL no esta corriendo
    echo.
    echo SOLUCION RECOMENDADA:
    echo 1. Abre pgAdmin 4 desde el menu inicio
    echo 2. Si te pide contraseña, intenta: postgres, admin, 123456
    echo 3. Si ninguna funciona, necesitas resetear la contraseña
    echo.
    pause
    exit /b 1
)

echo.
echo ================================================
echo BASE DE DATOS CREADA EXITOSAMENTE!
echo ================================================
echo.
echo Detalles de conexion:
echo   Host: localhost
echo   Puerto: 5432
echo   Base de datos: telemetria_san_javier
echo   Usuario: telemetria_user
echo   Contraseña: telemetria_password_123
echo.
echo Guardando en archivo .env...

:: Actualizar .env con la contraseña correcta de postgres
echo NODE_ENV=development > ..\.env
echo PORT=5000 >> ..\.env
echo HOST=localhost >> ..\.env
echo. >> ..\.env
echo # PostgreSQL >> ..\.env
echo DB_HOST=localhost >> ..\.env
echo DB_PORT=5432 >> ..\.env
echo DB_USER=telemetria_user >> ..\.env
echo DB_PASSWORD=telemetria_password_123 >> ..\.env
echo DB_NAME=telemetria_san_javier >> ..\.env
echo. >> ..\.env
echo # JWT >> ..\.env
echo JWT_SECRET=sta-sb-super-secret-jwt-key-2025-change-in-production >> ..\.env
echo JWT_EXPIRE=24h >> ..\.env
echo. >> ..\.env
echo # CORS >> ..\.env
echo CORS_ORIGIN=http://localhost:3000 >> ..\.env
echo. >> ..\.env
echo # Logging >> ..\.env
echo LOG_LEVEL=info >> ..\.env
echo LOG_DIR=logs >> ..\.env

echo.
echo Archivo .env actualizado correctamente!
echo.
echo PROXIMO PASO: Ejecutar las migraciones
echo   cd backend
echo   npm run db:migrate
echo.

del setup.sql
pause
