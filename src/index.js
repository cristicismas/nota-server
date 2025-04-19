import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import validateSession from "./helpers/validateSession.js";

import {
  getAllPages,
  getPage,
  login,
  validate,
  logout,
  addPage,
} from "./handlers.js";

dotenv.config({});

const app = express();
const port = 8000;

const corsOptions = {
  origin: process.env.ALLOW_ORIGIN,
  credentials: true,
};

const nonProtectedRoutes = ["/login"];

app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use(cookieParser());

app.use((req, res, next) => {
  if (nonProtectedRoutes.includes(req.path)) {
    next();
  } else {
    const isValid = validateSession(req);

    if (!isValid) {
      return res.status(401).json({ message: "Session id is invalid" });
    }

    next();
  }
});

app.post("/login", login);
app.post("/logout", logout);
app.post("/validate", validate);

app.post("/page", addPage);

app.get("/pages", getAllPages);
app.get("/pages/:page", getPage);

app.listen(port, () => {
  console.log("Listening on port: ", port);
});
