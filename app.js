const express = require('express');
const path = require('path');
const ejs = require('ejs');
const Collection = require('./mongodb'); // Import the MongoDB collection
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();

// Middleware setup
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: false }));

// Routes
app.get("/", (req, res) => {
    res.render('login', { errorMessage: null });
});

app.get("/login", (req, res) => {
    res.render('login', { errorMessage: null });
});

app.get("/signup", (req, res) => {
    res.render('signup', { errorMessage: null });
});

app.get('/forgot-password', (req, res) => {
    res.render('forgot-password', { errorMessage: null, successMessage: null });  // Render a page where user enters their email
});

app.post('/signup', async (req, res) => {
    try {
        const existingUser = await Collection.findOne({ email: req.body.email });

        if (existingUser) {
            // Email already exists
            return res.render('signup', { errorMessage: 'Email is already registered. Please use a different email or log in.' });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        // Create a new document with form data
        const data = new Collection({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            phone: req.body.phone,
            gender: req.body.gender,
            language: req.body.language,
            password: hashedPassword
        });

        // Save the document to the database
        await data.save();

        // Render the home page on success
        res.render('home');
    } catch (err) {
        console.error("Error saving data to the database:", err);
        res.render('signup', {errorMessage: "An error occurred. Please try again."});
    }
});

app.post('/login', async (req, res) => {
    try {
        const check = await Collection.findOne({ email: req.body.email});
        if (check.password===req.body.password) {
            res.render('index');
        }
        else{
            res.render('login', { errorMessage: 'Wrong password. Please try again.' });
        }   
   } catch{
       res.render('login', {errorMessage: "Wrong details. Please try again."})
   }
});

app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const expireTime = Date.now() + 3600000;  // Token expires in 1 hour

    // Find the user by email
    const user = await Collection.findOne({ email });

    if (!user) {
        return res.render('forgot-password', { errorMessage: 'No account found with that email.' });
    }

    // Update user with reset token and expiration time
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = expireTime;
    await user.save();

    // Send the email
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,  // Your email
            pass: process.env.EMAIL_PASSWORD  // Your email password
        }
    });

    const mailOptions = {
        to: email,
        from: process.env.EMAIL,
        subject: 'Password Reset Request',
        text: `You are receiving this email because you (or someone else) have requested to reset the password for your account.

        Please click on the following link to reset your password:
        http://${req.headers.host}/reset-password/${resetToken}

        If you did not request this, please ignore this email.
        `
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
            return res.render('forgot-password', { errorMessage: 'There was an error sending the email. Please try again.' });
        }
        console.log('Email sent: ' + info.response);
        res.render('forgot-password', { successMessage: 'A password reset email has been sent.' });
    });
});

app.get('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) {
        return res.render('reset-password', { errorMessage: 'Password reset token is invalid or has expired.' });
    }

    res.render('reset-password', { errorMessage: null, successMessage: null, token });  // Pass token to the reset password page
});

app.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const user = await Collection.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) {
        return res.render('reset-password', { errorMessage: 'Password reset token is invalid or has expired.' });
    }

    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password and remove the reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.render('login', { successMessage: 'Your password has been successfully reset. You can now log in with your new password.' });
});



// Start the server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});