export const environment = {
  production: false,
  // En desarrollo usamos la ruta relativa: el proxy (proxy.conf.json)
  // redirige /api -> http://localhost:3000. Evita problemas de CORS.
  apiUrl: '/api',
};
