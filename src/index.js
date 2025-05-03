import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import validateSession from "./helpers/validateSession.js";

import getAllPages from "./handlers/getAllPages.js";
import getPage from "./handlers/getPage.js";
import login from "./handlers/login.js";
import validate from "./handlers/validate.js";
import logout from "./handlers/logout.js";
import addPage from "./handlers/addPage.js";
import deletePage from "./handlers/deletePage.js";
import editTabContent from "./handlers/editTabContent.js";
import renamePage from "./handlers/renamePage.js";
import addTab from "./handlers/addTab.js";
import deleteTab from "./handlers/deleteTab.js";
import renameTab from "./handlers/renameTab.js";
import getKanbanContent from "./handlers/getKanbanContent.js";
import addCard from "./handlers/addCard.js";
import deleteCard from "./handlers/deleteCard.js";
import editCard from "./handlers/editCard.js";
import addCategory from "./handlers/addCategory.js";
import updateCategories from "./handlers/updateCategories.js";
import updateCategory from "./handlers/updateCategory.js";
import deleteCategory from "./handlers/deleteCategory.js";
import reorderCards from "./handlers/reorderCards.js";

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

// TODO: clean up old sessions on a cron job
app.post("/login", login);
app.post("/logout", logout);
app.post("/validate", validate);

// TODO: check that the user owns the data for all these operations, maybe with a middleware
// right now it's possible to edit even entries that the user doesn't own
app.post("/page", addPage);
app.get("/pages", getAllPages);
app.get("/pages/:page", getPage);
app.put("/pages/:page_id", renamePage);
app.delete("/pages/:page_id", deletePage);

app.post("/tab", addTab);
app.put("/tabs/:tab_id", editTabContent);
app.put("/tabs/:tab_id/rename", renameTab);
app.delete("/tabs/:tab_id", deleteTab);
app.get("/tabs/:tab_id", getKanbanContent);

app.post("/category", addCategory);
app.put("/categories", updateCategories);
app.put("/categories/:category_id", updateCategory);
app.delete("/category/:category_id", deleteCategory);

app.post("/card", addCard);
app.put("/card/:card_id", editCard);
app.put("/cards", reorderCards);
app.delete("/cards/:card_id", deleteCard);

app.listen(port, () => {
  console.log("Listening on port: ", port);
});
