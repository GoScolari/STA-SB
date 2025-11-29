#!/usr/bin/env node

/**
 * SIMULADOR DE ESTACIONES DE TELEMETRÍA EN TIEMPO REAL
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 *
 * Este simulador genera datos realistas de 30 estaciones de telemetría
 * y los publica vía MQTT cada 5 segundos, simulando el comportamiento
 * real de sensores IoT en campo.
 *
 * @author Gonzalo Scolari, Xavier Barrera
 * @version 1.0.0
 */

require('dotenv').config();
const mqtt = require('mqtt');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');

// Configuración MQTT
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://localhost:1883';
const MQTT_CLIENT_ID = `simulator_${Math.random().toString(16).slice(3)}`;

// Configuración InfluxDB
const influxConfig = {
    url: process.env.INFLUX_URL || 'http://localhost:8086',
    token: process.env.INFLUX_TOKEN || '',
    org: process.env.INFLUX_ORG || 'CEA_Project_SPA',
    bucket: process.env.INFLUX_BUCKET || 'sta_sb_telemetria'
};

// Inicializar clientes
let mqttClient = null;
let influxDB = null;
let writeApi = null;
let isConnected = false;

// 30 Estaciones de telemetría simuladas
const estaciones = [
    { id: 'EST001', nombre: 'Canal Principal Norte', tipo: 'primaria', lat: -35.5987, lon: -71.7264 },
    { id: 'EST002', nombre: 'Canal Principal Sur', tipo: 'primaria', lat: -35.6124, lon: -71.7398 },
    { id: 'EST003', nombre: 'Bocatoma General', tipo: 'bocatoma', lat: -35.5856, lon: -71.7156 },
    { id: 'EST004', nombre: 'Canal Secundario A1', tipo: 'secundaria', lat: -35.6045, lon: -71.7301 },
    { id: 'EST005', nombre: 'Canal Secundario A2', tipo: 'secundaria', lat: -35.6089, lon: -71.7412 },
    { id: 'EST006', nombre: 'Canal Secundario A3', tipo: 'secundaria', lat: -35.6134, lon: -71.7523 },
    { id: 'EST007', nombre: 'Canal Secundario A4', tipo: 'secundaria', lat: -35.6178, lon: -71.7634 },
    { id: 'EST008', nombre: 'Canal Secundario B1', tipo: 'secundaria', lat: -35.6012, lon: -71.7189 },
    { id: 'EST009', nombre: 'Canal Secundario B2', tipo: 'secundaria', lat: -35.6156, lon: -71.7278 },
    { id: 'EST010', nombre: 'Canal Secundario B3', tipo: 'secundaria', lat: -35.6234, lon: -71.7456 },
    { id: 'EST011', nombre: 'Canal Terciario C1', tipo: 'terciaria', lat: -35.6078, lon: -71.7289 },
    { id: 'EST012', nombre: 'Canal Terciario C2', tipo: 'terciaria', lat: -35.6145, lon: -71.7367 },
    { id: 'EST013', nombre: 'Canal Terciario C3', tipo: 'terciaria', lat: -35.6198, lon: -71.7445 },
    { id: 'EST014', nombre: 'Canal Terciario C4', tipo: 'terciaria', lat: -35.6267, lon: -71.7523 },
    { id: 'EST015', nombre: 'Canal Terciario C5', tipo: 'terciaria', lat: -35.6312, lon: -71.7601 },
    { id: 'EST016', nombre: 'Compuerta Principal 1', tipo: 'control', lat: -35.5923, lon: -71.7201 },
    { id: 'EST017', nombre: 'Compuerta Principal 2', tipo: 'control', lat: -35.6067, lon: -71.7345 },
    { id: 'EST018', nombre: 'Compuerta Principal 3', tipo: 'control', lat: -35.6189, lon: -71.7489 },
    { id: 'EST019', nombre: 'Estación Bombeo 1', tipo: 'bombeo', lat: -35.5989, lon: -71.7234 },
    { id: 'EST020', nombre: 'Estación Bombeo 2', tipo: 'bombeo', lat: -35.6123, lon: -71.7378 },
    { id: 'EST021', nombre: 'Canal Este Principal', tipo: 'primaria', lat: -35.6045, lon: -71.7123 },
    { id: 'EST022', nombre: 'Canal Oeste Principal', tipo: 'primaria', lat: -35.6089, lon: -71.7567 },
    { id: 'EST023', nombre: 'Derivación Norte 1', tipo: 'derivacion', lat: -35.5934, lon: -71.7289 },
    { id: 'EST024', nombre: 'Derivación Norte 2', tipo: 'derivacion', lat: -35.5978, lon: -71.7367 },
    { id: 'EST025', nombre: 'Derivación Sur 1', tipo: 'derivacion', lat: -35.6234, lon: -71.7434 },
    { id: 'EST026', nombre: 'Derivación Sur 2', tipo: 'derivacion', lat: -35.6289, lon: -71.7512 },
    { id: 'EST027', nombre: 'Aforador Principal', tipo: 'medicion', lat: -35.6012, lon: -71.7256 },
    { id: 'EST028', nombre: 'Aforador Secundario 1', tipo: 'medicion', lat: -35.6089, lon: -71.7334 },
    { id: 'EST029', nombre: 'Aforador Secundario 2', tipo: 'medicion', lat: -35.6167, lon: -71.7412 },
    { id: 'EST030', nombre: 'Punto Control DGA', tipo: 'regulatorio', lat: -35.6000, lon: -71.7300 }
];

