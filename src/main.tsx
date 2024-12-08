import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import { Toaster } from 'react-hot-toast';

import store, { persistor } from './store/store'; // Usamos `store` como default y `persistor` como export nombrado

import App from './App';
import homeTheme from './styles/HomeTheme';
import adminTheme from './styles/AdminTheme';

const isAuthenticated = false; // Cambia según tu lógica de autenticación

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <ThemeProvider theme={homeTheme}>
          <CssBaseline />
          <GlobalStyles
            styles={{
              ':root': {
                scrollBehavior: 'smooth',
              },
            }}
          />
          <App />
          <Toaster
            toastOptions={{
              position : 'top-right',
              style : {
                background : '#283046',
                color : 'white'
              }
            }} 
          />
        </ThemeProvider>    
      </PersistGate>
    </Provider>
  </React.StrictMode>
);