const { type } = require("os");
const meetingServices = require("../services/meeting.service");
const { MeetingPayloadEnum}  = require("../utils/meeting-payload.enum");

async function joinMeeting(meetingId, socket, meetingserver, payload) {
    const {userId, name} = payload.data;

    meetingServices.isMeetingPresent(meetingId, async (error, result) =>{

    if(error && !result){
        sendMessage(socket, {
            type : MeetingPayloadEnum.NOT_FOUND
        });
    }
    if(result){
         addUser(socket,{meetingId,userId,name}).then((result) => {
            if(result) {
                sendMessage(socket,{
                    type: MeetingPayloadEnum.JOINED_MEETING,
                    data: {
                        userId
                    }
                });

                broadcastUsers(meetingId,socket,meetingserver,{
                    type: MeetingPayloadEnum.USER_JOINED,
                    data: {
                        userId,
                        name,
                        ...payload.data
                    }
                });

            }
         },(error) => {
            console.log(error);
         })
    }

    });
}



function forwardConnectionRequest(meetingId, socket, meetingServer, payload) {
    const {userId, otherUserId, name} = payload.data;

    var model = {
        meetingId : meetingId,
        userId: otherUserId
    };

    meetingServices.getMeetingUser(model,(error, results) => {
        if(results){
            var sendPayload = JSON.stringify({
                type: MeetingPayloadEnum.CONNECTION_REQUEST,
                data: {
                    userId,
                    name,
                    ...payload.data
                }
            });
            meetingServer.to(results.socketId).emit('message',sendPayload);
        }
    });


}

function forwardIceCandidate(meetingId, socket, meetingServer, payload) {
    const {userId, otherUserId, candidate} = payload.data;

    var model = {
        meetingId : meetingId,
        userId: otherUserId
    };

    meetingServices.getMeetingUser(model,(error, results) => {
        if(results){
            var sendPayload = JSON.stringify({
                type: MeetingPayloadEnum.ICECANDIDATE,
                data: {
                    userId,
                    candidate
                }
            });
            meetingServer.to(results.socketId).emit('message',sendPayload);
        }
    });
}

function forwardOfferSDP(meetingId, socket, meetingServer, payload) {
    const {userId, otherUserId, sdp} = payload.data;

    var model = {
        meetingId : meetingId,
        userId: otherUserId
    };

    meetingServices.getMeetingUser(model,(error, results) => {
        if(results){
            var sendPayload = JSON.stringify({
                type: MeetingPayloadEnum.OFFER_SDP,
                data: {
                    userId,
                    sdp
                }
            });
            meetingServer.to(results.socketId).emit('message',sendPayload);
        }
    });


}

function forwardAnswerSDP(meetingId, socket, meetingServer, payload) {
    const {userId, otherUserId, sdp} = payload.data;

    var model = {
        meetingId : meetingId,
        userId: otherUserId
    };

    meetingServices.getMeetingUser(model,(error, results) => {
        if(results){
            var sendPayload = JSON.stringify({
                type: MeetingPayloadEnum.ANSWER_SDP,
                data: {
                    userId,
                    sdp
                }
            });
            meetingServer.to(results.socketId).emit('message',sendPayload);
        }
    });


}

function UserLeft(meetingId, socket, meetingServer, payload) {
    const {userId} = payload.data;


    broadcastUsers(meetingId, socket, meetingServer,{
        type: MeetingPayloadEnum.USER_LEFT,
        data: {
            userId: userId
        }
    } );
}


function endMeeting(meetingId, socket, meetingServer, payload) {
    const {userId} = payload.data;


    broadcastUsers(meetingId, socket, meetingServer,{
        type: MeetingPayloadEnum.MEETING_ENDED,
        data: {
            userId: userId
        }
    } );

    meetingServices.getAllMeetingUsers(meetingId,(error,results)=>{
        for(let i =0;i<results.length;i++){
            const meetingUser = result[i];
            meetingServer.sockets.connected(meetingUser.socketId).disconnect();
        }
    });

}

function forwardEvent(meetingId, socket, meetingServer, payload) {
    const {userId} = payload.data;


    broadcastUsers(meetingId, socket, meetingServer,{
        type: payload.type,
        data: {
            userId: userId,
            ...payload.data,
        }
    } );

    
}

function addUser(socket, {meetingId, userId, name}) {
    let promise = new Promise(function (resolve, reject){
        meetingServices.getMeetingUser({meetingId,userId}, (error, result) => {
            if(!result){
                var model = {
                    socketId: socket.id,
                    meetingId: meetingId,
                    userId: userId,
                    joined: true,
                    name: name,
                    isAlive: true
                };

                meetingServices.joinMeeting(model, (error, results) =>{
                    if(results){
                        resolve(true);
                    }
                    if(error){
                        reject(error);
                    }
                });

            }else{
                meetingServices.updateMeetingUser({
                    userId: userId,
                    socketId: socket.id,
                },(error,results) => {
                    if(results){
                        resolve(true);
                    }
                    if(error){
                        reject(error);
                    }
                });
            }
        });
    });
    return promise;
}




function sendMessage(socket, payload) {
    socket.send(JSON.stringify(payload));
}


function broadcastUsers(meetingId,socket,meetingserver,payload){
    socket.broadcast.emit("message", JSON.stringify(payload));
}


module.exports = {
    joinMeeting,
    forwardConnectionRequest,
    forwardIceCandidate,
    forwardOfferSDP,
    forwardAnswerSDP,
    UserLeft,
    endMeeting,
    forwardEvent
}