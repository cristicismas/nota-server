import db from "../helpers/db.js";

const logout = (req, res) => {
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

export default logout;
