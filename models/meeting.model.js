const { timeStamp } = require("console");
const { default: mongoose } = require("mongoose");
const mangoose = require("mongoose");
const { hostname } = require("os");
const {Schema} = mongoose

const meeting = mangoose.model(
    "Meeting",
    mongoose.Schema({
        hostId : {
            type : String,
            required : true
        },
        hostname : {
            type : String,
            required : false
        },
        startTime : {
            type : Date,
            required : true
        },
        meetingUsers : [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref : "MeetingUser"
            }
        ]
    },{
        toJSON : {
            transform : function(doc,ret){
                ret.id = ret._id.toString(),
                delete ret._id;
                delete ret._v;
            }
        }
    },
    { timestamps: true })
);

module.exports = {
    meeting
}