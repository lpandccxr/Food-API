const knex = require("knex")(require("../knexfile"));
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { readFileSync } = require("fs");
const { use } = require("../routes/user");

const signUp = async (req, res) => {
  try {
    const { username, name, email, password } = req.body;

    //check if the username or email has been registered
    const foundUser = await knex("users")
      .where({ username: username })
      .orWhere({ email: email });

    if (foundUser.length > 0) {
      //if the submitted username or email has been reserved
      res.status(401).json({
        success: false,
        message: "username/email is exist",
      });
    } else {
      const hash = await hashPassword(password); //hash password
      const list = JSON.parse(readFileSync("./data/defaultList.json")); //get default food list
      //collect data in a obejct
      const insert = {
        username: username,
        name: name,
        email: email,
        password: hash,
        list: JSON.stringify(list),
        record: "",
      };
      //store user's information
      await knex("users").insert(insert);

      res.status(201).json({ success: "true" });
    }
  } catch (error) {
    console.log("Error sign up: ", error);
  }
};

const logIn = async (req, res) => {
  try {
    const { username, password } = req.body;
    const foundUser = await knex("users").where({
      username: username,
    }); //check if username is exist
    if (foundUser.length > 0) {
      const match = await bcrypt.compare(password, foundUser[0].password); //verify password
      if (match) {
        const token = jwt.sign(
          {
            username: username,
          },
          process.env.SECRET_KEY,
          { expiresIn: "14d" }
        );
        res.json({ token: token });
      } else {
        res.status(401).json("passowrd is wrong");
      }
    } else {
      res.status(401).json("username is not exist");
    }
  } catch (error) {
    console.log("Error log in:", error);
  }
};

const getUserInfo = async (req, res) => {
  try {
    const foundUser = await knex("users").where({
      username: req.decoded.username,
    });
    if (foundUser.length === 0) {
      res.status(401).json("User not found");
    } else {
      res.status(200).json({
        username: foundUser[0].username,
        email: foundUser[0].email,
        record: foundUser[0].record,
      });
    }
  } catch (error) {
    console.log("Get user info ", error);
  }
};

const addRecord = async (req, res) => {
  try {
    const foundUser = await knex("users").where({
      username: req.decoded.username,
    });
    if (foundUser.length === 0) {
      return res.status(401).json(`User ${req.decoded.username} is not found`);
    }
    let record = JSON.parse(foundUser[0].record);
    const newRecord = {
      name: req.body.name,
      timestamp: Date.now().toString(),
      id: uuidv4(),
    };
    record = [newRecord, ...record];
    const update = await knex("users")
      .where({
        username: req.decoded.username,
      })
      .update({ record: JSON.stringify(record) });

    if (update === 0) {
      return res.status(401).json(`User ${req.decoded.username} is not found`);
    }

    res.status(201).json(newRecord);
  } catch (error) {
    console.log("Get user info ", error);
  }
};

const addFood = async (req, res) => {
  try {
    const foundUser = await knex("users").where({
      username: req.decoded.username,
    });
    if (foundUser.length === 0) {
      return res.status(401).json(`User ${req.decoded.username} is not found`);
    }
    const list = JSON.parse(foundUser.list);
    list.push({
      name: req.body.name,
      country: req.body.country,
    });
    const update = await knex("users")
      .where({
        username: req.decoded.username,
      })
      .update({ list: JSON.stringify(list) });

    if (update === 0) {
      return res.status(401).json(`User ${req.decoded.username} is not found`);
    }

    res.status(201).json(newRecord);
  } catch (error) {
    console.log("Add food: ", error);
  }
};

const unlikeFood = async (req, res) => {
  try {
    const foundUser = await knex("users").where({
      username: req.decoded.username,
    });
    if (foundUser.length === 0) {
      return res.status(401).json(`User ${req.decoded.username} is not found`);
    }
    const list = JSON.parse(foundUser.list);

    const newList = list.filter((food) => food.name !== req.body.name);
    //remove food fromm list
    const update = await knex("users")
      .where({
        username: req.decoded.username,
      })
      .update({ list: JSON.stringify(newList) });

    if (update === 0) {
      return res.status(401).json(`User ${req.decoded.username} is not found`);
    }

    res.status(201).json(`Remove food ${req.body.name} from food list`);
  } catch (error) {
    console.log("Add food: ", error);
  }
};

/*
  Function for hashing the password using bcrypt
*/
const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password.toString(), 5);
    return hashedPassword;
  } catch (error) {
    console.log("Error hashing password:", error);
  }
};

/*
Middleware for authenticate token
*/
const authenToken = (req, res, next) => {
  const { authorization } = req.headers;
  const token = authorization.slice("bearer ".length);
  try {
    const payload = jwt.verify(token, process.env.SECRET_KEY);
    req.decoded = payload;
    next();
  } catch (e) {
    res.sendStatus(401);
    console.log(e);
  }
};

module.exports = {
  signUp,
  logIn,
  getUserInfo,
  authenToken,
  addRecord,
  addFood,
  unlikeFood,
};
