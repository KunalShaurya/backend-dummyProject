import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

const app = express();
dotenv.config();

app.use(cors());

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
});

// Global variable to track the connection status
let isConnected = false;

// Function to handle database connection
const connectToDatabase = async () => {
  if (isConnected) {
    // Use existing database connection
    return;
  }

  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
};

// Middleware to ensure the database connection is established
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    res.status(500).json({ message: "Database connection error" });
  }
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Define route for root path
app.get("/", (req, res) => {
  res.send("Welcome to the API. Use /users to access user data.");
});



const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },

    lastName: { 
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);

//user data
app.get("/api/users", async (req, res) => {
  try {
    const allDbUsers = await User.find({});
    return res.json(allDbUsers);
  } catch (err) {
    console.log("error fetching to users", err);
  }
});

//find user by id
app
  .route("/api/users/:userId")

  //users list
  .get(async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      // const id = Number(req.params.userId);
      // const user = users.find((user) => user.id === id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json(user);
    } catch (err) {
      console.log("error to find users");
    }
  })

  //edit user
  .patch(async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(req.params.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json({ message: "user Updated" });
    } catch (err) {
      console.log("not updated");
    }
  })

  //delete user
  .delete(async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.userId);

      return res.json({ status: "deleted" });
    } catch (err) {
      console.log("err", err);
    }
  });

  
//create new user

app.post("/api/users", async (req, res) => {
  const { firstName, lastName, email, gender } = req.body;

  if (!firstName || !email) {
    return res
      .status(400)
      .json({ message: "First name and email are required" });
  }

  try {
    const result = await User.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      gender: gender,
    });

    console.log(result, "User created successfully");

    return res
      .status(201)
      .json({ message: "User created successfully", result });
  } catch (err) {
    console.error("Error creating user:", err);
    return res
      .status(500)
      .json({ message: "Error creating user", error: err.message });
  }
});





export default app;