import { Container } from "./di/container";
import { createServer } from "http";

const container = new Container();
const controller = container.getController();
const bot = container.getBot();

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
    await controller.stop();
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
await controller.start();