// Tipos de sensores con rangos realistas
const tiposSensores = {
    nivel_agua: {
        min: 20, max: 180, unidad: 'cm', precision: 0.1, variacion: 5.0,
        descripcion: 'Nivel de agua en canal'
    },
    temperatura: {
        min: 8, max: 35, unidad: '°C', precision: 0.1, variacion: 2.0,
        descripcion: 'Temperatura del agua'
    },
    caudal: {
        min: 5, max: 85, unidad: 'L/s', precision: 0.5, variacion: 8.0,
        descripcion: 'Caudal de agua'
    },
    presion: {
        min: 0.5, max: 4.5, unidad: 'bar', precision: 0.01, variacion: 0.3,
        descripcion: 'Presión del sistema'
    }
};

// Estados de compuertas y bombas
const estadosCompuerta = ['cerrada', 'abierta_25', 'abierta_50', 'abierta_75', 'abierta_100'];
const estadosBomba = ['apagada', 'encendida_baja', 'encendida_media', 'encendida_alta'];

// Tracking de valores previos para continuidad
const valoresAnteriores = {};

/**
 * Genera valor realista de sensor con continuidad temporal
 */
function generarValorSensor(estacionId, tipo) {
    const sensor = tiposSensores[tipo];
    const hora = new Date().getHours();
    const minuto = new Date().getMinutes();

    // Obtener valor anterior o inicializar
    const key = `${estacionId}_${tipo}`;
    let valorAnterior = valoresAnteriores[key];

    if (!valorAnterior) {
        // Primera vez, valor base aleatorio
        valorAnterior = (sensor.min + sensor.max) / 2 + (Math.random() - 0.5) * (sensor.max - sensor.min) * 0.3;
    }

    // Calcular tendencia según hora del día
    let tendencia = 0;

    if (tipo === 'temperatura') {
        // Temperatura sigue ciclo diurno
        const factorHora = Math.sin((hora - 6) * Math.PI / 12);
        tendencia = factorHora * 4;
    } else if (tipo === 'caudal') {
        // Caudal mayor durante horario de riego (7-20h)
        if (hora >= 7 && hora <= 20) {
            tendencia = 15 * Math.sin((hora - 7) * Math.PI / 13);
        } else {
            tendencia = -10;
        }
    } else if (tipo === 'nivel_agua') {
        // Nivel correlacionado con caudal
        if (hora >= 7 && hora <= 20) {
            tendencia = 10 * Math.sin((hora - 7) * Math.PI / 13);
        } else {
            tendencia = -5;
        }
    }

    // Variación suave (cambio máximo del 5% por lectura)
    const maxCambio = (sensor.max - sensor.min) * 0.05;
    const cambio = (Math.random() - 0.5) * maxCambio + tendencia * 0.1;

    // Nuevo valor con continuidad
    let nuevoValor = valorAnterior + cambio;

    // Aplicar límites
    nuevoValor = Math.max(sensor.min, Math.min(sensor.max, nuevoValor));

    // Aplicar precisión
    nuevoValor = Math.round(nuevoValor / sensor.precision) * sensor.precision;

    // Guardar para próxima iteración
    valoresAnteriores[key] = nuevoValor;

    return nuevoValor;
}

