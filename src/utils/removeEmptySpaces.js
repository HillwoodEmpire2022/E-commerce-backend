function removeEmptySpaces(string) {
  return string ? string?.trim().replace(/\s+/g, ' ') : null;
}

export default removeEmptySpaces;
