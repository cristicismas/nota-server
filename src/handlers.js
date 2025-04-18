import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import validateSession from "./helpers/validateSession.js";
import db from "./helpers/db.js";
import CONSTANTS from "./constants.js";
const THREE_MONTHS = CONSTANTS.THREE_MONTHS;

dotenv.config({});

export const getAllPages = (_req, res) => {
  const pages = [
    { slug: "project-1", title: "Project 1" },
    { slug: "project-3", title: "Project 2" },
    { slug: "project-3", title: "Project 3" },
  ];

  return res.json(pages);
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
    return res.status(404).send("Page not found");
  }
};

const getUser = (username) => {
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username);
};

export const login = async (req, res) => {
  if (!req.body) return res.status(400).send("No body present in the request");

  const body = req.body;

  const { username, password } = body;

  if (!username || !password) {
    return res
      .status(400)
      .send("No username or password present in the request");
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

  res.cookie("sessionId", sessionId, {
    domain: process.env.SERVER_DOMAIN,
    maxAge: THREE_MONTHS,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });

  return res.status(200).json({ sessionId });
};

export const validate = (req, res) => {
  const isValidSession = validateSession(req);

  if (!isValidSession) {
    res.cookie("sessionId", "", {
      domain: process.env.SERVER_DOMAIN,
      maxAge: THREE_MONTHS,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });

    return res.status(401).json({ message: "Session id is invalid" });
  }

  return res.status(200).json({ message: "Session is valid" });
};
