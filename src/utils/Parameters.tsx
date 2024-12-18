export const baseURL =
  import.meta.env.VITE_APP_ENV === 'production'
    ? import.meta.env.VITE_APP_API_URL_SERVER
    : import.meta.env.VITE_APP_API_URL_LOCAL;

export const baseURL_MENUICONS =
    import.meta.env.VITE_APP_ENV === 'production'
      ? import.meta.env.VITE_APP_API_URL_MENUICON_SERVER
      : import.meta.env.VITE_APP_API_URL_MENUICON_LOCAL;    