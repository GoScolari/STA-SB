# Backend STA-SB

Backend del Sistema de Telemetría y Automatización San Javier (STA-SB) desarrollado con Node.js, Express.js, PostgreSQL e InfluxDB.

## 🚀 Características

- ✅ **API RESTful** con Node.js + Express.js
- ✅ **Base de datos híbrida**: PostgreSQL (datos relacionales) + InfluxDB (series temporales)
- ✅ **Autenticación JWT** con refresh tokens
- ✅ **Autorización RBAC** (3 roles: Administrador, Operador, Visualizador)
- ✅ **Seguridad** con Helmet, Rate Limiting, CORS
- ✅ **Logging** completo con Winston
- ✅ **Validación** de datos con express-validator
- ✅ **Comunicación MQTT** para IoT
- ✅ **Documentación** completa de código

## 📋 Requisitos Previos

- **Node.js** 18 LTS o superior
- **PostgreSQL** 14 o superior
- **InfluxDB** 2.x
- **MQTT Broker** (Mosquitto recomendado)
- **npm** 9 o superior

## 🔧 Instalación

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

Copiar el archivo `.env.example` y crear `.env`:

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
# Servidor
PORT=5000
HOST=localhost
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=telemetria_user
DB_PASSWORD=tu_password_postgresql
DB_NAME=telemetria_san_javier

# InfluxDB
INFLUX_URL=http://localhost:8086
INFLUX_TOKEN=tu_token_influxdb
INFLUX_ORG=CEA_Project_SPA
INFLUX_BUCKET=sta_sb_telemetria

# JWT
JWT_SECRET=cambia_esto_por_una_clave_segura
JWT_EXPIRE=24h

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 3. Configurar PostgreSQL

```bash
# Crear usuario y base de datos
sudo -u postgres psql

CREATE USER telemetria_user WITH PASSWORD 'tu_password';
CREATE DATABASE telemetria_san_javier OWNER telemetria_user;
GRANT ALL PRIVILEGES ON DATABASE telemetria_san_javier TO telemetria_user;
\q
```

### 4. Ejecutar migraciones

```bash
npm run db:migrate
```

### 5. Cargar datos iniciales (seed)

```bash
npm run db:seed
```

Esto creará:
- ✅ 3 usuarios de prueba
- ✅ 30 estaciones de telemetría
- ✅ 90 sensores (3 por estación)
- ✅ 6 configuraciones del sistema

## 🏃 Ejecutar el Servidor

### Modo desarrollo (con auto-reload)

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

El servidor estará disponible en: `http://localhost:5000`

## 🔑 Credenciales de Prueba

Después de ejecutar el seed, puedes usar estas credenciales:

| Rol | Email | Password |
|-----|-------|----------|
| **Administrador** | admin@ouasanjavier.cl | Admin123! |
| **Operador** | operador@ouasanjavier.cl | Operador123! |
| **Visualizador** | visualizador@ouasanjavier.cl | Visual123! |

## 📡 Endpoints API

### Autenticación

```
POST   /api/auth/login          # Login
POST   /api/auth/logout         # Logout
GET    /api/auth/profile        # Obtener perfil
PUT    /api/auth/profile        # Actualizar perfil
POST   /api/auth/refresh        # Refrescar token
```

### Estaciones

```
GET    /api/estaciones                     # Listar estaciones
GET    /api/estaciones/:id                 # Obtener estación
POST   /api/estaciones                     # Crear estación (Admin)
PUT    /api/estaciones/:id                 # Actualizar estación (Admin)
DELETE /api/estaciones/:id                 # Eliminar estación (Admin)
GET    /api/estaciones/:id/datos           # Datos de sensores
GET    /api/estaciones/:id/estadisticas    # Estadísticas
GET    /api/estaciones/estadisticas        # Estadísticas generales
```

### Health Check

```
GET    /api/health             # Estado del servidor
GET    /api                    # Info del API
```

## 🔒 Roles y Permisos

### Administrador
- ✅ Todos los permisos del sistema
- ✅ Crear/editar/eliminar estaciones y usuarios
- ✅ Modificar configuraciones
- ✅ Ver logs de auditoría

### Operador
- ✅ Ver estaciones
- ✅ Controlar compuertas y bombas
- ✅ Generar reportes
- ✅ Exportar datos
- ❌ No puede modificar configuraciones

### Visualizador
- ✅ Ver estaciones
- ✅ Ver estadísticas
- ❌ No puede realizar controles ni exportar datos

## 📂 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuraciones (DB, InfluxDB, Logger)
│   ├── controllers/     # Controladores de rutas
│   ├── middleware/      # Middleware (Auth, Validator, RateLimit)
│   ├── models/          # Modelos de datos
│   ├── routes/          # Definición de rutas
│   ├── scripts/         # Scripts de migración y seed
│   ├── utils/           # Utilidades
│   └── server.js        # Servidor principal
├── logs/                # Archivos de log (generados)
├── .env                 # Variables de entorno (no incluido en git)
├── .env.example         # Ejemplo de variables de entorno
├── package.json         # Dependencias y scripts
└── README.md            # Este archivo
```

## 🧪 Testing

```bash
npm test
```

## 📊 Logging

Los logs se guardan en la carpeta `logs/`:

- **combined-YYYY-MM-DD.log** - Todos los logs
- **error-YYYY-MM-DD.log** - Solo errores
- **audit-YYYY-MM-DD.log** - Auditoría (retención 7 años según DGA)

## 🔧 Scripts Disponibles

```json
{
  "start": "node src/server.js",              // Producción
  "dev": "nodemon src/server.js",             // Desarrollo
  "test": "jest --coverage",                  // Tests
  "db:migrate": "node src/scripts/migrate.js", // Migraciones
  "db:seed": "node src/scripts/seed.js"       // Datos iniciales
}
```

## 🐛 Troubleshooting

### Error: "Cannot connect to PostgreSQL"

1. Verificar que PostgreSQL esté corriendo:
```bash
sudo systemctl status postgresql
```

2. Verificar credenciales en `.env`

3. Verificar permisos del usuario:
```sql
GRANT ALL PRIVILEGES ON DATABASE telemetria_san_javier TO telemetria_user;
GRANT ALL PRIVILEGES ON SCHEMA telemetria_sta TO telemetria_user;
```

### Error: "Cannot connect to InfluxDB"

1. Verificar que InfluxDB esté corriendo:
```bash
sudo systemctl status influxdb
```

2. Verificar token y organización en `.env`

3. El sistema puede funcionar sin InfluxDB (solo sin series temporales)

## 👥 Autores

- Gonzalo Scolari
- Xavier Barrera

**Tutor:** Dragustín Fernández
**Cliente:** OUA San Javier
**Empresa:** CEA Project SPA

## 📄 Licencia

ISC - Proyecto de Título Ingeniería en Informática

---

**Sistema de Telemetría y Automatización San Javier (STA-SB)**
© 2025 CEA Project SPA
