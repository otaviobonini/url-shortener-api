export const authDocs = {
  "/register": {
    post: {
      summary: "Register a new user",
      tags: ["Auth"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["username", "email", "password"],
              properties: {
                username: {
                  type: "string",
                  minLength: 3,
                  maxLength: 20,
                  example: "otavio",
                },
                email: {
                  type: "string",
                  format: "email",
                  example: "otavio@email.com",
                },
                password: {
                  type: "string",
                  minLength: 6,
                  maxLength: 20,
                  example: "secret123",
                },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "User created successfully" },
        400: { description: "Validation error" },
        409: { description: "Email already in use" },
      },
    },
  },
  "/login": {
    post: {
      summary: "Login and receive a JWT token",
      tags: ["Auth"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: {
                  type: "string",
                  format: "email",
                  example: "otavio@email.com",
                },
                password: { type: "string", example: "secret123" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description:
            "Login successful — copy the token and click Authorize above",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  token: {
                    type: "string",
                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  },
                },
              },
            },
          },
        },
        400: { description: "Validation error" },
        401: { description: "Invalid credentials" },
      },
    },
  },
};
