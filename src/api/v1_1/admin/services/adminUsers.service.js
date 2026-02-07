import User from "../../../../models/User.js";

const ALLOWED_STATUS = new Set(["ACTIVE", "INACTIVE", "SUSPENDED"]);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const fullName = (user) => {
  if (user.name && user.name.trim()) {
    return user.name.trim();
  }

  return `${user.fname || ""} ${user.lname || ""}`.trim();
};

export const parseUsersQuery = ({ name, email, userId, status }) => {
  const parsed = {
    name: typeof name === "string" ? name.trim() : "",
    email: typeof email === "string" ? email.trim() : "",
    userId: typeof userId === "string" ? userId.trim() : "",
    status: typeof status === "string" ? status.trim().toUpperCase() : "",
  };

  if (parsed.status && !ALLOWED_STATUS.has(parsed.status)) {
    const error = new Error("Invalid status. Allowed values: ACTIVE, INACTIVE, SUSPENDED.");
    error.status = 400;
    error.details = {
      status: ["Allowed values are ACTIVE, INACTIVE, SUSPENDED."],
    };
    throw error;
  }

  return parsed;
};

export const getAdminUsers = async ({ name, email, userId, status }) => {
  const query = {};

  if (name) {
    const pattern = new RegExp(escapeRegex(name), "i");
    query.$or = [{ name: pattern }, { fname: pattern }, { lname: pattern }];
  }

  if (email) {
    query.email = new RegExp(escapeRegex(email), "i");
  }

  if (status) {
    query.status = status;
  }

  const docs = await User.find(query)
    .sort({ createdAt: -1 })
    .select("name fname lname email status")
    .lean();

  let users = docs.map((doc) => ({
    id: doc._id.toString(),
    name: fullName(doc),
    email: doc.email,
    status: doc.status || "ACTIVE",
  }));

  if (userId) {
    const normalized = userId.toLowerCase();
    users = users.filter((user) => user.id.toLowerCase().includes(normalized));
  }

  return {
    users,
    total: users.length,
  };
};
