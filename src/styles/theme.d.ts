import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    customColors: {
      nav: string;
      navHover: string;
      navMobileBg: string;
      navDropdownBg: string;
      navDropdown: string;
      navDropdownHover: string;
    };
    darkBackground: {
      default: string;
      surface: string;
      textPrimary: string;
      heading: string;
    };
  }
  interface PaletteOptions {
    customColors?: {
      nav?: string;
      navHover?: string;
      navMobileBg?: string;
      navDropdownBg?: string;
      navDropdown?: string;
      navDropdownHover?: string;
    };
    darkBackground?: {
      default?: string;
      surface?: string;
      textPrimary?: string;
      heading?: string;
    };
  }
}
