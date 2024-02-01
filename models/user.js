const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true }, //name of the user
  email: { type: String, required: true, unique: true }, //email of the user
  password: { type: String, required: true, minlength: 6 }, //password of the user
  image: { type: String, required: true }, //image of the user
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Place' }], //places of the user
});

module.exports = mongoose.model('User', userSchema);
