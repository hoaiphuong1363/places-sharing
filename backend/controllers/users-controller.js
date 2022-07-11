const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password');
    } catch (err) {
        return next(new HttpError('Fetching users failed, please try again later', 500));
    }
    res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

exports.signup = async (req, res, next) => {
    console.log(req.image);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }
    const { name, email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        return next(new HttpError('Signup failed, please try again later', 500));
    }

    if (existingUser) {
        return next(new HttpError('Could not create user, emails already exists', 422));
    }
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        return next(new HttpError('Could not create user, please try again', 500));
    }

    const createdUser = new User({
        name,
        email,
        password: hashedPassword,
        image: req.file.path,
        places: [],
    });

    try {
        await createdUser.save();
    } catch (err) {
        console.log(err);
        return next(new HttpError('Signup failed, please try again later 2', 500));
    }
    console.log(createdUser.toObject({ getters: true }));

    let token;
    try {
        token = jwt.sign(
            { userId: createdUser.id, email: createdUser.email },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );
    } catch (err) {
        return next(new HttpError('Token failed', 500));
    }
    res.status(201).json({ userId: createdUser.id, email: createdUser.email, token: token });
};

exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    console.log(1);
    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
        console.log(12);
    } catch (err) {
        console.log(3);

        return next(new HttpError('Login failed, please try again later', 500));
    }
    if (!existingUser) {
        console.log(4);

        return next(new HttpError('Could not identify user', 401));
    }
    let isValidPassword = false;
    console.log(5);

    try {
        console.log(6);
        isValidPassword = await bcrypt.compare(password, existingUser.password);
        console.log(7);
    } catch (err) {
        return next(
            new HttpError('Could not log use in, check the credentials and try again ', 500)
        );
    }

    if (!isValidPassword) {
        return next(new HttpError('Invalid credentials, could not log you in', 403));
    }
    let token;
    try {
        token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email },
            'supersectet_dont_share',
            { expiresIn: '1h' }
        );
    } catch (err) {
        return next(new HttpError('Token failed', 401));
    }

    res.json({ userId: existingUser.id, email: existingUser.email, token });
};
