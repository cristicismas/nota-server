import { v4 as uuidv4 } from "uuid";
import setSessionCookie from "./helpers/setSessionCookie.js";
import bcrypt from "bcrypt";
import validateSession from "./helpers/validateSession.js";
import db from "./helpers/db.js";

export const getAllPages = (req, res) => {
  const sessionId = req?.cookies?.sessionId;

  const userSession = db
    .prepare("SELECT user_id FROM sessions WHERE session_uuid = ?")
    .get(sessionId);

  const pages =
    db
      .prepare("SELECT * FROM pages WHERE user_id = ?")
      .all(userSession.user_id) || [];

  console.log("pages: ", pages);

  return res.json(pages);
};

const slugify = (string) => {
  return string.toLowerCase().replaceAll(" ", "-");
};

export const addPage = (req, res) => {
  const sessionId = req?.cookies?.sessionId;

  if (!sessionId) return res.status(401).json({ message: "Unauthorized" });

  if (!req.body)
    return res.status(400).json({ message: "No body present in the request" });

  const pageTitle = req.body.pageTitle;

  if (!pageTitle) {
    return res
      .status(400)
      .json({ message: "No page title sent in the request body" });
  }

  const userSession = db
    .prepare("SELECT user_id FROM sessions WHERE session_uuid = ?")
    .get(sessionId);

  const userId = userSession.user_id;

  // get the page with the highest page order
  const highestOrderPage = db
    .prepare("SELECT page_order FROM pages ORDER BY page_order DESC LIMIT 1")
    .get();

  console.log("highest order page: ", highestOrderPage);

  const page_uuid = uuidv4();

  let pageSlug = slugify(pageTitle);

  const sameSlugPages = db
    .prepare("SELECT * FROM pages WHERE slug = ?")
    .get(pageSlug);

  // If a page with the same slug exists, make the slug of this page a uuid without the dashes
  if (sameSlugPages) {
    pageSlug = uuidv4().replaceAll("-", "");
  }

  console.log();

  const newPageData = {
    slug: pageSlug,
    user_id: userId,
    page_uuid: page_uuid,
    page_order: highestOrderPage ? highestOrderPage.page_order + 1 : 0,
    page_title: pageTitle,
  };

  db.prepare(
    "INSERT INTO pages (slug, user_id, page_uuid, page_order, page_title) VALUES (@slug, @user_id, @page_uuid, @page_order, @page_title)",
  ).run(newPageData);

  return res.json(newPageData);
};

const PAGE_TYPE = {
  TEXT: "text",
  KANBAN: "kanban",
};

export const getPage = (req, res) => {
  const page_slug = req.params.page;

  if (page_slug === "project-1") {
    return res.json({
      title: "Project 1 Title",
      tabs: [
        {
          title: "Dev Notes",
          type: PAGE_TYPE.TEXT,
          text: "#Default h1 for\ndefault text",
          order: 0,
        },
        {
          title: "Dev Kanban",
          type: PAGE_TYPE.KANBAN,
          categories: [
            {
              title: "Features",
              cards: [
                {
                  title: "first card",
                  description: "first card description lorem ipsum",
                },
              ],
            },
          ],
          order: 1,
        },
      ],
    });
  } else {
    return res.status(404).json({ message: "Page not found" });
  }
};

const getUser = (username) => {
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username);
};

export const login = async (req, res) => {
  if (!req.body)
    return res.status(400).json({ message: "No body present in the request" });

  const body = req.body;

  const { username, password } = body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "No username or password present in the request" });
  }

  const user = await getUser(username);

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const isCorrectPassword = await bcrypt.compare(password, user.password);

  if (!isCorrectPassword) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const sessionId = uuidv4();

  db.prepare("INSERT INTO sessions (user_id, session_uuid) values (?, ?)").run(
    user.id,
    sessionId,
  );

  setSessionCookie(res, sessionId);

  return res.status(200).json({ sessionId });
};

export const validate = (req, res) => {
  const isValidSession = validateSession(req);

  if (!isValidSession) {
    setSessionCookie(res, "");

    return res.status(401).json({ message: "Session id is invalid" });
  }

  return res.status(200).json({ message: "Session is valid" });
};

export const logout = (req, res) => {
  const sessionId = req?.cookies?.sessionId;

  const foundSession = db
    .prepare("SELECT 1 FROM sessions WHERE session_uuid = ?")
    .get(sessionId);

  if (foundSession) {
    db.prepare("DELETE FROM sessions WHERE session_uuid = ?").run(sessionId);
  }

  setSessionCookie(res, "");

  return res.json({ message: "Successfully logged out" });
};
