import { authDocs } from "../docs/auth.docs.js";
import { urlDocs } from "../docs/url.docs.js";

export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "URL Shortener API",
    description: "REST API for shortening URLs with JWT authentication",
  },
  servers: [
    {
      url: "https://url-shortener-api-1-dbal.onrender.com",
      description: "Production",
    },
    { url: "http://localhost:3000", description: "Local" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  paths: {
    ...authDocs,
    ...urlDocs,
  },
};
