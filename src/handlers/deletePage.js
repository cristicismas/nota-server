import db from "../helpers/db.js";

const deletePage = (req, res) => {
  const page_id = req.params.page_id;

  if (!page_id) {
    return res
      .status(400)
      .json({ message: "No page_id given in the parameters" });
  }

  const info = db.prepare("DELETE FROM pages WHERE page_id = ?").run(page_id);

  if (info.changes === 0) {
    return res.status(400).json({
      message: "Given page_id was not found. No operation was performed.",
    });
  }

  return res.json({ message: "Page successfully deleted" });
};

export default deletePage;
