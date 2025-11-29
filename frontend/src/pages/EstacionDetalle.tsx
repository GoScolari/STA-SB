/**
 * Detalle de Estación
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Button,
  Chip, CircularProgress, Alert, TextField, MenuItem, IconButton
} from '@mui/material';
import { ArrowBack, Refresh } from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import { api } from '@/services/api';
import { websocket } from '@/services/websocket';
import type { Estacion, SensoresEstacion, Heartbeat } from '@/types';

export default function EstacionDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [estacion, setEstacion] = useState<Estacion | null>(null);
  const [sensores, setSensores] = useState<SensoresEstacion | null>(null);
  const [heartbeat, setHeartbeat] = useState<Heartbeat | null>(null);
  const [loading, setLoading] = useState(true);
  const [historial, setHistorial] = useState<any[]>([]);
  const [comando, setComando] = useState({ dispositivo: 'compuerta', accion: 'abrir' });

  useEffect(() => {
    if (!id) return;

    // Cargar datos de la estación
    Promise.all([
      api.obtenerEstacion(id),
      api.obtenerDatosTiempoReal(id),
      api.obtenerHeartbeat(id)
    ])
      .then(([est, sens, hb]) => {
        setEstacion(est);
        setSensores(sens);
        setHeartbeat(hb);
      })
      .catch(err => console.error('Error cargando estación:', err))
      .finally(() => setLoading(false));

    // Suscribirse a WebSocket
    websocket.subscribe([id]);

    const unsub = websocket.on('sensor_data', (data) => {
      if (data.data?.estacion_id === id) {
        setSensores(prev => ({
          ...prev!,
          sensores: {
            ...prev!.sensores,
            [data.data.tipo_sensor]: {
              valor: data.data.valor,
              unidad: data.data.unidad,
              calidad: data.data.calidad,
              tiempo: data.data.timestamp
            }
          },
          timestamp: data.data.timestamp
        }));

        // Agregar al historial
        setHistorial(prev => {
          const nuevo = [...prev, {
            tiempo: new Date(data.data.timestamp).toLocaleTimeString(),
            [data.data.tipo_sensor]: data.data.valor
          }];
          return nuevo.slice(-30);
        });
      }
    });

    return () => unsub();
  }, [id]);

  const enviarComando = async () => {
    if (!id) return;

    try {
      await api.enviarComando(id, {
        dispositivo: comando.dispositivo as any,
        comando: comando.accion,
        parametros: {}
      });
      alert(`Comando ${comando.accion} enviado a ${comando.dispositivo}`);
    } catch (err) {
      alert('Error enviando comando');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!estacion) {
    return <Alert severity="error">Estación no encontrada</Alert>;
  }

  const chartData = {
    labels: historial.map(h => h.tiempo),
    datasets: [
      {
        label: 'Caudal (L/s)',
        data: historial.map(h => h.caudal || 0),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Temperatura (°C)',
        data: historial.map(h => h.temperatura || 0),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/estaciones')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">{estacion.nombre}</Typography>
        <Chip label={estacion.tipo} color="primary" />
        <Chip
          label={estacion.estado}
          color={estacion.estado === 'activa' ? 'success' : 'default'}
        />
        {heartbeat && (
          <Chip
            label={heartbeat.online ? 'Online' : 'Offline'}
            color={heartbeat.online ? 'success' : 'error'}
          />
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Información de la estación */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Información</Typography>
              <Typography><strong>ID:</strong> {estacion.id}</Typography>
              <Typography><strong>Ubicación:</strong> {estacion.ubicacion}</Typography>
              <Typography><strong>Lat:</strong> {estacion.latitud}</Typography>
              <Typography><strong>Lon:</strong> {estacion.longitud}</Typography>
              {heartbeat && (
                <>
                  <Typography><strong>Uptime:</strong> {Math.floor(heartbeat.uptime / 3600)}h</Typography>
                  <Typography><strong>Último heartbeat:</strong> {heartbeat.minutos_desde_heartbeat}m</Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sensores en tiempo real */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Sensores en Tiempo Real</Typography>
              <Grid container spacing={2}>
                {sensores?.sensores && Object.entries(sensores.sensores).map(([tipo, sensor]: [string, any]) => (
                  <Grid item xs={6} md={3} key={tipo}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="caption" color="textSecondary">
                        {tipo.replace('_', ' ').toUpperCase()}
                      </Typography>
                      <Typography variant="h6">
                        {sensor.valor} {sensor.unidad}
                      </Typography>
                      <Chip
                        label={sensor.calidad}
                        size="small"
                        color={sensor.calidad === 'excelente' ? 'success' : 'default'}
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico histórico */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Historial (Últimos 30 datos)</Typography>
            <Box height={300}>
              <Line data={chartData} options={{ maintainAspectRatio: false, responsive: true }} />
            </Box>
          </Paper>
        </Grid>

        {/* Control de compuertas/bombas */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Control Remoto</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Dispositivo"
                    value={comando.dispositivo}
                    onChange={(e) => setComando({ ...comando, dispositivo: e.target.value })}
                  >
                    <MenuItem value="compuerta">Compuerta</MenuItem>
                    <MenuItem value="bomba">Bomba</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Acción"
                    value={comando.accion}
                    onChange={(e) => setComando({ ...comando, accion: e.target.value })}
                  >
                    <MenuItem value="abrir">Abrir</MenuItem>
                    <MenuItem value="cerrar">Cerrar</MenuItem>
                    <MenuItem value="encender">Encender</MenuItem>
                    <MenuItem value="apagar">Apagar</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={enviarComando}
                  >
                    Enviar Comando
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
