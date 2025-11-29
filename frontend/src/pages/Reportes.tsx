/**
 * Generación de Reportes
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 */

import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, MenuItem, Button,
  Checkbox, FormControlLabel, Alert, CircularProgress, Card, CardContent
} from '@mui/material';
import { PictureAsPdf, TableChart } from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { api } from '@/services/api';
import type { Estacion } from '@/types';

export default function Reportes() {
  const [estaciones, setEstaciones] = useState<Estacion[]>([]);
  const [config, setConfig] = useState({
    tipo: 'diario',
    formato: 'pdf',
    estacionesSeleccionadas: [] as string[],
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    incluirGraficos: true
  });
  const [generando, setGenerando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    api.obtenerEstaciones().then(setEstaciones);
  }, []);

  const handleGenerarPDF = async () => {
    setGenerando(true);
    setMensaje('');

    try {
      const doc = new jsPDF();

      // Título
      doc.setFontSize(18);
      doc.text('Reporte de Telemetría San Javier', 14, 20);

      doc.setFontSize(12);
      doc.text(`Tipo: ${config.tipo}`, 14, 30);
      doc.text(`Fecha: ${config.fechaInicio} a ${config.fechaFin}`, 14, 37);

      // Obtener datos de las estaciones seleccionadas
      const estacionesReporte = estaciones.filter(e =>
        config.estacionesSeleccionadas.includes(e.id)
      );

      if (estacionesReporte.length === 0) {
        throw new Error('Seleccione al menos una estación');
      }

      // Tabla de estaciones
      const datosTabla = await Promise.all(
        estacionesReporte.map(async (est) => {
          try {
            const datos = await api.obtenerDatosTiempoReal(est.id);
            return [
              est.id,
              est.nombre,
              est.tipo,
              est.estado,
              datos.sensores?.caudal?.valor || 'N/A',
              datos.sensores?.temperatura?.valor || 'N/A'
            ];
          } catch {
            return [est.id, est.nombre, est.tipo, est.estado, 'N/A', 'N/A'];
          }
        })
      );

      autoTable(doc, {
        startY: 45,
        head: [['ID', 'Nombre', 'Tipo', 'Estado', 'Caudal (L/s)', 'Temp (°C)']],
        body: datosTabla,
      });

      // Información adicional
      const finalY = (doc as any).lastAutoTable.finalY || 45;
      doc.setFontSize(10);
      doc.text(`Total de estaciones: ${estacionesReporte.length}`, 14, finalY + 10);
      doc.text(`Generado: ${new Date().toLocaleString()}`, 14, finalY + 17);

      // Guardar PDF
      doc.save(`reporte_telemetria_${new Date().getTime()}.pdf`);

      setMensaje('Reporte PDF generado exitosamente');
    } catch (err: any) {
      setMensaje(`Error: ${err.message}`);
    } finally {
      setGenerando(false);
    }
  };

  const handleGenerarExcel = async () => {
    setGenerando(true);
    setMensaje('');

    try {
      const estacionesReporte = estaciones.filter(e =>
        config.estacionesSeleccionadas.includes(e.id)
      );

      if (estacionesReporte.length === 0) {
        throw new Error('Seleccione al menos una estación');
      }

      // Obtener datos
      const datosExcel = await Promise.all(
        estacionesReporte.map(async (est) => {
          try {
            const datos = await api.obtenerDatosTiempoReal(est.id);
            return {
              ID: est.id,
              Nombre: est.nombre,
              Tipo: est.tipo,
              Estado: est.estado,
              Ubicación: est.ubicacion,
              'Caudal (L/s)': datos.sensores?.caudal?.valor || 'N/A',
              'Temperatura (°C)': datos.sensores?.temperatura?.valor || 'N/A',
              'Nivel Agua (cm)': datos.sensores?.nivel_agua?.valor || 'N/A',
              'Presión (bar)': datos.sensores?.presion?.valor || 'N/A',
              'Última Actualización': datos.timestamp
            };
          } catch {
            return {
              ID: est.id,
              Nombre: est.nombre,
              Tipo: est.tipo,
              Estado: est.estado,
              Ubicación: est.ubicacion,
              'Caudal (L/s)': 'N/A',
              'Temperatura (°C)': 'N/A',
              'Nivel Agua (cm)': 'N/A',
              'Presión (bar)': 'N/A',
              'Última Actualización': 'N/A'
            };
          }
        })
      );

      // Crear libro de Excel
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(datosExcel);

      // Ajustar ancho de columnas
      const colWidths = [
        { wch: 10 }, // ID
        { wch: 30 }, // Nombre
        { wch: 15 }, // Tipo
        { wch: 15 }, // Estado
        { wch: 25 }, // Ubicación
        { wch: 15 }, // Caudal
        { wch: 15 }, // Temperatura
        { wch: 15 }, // Nivel
        { wch: 15 }, // Presión
        { wch: 20 }, // Timestamp
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Estaciones');

      // Guardar archivo
      XLSX.writeFile(wb, `reporte_telemetria_${new Date().getTime()}.xlsx`);

      setMensaje('Reporte Excel generado exitosamente');
    } catch (err: any) {
      setMensaje(`Error: ${err.message}`);
    } finally {
      setGenerando(false);
    }
  };

  const handleGenerar = () => {
    if (config.formato === 'pdf') {
      handleGenerarPDF();
    } else {
      handleGenerarExcel();
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Generación de Reportes
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Configuración del Reporte
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Tipo de Reporte"
                  value={config.tipo}
                  onChange={(e) => setConfig({ ...config, tipo: e.target.value })}
                >
                  <MenuItem value="diario">Diario</MenuItem>
                  <MenuItem value="semanal">Semanal</MenuItem>
                  <MenuItem value="mensual">Mensual</MenuItem>
                  <MenuItem value="personalizado">Personalizado</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Formato"
                  value={config.formato}
                  onChange={(e) => setConfig({ ...config, formato: e.target.value })}
                >
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="excel">Excel</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha Inicio"
                  value={config.fechaInicio}
                  onChange={(e) => setConfig({ ...config, fechaInicio: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha Fin"
                  value={config.fechaFin}
                  onChange={(e) => setConfig({ ...config, fechaFin: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Estaciones a Incluir:
                </Typography>
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {estaciones.map((est) => (
                    <FormControlLabel
                      key={est.id}
                      control={
                        <Checkbox
                          checked={config.estacionesSeleccionadas.includes(est.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setConfig({
                                ...config,
                                estacionesSeleccionadas: [...config.estacionesSeleccionadas, est.id]
                              });
                            } else {
                              setConfig({
                                ...config,
                                estacionesSeleccionadas: config.estacionesSeleccionadas.filter(id => id !== est.id)
                              });
                            }
                          }}
                        />
                      }
                      label={`${est.id} - ${est.nombre}`}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleGenerar}
                  disabled={generando || config.estacionesSeleccionadas.length === 0}
                  startIcon={generando ? <CircularProgress size={20} /> : (
                    config.formato === 'pdf' ? <PictureAsPdf /> : <TableChart />
                  )}
                >
                  {generando ? 'Generando...' : `Generar Reporte ${config.formato.toUpperCase()}`}
                </Button>
              </Grid>

              {mensaje && (
                <Grid item xs={12}>
                  <Alert severity={mensaje.includes('Error') ? 'error' : 'success'}>
                    {mensaje}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Estaciones seleccionadas:</strong> {config.estacionesSeleccionadas.length}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Período:</strong> {config.fechaInicio} a {config.fechaFin}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Los reportes incluyen datos de telemetría en tiempo real de las estaciones seleccionadas.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
