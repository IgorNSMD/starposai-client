import { useState } from "react";
import { Box, TextField, Button, Typography, Container, Grid } from "@mui/material";

interface ContactFormProps {
  title: string;
  description: string;
  fields: { label: string; type: string; name: string; placeholder: string }[];
  buttonText: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ title, description, fields, buttonText }) => {
  const [formData, setFormData] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <Box sx={{ bgcolor: "white", p: 4, borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h4" fontWeight="bold" align="center" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" align="center" sx={{ mb: 3 }}>
        {description}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Container maxWidth="sm">
          <Grid container spacing={2}>
            {fields.map((field, index) => (
              <Grid item xs={12} sm={field.name === "name" || field.name === "email" ? 6 : 12} key={index}>
                <TextField
                  fullWidth
                  variant="outlined"
                  type={field.type}
                  name={field.name}
                  label={field.label}
                  placeholder={field.placeholder}
                  onChange={handleChange}
                  required
                  multiline={field.type === "textarea"}
                  rows={field.type === "textarea" ? 4 : 1}
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                      sx: {
                        color: '#444444',
                        '&.Mui-focused': {
                          color: '#47b2e4',
                        },
                      },
                    },
                  }}
                />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Button variant="contained" color="primary" type="submit">
              {buttonText}
            </Button>
          </Box>
        </Container>
      </form>
    </Box>
  );
};

export default ContactForm;