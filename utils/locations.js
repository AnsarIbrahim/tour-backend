const axios = require('axios');
const HttpError = require('../models/http-error');

const API_KEY = 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY';

const getGeocode = async (address) => {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json`,
    {
      params: {
        address: address,
        key: API_KEY,
      },
    }
  );

  const data = response.data;

  if (!data || data.status === 'ZERO_RESULTS' || data.results.length === 0) {
    throw new HttpError(
      'Could not find location for the specified address.',
      422
    );
  }

  const coordinates = data.results[0].geometry.location;

  return coordinates;
};

module.exports = getGeocode;
