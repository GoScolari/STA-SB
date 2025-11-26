# GUÍA DE IMPLEMENTACIÓN EV3
## PROYECTO: SISTEMA INTEGRAL DE TELEMETRÍA PARA CANALES DE RIEGO SAN JAVIER

**Proyecto de Título:** Ingeniería en Informática  
**Estudiantes:** Gonzalo Scolari, Xavier Barrera  
**Tutor:** Dragustín Fernández  
**Empresa:** CEA Project SPA  
**Cliente:** OUA San Javier  

---

## ÍNDICE

1. [RESUMEN EJECUTIVO](#1-resumen-ejecutivo)
2. [OBJETIVOS DE LA EV3](#2-objetivos-de-la-ev3)
3. [METODOLOGÍA DE DESARROLLO](#3-metodología-de-desarrollo)
4. [RUTA DE AVANCE DETALLADA](#4-ruta-de-avance-detallada)
5. [ARQUITECTURA Y TECNOLOGÍAS](#5-arquitectura-y-tecnologías)
6. [IMPLEMENTACIÓN VS SIMULACIÓN](#6-implementación-vs-simulación)
7. [ENTREGABLES Y EVIDENCIAS](#7-entregables-y-evidencias)
8. [CRITERIOS DE EVALUACIÓN](#8-criterios-de-evaluación)
9. [RECURSOS NECESARIOS](#9-recursos-necesarios)
10. [CRONOGRAMA DE DESARROLLO](#10-cronograma-de-desarrollo)
11. [GESTIÓN DE RIESGOS](#11-gestión-de-riesgos)
12. [CONCLUSIONES](#12-conclusiones)

---

## 1. RESUMEN EJECUTIVO

### 1.1 Contexto del Proyecto
La EV3 (Evaluación 3) corresponde a la fase de **Implementación y Pruebas** del Sistema Integral de Telemetría para Canales de Riego en San Javier. Esta evaluación debe demostrar la materialización práctica de todo lo planificado en las evaluaciones anteriores (EV1: Antecedentes y EV2: Planificación y Diseño).

### 1.2 Alcance de la EV3
La EV3 debe evidenciar la implementación de los 4 objetivos específicos del proyecto mediante:
- Desarrollo de prototipos funcionales
- Documentación técnica completa
- Evidencias de funcionamiento
- Evaluación de cumplimiento de objetivos
- Análisis de resultados obtenidos

### 1.3 Estrategia de Implementación
Se adopta una **estrategia híbrida** que combina:
- **Desarrollo real** de componentes de software críticos
- **Simulación controlada** de hardware y sensores
- **Evidencias tangibles** de funcionamiento
- **Documentación profesional** como entregable real

---

## 2. OBJETIVOS DE LA EV3

### 2.1 Objetivo General de la EV3
Implementar y validar funcionalmente el Sistema Integral de Telemetría mediante el desarrollo de prototipos que demuestren el cumplimiento de los 4 objetivos específicos planificados, generando evidencias tangibles de funcionalidad, rendimiento y viabilidad técnica.

### 2.2 Objetivos Específicos de la EV3

#### 2.2.1 Demostrar Implementación del Objetivo 1
**Sistema de Adquisición y Transmisión de Datos**
- Desarrollar middleware funcional de integración
- Implementar base de datos híbrida (PostgreSQL + InfluxDB)
- Crear sistema de comunicación MQTT
- Validar prototipos con datos simulados realistas

#### 2.2.2 Demostrar Implementación del Objetivo 2  
**Plataforma Web para Monitoreo y Control Remoto**
- Desarrollar frontend React.js completo y funcional
- Implementar backend Node.js con APIs REST
- Crear sistema de gestión de usuarios
- Desarrollar módulo de reportes y analíticas

#### 2.2.3 Demostrar Implementación del Objetivo 3
**Sistema de Ciberseguridad y Cumplimiento Normativo**
- Implementar infraestructura de seguridad
- Desarrollar control de acceso basado en roles
- Crear módulo de cumplimiento normativo
- Establecer plan de contingencia

#### 2.2.4 Demostrar Implementación del Objetivo 4
**Programa de Capacitación y Transferencia**
- Desarrollar material didáctico completo
- Crear sistema de soporte técnico
- Generar documentación de transferencia
- Establecer procedimientos de mantenimiento

---

## 3. METODOLOGÍA DE DESARROLLO

### 3.1 Enfoque Metodológico: OPCIÓN 2 HÍBRIDA

#### 3.1.1 Descripción del Enfoque
```
FASE 1: Estructura base (1 sesión)
→ FASE 2: Implementación iterativa (4 sesiones)  
→ FASE 3: Consolidación (1 sesión)
→ FASE 4: Presentación (1 sesión)
```

#### 3.1.2 Ventajas del Enfoque Híbrido
- ✅ **Coherencia garantizada:** Cada implementación se documenta inmediatamente
- ✅ **Flexibilidad:** Posibilidad de ajustes sobre la marcha
- ✅ **Evidencias frescas:** Documentación mientras se implementa
- ✅ **Control de calidad:** Revisión punto por punto
- ✅ **Eficiencia:** No hay reescritura, solo consolidación

### 3.2 Principios de Desarrollo

#### 3.2.1 Coherencia Arquitectónica
- Usar **exactamente** la arquitectura definida en EV2
- Mantener consistencia con tecnologías especificadas
- Respetar diseños y especificaciones previas

#### 3.2.2 Orientación a Evidencias
- Cada implementación debe generar **evidencias tangibles**
- Priorizar **funcionalidad visible** sobre complejidad interna
- Documentar **proceso y resultados** simultáneamente

#### 3.2.3 Viabilidad Técnica
- Balancear **ambición** con **tiempo disponible**
- Priorizar **componentes críticos** del sistema
- Asegurar **demostrabilidad** de resultados

---

## 4. RUTA DE AVANCE DETALLADA

### 4.1 FASE 1: Estructura Base del Informe (1 sesión)

#### 4.1.1 Objetivos de la Fase
- Establecer estructura detallada del informe EV3
- Definir métricas de éxito por objetivo específico
- Preparar entorno de desarrollo

#### 4.1.2 Actividades Específicas
1. **Definición de Objetivos y Entregables**
   - Transcribir objetivo general del proyecto
   - Listar 4 objetivos específicos con detalle
   - Definir entregables por objetivo (4 entregables x 4 objetivos = 16 entregables)
   - Establecer criterios de evaluación

2. **Preparación del Entorno**
   - Configurar estructura de carpetas del proyecto
   - Preparar repositorio Git
   - Configurar entorno de desarrollo (VS Code, Node.js, React)
   - Instalar herramientas necesarias

3. **Planificación de Implementación**
   - Definir prioridades de desarrollo
   - Establecer cronograma de 4 sesiones de implementación
   - Identificar dependencias entre componentes

#### 4.1.3 Entregables de la Fase
- Estructura completa del informe EV3
- Entorno de desarrollo configurado
- Plan detallado de implementación

### 4.2 FASE 2: Implementación Iterativa (4 sesiones)

#### 4.2.1 Sesión 1: Objetivo 1 - Sistema de Adquisición y Transmisión

**Duración:** 1 sesión (2-3 horas)

**Implementaciones Reales:**
- ✅ Configurar PostgreSQL con esquema de datos
- ✅ Configurar InfluxDB para series temporales
- ✅ Desarrollar middleware Node.js básico
- ✅ Crear broker MQTT local con Mosquitto
- ✅ Desarrollar simulador de datos de sensores

**Evidencias a Generar:**
- Base de datos funcionando con datos de prueba
- Screenshots de configuraciones
- Código fuente documentado
- Videos del middleware procesando datos
- Logs de comunicación MQTT

**Documentación Inmediata:**
- Sección 3.3.1 del informe completada
- Procedimientos de instalación y configuración
- Análisis de resultados obtenidos

#### 4.2.2 Sesión 2: Objetivo 2 - Plataforma Web

**Duración:** 1 sesión (2-3 horas)

**Implementaciones Reales:**
- ✅ Desarrollar backend Express.js con APIs REST
- ✅ Crear frontend React.js con dashboard
- ✅ Implementar autenticación JWT
- ✅ Desarrollar componentes de visualización
- ✅ Integrar datos desde InfluxDB/PostgreSQL

**Evidencias a Generar:**
- Aplicación web funcionando completamente
- Screenshots de todas las interfaces
- Videos demostrando funcionalidades
- Código fuente completo
- Tests de APIs funcionando

**Documentación Inmediata:**
- Sección 3.3.2 del informe completada
- Manual de usuario de la aplicación
- Documentación técnica de APIs

#### 4.2.3 Sesión 3: Objetivo 3 - Ciberseguridad

**Duración:** 1 sesión (2-3 horas)

**Implementaciones Reales:**
- ✅ Configurar HTTPS con certificados SSL
- ✅ Implementar control de acceso basado en roles (RBAC)
- ✅ Crear sistema de auditoría y logs
- ✅ Desarrollar módulo de backup automatizado
- ✅ Implementar validaciones de seguridad

**Evidencias a Generar:**
- Sistema de autenticación funcionando
- Logs de auditoría completos
- Certificados SSL configurados
- Documentación de seguridad
- Plan de contingencia documentado

**Documentación Inmediata:**
- Sección 3.3.3 del informe completada
- Políticas de seguridad documentadas
- Procedimientos de respuesta a incidentes

#### 4.2.4 Sesión 4: Objetivo 4 - Capacitación y Transferencia

**Duración:** 1 sesión (2-3 horas)

**Implementaciones Reales:**
- ✅ Crear manuales de usuario ilustrados (PDF)
- ✅ Desarrollar videos tutoriales
- ✅ Generar documentación técnica completa
- ✅ Crear sistema de tickets de soporte
- ✅ Preparar material de capacitación

**Evidencias a Generar:**
- Manuales completos con screenshots
- Videos explicativos paso a paso
- Documentación de código fuente
- Plan de capacitación estructurado
- Sistema de soporte funcionando

**Documentación Inmediata:**
- Sección 3.3.4 del informe completada
- Material didáctico completo
- Plan de transferencia de conocimiento

### 4.3 FASE 3: Consolidación (1 sesión)

#### 4.3.1 Objetivos de la Fase
- Revisar coherencia total del informe
- Integrar todas las implementaciones
- Realizar pruebas finales del sistema
- Ajustar y pulir documentación

#### 4.3.2 Actividades Específicas
1. **Revisión de Coherencia**
   - Verificar alineación con EV1 y EV2
   - Revisar cumplimiento de objetivos específicos
   - Validar evidencias generadas

2. **Integración Final**
   - Consolidar código fuente en repositorio
   - Unificar documentación
   - Preparar demo del sistema completo

3. **Pulimiento y Ajustes**
   - Corregir inconsistencias
   - Mejorar presentación de evidencias
   - Finalizar conclusiones por objetivo

#### 4.3.3 Entregables de la Fase
- Informe EV3 completo y consolidado
- Sistema integrado funcionando
- Demo completa preparada

### 4.4 FASE 4: Presentación PPT (1 sesión)

#### 4.4.1 Objetivos de la Fase
- Crear presentación PPT basada en evidencias reales
- Preparar demo en vivo del sistema
- Ensayar presentación final

#### 4.4.2 Estructura de la PPT
- Introducción al proyecto
- Objetivos del proyecto (general + 4 específicos)
- Implementación por objetivo con evidencias
- Demostración en vivo
- Conclusiones y logros obtenidos

---

## 5. ARQUITECTURA Y TECNOLOGÍAS

### 5.1 Arquitectura General (100% según EV2)

#### 5.1.1 Arquitectura de 3 Capas
```
┌─────────────────────────────────────┐
│         CAPA PRESENTACIÓN           │
│      React.js + TypeScript          │
│         Material-UI                 │
├─────────────────────────────────────┤
│       CAPA LÓGICA NEGOCIO          │
│       Node.js + Express.js          │
│         Patrón MVC                  │
├─────────────────────────────────────┤
│       CAPA PERSISTENCIA            │
│    PostgreSQL + InfluxDB            │
│       Datos Híbridos                │
└─────────────────────────────────────┘
```

### 5.2 Stack Tecnológico Definido

#### 5.2.1 Frontend
- **React.js 18.x** con **TypeScript 5.x** 
- **Material-UI** para diseño responsive
- **Chart.js** para visualización de datos
- **React Context API** + **React Query**
- **Socket.io** cliente para tiempo real

#### 5.2.2 Backend  
- **Node.js 18 LTS** con **Express.js 4.x**
- **Sequelize** ORM para PostgreSQL
- **Socket.io** servidor para WebSocket
- **MQTT.js** para comunicación IoT
- **Passport.js** para autenticación JWT
- **Multer** para manejo de archivos

#### 5.2.3 Bases de Datos
- **PostgreSQL 14.x** para datos relacionales
- **InfluxDB 2.x** para series temporales
- **Redis** para cache y sesiones

#### 5.2.4 Infraestructura
- **AWS EC2** para hosting del backend
- **AWS RDS** para PostgreSQL
- **Protocolo MQTT** sobre 4G/LTE
- **Certificados SSL/TLS 1.3**

### 5.3 Componentes del Sistema

#### 5.3.1 Módulos Principales
1. **Middleware de Integración** (Node.js)
2. **API REST** (Express.js + Sequelize)  
3. **Dashboard Web** (React.js + Material-UI)
4. **Sistema de Usuarios** (JWT + RBAC)
5. **Módulo de Reportes** (PDF/Excel)
6. **Comunicación MQTT** (Mosquitto)
7. **Monitoreo y Logs** (Winston)

#### 5.3.2 Integraciones Críticas
- Frontend ↔ Backend (HTTP REST + WebSocket)
- Backend ↔ PostgreSQL (Sequelize ORM)
- Backend ↔ InfluxDB (Cliente nativo)
- Estaciones ↔ Servidor (MQTT over 4G)
- Sistema ↔ DGA (Reportes automatizados)

---

## 6. IMPLEMENTACIÓN VS SIMULACIÓN

### 6.1 Criterios de Decisión

#### 6.1.1 SE IMPLEMENTA REALMENTE:
✅ **Componentes de software** que pueden desarrollarse completamente  
✅ **Funcionalidades demostrables** en tiempo limitado  
✅ **Integraciones críticas** del sistema  
✅ **Documentación** como entregable profesional  

#### 6.1.2 SE SIMULA CONTROLADAMENTE:
🔄 **Hardware físico** (sensores, microcontroladores)  
🔄 **Comunicación 4G** real en campo  
🔄 **30 estaciones** físicas distribuidas  
🔄 **Condiciones ambientales** extremas  

### 6.2 Detalle por Objetivo

#### 6.2.1 OBJETIVO 1: Sistema de Adquisición y Transmisión

**IMPLEMENTACIÓN REAL:**
- ✅ Base de datos PostgreSQL con esquema completo
- ✅ InfluxDB configurado con series temporales
- ✅ Middleware Node.js para procesamiento de datos
- ✅ Broker MQTT Mosquitto funcionando
- ✅ APIs REST para manejo de datos
- ✅ Simulador de datos realistas de sensores
- ✅ Sistema de validación y transformación

**SIMULACIÓN CONTROLADA:**
- 🔄 Sensores de presión diferencial 4-20mA
- 🔄 Finales de carrera magnéticos
- 🔄 Microcontroladores ARM Cortex-M4  
- 🔄 Comunicación 4G/LTE real
- 🔄 30 estaciones distribuidas geográficamente

**EVIDENCIAS ESPECÍFICAS:**
- Base de datos con 10,000+ registros de prueba
- Screenshots de configuración PostgreSQL/InfluxDB
- Video del middleware procesando datos en tiempo real
- Código fuente completo documentado
- Logs de comunicación MQTT funcionando
- Gráficos de series temporales con datos simulados

#### 6.2.2 OBJETIVO 2: Plataforma Web

**IMPLEMENTACIÓN REAL:**
- ✅ Frontend React.js completamente funcional
- ✅ Backend Express.js con todas las APIs
- ✅ Sistema de autenticación JWT completo
- ✅ Dashboard responsive con gráficos en tiempo real
- ✅ Módulo de usuarios con RBAC funcional
- ✅ Generación de reportes PDF/Excel
- ✅ WebSocket para actualizaciones en tiempo real

**SIMULACIÓN CONTROLADA:**
- 🔄 Datos de 30 estaciones reales
- 🔄 Comandos de control de compuertas reales
- 🔄 Retroalimentación de hardware físico

**EVIDENCIAS ESPECÍFICAS:**
- Aplicación web 100% funcional con todas las vistas
- Videos navegando por todas las funcionalidades
- Screenshots de dashboard con datos en tiempo real
- Reportes PDF/Excel generados con datos simulados
- Código fuente frontend + backend completo
- Tests unitarios pasando para APIs críticas

#### 6.2.3 OBJETIVO 3: Ciberseguridad

**IMPLEMENTACIÓN REAL:**
- ✅ HTTPS con certificados SSL configurado
- ✅ Autenticación JWT con refresh tokens
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Sistema de auditoría con logs detallados
- ✅ Encriptación de passwords con bcrypt
- ✅ Validación de datos de entrada
- ✅ Rate limiting para APIs

**SIMULACIÓN CONTROLADA:**
- 🔄 Ataques reales de ciberseguridad
- 🔄 Penetration testing profesional
- 🔄 Certificación ISO 27001

**EVIDENCIAS ESPECÍFICAS:**
- Certificados SSL funcionando en HTTPS
- Screenshots de sistema de roles funcionando
- Logs de auditoría con acciones registradas
- Documentación completa de políticas de seguridad
- Tests de seguridad automatizados
- Plan de contingencia y recuperación documentado

#### 6.2.4 OBJETIVO 4: Capacitación y Transferencia

**IMPLEMENTACIÓN REAL:**
- ✅ Manuales de usuario ilustrados (PDF)
- ✅ Videos tutoriales paso a paso
- ✅ Documentación técnica completa del código
- ✅ Sistema de tickets de soporte web
- ✅ Base de conocimientos (FAQ)
- ✅ Plan de capacitación estructurado
- ✅ Material de presentación (PPT)

**SIMULACIÓN CONTROLADA:**
- 🔄 Capacitación real a 15-20 operadores
- 🔄 3 meses de soporte presencial
- 🔄 Certificación de competencias

**EVIDENCIAS ESPECÍFICAS:**
- Manuales PDF con screenshots reales del sistema
- Videos de 20-30 minutos mostrando uso del sistema
- Documentación técnica de arquitectura completa
- Portal web de soporte funcionando
- Plan de capacitación con cronograma detallado
- Material didáctico listo para usar

---

## 7. ENTREGABLES Y EVIDENCIAS

### 7.1 Entregables del Informe EV3

#### 7.1.1 Estructura del Informe (formato DOCX)
```
1. Objetivo general y específicos del proyecto
2. Entregables de cada objetivo específico  
3. Implementación de la solución:
   3.1. Implementación del Objetivo 1 (10-15 páginas)
   3.2. Implementación del Objetivo 2 (10-15 páginas)
   3.3. Implementación del Objetivo 3 (10-15 páginas)
   3.4. Implementación del Objetivo 4 (10-15 páginas)
4. Anexos
5. Bibliografía
```

#### 7.1.2 Contenido por Sección de Implementación
Cada sección de implementación (3.1 a 3.4) debe incluir:
- **Introducción al objetivo** (referencia a EV2)
- **Desarrollo de cada entregable** (4 entregables por objetivo)
- **Evidencias de implementación** (screenshots, código, videos)
- **Análisis de resultados** obtenidos
- **Cumplimiento de métricas** establecidas
- **Conclusiones** del objetivo específico

### 7.2 Entregables de Código Fuente

#### 7.2.1 Repositorio de Código
```
/telemetria-san-javier/
├── backend/
│   ├── src/
│   ├── config/
│   ├── tests/
│   └── docs/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── tests/
│   └── docs/
├── database/
│   ├── postgresql/
│   ├── influxdb/
│   └── scripts/
├── mqtt/
│   ├── broker/
│   └── simulators/
└── docs/
    ├── architecture/
    ├── user-manuals/
    └── videos/
```

#### 7.2.2 Documentación de Código
- **README.md** completo con instrucciones de instalación
- **API Documentation** generada con Swagger
- **Comentarios** en código siguiendo JSDoc
- **Diagramas de arquitectura** actualizados
- **Tests unitarios** con coverage mínimo 70%

### 7.3 Entregables Multimedia

#### 7.3.1 Screenshots Obligatorios
1. **Dashboard principal** con datos en tiempo real
2. **Login y autenticación** funcionando
3. **Gestión de usuarios** con diferentes roles
4. **Reportes PDF/Excel** generados
5. **Base de datos** con datos de prueba
6. **Configuración MQTT** funcionando
7. **Sistema de logs** registrando actividad
8. **Responsive design** en móviles

#### 7.3.2 Videos Demostrativos
1. **Video general** (5-10 min): Tour completo del sistema
2. **Video técnico** (10-15 min): Explicación de arquitectura
3. **Video de usuario** (5-10 min): Manual de uso práctico
4. **Video de datos** (3-5 min): Flujo de datos en tiempo real

### 7.4 Entregables de Documentación

#### 7.4.1 Manuales de Usuario
- **Manual de Operador** (PDF, 20-30 páginas)
- **Manual de Supervisor** (PDF, 15-20 páginas)  
- **Manual de Administrador** (PDF, 25-35 páginas)
- **Guía de Referencia Rápida** (PDF, 5-10 páginas)

#### 7.4.2 Documentación Técnica
- **Manual de Arquitectura** (PDF, 30-40 páginas)
- **Guía de Instalación** (PDF, 15-20 páginas)
- **Manual de Mantenimiento** (PDF, 20-25 páginas)
- **Plan de Contingencia** (PDF, 10-15 páginas)

### 7.5 Entregables de la PPT

#### 7.5.1 Estructura de Presentación
```
1. Introducción al proyecto (5-7 slides)
2. Objetivos del proyecto (3-5 slides)
3. Implementación Objetivo 1 (8-10 slides)
4. Implementación Objetivo 2 (8-10 slides)  
5. Implementación Objetivo 3 (8-10 slides)
6. Implementación Objetivo 4 (8-10 slides)
7. Demostración en vivo (5-10 slides)
8. Conclusiones y logros (5-7 slides)
Total: 50-70 slides aproximadamente
```

#### 7.5.2 Elementos por Slide de Implementación
- **Screenshot** real del entregable funcionando
- **Descripción** técnica de lo implementado
- **Métricas** de cumplimiento obtenidas
- **Código relevante** (snippets importantes)
- **Conclusión** del entregable específico

---

## 8. CRITERIOS DE EVALUACIÓN

### 8.1 Criterios de Éxito por Objetivo

#### 8.1.1 Objetivo 1: Sistema de Adquisición
**CRITERIOS TÉCNICOS:**
- ✅ Base de datos PostgreSQL funcionando con esquema completo
- ✅ InfluxDB almacenando series temporales de sensores  
- ✅ Middleware procesando ≥1000 registros/minuto simulados
- ✅ Comunicación MQTT estable entre componentes
- ✅ APIs REST respondiendo en <500ms

**CRITERIOS DE EVIDENCIA:**
- ✅ 5+ screenshots de configuraciones funcionando
- ✅ Video de 3-5 min mostrando flujo completo de datos
- ✅ Código fuente backend completo y documentado
- ✅ Logs de sistema registrando actividad correctamente

#### 8.1.2 Objetivo 2: Plataforma Web
**CRITERIOS TÉCNICOS:**
- ✅ Frontend React.js 100% responsivo y funcional
- ✅ Backend Express.js con todas las APIs implementadas
- ✅ Autenticación JWT con 3 niveles de usuarios
- ✅ Dashboard actualizándose en tiempo real vía WebSocket
- ✅ Generación de reportes PDF/Excel funcional

**CRITERIOS DE EVIDENCIA:**
- ✅ 10+ screenshots de todas las vistas de la aplicación
- ✅ Video de 5-8 min navegando todas las funcionalidades
- ✅ Reportes PDF/Excel generados con datos simulados
- ✅ Código frontend + backend completo

#### 8.1.3 Objetivo 3: Ciberseguridad  
**CRITERIOS TÉCNICOS:**
- ✅ HTTPS configurado con certificados SSL válidos
- ✅ Sistema RBAC funcionando con 3 roles
- ✅ Logs de auditoría registrando todas las acciones
- ✅ Validación de datos en todas las entradas
- ✅ Rate limiting protegiendo APIs

**CRITERIOS DE EVIDENCIA:**
- ✅ 5+ screenshots de funciones de seguridad
- ✅ Documentación completa de políticas de seguridad
- ✅ Plan de contingencia documentado
- ✅ Tests de seguridad automatizados funcionando

#### 8.1.4 Objetivo 4: Capacitación
**CRITERIOS TÉCNICOS:**
- ✅ Manuales PDF profesionales con screenshots reales
- ✅ Videos tutoriales claros y bien estructurados
- ✅ Sistema de soporte web funcional
- ✅ Base de conocimientos (FAQ) completa
- ✅ Plan de capacitación detallado y realista

**CRITERIOS DE EVIDENCIA:**
- ✅ 3+ manuales PDF de 15+ páginas cada uno
- ✅ 2+ videos de 10+ minutos cada uno
- ✅ Portal de soporte funcionando
- ✅ Material didáctico listo para implementar

### 8.2 Métricas de Calidad

#### 8.2.1 Métricas de Código
- **Cobertura de tests:** ≥70% para funciones críticas
- **Documentación:** 100% de funciones documentadas
- **Estándares:** Cumplimiento de ESLint + Prettier
- **Rendimiento:** APIs <500ms, Frontend <2s carga inicial

#### 8.2.2 Métricas de Documentación
- **Completitud:** 100% de entregables documentados
- **Claridad:** Screenshots de alta calidad (≥1080p)
- **Navegabilidad:** Índices y referencias cruzadas
- **Profesionalismo:** Formato consistente y sin errores

#### 8.2.3 Métricas de Demostración
- **Funcionalidad:** 100% de features principales funcionando
- **Estabilidad:** 0 errores críticos durante demo
- **Usabilidad:** Navegación intuitiva sin explicaciones
- **Realismo:** Datos simulados coherentes y creíbles

---

## 9. RECURSOS NECESARIOS

### 9.1 Recursos de Hardware

#### 9.1.1 Computador de Desarrollo
- **Procesador:** Intel i5 8ª gen o superior / AMD Ryzen 5
- **RAM:** 16 GB mínimo (recomendado 32 GB)
- **Almacenamiento:** SSD 500 GB mínimo
- **SO:** Windows 10/11, macOS, o Linux Ubuntu

#### 9.1.2 Conectividad
- **Internet:** Conexión estable ≥50 Mbps
- **Hosting:** Servicio cloud para demo en vivo (opcional)

### 9.2 Recursos de Software

#### 9.2.1 Herramientas de Desarrollo
- **Visual Studio Code** con extensiones:
  - ESLint, Prettier, GitLens
  - ES7+ React/Redux/React-Native snippets
  - Thunder Client (testing APIs)
- **Node.js 18 LTS** con npm/yarn
- **Git** para control de versiones
- **Postman** para testing APIs
- **Docker** (opcional, para contenedores)

#### 9.2.2 Bases de Datos y Servicios
- **PostgreSQL 14+** (local o cloud)
- **InfluxDB 2.x** (local o cloud)  
- **Redis** (para cache y sesiones)
- **Mosquitto** (broker MQTT)

#### 9.2.3 Herramientas de Productividad
- **Microsoft Office** o **LibreOffice** (documentación)
- **Figma** o similar (mockups/wireframes)
- **OBS Studio** (grabación de videos)
- **Canva** o **Adobe** (diseño PPT)

### 9.3 Recursos de Tiempo

#### 9.3.1 Distribución por Fase
```
FASE 1 (Estructura):     4-6 horas
FASE 2 (Implementación): 16-20 horas (4 sesiones × 4-5 horas)
FASE 3 (Consolidación):  4-6 horas  
FASE 4 (Presentación):   4-6 horas
----------------------------------------------
TOTAL:                   28-38 horas
```

#### 9.3.2 Cronograma Sugerido (4 semanas)
```
Semana 1: FASE 1 + Inicio FASE 2 (Objetivos 1-2)
Semana 2: FASE 2 continuación (Objetivos 3-4)  
Semana 3: FASE 3 (Consolidación y testing)
Semana 4: FASE 4 (PPT y preparación demo)
```

### 9.4 Recursos Humanos

#### 9.4.1 Roles y Responsabilidades
- **Estudiante 1 (Gonzalo):** Backend + Base de datos + Documentación
- **Estudiante 2 (Xavier):** Frontend + UX + Videos + Presentación
- **Tutor (Dragustín):** Supervisión + Revisión + Orientación técnica

#### 9.4.2 Disponibilidad Requerida
- **Estudiantes:** 15-20 horas/semana durante 4 semanas
- **Tutor:** 2-4 horas/semana de supervisión y revisión

---

## 10. CRONOGRAMA DE DESARROLLO

### 10.1 Planificación General (4 semanas)

```
┌─────────┬──────────────────────────────────────────────────────────┐
│ SEMANA  │                    ACTIVIDADES                           │
├─────────┼──────────────────────────────────────────────────────────┤
│   1     │ FASE 1 + Obj.1 + Inicio Obj.2                          │
│   2     │ Obj.2 final + Obj.3 + Obj.4                            │
│   3     │ FASE 3: Integración + Testing + Documentación          │
│   4     │ FASE 4: PPT + Demo + Revisión final                    │
└─────────┴──────────────────────────────────────────────────────────┘
```

### 10.2 Cronograma Detallado por Semana

#### 10.2.1 SEMANA 1: Bases e Inicio de Implementación

**DÍA 1-2: FASE 1 - Estructura Base (6-8 horas)**
- [ ] Configurar entorno de desarrollo
- [ ] Crear estructura del informe EV3
- [ ] Preparar repositorio Git
- [ ] Definir métricas por objetivo
- [ ] **Entregable:** Estructura base lista

**DÍA 3-4: Objetivo 1 - Sistema de Adquisición (8-10 horas)**
- [ ] Configurar PostgreSQL + InfluxDB
- [ ] Desarrollar middleware Node.js básico  
- [ ] Configurar broker MQTT Mosquitto
- [ ] Crear simulador de datos de sensores
- [ ] **Entregable:** Sistema de adquisición funcionando

**DÍA 5-7: Inicio Objetivo 2 - Backend (6-8 horas)**  
- [ ] Desarrollar APIs REST con Express.js
- [ ] Implementar autenticación JWT
- [ ] Conectar con bases de datos
- [ ] **Entregable:** Backend API funcional

#### 10.2.2 SEMANA 2: Completar Implementaciones

**DÍA 1-2: Finalizar Objetivo 2 - Frontend (8-10 horas)**
- [ ] Desarrollar frontend React.js completo
- [ ] Implementar dashboard con gráficos
- [ ] Integrar WebSocket tiempo real
- [ ] Crear módulo de reportes
- [ ] **Entregable:** Plataforma web completa

**DÍA 3-4: Objetivo 3 - Ciberseguridad (8-10 horas)**
- [ ] Configurar HTTPS + SSL
- [ ] Implementar RBAC (roles)
- [ ] Crear sistema de auditoría
- [ ] Desarrollar validaciones seguridad
- [ ] **Entregable:** Sistema de seguridad funcional

**DÍA 5-7: Objetivo 4 - Capacitación (6-8 horas)**
- [ ] Crear manuales PDF con screenshots
- [ ] Grabar videos tutoriales
- [ ] Desarrollar sistema de soporte
- [ ] Preparar material de capacitación
- [ ] **Entregable:** Material didáctico completo

#### 10.2.3 SEMANA 3: Consolidación e Integración

**DÍA 1-2: Testing e Integración (8-10 horas)**
- [ ] Tests unitarios componentes críticos
- [ ] Integración de todos los módulos
- [ ] Validación end-to-end del sistema
- [ ] Corrección de bugs encontrados
- [ ] **Entregable:** Sistema integrado estable

**DÍA 3-4: Documentación del Informe (8-10 horas)**
- [ ] Completar secciones 3.1 a 3.4
- [ ] Integrar evidencias (screenshots, videos)
- [ ] Revisar coherencia con EV1 y EV2
- [ ] Pulir redacción y formato
- [ ] **Entregable:** Informe EV3 completo

**DÍA 5-7: Preparación de Evidencias (6-8 horas)**
- [ ] Organizar screenshots finales
- [ ] Editar videos demostrativos
- [ ] Preparar demo del sistema
- [ ] Crear anexos y documentación complementaria
- [ ] **Entregable:** Evidencias organizadas

#### 10.2.4 SEMANA 4: Presentación Final

**DÍA 1-3: Desarrollo de PPT (8-12 horas)**
- [ ] Crear estructura de presentación
- [ ] Integrar evidencias reales en slides
- [ ] Preparar demo en vivo
- [ ] Ensayar presentación completa
- [ ] **Entregable:** PPT lista con demo

**DÍA 4-5: Revisión Final (4-6 horas)**
- [ ] Revisión completa del informe
- [ ] Ajustes finales de la presentación
- [ ] Validación final del sistema
- [ ] Preparación para evaluación
- [ ] **Entregable:** Proyecto completo listo

**DÍA 6-7: Buffer y Contingencia (4-6 horas)**
- [ ] Tiempo para ajustes de última hora
- [ ] Solución de problemas imprevistos
- [ ] Práctica final de presentación
- [ ] **Entregable:** Confianza en el resultado

### 10.3 Hitos y Puntos de Control

#### 10.3.1 Hitos Semanales
- **Hito 1:** Sistema de adquisición funcionando + Backend base
- **Hito 2:** Plataforma web completa + Seguridad + Material didáctico  
- **Hito 3:** Sistema integrado + Informe completo
- **Hito 4:** PPT final + Demo preparada

#### 10.3.2 Puntos de Control (Revisiones con Tutor)
- **Control 1 (Fin Semana 1):** Arquitectura funcionando + Avance Obj 1-2
- **Control 2 (Fin Semana 2):** Todos los objetivos implementados
- **Control 3 (Fin Semana 3):** Informe completo + Evidencias  
- **Control 4 (Fin Semana 4):** Presentación final lista

---

## 11. GESTIÓN DE RIESGOS

### 11.1 Identificación de Riesgos

#### 11.1.1 Riesgos Técnicos

**RIESGO: Problemas de compatibilidad entre tecnologías**
- **Probabilidad:** Media (30%)
- **Impacto:** Alto 
- **Mitigación:** Usar versiones estables y documentadas de todas las tecnologías
- **Plan B:** Tener alternativas documentadas para cada tecnología crítica

**RIESGO: Rendimiento insuficiente con grandes volúmenes de datos**
- **Probabilidad:** Media (25%)
- **Impacto:** Medio
- **Mitigación:** Usar datos de prueba realistas pero controlados
- **Plan B:** Implementar paginación y optimizaciones básicas

**RIESGO: Complejidad excesiva en la integración**
- **Probabilidad:** Alta (40%)
- **Impacto:** Alto
- **Mitigación:** Desarrollo incremental y testing continuo
- **Plan B:** Simplificar integraciones mantienendo funcionalidad core

#### 11.1.2 Riesgos de Tiempo

**RIESGO: Retrasos en implementación por subestimación**
- **Probabilidad:** Alta (50%)
- **Impacto:** Alto
- **Mitigación:** Buffer de tiempo del 25% en cada fase
- **Plan B:** Priorizar objetivos críticos (1 y 2) sobre complementarios (3 y 4)

**RIESGO: Problemas de coordinación entre estudiantes**
- **Probabilidad:** Media (30%)
- **Impacto:** Medio  
- **Mitigación:** Reuniones diarias de sincronización
- **Plan B:** División clara de responsabilidades con mínimas dependencias

#### 11.1.3 Riesgos de Calidad

**RIESGO: Evidencias insuficientes o de baja calidad**
- **Probabilidad:** Media (35%)
- **Impacto:** Alto
- **Mitigación:** Checklist de evidencias por objetivo + revisión continua
- **Plan B:** Regenerar evidencias con herramientas alternativas

**RIESGO: Incoherencia con evaluaciones anteriores**
- **Probabilidad:** Baja (15%)
- **Impacto:** Muy Alto
- **Mitigación:** Revisión constante de alineación con EV1 y EV2
- **Plan B:** Ajustes menores manteniendo esencia de la planificación

### 11.2 Estrategias de Mitigación

#### 11.2.1 Mitigación Técnica
- **Prototipado temprano** para validar integraciones críticas
- **Testing incremental** en cada desarrollo
- **Documentación inmediata** de decisiones técnicas
- **Backup de código** diario en repositorio remoto

#### 11.2.2 Mitigación de Tiempo
- **Metodología iterativa** con entregas incrementales
- **Priorización clara** de funcionalidades críticas vs nice-to-have
- **Revisiones intermedias** para ajuste de alcance
- **Plan de contingencia** con versión mínima viable

#### 11.2.3 Mitigación de Calidad
- **Estándares de código** desde el inicio (ESLint, Prettier)
- **Plantillas de documentación** para consistencia
- **Revisión cruzada** entre estudiantes
- **Feedback temprano** del tutor

### 11.3 Planes de Contingencia

#### 11.3.1 Si hay Retrasos Significativos (>20% del tiempo)
**PLAN REDUCIDO:**
- **Objetivo 1:** Implementación básica (PostgreSQL + APIs simples)
- **Objetivo 2:** Frontend básico + Backend mínimo
- **Objetivo 3:** Documentación de seguridad sin implementación completa
- **Objetivo 4:** Manuales básicos sin videos elaborados

#### 11.3.2 Si hay Problemas Técnicos Mayores
**PLAN ALTERNATIVO:**
- Usar **bases de datos en memoria** en lugar de PostgreSQL/InfluxDB
- **Frontend estático** con datos mockeados en lugar de APIs
- **Screenshots** de mockups en lugar de sistema funcionando
- **Documentación detallada** del diseño en lugar de implementación

#### 11.3.3 Si hay Problemas de Recursos
**PLAN SIMPLIFICADO:**
- Un solo estudiante por objetivo (división total)
- **Documentación compartida** pero implementaciones independientes
- **Demo separada** por objetivo en lugar de sistema integrado

---

## 12. CONCLUSIONES

### 12.1 Resumen de la Estrategia

La implementación de la EV3 mediante la **estrategia híbrida** propuesta permite demostrar de manera efectiva y realista el cumplimiento de los objetivos específicos del proyecto, balanceando la ambición técnica con las restricciones de tiempo y recursos disponibles.

### 12.2 Beneficios de este Enfoque

#### 12.2.1 Para los Estudiantes
- **Experiencia real** de desarrollo full-stack
- **Portfolio tangible** de proyecto completo
- **Habilidades prácticas** en tecnologías actuales
- **Documentación profesional** de nivel industria

#### 12.2.2 Para la Evaluación  
- **Evidencias tangibles** y demostrables
- **Coherencia total** con planificación previa
- **Cumplimiento verificable** de objetivos
- **Calidad profesional** en entregables

#### 12.2.3 Para el Proyecto
- **Validación técnica** de la arquitectura propuesta
- **Proof of concept** funcional del sistema
- **Base sólida** para implementación futura real
- **Documentación completa** para continuidad

### 12.3 Factores Críticos de Éxito

1. **Adherencia estricta** a la arquitectura planificada en EV2
2. **Documentación inmediata** de cada implementación
3. **Evidencias de alta calidad** que demuestren funcionalidad
4. **Coordinación efectiva** entre estudiantes y tutor
5. **Gestión proactiva** de riesgos y contingencias

### 12.4 Métricas de Éxito Final

Al completar la implementación siguiendo esta guía, se debe lograr:

- ✅ **4 objetivos específicos** completamente implementados y documentados
- ✅ **16 entregables** con evidencias tangibles de funcionamiento  
- ✅ **1 sistema integrado** funcionando end-to-end
- ✅ **1 informe profesional** de 60-80 páginas con evidencias
- ✅ **1 presentación impactante** con demo en vivo
- ✅ **Código fuente completo** documentado y funcional

### 12.5 Recomendaciones Finales

1. **Comenzar temprano** con la configuración del entorno
2. **Mantener comunicación constante** con el tutor
3. **Documentar decisiones** técnicas en tiempo real
4. **Generar evidencias** de manera continua, no al final
5. **Practicar la demo** múltiples veces antes de la presentación
6. **Tener planes de contingencia** listos para activar si es necesario

---

**DOCUMENTO PREPARADO POR:**  
Tutor Guía del Proyecto  
Fecha: Noviembre 2025

**PARA USO EN:**  
EV3 - Implementación y Pruebas  
Sistema Integral de Telemetría para Canales de Riego San Javier

---

> **NOTA IMPORTANTE:** Este documento debe revisarse y actualizarse según avance el proyecto. Cualquier desviación significativa de la ruta propuesta debe documentarse y justificarse apropiadamente.
