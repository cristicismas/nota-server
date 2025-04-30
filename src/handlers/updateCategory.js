import db from "../helpers/db.js";

const updateCategory = (req, res) => {
  if (!req.body)
    return res.status(400).json({ message: "No body present in the request" });

  const category_id = req.params.category_id;

  if (!category_id) {
    return res
      .status(400)
      .json({ message: "No category_id is given in the parameters" });
  }

  const { new_category } = req.body;

  if (!new_category) {
    return res.status(400).json({
      message: "The request body requires a new_category",
    });
  }

  db.prepare(
    "UPDATE kanban_categories SET title = ? WHERE category_id = ?",
  ).run(new_category.title, category_id);

  return res.json({ message: "Category updated successfully." });
};

export default updateCategory;
