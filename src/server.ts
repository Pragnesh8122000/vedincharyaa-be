import "dotenv/config";

import app from "./app";
import connectDB from "./config/db";

// Connect to Database
connectDB();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
