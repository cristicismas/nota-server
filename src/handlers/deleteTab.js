import db from "../helpers/db.js";

const deleteTab = (req, res) => {
  const tab_id = req.params.tab_id;

  if (!tab_id) {
    return res
      .status(400)
      .json({ message: "No tab_id is given in the parameters" });
  }

  const tab_to_delete = db
    .prepare("SELECT tab_order, page_id FROM tabs WHERE tab_id = ?")
    .get(tab_id);

  if (!tab_to_delete) {
    return res.status(400).json({
      message: "Given tab_id was not found. No operation was performed.",
    });
  }

  db.prepare("DELETE FROM tabs WHERE tab_id = ?").run(tab_id);

  const all_tabs = db
    .prepare("SELECT tab_id FROM tabs WHERE page_id = ? ORDER BY tab_order ASC")
    .all(tab_to_delete.page_id);

  const updateQuery = db.prepare(
    "UPDATE tabs SET tab_order = ? WHERE tab_id = ?",
  );

  const updateOrderTransaction = db.transaction(() => {
    all_tabs.forEach((tab, index) => {
      updateQuery.run(index, tab.tab_id);
    });
  });

  updateOrderTransaction();

  return res.json({ message: "Tab successfully deleted" });
};

export default deleteTab;
