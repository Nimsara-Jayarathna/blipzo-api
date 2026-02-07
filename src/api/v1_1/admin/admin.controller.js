import { asyncHandler } from "../../../utils/errorHandler.js";
import { sendAdminSuccess } from "./utils/adminResponse.js";
import {
  getDashboardSnapshot,
  parseDashboardQuery,
} from "./services/adminDashboard.service.js";
import {
  authenticateAdmin,
  clearAdminCookie,
  getAccessTokenTtlSeconds,
  getActiveAdminById,
  getAdminTokenFromRequest,
  setAdminCookie,
  signAdminAccessToken,
  verifyAdminAccessToken,
} from "./services/adminAuth.service.js";

export const login = asyncHandler(async (req, res) => {
  const admin = await authenticateAdmin(req.body || {});
  const token = signAdminAccessToken(admin);
  setAdminCookie(res, token);

  return sendAdminSuccess(
    req,
    res,
    {
      admin,
      session: { accessTokenExpiresInSeconds: getAccessTokenTtlSeconds() },
    },
    "Login successful."
  );
});

export const session = asyncHandler(async (req, res) => {
  const token = getAdminTokenFromRequest(req);
  if (!token) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }

  let admin;
  try {
    const decoded = verifyAdminAccessToken(token);
    admin = await getActiveAdminById(decoded.id);
  } catch (_error) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }

  return sendAdminSuccess(
    req,
    res,
    {
      authenticated: true,
      admin,
      session: { accessTokenExpiresInSeconds: getAccessTokenTtlSeconds() },
    },
    "Session active."
  );
});

export const logout = asyncHandler(async (req, res) => {
  clearAdminCookie(res);
  return sendAdminSuccess(req, res, {}, "Logged out successfully.");
});

export const dashboard = asyncHandler(async (req, res) => {
  const query = parseDashboardQuery(req.query || {});

  try {
    const snapshot = await getDashboardSnapshot(query);
    return sendAdminSuccess(req, res, snapshot, "Dashboard snapshot loaded.");
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = "Unable to load dashboard snapshot.";
    }
    throw error;
  }
});
