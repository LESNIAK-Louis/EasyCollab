import mongoose from "mongoose";

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const FileSchema = new Schema({
    id: { type: ObjectId, unique: true},
    owner: { type: ObjectId, ref: "User" },
    usersR: [{ type: ObjectId, ref: "User" }],
    usersRW: [{ type: ObjectId, ref: "User" }],
    name: { type: String, default: 'newFile', required: true },
    location: { type: String, match: /[a-z]/, required: true },
    dateCreation: { type: Date, default: Date.now(), required: true },
    dateModified: { type: Date, default: Date.now() }
});

export default mongoose.model("File", FileSchema);