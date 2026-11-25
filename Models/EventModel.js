const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    category: {
      type: String,
      enum: [
        "technical",
        "cultural",
        "sports",
        "workshop",
        "seminar",
        "other"
      ]
    },

    eventType: {
      type: String,
      enum: ["college", "department", "club"]
    },

    eventDate: {
        type: String,
        required: true,
        match: /^\d{4}-\d{2}-\d{2}$/
    },

    startTime: {
      type: String
    },

    endTime: {
      type: String
    },

    venue: {
      type: String
    },

    organizer: {
      type: String
    },

    image: {
      type: String
    },

    registrationRequired: {
      type: Boolean,
      default: true
    },

    registrationDeadline: {
        type: String,
        required: true,
        match: /^\d{4}-\d{2}-\d{2}$/
    },

    maxParticipants: {
      type: Number
    },

    status: {
      type: String,
      enum: [
        "upcoming",
        "ongoing",
        "completed",
        "cancelled"
      ],
      default: "upcoming"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    }
  },
  {
    timestamps: true
  }
);

const EventModel=mongoose.model('Event',eventSchema);
module.exports=EventModel;