import db from "../helpers/db.js";
import CONSTANTS from "../constants.js";
const { TAB_TYPES } = CONSTANTS;

const editTabContent = (req, res) => {
  const tab_id = req.params.tab_id;

  if (!tab_id) {
    return res
      .status(400)
      .json({ message: "tab_id is not present in the request parameters" });
  }

  const body = req.body;

  if (!body) {
    return res.status(400).json({ message: "No body present in the request" });
  }

  const { tab_type, text_content, generation } = body;

  if (!tab_type || !text_content || isNaN(generation)) {
    console.log(tab_type, text_content, generation);
    return res
      .status(400)
      .json({ message: "Request body doesn't have all the required data." });
  }

  const lastTabGeneration = db
    .prepare("SELECT generation FROM tabs WHERE tab_id = ?")
    .get(tab_id)?.generation;

  if (lastTabGeneration >= generation) {
    console.log(
      `OUT OF ORDER GENERATION - last tab generation: ${lastTabGeneration} --- request generation: ${generation}`,
    );
    return res.json({
      message: "Out of order generation. Skipping this edit...",
    });
  }

  if (tab_type === TAB_TYPES.TEXT) {
    db.prepare(
      "UPDATE tabs SET text_content = ?, generation = ? WHERE tab_id = ?",
    ).run(text_content, generation, tab_id);
  } else if (tab_type === TAB_TYPES.KANBAN) {
    return res
      .status(400)
      .json({ message: "Unimplemented page type handler." });
  } else {
    return res
      .status(400)
      .json({ message: "Unimplemented page type handler." });
  }

  return res.json({ message: "Sucessfully updated text_content" });
};

export default editTabContent;
