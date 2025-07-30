// Import required packages
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

//ADDITIONS
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { DataTypes } = require("sequelize"); // Import datatype object from sequelize , for defining types for teh DB
const dotenv = require("dotenv"); // Loading env variables from .env file
dotenv.config(); // No idea what this does
const User = require("./models/user");
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";
// END ADDITIONS

const sequelize = require("./config/connection");
const routes = require("./routes");

// Initialize Express application
const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3011;

// has the --rebuild parameter been passed as a command line param?
const rebuild = process.argv[2] === "--rebuild";

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Handle GET request at the root route
/* app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.htm"));
}); */

// Add routes
app.use(routes);

// Sync database
/* sequelize.sync({ force: rebuild }).then(() => {
  app.listen(PORT, () => console.log("Now listening"));
});
 */

// CPOIES DEOM SESSION 9 - Client Auth

// Middleware for authenticating JWT tokens
const authenticateJWT = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(403).json({ message: "Access Denied" });

  jwt.verify(token.split(" ")[1], SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid Token" });
    req.user = user;
    next();
  });
};

// Register a new user
app.post("/api/users/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });
    res.json({ message: "User created successfully", user });
  } catch (error) {
    res.status(400).json({ message: "Error creating user", error });
  }
});

// Login and get a JWT token
app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body; // changed username to email
    const user = await User.findOne({ where: { email: req.body.email } }); // changed username to email and
    console.log("Stored passwrod: ", userData.password);


    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});

// protected route
app.get("/protected", authenticateJWT, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

// HINT: See W7-S3-Express/9_ServeStatic/exercise/server.js for the solution

// TODO: Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public" )));

// TODO: Handle GET request at the root route
app.get("/", authenticateJWT, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.htm"));
});

// Sync database and start server  THIS MESSED UP AND ERROR WITH PORT ALREADY IN USE !!!!!!! USE WITH CAUTION
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
