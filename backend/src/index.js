import "../instrument.mjs"
import express from "express";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { functions, inngest } from "./config/inngest.js";
import { serve } from "inngest/express";
import chatRoutes from "./routes/chat.route.js";
import * as Sentry from "@sentry/node"; 


const app = express();
const defaultOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://slack-clone-project-frontend.vercel.app",
];

const configuredOrigins = [...new Set([...defaultOrigins, ENV.CLIENT_URL, ENV.CLIENT_URLS])]
  .filter(Boolean)
  .flatMap((value) => value.split(","))
  .map((value) => value.trim())
  .filter(Boolean);

const getVercelProjectRoot = (origin) => {
  try {
    const { hostname } = new URL(origin);

    if (!hostname.endsWith(".vercel.app")) {
      return null;
    }

    const projectSlug = hostname.replace(".vercel.app", "");
    return projectSlug.split("-git-")[0];
  } catch {
    return null;
  }
};

const vercelProjectRoots = [...new Set(
  configuredOrigins
    .map(getVercelProjectRoot)
    .filter(Boolean),
)];

const vercelProductionOrigins = vercelProjectRoots.map(
  (projectRoot) => `https://${projectRoot}.vercel.app`,
);

const vercelPreviewOrigins = vercelProjectRoots.map(
  (projectRoot) => `https://${projectRoot}-git-`,
);

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (
    configuredOrigins.includes(origin) ||
    vercelProductionOrigins.includes(origin)
  ) {
    return true;
  }

  return vercelPreviewOrigins.some(
    (previewPrefix) =>
      origin.startsWith(previewPrefix) && origin.endsWith(".vercel.app"),
  );
};

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (isAllowedOrigin(origin)) {
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
    }

    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(isAllowedOrigin(origin) ? 204 : 403);
  }

  return next();
});
app.use(clerkMiddleware());
app.use(express.json());
app.get("/debug-sentry", (req,res) =>{
  throw new Error("my first sentry error")
});

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat",chatRoutes)
 

Sentry.setupExpressErrorHandler(app)
app.get("/", (req, res) => {
  return res.send("hello");
});

app.get("/api/health", async (req, res) => {
  try {
    await connectDB();
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "Database connection failed",
    });
  }
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => {
      console.log("Server is running on port:", ENV.PORT);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

if (ENV.NODE_ENV !== "production") {
  startServer();
}

export default app;
