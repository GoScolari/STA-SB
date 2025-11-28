# Script para probar conexión a PostgreSQL
# Prueba varias contraseñas comunes

$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$passwords = @("postgres", "admin", "123456", "password", "root", "")

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "PROBANDO CONEXION A POSTGRESQL" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

foreach ($password in $passwords) {
    Write-Host "Probando contraseña: '$password'..." -ForegroundColor Yellow

    $env:PGPASSWORD = $password
    $result = & $psqlPath -U postgres -c "SELECT version();" 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "================================================" -ForegroundColor Green
        Write-Host "EXITO! Contraseña encontrada: '$password'" -ForegroundColor Green
        Write-Host "================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Ahora ejecuta este comando para crear la base de datos:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "`$env:PGPASSWORD = '$password'" -ForegroundColor White
        Write-Host "& 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -U postgres -f backend\create-user-and-database.sql" -ForegroundColor White
        Write-Host ""
        exit 0
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Red
Write-Host "NO SE PUDO CONECTAR CON NINGUNA CONTRASEÑA" -ForegroundColor Red
Write-Host "================================================" -ForegroundColor Red
Write-Host ""
Write-Host "NECESITAS RESETEAR LA CONTRASEÑA:" -ForegroundColor Yellow
Write-Host "1. Ejecuta PowerShell como ADMINISTRADOR" -ForegroundColor White
Write-Host "2. Ejecuta: backend\reset-postgres-password.bat" -ForegroundColor White
Write-Host ""
