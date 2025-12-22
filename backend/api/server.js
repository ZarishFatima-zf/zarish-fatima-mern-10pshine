import mongoose from "mongoose";

const uri = process.env.MONGO_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

export default async function handler(req, res) {
  res.status(200).json({ message: "Backend working!" });
}
