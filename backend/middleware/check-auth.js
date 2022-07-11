const HttpError = require('../models/http-error');

const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }
    const token = req.headers.authorization.split(' ')[1];
    console.log(token);
    try {
        if (!token) {
            const error = new Http('Authentication failed', 403);
            console.log(10);
            next(error);
        }
        console.log(12);
        console.log('hey' + process.env.JWT_KEY);
        console.log(token);

        const decodedToken = jwt.verify(token, process.env.JWT_KEY);
        req.userData = { userId: decodedToken.userId };
        console.log(11);
        next();
    } catch (err) {
        const error = new HttpError('Hello', 401);
        next(error);
    }
};
