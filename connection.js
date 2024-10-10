import mongoose from "mongoose";


async function ConnectMongoDb(url) {

    return mongoose
      .connect(url, {
        serverSelectionTimeoutMS: 50000,
      })
}


modules.exports = { ConnectMongoDb }