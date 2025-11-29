/**
 * Configuración y Cliente MQTT
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 *
 * Maneja la conexión con el broker MQTT y suscripción a topics
 * de telemetría de las estaciones remotas.
 */

const mqtt = require('mqtt');
const logger = require('./logger');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');

// Configuración MQTT
const MQTT_CONFIG = {
    broker: process.env.MQTT_BROKER || 'mqtt://localhost:1883',
    clientId: `backend_${Math.random().toString(16).slice(3)}`,
    options: {
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
        keepalive: 60
    }
};

// Configuración InfluxDB para escritura
const INFLUX_CONFIG = {
    url: process.env.INFLUX_URL || 'http://localhost:8086',
    token: process.env.INFLUX_TOKEN || '',
    org: process.env.INFLUX_ORG || 'CEA_Project_SPA',
    bucket: process.env.INFLUX_BUCKET || 'sta_sb_telemetria'
};

// Variables globales
let mqttClient = null;
let influxDB = null;
let writeApi = null;
let isConnected = false;
let wsServer = null; // WebSocket server para broadcast

// Estadísticas
const stats = {
    mensajesRecibidos: 0,
    mensajesProcesados: 0,
    errores: 0,
    ultimaConexion: null,
    ultimoMensaje: null
};

/**
 * Inicializar cliente InfluxDB
 */
function inicializarInfluxDB() {
    if (!INFLUX_CONFIG.token) {
        logger.warn('Token de InfluxDB no configurado, datos no se almacenarán');
        return;
    }

    try {
        influxDB = new InfluxDB({
            url: INFLUX_CONFIG.url,
            token: INFLUX_CONFIG.token
        });

        writeApi = influxDB.getWriteApi(INFLUX_CONFIG.org, INFLUX_CONFIG.bucket, 'ns');
        writeApi.useDefaultTags({
            'fuente': 'mqtt_backend',
            'sistema': 'sta-sb'
        });

        logger.info('✅ Cliente InfluxDB inicializado para escritura MQTT');
    } catch (error) {
        logger.error('Error inicializando InfluxDB:', error.message);
        writeApi = null;
    }
}

/**
 * Procesar mensaje de sensor
 */
function procesarMensajeSensor(topic, payload) {
    try {
        const data = JSON.parse(payload.toString());

        // Validar datos básicos
        if (!data.estacion_id || !data.tipo_sensor || data.valor === undefined) {
            logger.warn('Mensaje de sensor inválido:', { topic, data });
            stats.errores++;
            return;
        }

        // Almacenar en InfluxDB
        if (writeApi) {
            const point = new Point('datos_sensor')
                .tag('estacion_id', data.estacion_id)
                .tag('tipo_sensor', data.tipo_sensor)
                .tag('calidad', data.calidad || 'desconocida')
                .floatField('valor', parseFloat(data.valor))
                .stringField('unidad', data.unidad || '')
                .stringField('estado', data.estado || 'normal')
                .timestamp(new Date());

            writeApi.writePoint(point);
        }

        // Broadcast vía Socket.IO si hay servidor conectado
        if (wsServer && typeof wsServer.broadcast === 'function') {
            wsServer.broadcast('sensor_data', data);
        }

        stats.mensajesProcesados++;
        stats.ultimoMensaje = new Date();

        logger.debug('Datos de sensor procesados:', {
            estacion: data.estacion_id,
            sensor: data.tipo_sensor,
            valor: data.valor
        });

    } catch (error) {
        logger.error('Error procesando mensaje de sensor:', error.message);
        stats.errores++;
    }
}

/**
 * Procesar mensaje de actuador
 */
function procesarMensajeActuador(topic, payload) {
    try {
        const data = JSON.parse(payload.toString());

        // Validar datos básicos
        if (!data.estacion_id || !data.dispositivo || !data.estado) {
            logger.warn('Mensaje de actuador inválido:', { topic, data });
            stats.errores++;
            return;
        }

        // Almacenar en InfluxDB
        if (writeApi) {
            const point = new Point('eventos_actuador')
                .tag('estacion_id', data.estacion_id)
                .tag('dispositivo', data.dispositivo)
                .stringField('estado', data.estado)
                .stringField('comando', data.comando || 'estado')
                .timestamp(new Date());

            writeApi.writePoint(point);
        }

        // Broadcast vía Socket.IO
        if (wsServer && typeof wsServer.broadcast === 'function') {
            wsServer.broadcast('actuator_status', data);
        }

        stats.mensajesProcesados++;

        logger.info('Estado de actuador actualizado:', {
            estacion: data.estacion_id,
            dispositivo: data.dispositivo,
            estado: data.estado
        });

    } catch (error) {
        logger.error('Error procesando mensaje de actuador:', error.message);
        stats.errores++;
    }
}

/**
 * Procesar heartbeat de estación
 */
function procesarHeartbeat(topic, payload) {
    try {
        const data = JSON.parse(payload.toString());

        if (!data.estacion_id) {
            return;
        }

        // Almacenar en InfluxDB
        if (writeApi) {
            const point = new Point('heartbeat')
                .tag('estacion_id', data.estacion_id)
                .stringField('estado', data.estado || 'online')
                .intField('uptime', data.uptime || 0)
                .timestamp(new Date());

            writeApi.writePoint(point);
        }

        stats.mensajesProcesados++;

    } catch (error) {
        logger.error('Error procesando heartbeat:', error.message);
        stats.errores++;
    }
}

