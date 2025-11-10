const axios = require("axios");
const asyncHandler = require("../utils/asyncHandler.util");
const ApiResponse = require("../utils/apiResponse.util");
const ApiError = require("../utils/apiError.util");

// 🎵 Get User's Top 10 Tracks
const getTop10Tracks = asyncHandler(async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.spotify.com/v1/me/top/tracks?limit=10",
      {
        headers: { Authorization: `Bearer ${req.spotifyToken}` },
      }
    );

    const topTracks = response.data.items.map((track) => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map((a) => ({
        id: a.id,
        name: a.name,
        externalURL: a.external_urls?.spotify,
      })),
      album: {
        id: track.album.id,
        name: track.album.name,
        externalURL: track.album.external_urls?.spotify,
        image: track.album.images?.[0]?.url || null,
      },
      trackURL: track.external_urls?.spotify,
      durationMs: track.duration_ms,
      previewURL: track.preview_url,
      uri: track.uri,
    }));

    return res
      .status(200)
      .json(new ApiResponse(200, topTracks, "Top 10 tracks fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Error fetching top tracks", [
      error.response?.data || error.message,
    ]);
  }
});

// 🎧 Get Currently Playing Track
const getCurrentlyPlaying = asyncHandler(async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: { Authorization: `Bearer ${req.spotifyToken}` },
      }
    );

    const item = response.data?.item;
    if (!item) {
      return res
        .status(200)
        .json(new ApiResponse(200, null, "No song is currently playing"));
    }

    const durationMs = item.duration_ms;
    const progressMs = response.data?.progress_ms || 0;

    const data = {
      id: item.id,
      name: item.name,
      artists: item.artists.map((a) => ({
        id: a.id,
        name: a.name,
        externalURL: a.external_urls?.spotify,
      })),
      album: {
        id: item.album.id,
        name: item.album.name,
        externalURL: item.album.external_urls?.spotify,
        image: item.album.images?.[0]?.url || null,
      },
      durationMs,
      progressMs,
      progressPercent: durationMs ? Math.floor((progressMs / durationMs) * 100) : 0,
      isPlaying: response.data?.is_playing || false,
      uri: item.uri,
      externalURL: item.external_urls?.spotify || null,
      previewURL: item.preview_url || null,
    };

    return res
      .status(200)
      .json(new ApiResponse(200, data, "Currently playing track fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Error fetching currently playing track", [
      error.response?.data || error.message,
    ]);
  }
});

// ⏸️ Pause Playback
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
    if (error.response?.status === 404) {
      throw new ApiError(404, "No active device found for playback");
    }
    throw new ApiError(500, "Error pausing playback", [
      error.response?.data || error.message,
    ]);
  }
});

// ▶️ Play a Specific Track
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
    if (error.response?.status === 404) {
      throw new ApiError(404, "No active device found for playback");
    }
    throw new ApiError(500, "Error starting playback", [
      error.response?.data || error.message,
    ]);
  }
});

// 👩‍🎤 Get Followed Artists
const getFollowedArtists = asyncHandler(async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.spotify.com/v1/me/following?type=artist&limit=50",
      {
        headers: { Authorization: `Bearer ${req.spotifyToken}` },
      }
    );

    const artists = response.data.artists.items.map((artist) => ({
      id: artist.id,
      name: artist.name,
      followers: artist.followers.total,
      genres: artist.genres,
      image: artist.images?.[0]?.url || null,
      uri: artist.uri,
      externalURL: artist.external_urls?.spotify || null,
      popularity: artist.popularity,
    }));

    return res
      .status(200)
      .json(new ApiResponse(200, artists, "Followed artists fetched successfully"));
  } catch (error) {
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
