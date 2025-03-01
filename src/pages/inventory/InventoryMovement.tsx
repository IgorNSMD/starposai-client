import React, { useState } from 'react';
import { Button, TextField, MenuItem, Select, FormControl, InputLabel, Box, Typography, SelectChangeEvent } from '@mui/material';

import { createInventoryMovement } from '../../store/slices/inventoryMovementSlice';
import { RootState } from '../../store/store';
import { useAppDispatch, useAppSelector } from "../../store/redux/hooks";

const InventoryMovementForm = () => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state: RootState) => state.inventorymovements);

  const [movementData, setMovementData] = useState<{
    type: "entry" | "exit" | "transfer" | "adjustment" | "disassembly";
    warehouse: string;
    referenceId: string;
    referenceType: 'Product' | 'Kit'; // ✅ Esto corrige el error
    quantity: number; // ✅ Aseguramos que quantity sea un número
    reason: string;
  }>({
    type: "entry", // ✅ Valor inicial válido
    warehouse: '',
    referenceId: '',
    referenceType: 'Product', // ✅ Inicializamos con un valor válido
    quantity: 0, // ✅ Ahora es un número
    reason: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setMovementData(prevState => ({
      ...prevState,
      [name]: name === 'quantity' ? Number(value) : value, // Convierte `quantity` a número
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createInventoryMovement(movementData));
  };

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 3, boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h6" mb={2}>Registrar Movimiento de Inventario</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <form onSubmit={handleSubmit}>
      <FormControl fullWidth margin="normal">
        <InputLabel>Tipo de Movimiento</InputLabel>
        <Select name="type" value={movementData.type} onChange={handleChange}>
          <MenuItem value="entry">Entrada</MenuItem>
          <MenuItem value="exit">Salida</MenuItem>
          <MenuItem value="transfer">Transferencia</MenuItem>
          <MenuItem value="adjustment">Ajuste</MenuItem>
          <MenuItem value="disassembly">Desensamblaje</MenuItem>
        </Select>
      </FormControl>

        <TextField fullWidth label="Warehouse ID" name="warehouse" value={movementData.warehouse} onChange={handleChange} margin="normal" />
        <TextField fullWidth label="Referencia ID" name="referenceId" value={movementData.referenceId} onChange={handleChange} margin="normal" />
        <TextField fullWidth label="Cantidad" type="number" name="quantity" value={movementData.quantity} onChange={handleChange} margin="normal" />
        <TextField fullWidth label="Razón" name="reason" value={movementData.reason} onChange={handleChange} margin="normal" />

        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
          {loading ? 'Registrando...' : 'Registrar Movimiento'}
        </Button>
      </form>
    </Box>
  );
};

export default InventoryMovementForm;
