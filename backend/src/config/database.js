/**
 * Configuración de PostgreSQL
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 */

const { Pool } = require('pg');
const logger = require('./logger');

// Configuración del pool de conexiones PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'telemetria_user',
  password: process.env.DB_PASSWORD || 'sta123',
  database: process.env.DB_NAME || 'DB_STA',
  max: parseInt(process.env.DB_POOL_MAX || '10'),
  min: parseInt(process.env.DB_POOL_MIN || '2'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Event listeners para el pool
pool.on('connect', (client) => {
  logger.info('Nueva conexión establecida con PostgreSQL');
});

pool.on('error', (err, client) => {
  logger.error('Error inesperado en cliente PostgreSQL:', err);
});

pool.on('remove', (client) => {
  logger.info('Cliente removido del pool de PostgreSQL');
});

/**
 * Ejecuta una consulta SQL
 * @param {string} text - Consulta SQL
 * @param {Array} params - Parámetros de la consulta
 * @returns {Promise} Resultado de la consulta
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Query ejecutada', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Error ejecutando query:', { text, error: error.message });
    throw error;
  }
};

/**
 * Obtiene un cliente del pool para transacciones
 * @returns {Promise} Cliente de PostgreSQL
 */
const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;

  // Set release timeout para evitar conexiones colgadas
  const timeout = setTimeout(() => {
    logger.error('Cliente no liberado después de 5 segundos');
  }, 5000);

  // Wrapper para liberar el cliente
  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release.apply(client);
  };

  return client;
};

/**
 * Verifica la conexión a PostgreSQL
 * @returns {Promise<boolean>}
 */
const testConnection = async () => {
  try {
    const result = await query('SELECT NOW() as current_time, version() as version');
    logger.info('Conexión PostgreSQL exitosa:', {
      time: result.rows[0].current_time,
      version: result.rows[0].version.split(',')[0]
    });
    return true;
  } catch (error) {
    logger.error('Error conectando a PostgreSQL:', error.message);
    return false;
  }
};

/**
 * Cierra el pool de conexiones
 * @returns {Promise}
 */
const closePool = async () => {
  try {
    await pool.end();
    logger.info('Pool de PostgreSQL cerrado correctamente');
  } catch (error) {
    logger.error('Error cerrando pool de PostgreSQL:', error.message);
    throw error;
  }
};

module.exports = {
  query,
  getClient,
  testConnection,
  closePool,
  pool
};
