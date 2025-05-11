// db.js
// Role: Establish and manage MongoDB connection using Mongoose

import mongoose from "mongoose";

/**
 * Connects to MongoDB using the connection string from environment variables.
 * Logs success or failure to the console for monitoring.
 */
function connect() {
  mongoose
    .connect(process.env.mongoDBURL, {
      // Recommended options to avoid deprecation warnings
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("✅ Database connection established");
    })
    .catch((error) => {
      console.error("❌ Database connection error:", error);
      // Optionally exit process on failure:
      // process.exit(1);
    });
}

export default connect;
