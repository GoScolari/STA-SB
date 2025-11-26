#!/usr/bin/env node

/**
 * SIMULADOR MQTT PARA 30 ESTACIONES
 * Sistema de Telemetría San Javier (STA-SB)
 * Simula datos en tiempo real para testing EV3
 */

const mqtt = require('mqtt');

// Configuración MQTT
const mqttConfig = {
    host: 'localhost',
    port: 1883,
    keepalive: 60,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000
};

// Cliente MQTT
const client = mqtt.connect(`mqtt://${mqttConfig.host}:${mqttConfig.port}`, mqttConfig);

// 30 estaciones del proyecto (igual que en PostgreSQL)
const estaciones = [
    { id: 'EST001', nombre: 'Canal Principal Norte', tipo: 'primaria', prioridad: 'alta' },
    { id: 'EST002', nombre: 'Canal Principal Sur', tipo: 'primaria', prioridad: 'alta' },
    { id: 'EST003', nombre: 'Bocatoma General', tipo: 'bocatoma', prioridad: 'critica' },
    { id: 'EST004', nombre: 'Canal Secundario A1', tipo: 'secundaria', prioridad: 'media' },
    { id: 'EST005', nombre: 'Canal Secundario A2', tipo: 'secundaria', prioridad: 'media' },
    { id: 'EST006', nombre: 'Canal Secundario A3', tipo: 'secundaria', prioridad: 'media' },
    { id: 'EST007', nombre: 'Canal Secundario A4', tipo: 'secundaria', prioridad: 'media' },
    { id: 'EST008', nombre: 'Canal Secundario B1', tipo: 'secundaria', prioridad: 'media' },
    { id: 'EST009', nombre: 'Canal Secundario B2', tipo: 'secundaria', prioridad: 'media' },
    { id: 'EST010', nombre: 'Canal Secundario B3', tipo: 'secundaria', prioridad: 'media' },
    { id: 'EST011', nombre: 'Derivación Agrícola 1', tipo: 'terciaria', prioridad: 'baja' },
    { id: 'EST012', nombre: 'Derivación Agrícola 2', tipo: 'terciaria', prioridad: 'baja' },
    { id: 'EST013', nombre: 'Derivación Agrícola 3', tipo: 'terciaria', prioridad: 'baja' },
    { id: 'EST014', nombre: 'Derivación Agrícola 4', tipo: 'terciaria', prioridad: 'baja' },
    { id: 'EST015', nombre: 'Derivación Agrícola 5', tipo: 'terciaria', prioridad: 'baja' },
    { id: 'EST016', nombre: 'Compuerta Control 1', tipo: 'control', prioridad: 'alta' },
    { id: 'EST017', nombre: 'Compuerta Control 2', tipo: 'control', prioridad: 'alta' },
    { id: 'EST018', nombre: 'Compuerta Control 3', tipo: 'control', prioridad: 'alta' },
    { id: 'EST019', nombre: 'Monitor Ambiental 1', tipo: 'ambiental', prioridad: 'media' },
    { id: 'EST020', nombre: 'Monitor Ambiental 2', tipo: 'ambiental', prioridad: 'media' },
    { id: 'EST021', nombre: 'Monitor Ambiental 3', tipo: 'ambiental', prioridad: 'media' },
    { id: 'EST022', nombre: 'Medidor Caudal 1', tipo: 'medicion', prioridad: 'alta' },
    { id: 'EST023', nombre: 'Medidor Caudal 2', tipo: 'medicion', prioridad: 'alta' },
    { id: 'EST024', nombre: 'Medidor Caudal 3', tipo: 'medicion', prioridad: 'alta' },
    { id: 'EST025', nombre: 'Medidor Caudal 4', tipo: 'medicion', prioridad: 'alta' },
    { id: 'EST026', nombre: 'Estación Emergencia 1', tipo: 'emergencia', prioridad: 'critica' },
    { id: 'EST027', nombre: 'Estación Emergencia 2', tipo: 'emergencia', prioridad: 'critica' },
    { id: 'EST028', nombre: 'Estación Backup 1', tipo: 'backup', prioridad: 'media' },
    { id: 'EST029', nombre: 'Estación Backup 2', tipo: 'backup', prioridad: 'media' },
    { id: 'EST030', nombre: 'Estación Backup 3', tipo: 'backup', prioridad: 'media' }
];

// Tipos de sensores con rangos realistas
const tiposSensores = {
    nivel_agua: { min: 20, max: 180, unidad: 'cm', precision: 0.1, qos: 1 },
    temperatura: { min: 8, max: 35, unidad: '°C', precision: 0.1, qos: 0 },
    caudal: { min: 5, max: 85, unidad: 'L/s', precision: 0.5, qos: 1 },
    presion: { min: 0.5, max: 4.5, unidad: 'bar', precision: 0.01, qos: 1 }
};

