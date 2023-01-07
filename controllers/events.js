const { body, validationResult } = require("express-validator");
const { isValidObjectId } = require("mongoose");
const Event = require("../models/event");
const { uploadEventToCloudinary, deleteFromCloudinary } = require("../utils/cloudinary");
const { catchError } = require("../utils/help-functions");

const millisecondsPerDay = 24 * 3600 * 1000;

const extractEventsInfo = (events, userId) => {
    const toReturn = []

    events.forEach((event) => {
        let toPush = {
            id: event.id,
            attendeesCount: event.attendees.length,
            name: event.name,
            description: event.description,
            displayUrl: event.imageUrl,
            willAttend: event.attendees.some(attendee => attendee.id === userId),
            startTime: event.startTime,
            endTime: event.endTime,
            location: event.location,            
            attendees: [],
            admin: {
                username: event.userId.username,
                displayUrl: event.userId.displayUrl
            },
            eventHeld: new Date(event.endTime).getTime() < Date.now()

        }
        event.attendees.forEach((attendee) => {
            toPush.attendees.push({username: attendee.username, displayUrl: attendee.displayUrl})
        })
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

    body("startTime", "'start-time' field should not be empty")
    .isLength({ min: 1 })
    .trim(),

    body("endTime", "'end-time' field should not be empty")
    .isLength({ min: 1 })
    .trim(),

    body("location", "'Location' field should not be empty")
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

    try {
        const event = new Event({
            userId: req.userId,
            ...req.body, // name, descrption, startTime, endTime and location.
            attendees: [req.userId],
        });
        const uploadedImage = req.files.image ? req.files.image[0] : null; //important
        if (uploadedImage) {
          const imageLocalPath = uploadedImage.path.replace("\\", "/");
          event.imageLocal = imageLocalPath
        }
        await event.save();
        res.status(200).json({message: "Created successfully!", eventId: event.id})


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

exports.getEventFromId = async (req, res) => {
    const eventId = req.params.eventId;
    if (!isValidObjectId(eventId)) return res.status(400).json({message: "The id is not valid"})

    const event = await Event.findById(eventId)
            .populate({path: "attendees", model: "User" })
            .populate({path: "userId", model: "User" })

    if (!event) return res.status(401).json({message: "Event does not exist."})
    const eventToReturn = extractEventsInfo([event], req.userId)[0]
    res.status(200).json({event: eventToReturn})


}

exports.rsvpEvent = async (req, res) => {
    const eventId = req.params.eventId
    if (!isValidObjectId(eventId)) return res.status(400).json({message: "The id is not valid"})
    try {
    const event = await Event.findById(eventId)
    if (!event) return res.status(401).json({message: "Event does not exist."})

    if(event.attendees.includes(req.userId))
    return res.status(200).json({message: "Already a member!"})
    event.attendees.push(req.userId)
    await event.save()

    res.status(200).json({message: "RSVP successfully!"})

    } catch (err) {
        catchError(err, res)
    }
}

exports.removeRsvp = async (req, res) => {
    const eventId = req.params.eventId;
    if (!isValidObjectId(eventId)) return res.status(400).json({message: "The id is not valid"})

    try {
        const event = await Event.findById(eventId)
        if (!event) return res.status(401).json({message: "Event does not exist."})

    
        if(!event.attendees.includes(req.userId))
        return res.status(200).json({message: "You are not member!"})

        const usersIndex = event.attendees.indexOf(req.userId)
        event.attendees.splice(usersIndex, 1)
        await event.save()
    
        res.status(200).json({message: "RSVP Removed"})
    
        } catch (err) {
            catchError(err, res)
        }

}

exports.deleteEvent =async (req, res) => {
    const eventId = req.params.eventId;
    if (!isValidObjectId(eventId)) return res.status(400).json({message: "The id is not valid"})

    try {
       await  Event.findByIdAndDelete(eventId)
       res.status(202).json({message: "Event deleted successfully"})

    } catch (err) {
        catchError(err, res)
    }
}

exports.editEvent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: 422,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    const eventId = req.params.eventId
    if (!isValidObjectId(eventId)) return res.status(400).json({message: "The id is not valid"})
    const toUpdate = req.body;
    const editedImage = req.files.image ? req.files.image[0] : null; //important

    if (editedImage)  toUpdate.imageLocal = editedImage.path.replace("\\", "/")
    try {
        const event = await Event.findById(eventId)
        if (!event) return res.status(401).json({message: "Event does not exists"})

        for (key in toUpdate) {
            if (key !== "noImage") event[key] = toUpdate[key];
        }

        if (toUpdate.noImage) {
            event.imageUrl = null;
            event.imageLocal = null
            //I can't remove the id because I need to remove from cloudinary.
        }

    await event.save();
    res.status(200).json({message: "Edited successfully!", body: req.body});
    
    if (toUpdate.noImage) deleteFromCloudinary(event.imageId)
    if (editedImage) uploadEventToCloudinary(editedImage.path, event.id)
  
    } catch (err) {
        catchError(err, res)
    }
}

exports.extractEventsInfo = extractEventsInfo