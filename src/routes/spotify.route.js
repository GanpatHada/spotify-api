const express = require("express");
const {
  getTop10Tracks,
  getCurrentlyPlaying,
  pausePlayback,
  playTrack,
} = require("../controllers/spotify.controller");
const { ensureValidAccessToken } = require("../middlewares/spotify.middleware");


const router = express.Router();

router.get("/top-tracks", ensureValidAccessToken, getTop10Tracks);
router.get("/currently-playing", ensureValidAccessToken, getCurrentlyPlaying);
router.get("/pause", ensureValidAccessToken, pausePlayback);
router.get("/play", ensureValidAccessToken, playTrack);

module.exports = router;
