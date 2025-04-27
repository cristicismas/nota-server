import db from "../helpers/db.js";

const deleteTab = (req, res) => {
  const tab_id = req.params.tab_id;

  if (!tab_id) {
    return res
      .status(400)
      .json({ message: "No tab_id is given in the parameters" });
  }

  const info = db.prepare("DELETE FROM tabs WHERE tab_id = ?").run(tab_id);

  if (info.changes === 0) {
    return res.status(400).json({
      message: "Given tab_id was not found. No operation was performed.",
    });
  }

  return res.json({ message: "Tab successfully deleted" });
};

export default deleteTab;
