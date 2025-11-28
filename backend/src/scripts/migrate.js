/**
 * Script de Migración - Creación de Esquema de Base de Datos
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 */

require('dotenv').config({ path: '../../.env' });
const db = require('../config/database');
const logger = require('../config/logger');

const migrate = async () => {
  logger.info('🔧 Iniciando migración de base de datos...');

  try {
    // 1. Crear esquema
    logger.info('📦 Creando esquema telemetria_sta...');
    await db.query('CREATE SCHEMA IF NOT EXISTS telemetria_sta');

    // 2. Tabla de estaciones
    logger.info('📡 Creando tabla estaciones...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS telemetria_sta.estaciones (
        id SERIAL PRIMARY KEY,
        codigo VARCHAR(20) UNIQUE NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        latitud DECIMAL(10,8),
        longitud DECIMAL(11,8),
        tipo_estacion VARCHAR(50) DEFAULT 'monitoreo',
        estado BOOLEAN DEFAULT true,
        fecha_instalacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Tabla de sensores
    logger.info('🌡️  Creando tabla sensores...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS telemetria_sta.sensores (
        id SERIAL PRIMARY KEY,
        estacion_id INTEGER REFERENCES telemetria_sta.estaciones(id) ON DELETE CASCADE,
        tipo_sensor VARCHAR(50) NOT NULL,
        marca VARCHAR(50),
        modelo VARCHAR(50),
        unidad_medida VARCHAR(20),
        rango_min DECIMAL(10,4),
        rango_max DECIMAL(10,4),
        precision_decimal INTEGER DEFAULT 2,
        estado BOOLEAN DEFAULT true,
        fecha_instalacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Tabla de usuarios
    logger.info('👥 Creando tabla usuarios...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS telemetria_sta.usuarios (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        apellido VARCHAR(100) NOT NULL,
        rol VARCHAR(50) NOT NULL CHECK (rol IN ('administrador', 'operador', 'visualizador')),
        activo BOOLEAN DEFAULT true,
        intentos_fallidos INTEGER DEFAULT 0,
        bloqueado_hasta TIMESTAMP,
        ultimo_acceso TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. Tabla de configuraciones
    logger.info('⚙️  Creando tabla configuraciones...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS telemetria_sta.configuraciones (
        id SERIAL PRIMARY KEY,
        clave VARCHAR(100) UNIQUE NOT NULL,
        valor TEXT NOT NULL,
        descripcion TEXT,
        tipo_dato VARCHAR(20) DEFAULT 'string',
        categoria VARCHAR(50),
        modificable BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6. Índices para optimización
    logger.info('🔍 Creando índices...');
    await db.query('CREATE INDEX IF NOT EXISTS idx_estaciones_codigo ON telemetria_sta.estaciones(codigo)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_estaciones_estado ON telemetria_sta.estaciones(estado)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_sensores_estacion ON telemetria_sta.sensores(estacion_id)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_sensores_tipo ON telemetria_sta.sensores(tipo_sensor)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_usuarios_email ON telemetria_sta.usuarios(email)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON telemetria_sta.usuarios(rol)');

    // 7. Función para actualizar updated_at automáticamente
    logger.info('⏰ Creando función de actualización automática...');
    await db.query(`
      CREATE OR REPLACE FUNCTION telemetria_sta.update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // 8. Triggers para updated_at
    logger.info('🎯 Creando triggers...');

    const tablas = ['estaciones', 'sensores', 'usuarios', 'configuraciones'];
    for (const tabla of tablas) {
      await db.query(`
        DROP TRIGGER IF EXISTS update_${tabla}_updated_at ON telemetria_sta.${tabla}
      `);

      await db.query(`
        CREATE TRIGGER update_${tabla}_updated_at
        BEFORE UPDATE ON telemetria_sta.${tabla}
        FOR EACH ROW
        EXECUTE FUNCTION telemetria_sta.update_updated_at_column()
      `);
    }

    logger.info('✅ Migración completada exitosamente!\n');
    logger.info('📊 Tablas creadas:');
    logger.info('   - telemetria_sta.estaciones');
    logger.info('   - telemetria_sta.sensores');
    logger.info('   - telemetria_sta.usuarios');
    logger.info('   - telemetria_sta.configuraciones');
    logger.info('\n🎯 Próximo paso: ejecutar npm run db:seed para cargar datos iniciales\n');

  } catch (error) {
    logger.error('❌ Error ejecutando migración:', error.message);
    throw error;
  } finally {
    await db.closePool();
  }
};

// Ejecutar migración si el script es llamado directamente
if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error('Error fatal en migración:', error);
      process.exit(1);
    });
}

module.exports = migrate;
