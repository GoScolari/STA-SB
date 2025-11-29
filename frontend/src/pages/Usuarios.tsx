/**
 * Gestión de Usuarios (Solo Administradores)
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 */

import { useState, useEffect } from 'react';
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
  Block as BlockIcon
} from '@mui/icons-material';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Usuario } from '@/types';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<Partial<Usuario & { password?: string }> | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const { usuario: usuarioActual } = useAuth();

  // Verificar que solo administradores puedan acceder
  if (usuarioActual?.rol !== 'administrador') {
    return (
      <Alert severity="error">
        No tiene permisos para acceder a esta sección
      </Alert>
    );
  }

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = () => {
    setLoading(true);
    api.obtenerUsuarios()
      .then(setUsuarios)
      .catch(err => {
        setSnackbar({ open: true, message: 'Error cargando usuarios', severity: 'error' });
      })
      .finally(() => setLoading(false));
  };

  const handleNuevo = () => {
    setEditando({
      nombre: '',
      email: '',
      password: '',
      rol: 'visualizador',
      activo: true
    });
    setDialogOpen(true);
  };

  const handleEditar = (usuario: Usuario) => {
    setEditando({
      ...usuario,
      password: '' // No mostrar password
    });
    setDialogOpen(true);
  };

  const handleGuardar = async () => {
    if (!editando) return;

    // Validaciones
    if (!editando.nombre || !editando.email || !editando.rol) {
      setSnackbar({ open: true, message: 'Complete todos los campos', severity: 'error' });
      return;
    }

    if (!editando.id && !editando.password) {
      setSnackbar({ open: true, message: 'La contraseña es requerida', severity: 'error' });
      return;
    }

    try {
      if (editando.id) {
        // Actualizar
        const datosActualizar: any = {
          nombre: editando.nombre,
          email: editando.email,
          rol: editando.rol,
          activo: editando.activo
        };

        // Solo incluir password si se cambió
        if (editando.password && editando.password.length > 0) {
          datosActualizar.password = editando.password;
        }

        await api.actualizarUsuario(editando.id, datosActualizar);
        setSnackbar({ open: true, message: 'Usuario actualizado', severity: 'success' });
      } else {
        // Crear
        await api.crearUsuario({
          nombre: editando.nombre,
          email: editando.email,
          password: editando.password!,
          rol: editando.rol,
          activo: editando.activo
        } as any);
        setSnackbar({ open: true, message: 'Usuario creado', severity: 'success' });
      }

      setDialogOpen(false);
      setEditando(null);
      cargarUsuarios();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Error guardando usuario',
        severity: 'error'
      });
    }
  };

  const handleEliminar = async (id: string) => {
    if (id === usuarioActual?.id) {
      setSnackbar({ open: true, message: 'No puede eliminarse a sí mismo', severity: 'error' });
      return;
    }

    if (!confirm('¿Está seguro de eliminar este usuario?')) return;

    try {
      await api.eliminarUsuario(id);
      setSnackbar({ open: true, message: 'Usuario eliminado', severity: 'success' });
      cargarUsuarios();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error eliminando usuario', severity: 'error' });
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'nombre', headerName: 'Nombre', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    {
      field: 'rol',
      headerName: 'Rol',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color={
            params.value === 'administrador' ? 'error' :
            params.value === 'operador' ? 'primary' : 'default'
          }
          size="small"
        />
      )
    },
    {
      field: 'activo',
      headerName: 'Estado',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? 'Activo' : 'Inactivo'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Creado',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        new Date(params.value).toLocaleDateString()
      )
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleEditar(params.row)}
            title="Editar"
            disabled={params.row.id === usuarioActual?.id}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleEliminar(params.row.id)}
            title="Eliminar"
            color="error"
            disabled={params.row.id === usuarioActual?.id}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Gestión de Usuarios</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNuevo}
        >
          Nuevo Usuario
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={usuarios}
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
          {editando?.id ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre Completo"
            value={editando?.nombre || ''}
            onChange={(e) => setEditando({ ...editando!, nombre: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={editando?.email || ''}
            onChange={(e) => setEditando({ ...editando!, email: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label={editando?.id ? "Contraseña (dejar vacío para mantener)" : "Contraseña"}
            type="password"
            value={editando?.password || ''}
            onChange={(e) => setEditando({ ...editando!, password: e.target.value })}
            margin="normal"
            required={!editando?.id}
            helperText={editando?.id ? "Solo llenar si desea cambiar la contraseña" : ""}
          />
          <TextField
            fullWidth
            select
            label="Rol"
            value={editando?.rol || 'visualizador'}
            onChange={(e) => setEditando({ ...editando!, rol: e.target.value as any })}
            margin="normal"
          >
            <MenuItem value="administrador">Administrador</MenuItem>
            <MenuItem value="operador">Operador</MenuItem>
            <MenuItem value="visualizador">Visualizador</MenuItem>
          </TextField>
          <TextField
            fullWidth
            select
            label="Estado"
            value={editando?.activo ? 'true' : 'false'}
            onChange={(e) => setEditando({ ...editando!, activo: e.target.value === 'true' })}
            margin="normal"
          >
            <MenuItem value="true">Activo</MenuItem>
            <MenuItem value="false">Inactivo</MenuItem>
          </TextField>

          {editando?.id && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Creado: {new Date(editando.createdAt!).toLocaleString()}
            </Alert>
          )}
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
