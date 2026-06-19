require("dotenv").config();
console.log("MONGODB_URI =", process.env.MONGODB_URI);
console.log("PORT =", process.env.PORT);
const http = require("http");
const express = require("express");
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

app.use(helmet());
app.use(cors({ 
  origin: [process.env.FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"], 
  credentials: true 
}));
app.use(express.json());
app.use(morgan("dev"));
app.use(apiLimiter);

app.get("/health", (req, res) => res.json({ status: "ok" }));

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

const { authenticate, authorize } = require("./middleware/auth");
app.get(
  "/internal/stats",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    const [users, contacts, deals] = await Promise.all([
      User.countDocuments(),
      Contact.countDocuments(),
      Deal.countDocuments(),
    ]);
    res.json({ users, contacts, deals, uptimeSeconds: process.uptime() });
  },
);

// 404 + error handlers
app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal server error" });
});

const server = http.createServer(app);
initSocket(server);

connectDB().then(() => {
  initGridFS();
  require("./events/listeners");
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () =>
    console.log(`NexCRM API + Socket.IO running on port ${PORT}`),
  );
});

module.exports = app;
