import { TryCatch } from '../middlewares/error.js';
import { User } from '../models/user.js';
import ErrorHandler from '../utils/errorClass.js';
export const newUser = TryCatch(async (req, res, next) => {
    const { name, email, photo, _id, dob, gender, role } = req.body;
    const user = await User.create({
        name,
        email,
        photo,
        _id,
        dob: new Date(dob),
        gender,
        role,
    });
    if (!name || !email || !photo || !_id || !dob || !gender || !role) {
        return next(new ErrorHandler("Please enter the required fields", 400));
    }
    res.status(201).json({
        message: `Welcome ${user.name}`,
        success: true,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
    });
});
export const allUsers = TryCatch(async (req, res, next) => {
    const users = await User.find({});
    res.status(200).json({
        message: "List of all the users",
        users
    });
    console.log('users in all users', users);
});
export const getUserByID = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    console.log("id of ", id);
    const user = await User.findById(id);
    if (!user) {
        return next(new ErrorHandler("User not found", 400));
    }
    res.status(200).json({
        message: "User found",
        user
    });
});
export const deleteUserByID = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    console.log("id of ", id);
    const user = await User.findById(id);
    if (!user) {
        return next(new ErrorHandler("User not found", 400));
    }
    await user.deleteOne();
    res.status(200).json({
        message: "User has been deleted successfully",
        success: true
    });
});
