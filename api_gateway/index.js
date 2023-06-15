const express = require("express");
const app = express();
const axios = require("axios");
const bodyParser = require("body-parser");
require("dotenv").config();

const { isAuthorized, hasRole } = require("../middleware/auth");
const multer = require("multer");

const port = process.env.API_GATEWAY_PORT;

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
const TARGET_SERVICE_URL = process.env.TARGET_SERVICE_URL;
const EXTERNAL_SERVICE_URL = process.env.EXTERNAL_SERVICE_URL;

const upload = multer();
const fd = require("form-data");

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// #region auth-service
app.post("/login", async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/login`, req.body, {
      headers: {
        opaque_token: process.env.OPAQUE_TOKEN,
      },
    });
    return res.json(response.data);
  } catch (e) {
    console.error(e);
    return res
      .status(e?.response?.status ?? 500)
      .json({ message: e?.response?.data?.message ?? "Internal server error" });
  }
});

app.post("/register", async (req, res) => {
  try {
    const response = await axios.post(
      `${AUTH_SERVICE_URL}/register`,
      req.body,
      {
        headers: {
          opaque_token: process.env.OPAQUE_TOKEN,
        },
      }
    );
    return res.json(response.data);
  } catch (e) {
    console.error(e);
    return res
      .status(e?.response?.status ?? 500)
      .json({ message: e?.response?.data?.message ?? "Internal server error" });
  }
});
// #endregion auth-service

// #region target-service
app.get("/targets", async (req, res) => {
  try {
    const { size, page } = req.query;
    const response = await axios.get(`${TARGET_SERVICE_URL}/targets`, {
      params: {
        size: size,
        page: page,
      },
      headers: {
        opaque_token: process.env.OPAQUE_TOKEN,
      },
    });
    return res.json(response.data);
  } catch (e) {
    console.error(e);
    return res
      .status(e?.response?.status ?? 500)
      .json({ message: e?.response?.data?.message ?? "Internal server error" });
  }
});

app.get("/targets/fieldvalueof", async (req, res) => {
  try {
    const {targetname, field } = req.query;
    const response = await axios.get(`${TARGET_SERVICE_URL}/targets/fieldvalueof`, {
      params: {
        targetname: targetname,
        field: field,
      },
      headers: {
        opaque_token: process.env.OPAQUE_TOKEN,
      },
    });
    return res.json(response.data);
  } catch (e) {
    console.error(e);
    return res
      .status(e.response.status)
      .json({ message: e.response.data.message });
  }
});

app.post(
  "/targets/create",
  isAuthorized,
  upload.single("image"),
  hasRole(["admin"]),

  async (req, res) => {
    try {
      const body = new fd();
      body.append("targetname", req.body.targetname);
      body.append("description", req.body.description);
      body.append("placename", req.body.placename);
      body.append("image", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      const response = await axios.post(
        `${TARGET_SERVICE_URL}/targets/create`,
        body,
        {
          headers: {
            opaque_token: process.env.OPAQUE_TOKEN,
            username: req.user.username,
          },
        }
      );
      return res.json(response.data);
    } catch (e) {
      console.error(e);
      return res.status(e?.response?.status ?? 500).json({
        message: e?.response?.data?.message ?? "Internal server error",
      });
    }
  }
);

app.get("/targets/placename/:placename", async (req, res) => {
  try {
    const { placename } = req.params;
    const response = await axios.get(
      `${TARGET_SERVICE_URL}/targets/placename/${placename}`,
      {
        headers: {
          opaque_token: process.env.OPAQUE_TOKEN,
        },
      }
    );
    return res.json(response.data);
  } catch (e) {
    console.error(e);
    return res
      .status(e?.response?.status ?? 500)
      .json({ message: e?.response?.data?.message ?? "Internal server error" });
  }
});

app.delete(
  "/targets/delete/:targetname",
  isAuthorized,
  hasRole(["admin"]),
  async (req, res) => {
    try {
      const { targetname } = req.params;
      const response = await axios.delete(
        `${TARGET_SERVICE_URL}/targets/delete/${targetname}`,
        {
          headers: {
            opaque_token: process.env.OPAQUE_TOKEN,
            username: req.user.username,
          },
        }
      );
      return res.status(response.status).json({ message: response.message });
    } catch (e) {
      console.error(e);
      return res.status(e?.response?.status ?? 500).json({
        message: e?.response?.data?.message ?? "Internal server error",
      });
    }
  }
);
// #endregion target

// #region external-service
app.post(
  "/tag",
  isAuthorized,
  hasRole(["admin", "user"]),
  upload.single("image"),
  async (req, res) => {
    try {
      const body = new fd();
      body.append("tagname", req.body.tagname);
      body.append("targetname", req.body.targetname);
      body.append("image", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });
      const response = await axios.post(`${EXTERNAL_SERVICE_URL}/tag`, body, {
        headers: {
          opaque_token: process.env.OPAQUE_TOKEN,
          username: req.user.username,
        },
      });
      return res.json(response.data);
    } catch (e) {
      console.error(e);
      return res.status(e?.response?.status ?? 500).json({
        message: e?.response?.data?.message ?? "Internal server error",
      });
    }
  }
);
// #endregion

app.listen(port, async () => {
  console.log(`GATEWAY service online on port ${port}`);
});
