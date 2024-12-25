const express = require("express");
const routes = express.Router();
routes.use("/auth", require("../routes/authRoute"));
routes.use("/request", require("./requestRoute"));
routes.use("/banner", require("./bannerRoutes"));
routes.use("/category", require("./categoryRoutes"));
routes.use("/user", require("./ratingRoute"));
module.exports = routes;
