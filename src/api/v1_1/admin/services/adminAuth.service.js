import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AdminUser from "../../../../models/AdminUser.js";

const ADMIN_COOKIE_NAME = "adminAccessToken";
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;

const parseDurationMs = (value, fallbackMs) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return fallbackMs;
  }

  const match = value.trim().match(/^(\d+)([smhd])$/i);
  if (!match) {
    return fallbackMs;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };

  return amount * multipliers[unit] || fallbackMs;
};

const sanitizeAdmin = (admin) => ({
  id: admin._id.toString(),
  email: admin.email,
  roles: admin.roles?.length ? admin.roles : ["super_admin"],
});

export const authenticateAdmin = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error("Email and password are required.");
    error.status = 400;
    error.details = {
      email: !email ? ["Email is required."] : undefined,
      password: !password ? ["Password is required."] : undefined,
    };
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const admin = await AdminUser.findOne({ email: normalizedEmail }).select(
    "+passwordHash email roles isActive"
  );
  if (!admin || !admin.isActive) {
    const error = new Error("Incorrect email or password.");
    error.status = 401;
    throw error;
  }

  const validPassword = await bcrypt.compare(password, admin.passwordHash);
  if (!validPassword) {
    const error = new Error("Incorrect email or password.");
    error.status = 401;
    throw error;
  }

  await AdminUser.updateOne(
    { _id: admin._id },
    { $set: { lastLoginAt: new Date() } }
  );

  return sanitizeAdmin(admin);
};

export const getAccessTokenTtlSeconds = () =>
  Math.floor(parseDurationMs(ACCESS_TOKEN_EXPIRES_IN, 15 * 60 * 1000) / 1000);

const getAdminCookieOptions = () => {
  const sameSiteEnv = (process.env.COOKIE_SAMESITE || "lax").toLowerCase();
  const cookieSameSite = sameSiteEnv === "none" ? "none" : "lax";
  const cookieSecure = process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE !== "false"
    : true;
  const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

  return {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: cookieSameSite,
    domain: cookieDomain,
    path: "/",
    maxAge: parseDurationMs(ACCESS_TOKEN_EXPIRES_IN, 15 * 60 * 1000),
  };
};

export const signAdminAccessToken = (admin) => {
  if (!ACCESS_TOKEN_SECRET) {
    const error = new Error("JWT secret is not configured");
    error.status = 500;
    throw error;
  }

  return jwt.sign(
    {
      tokenType: "admin_access",
      adminId: admin.id,
      email: admin.email,
      roles: admin.roles,
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );
};

export const verifyAdminAccessToken = (token) => {
  if (!ACCESS_TOKEN_SECRET) {
    const error = new Error("JWT secret is not configured");
    error.status = 500;
    throw error;
  }

  const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
  if (decoded.tokenType !== "admin_access") {
    const error = new Error("Invalid admin token");
    error.status = 401;
    throw error;
  }

  return {
    id: decoded.adminId,
    email: decoded.email,
    roles: decoded.roles || ["super_admin"],
  };
};

export const getActiveAdminById = async (adminId) => {
  const admin = await AdminUser.findOne({ _id: adminId, isActive: true }).select(
    "email roles isActive"
  );
  if (!admin) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }
  return sanitizeAdmin(admin);
};

export const setAdminCookie = (res, token) => {
  res.cookie(ADMIN_COOKIE_NAME, token, getAdminCookieOptions());
};

export const clearAdminCookie = (res) => {
  const options = getAdminCookieOptions();
  delete options.maxAge;
  res.clearCookie(ADMIN_COOKIE_NAME, options);
};

export const getAdminTokenFromRequest = (req) => req.cookies?.[ADMIN_COOKIE_NAME];
