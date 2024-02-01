const { validationResult } = require('express-validator');

const Place = require('../models/place');
const HttpError = require('../models/http-error');
const getGeocode = require('../utils/locations');

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid; // { pid: 'p1' }

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(
      new HttpError('Something went wrong, could not find a place.', 500)
    );
  }

  if (!place) {
    return next(
      new HttpError('Could not find a place for the provided id.', 404)
    );
  }

  res.json({ place: place.toObject({ getters: true }) }); // => { place } => { place: place }
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid; // { uid: 'u1' }

  let places;

  try {
    places = await Place.find({ creator: userId });
  } catch (error) {
    return next(
      new HttpError('Something went wrong, could not find a places.', 500)
    );
  }

  if (!places || places.length === 0) {
    return next(
      new HttpError('Could not find a places for the provided user id.', 404)
    );
  }
  res.json({ place: places.map((place) => place.toObject({ getters: true })) }); // => { place } => { place: place }
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getGeocode(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image:
      'https://images.unsplash.com/photo-1611095977412-6d0b1a7b8d9b?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cGVyc29ufGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&w=1000&q=80',
    creator,
  });

  try {
    await createdPlace.save();
  } catch (error) {
    return next(new HttpError('Creating place failed, please try again.', 500));
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check your data.', 422);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid; // { pid: 'p1' }

  let place;

  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(
      new HttpError('Something went wrong, could not update place.', 500)
    );
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (error) {
    return next(
      new HttpError('Something went wrong, could not update place.', 500)
    );
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid; // { pid: 'p1' }

  let place;

  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(
      new HttpError('Something went wrong, could not delete place.', 500)
    );
  }

  if (!place) {
    return next(
      new HttpError('Could not find a place for the provided id.', 404)
    );
  }

  try {
    await place.deleteOne({ _id: placeId });
  } catch (error) {
    return next(
      new HttpError('Something went wrong, could not delete place.', 500)
    );
  }

  res.status(200).json({ message: 'Deleted place.' });
};

module.exports = {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace,
};
