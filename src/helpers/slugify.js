const slugify = (string) => {
  return string.toLowerCase().replaceAll(" ", "-");
};

export default slugify;
