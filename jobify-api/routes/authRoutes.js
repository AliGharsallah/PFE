const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
console.log(register); // Devrait afficher une fonction
console.log(login);    // Devrait afficher une fonction
router.delete('/delete-user', async (req, res) => {
    const { name } = req.body;
  
    try {
      // Find and delete the user by name
      const user = await User.findOneAndDelete({ name });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({ message: `User ${name} deleted successfully` });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });
module.exports = router;
