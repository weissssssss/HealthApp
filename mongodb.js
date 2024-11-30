const mongoose = require('mongoose');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/HealthApp')    
    .then(() => {
        console.log('Connected to MongoDB...');
    })
    .catch((err) => {
        console.error('Could not connect to MongoDB:', err);
    });

// Schema definition
const LoginSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim: true // Removes extra whitespace
    },
    lastname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensures email uniqueness
        lowercase: true, // Converts email to lowercase
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Validates email format
    },
    phone: {
        type: String,
        required: true,
        match: /^[0-9]{7,11}$/ // Ensures phone number is numeric and between 7-11 digits
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'], // Restricts to specific values
        required: true
    },
    language: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 4 // Ensures password has a minimum length
    },
    resetPasswordToken: {
        type: String,
        required: false  // Optional field, will be filled during password reset process
    },
    resetPasswordExpires: {
        type: Date,
        required: false  // Optional field, will be filled during password reset process
    },
    created_at: {
        type: Date,
        default: Date.now // Automatically sets the creation date
    }
});

// Create the collection (model)
const Collection = mongoose.model('users', LoginSchema); // 'users' is the name of the collection in MongoDB

// Export the collection for use in other files
module.exports = Collection;