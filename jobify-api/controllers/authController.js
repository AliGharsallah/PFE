const User = require("../models/User"); // Assure-toi que le chemin est correct
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Vérifier si tous les champs sont présents
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Tous les champs sont requis" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const newUser = await User.create({
      name,
      email,
      password, // Le hashing est fait automatiquement dans le modèle
      role,
    });

    const token = generateToken(newUser);
    res.status(201).json({ token });
  } catch (err) {
    console.error(err); // Pour voir l'erreur dans la console du serveur
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);
    res.status(200).json({ token, role: user.role });
    } catch (err) {
    console.error(err); // Log the error to the console
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

