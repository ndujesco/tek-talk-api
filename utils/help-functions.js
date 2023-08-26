exports.catchError = (error, res) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(401).json({ message, status });
};

exports.checkForMentionedUser = (string, users) => {
  const mentions = string.match(/@\w+/g);
  let toReturn = [];
  if (mentions) {
    mentions.forEach((mentioned) => {
      const found = users.find(
        (user) =>
          user.username.toLowerCase() === mentioned.substring(1).toLowerCase()
      );
      if (found) {
        toReturn.push(found.username);
      }
    });
  }
  return toReturn;
};