/**
 * Genera calidad de dato realista
 */
function generarCalidad() {
    const rand = Math.random();
    if (rand < 0.80) return 'excelente';
    if (rand < 0.95) return 'buena';
    if (rand < 0.99) return 'regular';
    return 'mala';
}

/**
 * Genera estado de compuerta
 */
function generarEstadoCompuerta() {
    // Cambio de estado ocasional (10% probabilidad)
    if (Math.random() > 0.10) {
        return null; // Sin cambio
    }
    return estadosCompuerta[Math.floor(Math.random() * estadosCompuerta.length)];
}

/**
 * Genera estado de bomba
 */
function generarEstadoBomba() {
    // Cambio de estado ocasional (5% probabilidad)
    if (Math.random() > 0.05) {
        return null; // Sin cambio
    }
    return estadosBomba[Math.floor(Math.random() * estadosBomba.length)];
}

/**
 * Publica datos de una estación vía MQTT
 */
function publicarDatosEstacion(estacion) {
    const timestamp = new Date().toISOString();

    // Generar datos de sensores
    const datosSensores = {};
    Object.keys(tiposSensores).forEach(tipoSensor => {
        const valor = generarValorSensor(estacion.id, tipoSensor);
        const calidad = generarCalidad();

        datosSensores[tipoSensor] = {
            valor,
            unidad: tiposSensores[tipoSensor].unidad,
            calidad,
            timestamp
        };

        // Publicar por topic individual
        const topic = `telemetria/${estacion.id}/sensores/${tipoSensor}`;
        const payload = {
            estacion_id: estacion.id,
            estacion_nombre: estacion.nombre,
            tipo_sensor: tipoSensor,
            valor,
            unidad: tiposSensores[tipoSensor].unidad,
            calidad,
            estado: calidad !== 'mala' ? 'operativo' : 'alerta',
            timestamp
        };

        if (isConnected) {
            mqttClient.publish(topic, JSON.stringify(payload), { qos: 1 });
        }

        // Guardar en InfluxDB
        if (writeApi) {
            const point = new Point('datos_sensor')
                .tag('estacion_id', estacion.id)
                .tag('tipo_sensor', tipoSensor)
                .tag('estacion_tipo', estacion.tipo)
                .tag('calidad_dato', calidad)
                .floatField('valor', valor)
                .stringField('unidad', tiposSensores[tipoSensor].unidad)
                .timestamp(new Date());

            writeApi.writePoint(point);
        }
    });

    // Publicar estado de actuadores si aplica
    if (estacion.tipo === 'control') {
        const estadoCompuerta = generarEstadoCompuerta();
        if (estadoCompuerta) {
            const topic = `telemetria/${estacion.id}/actuadores/compuerta`;
            const payload = {
                estacion_id: estacion.id,
                dispositivo: 'compuerta',
                estado: estadoCompuerta,
                timestamp
            };
            if (isConnected) {
                mqttClient.publish(topic, JSON.stringify(payload), { qos: 1 });
            }
        }
    }

    if (estacion.tipo === 'bombeo') {
        const estadoBomba = generarEstadoBomba();
        if (estadoBomba) {
            const topic = `telemetria/${estacion.id}/actuadores/bomba`;
            const payload = {
                estacion_id: estacion.id,
                dispositivo: 'bomba',
                estado: estadoBomba,
                timestamp
            };
            if (isConnected) {
                mqttClient.publish(topic, JSON.stringify(payload), { qos: 1 });
            }
        }
    }

    // Heartbeat de la estación
    const heartbeatTopic = `telemetria/${estacion.id}/sistema/heartbeat`;
    const heartbeatPayload = {
        estacion_id: estacion.id,
        estado: 'online',
        uptime: Math.floor(Math.random() * 86400 * 30), // Uptime random hasta 30 días
        timestamp
    };

    if (isConnected) {
        mqttClient.publish(heartbeatTopic, JSON.stringify(heartbeatPayload), { qos: 1 });
    }
}

