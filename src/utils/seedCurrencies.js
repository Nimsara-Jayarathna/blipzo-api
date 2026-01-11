import Currency from "../models/Currency.js";
import User from "../models/User.js";
import { logger } from "./logger.js";

const currencies = [
    { name: "US Dollar", code: "USD", symbol: "$", isDefault: true },
    { name: "Sri Lankan Rupee", code: "LKR", symbol: "Rs", isDefault: false },
];

export const seedCurrencies = async () => {
    try {
        // 1. Seed Currencies
        for (const currency of currencies) {
            const existing = await Currency.findOne({ code: currency.code });
            if (!existing) {
                await Currency.create(currency);
                logger.info(`Currency seeded: ${currency.code}`);
            } else {
                // Update isDefault if changed (optional, but good for consistency)
                if (existing.isDefault !== currency.isDefault) {
                    // If we are setting this to true, the model hook might handle flipping others,
                    // but bulk usage of seeding scripts needs care.
                    // For now, let's just ensure properties match if needed.
                    // Simplest is to just check if we need to update 'isDefault'
                    if (currency.isDefault) {
                        await Currency.updateMany({}, { isDefault: false });
                        existing.isDefault = true;
                        await existing.save();
                        logger.info(`Currency updated to default: ${currency.code}`);
                    }
                }
            }
        }

        // 2. Assign Default Currency to Existing Users
        const defaultCurrency = await Currency.findOne({ isDefault: true });
        if (defaultCurrency) {
            const result = await User.updateMany(
                { currency: { $exists: false } },
                { $set: { currency: defaultCurrency._id } }
            );
            if (result.modifiedCount > 0) {
                logger.info(`Assigned default currency (${defaultCurrency.code}) to ${result.modifiedCount} users.`);
            }

            // Also catch where currency is null
            const nullResult = await User.updateMany(
                { currency: null },
                { $set: { currency: defaultCurrency._id } }
            );
            if (nullResult.modifiedCount > 0) {
                logger.info(`Assigned default currency (${defaultCurrency.code}) to ${nullResult.modifiedCount} users (from null).`);
            }

        } else {
            logger.warn("No default currency found to assign to users.");
        }

    } catch (error) {
        logger.error("Error seeding currencies:", error);
    }
};
