/**
 * Basic configuration of environment variables
 * Adjust according to the variables that you really use in your project
 */

export const env = {
  // API URL - lee de la variable de entorno o usa el default
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1",

  // Keys para localStorage (aunque ahora usamos HTTP-only cookies)
  AUTH_STORAGE_KEY: "obsession_auth_token",
  REFRESH_TOKEN_KEY: "obsession_refresh_token",

  // configuration of the app
  APP_NAME: "Obsesion Dashboard",
  APP_VERSION: "1.0.0",
  APP_ENV: import.meta.env.MODE || "development",

  // Meta / Facebook Embedded Signup
  META_APP_ID: import.meta.env.VITE_META_APP_ID || "",
  META_CONFIG_ID: import.meta.env.VITE_META_CONFIG_ID || "",

  // Thirdweb
  THIRDWEB_CLIENT_ID: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "",

  // TouchApp
  TOUCHAPP_URL: import.meta.env.VITE_TOUCHAPP_URL || 'http://localhost:4200',
};

// Helpers to check the environment
export const isDevelopment = env.APP_ENV === "development";
export const isProduction = env.APP_ENV === "production";

export default env;
