import mongoose from "mongoose";
import validator from "validator";
const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: [true, "Please enter your name"]
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        validate: validator.default.isEmail // validates the email format is correct or not
    },
    photo: {
        type: String,
        required: [true, "Please add photo"],
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: [true, "Please enter gender"],
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    dob: {
        type: Date,
        required: [true, "Please enter date of birth"],
    }
}, {
    timestamps: true
});
userSchema.virtual("age").get(function () {
    const today = new Date();
    const dob = this.dob; // Ensure `dob` is treated as a Date
    let age = today.getFullYear() - dob.getFullYear();
    if (today.getMonth() < dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
});
export const User = mongoose.model("User", userSchema);
