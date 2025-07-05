export const baseURL =
  import.meta.env.VITE_APP_ENV === 'production'
    ? import.meta.env.VITE_APP_API_URL_SERVER
    : import.meta.env.VITE_APP_API_URL_LOCAL;

export const baseURL_MENUICONS =
    import.meta.env.VITE_APP_ENV === 'production'
      ? import.meta.env.VITE_APP_API_URL_MENUICON_SERVER
      : import.meta.env.VITE_APP_API_URL_MENUICON_LOCAL;    

export const baseURL_CATALOGICONS =
      import.meta.env.VITE_APP_ENV === 'production'
        ? import.meta.env.VITE_APP_API_URL_CATALOGICON_SERVER
        : import.meta.env.VITE_APP_API_URL_CATALOGICON_LOCAL;

export const baseURL_PAYMENTICONS =
        import.meta.env.VITE_APP_ENV === 'production'
          ? import.meta.env.VITE_APP_API_URL_PAYMENTICON_SERVER
          : import.meta.env.VITE_APP_API_URL_PAYMENTICON_LOCAL;        