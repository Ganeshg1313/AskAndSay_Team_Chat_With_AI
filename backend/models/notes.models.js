import mongoose from "mongoose";

const notesSchema = mongoose.Schema({
  projectId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  content: {
    type: String,
    default: "",
  },
});

const notesModel = mongoose.model("notes", notesSchema);

export default notesModel;
