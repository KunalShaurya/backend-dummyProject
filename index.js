import dotenv from "dotenv";
import app from "./api/app.js";

dotenv.config(); 

const PORT = process.env.PORT || 8001;

app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
  