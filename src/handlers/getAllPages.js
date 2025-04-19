import db from "../helpers/db.js";

const getAllPages = (req, res) => {
  const sessionId = req?.cookies?.sessionId;

  const userSession = db
    .prepare("SELECT user_id FROM sessions WHERE session_uuid = ?")
    .get(sessionId);

  const pages =
    db
      .prepare("SELECT * FROM pages WHERE user_id = ?")
      .all(userSession.user_id) || [];

  return res.json(pages);
};

export default getAllPages;
