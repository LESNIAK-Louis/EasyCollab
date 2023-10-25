import mongoose from "mongoose";

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true},
  dateRegistration: { type: Date, default: Date.now },
  files: [{ type: ObjectId, ref: "File" }]
});

export default mongoose.model("User", UserSchema);