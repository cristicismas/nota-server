import db from "../helpers/db.js";

const addCard = (req, res) => {
  if (!req.body)
    return res.status(400).json({ message: "No body present in the request" });

  const { category_id, tab_id } = req.body;

  if (!category_id || !tab_id) {
    return res
      .status(400)
      .json({ message: "Not all required parameters are present in the body" });
  }

  db.prepare(
    "INSERT INTO kanban_cards ( category_id, tab_id, title, description, generation ) VALUES (?, ?, ?, ?, ?)",
  ).run(category_id, tab_id, "", "", 0);

  return res.json({ message: "Successfully added card" });
};

export default addCard;
