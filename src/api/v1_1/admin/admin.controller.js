import { asyncHandler } from "../../../utils/errorHandler.js";
import { sendAdminSuccess } from "./utils/adminResponse.js";
import {
  getDashboardSnapshot,
  parseDashboardQuery,
} from "./services/adminDashboard.service.js";
import {
  adminForceLogoutUser,
  adminResetUserPassword,
  getAdminUserActivity,
  getAdminUserById,
  getAdminUsers,
  parseUsersQuery,
  updateAdminUserById,
} from "./services/adminUsers.service.js";
import {
  createAdminCurrency,
  getAdminCurrencies,
  getAdminCurrencyById,
  parseCurrenciesQuery,
  setAdminCurrencyDefault,
  toggleAdminCurrencyStatus,
  updateAdminCurrencyById,
} from "./services/adminCurrencies.service.js";
import {
  createAdminCategory,
  deleteAdminCategory,
  listAdminCategories,
  parseAdminCategoriesQuery,
  setAdminDefaultCategory,
  updateAdminCategory,
  updateAdminCategoryLimit,
} from "./services/adminCategories.service.js";
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

export const users = asyncHandler(async (req, res) => {
  const query = parseUsersQuery(req.query || {});

  try {
    const payload = await getAdminUsers(query);
    return sendAdminSuccess(req, res, payload, "Users loaded.");
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = "Unable to load users.";
    }
    throw error;
  }
});

export const userById = asyncHandler(async (req, res) => {
  try {
    const payload = await getAdminUserById(req.params.id);
    return sendAdminSuccess(req, res, payload, "User loaded.");
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = "Unable to load user.";
    }
    throw error;
  }
});

export const updateUser = asyncHandler(async (req, res) => {
  try {
    const payload = await updateAdminUserById(req.params.id, req.body || {});
    return sendAdminSuccess(req, res, payload, "User updated.");
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = "Unable to update user.";
    }
    throw error;
  }
});

export const resetUserPassword = asyncHandler(async (req, res) => {
  try {
    const payload = await adminResetUserPassword(req.params.id);
    return sendAdminSuccess(
      req,
      res,
      payload,
      "Password reset completed and temporary password emailed."
    );
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = "Unable to reset password.";
    }
    throw error;
  }
});

export const forceLogoutUser = asyncHandler(async (req, res) => {
  try {
    const payload = await adminForceLogoutUser(req.params.id);
    return sendAdminSuccess(req, res, payload, "User force logged out.");
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = "Unable to force logout user.";
    }
    throw error;
  }
});

export const userActivity = asyncHandler(async (req, res) => {
  try {
    const payload = await getAdminUserActivity(req.params.id);
    return sendAdminSuccess(req, res, { activity: payload }, "User activity loaded.");
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = "Unable to load user activity.";
    }
    throw error;
  }
});

export const currencies = asyncHandler(async (req, res) => {
  const query = parseCurrenciesQuery(req.query || {});
  try {
    const payload = await getAdminCurrencies(query);
    return sendAdminSuccess(req, res, payload, "Currencies loaded.");
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = "Unable to load currencies.";
    }
    throw error;
  }
});

export const currencyById = asyncHandler(async (req, res) => {
  try {
    const payload = await getAdminCurrencyById(req.params.id);
    return sendAdminSuccess(req, res, payload, "Currency loaded.");
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = "Unable to load currency.";
    }
    throw error;
  }
});

export const createCurrency = asyncHandler(async (req, res) => {
  try {
    const payload = await createAdminCurrency(req.body || {});
    return sendAdminSuccess(req, res, payload, "Currency created.", 201);
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = "Unable to create currency.";
    }
    throw error;
  }
});

export const updateCurrency = asyncHandler(async (req, res) => {
  try {
    const payload = await updateAdminCurrencyById(req.params.id, req.body || {});
    return sendAdminSuccess(req, res, payload, "Currency updated.");
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = "Unable to update currency.";
    }
    throw error;
  }
});

export const setCurrencyDefault = asyncHandler(async (req, res) => {
  try {
    const payload = await setAdminCurrencyDefault(req.params.id);
    return sendAdminSuccess(req, res, payload, "Default currency updated.");
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = "Unable to set default currency.";
    }
    throw error;
  }
});

export const toggleCurrencyStatus = asyncHandler(async (req, res) => {
  try {
    const payload = await toggleAdminCurrencyStatus(req.params.id, req.body?.isActive);
    return sendAdminSuccess(req, res, payload, "Currency status updated.");
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = "Unable to update currency status.";
    }
    throw error;
  }
});

export const categories = asyncHandler(async (req, res) => {
  const query = parseAdminCategoriesQuery(req.query || {});
  try {
    const payload = await listAdminCategories(query);
    return sendAdminSuccess(req, res, payload, "Categories loaded.");
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = "Unable to load categories.";
    }
    throw error;
  }
});

export const createCategory = asyncHandler(async (req, res) => {
  try {
    const payload = await createAdminCategory(req.body || {}, req.admin?.email || null);
    return sendAdminSuccess(req, res, payload, "Category created.", 201);
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = "Unable to create category.";
    }
    throw error;
  }
});

export const updateCategory = asyncHandler(async (req, res) => {
  try {
    const payload = await updateAdminCategory(req.params.id, req.body || {}, req.admin?.email || null);
    return sendAdminSuccess(req, res, payload, "Category updated.");
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = "Unable to update category.";
    }
    throw error;
  }
});

export const setCategoryDefault = asyncHandler(async (req, res) => {
  try {
    const payload = await setAdminDefaultCategory(req.params.id, req.admin?.email || null);
    return sendAdminSuccess(req, res, payload, "Default category updated.");
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = "Unable to update default category.";
    }
    throw error;
  }
});

export const deleteCategory = asyncHandler(async (req, res) => {
  try {
    const payload = await deleteAdminCategory(req.params.id);
    return sendAdminSuccess(req, res, payload, "Category deleted.");
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = "Unable to delete category.";
    }
    throw error;
  }
});

export const updateCategorySettings = asyncHandler(async (req, res) => {
  try {
    const payload = await updateAdminCategoryLimit(req.body?.defaultCategoryLimit, req.admin?.email || null);
    return sendAdminSuccess(req, res, payload, "Category settings updated.");
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = "Unable to update category settings.";
    }
    throw error;
  }
});
