const knex = require("knex")(require("../knexfile"));
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { readFileSync, writeFileSync } = require("fs");

const signUp = async (req, res) => {
  try {
    const { username, name, email, password } = req.body;

    //check if the username or email has been registered
    const foundUser = await knex("users").where(function () {
      this.where({ username: username }).orWhere({ email: email });
    });
    if (foundUser) {
      //if the submitted username or email has been reserved
      res
        .json({
          success: false,
          message: "username/email is exist",
        })
        .sendStatus(401);
    }

    const hash = await hashPassword(password); //hash password
    const userId = uuidv4();
    const list = readFileSync("./data/defaultList.json"); //get default food list
    //collect data in a obejct
    const insert = {
      username: username,
      name: name,
      email: email,
      password: hash,
      list: list,
      id: userId,
    };
    //store user's information
    await knex("users").insert(insert);

    res.json({ success: "true" }).sendStatus(201);
  } catch (error) {
    console.log("Error sign up: ", error);
  }
};

const logIn = async (req, res) => {
  try {
    const { username, password } = req.body;
    const foundUser = await knex("users").where({
      username: username,
    });//check if username is exist
    if (foundUser) {
      const match = verifyPassword(password, foundUser.password);//verify password
      if (match) {
        const token = jwt.sign(
          {
            userId: foundUser.userId,
          },
          process.env.SECRET_KEY,
          { expiresIn: "14d" }
        );
        res.json({ token: token });
      } else {
        res.json("passowrd is wrong").sendStatus(401);
      }
    } else {
      res.json("username/passowrd is wrong").sendStatus(401);
    }
  } catch (error) {
    console.log("Error log in:", error);
  }
};

/*
  Function for hashing the password using bcrypt
*/
const hashPassword = async (password) => {
  try {
    const saltRounds = 5;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashPassword;
  } catch (error) {
    console.log("Error hashing password:", error);
  }
};

/*
  Function for comparing the submitted password and stored hash password 
*/
const verifyPassword = async (password, hash) => {
  try {
    const match = await bcrypt.compare(password, hash);
    if (match) {
      console.log("Passwords match!");
    } else {
      console.log("Passwords do not match!");
    }
  } catch (error) {
    console.log("Error comparing passwords:", error);
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
