import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
const allowedOrigins = [
  "https://dukan-ghar-api-server-git-main-jafir15s-projects.vercel.app",
  process.env["VERCEL_URL"] ? `https://${process.env["VERCEL_URL"]}` : null,
  ...(process.env["VERCEL_PROJECT_PRODUCTION_URL"]
    ? [`https://${process.env["VERCEL_PROJECT_PRODUCTION_URL"]}`]
    : []),
  ...(process.env["REPLIT_DOMAINS"]
    ? process.env["REPLIT_DOMAINS"].split(",").map((d) => `https://${d.trim()}`)
    : []),
].filter((value): value is string => Boolean(value));

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("CORS blocked"));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
