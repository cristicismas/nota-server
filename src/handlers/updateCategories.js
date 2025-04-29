import db from "../helpers/db.js";

const OP_TYPE = {
  ORDER: "order",
};

const updateCategories = async (req, res) => {
  if (!req.body)
    return res.status(400).json({ message: "No body present in the request" });

  const { type, new_categories } = req.body;

  if (!type) {
    return res.status(400).json({
      message:
        "This request requires a `type` parameter in the body for the operation to be performed.",
    });
  }

  if (!new_categories || !Array.isArray(new_categories)) {
    return res.status(400).json({
      message: "The request body requires an array of new_categories",
    });
  }

  switch (type) {
    case OP_TYPE.ORDER:
      updateCategoriesOrder(new_categories);
      return res
        .status(200)
        .json({ message: "Successfully updated categories order." });
    default:
      return res.status(400).json({
        message: "Invalid operation type found.",
      });
  }
};

const updateCategoriesOrder = (new_categories) => {
  new_categories.forEach((category) => {
    db.prepare(
      "UPDATE kanban_categories SET category_order = ? WHERE category_id = ?",
    ).run(category.category_order, category.category_id);
  });
};

export default updateCategories;
