import mongoose from "mongoose";
export const connectDB = () => {
    mongoose.connect("mongodb+srv://sarvesh:sarvesh@cluster0.ssprl0p.mongodb.net/", {
        dbName: "Ecommerce-2024"
    }).then((c) => console.log(`Db connected to ${c.connection.host}`))
        .catch((err) => console.log('error in connecting DB', err));
};
