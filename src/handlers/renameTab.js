import db from "../helpers/db.js";

const renameTab = (req, res) => {
  const tab_id = req.params.tab_id;

  if (!tab_id) {
    return res
      .status(400)
      .json({ message: "tab_id is not present in the request parameters" });
  }

  if (!req.body) {
    return res.status(400).json({ message: "No body present in the request" });
  }

  const { title } = req.body;

  const info = db
    .prepare("UPDATE tabs SET title = ? WHERE tab_id = ?")
    .run(title, tab_id);

  if (info.changes === 0) {
    return res.status(400).json({
      message: "Given tab_id was not found. No operation was performed.",
    });
  }

  return res.json({ message: "Tab renamed successfully" });
};

export default renameTab;
