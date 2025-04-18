import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { getAllPages, getPage } from "./handlers.js";

dotenv.config({});

const app = express();
const port = 8000;

const corsOptions = {
  origin: process.env.ALLOW_ORIGIN,
};

app.use(cors(corsOptions));

app.get("/pages", getAllPages);
app.get("/pages/:page", getPage);

app.listen(port, () => {
  console.log("Listening on port: ", port);
});
