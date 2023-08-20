const express = require("express");
const app = express();
const axios = require("axios");
const bodyParser = require("body-parser");
require("dotenv").config();

const { isAuthorized, hasRole } = require("../middleware/auth");
const multer = require("multer");

const port = process.env.api-gateway_PORT || 3000;

const auth-service_URL =
  process.env.auth-service_URL || "http://127.0.0.1:3001";
const target-service_URL =
  process.env.target-service_URL || "http://127.0.0.1:3002";
const external-service_URL =
  process.env.external-service_URL || "http://127.0.0.1:3003";

const upload = multer();
const fd = require("form-data");

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

const promBundle = require("express-prom-bundle");
const metricsMiddleware = promBundle({
  includePath: true,
  includeStatusCode: true,
  normalizePath: true,
  promClient: {
    collectDefaultMetrics: {}
  }
});

app.use(metricsMiddleware);

// #region auth-service
app.post("/login", async (req, res) => {
  try {
    const response = await axios.post(`${auth-service_URL}/login`, req.body, {
      headers: {
        opaque_token: process.env.OPAQUE_TOKEN,
      },
    });
    return res.json(response.data);
  } catch (e) {
    console.error(e);
    return res
      .status(e?.response?.status || 500)
      .json({ message: e?.response?.data?.message || "Internal server error" });
  }
});

app.post("/register", async (req, res) => {
  try {
    const response = await axios.post(
      `${auth-service_URL}/register`,
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
      .status(e?.response?.status || 500)
      .json({ message: e?.response?.data?.message || "Internal server error" });
  }
});
// #endregion auth-service

// #region target-service
app.get("/targets", async (req, res) => {
  try {
    const { size, page } = req.query;
    const response = await axios.get(`${target-service_URL}/targets`, {
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
      .status(e?.response?.status || 500)
      .json({ message: e?.response?.data?.message || "Internal server error" });
  }
});

app.get("/targets/fieldvalueof", async (req, res) => {
  try {
    const { targetname, field } = req.query;
    const response = await axios.get(
      `${target-service_URL}/targets/fieldvalueof`,
      {
        params: {
          targetname: targetname,
          field: field,
        },
        headers: {
          opaque_token: process.env.OPAQUE_TOKEN,
        },
      }
    );
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
        `${target-service_URL}/targets/create`,
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
      return res.status(e?.response?.status || 500).json({
        message: e?.response?.data?.message || "Internal server error",
      });
    }
  }
);

app.get("/targets/placename/:placename", async (req, res) => {
  try {
    const { placename } = req.params;
    const response = await axios.get(
      `${target-service_URL}/targets/placename/${placename}`,
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
      .status(e?.response?.status || 500)
      .json({ message: e?.response?.data?.message || "Internal server error" });
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
        `${target-service_URL}/targets/delete/${targetname}`,
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
      return res.status(e?.response?.status || 500).json({
        message: e?.response?.data?.message || "Internal server error",
      });
    }
  }
);
// #endregion target

// #region external-service
app.post(
  "/tag/create",
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

      const response = await axios.post(
        `${external-service_URL}/tag/create`,
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
      return res.status(e?.response?.status || 500).json({
        message: e?.response?.data?.message || "Internal server error",
      });
    }
  }
);

app.get("/tag/:name", isAuthorized, hasRole(["admin", "user"]), async (req, res) => {
  try {
    const { name } = req.params;
    const response = await axios.get(`${external-service_URL}/tag/${name}`, {
      headers: {
        opaque_token: process.env.OPAQUE_TOKEN,
      },
    });
    return res.json(response.data);
  } catch (e) {
    console.error(e);
    return res.status(e?.response?.status || 500).json({
      message: e?.response?.data?.message || "Internal server error",
    });
  }
});
// #endregion

app.listen(port, async () => {
  console.log(`GATEWAY service online on port ${port}`);
});
