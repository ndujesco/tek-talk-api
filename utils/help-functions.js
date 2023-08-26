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

exports.groupById = (array, userId) => {
  [
    {
      _id: new ObjectId("64e79e9baaba6a14a6046c32"),
      text: "Good day boss",
      senderId: {
        _id: new ObjectId("633b45a338ad34f4b8940219"),
        username: "HoodieDan",
        displayUrl:
          "https://res.cloudinary.com/dtgigdp2j/image/upload/v1672579157/profileImages/e7sm3fgcmlkcrf6q0s65.jpg",
      },
      receiverId: "633dae0b84db7a1a751fe468",
      imagesUrl: [],
      imagesId: [],
      imagesLocal: [],
      seen: true,
      createdAt: "2023-08-24T18:16:59.128Z",
      updatedAt: "2023-08-26T12:09:18.124Z",
      __v: 0,
    },
    {
      _id: new ObjectId("64e79f13aaba6a14a6046c3b"),
      text: "My boss no vex",
      senderId: {
        _id: new ObjectId("633b45a338ad34f4b8940219"),
        username: "HoodieDan",
        displayUrl:
          "https://res.cloudinary.com/dtgigdp2j/image/upload/v1672579157/profileImages/e7sm3fgcmlkcrf6q0s65.jpg",
      },
      receiverId: "633dae0b84db7a1a751fe468",
      imagesUrl: [],
      imagesId: [],
      imagesLocal: [],
      seen: true,
      createdAt: "2023-08-24T18:18:59.028Z",
      updatedAt: "2023-08-26T12:09:18.124Z",
      __v: 0,
    },
    {
      _id: new ObjectId("64e79f37aaba6a14a6046c41"),
      text: "Eshe, oga",
      senderId: {
        _id: new ObjectId("633b45a338ad34f4b8940219"),
        username: "HoodieDan",
        displayUrl:
          "https://res.cloudinary.com/dtgigdp2j/image/upload/v1672579157/profileImages/e7sm3fgcmlkcrf6q0s65.jpg",
      },
      receiverId: "633dae0b84db7a1a751fe468",
      imagesUrl: [],
      imagesId: [],
      imagesLocal: [],
      seen: true,
      createdAt: "2023-08-24T18:19:35.281Z",
      updatedAt: "2023-08-26T12:09:18.124Z",
      __v: 0,
    },
  ].reduce((group, product) => {
    console.log(group);
    const { category } = product;
    group[category] = group[category] ?? [];
    group[category].push(product);
    return group;
  }, {});
};
