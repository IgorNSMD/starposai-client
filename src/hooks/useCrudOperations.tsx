import { useState } from 'react';
import { unwrapResult } from '@reduxjs/toolkit';
import { useAppDispatch } from '../store/redux/hooks';

// Interfaz para representar un elemento con una propiedad 'id'
interface Identifiable {
  id: string;
}

// Interfaz para las acciones CRUD
interface CrudActions<T> {
  fetchItems: () => Promise<void>;
  createItem: (data: T) => Promise<void>;
  updateItem: (data: T) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

// Hook genérico para operaciones CRUD
export const useCrudOperations = <T extends Identifiable>(
  fetchAction: () => Promise<{ payload: T[] }>,
  createAction: (data: T) => Promise<{ payload: T }>,
  updateAction: (data: T) => Promise<{ payload: T }>,
  deleteAction: (id: string) => Promise<{ payload: string }>
): CrudActions<T> => {
  const dispatch = useAppDispatch();
  const [items, setItems] = useState<T[]>([]); // Estado para los elementos

  const fetchItems = async () => {
    try {
      const resultAction = await dispatch(fetchAction());
      const data = unwrapResult(resultAction); // Extrae el `payload`
      setItems(data); // Actualiza el estado con los elementos
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const createItem = async (data: T) => {
    try {
      const resultAction = await dispatch(createAction(data));
      const newItem = unwrapResult(resultAction); // Extrae el `payload`
      setItems((prev) => [...prev, newItem]); // Agrega el nuevo elemento
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const updateItem = async (data: T) => {
    try {
      const resultAction = await dispatch(updateAction(data));
      const updatedItem = unwrapResult(resultAction); // Extrae el `payload`
      setItems((prev) =>
        prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      ); // Actualiza el elemento
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const resultAction = await dispatch(deleteAction(id));
      const deletedId = unwrapResult(resultAction); // Extrae el `payload`
      setItems((prev) => prev.filter((item) => item.id !== deletedId)); // Elimina el elemento
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return { fetchItems, createItem, updateItem, deleteItem };
};