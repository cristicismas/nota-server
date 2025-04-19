import validateSession from "../helpers/validateSession.js";
import setSessionCookie from "../helpers/setSessionCookie.js";

const validate = (req, res) => {
  const isValidSession = validateSession(req);

  if (!isValidSession) {
    setSessionCookie(res, "");

    return res.status(401).json({ message: "Session id is invalid" });
  }

  return res.status(200).json({ message: "Session is valid" });
};

export default validate;
