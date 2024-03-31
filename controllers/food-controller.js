const knex = require("knex")(require("../knexfile"));
const jwt = require("jsonwebtoken");
const { readFileSync } = require("fs");
const { default: axios } = require("axios");

const random = async (req, res) => {
  let food = "";
  try {
    if (!req.decoded) {
      const list = JSON.parse(readFileSync("./data/defaultList.json")); //get default food list
      const index = Math.floor(Math.random() * list.length);
      food = list[index];
    } else {
      const foundUser = await knex("users").where({
        username: req.decoded.username,
      });
      if (foundUser.length === 0) {
        return res
          .status(401)
          .json(`User ${req.decoded.username} is not found`);
      }
      const list = JSON.parse(foundUser[0].list);
      const index = Math.floor(Math.random() * list.length);
      food = list[index];
    }
    const currentLocation = {
      lat: 49.22729731035157,
      lng: -123.00006611882536,
    };
    const result = await search(
      food.name,
      `${currentLocation.lat},${currentLocation.lng}`
    );
    const response = await Promise.all(
      result.map(async (place) => {
        return {
          name: place.name,
          address: place.vicinity,
          rating: place.rating,
          distance: await distance(currentLocation, place.geometry.location),
          open: place.opening_hours.open_now,
        };
      })
    );
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
};

/*
Function to search restaurant by food name
*/
const search = async (name, currentLocation) => {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${currentLocation}&radius=${15000}&keyword=${name}&type=${"restaurant"}&key=${
    process.env.MAP_KEY
  }`;
  try {
    const response = await axios.get(url);
    const results = response.data.results.slice(0, 3);
    return results;
  } catch (error) {
    console.log("Erro at searching food ", error);
  }
};

/*
Function to calculate distance between current location and destination
*/
const distance = async (current, destination) => {
  try {
    const response = await axios(
      "https://maps.googleapis.com/maps/api/distancematrix/json",
      {
        params: {
          origins: `${current.lat},${current.lng}`,
          destinations: `${destination.lat},${destination.lng}`,
          key: process.env.MAP_KEY,
        },
      }
    );
    return response.data.rows[0].elements[0].distance.text;
  } catch (error) {
    console.error("Error calculating distance:", error);
  }
};

/*
Middleware for authenticate token
*/
const authenToken = (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      next();
    } else {
      const token = authorization.slice("bearer ".length);
      const payload = jwt.verify(token, process.env.SECRET_KEY);
      req.decoded = payload;
      next();
    }
  } catch (e) {
    res.sendStatus(401);
    console.log(e);
  }
};

module.exports = {
  random,
  authenToken,
};
