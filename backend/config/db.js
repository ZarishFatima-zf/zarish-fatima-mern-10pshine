const mongoose = require("mongoose");

let cached = global.mongoose; // Reuse connection in serverless

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;

// const mongoose = require("mongoose");

// const connectDB = async () => {
//   try {
//     const uri =
//       process.env.NODE_ENV === "test"
//         ? process.env.MONGO_URI_TEST
//         : process.env.MONGO_URI;

//     await mongoose.connect(uri);
//     console.log("✅ MongoDB Atlas connected");
//   } catch (err) {
//     console.error("❌ MongoDB connection failed:", err.message);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;
