/**
 * Lista de Estaciones
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Box, Typography, Button, Paper, Chip, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Alert, Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Estacion } from '@/types';

export default function Estaciones() {
  const [estaciones, setEstaciones] = useState<Estacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<Estacion | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const puedeEditar = usuario?.rol === 'administrador' || usuario?.rol === 'operador';

  useEffect(() => {
    cargarEstaciones();
  }, []);

  const cargarEstaciones = () => {
    setLoading(true);
    api.obtenerEstaciones()
      .then(setEstaciones)
      .catch(err => {
        setSnackbar({ open: true, message: 'Error cargando estaciones', severity: 'error' });
      })
      .finally(() => setLoading(false));
  };

  const handleNueva = () => {
    setEditando({
      id: '',
      nombre: '',
      ubicacion: '',
      latitud: 0,
      longitud: 0,
      tipo: 'secundaria',
      estado: 'activa',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setDialogOpen(true);
  };

  const handleEditar = (estacion: Estacion) => {
    setEditando(estacion);
    setDialogOpen(true);
  };

  const handleGuardar = async () => {
    if (!editando) return;

    try {
      if (editando.id) {
        await api.actualizarEstacion(editando.id, editando);
        setSnackbar({ open: true, message: 'Estación actualizada', severity: 'success' });
      } else {
        await api.crearEstacion(editando);
        setSnackbar({ open: true, message: 'Estación creada', severity: 'success' });
      }
      setDialogOpen(false);
      setEditando(null);
      cargarEstaciones();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error guardando estación', severity: 'error' });
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta estación?')) return;

    try {
      await api.eliminarEstacion(id);
      setSnackbar({ open: true, message: 'Estación eliminada', severity: 'success' });
      cargarEstaciones();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error eliminando estación', severity: 'error' });
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'nombre', headerName: 'Nombre', width: 250 },
    { field: 'ubicacion', headerName: 'Ubicación', width: 200 },
    {
      field: 'tipo',
      headerName: 'Tipo',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value} variant="outlined" size="small" />
      )
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color={
            params.value === 'activa' ? 'success' :
            params.value === 'mantenimiento' ? 'warning' : 'default'
          }
          size="small"
        />
      ),
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 180,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => navigate(`/estaciones/${params.row.id}`)}
            title="Ver detalle"
          >
            <ViewIcon fontSize="small" />
          </IconButton>
          {puedeEditar && (
            <>
              <IconButton
                size="small"
                onClick={() => handleEditar(params.row)}
                title="Editar"
              >
                <EditIcon fontSize="small" />
              </IconButton>
              {usuario?.rol === 'administrador' && (
                <IconButton
                  size="small"
                  onClick={() => handleEliminar(params.row.id)}
                  title="Eliminar"
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Estaciones de Telemetría</Typography>
        {puedeEditar && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNueva}
          >
            Nueva Estación
          </Button>
        )}
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={estaciones}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* Dialog de edición/creación */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editando?.id ? 'Editar Estación' : 'Nueva Estación'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre"
            value={editando?.nombre || ''}
            onChange={(e) => setEditando({ ...editando!, nombre: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Ubicación"
            value={editando?.ubicacion || ''}
            onChange={(e) => setEditando({ ...editando!, ubicacion: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Latitud"
            type="number"
            value={editando?.latitud || 0}
            onChange={(e) => setEditando({ ...editando!, latitud: parseFloat(e.target.value) })}
            margin="normal"
            inputProps={{ step: 0.0001 }}
          />
          <TextField
            fullWidth
            label="Longitud"
            type="number"
            value={editando?.longitud || 0}
            onChange={(e) => setEditando({ ...editando!, longitud: parseFloat(e.target.value) })}
            margin="normal"
            inputProps={{ step: 0.0001 }}
          />
          <TextField
            fullWidth
            select
            label="Tipo"
            value={editando?.tipo || 'secundaria'}
            onChange={(e) => setEditando({ ...editando!, tipo: e.target.value as any })}
            margin="normal"
          >
            <MenuItem value="primaria">Primaria</MenuItem>
            <MenuItem value="secundaria">Secundaria</MenuItem>
            <MenuItem value="terciaria">Terciaria</MenuItem>
            <MenuItem value="control">Control</MenuItem>
            <MenuItem value="bombeo">Bombeo</MenuItem>
            <MenuItem value="derivacion">Derivación</MenuItem>
            <MenuItem value="medicion">Medición</MenuItem>
            <MenuItem value="regulatorio">Regulatorio</MenuItem>
            <MenuItem value="bocatoma">Bocatoma</MenuItem>
          </TextField>
          <TextField
            fullWidth
            select
            label="Estado"
            value={editando?.estado || 'activa'}
            onChange={(e) => setEditando({ ...editando!, estado: e.target.value as any })}
            margin="normal"
          >
            <MenuItem value="activa">Activa</MenuItem>
            <MenuItem value="inactiva">Inactiva</MenuItem>
            <MenuItem value="mantenimiento">Mantenimiento</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleGuardar} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
