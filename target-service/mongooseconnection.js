const mongoose = require("mongoose");
require("dotenv").config();

require("./model/target");

mongoose.connect(process.env.TARGET_SERVICE_DB);
