#!/usr/bin/env node

/**
 * GENERADOR DE DATOS DE EJEMPLO PARA INFLUXDB
 * Sistema de Telemetría San Javier (STA-SB) 
 * Genera 20,000+ registros de datos realistas para testing EV3
 */

const { InfluxDB, Point } = require('@influxdata/influxdb-client');

// Configuración InfluxDB (usar tus credenciales exactas)
const influxConfig = {
    url: 'http://localhost:8086',
    token: 'Js7q0ElOcQ0M4bJEI1VAmwI5J3Xq32rRWX90Bndkjty5vjkiIDIfzt7eHGTuj2uh65eUsstZsWLnt5r0vAS51Q==',
    org: 'CEA_Project_SPA',
    bucket: 'sta_sb_telemetria'
};

// Inicializar cliente InfluxDB
const influxDB = new InfluxDB({ url: influxConfig.url, token: influxConfig.token });
const writeApi = influxDB.getWriteApi(influxConfig.org, influxConfig.bucket);

// Configuración de puntos de escritura
writeApi.useDefaultTags({ 
    'sistema': 'sta-sb',
    'version': '1.0',
    'region': 'san_javier',
    'proyecto': 'ev3_telemetria'
});

// 10 estaciones principales para generar datos
const estaciones = [
    { id: 'EST001', nombre: 'Canal Principal Norte', tipo: 'primaria' },
    { id: 'EST002', nombre: 'Canal Principal Sur', tipo: 'primaria' },
    { id: 'EST003', nombre: 'Bocatoma General', tipo: 'bocatoma' },
    { id: 'EST004', nombre: 'Canal Secundario A1', tipo: 'secundaria' },
    { id: 'EST005', nombre: 'Canal Secundario A2', tipo: 'secundaria' },
    { id: 'EST006', nombre: 'Canal Secundario A3', tipo: 'secundaria' },
    { id: 'EST007', nombre: 'Canal Secundario A4', tipo: 'secundaria' },
    { id: 'EST008', nombre: 'Canal Secundario B1', tipo: 'secundaria' },
    { id: 'EST009', nombre: 'Canal Secundario B2', tipo: 'secundaria' },
    { id: 'EST010', nombre: 'Canal Secundario B3', tipo: 'secundaria' }
];

// Tipos de sensores por estación
const tiposSensores = {
    nivel_agua: { min: 20, max: 180, unidad: 'cm', precision: 0.1, variacion: 5.0 },
    temperatura: { min: 8, max: 35, unidad: '°C', precision: 0.1, variacion: 2.0 },
    caudal: { min: 5, max: 85, unidad: 'L/s', precision: 0.5, variacion: 8.0 },
    presion: { min: 0.5, max: 4.5, unidad: 'bar', precision: 0.01, variacion: 0.3 }
};

// Función para generar valor realista de sensor
function generarValorSensor(tipo, horaDelDia) {
    const sensor = tiposSensores[tipo];
    let valorBase = (sensor.min + sensor.max) / 2;
    
    // Variaciones por hora del día
    if (tipo === 'temperatura') {
        // Temperatura sigue curva sinusoidal (más alta al mediodía)
        const factorHora = Math.sin((horaDelDia - 6) * Math.PI / 12);
        valorBase += factorHora * 8;
    } else if (tipo === 'caudal') {
        // Caudal mayor durante el día (riego activo)
        if (horaDelDia >= 6 && horaDelDia <= 20) {
            valorBase *= 1.4;
        } else {
            valorBase *= 0.7;
        }
    }
    
    // Agregar variación aleatoria
    const variacion = (Math.random() - 0.5) * sensor.variacion;
    let valor = valorBase + variacion;
    
    // Aplicar límites
    valor = Math.max(sensor.min, Math.min(sensor.max, valor));
    
    // Aplicar precisión
    return Math.round(valor / sensor.precision) * sensor.precision;
}

// Función para generar calidad de datos realista
function generarCalidadDatos() {
    const rand = Math.random();
    if (rand < 0.75) return 'excelente';
    if (rand < 0.90) return 'buena';
    if (rand < 0.98) return 'regular';
    return 'mala';
}

