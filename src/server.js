import app from "./app.js";
import { port } from "./config/env.js";
import { testConnection } from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import db from "./models/index.js";

// Start server function
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Connect to Redis
    await connectRedis();

    // Initialize database (create tables and default roles)
    await db.initialize();

    // Start server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  try {
    await db.sequelize.close();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
});

// Start the server
startServer();
