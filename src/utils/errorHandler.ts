import Logger from "./logger.js";

export function setupErrorHandlers(): void {
  process.on("unhandledRejection", (reason) => {
    Logger.error("Unhandled Rejection", reason);
    process.exit(1);
  });

  process.on("uncaughtException", (error) => {
    Logger.error("Uncaught Exception", error);
    process.exit(1);
  });
}