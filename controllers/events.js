const { body, validationResult } = require("express-validator");
const Event = require("../models/event");
const { uploadEventToCloudinary } = require("../utils/cloudinary");
const { catchError } = require("../utils/help-functions");

const extractEventsInfo = (events, userId) => {
    const toReturn = []

    events.forEach((event) => {
        let toPush = {
            id: event.id,
            attendeesCount: event.attendees.length,
            name: event.name,
            description: event.description,
            displayUrl: event.imageUrl,
            willAttend: event.attendees.includes(userId),
            date: event.date,
            attendees: []
        }
        event.attendees.forEach((attendee) => {
            toPush.attendees.push({username: attendee.username, displayUrl: attendee.displayUrl})
        })
        toPush.admin = {
            username: event.userId.username,
            displayUrl: event.userId.displayUrl
        }
       toReturn.push(toPush);  
    })
    return toReturn;
}

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
            date,
            attendees: [],
        });
        const uploadedImage = req.files.image ? req.files.image[0] : null; //important
        if (uploadedImage) {
          const imageLocalPath = uploadedImage.path.replace("\\", "/");
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


exports.getAllEvents = async (req, res) =>{
    const events = await Event.find()
                    .populate({path: "attendees", model: "User" })
                    .populate({path: "userId", model: "User" })
    
    const eventsToReturn = extractEventsInfo(events, req.userId)
    res.status(200).json({events: eventsToReturn})

}


exports.rsvpEvent = async (req, res) => {
    const eventId = req.params.eventId
    try {
    const event = await Event.findById(eventId)

    if(event.attendees.includes(req.userId))
    return res.status(200).json({message: "Already a member!"})
    event.attendees.push(req.userId)
    await event.save()

    res.status(200).json({message: "RSVP successful!"})

    } catch (err) {
        catchError(err, res)
    }
}

exports.removeRsvp = async (req, res) => {
    const eventId = req.params.eventId;
    try {
        const event = await Event.findById(eventId)
    
        if(!event.attendees.includes(req.userId))
        return res.status(200).json({message: "You are not member!"})

        const usersIndex = event.attendees.indexOf(req.userId)
        event.attendees.splice(usersIndex, 1)
        await event.save()
    
        res.status(200).json({message: "RSVP successful!"})
    
        } catch (err) {
            catchError(err, res)
        }

}





