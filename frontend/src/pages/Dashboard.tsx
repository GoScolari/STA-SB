/**
 * Dashboard Principal
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 */

import { useState, useEffect } from 'react';
import {
  Grid, Paper, Typography, Card, CardContent, Box, Chip, CircularProgress
} from '@mui/material';
import {
  WaterDrop, Thermostat, Speed, Straighten
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { api } from '@/services/api';
import { websocket } from '@/services/websocket';
import type { Estacion, SensoresEstacion } from '@/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const iconosSensor = {
  nivel_agua: <WaterDrop />,
  temperatura: <Thermostat />,
  caudal: <Speed />,
  presion: <Straighten />
};

export default function Dashboard() {
  const [estaciones, setEstaciones] = useState<Estacion[]>([]);
  const [datosEnVivo, setDatosEnVivo] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [historialCaudal, setHistorialCaudal] = useState<any[]>([]);

  useEffect(() => {
    // Cargar estaciones
    api.obtenerEstaciones()
      .then(data => {
        setEstaciones(data);
        // Suscribirse a WebSocket para las primeras 10 estaciones
        const ids = data.slice(0, 10).map((e: Estacion) => e.id);
        websocket.subscribe(ids);

        // Obtener datos en tiempo real de las primeras 6
        data.slice(0, 6).forEach((est: Estacion) => {
          api.obtenerDatosTiempoReal(est.id)
            .then(datos => {
              setDatosEnVivo(prev => ({
                ...prev,
                [est.id]: datos
              }));
            })
            .catch(err => console.error('Error obteniendo datos:', err));
        });
      })
      .finally(() => setLoading(false));

    // Escuchar datos en tiempo real por WebSocket
    const unsubscribe = websocket.on('sensor_data', (data) => {
      if (data.data) {
        setDatosEnVivo(prev => ({
          ...prev,
          [data.data.estacion_id]: {
            ...prev[data.data.estacion_id],
            sensores: {
              ...prev[data.data.estacion_id]?.sensores,
              [data.data.tipo_sensor]: {
                valor: data.data.valor,
                unidad: data.data.unidad,
                calidad: data.data.calidad,
                tiempo: data.data.timestamp
              }
            }
          }
        }));

        // Actualizar historial de caudal para gráfico
        if (data.data.tipo_sensor === 'caudal') {
          setHistorialCaudal(prev => {
            const nuevo = [...prev, {
              tiempo: new Date(data.data.timestamp).toLocaleTimeString(),
              valor: data.data.valor
            }];
            return nuevo.slice(-20); // Últimos 20 puntos
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const chartData = {
    labels: historialCaudal.map(d => d.tiempo),
    datasets: [
      {
        label: 'Caudal (L/s)',
        data: historialCaudal.map(d => d.valor),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }
    ]
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Caudal en Tiempo Real'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard - Monitoreo en Tiempo Real
      </Typography>

      {/* Resumen de estaciones */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Estaciones
              </Typography>
              <Typography variant="h4">{estaciones.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Activas
              </Typography>
              <Typography variant="h4" color="success.main">
                {estaciones.filter(e => e.estado === 'activa').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                En Mantenimiento
              </Typography>
              <Typography variant="h4" color="warning.main">
                {estaciones.filter(e => e.estado === 'mantenimiento').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Inactivas
              </Typography>
              <Typography variant="h4" color="error.main">
                {estaciones.filter(e => e.estado === 'inactiva').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráfico de caudal en tiempo real */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box height={300}>
          <Line data={chartData} options={chartOptions} />
        </Box>
      </Paper>

      {/* Tarjetas de estaciones con datos en vivo */}
      <Typography variant="h5" gutterBottom>
        Estaciones Principales
      </Typography>
      <Grid container spacing={3}>
        {estaciones.slice(0, 6).map((estacion) => {
          const datos = datosEnVivo[estacion.id];

          return (
            <Grid item xs={12} md={6} lg={4} key={estacion.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" component="div">
                      {estacion.nombre}
                    </Typography>
                    <Chip
                      label={estacion.tipo}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>

                  {datos?.sensores ? (
                    <Grid container spacing={2}>
                      {Object.entries(datos.sensores).map(([tipo, sensor]: [string, any]) => (
                        <Grid item xs={6} key={tipo}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box color="primary.main">
                              {iconosSensor[tipo as keyof typeof iconosSensor]}
                            </Box>
                            <Box>
                              <Typography variant="caption" color="textSecondary">
                                {tipo.replace('_', ' ')}
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {sensor.valor} {sensor.unidad}
                              </Typography>
                              <Chip
                                label={sensor.calidad}
                                size="small"
                                color={
                                  sensor.calidad === 'excelente' ? 'success' :
                                  sensor.calidad === 'buena' ? 'info' :
                                  sensor.calidad === 'regular' ? 'warning' : 'error'
                                }
                                sx={{ fontSize: '0.7rem', height: 18 }}
                              />
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box display="flex" justifyContent="center" p={2}>
                      <CircularProgress size={24} />
                    </Box>
                  )}

                  <Box mt={2}>
                    <Typography variant="caption" color="textSecondary">
                      Última actualización: {datos?.timestamp ?
                        new Date(datos.timestamp).toLocaleTimeString() :
                        'Esperando datos...'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
