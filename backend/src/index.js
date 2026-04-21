import "../instrument.mjs"
import express from "express";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { functions, inngest } from "./config/inngest.js";
import { serve } from "inngest/express";
import chatRoutes from "./routes/chat.route.js";
import * as Sentry from "@sentry/node"; 
import cors from "cors"


const app = express();
const corsOptions = {
  origin: ENV.CLIENT_URL,
  credentials: true,
};

app.use(cors(corsOptions));
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
