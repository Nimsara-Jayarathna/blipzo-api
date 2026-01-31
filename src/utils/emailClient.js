import SibApiV3Sdk from "sib-api-v3-sdk";
import { hashEmail, logger } from "./logger.js";
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

    const toHash = hashEmail(to);
    logger.info({
        event: "email_send_attempt",
        provider: "brevo",
        subject,
        toHash,
    });

    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        logger.info({
            event: "email_send_success",
            provider: "brevo",
            subject,
            toHash,
            messageId: data?.messageId,
        });
    } catch (error) {
        logger.error({
            event: "email_send_failure",
            provider: "brevo",
            subject,
            toHash,
            message: error?.message,
            code: error?.code,
            status: error?.status || error?.response?.statusCode,
            responseBody: error?.response?.body,
        });
        throw new Error("Email could not be sent");
    }
};
