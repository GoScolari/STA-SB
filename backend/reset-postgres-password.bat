@echo off
echo ================================================
echo SCRIPT PARA RESETEAR CONTRASEÑA DE POSTGRESQL
echo ================================================
echo.

echo PASO 1: Deteniendo el servicio PostgreSQL...
net stop postgresql-x64-18

echo.
echo PASO 2: Modificando pg_hba.conf para permitir acceso temporal sin contraseña...
cd "C:\Program Files\PostgreSQL\18\data"

:: Hacer backup de pg_hba.conf
copy pg_hba.conf pg_hba.conf.backup

:: Cambiar todas las conexiones a 'trust' temporalmente
echo # Configuracion temporal para reset de password > pg_hba.conf.temp
echo host    all             all             127.0.0.1/32            trust >> pg_hba.conf.temp
echo host    all             all             ::1/128                 trust >> pg_hba.conf.temp
echo local   all             all                                     trust >> pg_hba.conf.temp

move /y pg_hba.conf.temp pg_hba.conf

echo.
echo PASO 3: Iniciando PostgreSQL con configuracion temporal...
net start postgresql-x64-18

echo.
echo PASO 4: Conectando a PostgreSQL y cambiando contraseña...
echo.
echo Por favor, ingresa la NUEVA contraseña que quieres para el usuario 'postgres':
set /p NEW_PASSWORD="Nueva contraseña: "

"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "ALTER USER postgres WITH PASSWORD '%NEW_PASSWORD%';"

echo.
echo PASO 5: Restaurando configuracion original de seguridad...
cd "C:\Program Files\PostgreSQL\18\data"
move /y pg_hba.conf.backup pg_hba.conf

echo.
echo PASO 6: Reiniciando PostgreSQL con configuracion segura...
net stop postgresql-x64-18
net start postgresql-x64-18

echo.
echo ================================================
echo COMPLETADO!
echo ================================================
echo La contraseña del usuario 'postgres' ha sido cambiada exitosamente.
echo Nueva contraseña: %NEW_PASSWORD%
echo.
echo IMPORTANTE: Guarda esta contraseña en un lugar seguro!
echo ================================================
pause
