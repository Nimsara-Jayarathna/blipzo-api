import Currency from "../../../models/Currency.js";
import User from "../../../models/User.js";

export const getAllCurrencies = async (userCurrencyId) => {
    const currencies = await Currency.find({}).sort({ name: 1 }).lean();

    return currencies.map(currency => ({
        ...currency,
        isSelected: userCurrencyId && currency._id.toString() === userCurrencyId.toString()
    }));
};

export const updateUserCurrency = async (userId, currencyId) => {
    const currency = await Currency.findById(currencyId);
    if (!currency) {
        const error = new Error("Invalid currency ID");
        error.status = 400;
        throw error;
    }

    const user = await User.findById(userId);
    if (!user) {
        const error = new Error("User not found");
        error.status = 404;
        throw error;
    }

    user.currency = currency._id;
    await user.save();

    // Return the updated currency object for the response
    return {
        id: currency._id,
        name: currency.name,
        code: currency.code,
        symbol: currency.symbol
    };
};
