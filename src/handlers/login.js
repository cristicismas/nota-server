import db from "../helpers/db.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

const login = async (req, res) => {
  if (!req.body)
    return res.status(400).json({ message: "No body present in the request" });

  const body = req.body;

  const { username, password } = body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "No username or password present in the request" });
  }

  const user = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username);

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

export default login;
