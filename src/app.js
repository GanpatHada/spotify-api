const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const errorHandler = require("./middlewares/errorHandler.middleware");
const spotifyRoutes = require("./routes/spotify.route");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

const PORT = process.env.PORT || 8000;

app.get("/", (_, res) => {
  res.status(200).json({ message: "Hello app" });
});

app.use("/api/v1/spotify", spotifyRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App is running on port: ${PORT}`);
});
