import React, { useState } from "react";
import { Button, Box } from "@mui/material";
import SelectorModal from "../../components/SelectorModal"; // Asegúrate de importar la ruta correcta
import { Product } from "../../store/slices/productSlice";
import { Kit } from "../../store/slices/kitSlice";

const SelectorModalTest: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Product | Kit | null>(null);

  return (
    <Box sx={{ p: 3 }}>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open Selector Modal
      </Button>

      <SelectorModal
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(item) => {
          console.log("🔹 Selected Item:", item);
          setSelectedItem(item);
          setOpen(false);
        }}
      />

      {selectedItem && (
        <Box mt={2} p={2} border="1px solid #ccc">
          <h3>Selected Item:</h3>
          <pre>{JSON.stringify(selectedItem, null, 2)}</pre>
        </Box>
      )}
    </Box>
  );
};

export default SelectorModalTest;
