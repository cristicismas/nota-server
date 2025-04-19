import db from "../helpers/db.js";

const PAGE_TYPE = {
  TEXT: "text",
  KANBAN: "kanban",
};

const getPage = (req, res) => {
  const page_slug = req.params.page;

  const page = db.prepare("SELECT * FROM pages WHERE slug = ?").get(page_slug);

  if (!page) {
    return res.status(404).json({ message: "Page not found" });
  }

  const tabs = db
    .prepare("SELECT * FROM tabs WHERE page_id = ?")
    .all(page.page_id);

  const pageWithTabs = { ...page, tabs };

  return res.json(pageWithTabs);

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

export default getPage;
