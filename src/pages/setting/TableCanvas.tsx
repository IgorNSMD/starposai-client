import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, Paper, Select, MenuItem } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../store/redux/hooks";
import { fetchRooms } from "../../store/slices/roomSlice";
import {
  fetchTablesByRoom,
  updateTablePosition,
} from "../../store/slices/tableSlice";
import { formContainer_v2 } from "../../styles/AdminStyles";

const gridSize = 50;
const gridColumns = 800 / gridSize; // = 16
const gridRows = 500 / gridSize;    // = 10
const canvasAspectRatio = 800 / 500; // 1.6

const TableCanvas: React.FC = () => {
  const dispatch = useAppDispatch();
  const { rooms } = useAppSelector((state) => state.rooms);
  const { tables } = useAppSelector((state) => state.tables);

  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [touchTableId, setTouchTableId] = useState<string | null>(null);

  const [touchOffset, setTouchOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [currentTouchPos, setCurrentTouchPos] = useState<{ x: number; y: number } | null>(null);
  const [targetGridPos, setTargetGridPos] = useState<{ x: number, y: number } | null>(null);
  //const [disableNextTransition, setDisableNextTransition] = useState(false);
  const [transitionLockedTableId, setTransitionLockedTableId] = useState<string | null>(null);


  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  useEffect(() => {
    if (selectedRoom) {
      dispatch(fetchTablesByRoom(selectedRoom));
    }
  }, [selectedRoom, dispatch]);

  useEffect(() => {
  if (!targetGridPos) return;

  const moved = tables.some(table =>
    table._id === touchTableId &&
    table.position.x === targetGridPos.x &&
    table.position.y === targetGridPos.y
  );

  if (moved) {
    setCurrentTouchPos(null);
    setTargetGridPos(null);
    setTouchTableId(null); // ✅ aquí es donde se limpia de forma sincronizada
    setTransitionLockedTableId(null); // 👈 limpias solo cuando realmente ya se movió
  }
}, [tables, targetGridPos, touchTableId]);


  return (
    <Box sx={{
      ...formContainer_v2,
      fontSize: {
        xs: '0.65rem',  // móviles
        sm: '0.75rem',  // tablets
        md: '0.9rem',   // escritorio
        lg: '1rem',     // pantallas grandes
      },
      textAlign: 'center',
    }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Table Map
      </Typography>
      <Select
        value={selectedRoom}
        onChange={(e) => setSelectedRoom(e.target.value)}
        displayEmpty
        fullWidth
        sx={{ mb: 3 }}
      >
        <MenuItem value="" disabled>
          Selecciona un salón
        </MenuItem>
        {rooms.map((room) => (
          <MenuItem key={room._id} value={room._id}>
            {room.name}
          </MenuItem>
        ))}
      </Select>

      <Paper
        ref={canvasRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          const tableId = e.dataTransfer.getData("tableId");
          const canvas = canvasRef.current;
          if (!canvas || !tableId) return;

          const canvasRect = canvas.getBoundingClientRect();

          const adjustedX = e.clientX - canvasRect.left - dragOffset.x;
          const adjustedY = e.clientY - canvasRect.top - dragOffset.y;

          const newPosX = Math.round(adjustedX / gridSize);
          const newPosY = Math.round(adjustedY / gridSize);

          dispatch(updateTablePosition({
            id: tableId,
            posX: newPosX,
            posY: newPosY,
          })).then(() => {
            dispatch(fetchTablesByRoom(selectedRoom));
          });
        }}
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 800,
          aspectRatio: `${canvasAspectRatio}`,
          border: "2px dashed #ccc",
          margin: "0 auto",
          backgroundImage: `linear-gradient(to right, #eee 1px, transparent 1px), 
                            linear-gradient(to bottom, #eee 1px, transparent 1px)`,
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      >
        {tables.map((table) => (
          <Box
            key={table._id}
            draggable
            onDragStart={(e) => {
              const target = e.target as HTMLDivElement;
              const rect = target.getBoundingClientRect();

              const offsetX = e.clientX - rect.left;
              const offsetY = e.clientY - rect.top;

              setDragOffset({ x: offsetX, y: offsetY });

              e.stopPropagation();
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("tableId", table._id);
            }}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              const canvas = canvasRef.current;
              if (!canvas) return;

              const canvasRect = canvas.getBoundingClientRect();

              const offsetX = touch.clientX - canvasRect.left - table.position.x * gridSize;
              const offsetY = touch.clientY - canvasRect.top - table.position.y * gridSize;

              setTouchOffset({ x: offsetX, y: offsetY });
              setTouchTableId(table._id);
            }}

            onTouchMove={(e) => {
              const touch = e.touches[0];
              const canvas = canvasRef.current;
              if (!canvas || table._id !== touchTableId) return;

              const canvasRect = canvas.getBoundingClientRect();

              const x = touch.clientX - canvasRect.left - touchOffset.x;
              const y = touch.clientY - canvasRect.top - touchOffset.y;

              setCurrentTouchPos({ x, y });
            }}


            onTouchEnd={(e) => {
              const touch = e.changedTouches[0];
              const canvas = canvasRef.current;
              if (!canvas || !touchTableId) return;

              const canvasRect = canvas.getBoundingClientRect();
              const adjustedX = touch.clientX - canvasRect.left - touchOffset.x;
              const adjustedY = touch.clientY - canvasRect.top - touchOffset.y;

              const newPosX = Math.round(adjustedX / gridSize);
              const newPosY = Math.round(adjustedY / gridSize);

              setTransitionLockedTableId(touchTableId);

              dispatch(updateTablePosition({
                id: touchTableId,
                posX: newPosX,
                posY: newPosY,
              })).then(() => {
                dispatch(fetchTablesByRoom(selectedRoom));
              });

              //setTouchTableId(null);
              setTargetGridPos({ x: newPosX, y: newPosY });

            }}


            sx={{
              position: "absolute",
              left: touchTableId === table._id && currentTouchPos
                ? `${(currentTouchPos.x / (gridColumns * gridSize)) * 100}%`
                : `${(table.position.x / gridColumns) * 100}%`,
              top: touchTableId === table._id && currentTouchPos
                ? `${(currentTouchPos.y / (gridRows * gridSize)) * 100}%`
                : `${(table.position.y / gridRows) * 100}%`,
              width: {
                xs: 48,   // móviles
                sm: 64,   // tablets
                md: 72,   // desktop
                lg: 80,   // grandes
              },
              height: {
                xs: 48,
                sm: 64,
                md: 72,
                lg: 80,
              },
              fontSize: {
                xs: '0.65rem',  // móviles
                sm: '0.75rem',  // tablets
                md: '0.9rem',   // escritorio
                lg: '1rem',     // pantallas grandes
              },
              textAlign: 'center',
              backgroundColor:
                table.status === "occupied" ? "#d32f2f" :
                table.status === "reserved" ? "#ffa000" : "#1976d2",
              color: "white",
              borderRadius: table.shape === "Circle" ? "50%" : "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "grab",
              userSelect: "none",
              transition:
                touchTableId === table._id && currentTouchPos
                  ? "none"
                  : transitionLockedTableId === table._id
                    ? "none"
                    : "left 0.2s ease, top 0.2s ease",

            }}
          >
            {table.name}
          </Box>
        ))}
      </Paper>
    </Box>
  );
};

export default TableCanvas;