/**
 * Inicializar conexión MQTT
 */
function inicializarMQTT() {
    console.log('📡 Conectando a broker MQTT:', MQTT_BROKER);

    mqttClient = mqtt.connect(MQTT_BROKER, {
        clientId: MQTT_CLIENT_ID,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000
    });

    mqttClient.on('connect', () => {
        isConnected = true;
        console.log('✅ Conectado a broker MQTT');
        console.log(`📋 Client ID: ${MQTT_CLIENT_ID}`);
    });

    mqttClient.on('error', (error) => {
        console.error('❌ Error MQTT:', error.message);
        isConnected = false;
    });

    mqttClient.on('disconnect', () => {
        isConnected = false;
        console.log('⚠️  Desconectado de broker MQTT');
    });

    mqttClient.on('reconnect', () => {
        console.log('🔄 Reconectando a broker MQTT...');
    });
}

/**
 * Inicializar conexión InfluxDB
 */
function inicializarInfluxDB() {
    if (!influxConfig.token) {
        console.log('⚠️  InfluxDB token no configurado, omitiendo almacenamiento en InfluxDB');
        return;
    }

    console.log('📊 Conectando a InfluxDB:', influxConfig.url);

    try {
        influxDB = new InfluxDB({
            url: influxConfig.url,
            token: influxConfig.token
        });

        writeApi = influxDB.getWriteApi(influxConfig.org, influxConfig.bucket, 'ns');
        writeApi.useDefaultTags({
            'sistema': 'sta-sb',
            'fuente': 'simulador'
        });

        console.log('✅ Conectado a InfluxDB');
    } catch (error) {
        console.error('❌ Error conectando a InfluxDB:', error.message);
        writeApi = null;
    }
}

/**
 * Ciclo principal de simulación
 */
function iniciarSimulacion() {
    console.log('🚀 ================================================');
    console.log('🚀 SIMULADOR DE ESTACIONES DE TELEMETRÍA');
    console.log('🚀 Sistema STA-SB - Tiempo Real');
    console.log('🚀 ================================================');
    console.log(`📍 Estaciones simuladas: ${estaciones.length}`);
    console.log(`🌡️  Tipos de sensores: ${Object.keys(tiposSensores).length}`);
    console.log(`⏱️  Frecuencia de envío: 5 segundos`);
    console.log('🚀 ================================================\n');

    // Inicializar conexiones
    inicializarMQTT();
    inicializarInfluxDB();

    let contadorCiclos = 0;
    let totalMensajes = 0;

    // Ciclo de publicación cada 5 segundos
    const intervalo = setInterval(() => {
        contadorCiclos++;
        const timestamp = new Date().toISOString();

        console.log(`\n⏰ Ciclo #${contadorCiclos} - ${timestamp}`);

        if (!isConnected) {
            console.log('⚠️  Esperando conexión MQTT...');
            return;
        }

        // Publicar datos de todas las estaciones
        estaciones.forEach(estacion => {
            publicarDatosEstacion(estacion);
            totalMensajes += 5; // ~5 mensajes por estación (sensores + heartbeat)
        });

        console.log(`✅ ${estaciones.length} estaciones procesadas`);
        console.log(`📨 Total mensajes enviados: ${totalMensajes.toLocaleString()}`);
        console.log(`📊 Mensajes/segundo promedio: ${(totalMensajes / (contadorCiclos * 5)).toFixed(2)}`);

        // Flush InfluxDB cada 10 ciclos
        if (writeApi && contadorCiclos % 10 === 0) {
            writeApi.flush()
                .then(() => console.log('💾 Datos guardados en InfluxDB'))
                .catch(err => console.error('❌ Error guardando en InfluxDB:', err.message));
        }

    }, 5000); // 5 segundos

    // Manejo de señales de terminación
    process.on('SIGINT', async () => {
        console.log('\n\n🛑 Deteniendo simulador...');
        clearInterval(intervalo);

        if (mqttClient) {
            mqttClient.end();
        }

        if (writeApi) {
            await writeApi.close();
        }

        console.log('✅ Simulador detenido correctamente');
        process.exit(0);
    });
}

// Iniciar simulación
iniciarSimulacion();
