import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  fileTree: {
    type: Object,
    required: true,
  },
});

const File = mongoose.model("file", fileSchema);

export default File;
