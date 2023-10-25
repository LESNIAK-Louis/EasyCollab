import mongoose from "mongoose";

export async function connectDB(req, res) {

    var mongoDb = process.env.MONGODB_URL;
    mongoose.set("strictQuery", false);
    await mongoose.connect(mongoDb, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    var db = mongoose.connection;

}
