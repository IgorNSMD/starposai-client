import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './store/store'; // Importa el store configurado con Redux

import App from './App.tsx'
//import './index.css'


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
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
    </Provider>
  </React.StrictMode>
);