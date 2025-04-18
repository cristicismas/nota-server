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

export default {};
