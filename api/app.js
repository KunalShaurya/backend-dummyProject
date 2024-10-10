import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/users.js"

const app = express();
dotenv.config();


mongoose
  .connect(process.env.DB_URL, {
    serverSelectionTimeoutMS: 50000,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));


app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// const authenticate = (req, res, next) => {
//   const token = req.header("Authorization")?.replace("Bearer ", "");

//   if (!token) {
//     return res
//       .status(401)
//       .json({ message: "No token provided, authorization denied" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next(); // Call the next middleware or route handler
//   } catch (err) {
//     return res.status(401).json({ message: "Token is not valid" });
//   }
// };


// const userSchema = mongoose.Schema(
//   {
//     firstName: {
//       type: String,
//       required: true,
//     },

//     lastName: {
//       type: String,
//     },
//     password: { type: String, required: true },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     gender: {
//       type: String,
//     },
//   },
//   { timestamps: true }
// );

// const User = mongoose.model("user", userSchema);

//user data
app.get("/api/users", async (req, res) => {
  try {
    const allDbUsers = await User.find({});
     const userCount = allDbUsers.length; 
    return res.json({
      count: userCount,
      users: allDbUsers,
    });
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


app.post("/api/register", async (req, res) => {
  const { firstName, lastName, email,password, gender } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const newUser = new User({
      firstName,
      lastName,
      password:hashedPassword,
      email,
      gender,
    });

    const result = await newUser.save();

    console.log(result, "User created successfully");

    return res
      .status(201)
      .json({ message: "User registered successfully", result });
  } catch (err) {
    console.error("Error creating user:", err);
    return res
      .status(500)
      .json({ message: "Error creating user", error: err.message });
  }
});



app.post("/api/login", async (req, res) => {
  const { email, password } = req.body
  
  if (!email || !password) {
    return res.status(400).json({message:'Email and passWord are required'})
  }

  try {
    const user = await user.findOne({ email });

    if (!user) {
      return res.status(404).json({message:'User not found'})
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({message:"Invalid credentials"})
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn:'1h'
    })

    return res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    console.log("Error Logging In:", err)
     return res
       .status(500)
       .json({ message: "Error logging in", error: err.message });
    
  }
})





export default app;