const express = require("express");
const router = express.Router();
const User = require("../models/User.js");
const fetchUser = require("../middleware/fetchUser.js");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "ernw832@9y4098nf$n";

//Create User Route
router.post(
  "/createuser",
  [
    body("fname", "Enter a valid First Name").isLength({ min: 3 }),
    body("lname", "Enter a valid Surname").isLength({ min: 3 }),
    body("email", "Enter a valid Email").isEmail(),
    body("dob", "Enter a valid Date of Birth")
      .isDate()
      .custom((value) => {
        const dob = new Date(value);
        const today = new Date();
        const ageDiff = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        const dayDiff = today.getDate() - dob.getDate();
        let age = ageDiff;
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
          age--;
        }
        if (age < 18) {
          throw new Error("You must be atleast 18 years old to register!");
        }
        return true;
      }),
    body("zip", "Enter a valid Zip Code").isLength(6),
    body("password", "Password must be atleast 9 characters").isLength({
      min: 9,
    }),
  ],
  async (req, res) => {
    let success = false;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({
            success,
            error:
              "Sorry, an Account with this Email already exists. Please try again with another Email Id",
          });
      }

      const secPass = await bcrypt.hash(req.body.password, 12);

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      const data = {
        user: {
          id: user.id,
        },
      };

      const auth_token = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, auth_token });

      // .then(user => res.json(user)).catch(err => {console.log(err); res.json({error: 'Please Enter a Unique Value for Email', message: err.message})})
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

//Login Route
router.post(
  "/login",
  [
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Password cannot be left blank!").exists(),
  ],
  async (req, res) => {
    let success = false;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ success, error: "Sorry, Incorrect Credentials Entered" });
      }
      const passwordComp = await bcrypt.compare(password, user.password);
      if (!passwordComp) {
        return res
          .status(400)
          .json({ success, error: "Sorry, Incorrect Credentials Entered" });
      }

      const data = {
        user: {
          id: user.id,
        },
      };

      const auth_token = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, auth_token });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

//Get User Details Route
router.post("/getuser", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(`${userId}`).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