/**
 * Manejar mensaje MQTT recibido
 */
function onMensaje(topic, payload) {
    stats.mensajesRecibidos++;

    // Enrutar según tipo de topic
    if (topic.includes('/sensores/')) {
        procesarMensajeSensor(topic, payload);
    } else if (topic.includes('/actuadores/')) {
        procesarMensajeActuador(topic, payload);
    } else if (topic.includes('/heartbeat')) {
        procesarHeartbeat(topic, payload);
    } else {
        logger.debug('Mensaje de topic no manejado:', topic);
    }
}

/**
 * Conectar al broker MQTT
 */
function conectar() {
    return new Promise((resolve, reject) => {
        logger.info('📡 Conectando a broker MQTT:', MQTT_CONFIG.broker);

        // Inicializar InfluxDB
        inicializarInfluxDB();

        // Conectar al broker
        mqttClient = mqtt.connect(MQTT_CONFIG.broker, {
            ...MQTT_CONFIG.options,
            clientId: MQTT_CONFIG.clientId
        });

        // Evento: Conexión exitosa
        mqttClient.on('connect', () => {
            isConnected = true;
            stats.ultimaConexion = new Date();
            logger.info('✅ Conectado a broker MQTT');
            logger.info(`📋 Client ID: ${MQTT_CONFIG.clientId}`);

            // Suscribirse a topics de telemetría
            const topics = [
                'telemetria/+/sensores/#',      // Todos los sensores
                'telemetria/+/actuadores/#',    // Todos los actuadores
                'telemetria/+/sistema/heartbeat' // Heartbeats
            ];

            mqttClient.subscribe(topics, { qos: 1 }, (error) => {
                if (error) {
                    logger.error('Error suscribiéndose a topics:', error.message);
                    reject(error);
                } else {
                    logger.info('✅ Suscrito a topics de telemetría:', topics);
                    resolve(mqttClient);
                }
            });
        });

        // Evento: Mensaje recibido
        mqttClient.on('message', onMensaje);

        // Evento: Error
        mqttClient.on('error', (error) => {
            isConnected = false;
            logger.error('❌ Error MQTT:', error.message);
            stats.errores++;
        });

        // Evento: Desconexión
        mqttClient.on('disconnect', () => {
            isConnected = false;
            logger.warn('⚠️  Desconectado del broker MQTT');
        });

        // Evento: Reconexión
        mqttClient.on('reconnect', () => {
            logger.info('🔄 Reconectando a broker MQTT...');
        });

        // Timeout de conexión
        setTimeout(() => {
            if (!isConnected) {
                const error = new Error('Timeout conectando a MQTT broker');
                logger.error(error.message);
                reject(error);
            }
        }, 10000); // 10 segundos
    });
}

/**
 * Desconectar del broker MQTT
 */
async function desconectar() {
    logger.info('📴 Desconectando de broker MQTT...');

    if (mqttClient) {
        mqttClient.end();
        mqttClient = null;
    }

    if (writeApi) {
        await writeApi.close();
        writeApi = null;
    }

    isConnected = false;
    logger.info('✅ Desconectado de MQTT correctamente');
}

/**
 * Publicar mensaje en topic
 */
function publicar(topic, payload, options = { qos: 1 }) {
    return new Promise((resolve, reject) => {
        if (!isConnected || !mqttClient) {
            reject(new Error('Cliente MQTT no conectado'));
            return;
        }

        const payloadStr = typeof payload === 'object' ? JSON.stringify(payload) : payload;

        mqttClient.publish(topic, payloadStr, options, (error) => {
            if (error) {
                logger.error('Error publicando mensaje:', { topic, error: error.message });
                reject(error);
            } else {
                logger.debug('Mensaje publicado:', { topic });
                resolve();
            }
        });
    });
}

/**
 * Enviar comando a estación (compuerta, bomba, etc)
 */
async function enviarComando(estacionId, dispositivo, comando, parametros = {}) {
    const topic = `telemetria/${estacionId}/comandos/${dispositivo}`;
    const payload = {
        comando,
        parametros,
        timestamp: new Date().toISOString(),
        origen: 'backend'
    };

    try {
        await publicar(topic, payload);
        logger.info('Comando enviado a estación:', { estacionId, dispositivo, comando });
        return true;
    } catch (error) {
        logger.error('Error enviando comando:', error.message);
        return false;
    }
}

/**
 * Registrar servidor WebSocket para broadcast
 */
function registrarWebSocket(wss) {
    wsServer = wss;
    logger.info('✅ WebSocket server registrado para broadcast MQTT');
}

/**
 * Obtener estadísticas
 */
function obtenerEstadisticas() {
    return {
        ...stats,
        conectado: isConnected,
        clientId: MQTT_CONFIG.clientId,
        broker: MQTT_CONFIG.broker
    };
}

/**
 * Verificar conexión
 */
function estaConectado() {
    return isConnected;
}

module.exports = {
    conectar,
    desconectar,
    publicar,
    enviarComando,
    registrarWebSocket,
    obtenerEstadisticas,
    estaConectado,
    client: () => mqttClient
};
