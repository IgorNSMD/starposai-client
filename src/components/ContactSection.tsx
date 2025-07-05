import { useEffect, useState } from "react";
import { Box, Container } from "@mui/material";
import ContactForm from "./ContactForm";

interface ContactData {
    title: string;
    description: string;
    fields: { label: string; type: string; name: string; placeholder: string }[];
    buttonText: string;
  }

const ContactSection: React.FC = () => {
    const [contactData, setContactData] = useState<ContactData | null>(null);

  useEffect(() => {
    import("../data/homeContent.json")
      .then((data) => setContactData(data.contact))
      .catch((error) => console.error("Error loading contact content:", error));
  }, []);

  if (!contactData) return null;

  return (
    <Box 
        id="contact" 
        sx={{
            py: 10,
            bgcolor: "#f4f4f4", // Color de fondo claro
            width: "100%",       // Ocupa todo el ancho disponible
            minHeight: "100vh",  // Ocupa al menos el alto de la pantalla
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }}
        >
      <Container maxWidth="md">
        <ContactForm {...contactData} />
      </Container>
    </Box>
  );
};

export default ContactSection;
