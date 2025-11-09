const axios = require("axios");
const asyncHandler = require("../utils/asyncHandler.util");
const ApiResponse = require("../utils/apiResponse.util");
const ApiError = require("../utils/apiError.util");

const getTop10Tracks = asyncHandler(async (req, res) => {
  const response = await axios.get("https://api.spotify.com/v1/me/top/tracks?limit=10", {
    headers: { Authorization: `Bearer ${req.spotifyToken}` },
  });

  const topTracks = response.data.items.map((track) => ({
    name: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    uri: track.uri,
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, topTracks, "Top 10 tracks fetched successfully"));
});

const getCurrentlyPlaying = asyncHandler(async (req, res) => {
  const response = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
    headers: { Authorization: `Bearer ${req.spotifyToken}` },
  });

  const item = response.data?.item;
  if (!item) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "No song is currently playing"));
  }

  const data = {
    name: item.name,
    artist: item.artists.map((a) => a.name).join(", "),
    uri: item.uri,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Currently playing track fetched"));
});

const pausePlayback = asyncHandler(async (req, res) => {
  try {
    await axios.put(
      "https://api.spotify.com/v1/me/player/pause",
      {},
      { headers: { Authorization: `Bearer ${req.spotifyToken}` } }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Playback paused successfully"));
  } catch (error) {
    if (error.response?.status === 403) {
      throw new ApiError(403, "Playback control requires Spotify Premium");
    }
    throw new ApiError(500, "Error pausing playback", [error.response?.data || error.message]);
  }
});

const playTrack = asyncHandler(async (req, res) => {
  const trackUri = req.query.uri;
  if (!trackUri) {
    throw new ApiError(400, "Missing track URI");
  }

  try {
    await axios.put(
      "https://api.spotify.com/v1/me/player/play",
      { uris: [trackUri] },
      { headers: { Authorization: `Bearer ${req.spotifyToken}` } }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, null, `Playback started for ${trackUri}`));
  } catch (error) {
    if (error.response?.status === 403) {
      throw new ApiError(403, "Playback control requires Spotify Premium");
    }
    throw new ApiError(500, "Error starting playback", [error.response?.data || error.message]);
  }
});

const getFollowedArtists = asyncHandler(async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.spotify.com/v1/me/following?type=artist&limit=50",
      {
        headers: { Authorization: `Bearer ${req.spotifyToken}` },
      }
    );

    const artists = response.data.artists.items.map((artist) => ({
      name: artist.name,
      followers: artist.followers.total,
      genres: artist.genres,
      image: artist.images?.[0]?.url || null,
      uri: artist.uri,
    }));

    return res
      .status(200)
      .json(new ApiResponse(200, artists, "Followed artists fetched successfully"));
  } catch (error) {
     console.log("❌ Spotify API Error:");
  console.log("Status:", error.response?.status);
  console.log("Data:", error.response?.data);
  console.log("Headers:", error.response?.headers);
  throw new ApiError(500, "Error fetching followed artists", [
    error.response?.data || error.message,
  ]);
  }
});


module.exports = {
  getTop10Tracks,
  getCurrentlyPlaying,
  pausePlayback,
  playTrack,
  getFollowedArtists,
};
