import addPage from "./addPage.js";
import deletePage from "./deletePage.js";
import getAllPages from "./getAllPages.js";
import getPage from "./getPage.js";
import login from "./login.js";
import logout from "./logout.js";
import validate from "./validate.js";

const handlers = {
  addPage,
  getAllPages,
  getPage,
  login,
  logout,
  validate,
  deletePage,
};

export default handlers;
