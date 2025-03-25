import logger from "./utils/logger.js";

/**
 * Email subjects for different job types
 * @param {string} jobType - Type of job (e.g., 'Backend', 'FullStack')
 * @returns {string[]} Array of possible subject lines for the given job type
 */

const portfoliolink = process.env.Portfolio_URL;
const linkedinlink = process.env.LinkedIn_URL;
export const getSubjects = (jobType) => {
  logger.info(`Fetching subjects for job type: ${jobType}`);
  const subjects = {
    Backend: [
      "Backend Developer with Proven Track Record Seeking New Challenge",
      "Skilled Backend Engineer Ready to Drive Technical Excellence",
      "Results-Oriented Backend Developer Available for Immediate Consideration",
      "Backend Specialist with Performance Optimization Expertise",
      "Seasoned Backend Developer Bringing Scalable Solutions",
      "Strategic Backend Engineer with Full Development Lifecycle Experience",
      "Backend Developer: Combining Technical Expertise with Business Value",
      "Forward-Thinking Backend Professional Available for New Opportunity",
      "Backend Developer with Cross-Platform Integration Experience",
      "Technical Backend Specialist: Building Robust Systems That Scale",
    ],
    FullStack: [
      "Full Stack Developer Bridging Frontend Excellence with Backend Mastery",
      "End-to-End Development Expert Available for Innovative Projects",
      "Full Stack Developer: Seamless Solutions from UI to Database",
      "Versatile Full Stack Engineer Ready to Elevate Your Development Team",
      "Full Stack Professional with Proven Delivery Across the Technology Spectrum",
      "Comprehensive Full Stack Developer Bringing Solutions-Focused Approach",
      "Full Stack Engineer: Where Technical Depth Meets User Experience",
      "Strategic Full Stack Developer with Cross-Platform Implementation Success",
      "Full Stack Specialist Combining Technical Expertise with Business Acumen",
      "Accomplished Full Stack Developer Ready to Drive Your Technical Vision",
    ],
  };
  if (!subjects[jobType]) {
    logger.warn(`No subjects found for job type: ${jobType}`);
  }
  // Return subjects for the requested job type, or empty array if job type not found
  return subjects[jobType] || [];
};

/**
 * Get a random subject from the list of subjects for a job type
 * @param {string} jobType - Type of job (e.g., 'Backend', 'FullStack')
 * @returns {string|null} Random subject line or null if no subjects found
 */
export const getRandomSubject = (jobType) => {
  const subjectList = getSubjects(jobType);
  if (subjectList.length === 0) {
    logger.warn(`No subjects available for job type: ${jobType}`);
    return null;
  }
  return subjectList[Math.floor(Math.random() * subjectList.length)];
};

/**
 * Get the email template for a specific job type
 * @param {string} jobType - Type of job (e.g., 'Backend', 'FullStack')
 * @returns {string|null} Template string or null if job type not found
 */
export const getTemplate = (jobType, recipientName, companyName) => {
  const templates = {
    Backend: `Dear ${recipientName},

I hope you're doing well. While exploring ${companyName}'s digital presence,I am excited to know more about your technical infrastructure and product offering. Given my background in backend development, I'd love the opportunity to contribute.

With hands-on experience in Node.js, Express.js, MongoDB, PostgreSQL, and Redis, I have built and optimized scalable microservices, integrated real-time data sync with Redis Pub/Sub, and enhanced API security and performance. At Faze Technologies (FanCraze) and Deepsynergy Tech (Kare AI), I worked on high-performance backend systems, improving responsiveness and database efficiency.

Beyond work, I've developed JOBHACK (a job portal with role-based authentication) and SLACK WEB APP (a real-time collaboration tool). My expertise extends to cloud platforms (AWS, Azure), API optimization, and database design.

I've attached my resume for your review and would love to discuss how I can add value to your team. Looking forward to hearing your thoughts.

LinkedIn: ${linkedinlink}
Portfolio: ${portfoliolink}

Best regards,
Bhavya Mittal`,

    FullStack: `Dear ${recipientName},

I hope you're doing well. I came across ${companyName} and I am excited to know more about your technical infrastructure and product offering. As a full stack developer skilled in building high-performance web applications, I would love the opportunity to contribute to your team.

With expertise in ReactJS, Redux Toolkit, Node.js, Express.js, FastAPI, PostgreSQL, MySQL, and MongoDB, I have developed and optimized scalable applications, implemented real-time features, and integrated secure authentication (JWT, OAuth). During my roles at Faze Technologies (FanCraze) and Deepsynergy Tech (Kare AI), I worked on microservices, data synchronization, and frontend optimizations.

Some of my notable projects include:

JOBHACK – A job portal with ReactJS, Redux Toolkit & Node.js, featuring role-based authentication and optimized database queries.

SLACK WEB APP – A real-time collaborative platform with messaging, calling, and file sharing, reducing latency by 37%.

MED-BUDDY – An AI-driven chatbot for medical scheduling using FastAPI & GenAI, improving patient-provider interactions.

I've attached my resume for your review and would love to discuss how my skills align with your team's goals. Looking forward to hearing from you!

LinkedIn: ${linkedinlink}
Portfolio: ${portfoliolink}

Best regards,
Bhavya Mittal`,
  };

  if (!templates[jobType]) {
    logger.error(`No template found for job type: ${jobType}`);
    return null;
  }

  return templates[jobType] || null;
};

/**
 * Fill template with recipient information
 * @param {string} jobType - Type of job (e.g., 'Backend', 'FullStack')
 * @param {string} recipientName - Name of the recipient
 * @param {string} companyName - Name of the company
 * @returns {string|null} Filled template or null if template not found
 */
export const fillTemplate = (jobType, recipientName, companyName) => {
  logger.info(`Filling template for ${recipientName} at ${companyName} [Job Type: ${jobType}]`);
  const template = getTemplate(jobType, recipientName, companyName);
  if (!template) {
    logger.error(`Failed to fill template: No template found for job type: ${jobType}`);
    return null;
  }
  return template;
};