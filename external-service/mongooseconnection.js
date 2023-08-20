const mongoose = require("mongoose");
require("dotenv").config();

require("./model/tag");

mongoose.connect(
  process.env.external-service_DB || "mongodb://127.0.0.1:27017/external"
);
