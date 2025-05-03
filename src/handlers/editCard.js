import db from "../helpers/db.js";

const addCard = (req, res) => {
  const card_id = req.params.card_id;

  if (!card_id)
    return res
      .status(400)
      .json({ message: "No card_id present in the request parameters" });

  if (!req.body)
    return res.status(400).json({ message: "No body present in the request" });

  const { category_id, title, description, card_order, generation } = req.body;

  if (isNaN(card_order)) {
    return res.status(400).json({
      message: "This request needs a card_order",
    });
  }

  if (!category_id) {
    return res.status(400).json({
      message: "This requests needs a category_id",
    });
  }

  if (typeof title !== "string" && typeof description !== "string") {
    return res.status(400).json({
      message: "This requests needs either a new title or a new description",
    });
  }

  if (isNaN(generation)) {
    return res.status(400).json({ message: "Generation is not a number." });
  }

  const last_card_generation = db
    .prepare("SELECT generation FROM kanban_cards WHERE card_id = ?")
    .get(card_id)?.generation;

  if (
    typeof last_card_generation !== "undefined" &&
    last_card_generation >= generation
  ) {
    return res.status(409).json({
      message: "Out of order generation. Skipping this edit...",
    });
  }

  db.prepare(
    "UPDATE kanban_cards SET title = ?, description = ?, card_order = ?, generation = ? WHERE card_id = ?",
  ).run(title, description, card_order, generation, card_id);

  return res.json({
    message: "Successfully updated card",
  });
};

export default addCard;
