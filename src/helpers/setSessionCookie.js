import CONSTANTS from "../constants.js";
const THREE_MONTHS = CONSTANTS.THREE_MONTHS;

const setSessionCookie = (res, value) => {
  res.cookie("sessionId", value, {
    domain: process.env.SERVER_DOMAIN,
    maxAge: THREE_MONTHS,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
};

export default setSessionCookie;