// Función principal para generar datos
async function generarDatosPrueba() {
    console.log('🚀 ================================================');
    console.log('🚀 GENERADOR DATOS INFLUXDB - STA-SB EV3');
    console.log('🚀 ================================================');
    console.log(`📊 Organización: ${influxConfig.org}`);
    console.log(`🗄️  Bucket: ${influxConfig.bucket}`);
    console.log(`⏱️  Período: Últimos 30 días`);
    console.log(`🏭 Estaciones: ${estaciones.length}`);
    console.log('🚀 ================================================');

    const fechaFinal = new Date();
    const fechaInicial = new Date(fechaFinal.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 días atrás
    
    let totalPuntos = 0;
    let tendenciaActual = {};

    console.log('📊 Generando datos de sensores...');

    // Generar datos cada 5 minutos durante 30 días
    for (let fecha = new Date(fechaInicial); fecha <= fechaFinal; fecha.setMinutes(fecha.getMinutes() + 5)) {
        const horaDelDia = fecha.getHours();
        
        // Generar datos para cada estación
        for (const estacion of estaciones) {
            // Generar datos para cada tipo de sensor
            for (const tipoSensor of Object.keys(tiposSensores)) {
                const valor = generarValorSensor(tipoSensor, horaDelDia);
                const calidad = generarCalidadDatos();
                const estadoSensor = calidad !== 'mala' ? 'operativo' : 'alerta';

                // Crear punto de datos para InfluxDB
                const point = new Point('datos_sensor')
                    .tag('estacion_id', estacion.id)
                    .tag('tipo_sensor', tipoSensor)
                    .tag('estacion_tipo', estacion.tipo)
                    .tag('calidad_dato', calidad)
                    .tag('estado_sensor', estadoSensor)
                    .floatField('valor', valor)
                    .stringField('unidad', tiposSensores[tipoSensor].unidad)
                    .stringField('ubicacion', estacion.nombre.toLowerCase().replace(/\s+/g, '_'))
                    .stringField('sensor_id', `${estacion.id}_${tipoSensor.toUpperCase()}`)
                    .timestamp(fecha);

                writeApi.writePoint(point);
                totalPuntos++;

                // Generar eventos del sistema ocasionalmente (5% probabilidad)
                if (Math.random() < 0.05) {
                    const eventos = ['calibracion_sensor', 'mantenimiento_preventivo', 'cambio_configuracion', 'reinicio_sistema', 'actualizacion_firmware'];
                    const evento = eventos[Math.floor(Math.random() * eventos.length)];
                    
                    const eventoPoint = new Point('eventos_sistema')
                        .tag('estacion_id', estacion.id)
                        .tag('tipo_evento', evento)
                        .tag('severidad', 'informacion')
                        .stringField('accion', evento.replace('_', ' '))
                        .stringField('detalles', `Evento automático: ${evento}`)
                        .stringField('usuario_sistema', 'sistema_automatico')
                        .timestamp(fecha);

                    writeApi.writePoint(eventoPoint);
                    totalPuntos++;
                }
            }
        }

        // Mostrar progreso cada 1000 puntos
        if (totalPuntos % 1000 === 0) {
            const progreso = ((fecha - fechaInicial) / (fechaFinal - fechaInicial) * 100).toFixed(1);
            console.log(`   📈 Progreso: ${progreso}% - ${totalPuntos.toLocaleString()} registros generados`);
        }
    }

    console.log('⚡ Finalizando escritura a InfluxDB...');
    
    try {
        await writeApi.close();
        console.log('🚀 ================================================');
        console.log('✅ GENERACIÓN COMPLETADA EXITOSAMENTE');
        console.log('🚀 ================================================');
        console.log(`📊 Total registros generados: ${totalPuntos.toLocaleString()}`);
        console.log(`🗄️  Bucket de destino: ${influxConfig.bucket}`);
        console.log(`📅 Período de datos: ${fechaInicial.toLocaleString()} - ${fechaFinal.toLocaleString()}`);
        console.log(`🏭 Estaciones procesadas: ${estaciones.length}`);
        console.log(`🌡️  Tipos de sensores: ${Object.keys(tiposSensores).length}`);
        console.log('🚀 ================================================');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al escribir a InfluxDB:', error.message);
        process.exit(1);
    }
}

// Ejecutar generador
generarDatosPrueba();