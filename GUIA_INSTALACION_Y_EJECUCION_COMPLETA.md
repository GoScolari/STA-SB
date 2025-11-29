# 🚀 GUÍA COMPLETA DE INSTALACIÓN Y EJECUCIÓN
## Sistema de Telemetría y Automatización San Javier (STA-SB)

**Versión:** 1.0.0
**Fecha:** Noviembre 2025
**Autor:** Gonzalo Scolari, Xavier Barrera

---

## 📋 TABLA DE CONTENIDOS

1. [Prerrequisitos](#prerrequisitos)
2. [Credenciales del Sistema](#credenciales-del-sistema)
3. [Instalación de Dependencias](#instalación-de-dependencias)
4. [Configuración de Bases de Datos](#configuración-de-bases-de-datos)
5. [Configuración del Backend](#configuración-del-backend)
6. [Configuración del Frontend](#configuración-del-frontend)
7. [Ejecución del Sistema Completo](#ejecución-del-sistema-completo)
8. [Verificación del Sistema](#verificación-del-sistema)
9. [Troubleshooting](#troubleshooting)

---

## 🔑 CREDENCIALES DEL SISTEMA

### **Usuarios de la Aplicación Web**

Una vez que el sistema esté funcionando, podrás acceder con estos usuarios:

| Rol | Email | Contraseña | Permisos |
|-----|-------|-----------|----------|
| **Administrador** | `admin@ouasanjavier.cl` | `Admin123!` | Acceso total: Usuarios, Estaciones, Reportes, Control |
| **Operador** | `operador@ouasanjavier.cl` | `Operador123!` | Gestión estaciones, Control remoto, Reportes |
| **Visualizador** | `visualizador@ouasanjavier.cl` | `Visual123!` | Solo lectura: Dashboard, Ver estaciones |

### **Credenciales de Base de Datos PostgreSQL**

```bash
Host: localhost
Puerto: 5432
Base de datos: telemetria_san_javier
Usuario: telemetria_user
Contraseña: TelemetriaSJ2024!
```

### **Credenciales InfluxDB**

```bash
URL: http://localhost:8086
Organización: CEAProject
Bucket: telemetria_data
Token: (Se genera durante la configuración inicial)
```

### **Credenciales MQTT Broker (Mosquitto)**

```bash
Host: localhost
Puerto: 1883
Usuario: telemetria_mqtt
Contraseña: MqttSJ2024!
```

---

## 📦 PRERREQUISITOS

Antes de comenzar, asegúrate de tener instalado:

### **Software Base**

```bash
# Node.js 18 LTS o superior
node --version  # Debe mostrar v18.x.x o superior
npm --version   # Debe mostrar 9.x.x o superior

# Git
git --version

# PostgreSQL 14 o superior
psql --version

# Opcional pero recomendado: Visual Studio Code
code --version
```

### **Instalación Node.js (si no lo tienes)**

**Windows:**
1. Descarga desde: https://nodejs.org/
2. Ejecuta el instalador `.msi`
3. Reinicia la terminal

**Linux/Ubuntu:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

**macOS:**
```bash
brew install node@18
```

---

## 🗄️ INSTALACIÓN DE DEPENDENCIAS

### **1. Instalar PostgreSQL**

**Windows:**
1. Descargar desde: https://www.postgresql.org/download/windows/
2. Ejecutar instalador
3. Configurar contraseña para usuario `postgres`
4. Recordar el puerto (por defecto: 5432)

**Linux/Ubuntu:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

### **2. Instalar InfluxDB 2.x**

**Windows:**
1. Descargar desde: https://portal.influxdata.com/downloads/
2. Extraer el archivo ZIP
3. Ejecutar `influxd.exe`

**Linux/Ubuntu:**
```bash
# Agregar repositorio InfluxDB
wget -qO- https://repos.influxdata.com/influxdb.key | sudo apt-key add -
echo "deb https://repos.influxdata.com/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/influxdb.list

# Instalar
sudo apt update
sudo apt install influxdb2

# Iniciar servicio
sudo systemctl start influxdb
sudo systemctl enable influxdb
```

**macOS:**
```bash
brew install influxdb
brew services start influxdb
```

### **3. Instalar Mosquitto MQTT Broker**

**Windows:**
1. Descargar desde: https://mosquitto.org/download/
2. Ejecutar instalador
3. Instalar como servicio de Windows

**Linux/Ubuntu:**
```bash
sudo apt install mosquitto mosquitto-clients
sudo systemctl start mosquitto
sudo systemctl enable mosquitto
```

**macOS:**
```bash
brew install mosquitto
brew services start mosquitto
```

---

## 🔧 CONFIGURACIÓN DE BASES DE DATOS

### **PASO 1: Configurar PostgreSQL**

#### **1.1. Crear usuario y base de datos**

```bash
# Conectarse como usuario postgres
sudo -u postgres psql

# O en Windows (ejecutar en PowerShell como Administrador):
psql -U postgres
```

Dentro de `psql`, ejecutar:

```sql
-- Crear usuario
CREATE USER telemetria_user WITH PASSWORD 'TelemetriaSJ2024!';

-- Crear base de datos
CREATE DATABASE telemetria_san_javier OWNER telemetria_user;

-- Otorgar todos los privilegios
GRANT ALL PRIVILEGES ON DATABASE telemetria_san_javier TO telemetria_user;

-- Salir
\q
```

#### **1.2. Ejecutar migrations (crear tablas)**

```bash
# Navegar al directorio backend
cd C:\Users\Gonzalo\STA-SB\backend

# Ejecutar migrations
node src/scripts/migrate.js
```

**Salida esperada:**
```
🔄 Iniciando proceso de migración...
✅ Conectado a la base de datos
✅ Esquema telemetria_sta creado
✅ Tabla usuarios creada
✅ Tabla estaciones creadas
✅ Tabla sensores creada
... (más tablas)
✅ Migración completada exitosamente
```

#### **1.3. Poblar base de datos (seed)**

```bash
# Ejecutar seed para crear datos iniciales
node src/scripts/seed.js
```

**Salida esperada:**
```
🌱 Iniciando seed de base de datos...
👥 Creando usuarios iniciales...
✅ Usuario creado: admin@ouasanjavier.cl (administrador)
✅ Usuario creado: operador@ouasanjavier.cl (operador)
✅ Usuario creado: visualizador@ouasanjavier.cl (visualizador)
📡 Creando estaciones de telemetría...
✅ Estación creada: EST001
... (29 estaciones más)
✅ Seed completado exitosamente!

🔑 Credenciales de acceso:
   Admin: admin@ouasanjavier.cl / Admin123!
   Operador: operador@ouasanjavier.cl / Operador123!
   Visualizador: visualizador@ouasanjavier.cl / Visual123!
```

#### **1.4. Verificar conexión PostgreSQL**

```bash
# Conectar a la base de datos
psql -h localhost -U telemetria_user -d telemetria_san_javier

# Dentro de psql, verificar tablas
\dt telemetria_sta.*

# Verificar usuarios creados
SELECT id, email, nombre, rol FROM telemetria_sta.usuarios;

# Verificar estaciones
SELECT COUNT(*) FROM telemetria_sta.estaciones;
# Debe mostrar: 30

# Salir
\q
```

### **PASO 2: Configurar InfluxDB**

#### **2.1. Acceder a la interfaz web de InfluxDB**

Abrir navegador en: http://localhost:8086

#### **2.2. Configuración inicial (primera vez)**

1. **Get Started**: Click en "Get Started"
2. **Username**: `admin`
3. **Password**: `AdminInflux2024!`
4. **Organization Name**: `CEAProject`
5. **Bucket Name**: `telemetria_data`
6. Click en "Continue"

#### **2.3. Generar Token de API**

1. En el menú lateral: Click en **"API Tokens"** (icono de llave)
2. Click en **"Generate API Token"**
3. Seleccionar **"All Access API Token"**
4. Descripción: `STA-SB Backend Token`
5. Click en **"Save"**
6. **COPIAR EL TOKEN** (lo necesitarás para el `.env`)

Ejemplo de token:
```
vJtM5xK8zP9Q2wR3yN6tL7mH4bV1cX0sA5dF8gJ9kI2oP3uY6eR7tY8uI9oP0aS1dF2gH3jK4lZ5xC6vB7nM8qW9eR0tY1u
```

#### **2.4. Verificar bucket**

1. En el menú lateral: Click en **"Buckets"**
2. Verificar que existe el bucket **`telemetria_data`**
3. Verificar que la retención sea: **Infinite** o **7 years**

### **PASO 3: Configurar Mosquitto MQTT**

#### **3.1. Crear archivo de configuración**

**Linux/macOS:**
```bash
sudo nano /etc/mosquitto/mosquitto.conf
```

**Windows:**
```
Editar: C:\Program Files\mosquitto\mosquitto.conf
```

Agregar al final:

```conf
# Configuración STA-SB
listener 1883
allow_anonymous false
password_file C:\Program Files\mosquitto\passwd

# Logs
log_dest file C:\Program Files\mosquitto\mosquitto.log
log_type all
```

#### **3.2. Crear usuario y contraseña**

**Linux/macOS:**
```bash
sudo mosquitto_passwd -c /etc/mosquitto/passwd telemetria_mqtt
# Ingresar contraseña: MqttSJ2024!
```

**Windows (PowerShell como Administrador):**
```powershell
cd "C:\Program Files\mosquitto"
.\mosquitto_passwd.exe -c passwd telemetria_mqtt
# Ingresar contraseña: MqttSJ2024!
```

#### **3.3. Reiniciar Mosquitto**

**Linux/macOS:**
```bash
sudo systemctl restart mosquitto
sudo systemctl status mosquitto
```

**Windows (PowerShell como Administrador):**
```powershell
net stop mosquitto
net start mosquitto
```

#### **3.4. Verificar Mosquitto**

```bash
# Test de publicación
mosquitto_pub -h localhost -u telemetria_mqtt -P MqttSJ2024! -t "test/topic" -m "Hello MQTT"

# Test de suscripción (en otra terminal)
mosquitto_sub -h localhost -u telemetria_mqtt -P MqttSJ2024! -t "test/topic"
# Debe mostrar: Hello MQTT
```

---

## ⚙️ CONFIGURACIÓN DEL BACKEND

### **PASO 1: Instalar dependencias del backend**

```bash
# Navegar al directorio backend
cd C:\Users\Gonzalo\STA-SB\backend

# Instalar todas las dependencias
npm install
```

**Salida esperada:**
```
added 150+ packages in 30s
```

### **PASO 2: Crear archivo de variables de entorno**

Crear el archivo `C:\Users\Gonzalo\STA-SB\backend\.env`:

```bash
# === ENTORNO ===
NODE_ENV=development
PORT=5000

# === POSTGRESQL ===
DB_HOST=localhost
DB_PORT=5432
DB_USER=telemetria_user
DB_PASSWORD=TelemetriaSJ2024!
DB_NAME=telemetria_san_javier

# === INFLUXDB ===
INFLUX_URL=http://localhost:8086
INFLUX_TOKEN=vJtM5xK8zP9Q2wR3yN6tL7mH4bV1cX0sA5dF8gJ9kI2oP3uY6eR7tY8uI9oP0aS1dF2gH3jK4lZ5xC6vB7nM8qW9eR0tY1u
INFLUX_ORG=CEAProject
INFLUX_BUCKET=telemetria_data

# === MQTT ===
MQTT_BROKER=mqtt://localhost:1883
MQTT_USERNAME=telemetria_mqtt
MQTT_PASSWORD=MqttSJ2024!
MQTT_CLIENT_ID=sta-sb-backend

# === JWT ===
JWT_SECRET=STA-SB-Secret-Key-Super-Secure-2024-Do-Not-Share
JWT_EXPIRES_IN=24h

# === WEBSOCKET ===
WS_PATH=/ws
WS_CORS_ORIGIN=http://localhost:5173

# === LOGGING ===
LOG_LEVEL=info
LOG_DIR=./logs
```

**⚠️ IMPORTANTE:** Reemplaza `INFLUX_TOKEN` con el token que copiaste en el PASO 2.3

### **PASO 3: Verificar estructura del backend**

```bash
# Listar archivos principales
dir src
```

Debes tener:
```
📁 config/
📁 controllers/
📁 middleware/
📁 models/
📁 routes/
📁 scripts/
📄 server.js
```

---

## 🎨 CONFIGURACIÓN DEL FRONTEND

### **PASO 1: Instalar dependencias del frontend**

```bash
# Navegar al directorio frontend
cd C:\Users\Gonzalo\STA-SB\frontend

# Instalar todas las dependencias
npm install
```

**Salida esperada:**
```
added 800+ packages in 60s
```

**Dependencias principales instaladas:**
- React 18.3.1
- TypeScript 5.x
- Material-UI (MUI) v5
- Chart.js + react-chartjs-2
- Socket.IO client
- Axios
- React Router v6
- jsPDF + xlsx

### **PASO 2: Verificar archivo de configuración**

El archivo `frontend/vite.config.ts` ya está configurado con:

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },
});
```

Esto permite:
- Frontend en puerto 5173
- Backend en puerto 5000
- Proxy automático de `/api` y `/ws`

### **PASO 3: Verificar estructura del frontend**

```bash
# Listar archivos principales
dir src
```

Debes tener:
```
📁 components/
   └─ Layout.tsx
📁 contexts/
   └─ AuthContext.tsx
📁 pages/
   ├─ Dashboard.tsx
   ├─ Estaciones.tsx
   ├─ EstacionDetalle.tsx
   ├─ Login.tsx
   ├─ Reportes.tsx
   └─ Usuarios.tsx
📁 services/
   ├─ api.ts
   └─ websocket.ts
📁 types/
   └─ index.ts
📄 App.tsx
📄 main.tsx
```

---

## 🚀 EJECUCIÓN DEL SISTEMA COMPLETO

### **Orden de Ejecución**

Es importante seguir este orden para que todo funcione correctamente:

```
1. PostgreSQL (ya debe estar corriendo)
2. InfluxDB (ya debe estar corriendo)
3. Mosquitto (ya debe estar corriendo)
4. Backend
5. Simulador (en otra terminal)
6. Frontend
```

### **PASO 1: Verificar servicios de base**

```bash
# PostgreSQL
psql -h localhost -U telemetria_user -d telemetria_san_javier -c "SELECT 1"
# Debe responder: 1

# InfluxDB
curl http://localhost:8086/health
# Debe responder: {"status":"pass",...}

# Mosquitto
mosquitto_sub -h localhost -u telemetria_mqtt -P MqttSJ2024! -t "$SYS/#" -C 1
# Debe mostrar mensajes del sistema
```

### **PASO 2: Iniciar Backend**

Abrir una terminal en `C:\Users\Gonzalo\STA-SB\backend`:

```bash
# Modo desarrollo (con hot-reload)
npm run dev
```

**Salida esperada:**
```
[INFO] 🚀 Servidor corriendo en http://localhost:5000
[INFO] 📚 Swagger disponible en http://localhost:5000/api-docs
[INFO] 🔌 WebSocket servidor iniciado en /ws
[INFO] 📡 MQTT: Conectado a broker mqtt://localhost:1883
[INFO] 📡 MQTT: Suscrito a telemetria/+/sensores/#
[INFO] 📡 MQTT: Suscrito a telemetria/+/actuadores/#
[INFO] 📡 MQTT: Suscrito a telemetria/+/sistema/heartbeat
[INFO] ✅ Sistema backend listo
```

### **PASO 3: Iniciar Simulador (en otra terminal)**

Abrir **SEGUNDA TERMINAL** en `C:\Users\Gonzalo\STA-SB\backend`:

```bash
# Iniciar simulador de 30 estaciones
node src/scripts/simulator.js
```

**Salida esperada:**
```
🚀 INICIANDO SIMULADOR DE TELEMETRÍA STA-SB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Broker MQTT: mqtt://localhost:1883
🏭 Estaciones simuladas: 30
⏱️  Intervalo de envío: 5000ms (5 segundos)
📊 Sensores por estación: 4 (nivel_agua, temperatura, caudal, presion)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📡 MQTT: Conectado al broker
✅ Iniciando publicación de datos...

[14:23:45] 📤 EST001 → nivel_agua: 156.32 cm (calidad: excelente)
[14:23:45] 📤 EST001 → temperatura: 18.45 °C (calidad: buena)
[14:23:45] 📤 EST001 → caudal: 342.18 L/s (calidad: excelente)
[14:23:45] 📤 EST001 → presion: 2.87 bar (calidad: buena)
[14:23:45] 📤 EST002 → nivel_agua: 203.45 cm (calidad: buena)
...
```

El simulador enviará **datos cada 5 segundos** de las **30 estaciones** (360+ mensajes por minuto).

### **PASO 4: Iniciar Frontend (en otra terminal)**

Abrir **TERCERA TERMINAL** en `C:\Users\Gonzalo\STA-SB\frontend`:

```bash
# Modo desarrollo
npm run dev
```

**Salida esperada:**
```
  VITE v5.x.x  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### **PASO 5: Abrir la aplicación en el navegador**

Abrir navegador en: **http://localhost:5173**

---

## ✅ VERIFICACIÓN DEL SISTEMA

### **Checklist de Verificación**

#### **1. Backend funcionando correctamente**

- [ ] Backend corriendo en http://localhost:5000
- [ ] Swagger disponible en http://localhost:5000/api-docs
- [ ] Endpoint de salud: http://localhost:5000/api/health
  ```json
  {
    "status": "ok",
    "timestamp": "2025-11-28T...",
    "uptime": 123.45
  }
  ```

#### **2. Frontend accesible**

- [ ] Frontend en http://localhost:5173
- [ ] Página de login visible
- [ ] Sin errores en consola del navegador (F12)

#### **3. Autenticación funcionando**

- [ ] Login con `admin@ouasanjavier.cl` / `Admin123!` funciona
- [ ] Redirección al Dashboard después del login
- [ ] Token JWT guardado en localStorage
- [ ] Menú lateral con opciones según rol

#### **4. Dashboard con datos en tiempo real**

- [ ] Dashboard muestra tarjetas de resumen
- [ ] Gráfico de caudal visible
- [ ] Tarjetas de estaciones con datos
- [ ] Datos actualizándose cada 5 segundos

#### **5. MQTT y WebSocket funcionando**

En la terminal del **backend**, verificar logs:
```
[INFO] 📡 MQTT: Mensaje recibido en telemetria/EST001/sensores/caudal
[INFO] 📊 InfluxDB: Dato guardado → EST001/caudal
[INFO] 🔌 WebSocket: Broadcasting a 2 clientes conectados
```

En la consola del navegador (F12), verificar:
```javascript
WebSocket conectado a ws://localhost:5000/ws
Datos recibidos: {type: "sensor_data", data: {...}}
```

#### **6. PostgreSQL con datos**

```bash
psql -h localhost -U telemetria_user -d telemetria_san_javier

SELECT COUNT(*) FROM telemetria_sta.usuarios;
# Debe mostrar: 3

SELECT COUNT(*) FROM telemetria_sta.estaciones;
# Debe mostrar: 30

SELECT COUNT(*) FROM telemetria_sta.sensores;
# Debe mostrar: 90 (30 estaciones × 3 sensores)
```

#### **7. InfluxDB recibiendo datos**

1. Abrir http://localhost:8086
2. Login con `admin` / `AdminInflux2024!`
3. Ir a **Data Explorer**
4. Seleccionar bucket: `telemetria_data`
5. Debe mostrar mediciones: `sensor_data`, `heartbeat`, etc.
6. Ejecutar query:
   ```flux
   from(bucket: "telemetria_data")
     |> range(start: -1h)
     |> filter(fn: (r) => r._measurement == "sensor_data")
     |> limit(n: 10)
   ```
7. Debe mostrar datos recientes

#### **8. Funcionalidades de la aplicación**

**Como Administrador:**
- [ ] Ver Dashboard
- [ ] Ver lista de Estaciones
- [ ] Editar/Crear/Eliminar Estaciones
- [ ] Ver detalle de una Estación
- [ ] Enviar comandos remotos
- [ ] Generar Reportes PDF
- [ ] Generar Reportes Excel
- [ ] Gestionar Usuarios
- [ ] Crear/Editar/Eliminar Usuarios

**Como Operador:**
- [ ] Ver Dashboard
- [ ] Ver lista de Estaciones
- [ ] Editar Estaciones
- [ ] Ver detalle de una Estación
- [ ] Enviar comandos remotos
- [ ] Generar Reportes
- [ ] **NO** puede gestionar Usuarios

**Como Visualizador:**
- [ ] Ver Dashboard
- [ ] Ver lista de Estaciones (solo lectura)
- [ ] Ver detalle de una Estación (solo lectura)
- [ ] **NO** puede editar nada
- [ ] **NO** puede enviar comandos
- [ ] **NO** puede generar reportes
- [ ] **NO** puede gestionar usuarios

---

## 🧪 PRUEBAS ADICIONALES

### **Test 1: Generar Reporte PDF**

1. Login como admin
2. Ir a **Reportes**
3. Seleccionar 3-5 estaciones
4. Tipo: Diario
5. Formato: PDF
6. Click en **Generar Reporte PDF**
7. Debe descargarse un PDF con:
   - Título: "Reporte de Telemetría San Javier"
   - Tabla con datos de las estaciones
   - Fecha de generación

### **Test 2: Generar Reporte Excel**

1. Login como admin
2. Ir a **Reportes**
3. Seleccionar 3-5 estaciones
4. Tipo: Semanal
5. Formato: Excel
6. Click en **Generar Reporte EXCEL**
7. Debe descargarse un archivo `.xlsx` con:
   - Hoja "Estaciones" con datos
   - Columnas: ID, Nombre, Tipo, Estado, Sensores, etc.

### **Test 3: Control Remoto**

1. Login como operador
2. Ir a **Estaciones**
3. Click en icono de "Ver" en cualquier estación
4. En sección "Control Remoto":
   - Dispositivo: Compuerta
   - Acción: Abrir
   - Click "Enviar Comando"
5. Debe mostrar alerta: "Comando abrir enviado a compuerta"
6. Verificar en logs del backend:
   ```
   [INFO] 📡 MQTT: Publicando comando → telemetria/EST001/actuadores/compuerta
   ```

### **Test 4: Gestión de Usuarios (Solo Admin)**

1. Login como `admin@ouasanjavier.cl`
2. Ir a **Usuarios**
3. Click en **Nuevo Usuario**
4. Llenar formulario:
   - Nombre: Test Usuario
   - Email: test@example.com
   - Contraseña: Test123!
   - Rol: Operador
   - Estado: Activo
5. Click **Guardar**
6. Debe aparecer en la tabla
7. Hacer logout
8. Login con `test@example.com` / `Test123!`
9. Debe funcionar

### **Test 5: WebSocket Tiempo Real**

1. Login como cualquier usuario
2. Ir a **Dashboard**
3. Abrir consola del navegador (F12) → pestaña Network
4. Filtrar por "WS" (WebSocket)
5. Debe mostrar conexión activa a `ws://localhost:5000/ws`
6. En la pestaña Console, escribir:
   ```javascript
   // Ver eventos WebSocket
   window.addEventListener('socket.io', (e) => console.log(e));
   ```
7. Cada 5 segundos deben llegar mensajes con datos de sensores

---

## 🚨 TROUBLESHOOTING

### **Problema 1: Backend no inicia - "Port 5000 already in use"**

**Solución:**
```bash
# Windows (PowerShell como Admin)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:5000 | xargs kill -9
```

### **Problema 2: Frontend muestra "ERR_CONNECTION_REFUSED"**

**Causa:** Backend no está corriendo

**Solución:**
1. Verificar que backend esté corriendo en puerto 5000
2. Abrir http://localhost:5000/api/health en navegador
3. Debe responder con JSON

### **Problema 3: "Error conectando a PostgreSQL"**

**Soluciones:**
```bash
# Verificar que PostgreSQL esté corriendo
# Windows:
net start postgresql-x64-14

# Linux:
sudo systemctl start postgresql
sudo systemctl status postgresql

# Verificar credenciales
psql -h localhost -U telemetria_user -d telemetria_san_javier
```

### **Problema 4: "InfluxDB connection failed"**

**Soluciones:**
1. Verificar que InfluxDB esté corriendo:
   ```bash
   curl http://localhost:8086/health
   ```
2. Verificar token en `.env` es correcto
3. Regenerar token en http://localhost:8086 si es necesario

### **Problema 5: MQTT "Connection refused"**

**Soluciones:**
```bash
# Verificar Mosquitto corriendo
# Windows:
net start mosquitto

# Linux:
sudo systemctl start mosquitto
sudo systemctl status mosquitto

# Test manual
mosquitto_sub -h localhost -u telemetria_mqtt -P MqttSJ2024! -t "test"
```

### **Problema 6: Simulador no envía datos**

**Verificar:**
1. Mosquitto está corriendo
2. Credenciales MQTT correctas en simulador
3. Ver logs del simulador para errores
4. Test manual MQTT funciona

### **Problema 7: Login falla - "Invalid credentials"**

**Soluciones:**
1. Verificar que seed se ejecutó correctamente:
   ```bash
   node src/scripts/seed.js
   ```
2. Verificar usuarios en base de datos:
   ```sql
   SELECT email, rol FROM telemetria_sta.usuarios;
   ```
3. Intentar con credenciales correctas (ver sección Credenciales)

### **Problema 8: Dashboard no muestra datos en tiempo real**

**Verificar:**
1. Simulador corriendo y enviando datos
2. Backend recibiendo mensajes MQTT (ver logs)
3. WebSocket conectado (F12 → Network → WS)
4. En consola del navegador no hay errores

**Debug WebSocket:**
```javascript
// En consola del navegador (F12)
localStorage.getItem('token') // Debe mostrar el JWT
```

### **Problema 9: "npm install" falla**

**Soluciones:**
```bash
# Limpiar cache
npm cache clean --force

# Borrar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Si persiste, actualizar npm
npm install -g npm@latest
```

### **Problema 10: Reportes PDF/Excel no descargan**

**Verificar:**
1. Backend responde con datos
2. Navegador permite descargas
3. No hay bloqueador de pop-ups activo
4. Consola del navegador sin errores

---

## 📊 ARQUITECTURA DEL SISTEMA

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│                    http://localhost:5173                         │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Login   │  │Dashboard │  │Estaciones│  │ Reportes │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                  │
│       │                    │                    │                │
│       └────────────────────┼────────────────────┘                │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │   Axios HTTP    │
                    │  WebSocket WS   │
                    └────────┬────────┘
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│                         BACKEND (Node.js)                        │
│                    http://localhost:5000                         │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   APIs   │  │   MQTT   │  │WebSocket │  │  Logger  │       │
│  │  Express │  │  Client  │  │Socket.IO │  │  Winston │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────┘       │
│       │             │             │                             │
└───────┼─────────────┼─────────────┼─────────────────────────────┘
        │             │             │
        │             │             └──────┐
        │             │                    │
┌───────┴──────┐ ┌────┴─────┐      ┌──────┴──────┐
│  PostgreSQL  │ │   MQTT   │      │   Clients   │
│              │ │ Mosquitto│      │  Browsers   │
│  Usuarios    │ │          │      │             │
│  Estaciones  │ │  Topics  │      └─────────────┘
│  Sensores    │ │          │
│  Auditoría   │ │  QoS 1   │
└──────────────┘ └────┬─────┘
                      │
                 ┌────┴─────┐
                 │Simulator │
                 │          │
                 │30 Stations
                 │4 Sensors │
                 │Every 5s  │
                 └────┬─────┘
                      │
              ┌───────┴────────┐
              │   InfluxDB     │
              │                │
              │  Time Series   │
              │  Sensor Data   │
              │  7 Years       │
              └────────────────┘
```

---

## 🎯 PRÓXIMOS PASOS

Una vez que todo esté funcionando:

1. **Generar evidencias** (screenshots, videos)
2. **Ejecutar tests automatizados**: `npm test`
3. **Revisar Swagger**: http://localhost:5000/api-docs
4. **Implementar Objetivo 3**: Seguridad (HTTPS, RBAC avanzado)
5. **Implementar Objetivo 4**: Capacitación (manuales, videos)

---

## 📞 SOPORTE

Si encuentras problemas no cubiertos en esta guía:

1. Revisar logs del backend: `backend/logs/`
2. Revisar consola del navegador (F12)
3. Verificar todos los servicios están corriendo
4. Consultar documentación oficial:
   - Node.js: https://nodejs.org/docs/
   - React: https://react.dev/
   - PostgreSQL: https://www.postgresql.org/docs/
   - InfluxDB: https://docs.influxdata.com/
   - MQTT: https://mosquitto.org/documentation/

---

## ✅ CHECKLIST FINAL

Antes de presentar el proyecto, verificar:

- [ ] PostgreSQL corriendo con 30 estaciones
- [ ] InfluxDB recibiendo datos en tiempo real
- [ ] Mosquitto MQTT broker operativo
- [ ] Backend sin errores en logs
- [ ] Simulador enviando 360+ mensajes/minuto
- [ ] Frontend accesible y sin errores
- [ ] Login funciona con los 3 roles
- [ ] Dashboard muestra datos en tiempo real
- [ ] Reportes PDF generan correctamente
- [ ] Reportes Excel generan correctamente
- [ ] Control remoto envía comandos
- [ ] WebSocket actualizando datos cada 5s
- [ ] Todos los 3 usuarios pueden acceder
- [ ] Permisos por rol funcionan correctamente

---

**🎉 ¡Sistema STA-SB completamente funcional!**

**Versión:** 1.0.0
**Fecha:** Noviembre 2025
**Estudiantes:** Gonzalo Scolari, Xavier Barrera
