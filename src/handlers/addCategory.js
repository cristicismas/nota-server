import db from "../helpers/db.js";

const addCategory = (req, res) => {
  if (!req.body)
    return res.status(400).json({ message: "No body present in the request" });

  const { tab_id, title } = req.body;

  if (!tab_id || !title) {
    return res
      .status(400)
      .json({ message: "Not all required parameters are present in the body" });
  }

  const highestOrderCategory = db
    .prepare(
      "SELECT * FROM kanban_categories WHERE category_order = (SELECT MAX(category_order) FROM kanban_categories WHERE tab_id = ?)",
    )
    .get(tab_id);

  const new_category = {
    title: title,
    tab_id: tab_id,
    category_order: highestOrderCategory
      ? highestOrderCategory.category_order + 1
      : 0,
  };

  const info = db
    .prepare(
      "INSERT INTO kanban_categories (title, tab_id, category_order) VALUES (@title, @tab_id, @category_order)",
    )
    .run(new_category);

  return res.json({
    message: "Successfully added card",
    new_category: { ...new_category, category_id: info.lastInsertRowid },
  });
};

export default addCategory;
