import express from "express"
import { ENV } from "./config/env.js";



const app = express();


app.get("/", (req, res) => {
  return res.send("hello");
});

console.log("mongo url:",ENV.MONGO_URL)
 app.listen(5001, () => {
  console.log(ENV.PORT," Server is running on port 5001:",ENV.PORT);
});
 