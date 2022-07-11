const HttpError = require('../models/http-error');
const fs = require('fs');
const { validationResult } = require('express-validator');
const getCoordsForAddress = require('../util/locations');
const Place = require('../models/place');
const User = require('../models/user');
const mongoose = require('mongoose');
const { error } = require('console');
const { errorMonitor } = require('events');
const place = require('../models/place');

exports.getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;
    // const place = DUMMY_PLACES.find((p) => p.id === placeId);
    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        console.log(err);
        return next(new HttpError('Something went wrong, could not find place by id', 500));
    }
    if (!place) {
        return next(new HttpError('Could not find place for the provided id', 500));
    }
    res.json({ place: place.toObject({ getters: true }) });
};

exports.getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    let places;
    try {
        places = await Place.find({ creator: userId });
    } catch (err) {
        return next(new HttpError('Could not find place for the provided id', 500));
    }

    if (!places) {
        return next(new HttpError('Could not find a place for the provided user id', 500));
    }
    // if (places.length === 0) {
    //     res.json({ places: places });
    // }
    res.json({ places: places.map((place) => place.toObject({ getters: true })) });
};

exports.createPlace = async (req, res, next) => {
    console.log(11);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }
    const { title, description, address } = req.body;
    let coordinates;
    try {
        console.log(address);
        coordinates = await getCoordsForAddress(address);
    } catch (err) {
        console.log(err);
        // return next(new HttpError('Invalid coordinates, please check your data', 422));
    }
    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates || { lat: -60, lng: 60 },
        image: req.file.path,
        creator: req.userData.userId,
    });
    let user;
    try {
        user = await User.findById(req.userData.userId);
    } catch (err) {
        console.log(err);
        return next(new HttpError("Can't find a user in place controllers, try again", 404));
    }
    if (!user) {
        console.log(user);
        return next(new HttpError("Can't find a user for provided id, try again", 404));
    }

    console.log(createdPlace);
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({ session: sess });
        user.places.push(createdPlace);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err);
        return next(new HttpError("Can't create place, try again, 400"));
    }
    res.status(201).json(createdPlace);
};

exports.updatePlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }
    const { title, description } = req.body;
    const placeId = req.params.pid;
    let updatedPlace;
    try {
        updatedPlace = await Place.findById(placeId);
    } catch (err) {
        return next(new HttpError('Something went wrong, could not update place', 500));
    }
    if (updatedPlace.creator.toString() !== req.userData.userId) {
        return next(new HttpError('You are now allowed to edit this place', 401));
    }

    updatedPlace.title = title;
    updatedPlace.description = description;

    try {
        await updatedPlace.save();
    } catch (err) {
        return next(new HttpError('Something went wrong, could not save place', 500));
    }
    console.log(updatedPlace);
    res.status(200).json({ place: updatedPlace.toObject({ getter: true }) });
};

exports.deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;
    try {
        place = await Place.findById(placeId).populate('creator');
    } catch (err) {
        return next(
            new HttpError('Something went wrong, could not find place by id to delete', 500)
        );
    }

    if (!place) {
        return next(
            new HttpError('Something went wrong, could not find place by id to delete', 500)
        );
    }

    if (place.creator.id !== req.userData.userId) {
        return next(new HttpError('You are not allowed to delete this place', 401));
    }
    const imagePath = place.image;

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.remove({ session: sess });
        place.creator.places.pull(place);
        await place.creator.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        return next(new HttpError('Something went wrong, could not delete place', 500));
    }
    fs.unlink(imagePath, (err) => {
        console.log(err);
    });

    res.status(200).json({ message: 'Deleted Places' });
};
