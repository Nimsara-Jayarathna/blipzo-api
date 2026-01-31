
import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
    },
    token: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["register_otp", "reset_token", "email_change_current", "email_change_new", "registration_verified", "email_change_verified"],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600, // Default TTL 10 minutes, can be overriden by specific logic if needed but index is fixed
    },
});

// We can set the expireAfterSeconds index dynamically or just rely on a reasonable default.
// If we need different expiries for different types, we might need a separate field `expiresAt` and use a partial index or a background job.
// For simplicity, we'll stick to a standard TTL index. If widely variable TTLs are needed, `expiresAt` field with `expireAfterSeconds: 0` is better.

// Let's use expiresAt for flexibility
tokenSchema.remove("createdAt"); // Remove the one with fixed expiry
tokenSchema.add({
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 },
    },
});

export default mongoose.model("Token", tokenSchema);
