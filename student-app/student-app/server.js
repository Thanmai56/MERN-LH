// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs"); // For password hashing

const app = express();
app.use(express.json());
app.use(cors());

// ✅ MongoDB Atlas Connection
const MONGODB_URI = "mongodb+srv://Sharanya:root@cluster1.ytdvivf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1";

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

// ✅ Schema & Model for User
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: Number, required: true } // 1 = Student, 2 = Instructor
});


const User = mongoose.model("User", userSchema);

const courseSchema = new mongoose.Schema({
  username: { type: String, required: true },   // instructor username
  coursed: { type: String, required: true, unique: true }, // courseId
  title: { type: String, required: true },
  description: { type: String, required: true },
  time: { type: Number, required: true },       // hours
  createdAt: { type: Date, default: Date.now }
});

const Course = mongoose.model("Course", courseSchema);

// ✅ ADD COURSE API (Used by AddCourse.jsx)
app.post("/courses", async (req, res) => {
  try {
    const { username, coursed, title, description, time } = req.body;

    if (!username || !coursed || !title || !description || !time) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check duplicate course ID
    const existingCourse = await Course.findOne({ coursed });
    if (existingCourse) {
      return res.status(400).json({ message: "Course ID already exists" });
    }

    const course = new Course({
      username,
      coursed,
      title,
      description,
      time
    });

    await course.save();

    res.status(201).json({
      message: "Course added successfully!",
      course
    });
  } catch (err) {
    console.error("❌ Course Add Error:", err);
    res.status(500).json({ error: err.message });
  }
});
// ✅ GET ALL COURSES (no username filter)
app.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find();   // Fetch all courses in DB
    res.json(courses);
  } catch (err) {
    console.error("❌ Error fetching courses:", err);
    res.status(500).json({ error: err.message });
  }
});


// ✅ Schema & Model for Course Content
const courseContentSchema = new mongoose.Schema({
  courseId: { type: String, required: true },   // Reference to coursed
  module: { type: Number, required: true },
  content: { type: String, required: true },
  link: { type: String },                       // Optional video/file link
  createdAt: { type: Date, default: Date.now }
});

const CourseContent = mongoose.model("CourseContent", courseContentSchema);

// ✅ ADD COURSE CONTENT API
app.post("/course-content", async (req, res) => {
  try {
    const { courseId, module, content, link } = req.body;

    if (!courseId || !module || !content) {
      return res.status(400).json({ message: "Course ID, Module, and Content are required" });
    }

    const newContent = new CourseContent({
      courseId,
      module,
      content,
      link
    });

    await newContent.save();

    res.status(201).json({
      message: "Course content added successfully!",
      data: newContent
    });
  } catch (err) {
    console.error("❌ Error adding course content:", err);
    res.status(500).json({ error: err.message });
  }
});


// ✅ REGISTER API (called from frontend register() in Login.jsx)
app.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json("All fields are required");
    }

    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json("User with this username or email already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role
    });

    await newUser.save();
    res.json({ message: "Registration successful!", user: newUser });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ LOGIN / VERIFY USER API (called from frontend login() in Login.jsx)
app.post("/verifyUser", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check user existence
    const user = await User.findOne({ username });
    if (!user) {
      return res.json({ auth: false, message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ auth: false, message: "Invalid password" });
    }

    // Send role and auth success
    res.json({
      auth: true,
      username: user.username,
      role: user.role,
      message: "Login successful!"
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Optional: Get all users (for admin or debugging)
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 8083;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
