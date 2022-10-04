const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// cloudinary.uploader.destroy("h1i8ebdlw3mjrcxhcspg");
module.exports = cloudinary;
