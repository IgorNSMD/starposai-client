import React from 'react';
import { Box, } from '@mui/material';
import { mainStyle } from '../styles/HomeStyles';
import HomeSection from './HomeSection';
import AboutSection from "../components/AboutSection";
import ServicesSection from "../components/ServicesSection";
import PricingSection from "../components/PricingSection";
import ContactSection from "../components/ContactSection";

const HomeMain: React.FC = () => {
  return (
    <Box component="main" 
      sx={mainStyle}
      >

      {/* ✅ Sección Hero */}
      <HomeSection />

      {/* Sección About con contenido dinámico desde JSON */}
      <AboutSection />

      {/* Services Section */}
      <ServicesSection />

      {/* Pricing */}
      <PricingSection /> 

      {/* Contact */}
      <ContactSection />
    </Box>
  );
};

export default HomeMain;