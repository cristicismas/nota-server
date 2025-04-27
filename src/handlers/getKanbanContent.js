import db from "../helpers/db.js";

const getKanbanContent = (req, res) => {
  const { tab_id } = req.params;

  if (!tab_id) {
    return res
      .status(400)
      .json({ message: "tab_id is not present in the request parameters" });
  }

  const categories =
    db
      .prepare(
        "SELECT * FROM kanban_categories WHERE tab_id = ? ORDER BY category_order ASC",
      )
      .all(tab_id) || [];

  const cards =
    db.prepare("SELECT * FROM kanban_cards WHERE tab_id = ?").all(tab_id) || [];

  res.json({ categories, cards });
};

export default getKanbanContent;
