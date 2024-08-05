const mongoose = require("mongoose");
const env=require('dotenv')
env.config({path:'config.env'})
async function main() {
  await mongoose.connect(process.env.Database_url);
  console.log("Database connected sucessfully")
}
main().catch((err) => console.log(err));
