const mongoose = require('mongoose');

const FileUploadSchema = new mongoose.Schema({
    file: {
        type: String,
        required: true
    },
    file_type: {
        type: String,
        required: true
    },
    service_type: {
        type: String,
        required: true
    },
    resized_image: {
        type: Array
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, { versionKey: false });

module.exports = mongoose.model('File', FileUploadSchema);
