import mongoose from 'mongoose';
import fileModel from '../models/files.models.js'

export const createFile = async ({ projectId, fileTree }) => {
    if (!projectId) {
        throw new Error("ProjectId is required");
    }
    if (!fileTree) {
        throw new Error("File tree is required");
    }

    try {
        const file = await fileModel.create({
            projectId,
            fileTree
        });

        return file;
    } catch (error) {
        throw new error();
    }
}

export const getFileById = async ({ projectId }) => {
    if (!projectId) {
        throw new Error("FileId is required");
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid fileId");
    }

    const fileId = await fileModel.findOne({ projectId});

    const file = await fileModel.findById(fileId);

    return file;
}

export const updateFile = async ({ projectId, fileTree }) => {
    if (!projectId) {
        throw new Error("ProjectId is required");
    }
    if (!fileTree) {
        throw new Error("File tree is required");
    }

    const file = await fileModel.findOneAndUpdate({ projectId }, { fileTree }, { new: true });

    return file;
}

export const deleteFiles = async ({ projectId }) => {
    if (!projectId) {
        throw new Error("ProjectId is required");
    }

    const isPresent = await fileModel.findOne({ projectId });

    console.log("isPresent: ", isPresent);

    if(isPresent){
        const res = await fileModel.findOneAndDelete({ projectId });
        return res;
    }
    
    return true;
}