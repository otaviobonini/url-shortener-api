import cron, { type ScheduledTask } from "node-cron";
import AuthService from "../services/AuthService.js";

const authService = new AuthService();
const schedule = "0 3 * * *"; // Every day at 3 AM

let task: ScheduledTask | null = null;

export async function cleanupRefreshTokens() {
  try {
    const deletedCount = await authService.purgeExpiredRefreshTokens();
    console.log(`Cleanup job completed. Deleted ${deletedCount} expired refresh tokens.`);
  } catch (error) {
    console.error("Error during cleanup job:", error);
  }
}

export function startCleanupJob() {
  cleanupRefreshTokens(); // Run immediately on startup
  task = cron.schedule(schedule, cleanupRefreshTokens, {
    timezone: "America/Sao_Paulo",
  });
}

export async function stopCleanupJob() {
  await task?.stop();
  task = null;
}