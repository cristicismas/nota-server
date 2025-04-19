import db from "../helpers/db.js";

const deletePage = (req, res) => {
  const page_id = req.params.page_id;

  if (!page_id) {
    return res
      .status(40)
      .json({ message: "No page_id given in the parameters" });
  }

  db.prepare("DELETE FROM pages WHERE page_id = ?").run(page_id);

  return res.json({ message: "Page successfully deleted" });
};

export default deletePage;
