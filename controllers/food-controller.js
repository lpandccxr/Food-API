const knex = require("knex")(require("../knexfile"));
const jwt = require("jsonwebtoken");
const { readFileSync } = require("fs");

const random = async (req, res) => {
  try {
    if (!req.decoded) {
      const list = JSON.parse(readFileSync("./data/defaultList.json")); //get default food list
      console.log("default list");
      const index = Math.floor(Math.random() * list.length);
      res.status(200).json(list[index]);
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
      console.log("user list");
      const index = Math.floor(Math.random() * list.length);
      res.status(200).json(list[index]);
    }
  } catch (error) {
    console.log(error);
  }
};

const search = async () => {};

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
