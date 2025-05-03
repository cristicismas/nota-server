import db from "../helpers/db.js";

const getCardsPerCategory = (cards) => {
  const cardsPerCategory = [];

  cards.forEach((card) => {
    const existingArrayIndex = cardsPerCategory.findIndex((arr) =>
      arr.find((c) => c.category_id === card.category_id),
    );

    if (existingArrayIndex >= 0) {
      cardsPerCategory[existingArrayIndex].push(card);
    } else {
      cardsPerCategory.push([card]);
    }
  });

  return cardsPerCategory;
};

const reorderCards = (req, res) => {
  if (!req.body)
    return res.status(400).json({ message: "No body present in the request" });

  const { cards } = req.body;

  const cardsPerCategory = getCardsPerCategory(cards);

  if (!cards)
    return res
      .status(400)
      .json({ message: "No cards present in the request body" });

  const updateQuery = db.prepare(
    "UPDATE kanban_cards SET card_order = ?, category_id = ? WHERE card_id = ?",
  );

  console.log(cardsPerCategory);

  const updateTransaction = db.transaction(() => {
    cardsPerCategory.forEach((categoryArray) => {
      categoryArray.forEach((card) => {
        updateQuery.run(card.card_order, card.category_id, card.card_id);
      });
    });
  });

  updateTransaction();

  return res.json({ message: "Successfully reordered cards" });
};

export default reorderCards;
