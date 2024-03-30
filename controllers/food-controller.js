const knex = require("knex")(require("../knexfile"));

const random = async (req, res) => {
  
};

const search = async () => { };

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
  random,
};
