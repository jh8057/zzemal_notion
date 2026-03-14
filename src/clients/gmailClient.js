import { google } from "googleapis";

function buildAuth() {
  const creds = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
  const { client_id, client_secret } = creds.installed;

  const oauth2 = new google.auth.OAuth2(client_id, client_secret);
  oauth2.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return oauth2;
}

/**
 * HTML 이메일 발송
 * @param {string} to
 * @param {string} subject
 * @param {string} htmlBody
 */
export async function sendEmail(to, subject, htmlBody) {
  const auth = buildAuth();
  const gmail = google.gmail({ version: "v1", auth });

  const message = [
    `To: ${to}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
    "",
    htmlBody,
  ].join("\r\n");

  const raw = Buffer.from(message).toString("base64url");
  await gmail.users.messages.send({ userId: "me", requestBody: { raw } });
}
