import SibApiV3Sdk from "sib-api-v3-sdk";
import { logger } from "./logger.js";
import dotenv from "dotenv";

dotenv.config();

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.SIB_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendEmail = async ({ to, subject, htmlContent }) => {
    if (!process.env.SIB_API_KEY) {
        logger.warn("SIB_API_KEY not defined. Email skipped.");
        return;
    }

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = { name: "Blipzo", email: process.env.EMAIL_FROM || "no-reply@blipzo.xyz" };
    sendSmtpEmail.to = [{ email: to }];

    try {
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        logger.info(`Email sent to ${to}`);
    } catch (error) {
        logger.error("Error sending email:", error);
        throw new Error("Email could not be sent");
    }
};
