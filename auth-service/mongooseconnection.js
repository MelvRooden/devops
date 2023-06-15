const mongoose = require("mongoose");
require("dotenv").config();

require("./model/user");

mongoose.connect(process.env.AUTH_SERVICE_DB);
