/**
 * Script de Diagnóstico Completo
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 *
 * Este script verifica todas las conexiones y configuraciones necesarias
 * para que el login funcione correctamente.
 */

require('dotenv').config();
const { Pool } = require('pg');

// Colores para la consola
const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';

function log(message, color = RESET) {
  console.log(`${color}${message}${RESET}`);
}

function header(title) {
  console.log('');
  log('═══════════════════════════════════════════════════════', CYAN);
  log(`  ${title}`, CYAN);
  log('═══════════════════════════════════════════════════════', CYAN);
  console.log('');
}

async function checkEnvironment() {
  header('1. VERIFICANDO VARIABLES DE ENTORNO');

  const requiredVars = [
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_SECRET'
  ];

  let allPresent = true;

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      log(`  ✅ ${varName}: ${varName.includes('PASSWORD') || varName.includes('SECRET') ? '***' : value}`, GREEN);
    } else {
      log(`  ❌ ${varName}: NO DEFINIDA`, RED);
      allPresent = false;
    }
  }

  console.log('');
  if (allPresent) {
    log('  ✅ Todas las variables de entorno están configuradas', GREEN);
  } else {
    log('  ❌ FALTAN variables de entorno en el archivo .env', RED);
    log('  ⚠️  Asegúrate de tener el archivo .env en la carpeta backend/', YELLOW);
  }

  return allPresent;
}

async function checkPostgreSQLConnection() {
  header('2. VERIFICANDO CONEXIÓN A POSTGRESQL');

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    log('  🔍 Intentando conectar...', BLUE);
    log(`  📍 Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`, BLUE);
    log(`  📁 Database: ${process.env.DB_NAME}`, BLUE);
    log(`  👤 Usuario: ${process.env.DB_USER}`, BLUE);

    const result = await pool.query('SELECT NOW() as timestamp, current_database() as db, version()');

    console.log('');
    log('  ✅ Conexión exitosa a PostgreSQL', GREEN);
    log(`  🕐 Timestamp: ${result.rows[0].timestamp}`, GREEN);
    log(`  📁 Base de datos: ${result.rows[0].db}`, GREEN);
    log(`  🔧 Versión: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`, GREEN);

    await pool.end();
    return true;
  } catch (error) {
    console.log('');
    log('  ❌ ERROR DE CONEXIÓN A POSTGRESQL', RED);
    log(`  📝 Mensaje: ${error.message}`, RED);
    log('', RESET);
    log('  💡 POSIBLES SOLUCIONES:', YELLOW);
    log('     1. Verifica que PostgreSQL esté corriendo', YELLOW);
    log('     2. Verifica las credenciales en el archivo .env', YELLOW);
    log('     3. Verifica que la base de datos exista', YELLOW);
    log('     4. En Windows: net start postgresql-x64-14', YELLOW);
    log('     5. Verifica firewall/permisos', YELLOW);

    await pool.end();
    return false;
  }
}

