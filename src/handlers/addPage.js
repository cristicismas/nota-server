import { v4 as uuidv4 } from "uuid";
import db from "../helpers/db.js";
import slugify from "../helpers/slugify.js";

const addPage = (req, res) => {
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

  if (pageTitle.trim() === "") {
    return res
      .status(400)
      .json({ message: "The pageTitle cannot be an empty string" });
  }

  const userSession = db
    .prepare("SELECT user_id FROM sessions WHERE session_uuid = ?")
    .get(sessionId);

  const userId = userSession.user_id;

  // get the page with the highest page order
  const highestOrderPage = db
    .prepare("SELECT page_order FROM pages ORDER BY page_order DESC LIMIT 1")
    .get();

  const page_uuid = uuidv4();

  let pageSlug = slugify(pageTitle);

  const sameSlugPages = db
    .prepare("SELECT * FROM pages WHERE slug = ?")
    .get(pageSlug);

  // If a page with the same slug exists, make the slug of this page a uuid without the dashes
  if (sameSlugPages) {
    pageSlug = uuidv4().replaceAll("-", "");
  }

  const newPageData = {
    slug: pageSlug,
    user_id: userId,
    page_uuid: page_uuid,
    page_order: highestOrderPage ? highestOrderPage.page_order + 1 : 0,
    page_title: pageTitle,
  };

  const addPageQuery = db.prepare(
    "INSERT INTO pages (slug, user_id, page_uuid, page_order, page_title) VALUES (@slug, @user_id, @page_uuid, @page_order, @page_title)",
  );
  const getAddedPageQuery = db.prepare(
    "SELECT page_id FROM pages WHERE slug = ?",
  );

  const addFirstTabQuery = db.prepare(
    "INSERT INTO tabs (title, page_id, tab_type, text_content, generation, tab_order) VALUES (@title, @page_id, @tab_type, @text_content, @generation, @tab_order)",
  );

  const createPageTransaction = db.transaction(() => {
    addPageQuery.run(newPageData);

    const addedPageId = getAddedPageQuery.get(pageSlug).page_id;

    const firstTabData = {
      title: "First tab",
      page_id: addedPageId,
      text_content: JSON.stringify([
        { type: "paragraph", children: [{ text: "" }] },
      ]),
      tab_type: "text",
      generation: 0,
      tab_order: 0,
    };

    addFirstTabQuery.run(firstTabData);
  });

  createPageTransaction();

  return res.json(newPageData);
};

export default addPage;
