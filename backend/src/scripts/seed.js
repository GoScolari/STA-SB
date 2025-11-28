/**
 * Script de Seed - Datos Iniciales
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 */

require('dotenv').config({ path: '../../.env' });
const db = require('../config/database');
const Usuario = require('../models/Usuario');
const logger = require('../config/logger');

const seedDatabase = async () => {
  logger.info('🌱 Iniciando seed de base de datos...');

  try {
    // 1. Crear usuarios iniciales
    logger.info('👥 Creando usuarios iniciales...');

    const usuarios = [
      {
        email: 'admin@ouasanjavier.cl',
        password: 'Admin123!',
        nombre: 'Administrador',
        apellido: 'Sistema',
        rol: 'administrador',
        activo: true
      },
      {
        email: 'operador@ouasanjavier.cl',
        password: 'Operador123!',
        nombre: 'Juan',
        apellido: 'Pérez',
        rol: 'operador',
        activo: true
      },
      {
        email: 'visualizador@ouasanjavier.cl',
        password: 'Visual123!',
        nombre: 'María',
        apellido: 'González',
        rol: 'visualizador',
        activo: true
      }
    ];

    for (const userData of usuarios) {
      try {
        const usuarioExistente = await Usuario.getByEmail(userData.email);
        if (!usuarioExistente) {
          await Usuario.create(userData);
          logger.info(`✅ Usuario creado: ${userData.email} (${userData.rol})`);
        } else {
          logger.info(`⚠️  Usuario ya existe: ${userData.email}`);
        }
      } catch (error) {
        logger.error(`❌ Error creando usuario ${userData.email}:`, error.message);
      }
    }

    // 2. Crear estaciones de telemetría
    logger.info('📡 Creando estaciones de telemetría...');

    const estaciones = [];
    for (let i = 1; i <= 30; i++) {
      estaciones.push({
        codigo: `EST${String(i).padStart(3, '0')}`,
        nombre: `Estación ${i} - ${['Canal Norte', 'Canal Sur', 'Canal Centro'][i % 3]}`,
        descripcion: `Estación de monitoreo ${i} del sistema de riego San Javier`,
        latitud: -35.5 + (Math.random() * 0.2 - 0.1),
        longitud: -71.7 + (Math.random() * 0.2 - 0.1),
        tipo_estacion: ['monitoreo', 'control', 'mixta'][i % 3],
        estado: true
      });
    }

    for (const estacion of estaciones) {
      try {
        const query = `
          INSERT INTO telemetria_sta.estaciones
          (codigo, nombre, descripcion, latitud, longitud, tipo_estacion, estado)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (codigo) DO NOTHING
          RETURNING id
        `;

        const params = [
          estacion.codigo,
          estacion.nombre,
          estacion.descripcion,
          estacion.latitud,
          estacion.longitud,
          estacion.tipo_estacion,
          estacion.estado
        ];

        const result = await db.query(query, params);

        if (result.rowCount > 0) {
          logger.info(`✅ Estación creada: ${estacion.codigo}`);

          // Crear sensores para cada estación
          const estacionId = result.rows[0].id;
          const sensores = [
            {
              tipo: 'nivel_agua',
              marca: 'Siemens',
              modelo: 'SITRANS LU150',
              unidad: 'cm',
              min: 0,
              max: 300
            },
            {
              tipo: 'temperatura',
              marca: 'Honeywell',
              modelo: 'T775A',
              unidad: '°C',
              min: -10,
              max: 50
            },
            {
              tipo: 'caudal',
              marca: 'Endress+Hauser',
              modelo: 'Proline Promag 50',
              unidad: 'L/s',
              min: 0,
              max: 1000
            }
          ];

          for (const sensor of sensores) {
            const sensorQuery = `
              INSERT INTO telemetria_sta.sensores
              (estacion_id, tipo_sensor, marca, modelo, unidad_medida, rango_min, rango_max, estado)
              VALUES ($1, $2, $3, $4, $5, $6, $7, true)
            `;

            await db.query(sensorQuery, [
              estacionId,
              sensor.tipo,
              sensor.marca,
              sensor.modelo,
              sensor.unidad,
              sensor.min,
              sensor.max
            ]);
          }

          logger.info(`  ↳ 3 sensores creados para ${estacion.codigo}`);
        } else {
          logger.info(`⚠️  Estación ya existe: ${estacion.codigo}`);
        }
      } catch (error) {
        logger.error(`❌ Error creando estación ${estacion.codigo}:`, error.message);
      }
    }

    // 3. Configuraciones del sistema
    logger.info('⚙️  Creando configuraciones del sistema...');

    const configuraciones = [
      {
        clave: 'sistema.nombre',
        valor: 'STA-SB - Sistema de Telemetría y Automatización San Javier',
        descripcion: 'Nombre completo del sistema',
        tipo_dato: 'string',
        categoria: 'general'
      },
      {
        clave: 'sistema.version',
        valor: '1.0.0',
        descripcion: 'Versión del sistema',
        tipo_dato: 'string',
        categoria: 'general'
      },
      {
        clave: 'telemetria.intervalo_lectura',
        valor: '5000',
        descripcion: 'Intervalo de lectura de sensores en milisegundos',
        tipo_dato: 'number',
        categoria: 'telemetria'
      },
      {
        clave: 'telemetria.retencion_datos',
        valor: '7',
        descripcion: 'Años de retención de datos según normativa DGA',
        tipo_dato: 'number',
        categoria: 'telemetria'
      },
      {
        clave: 'alertas.nivel_critico',
        valor: '90',
        descripcion: 'Porcentaje de nivel crítico de agua',
        tipo_dato: 'number',
        categoria: 'alertas'
      },
      {
        clave: 'reportes.auto_dga',
        valor: 'true',
        descripcion: 'Generar automáticamente reportes DGA',
        tipo_dato: 'boolean',
        categoria: 'reportes'
      }
    ];

    for (const config of configuraciones) {
      try {
        const query = `
          INSERT INTO telemetria_sta.configuraciones
          (clave, valor, descripcion, tipo_dato, categoria, modificable)
          VALUES ($1, $2, $3, $4, $5, true)
          ON CONFLICT (clave) DO NOTHING
        `;

        await db.query(query, [
          config.clave,
          config.valor,
          config.descripcion,
          config.tipo_dato,
          config.categoria
        ]);

        logger.info(`✅ Configuración creada: ${config.clave}`);
      } catch (error) {
        logger.error(`❌ Error creando configuración ${config.clave}:`, error.message);
      }
    }

    logger.info('\n✅ Seed completado exitosamente!\n');
    logger.info('📊 Resumen:');
    logger.info('   - 3 usuarios creados (admin, operador, visualizador)');
    logger.info('   - 30 estaciones de telemetría creadas');
    logger.info('   - 90 sensores creados (3 por estación)');
    logger.info('   - 6 configuraciones del sistema creadas');
    logger.info('\n🔑 Credenciales de acceso:');
    logger.info('   Admin: admin@ouasanjavier.cl / Admin123!');
    logger.info('   Operador: operador@ouasanjavier.cl / Operador123!');
    logger.info('   Visualizador: visualizador@ouasanjavier.cl / Visual123!\n');

  } catch (error) {
    logger.error('❌ Error ejecutando seed:', error.message);
    throw error;
  } finally {
    await db.closePool();
  }
};

// Ejecutar seed si el script es llamado directamente
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error('Error fatal en seed:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;
