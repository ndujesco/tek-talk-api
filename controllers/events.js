const { body, validationResult } = require("express-validator");
const Event = require("../models/event");
const { uploadEventToCloudinary } = require("../utils/cloudinary");
const { catchError } = require("../utils/help-functions");

exports.eventValidator = [
    body("name", "'Name' field should not be empty")
    .isLength({ min: 1 })
    .trim(),

    body("description", "'description' field should not be empty")
    .isLength({ min: 1 })
    .trim(),

    body("date", "'date' field should not be empty")
    .isLength({ min: 1 })
    .trim(),
]



exports.createEvent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: 422,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {name, description, date} = req.body
    try {
        const event = new Event({
            userId: req.userId,
            name,
            description,
            date
        });
        const uploadedImage = req.files.image ? req.files.image[0] : null; //important
        if (uploadedImage) {
          const imageLocalPath = imgData.path.replace("\\", "/");
          event.imageLocal = imageLocalPath
        }
        await event.save();
        res.status(200).json({message: "Created successfully!"})


        if (uploadedImage) {
            uploadEventToCloudinary(uploadedImage.path, event.id)
        }
    } catch (err) {
        catchError(err, res)
    }
}












