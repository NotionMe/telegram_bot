import { Container } from "./di/container";
import { createServer } from "http";

const container = new Container();
const controller = container.getController();
const bot = container.getBot();

// Start a dummy server for health checks (Koyeb requires a port to be open)
const port = process.env.PORT || 8000;
createServer((req, res) => {
  res.writeHead(200);
  res.end("Health check OK");
}).listen(port, () => {
  console.log(`Health check server running on port ${port}`);
});

const signals = ["SIGINT", "SIGTERM"];

for (const signal of signals) {
  process.on(signal, async () => {
    console.log(`Received ${signal}. Initiating graceful shutdown...`);
    // Stop the bot to prevent conflict with the new instance
    try {
        await controller.stop();
        console.log("Bot stopped gracefully.");
    } catch (err) {
        console.error("Error stopping bot:", err);
    }
    process.exit(0);
  });
}

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});

controller.registerRoutes();

// Catch 'Conflict: terminated by other getUpdates request' to restart gracefully
try {
    await controller.start();
} catch (error: any) {
    if (error?.message?.includes("Conflict: terminated by other getUpdates request")) {
        console.error("Conflict detected! Another instance is running. Exiting...");
        process.exit(1); 
    } else {
        throw error;
    }
}