require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const path = require('path');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Collection = require('./mongodb'); // Import your MongoDB collection

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet()); // Add security headers
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); // Rate limiting
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

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
    res.render('forgot-password', { errorMessage: null, successMessage: null });
});

app.post('/signup', async (req, res) => {
    try {
        const existingUser = await Collection.findOne({ email: req.body.email });

        if (existingUser) {
            return res.render('signup', { errorMessage: 'Email is already registered. Please use a different email or log in.' });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const data = new Collection({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            phone: req.body.phone,
            gender: req.body.gender,
            language: req.body.language,
            password: hashedPassword,
        });

        await data.save();

        res.render('home');
    } catch (err) {
        console.error("Error saving data to the database:", err);
        res.render('signup', { errorMessage: "An error occurred. Please try again." });
    }
});

app.post('/login', async (req, res) => {
    try {
        const check = await Collection.findOne({ email: req.body.email });
        if (!check) {
            return res.render('login', { errorMessage: "User not found. Please sign up first." });
        }

        const isMatch = await bcrypt.compare(req.body.password, check.password);
        if (isMatch) {
            res.render('index');
        } else {
            res.render('login', { errorMessage: 'Wrong password. Please try again.' });
        }
    } catch (err) {
        console.error("Error during login:", err);
        res.render('login', { errorMessage: "An error occurred. Please try again." });
    }
});

app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    const resetToken = crypto.randomBytes(20).toString('hex');
    const expireTime = Date.now() + 3600000; // Token expires in 1 hour

    const user = await Collection.findOne({ email });

    if (!user) {
        return res.render('forgot-password', { errorMessage: 'No account found with that email.' });
    }

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = expireTime;
    await user.save();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        to: email,
        from: process.env.EMAIL,
        subject: 'Password Reset Request',
        text: `You are receiving this email because you (or someone else) have requested to reset the password for your account.
        
        Please click on the following link to reset your password:
        http://${req.headers.host}/reset-password/${resetToken}
        
        If you did not request this, please ignore this email.`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error("Error sending email:", err);
            return res.render('forgot-password', { errorMessage: 'There was an error sending the email. Please try again.' });
        }
        console.log('Email sent: ' + info.response);
        res.render('forgot-password', { successMessage: 'A password reset email has been sent.' });
    });
});

app.get('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const user = await Collection.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) {
        return res.render('reset-password', { errorMessage: 'Password reset token is invalid or has expired.' });
    }

    res.render('reset-password', { errorMessage: null, successMessage: null, token });
});

app.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const user = await Collection.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) {
        return res.render('reset-password', { errorMessage: 'Password reset token is invalid or has expired.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.render('login', { successMessage: 'Your password has been successfully reset. You can now log in with your new password.' });
});

// Start the server


const PORT =  3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
