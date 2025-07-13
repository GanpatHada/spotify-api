const axios = require("axios");
const ApiError = require("../utils/apiError.util");
const asyncHandler = require("../utils/asyncHandler.util");



let accessToken = process.env.SPOTIFY_ACCESS_TOKEN;
const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

const refreshAccessToken = async () => {
  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);

  const authBuffer = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await axios.post("https://accounts.spotify.com/api/token", params, {
    headers: {
      Authorization: `Basic ${authBuffer}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  accessToken = response.data.access_token;
  console.log("🔄 Access token refreshed!");
  return accessToken;
};

const ensureValidAccessToken = asyncHandler(async (req, res, next) => {
  try {
    await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    req.spotifyToken = accessToken;
    next();
  } catch (error) {
    if (error.response?.status === 401) {
      console.log("⚠️ Access token expired. Refreshing...");
      try {
        const newToken = await refreshAccessToken();
        req.spotifyToken = newToken;
        return next();
      } catch (refreshError) {
        throw new ApiError(
          401,
          "Failed to refresh Spotify access token",
          [refreshError.response?.data || refreshError.message]
        );
      }
    } else {
      throw new ApiError(
        500,
        "Spotify token validation failed",
        [error.response?.data || error.message]
      );
    }
  }
});

module.exports = { ensureValidAccessToken };
