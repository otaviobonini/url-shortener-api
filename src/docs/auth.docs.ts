export const authDocs = {
  "/auth/register": {
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
  "/auth/login": {
    post: {
      summary: "Login and receive a JWT access token",
      description:
        "Returns a short-lived access token in the body and sets the refresh " +
        "token in an httpOnly `refreshToken` cookie. Copy the access token and " +
        "click Authorize above to call protected endpoints.",
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
            "Login successful — access token in the body, refresh token set as an httpOnly cookie",
          headers: {
            "Set-Cookie": {
              description: "httpOnly refreshToken cookie",
              schema: { type: "string" },
            },
          },
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  id: { type: "integer", example: 1 },
                  email: { type: "string", example: "otavio@email.com" },
                  username: { type: "string", example: "otavio" },
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
  "/auth/refresh": {
    post: {
      summary: "Rotate the refresh token and issue a new access token",
      description:
        "Reads the httpOnly `refreshToken` cookie, rotates it (old one is " +
        "revoked, a new one is set) and returns a fresh access token in the body.",
      tags: ["Auth"],
      responses: {
        200: {
          description: "New access token issued and refresh cookie rotated",
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
        401: { description: "Refresh token missing, invalid or expired" },
      },
    },
  },
  "/auth/logout": {
    post: {
      summary: "Log out and revoke the refresh token",
      description:
        "Revokes the refresh token stored in the httpOnly `refreshToken` cookie " +
        "and clears it. Always returns 204, even if no cookie is present.",
      tags: ["Auth"],
      responses: {
        204: { description: "Logged out" },
      },
    },
  },
};
