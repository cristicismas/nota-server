import slugify from "../helpers/slugify.js";
import db from "../helpers/db.js";
import { v4 as uuidv4 } from "uuid";

const renamePage = (req, res) => {
  const page_id = req.params.page_id;

  if (!page_id) {
    return res
      .status(40)
      .json({ message: "No page_id given in the parameters" });
  }

  const body = req.body;
  if (!body) {
    return res.status(400).json({ message: "No body present in the request" });
  }

  const { pageTitle } = body;

  if (!pageTitle) {
    return res
      .status(400)
      .json({ message: "No pageTitle present in the request body" });
  }

  if (pageTitle.trim() === "") {
    return res
      .status(400)
      .json({ message: "The pageTitle cannot be an empty string" });
  }

  const pageToChange = db
    .prepare("SELECT page_id, page_title, slug FROM pages WHERE page_id = ?")
    .get(page_id);

  if (pageToChange.page_title === pageTitle) {
    return res.json({
      message: "No change",
      data: JSON.stringify({ newSlug: pageToChange.slug }),
    });
  }

  let newSlug = slugify(pageTitle);

  const pageWithSameSlug = db
    .prepare("SELECT page_id FROM pages WHERE slug = ?")
    .get(newSlug);

  if (pageWithSameSlug) {
    newSlug = uuidv4();
  }

  db.prepare("UPDATE pages SET page_title = ?, slug = ? WHERE page_id = ?").run(
    pageTitle,
    newSlug,
    page_id,
  );

  return res.json({
    message: "Successfully renamed page",
    data: JSON.stringify({ newSlug }),
  });
};

export default renamePage;
