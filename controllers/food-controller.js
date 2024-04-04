const knex = require("knex")(require("../knexfile"));
const jwt = require("jsonwebtoken");
const { readFileSync } = require("fs");
const { default: axios } = require("axios");

const random = async (req, res) => {
  try {
    let food = "";

    let currentLocation = {
      lat: 49.22729731035157,
      lng: -123.00006611882536,
    }; //default location
    if (req.body.location) {
      currentLocation = req.body.location;
    }

    let result = [];
    while (result.length <= 0) {
      food = await randomFood(req, res);
      result = await search(
        food.name,
        `${currentLocation.lat},${currentLocation.lng}`
      );
    }

    const response = await Promise.all(
      result.map(async (place) => {
        return {
          name: place.name,
          address: place.vicinity,
          rating: place.rating,
          distance: await distance(currentLocation, place.geometry.location),
          open: place.opening_hours ? place.opening_hours.open_now : false,
        };
      })
    );
    const slices = response.slice(0, 4);
    res.status(200).json({ ...food, restaurants: slices });
  } catch (error) {
    console.log(error);
  }
};

/*
Function to random name
*/

const randomFood = async (req, res) => {
  let food = "";
  try {
    if (req.headers.Authorization !== undefined) {
      const { Authorization } = req.headers;
      const token = Authorization.slice("bearer ".length);
      const payload = jwt.verify(token, process.env.SECRET_KEY);

      //get user's food list
      const foundUser = await knex("users").where({
        username: payload.username,
      });
      if (foundUser.length === 0) {
        return res
          .status(401)
          .json(`User ${req.decoded.username} is not found`);
      }
      const list = JSON.parse(foundUser[0].list);
      const index = Math.floor(Math.random() * list.length);
      food = list[index];
    } else {
      const list = JSON.parse(readFileSync("./data/defaultList.json")); //get default food list
      const index = Math.floor(Math.random() * list.length);
      food = list[index];
    }
    return food;
  } catch (error) {
    console.log(error);
  }
};

/*
Function to search restaurant by food name
*/
const search = async (name, currentLocation) => {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${currentLocation}&radius=${5000}&keyword=${name}&type=${"restaurant"}&key=${
    process.env.MAP_KEY
  }`;
  try {
    const response = await axios.get(url);
    const results = response.data.results;
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

module.exports = {
  random,
};
