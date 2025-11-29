#!/usr/bin/env node

/**
 * SCRIPT DE PRUEBA END-TO-END DEL SISTEMA
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 *
 * Prueba todos los componentes del sistema:
 * - PostgreSQL
 * - InfluxDB
 * - MQTT Broker
 * - Backend API
 * - WebSocket
 */

require('dotenv').config();
const axios = require('axios');
const mqtt = require('mqtt');
const WebSocket = require('ws');
const { InfluxDB } = require('@influxdata/influxdb-client');
const { Client } = require('pg');

// Configuración
const CONFIG = {
    backend: process.env.BACKEND_URL || 'http://localhost:5000',
    mqtt: process.env.MQTT_BROKER || 'mqtt://localhost:1883',
    postgres: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'sta_sb',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || ''
    },
    influx: {
        url: process.env.INFLUX_URL || 'http://localhost:8086',
        token: process.env.INFLUX_TOKEN || '',
        org: process.env.INFLUX_ORG || 'CEA_Project_SPA',
        bucket: process.env.INFLUX_BUCKET || 'sta_sb_telemetria'
    }
};

// Resultados de tests
const resultados = {
    exitosos: 0,
    fallidos: 0,
    total: 0,
    tests: []
};

/**
 * Función helper para ejecutar test
 */
async function ejecutarTest(nombre, testFn) {
    resultados.total++;
    process.stdout.write(`\n🧪 Test: ${nombre}... `);

    try {
        await testFn();
        process.stdout.write('✅ PASÓ\n');
        resultados.exitosos++;
        resultados.tests.push({ nombre, resultado: 'PASÓ' });
    } catch (error) {
        process.stdout.write(`❌ FALLÓ\n`);
        console.error(`   Error: ${error.message}`);
        resultados.fallidos++;
        resultados.tests.push({ nombre, resultado: 'FALLÓ', error: error.message });
    }
}

/**
 * TEST 1: Conexión a PostgreSQL
 */
async function testPostgreSQL() {
    const client = new Client(CONFIG.postgres);
    await client.connect();
    const result = await client.query('SELECT NOW()');
    await client.end();

    if (!result.rows || result.rows.length === 0) {
        throw new Error('No se pudo consultar PostgreSQL');
    }
}

/**
 * TEST 2: Conexión a InfluxDB
 */
async function testInfluxDB() {
    if (!CONFIG.influx.token) {
        throw new Error('Token de InfluxDB no configurado');
    }

    const influxDB = new InfluxDB({ url: CONFIG.influx.url, token: CONFIG.influx.token });
    const queryApi = influxDB.getQueryApi(CONFIG.influx.org);

    const query = `
        from(bucket: "${CONFIG.influx.bucket}")
            |> range(start: -1h)
            |> limit(n: 1)
    `;

    return new Promise((resolve, reject) => {
        let hasData = false;

        queryApi.queryRows(query, {
            next(row, tableMeta) {
                hasData = true;
            },
            error(error) {
                reject(new Error(`Error consultando InfluxDB: ${error.message}`));
            },
            complete() {
                // Es válido que no haya datos aún
                resolve();
            }
        });
    });
}

/**
 * TEST 3: Backend API Health Check
 */
async function testBackendHealth() {
    const response = await axios.get(`${CONFIG.backend}/api/health`, {
        timeout: 5000
    });

    if (response.status !== 200 || !response.data.success) {
        throw new Error('Backend health check falló');
    }
}

/**
 * TEST 4: Backend API Info
 */
async function testBackendInfo() {
    const response = await axios.get(`${CONFIG.backend}/api`, {
        timeout: 5000
    });

    if (response.status !== 200 || !response.data.success) {
        throw new Error('Backend API info falló');
    }

    if (!response.data.version) {
        throw new Error('Respuesta de API sin versión');
    }
}

/**
 * TEST 5: Documentación Swagger accesible
 */
async function testSwagger() {
    const response = await axios.get(`${CONFIG.backend}/api-docs/`, {
        timeout: 5000,
        headers: { 'Accept': 'text/html' }
    });

    if (response.status !== 200) {
        throw new Error('Swagger no accesible');
    }
}

/**
 * TEST 6: Conexión MQTT Broker
 */
