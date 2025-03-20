import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.RESEND_API) {
  console.error("Provide RESEND_API inside the .env file");
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await resend.emails.send({
      from: "Magiccu <dontNeed@resend.dev>",
      to: [to],
      subject,
      html,
    });

    if (response.error) {
      console.error("Email sending failed:", response.error);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error("Unexpected error while sending email:", error);
    return null;
  }
};

export default sendEmail;
