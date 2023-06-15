const mongoose = require("mongoose");
require("dotenv").config();

require("./model/tag");

mongoose.connect(process.env.EXTERNAL_SERVICE_DB);