async function checkSchema() {
  header('3. VERIFICANDO ESQUEMA DE BASE DE DATOS');

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    // Verificar si el esquema existe
    const schemaCheck = await pool.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name = 'telemetria_sta'
    `);

    if (schemaCheck.rows.length === 0) {
      log('  ❌ El esquema "telemetria_sta" NO EXISTE', RED);
      log('', RESET);
      log('  💡 SOLUCIÓN:', YELLOW);
      log('     Ejecuta las migraciones:', YELLOW);
      log('     node src/scripts/migrate.js', YELLOW);
      await pool.end();
      return false;
    }

    log('  ✅ Esquema "telemetria_sta" existe', GREEN);
    console.log('');

    // Verificar tablas principales
    const tables = ['usuarios', 'estaciones', 'sensores', 'configuraciones'];

    log('  📊 Verificando tablas:', BLUE);
    let allTablesExist = true;

    for (const table of tables) {
      const tableCheck = await pool.query(`
        SELECT COUNT(*) as count
        FROM information_schema.tables
        WHERE table_schema = 'telemetria_sta'
        AND table_name = $1
      `, [table]);

      if (tableCheck.rows[0].count > 0) {
        // Contar registros
        const countResult = await pool.query(`SELECT COUNT(*) FROM telemetria_sta.${table}`);
        log(`     ✅ ${table}: ${countResult.rows[0].count} registros`, GREEN);
      } else {
        log(`     ❌ ${table}: NO EXISTE`, RED);
        allTablesExist = false;
      }
    }

    console.log('');
    if (allTablesExist) {
      log('  ✅ Todas las tablas necesarias existen', GREEN);
    } else {
      log('  ❌ FALTAN TABLAS', RED);
      log('  💡 SOLUCIÓN: node src/scripts/migrate.js', YELLOW);
    }

    await pool.end();
    return allTablesExist;
  } catch (error) {
    log(`  ❌ Error verificando esquema: ${error.message}`, RED);
    await pool.end();
    return false;
  }
}

async function checkUsers() {
  header('4. VERIFICANDO USUARIOS DEL SISTEMA');

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const result = await pool.query(`
      SELECT id, email, nombre, rol, activo, created_at
      FROM telemetria_sta.usuarios
      ORDER BY id
    `);

    if (result.rows.length === 0) {
      log('  ❌ NO HAY USUARIOS CREADOS', RED);
      log('', RESET);
      log('  💡 SOLUCIÓN:', YELLOW);
      log('     Ejecuta el seed para crear usuarios:', YELLOW);
      log('     node src/scripts/seed.js', YELLOW);
      log('', RESET);
      log('  📋 Esto creará 3 usuarios:', YELLOW);
      log('     • admin@ouasanjavier.cl / Admin123!', YELLOW);
      log('     • operador@ouasanjavier.cl / Operador123!', YELLOW);
      log('     • visualizador@ouasanjavier.cl / Visual123!', YELLOW);

      await pool.end();
      return false;
    }

    log(`  ✅ Encontrados ${result.rows.length} usuarios`, GREEN);
    console.log('');
    log('  👥 USUARIOS DISPONIBLES:', CYAN);
    console.log('');

    for (const user of result.rows) {
      const status = user.activo ? '✅ Activo' : '❌ Inactivo';
      log(`     ${status}  ${user.email}`, user.activo ? GREEN : RED);
      log(`              Nombre: ${user.nombre}`, BLUE);
      log(`              Rol: ${user.rol}`, BLUE);
      log(`              ID: ${user.id}`, BLUE);
      console.log('');
    }

    // Buscar específicamente el usuario admin
    const admin = result.rows.find(u => u.email === 'admin@ouasanjavier.cl');

    if (admin) {
      log('  ✅ Usuario administrador encontrado', GREEN);
      log('     Email: admin@ouasanjavier.cl', GREEN);
      log('     Contraseña: Admin123!', GREEN);
    } else {
      log('  ⚠️  No se encontró el usuario admin@ouasanjavier.cl', YELLOW);
      log('     Ejecuta: node src/scripts/seed.js', YELLOW);
    }

    await pool.end();
    return result.rows.length > 0;
  } catch (error) {
    log(`  ❌ Error verificando usuarios: ${error.message}`, RED);
    await pool.end();
    return false;
  }
}

async function checkBackendEndpoint() {
  header('5. VERIFICANDO ENDPOINT DE BACKEND');

  try {
    const http = require('http');

    const checkEndpoint = (path, description) => {
      return new Promise((resolve) => {
        log(`  🔍 Probando ${description}...`, BLUE);

        const options = {
          hostname: 'localhost',
          port: process.env.PORT || 5000,
          path: path,
          method: 'GET',
          timeout: 3000
        };

        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            if (res.statusCode === 200) {
              log(`     ✅ ${description}: OK (${res.statusCode})`, GREEN);
              try {
                const json = JSON.parse(data);
                log(`     📝 Respuesta: ${JSON.stringify(json)}`, BLUE);
              } catch (e) {
                // No es JSON
              }
              resolve(true);
            } else {
              log(`     ⚠️  ${description}: ${res.statusCode}`, YELLOW);
              resolve(false);
            }
          });
        });

        req.on('error', (error) => {
          log(`     ❌ ${description}: ${error.message}`, RED);
          resolve(false);
        });

        req.on('timeout', () => {
          req.destroy();
          log(`     ❌ ${description}: Timeout`, RED);
          resolve(false);
        });

        req.end();
      });
    };

    const healthOk = await checkEndpoint('/api/health', 'Health check');

    console.log('');

    if (healthOk) {
      log('  ✅ Backend está corriendo y respondiendo', GREEN);
    } else {
      log('  ❌ BACKEND NO ESTÁ RESPONDIENDO', RED);
      log('', RESET);
      log('  💡 POSIBLES SOLUCIONES:', YELLOW);
      log('     1. Verifica que el backend esté corriendo', YELLOW);
      log('     2. Ejecuta: npm run dev (en la carpeta backend)', YELLOW);
      log('     3. Verifica que el puerto 5000 no esté ocupado', YELLOW);
      log('     4. Revisa los logs del backend en la terminal', YELLOW);
    }

    return healthOk;
  } catch (error) {
    log(`  ❌ Error verificando backend: ${error.message}`, RED);
    return false;
  }
}

async function testLogin() {
  header('6. TEST DE LOGIN CON CREDENCIALES');

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    log('  🔍 Verificando proceso de login...', BLUE);

    // Verificar usuario admin
    const adminCheck = await pool.query(`
      SELECT id, email, nombre, rol, activo
      FROM telemetria_sta.usuarios
      WHERE email = $1
    `, ['admin@ouasanjavier.cl']);

    if (adminCheck.rows.length === 0) {
      log('  ❌ Usuario admin NO EXISTE en la base de datos', RED);
      log('  💡 SOLUCIÓN: node src/scripts/seed.js', YELLOW);
      await pool.end();
      return false;
    }

    const admin = adminCheck.rows[0];

    log('', RESET);
    log('  ✅ Usuario encontrado:', GREEN);
    log(`     📧 Email: ${admin.email}`, GREEN);
    log(`     👤 Nombre: ${admin.nombre}`, GREEN);
    log(`     🎭 Rol: ${admin.rol}`, GREEN);
    log(`     ✓ Estado: ${admin.activo ? 'Activo' : 'Inactivo'}`, admin.activo ? GREEN : RED);

    if (!admin.activo) {
      log('', RESET);
      log('  ⚠️  El usuario existe pero está INACTIVO', YELLOW);
      log('  💡 El login podría fallar si la validación de activo está habilitada', YELLOW);
    }

    log('', RESET);
    log('  🔐 CREDENCIALES PARA LOGIN:', CYAN);
    log('     Email: admin@ouasanjavier.cl', CYAN);
    log('     Contraseña: Admin123!', CYAN);

    await pool.end();
    return true;
  } catch (error) {
    log(`  ❌ Error en test de login: ${error.message}`, RED);
    await pool.end();
    return false;
  }
}

async function showSummary(results) {
  header('RESUMEN DEL DIAGNÓSTICO');

  const checks = [
    { name: 'Variables de entorno', passed: results.env },
    { name: 'Conexión PostgreSQL', passed: results.postgres },
    { name: 'Esquema de base de datos', passed: results.schema },
    { name: 'Usuarios creados', passed: results.users },
    { name: 'Backend respondiendo', passed: results.backend },
    { name: 'Test de login', passed: results.login }
  ];

  for (const check of checks) {
    const icon = check.passed ? '✅' : '❌';
    const color = check.passed ? GREEN : RED;
    log(`  ${icon} ${check.name}`, color);
  }

  console.log('');
  console.log('');

  const allPassed = Object.values(results).every(v => v === true);

  if (allPassed) {
    log('═══════════════════════════════════════════════════════', GREEN);
    log('  ✅ TODO ESTÁ CONFIGURADO CORRECTAMENTE', GREEN);
    log('═══════════════════════════════════════════════════════', GREEN);
    console.log('');
    log('  🚀 El sistema debería funcionar correctamente', GREEN);
    log('', RESET);
    log('  📋 CREDENCIALES PARA LOGIN:', CYAN);
    log('     URL: http://localhost:5173', CYAN);
    log('     Email: admin@ouasanjavier.cl', CYAN);
    log('     Contraseña: Admin123!', CYAN);
    console.log('');
    log('  💡 Si aún no funciona:', YELLOW);
    log('     1. Abre la consola del navegador (F12)', YELLOW);
    log('     2. Ve a la pestaña Console', YELLOW);
    log('     3. Intenta hacer login y copia el error', YELLOW);
    log('     4. Revisa los logs del backend en la terminal', YELLOW);
  } else {
    log('═══════════════════════════════════════════════════════', RED);
    log('  ❌ HAY PROBLEMAS QUE RESOLVER', RED);
    log('═══════════════════════════════════════════════════════', RED);
    console.log('');
    log('  📋 PASOS RECOMENDADOS:', YELLOW);

    if (!results.postgres) {
      log('     1. Verifica que PostgreSQL esté corriendo', YELLOW);
      log('        Windows: net start postgresql-x64-14', YELLOW);
    }

    if (!results.schema) {
      log('     2. Ejecuta las migraciones:', YELLOW);
      log('        node src/scripts/migrate.js', YELLOW);
    }

    if (!results.users) {
      log('     3. Ejecuta el seed para crear usuarios:', YELLOW);
      log('        node src/scripts/seed.js', YELLOW);
    }

    if (!results.backend) {
      log('     4. Asegúrate de que el backend esté corriendo:', YELLOW);
      log('        npm run dev', YELLOW);
    }
  }

  console.log('');
}

async function main() {
  console.clear();

  log('═══════════════════════════════════════════════════════', CYAN);
  log('  🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA STA-SB', CYAN);
  log('═══════════════════════════════════════════════════════', CYAN);
  console.log('');
  log('  Este script verificará todas las configuraciones necesarias', BLUE);
  log('  para que el sistema de login funcione correctamente.', BLUE);
  console.log('');

  const results = {
    env: false,
    postgres: false,
    schema: false,
    users: false,
    backend: false,
    login: false
  };

  // Ejecutar todas las verificaciones
  results.env = await checkEnvironment();

  if (results.env) {
    results.postgres = await checkPostgreSQLConnection();

    if (results.postgres) {
      results.schema = await checkSchema();
      results.users = await checkUsers();
      results.login = await testLogin();
    }
  }

  results.backend = await checkBackendEndpoint();

  // Mostrar resumen
  await showSummary(results);
}

// Ejecutar diagnóstico
main().catch(error => {
  console.error('');
  log('═══════════════════════════════════════════════════════', RED);
  log('  ❌ ERROR FATAL EN EL DIAGNÓSTICO', RED);
  log('═══════════════════════════════════════════════════════', RED);
  console.error('');
  log(`  ${error.message}`, RED);
  console.error('');
  log('  Stack trace:', YELLOW);
  console.error(error.stack);
  process.exit(1);
});
