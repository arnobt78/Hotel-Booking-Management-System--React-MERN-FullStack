import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hotel Booking API",
      version: "1.0.0",
      description:
        "A comprehensive API for hotel booking and management system",
      contact: {
        name: "API Support",
        email: "support@mernholidays.com",
      },
    },
    servers: [
      {
        url: "http://localhost:7002",
        description: "Development server",
      },
      {
        url: "https://your-production-domain.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "jwt",
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // Path to the API routes
};

export const specs = swaggerJsdoc(options);
