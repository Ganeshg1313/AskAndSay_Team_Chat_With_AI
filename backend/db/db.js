// Role: Establish database connection

import mongoose from "mongoose";

function connect() {
  mongoose
    .connect(process.env.mongoDBURL)
    .then(() => {
      console.log("App connected to database");
    })
    .catch((error) => {
      console.log(error);
    });
}

export default connect;
