function getUserId() {
  const userId = sessionStorage.getItem("loggedUser");
  if (userId !== null) {
    return userId;
  }
  return '';
}

export { getUserId }
