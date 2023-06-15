const express = require("express");
const app = express();
require("dotenv").config();
const axios = require("axios");
const fd = require("form-data");
const fs = require("fs");

const { API_KEY, API_SECRET, API_URL } = require("./api-secrets");
const { hasOpaqueToken } = require("../middleware/auth");
const multer = require("multer");
require("./mongooseconnection");

const port = process.env.EXTERNAL_SERVICE_PORT;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.use(express.json());

app.post("/tag", hasOpaqueToken, upload.single("image"), async (req, res) => {
  try {
    const imageFilePath = req.file.path;

    const form = new fd();
    form.append("image", fs.createReadStream(imageFilePath));

    const response = await axios.post(`${API_URL}/v2/tags`, form, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${API_KEY}:${API_SECRET}`,
          "utf8"
        ).toString("base64")}`,
        ...form.getHeaders,
      },
      data: form,
    });
    return res.json(response.data);
  } catch (e) {
    console.error(e);
    return res.status(e?.response?.status ?? 500).json({
      message: e?.response?.data?.message ?? "Internal server error",
    });
  }
});

app.listen(port, async () => {
  console.log(`External service online on ${port}`);
});
