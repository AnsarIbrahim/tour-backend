const express = require('express');
const bodyParser = require('body-parser');

const placesRoutes = require('./routes/places-routes');

const app = express();

app.use(bodyParser.json());

app.use('/api/places', placesRoutes); // => /api/places...

app.listen(5000, () => console.log('Server started on port 5000'));
