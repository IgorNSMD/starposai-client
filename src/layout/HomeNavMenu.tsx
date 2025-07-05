import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';

import { navMenuStyle } from '../styles/HomeStyles';


const HomeNavMenu: React.FC = () => {

  const [activeSection, setActiveSection] = useState<string>("");

  const handleScroll = () => {
    const sections = ["hero", "about", "services", "pricing", "contact"];
    let foundSection = "";

    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
          foundSection = section;
          break;
        }
      }
    }

    setActiveSection(foundSection);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Renderiza el menú completo
  const renderMenu = () => (
    <List sx={navMenuStyle}>
      <ListItem disablePadding>
        <ListItemButton 
           onClick={() => document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" })}
           sx={{
             color: activeSection === "hero" ? "primary.main" : "white",
             fontWeight: activeSection === "hero" ? "bold" : "normal",
           }}
        >
          <ListItemText primary="Home" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton
          onClick={() => {
            const aboutSection = document.getElementById("about");
            if (aboutSection) {
              aboutSection.style.display = "block"; // Mostrar About cuando se hace clic
              aboutSection.scrollIntoView({ behavior: "smooth" });
            }
          }}
          sx={{
              color: activeSection === "about" ? "primary.main" : "white",
              fontWeight: activeSection === "about" ? "bold" : "normal",
          }}
        >
          <ListItemText primary="About" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
      <ListItemButton
          onClick={() => {
            const servicesSection = document.getElementById("services");
            if (servicesSection) {
              servicesSection.style.display = "block"; // Mostrar Services cuando se hace clic
              servicesSection.scrollIntoView({ behavior: "smooth" });
            }
          }}
          sx={{
            color: activeSection === "services" ? "primary.main" : "white",
            fontWeight: activeSection === "services" ? "bold" : "normal",
          }}
        >
          <ListItemText primary="Services" />
        </ListItemButton>
      </ListItem>
      {/* <ListItem disablePadding>
        <ListItemButton href="#portfolio">
          <ListItemText primary="Portfolio" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton href="#team">
          <ListItemText primary="Team" />
        </ListItemButton>
      </ListItem> */}
      <ListItem disablePadding>
        <ListItemButton 
          onClick={() => {
            const pricingSection = document.getElementById("pricing");
            if (pricingSection) {
              pricingSection.style.display = "block"; // Mostrar Services cuando se hace clic
              pricingSection.scrollIntoView({ behavior: "smooth" });
            }
          }}
          sx={{
            color: activeSection === "pricing" ? "primary.main" : "white",
            fontWeight: activeSection === "pricing" ? "bold" : "normal",
          }}
          >
          <ListItemText primary="Pricing" />
        </ListItemButton>
      </ListItem>

      {/* Dropdown */}
      {/* <ListItem disablePadding>
        <ListItemButton onClick={handleOpenMenu}>
          <ListItemText primary="Dropdown" />
          {anchorEl ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          sx={{
            '& .MuiPaper-root': {
              backgroundColor: '#3d4d6a',
              color: '#ffffff',
              boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.1)',
              borderRadius: '6px',
            },
          }}
        >
          <MenuItem onClick={handleCloseMenu}>Dropdown 1</MenuItem>
          <MenuItem onClick={handleOpenSubMenu}>
            Deep Dropdown {subAnchorEl ? <ExpandLess /> : <ExpandMore />}
          </MenuItem>
          <Menu
            anchorEl={subAnchorEl}
            open={Boolean(subAnchorEl)}
            onClose={handleCloseSubMenu}
            sx={{
              '& .MuiPaper-root': {
                backgroundColor: '#3d4d6a',
                color: '#ffffff',
                boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.1)',
                borderRadius: '6px',
              },
            }}
            transformOrigin={{
              horizontal: 'left',
              vertical: 'top',
            }}
            anchorOrigin={{
              horizontal: 'right',
              vertical: 'top',
            }}
          >
            <MenuItem onClick={handleCloseSubMenu}>Deep Dropdown 1</MenuItem>
            <MenuItem onClick={handleCloseSubMenu}>Deep Dropdown 2</MenuItem>
          </Menu>
          <MenuItem onClick={handleCloseMenu}>Dropdown 2</MenuItem>
          <MenuItem onClick={handleCloseMenu}>Dropdown 3</MenuItem>
        </Menu>
      </ListItem> */}

      <ListItem disablePadding>
        <ListItemButton 
          onClick={() => {
            const contactSection  = document.getElementById("contact");
            if (contactSection ) {
              contactSection .style.display = "block"; // Mostrar Services cuando se hace clic
              contactSection .scrollIntoView({ behavior: "smooth" });
            }
          }}
          sx={{
            color: activeSection === "contact" ? "primary.main" : "white",
            fontWeight: activeSection === "contact" ? "bold" : "normal",
          }}
          >
          <ListItemText primary="Contact" />
        </ListItemButton>
      </ListItem>

    </List>
  );

  return (
    renderMenu()
  );
};

export default HomeNavMenu;