/**
 * Configuración de Swagger
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Telemetría San Javier - STA-SB',
      version: '1.0.0',
      description: `
        Sistema de Telemetría y Automatización San Javier (STA-SB)
        
        **Proyecto:** EV3 Implementación - Ingeniería en Informática
        **Estudiantes:** Gonzalo Scolari, Xavier Barrera
        **Empresa:** CEA Project SPA
        
        Esta API REST proporciona endpoints para:
        - Gestión de 30 estaciones de telemetría
        - Autenticación JWT con roles (admin, operador, visualizador)
        - Datos de sensores en tiempo real
        - Control remoto de compuertas
        - Generación de reportes para DGA
      `,
      contact: {
        name: 'Equipo STA-SB',
        email: 'admin@ouasanjavier.cl'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api-telemetria.ouasanjavier.cl',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingrese el token JWT obtenido del endpoint /api/auth/login'
        }
      },
      schemas: {
        // Esquema de Usuario
        Usuario: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del usuario'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario'
            },
            nombre: {
              type: 'string',
              description: 'Nombre del usuario'
            },
            apellido: {
              type: 'string',
              description: 'Apellido del usuario'
            },
            rol: {
              type: 'string',
              enum: ['administrador', 'operador', 'visualizador'],
              description: 'Rol del usuario en el sistema'
            },
            activo: {
              type: 'boolean',
              description: 'Estado activo del usuario'
            },
            ultimo_acceso: {
              type: 'string',
              format: 'date-time',
              description: 'Último acceso del usuario'
            }
          }
        },
        
        // Esquema de Estación
        Estacion: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único de la estación'
            },
            codigo: {
              type: 'string',
              description: 'Código único de la estación (EST001-EST030)'
            },
            nombre: {
              type: 'string',
              description: 'Nombre descriptivo de la estación'
            },
            descripcion: {
              type: 'string',
              description: 'Descripción detallada de la estación'
            },
            ubicacion: {
              type: 'string',
              description: 'Ubicación geográfica de la estación'
            },
            latitud: {
              type: 'number',
              format: 'double',
              description: 'Coordenada latitud GPS'
            },
            longitud: {
              type: 'number',
              format: 'double',
              description: 'Coordenada longitud GPS'
            },
            tipo: {
              type: 'string',
              enum: ['primaria', 'secundaria', 'terciaria', 'control'],
              description: 'Tipo de estación'
            },
            activa: {
              type: 'boolean',
              description: 'Estado activo de la estación'
            }
          }
        },

        // Esquema de Login
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'Contraseña del usuario'
            }
          }
        },

        // Esquema de respuesta de Login
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicador de éxito'
            },
            message: {
              type: 'string',
              description: 'Mensaje de respuesta'
            },
            user: {
              $ref: '#/components/schemas/Usuario'
            },
            token: {
              type: 'string',
              description: 'Token JWT para autenticación'
            }
          }
        },

        // Esquema de Error
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Mensaje de error'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp del error'
            }
          }
        },

        // Esquema de Health Check
        HealthCheck: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            status: {
              type: 'string',
              example: 'healthy'
            },
            uptime: {
              type: 'number',
              description: 'Tiempo de actividad en segundos'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            },
            memory: {
              type: 'object',
              properties: {
                rss: { type: 'number' },
                heapTotal: { type: 'number' },
                heapUsed: { type: 'number' },
                external: { type: 'number' },
                arrayBuffers: { type: 'number' }
              }
            }
          }
        }
      },
      
      responses: {
        // Respuestas estándar
        Success: {
          description: 'Operación exitosa',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string'
                  },
                  data: {
                    type: 'object'
                  }
                }
              }
            }
          }
        },
        
        Unauthorized: {
          description: 'No autorizado - Token requerido o inválido',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        
        Forbidden: {
          description: 'Prohibido - Permisos insuficientes',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        
        NotFound: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        
        BadRequest: {
          description: 'Solicitud incorrecta',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        
        InternalError: {
          description: 'Error interno del servidor',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    },
    
    tags: [
      {
        name: 'Sistema',
        description: 'Endpoints de información del sistema y health checks'
      },
      {
        name: 'Autenticación',
        description: 'Endpoints de login, logout y gestión de tokens JWT'
      },
      {
        name: 'Estaciones',
        description: 'CRUD de estaciones de telemetría y datos de sensores'
      },
      {
        name: 'Usuarios',
        description: 'Gestión de usuarios y permisos (solo administradores)'
      },
      {
        name: 'Reportes',
        description: 'Generación de reportes PDF/Excel para DGA'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js'
  ]
};

// Generar especificaciones
const specs = swaggerJsdoc(options);

// Configuración UI personalizada
const swaggerOptions = {
  customCss: `
    .swagger-ui .topbar { 
      background-color: #2c3e50; 
    }
    .swagger-ui .topbar .download-url-wrapper { 
      display: none; 
    }
    .swagger-ui .info .title {
      color: #2c3e50;
    }
  `,
  customSiteTitle: 'API STA-SB - Telemetría San Javier',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    tryItOutEnabled: true
  }
};

module.exports = {
  swaggerUi,
  specs,
  swaggerOptions
};