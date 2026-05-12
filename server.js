const express = require("express");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const app = express();

const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";

/* -------------------------------------------------------------------------- */
/*                                Middleware                                  */
/* -------------------------------------------------------------------------- */

app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(compression());

app.use(
  morgan(isProduction ? "combined" : "dev")
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------------------------------------------------------------- */
/*                              Static Resources                              */
/* -------------------------------------------------------------------------- */

app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: isProduction ? "1d" : 0,
    etag: true,
  })
);

/* -------------------------------------------------------------------------- */
/*                                   Routes                                   */
/* -------------------------------------------------------------------------- */

app.get("/health", (_, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/auth_config.json", (_, res) => {
  res.sendFile(path.join(__dirname, "auth_config.json"));
});

app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* -------------------------------------------------------------------------- */
/*                              Error Handling                                */
/* -------------------------------------------------------------------------- */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, _, res, __) => {
  console.error("Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* -------------------------------------------------------------------------- */
/*                               Server Export                                */
/* -------------------------------------------------------------------------- */

process.on("SIGINT", () => {
  console.log("\nGracefully shutting down server...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Closing server...");
  process.exit(0);
});

module.exports = app;
