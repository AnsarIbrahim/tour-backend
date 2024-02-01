const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const DUMMY_PLACES = require('../Dummy-Places');
const HttpError = require('../models/http-error');
const getGeocode = require('../utils/locations');

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid; // { pid: 'p1' }
  const place = DUMMY_PLACES.find((p) => p.id === placeId);

  if (!place) {
    return next(
      new HttpError('Could not find a place for the provided id.', 404)
    );
  }

  res.json({ place: place }); // => { place } => { place: place }
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid; // { uid: 'u1' }
  const places = DUMMY_PLACES.filter((p) => p.creator === userId);

  if (!places || places.length === 0) {
    return next(
      new HttpError('Could not find a places for the provided user id.', 404)
    );
  }
  res.json({ place: places });
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

  const createdPlace = {
    id: uuidv4(),
    title,
    description,
    location: coordinates,
    address,
    creator,
  };

  DUMMY_PLACES.push(createdPlace); // unshift(createdPlace);

  res.status(201).json({ place: createdPlace });
};

const updatePlace = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check your data.', 422);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid; // { pid: 'p1' }

  const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) };
  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);

  updatedPlace.title = title;
  updatedPlace.description = description;

  DUMMY_PLACES[placeIndex] = updatedPlace;

  res.status(200).json({ place: updatedPlace });
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid; // { pid: 'p1' }

  if (!DUMMY_PLACES.find((p) => p.id === placeId)) {
    throw new HttpError('Could not find a place for that id.', 404);
  }

  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);

  if (placeIndex < -1) {
    return next(new HttpError('Could not find a place for that id.', 404));
  }

  DUMMY_PLACES.splice(placeIndex, 1);

  res.status(200).json({ message: 'Deleted place.' });
};

module.exports = {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace,
};
