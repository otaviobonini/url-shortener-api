export const urlDocs = {
  "/url": {
    post: {
      summary: "Create a short URL",
      tags: ["URL"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["url"],
              properties: {
                url: {
                  type: "string",
                  format: "uri",
                  example: "https://github.com/otaviobonini",
                },
                expires: {
                  type: "string",
                  format: "date-time",
                  example: "2026-12-31T23:59:59.000Z",
                  description: "Optional expiration date",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Short URL created",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  id: { type: "integer", example: 1 },
                  hashedUrl: { type: "string", example: "abc123" },
                  originalUrl: {
                    type: "string",
                    example: "https://github.com/otaviobonini",
                  },
                  expires: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                },
              },
            },
          },
        },
        400: { description: "Validation error" },
        401: { description: "Missing or invalid token" },
        429: { description: "Too many requests" },
      },
    },
    get: {
      summary: "List all URLs for the authenticated user",
      tags: ["URL"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "query",
          name: "page",
          schema: { type: "integer", default: 1 },
          description: "Page number",
        },
        {
          in: "query",
          name: "limit",
          schema: { type: "integer", default: 10 },
          description: "Items per page",
        },
      ],
      responses: {
        200: {
          description: "List of URLs",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "integer", example: 1 },
                        hashedUrl: { type: "string", example: "abc123" },
                        originalUrl: {
                          type: "string",
                          example: "https://github.com/otaviobonini",
                        },
                        expires: {
                          type: "string",
                          format: "date-time",
                          nullable: true,
                        },
                        createdAt: { type: "string", format: "date-time" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: "Missing or invalid token" },
        429: { description: "Too many requests" },
      },
    },
  },
  "/url/{id}": {
    delete: {
      summary: "Delete a short URL by ID",
      tags: ["URL"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "integer" },
          description: "ID of the URL to delete",
          example: 1,
        },
      ],
      responses: {
        200: { description: "URL deleted successfully" },
        401: { description: "Missing or invalid token" },
        404: { description: "URL not found" },
        429: { description: "Too many requests" },
      },
    },
  },
  "/url/{hashedUrl}": {
    get: {
      summary: "Redirect to the original URL",
      tags: ["Redirect"],
      parameters: [
        {
          in: "path",
          name: "hashedUrl",
          required: true,
          schema: { type: "string" },
          example: "abc123",
        },
      ],
      responses: {
        302: { description: "Redirects to the original URL" },
        404: { description: "Short URL not found or expired" },
        429: { description: "Too many requests" },
      },
    },
  },
};
