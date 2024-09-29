const meetingServices = require("../services/meeting.service");

exports.startMeeting = (req, res, next) => {
    const {hostId,hostName} = req.body;

    var model = {
        hostId : hostId,
        hostName : hostName,
        startTime : Date.now()
    };

    meetingServices.startMeeting(model,(error,results) => {
        if(error) {
            return next(error);
        }
        return res.status(200).send({
            message: "Success",
            data : results.id,
        });
    })
}

exports.checkMeetingExists = (req, res, next) => {
    const {id} = req.query;

    meetingServices.checkMeetingExist(id,(error,results) => {
        if(error){
            return next(error);
        }
        return res.status(200).send({
            message: "Success",
            data: results
        });
    })
}

exports.getAllMeetingUsers = (req, res, next) => {
    const {id} = req.query;
    meetingServices.getAllMeetingUsers(id,(error,results) => {
        if(error){
            return next(error);
        }
        return res.status(200).send({
            message: "Success",
            data: results
        })
    });
}

exports.joinMeeting = (req, res, next) => {
    const { meetingId, userId, name, joined, isAlive } = req.body;

    // Validate the input
    if (!meetingId || !joined ||!isAlive || !userId || !name) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const params = {
        meetingId,
        
        userId,
        joined,
        name,
        isAlive
    };

    // Call the service function to join the meeting
    meetingServices.joinMeeting(params, (error, results) => {
        if (error) {
            return next(error);  // Forward error to error handler
        }

        // Send a success response
        return res.status(200).json({
            message: "User joined the meeting successfully",
            data: results
        });
    });
}