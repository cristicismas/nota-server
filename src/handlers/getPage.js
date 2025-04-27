import db from "../helpers/db.js";

const getPage = (req, res) => {
  const page_slug = req.params.page;

  const page = db.prepare("SELECT * FROM pages WHERE slug = ?").get(page_slug);

  if (!page) {
    return res.status(404).json({ message: "Page not found" });
  }

  const tabs = db
    .prepare("SELECT * FROM tabs WHERE page_id = ? ORDER BY tab_order ASC")
    .all(page.page_id);

  const pageWithTabs = { ...page, tabs };

  return res.json(pageWithTabs);
};

export default getPage;
