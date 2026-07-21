import "dotenv/config";
import app from "./app.js";
import { env } from "../schemas/env.schema.js";
import { redis } from "../database/redis.js";
import { prisma } from "../database/prisma.js";
import { startCleanupJob, stopCleanupJob } from "../jobs/cleanupRefreshTokens.js";

const port = env.PORT ?? 3000;

const server = app.listen(port, () => console.log(`http://localhost:${port}`));
startCleanupJob();

let isShuttingDown = false;

async function gracefulShutdown(signal: string) {
    if (isShuttingDown) {
        console.log(`Received ${signal} again, forcefully shutting down...`);
        process.exit(1)
        // If we reach this stage, it means the server is taking too long to close, so we forcefully exit.
    
        }
        isShuttingDown = true; 
        await stopCleanupJob(); // Stop the cleanup job to prevent it from running during shutdown.
        const forceExit = setTimeout(() => {   // If it takes more than 10 seconds to close, we forcefully exit.
    console.error("Forced shutdown by timeout");
    process.exit(1);
  }, 10_000);
  forceExit.unref();  
         server.close(async () => { // Our normal way to shutdown gracefully.
            try {
                console.log(`Received ${signal}, shutting down gracefully...`);
                await prisma.$disconnect();
                await redis.quit();
                console.log("Server closed gracefully.");
                process.exit(0);
            }
            catch (err) {
                console.error("Error during shutdown:", err);
                process.exit(1);
            }
        });
    }

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));