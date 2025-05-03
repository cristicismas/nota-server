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

  const highestOrderCard = db
    .prepare(
      "SELECT * FROM kanban_cards WHERE card_order = (SELECT MAX(card_order) FROM kanban_cards WHERE category_id = ?)",
    )
    .get(category_id);

  const card_order = highestOrderCard ? highestOrderCard?.card_order + 1 : 0;

  const new_card = db
    .prepare(
      "INSERT INTO kanban_cards ( category_id, tab_id, title, description, generation, card_order ) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .run(category_id, tab_id, "", "", 0, card_order);

  return res.json({
    message: "Successfully added card",
    card_id: new_card.lastInsertRowid,
    card_order,
  });
};

export default addCard;