async function testMQTTBroker() {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            client.end();
            reject(new Error('Timeout conectando a MQTT'));
        }, 5000);

        const client = mqtt.connect(CONFIG.mqtt, {
            connectTimeout: 4000
        });

        client.on('connect', () => {
            clearTimeout(timeout);
            client.end();
            resolve();
        });

        client.on('error', (error) => {
            clearTimeout(timeout);
            reject(error);
        });
    });
}

/**
 * TEST 7: Publicar y recibir mensaje MQTT
 */
async function testMQTTPubSub() {
    return new Promise((resolve, reject) => {
        const testTopic = 'test/telemetria/sta-sb';
        const testMessage = JSON.stringify({ test: true, timestamp: Date.now() });

        const timeout = setTimeout(() => {
            subscriber.end();
            publisher.end();
            reject(new Error('Timeout esperando mensaje MQTT'));
        }, 10000);

        // Suscriptor
        const subscriber = mqtt.connect(CONFIG.mqtt);
        subscriber.on('connect', () => {
            subscriber.subscribe(testTopic, { qos: 1 });
        });

        subscriber.on('message', (topic, message) => {
            if (topic === testTopic && message.toString() === testMessage) {
                clearTimeout(timeout);
                subscriber.end();
                publisher.end();
                resolve();
            }
        });

        subscriber.on('error', (error) => {
            clearTimeout(timeout);
            reject(error);
        });

        // Publicador (después de 1 segundo)
        setTimeout(() => {
            const publisher = mqtt.connect(CONFIG.mqtt);
            publisher.on('connect', () => {
                publisher.publish(testTopic, testMessage, { qos: 1 });
            });
        }, 1000);
    });
}

/**
 * TEST 8: Consultar estaciones via API (requiere autenticación - opcional)
 */
async function testAPIEstaciones() {
    try {
        // Intentar sin autenticación (debería fallar con 401)
        await axios.get(`${CONFIG.backend}/api/estaciones`, {
            timeout: 5000
        });
        throw new Error('API de estaciones debería requerir autenticación');
    } catch (error) {
        if (error.response && error.response.status === 401) {
            // Esperado: No autorizado
            return;
        }
        throw error;
    }
}

/**
 * Función principal de tests
 */
async function ejecutarTests() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 SUITE DE PRUEBAS END-TO-END - STA-SB');
    console.log('='.repeat(60));
    console.log('📅 Fecha:', new Date().toISOString());
    console.log('🌍 Entorno:', process.env.NODE_ENV || 'development');
    console.log('='.repeat(60));

    // Tests de Base de Datos
    console.log('\n📊 TESTS DE BASE DE DATOS');
    console.log('-'.repeat(60));
    await ejecutarTest('Conexión a PostgreSQL', testPostgreSQL);
    await ejecutarTest('Conexión a InfluxDB', testInfluxDB);

    // Tests de Backend
    console.log('\n🌐 TESTS DE BACKEND API');
    console.log('-'.repeat(60));
    await ejecutarTest('Health Check Backend', testBackendHealth);
    await ejecutarTest('API Info Endpoint', testBackendInfo);
    await ejecutarTest('Documentación Swagger', testSwagger);
    await ejecutarTest('Protección de Rutas (Auth)', testAPIEstaciones);

    // Tests de MQTT
    console.log('\n📡 TESTS DE MQTT');
    console.log('-'.repeat(60));
    await ejecutarTest('Conexión a MQTT Broker', testMQTTBroker);
    await ejecutarTest('Publicar/Suscribir MQTT', testMQTTPubSub);

    // Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE TESTS');
    console.log('='.repeat(60));
    console.log(`✅ Tests exitosos: ${resultados.exitosos}/${resultados.total}`);
    console.log(`❌ Tests fallidos:  ${resultados.fallidos}/${resultados.total}`);
    console.log(`📈 Tasa de éxito:   ${((resultados.exitosos / resultados.total) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));

    // Detalle de tests fallidos
    if (resultados.fallidos > 0) {
        console.log('\n❌ TESTS FALLIDOS:');
        resultados.tests
            .filter(t => t.resultado === 'FALLÓ')
            .forEach(t => {
                console.log(`  • ${t.nombre}`);
                console.log(`    Error: ${t.error}`);
            });
    }

    console.log('\n');

    // Exit code basado en resultados
    process.exit(resultados.fallidos > 0 ? 1 : 0);
}

// Ejecutar tests
ejecutarTests().catch(error => {
    console.error('\n❌ Error fatal ejecutando tests:', error.message);
    process.exit(1);
});
