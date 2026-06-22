require("dotenv").config();

const http = require("http");
const express = require("express");

// Express 4 Async Error Monkey Patch
const Layer = require('express/lib/router/layer');
const handleRequest = Layer.prototype.handle_request;
Layer.prototype.handle_request = function (req, res, next) {
  if (!this.isAsync) {
    this.isAsync = true;
    const fn = this.handle;
    this.handle = function (req, res, next) {
      const result = fn.apply(this, arguments);
      if (result && result.catch) result.catch(next);
      return result;
    };
  }
  return handleRequest.apply(this, arguments);
};

const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { connectDB } = require("./config/db");
const { initGridFS } = require("./config/gridfs");
const { initSocket } = require("./realtime/socket");
const { apiLimiter } = require("./middleware/rateLimit");

const User = require("./models/User");
const Contact = require("./models/Contact");
const Deal = require("./models/Deal");

const app = express();

// Security & Middleware
app.use(helmet());

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ].filter(Boolean),
    credentials: true,
  }),
);

app.use(express.json());
app.use(morgan("dev"));
app.use(apiLimiter);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "NexCRM Backend Running",
    timestamp: new Date(),
  });
});

// Routes
app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/contacts", require("./routes/contactRoutes"));
app.use("/api/v1/leads", require("./routes/leadRoutes"));
app.use("/api/v1/deals", require("./routes/dealRoutes"));
app.use("/api/v1/tasks", require("./routes/taskRoutes"));
app.use("/api/v1/search", require("./routes/searchRoutes"));
app.use("/api/v1/analytics", require("./routes/analyticsRoutes"));
app.use("/api/v1/notifications", require("./routes/notificationRoutes"));
app.use("/api/v1/files", require("./routes/fileRoutes"));
app.use("/api/v1/activities", require("./routes/activityRoutes"));
app.use("/api/v1/companies", require("./routes/companyRoutes"));
app.use("/api/v1/tickets", require("./routes/ticketRoutes"));
app.use("/api/v1/quotations", require("./routes/quotationRoutes"));
app.use("/api/v1/invoices", require("./routes/invoiceRoutes"));
app.use("/api/v1/users", require("./routes/userRoutes"));
app.use("/api/v1/meetings", require("./routes/meetingRoutes"));
app.use("/api/v1/call-logs", require("./routes/callLogRoutes"));
app.use("/api/v1/products", require("./routes/productRoutes"));

// Protected Internal Stats Route
const { authenticate, authorize } = require("./middleware/auth");

app.get(
  "/internal/stats",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    try {
      const [users, contacts, deals] = await Promise.all([
        User.countDocuments(),
        Contact.countDocuments(),
        Deal.countDocuments(),
      ]);

      res.json({
        users,
        contacts,
        deals,
        uptimeSeconds: process.uptime(),
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  },
);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Connect Database & Start Server
(async () => {
  try {
    console.log("Connecting to MongoDB...");

    await connectDB();

    console.log("MongoDB Connected Successfully");

    initGridFS();

    require("./events/listeners");

    const PORT = process.env.PORT || 3001;

    server.listen(PORT, () => {
      console.log(`🚀 NexCRM API running on port ${PORT}`);
      console.log(`🏥 Health Check: /health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();

module.exports = app;