// QoS por tipo de mensaje
const qosLevels = {
    sensores: 1,          // At least once - datos importantes
    estado: 0,            // At most once - heartbeat
    alertas: 2,           // Exactly once - crítico
    configuracion: 2      // Exactly once - comandos
};

// Estado de simulación
let simulacionActiva = false;
let contadorMensajes = 0;
let estacionesConectadas = 0;

// Función para generar valor realista de sensor
function generarValorSensor(tipo, estacion) {
    const sensor = tiposSensores[tipo];
    let valorBase = (sensor.min + sensor.max) / 2;
    
    // Variaciones según tipo de estación
    if (estacion.tipo === 'bocatoma' && tipo === 'caudal') {
        valorBase *= 1.5; // Bocatoma tiene más caudal
    } else if (estacion.tipo === 'terciaria' && tipo === 'caudal') {
        valorBase *= 0.6; // Derivaciones menores
    }
    
    // Variaciones temporales
    const hora = new Date().getHours();
    if (tipo === 'temperatura') {
        const factorHora = Math.sin((hora - 6) * Math.PI / 12);
        valorBase += factorHora * 6;
    } else if (tipo === 'caudal' && hora >= 6 && hora <= 20) {
        valorBase *= 1.3; // Mayor caudal durante el día
    }
    
    // Agregar ruido realista
    const ruido = (Math.random() - 0.5) * (sensor.max - sensor.min) * 0.15;
    let valor = valorBase + ruido;
    
    // Aplicar límites
    valor = Math.max(sensor.min, Math.min(sensor.max, valor));
    
    // Aplicar precisión
    return Math.round(valor / sensor.precision) * sensor.precision;
}

// Función para generar estado de sensor
function generarEstadoSensor() {
    const estados = ['operativo', 'alerta', 'mantenimiento', 'fallo'];
    const probabilidades = [0.85, 0.10, 0.04, 0.01];
    
    let acumulado = 0;
    const rand = Math.random();
    
    for (let i = 0; i < estados.length; i++) {
        acumulado += probabilidades[i];
        if (rand <= acumulado) return estados[i];
    }
    return 'operativo';
}

// Función para publicar datos de sensor
function publicarDatosSensor(estacion, tipoSensor) {
    const valor = generarValorSensor(tipoSensor, estacion);
    const estado = generarEstadoSensor();
    const timestamp = new Date().toISOString();
    
    const payload = {
        estacion_id: estacion.id,
        tipo_sensor: tipoSensor,
        valor: valor,
        unidad: tiposSensores[tipoSensor].unidad,
        estado: estado,
        timestamp: timestamp,
        calidad: estado === 'operativo' ? 'buena' : 'degradada',
        latencia_ms: Math.round(Math.random() * 50) + 10
    };
    
    const topic = `telemetria/${estacion.id}/sensores/${tipoSensor}`;
    const qos = qosLevels.sensores;
    
    client.publish(topic, JSON.stringify(payload), { qos }, (err) => {
        if (err) {
            console.error(`❌ Error publicando ${topic}:`, err.message);
        }
    });
    
    contadorMensajes++;
}

// Función para publicar heartbeat de estación
function publicarHeartbeat(estacion) {
    const payload = {
        estacion_id: estacion.id,
        estado: 'online',
        timestamp: new Date().toISOString(),
        uptime_seconds: Math.floor(Math.random() * 86400),
        memoria_libre_mb: Math.floor(Math.random() * 512) + 256,
        cpu_uso_pct: Math.floor(Math.random() * 80) + 10,
        red_signal_dbm: Math.floor(Math.random() * 20) - 70
    };
    
    const topic = `telemetria/${estacion.id}/estado/heartbeat`;
    const qos = qosLevels.estado;
    
    client.publish(topic, JSON.stringify(payload), { qos });
}

