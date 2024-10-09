import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

const app = express();
dotenv.config();



mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

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