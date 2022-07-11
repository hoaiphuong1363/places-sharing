const axios = require('axios');

const HttpError = require('../models/http-error');
const API_KEY = process.env.GOOGLE_API_KEY;
// const API_KEY = 'AIzaSyDq2M9MNJsZ9cxuATKWZB83o3Gun4nNYtI';

const getCoordsForAddress = async (address) => {
    const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            address
        )}&key=${API_KEY}`
    );
    const data = response.data;
    console.log(data);

    if (!data || data.status === 'ZERO_RESULTS') {
        console.log(20);
        const error = HttpError('Could not find location for the specified address.', 422);
        throw error;
    }
    const coordinates = data.results[0].geometry.location;

    return coordinates;
};

module.exports = getCoordsForAddress;