// Función para generar alertas ocasionales
function generarAlerta(estacion) {
    if (Math.random() > 0.02) return; // 2% probabilidad
    
    const tiposAlerta = [
        'nivel_critico',
        'sensor_desconectado', 
        'bateria_baja',
        'comunicacion_intermitente',
        'calibracion_requerida'
    ];
    
    const severidades = ['info', 'warning', 'error', 'critical'];
    
    const tipoAlerta = tiposAlerta[Math.floor(Math.random() * tiposAlerta.length)];
    const severidad = severidades[Math.floor(Math.random() * severidades.length)];
    
    const payload = {
        estacion_id: estacion.id,
        tipo_alerta: tipoAlerta,
        severidad: severidad,
        mensaje: `Alerta automática: ${tipoAlerta.replace('_', ' ')}`,
        timestamp: new Date().toISOString(),
        auto_resuelve: Math.random() > 0.3,
        ticket_id: `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    
    const topic = `telemetria/${estacion.id}/alertas/${severidad}`;
    const qos = qosLevels.alertas;
    
    client.publish(topic, JSON.stringify(payload), { qos });
    
    console.log(`🚨 Alerta generada: ${estacion.id} - ${tipoAlerta} (${severidad})`);
}

// Función principal de simulación
function ejecutarCicloSimulacion() {
    if (!simulacionActiva) return;
    
    for (const estacion of estaciones) {
        // Publicar datos de todos los sensores
        for (const tipoSensor of Object.keys(tiposSensores)) {
            publicarDatosSensor(estacion, tipoSensor);
        }
        
        // Heartbeat cada 30 segundos (solo algunas estaciones por ciclo)
        if (Math.random() > 0.8) {
            publicarHeartbeat(estacion);
        }
        
        // Generar alertas ocasionales
        generarAlerta(estacion);
    }
    
    // Mostrar estadísticas cada 10 ciclos
    if (contadorMensajes % 1000 === 0) {
        console.log(`📊 Mensajes enviados: ${contadorMensajes.toLocaleString()} | Estaciones: ${estacionesConectadas}`);
    }
}

// Eventos del cliente MQTT
client.on('connect', () => {
    console.log('🚀 ================================================');
    console.log('🚀 SIMULADOR MQTT - STA-SB EV3');
    console.log('🚀 ================================================');
    console.log(`🔗 Conectado a broker: ${mqttConfig.host}:${mqttConfig.port}`);
    console.log(`🏭 Estaciones a simular: ${estaciones.length}`);
    console.log(`🌡️  Tipos de sensores: ${Object.keys(tiposSensores).length}`);
    console.log(`⚙️  QoS configurado: ${JSON.stringify(qosLevels)}`);
    console.log('🚀 ================================================');
    console.log('🎯 TOPICS PRINCIPALES:');
    console.log('   📊 telemetria/+/sensores/+');
    console.log('   💓 telemetria/+/estado/heartbeat');
    console.log('   🚨 telemetria/+/alertas/+');
    console.log('   ⚙️  sistema/configuracion');
    console.log('🚀 ================================================');
    console.log('✅ Iniciando simulación...');
    
    estacionesConectadas = estaciones.length;
    simulacionActiva = true;
    
    // Publicar mensaje de inicio del sistema
    const mensajeInicio = {
        evento: 'sistema_iniciado',
        timestamp: new Date().toISOString(),
        estaciones_total: estaciones.length,
        version_sistema: '1.0.0',
        modo: 'simulacion'
    };
    
    client.publish('sistema/configuracion', JSON.stringify(mensajeInicio), { qos: qosLevels.configuracion });
    
    // Iniciar ciclos de simulación cada 5 segundos
    setInterval(ejecutarCicloSimulacion, 5000);
    
    // Estadísticas cada 30 segundos
    setInterval(() => {
        console.log(`📈 Total mensajes: ${contadorMensajes.toLocaleString()} | Estaciones activas: ${estacionesConectadas}`);
    }, 30000);
});

client.on('error', (err) => {
    console.error('❌ Error de conexión MQTT:', err.message);
});

client.on('offline', () => {
    console.log('⚠️  Desconectado del broker MQTT');
    simulacionActiva = false;
});

client.on('reconnect', () => {
    console.log('🔄 Reconectando al broker MQTT...');
});

// Manejo de señales del sistema
process.on('SIGINT', () => {
    console.log('\n🛑 Deteniendo simulador...');
    simulacionActiva = false;
    
    // Mensaje de cierre del sistema
    const mensajeCierre = {
        evento: 'sistema_detenido',
        timestamp: new Date().toISOString(),
        total_mensajes: contadorMensajes,
        duracion_segundos: process.uptime()
    };
    
    client.publish('sistema/configuracion', JSON.stringify(mensajeCierre), { qos: qosLevels.configuracion }, () => {
        client.end(true, () => {
            console.log('🚀 ================================================');
            console.log('✅ SIMULACIÓN COMPLETADA');
            console.log('🚀 ================================================');
            console.log(`📊 Total mensajes enviados: ${contadorMensajes.toLocaleString()}`);
            console.log(`⏱️  Duración: ${Math.floor(process.uptime())} segundos`);
            console.log(`🏭 Estaciones simuladas: ${estaciones.length}`);
            console.log('🚀 ================================================');
            process.exit(0);
        });
    });
});

process.on('uncaughtException', (err) => {
    console.error('❌ Error no capturado:', err.message);
    process.exit(1);
});

console.log('🚀 Iniciando simulador MQTT para STA-SB...');
console.log(`🔗 Conectando a ${mqttConfig.host}:${mqttConfig.port}...`);