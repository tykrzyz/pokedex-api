require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const POKEDEX = require('./pokedex.json');

const { NODE_ENV } = require('./config');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  // move to the next middleware
  next();
});

const validTypes = ['Bug', 'Dark', 'Dragon', 'Electric', 'Fairy', 'Fighting', 'Fire', 'Flying', 'Ghost', 'Grass', 'Ground', 'Ice', 'Normal', 'Poison', 'Psychic', 'Rock', 'Steel', 'Water'];

function handleGetTypes(req, res){
  res.json(validTypes);
}

function handleGetPokemon(req, res){
  const {name = '', type = ''} = req.query;
  let result = POKEDEX.pokemon;
  if(type){
    if(!validTypes.includes(type)){
      return res.status(400).send({error: `${type} is not a valid type`});
    }
    else result = result.filter(pokemon => pokemon.type.includes(type));
  }
  if(name){
    result = result.filter(pokemon => pokemon.name.toLowerCase().includes(name.toLowerCase()));
  }
  
  return res.json(result);
}

app.get('/types', handleGetTypes);
app.get('/pokemon', handleGetPokemon);

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;