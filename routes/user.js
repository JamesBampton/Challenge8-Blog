const router = require("express").Router();
const { User } = require("../models");
const { signToken, authMiddleware } = require("../utils/auth");

// Get current authenticated user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.getOne(req.user.id);
    if (!user) return res.status(401).json({ message: "Token expired" });
    return res.status(200).json({ user });
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET the User record
router.get("/:id", async (req, res) => {
  console.log("looking for user", req.params.id);
  try {
    const userData = await User.getOne(req.params.id);

    if (!userData) {
      res.status(404).json({ message: "No User found with this id" });
      return;
    }

    res.status(200).json(userData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.post("/", async (req, res) => {
  try {
    const userData = await User.create(req.body);

    const token = signToken(userData);
    res.status(200).json({ token, userData });
  } catch (err) {
    res.status(400).json(err);
  }
});

// UDPATE the User record
router.put("/:id", async (req, res) => {
  try {
    const userData = await User.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (!userData) {
      res.status(404).json({ message: "No User found with this id" });
      return;
    }

    res.status(200).json(userData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/login", async (req, res) => {

  try {
    console.log("Password from request:", req.body.password);
    const userData = await User.findOne({ where: { email: req.body.email } });
    if (!userData) {

      res
        .status(400)
        .json({ message: "Incorrect email or password, please try again idiot" });
      return;
    }

    const validPassword = await userData.checkPassword(req.body.password);
    console.log("Password match:", validPassword);

    if (!validPassword) {
      res
        .status(400)
        .json({ message: "Incorrect email or password, please try again wally" });
      return;
    }

    const token = signToken(userData);
    res.status(200).json({ token, userData });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

// Register a new user ORIGINAL Code
/* router.post("/register", async (req, res) => {
  try {
    const userData = await User.create(req.body);

    const token = signToken(userData);
    res.status(201).json({
      message: "User created successfully",
      user: userData,
      token,
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(400).json({ message: "Failed to register user", error: err });
  }
}); */


// Register a new user
router.post("/register", async (req, res) => {

  const { username, email, password } = req.body;

  //Validate all fields are populated before before callinf User.create, if not all fields are populated fire a message box
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });}

  //Validate if email is correct format, if not report error messaage via message box
  const emailRegex = /^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }
  
  try {

    const existingUser = await User.findOne({ where: { email: req.body.email } });
     if (existingUser) {
      res.status(409).json({ message: "User already exists with this email. Please try again",
     });
    }
    const userData = await User.create(req.body);

    const token = signToken(userData);
    res.status(201).json({
      message: "User registered successfully!",
      user: userData,
      token,
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(400).json({ message: "Registration failed. Please try again.", error: err });
  }
});



router.post("/logout", (req, res) => {
  res.status(204).end();
});

module.exports = router;
