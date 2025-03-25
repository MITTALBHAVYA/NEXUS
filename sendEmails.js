import fs from "fs";
import path from "path";
import { parseCSV, updateCSV } from "./services/CSVeditor.js";
import EmailService from "./services/EmailService.js";
import logger from "./utils/logger.js";
import {getRandomSubject,fillTemplate} from "./emailTemplates.js";

const RESUME_PATH = "./resumes";
const CSV_FILE = "./internship_data.csv";

const sendEmails = async () => {
  try {
    logger.info(`Starting email sending process...`);

    const records = await parseCSV(CSV_FILE);
    console.log("record : ",records);
    logger.info(`Loaded ${records.length} records from CSV.`);

    for (let record of records) {
      if (record.Send === "1" || record.Send === 1) {
        logger.info(`Skipping ${record.Company_Name} (email already sent to all referrals).`);
        continue;
      }

      const { Company_Name, Job_Type, Referrals } = record;

      // Extract all referral emails from the Referrals field
      let referralList;
      try{
        referralList = JSON.parse(Referrals);
        if(!Array.isArray(referralList)){
          throw new Error("Referrals field is not an array");
        }
      }catch(error){
        logger.warn(`Error parsing Referrals field for ${Company_Name}: ${error.message}. Skipping record.`);
        continue;
      }
      const recipients = referralList
        .filter(referral => referral.Email?.trim() && referral.Email.includes("@"))
        .map(referral => ({ email: referral.Email.trim(), name: referral.Name.trim() || "Hiring Manager" }));
      console.log("recipients : ",recipients);
      if (recipients.length === 0) {
        logger.warn(`No valid recipient emails found for ${Company_Name}. Skipping record.`);
        continue;
      }

      const emailSubject = getRandomSubject(Job_Type);
      

      if (!emailSubject) {
        logger.warn(`Missing email template for Job Type: ${Job_Type}. Skipping ${Company_Name}.`);
        continue;
      }

      const resumePath = path.join(RESUME_PATH, `${Job_Type}.pdf`);
      if (!fs.existsSync(resumePath)) {
        logger.warn(`Resume file not found: ${resumePath}. Skipping ${Company_Name}.`);
        continue;
      }

      let allEmailsSent = true;

      for (let {email,name} of recipients) {
        logger.info(`Sending email to ${email} (Job Type: ${Job_Type}, Receiver : ${name})`);
        const emailMessage = fillTemplate(Job_Type,name,Company_Name);
        const emailService = new EmailService({
          recipientEmail : email,
          emailSubject,
          emailMessage,
          attachments: [resumePath],
        });

        try {
          await emailService.sendEmail();
          logger.info(`Email sent successfully to ${email}`);
        } catch (error) {
          logger.error(`Failed to send email to ${email}: ${error.message}`);
          allEmailsSent = false;
        }
      }

      if (allEmailsSent) {
        record.Send = "1"; // Mark as sent only if all emails were successful
      }
    }

    await updateCSV(CSV_FILE, records);
    logger.info(`CSV updated successfully after email sending process.`);
  } catch (error) {
    logger.error(`Error in sendEmails function: ${error.message}`);
  }
};

sendEmails();
