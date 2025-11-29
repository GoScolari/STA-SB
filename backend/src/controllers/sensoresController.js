/**
 * Controller de Sensores y Datos de Telemetría
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 */

const logger = require('../config/logger');
const influx = require('../config/influx');
const mqtt = require('../config/mqtt');

/**
 * @route   GET /api/sensores/datos/:estacionId
 * @desc    Obtener últimos datos de sensores de una estación
 * @access  Private
 */
exports.obtenerDatosEstacion = async (req, res) => {
    try {
        const { estacionId } = req.params;
        const { limit = 100, sensor } = req.query;

        logger.info('Consultando datos de estación:', { estacionId, limit, sensor });

        // Construir query de InfluxDB
        let query = `
            from(bucket: "${process.env.INFLUX_BUCKET || 'sta_sb_telemetria'}")
                |> range(start: -1h)
                |> filter(fn: (r) => r._measurement == "datos_sensor")
                |> filter(fn: (r) => r.estacion_id == "${estacionId}")
        `;

        // Filtrar por tipo de sensor si se especifica
        if (sensor) {
            query += `|> filter(fn: (r) => r.tipo_sensor == "${sensor}")`;
        }

        query += `
            |> sort(columns: ["_time"], desc: true)
            |> limit(n: ${parseInt(limit)})
        `;

        const client = influx.getQueryApi();
        const datos = [];

        await new Promise((resolve, reject) => {
            client.queryRows(query, {
                next(row, tableMeta) {
                    const record = tableMeta.toObject(row);
                    datos.push({
                        tiempo: record._time,
                        estacion: record.estacion_id,
                        sensor: record.tipo_sensor,
                        valor: record._value,
                        unidad: record.unidad,
                        calidad: record.calidad
                    });
                },
                error(error) {
                    logger.error('Error consultando InfluxDB:', error.message);
                    reject(error);
                },
                complete() {
                    resolve();
                }
            });
        });

        res.json({
            success: true,
            estacion_id: estacionId,
            datos,
            total: datos.length
        });

    } catch (error) {
        logger.error('Error obteniendo datos de estación:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo datos de sensores',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @route   GET /api/sensores/tiempo-real/:estacionId
 * @desc    Obtener último valor de cada sensor
 * @access  Private
 */
exports.obtenerDatosTiempoReal = async (req, res) => {
    try {
        const { estacionId } = req.params;

        logger.info('Consultando datos tiempo real:', { estacionId });

        // Query para obtener últimos valores
        const query = `
            from(bucket: "${process.env.INFLUX_BUCKET || 'sta_sb_telemetria'}")
                |> range(start: -5m)
                |> filter(fn: (r) => r._measurement == "datos_sensor")
                |> filter(fn: (r) => r.estacion_id == "${estacionId}")
                |> last()
        `;

        const client = influx.getQueryApi();
        const sensores = {};

        await new Promise((resolve, reject) => {
            client.queryRows(query, {
                next(row, tableMeta) {
                    const record = tableMeta.toObject(row);
                    const tipoSensor = record.tipo_sensor;

                    sensores[tipoSensor] = {
                        valor: record._value,
                        unidad: record.unidad,
                        calidad: record.calidad,
                        tiempo: record._time
                    };
                },
                error(error) {
                    logger.error('Error consultando InfluxDB:', error.message);
                    reject(error);
                },
                complete() {
                    resolve();
                }
            });
        });

        res.json({
            success: true,
            estacion_id: estacionId,
            sensores,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error('Error obteniendo datos tiempo real:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo datos tiempo real',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @route   GET /api/sensores/estadisticas/:estacionId
 * @desc    Obtener estadísticas agregadas de sensores
 * @access  Private
 */
exports.obtenerEstadisticas = async (req, res) => {
    try {
        const { estacionId } = req.params;
        const { sensor, periodo = '1h' } = req.query;

        logger.info('Consultando estadísticas:', { estacionId, sensor, periodo });

        if (!sensor) {
            return res.status(400).json({
                success: false,
                message: 'Parámetro "sensor" requerido'
            });
        }

        // Query para estadísticas
        const query = `
            from(bucket: "${process.env.INFLUX_BUCKET || 'sta_sb_telemetria'}")
                |> range(start: -${periodo})
                |> filter(fn: (r) => r._measurement == "datos_sensor")
                |> filter(fn: (r) => r.estacion_id == "${estacionId}")
                |> filter(fn: (r) => r.tipo_sensor == "${sensor}")
                |> filter(fn: (r) => r._field == "valor")
        `;

        const client = influx.getQueryApi();
        const valores = [];

        await new Promise((resolve, reject) => {
            client.queryRows(query, {
                next(row, tableMeta) {
                    const record = tableMeta.toObject(row);
                    valores.push(parseFloat(record._value));
                },
                error(error) {
                    logger.error('Error consultando InfluxDB:', error.message);
                    reject(error);
                },
                complete() {
                    resolve();
                }
            });
        });

        // Calcular estadísticas
        const estadisticas = {
            total: valores.length,
            minimo: Math.min(...valores),
            maximo: Math.max(...valores),
            promedio: valores.reduce((a, b) => a + b, 0) / valores.length,
            desviacion: 0
        };

        // Calcular desviación estándar
        const varianza = valores.reduce((sum, val) => sum + Math.pow(val - estadisticas.promedio, 2), 0) / valores.length;
        estadisticas.desviacion = Math.sqrt(varianza);

        res.json({
            success: true,
            estacion_id: estacionId,
            sensor,
            periodo,
            estadisticas
        });

    } catch (error) {
        logger.error('Error obteniendo estadísticas:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo estadísticas',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @route   POST /api/sensores/comando/:estacionId
 * @desc    Enviar comando a estación (compuerta, bomba)
 * @access  Private (Admin/Operador)
 */
exports.enviarComando = async (req, res) => {
    try {
        const { estacionId } = req.params;
        const { dispositivo, comando, parametros } = req.body;

        // Validar datos
        if (!dispositivo || !comando) {
            return res.status(400).json({
                success: false,
                message: 'Campos "dispositivo" y "comando" requeridos'
            });
        }

        logger.info('Enviando comando a estación:', {
            estacion: estacionId,
            dispositivo,
            comando,
            usuario: req.user?.email
        });

        // Verificar permisos (solo admin y operador pueden controlar)
        if (req.user.rol !== 'administrador' && req.user.rol !== 'operador') {
            return res.status(403).json({
                success: false,
                message: 'No tiene permisos para enviar comandos'
            });
        }

        // Enviar comando vía MQTT
        const enviado = await mqtt.enviarComando(estacionId, dispositivo, comando, parametros);

        if (!enviado) {
            return res.status(500).json({
                success: false,
                message: 'Error enviando comando a estación'
            });
        }

        // Registrar acción en logs de auditoría
        logger.info('Comando enviado exitosamente:', {
            estacion: estacionId,
            dispositivo,
            comando,
            usuario: req.user.email,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Comando enviado correctamente',
            estacion_id: estacionId,
            dispositivo,
            comando
        });

    } catch (error) {
        logger.error('Error enviando comando:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error enviando comando',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @route   GET /api/sensores/mqtt/stats
 * @desc    Obtener estadísticas del servicio MQTT
 * @access  Private
 */
exports.obtenerEstadisticasMQTT = async (req, res) => {
    try {
        const stats = mqtt.obtenerEstadisticas();

        res.json({
            success: true,
            mqtt: stats
        });

    } catch (error) {
        logger.error('Error obteniendo estadísticas MQTT:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo estadísticas MQTT',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @route   GET /api/sensores/heartbeat/:estacionId
 * @desc    Obtener último heartbeat de una estación
 * @access  Private
 */
exports.obtenerHeartbeat = async (req, res) => {
    try {
        const { estacionId } = req.params;

        const query = `
            from(bucket: "${process.env.INFLUX_BUCKET || 'sta_sb_telemetria'}")
                |> range(start: -10m)
                |> filter(fn: (r) => r._measurement == "heartbeat")
                |> filter(fn: (r) => r.estacion_id == "${estacionId}")
                |> last()
        `;

        const client = influx.getQueryApi();
        let heartbeat = null;

        await new Promise((resolve, reject) => {
            client.queryRows(query, {
                next(row, tableMeta) {
                    const record = tableMeta.toObject(row);
                    heartbeat = {
                        estacion_id: record.estacion_id,
                        estado: record.estado || record._value,
                        uptime: record.uptime,
                        tiempo: record._time
                    };
                },
                error(error) {
                    logger.error('Error consultando heartbeat:', error.message);
                    reject(error);
                },
                complete() {
                    resolve();
                }
            });
        });

        if (!heartbeat) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró heartbeat reciente para esta estación'
            });
        }

        // Determinar si la estación está online (heartbeat menor a 2 minutos)
        const tiempoHeartbeat = new Date(heartbeat.tiempo);
        const ahora = new Date();
        const minutosDesdeHeartbeat = (ahora - tiempoHeartbeat) / 1000 / 60;

        heartbeat.online = minutosDesdeHeartbeat < 2;
        heartbeat.minutos_desde_heartbeat = Math.round(minutosDesdeHeartbeat);

        res.json({
            success: true,
            heartbeat
        });

    } catch (error) {
        logger.error('Error obteniendo heartbeat:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo heartbeat',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
