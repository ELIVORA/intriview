/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ChatParticipant,
  NotificationItem,
  ChatConversation,
  ChatMessage,
  AnnouncementItem,
  EmailTemplate,
  NotificationPreferences,
  DeliveryLog
} from "./types";

// Setup some mock system participants
export const MOCK_PARTICIPANTS: ChatParticipant[] = [
  {
    id: "part_student_1",
    name: "Aarav Sharma",
    email: "aarav.sharma@student.edu",
    role: "Student",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
    isOnline: true,
    lastActive: "Just now"
  },
  {
    id: "part_student_2",
    name: "Meera Patel",
    email: "meera.patel@student.edu",
    role: "Student",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    isOnline: false,
    lastActive: "10 mins ago"
  },
  {
    id: "part_faculty_1",
    name: "Dr. Sarah Jenkins",
    email: "sarah.jenkins@prep.ai",
    role: "Admin",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    isOnline: true,
    lastActive: "Just now"
  },
  {
    id: "part_trainer_1",
    name: "Marcus Aurelius",
    email: "m.aurelius@trainer.edu",
    role: "Admin",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    isOnline: true,
    lastActive: "Just now"
  },
  {
    id: "part_officer_1",
    name: "Rajesh Ramaswamy",
    email: "r.ramaswamy@prep.ai",
    role: "Super Admin",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
    isOnline: true,
    lastActive: "Just now"
  },
  {
    id: "part_recruiter_1",
    name: "Jessica Stone",
    email: "jessica.stone@google.com",
    role: "Admin",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
    isOnline: true,
    lastActive: "Just now"
  },
  {
    id: "part_company_admin_1",
    name: "Jonathan Stark",
    email: "j.stark@stripe.com",
    role: "Admin",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    isOnline: false,
    lastActive: "2 hours ago"
  },
  {
    id: "part_hiring_mgr_1",
    name: "Elena Rostova",
    email: "e.rostova@microsoft.com",
    role: "Admin",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    isOnline: true,
    lastActive: "Just now"
  },
  {
    id: "part_super_admin",
    name: "Devon Carter",
    email: "admin@interviewcracker.io",
    role: "Super Admin",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    isOnline: true,
    lastActive: "Just now"
  }
];

// Rich set of initial notifications
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_1",
    userId: "part_student_1",
    type: "Interview Scheduled",
    title: "Google L4 Technical Round",
    body: "Hi Aarav, your Technical Deep Dive round with Senior Staff Engineer Dr. Andrew has been scheduled for tomorrow at 2:30 PM IST. Please prepare clean system architectures.",
    priority: "High",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30m ago
    isRead: false,
    metadata: { meetingLink: "https://meet.google.com/swe-deep-dive", interviewer: "Andrew" }
  },
  {
    id: "notif_2",
    userId: "part_student_1",
    type: "ATS Score Updated",
    title: "ATS Resume Scan Complete",
    body: "Your master resume scored an impressive 88/100 matching Google's Cloud Platform position. Excellent vocabulary and action verb placement detected.",
    priority: "Medium",
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2h ago
    isRead: false,
    metadata: { score: 88, jobRole: "Cloud Platform Engineer" }
  },
  {
    id: "notif_3",
    userId: "part_student_1",
    type: "Coding Assignment",
    title: "AWS Serverless Sandbox Challenge",
    body: "A new concurrency test has been issued to Batch CSE-A. Build a serverless backend that scales under heavy message queues. Deadline in 48 hours.",
    priority: "High",
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    isRead: false,
    metadata: { challengeId: "aws-serverless", maxPoints: 100 }
  },
  {
    id: "notif_4",
    userId: "part_student_1",
    type: "Shortlisted",
    title: "Congratulations! Shortlisted by Stripe",
    body: "Stripe On-Campus Recruitment has approved your preliminary screening profile. You are selected for the fast-track coding test next Tuesday.",
    priority: "Critical",
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    isRead: true,
    metadata: { companyName: "Stripe", salaryPackage: "32 LPA" }
  },
  {
    id: "notif_5",
    userId: "part_student_1",
    type: "Certificate Generated",
    title: "Certificate Issued: Advanced Python Systems",
    body: "You have unlocked your completion badge with a perfect score on high-concurrency Node.js testing. View or export your secure credential.",
    priority: "Low",
    timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    isRead: true,
    metadata: { credentialId: "PY-SYS-9883" }
  },
  {
    id: "notif_6",
    userId: "part_student_1",
    type: "Security Alert",
    title: "New Session Detected",
    body: "A successful credential entry was logged from an Linux system located in Bangalore, India using Chrome browser on July 16, 2026.",
    priority: "Medium",
    timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    isRead: true,
    metadata: { location: "Bangalore", ip: "192.168.1.104" }
  }
];

// Conversations with interactive history
export const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: "conv_1",
    name: "Jessica Stone (Google Recruiter)",
    isGroup: false,
    participants: [
      MOCK_PARTICIPANTS.find(p => p.id === "part_student_1")!,
      MOCK_PARTICIPANTS.find(p => p.id === "part_recruiter_1")!
    ],
    unreadCount: 1,
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: "conv_2",
    name: "Platform Support (Coach Rajesh)",
    isGroup: false,
    participants: [
      MOCK_PARTICIPANTS.find(p => p.id === "part_student_1")!,
      MOCK_PARTICIPANTS.find(p => p.id === "part_officer_1")!
    ],
    unreadCount: 0,
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: "conv_3",
    name: "Dr. Sarah Jenkins (Interview Coach)",
    isGroup: false,
    participants: [
      MOCK_PARTICIPANTS.find(p => p.id === "part_student_1")!,
      MOCK_PARTICIPANTS.find(p => p.id === "part_faculty_1")!
    ],
    unreadCount: 0,
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: "conv_group_1",
    name: "Google On-Campus Prep Cohort",
    isGroup: true,
    participants: [
      MOCK_PARTICIPANTS.find(p => p.id === "part_student_1")!,
      MOCK_PARTICIPANTS.find(p => p.id === "part_student_2")!,
      MOCK_PARTICIPANTS.find(p => p.id === "part_trainer_1")!,
      MOCK_PARTICIPANTS.find(p => p.id === "part_faculty_1")!
    ],
    unreadCount: 3,
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
  }
];

// Setup default conversations text data
export const INITIAL_MESSAGES: ChatMessage[] = [
  // Conversation 1: Google Recruiter
  {
    id: "msg_1_1",
    conversationId: "conv_1",
    senderId: "part_recruiter_1",
    body: "Hi Aarav, I reviewed your dynamic interview evaluation report and portfolio project. The voice stability scores are exceptional.",
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    isSeen: true
  },
  {
    id: "msg_1_2",
    conversationId: "conv_1",
    senderId: "part_student_1",
    body: "Thank you, Jessica! I worked extensively with our AI Placement Mentor to refine my core technical and behavioral deliveries.",
    timestamp: new Date(Date.now() - 23 * 3600 * 1000).toISOString(),
    isSeen: true
  },
  {
    id: "msg_1_3",
    conversationId: "conv_1",
    senderId: "part_recruiter_1",
    body: "That's great. I have attached the official interview guidelines PDF. Please review it before our system design discussion tomorrow.",
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    isSeen: true,
    attachments: [
      {
        id: "att_guideline_1",
        name: "Google_System_Design_Syllabus.pdf",
        type: "pdf",
        url: "#",
        size: "1.4 MB"
      }
    ]
  },
  {
    id: "msg_1_4",
    conversationId: "conv_1",
    senderId: "part_recruiter_1",
    body: "Can you also double-check if your linked portfolio has the final-year AWS prototype live? We'd love to review it.",
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    isSeen: false
  },

  // Conversation 2: Officer Rajesh
  {
    id: "msg_2_1",
    conversationId: "conv_2",
    senderId: "part_officer_1",
    body: "Aarav, please ensure you satisfy the Stripe CGPA cut-off (>7.5) before starting your mock assessment today.",
    timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    isSeen: true
  },
  {
    id: "msg_2_2",
    conversationId: "conv_2",
    senderId: "part_student_1",
    body: "Yes, Coach. I have 8.9 CGPA and 0 active backlogs. My profile is fully synchronized with our practice records.",
    timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    isSeen: true
  },
  {
    id: "msg_2_3",
    conversationId: "conv_2",
    senderId: "part_officer_1",
    body: "Perfect. Highly promising, Aarav. Stay ready for fast-track invites.",
    timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    isSeen: true
  },

  // Conversation 3: Dr. Jenkins
  {
    id: "msg_3_1",
    conversationId: "conv_3",
    senderId: "part_faculty_1",
    body: "Aarav, how is your preparation with the AI English Communication Coach? Let's aim to eliminate those minor verbal filler pauses.",
    timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    isSeen: true
  },
  {
    id: "msg_3_2",
    conversationId: "conv_3",
    senderId: "part_student_1",
    body: "Dr. Jenkins, I did the mock intro three times. The fillers count dropped from 12 per minute down to 2!",
    timestamp: new Date(Date.now() - 11 * 3600 * 1000).toISOString(),
    isSeen: true
  },

  // Group prep conversation
  {
    id: "msg_g_1",
    conversationId: "conv_group_1",
    senderId: "part_trainer_1",
    body: "Welcome to the Google On-Campus Prep Group. I've pinned the core DSA cheatsheet. Let's start practice exercises.",
    timestamp: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    isSeen: true,
    isPinned: true
  },
  {
    id: "msg_g_2",
    conversationId: "conv_group_1",
    senderId: "part_student_2",
    body: "Thanks Marcus! Are we covering dynamic programming patterns today?",
    timestamp: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
    isSeen: true
  },
  {
    id: "msg_g_3",
    conversationId: "conv_group_1",
    senderId: "part_faculty_1",
    body: "Yes, Meera. I recommend completing the simulated AWS challenges too.",
    timestamp: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
    isSeen: true
  },
  {
    id: "msg_g_4",
    conversationId: "conv_group_1",
    senderId: "part_student_1",
    body: "Our AI platform really helped me outline system design bottlenecks.",
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    isSeen: false
  },
  {
    id: "msg_g_5",
    conversationId: "conv_group_1",
    senderId: "part_student_2",
    body: "Absolutely! I love how the visual pitch tracking matches performance under mock pressure.",
    timestamp: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
    isSeen: false
  },
  {
    id: "msg_g_6",
    conversationId: "conv_group_1",
    senderId: "part_trainer_1",
    body: "Excellent discussion. Let's jump on a dynamic practice challenge tonight at 8 PM.",
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    isSeen: false
  }
];

// Announcements database
export const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: "ann_1",
    title: "Stripe Fast-Track Interview Preparation Campaign",
    content: "Stripe technical team is opening registrations for Frontend Specialists & Cloud Engineers. Salary package: 32 LPA - 36 LPA. Registered pre-final and final year candidates must fill out ATS portfolios by August 15.",
    type: "Interview Schedule",
    publishedBy: "Rajesh Ramaswamy",
    publishedByRole: "Super Admin",
    publishedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    priority: "High",
    targets: ["Student", "Super Admin"],
    likes: 42,
    viewCount: 156
  },
  {
    id: "ann_2",
    title: "Urgent: Infrastructure Maintenance Window",
    content: "The Enterprise Placement Engine will experience scheduled maintenance from 2:00 AM to 4:00 AM IST on July 19. During this time, the Mock Interview and AI speech services will be briefly offline.",
    type: "Maintenance Notice",
    publishedBy: "Devon Carter",
    publishedByRole: "Super Admin",
    publishedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    priority: "Medium",
    targets: ["Student", "Admin", "Super Admin"],
    likes: 3,
    viewCount: 320
  },
  {
    id: "ann_3",
    title: "Amazon Leadership Principles Expert Webinar",
    content: "Our Head Trainer Marcus Aurelius is conducting an exclusive interactive session on framing STAR responses to match Amazon core principles. Join on Friday at 4 PM IST via Voice Portal.",
    type: "Training Session",
    publishedBy: "Marcus Aurelius",
    publishedByRole: "Admin",
    publishedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    priority: "Medium",
    targets: ["Student"],
    likes: 29,
    viewCount: 198
  },
  {
    id: "ann_4",
    title: "Emergency Alert: High-Frequency Security Patches",
    content: "All system admins and coordinate offices must configure immediate OAuth updates. Keep passwords rotated to prevent account spam.",
    type: "Emergency Alert",
    publishedBy: "Devon Carter",
    publishedByRole: "Super Admin",
    publishedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    priority: "Critical",
    targets: ["Admin", "Super Admin"],
    likes: 5,
    viewCount: 22
  }
];

// Professional HTML Templates database
export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "temp_1",
    name: "Interview Invitation Template",
    subject: "Interview Scheduled: {{company}} Technical Round",
    category: "interview",
    bodyHtml: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; border: 1px solid #e4e4e7; border-radius: 24px; background-color: #ffffff; color: #18181b; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
  <div style="border-bottom: 2px solid #6366f1; padding-bottom: 16px; margin-bottom: 24px;">
    <h2 style="margin: 0; color: #4f46e5; font-size: 20px; font-weight: 800;">INTERVIEW CRACKER</h2>
    <span style="font-size: 10px; color: #a1a1aa; font-family: monospace; letter-spacing: 1.5px;">SECURE WORKSPACE TRANSMISSION</span>
  </div>
  <p style="font-size: 14px; line-height: 1.6; color: #3f3f46;">Hi <strong>Aarav</strong>,</p>
  <p style="font-size: 14px; line-height: 1.6; color: #3f3f46;">Your technical round for the <strong>{{role}}</strong> role with <strong>{{company}}</strong> has been successfully booked inside our real-time portal pipeline.</p>
  
  <div style="background-color: #f4f4f5; padding: 20px; border-radius: 16px; margin: 24px 0;">
    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
      <tr>
        <td style="padding: 6px 0; color: #71717a; font-weight: bold; width: 35%;">Round Type:</td>
        <td style="padding: 6px 0; color: #18181b; font-weight: bold;">{{roundName}}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #71717a; font-weight: bold;">Scheduled Time:</td>
        <td style="padding: 6px 0; color: #18181b; font-weight: bold;">{{scheduledTime}} (IST)</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #71717a; font-weight: bold;">Interviewer:</td>
        <td style="padding: 6px 0; color: #18181b; font-weight: bold;">{{interviewer}}</td>
      </tr>
    </table>
  </div>

  <p style="font-size: 14px; line-height: 1.6; color: #3f3f46;">Click the button below to join the secure video conference lobby directly. Our voice and facial intelligence diagnostics will run in parallel.</p>
  
  <div style="text-align: center; margin: 32px 0;">
    <a href="{{meetingLink}}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 14px; font-weight: bold; font-size: 13px; display: inline-block; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.25);">Enter Virtual Sandbox Lobby</a>
  </div>

  <div style="border-top: 1px solid #f4f4f5; padding-top: 20px; font-size: 11px; color: #a1a1aa; line-height: 1.5;">
    <p style="margin: 0;">This transmission is encrypted by Interview Cracker. Do not forward this link.</p>
    <p style="margin: 4px 0 0 0;">Need support? Contact Rajesh Ramaswamy (System Administrator).</p>
  </div>
</div>`
  },
  {
    id: "temp_2",
    name: "Interview Reminder Template",
    subject: "Reminder: {{company}} Technical Round Starts in 15 Minutes",
    category: "interview",
    bodyHtml: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; border: 1px solid #fca5a5; border-radius: 24px; background-color: #fffaf0; color: #18181b;">
  <div style="border-bottom: 2px solid #ef4444; padding-bottom: 16px; margin-bottom: 24px;">
    <h2 style="margin: 0; color: #ef4444; font-size: 20px; font-weight: 800;">INTERVIEW CRACKER</h2>
    <span style="font-size: 10px; color: #f87171; font-family: monospace; letter-spacing: 1.5px;">CRITICAL SYSTEM DISPATCH</span>
  </div>
  <p style="font-size: 14px; line-height: 1.6; color: #3f3f46;">Hi <strong>Aarav</strong>,</p>
  <p style="font-size: 14px; line-height: 1.6; color: #3f3f46; font-weight: bold;">This is an automated priority alert. Your Technical Round starts in precisely 15 minutes.</p>
  
  <p style="font-size: 13px; line-height: 1.5; color: #71717a;">Please test your microphone, camera, and ensure you have a stable network speed exceeding 10 Mbps. AI engines are pre-initialized to analyze voice tone, volume stability, and speech rate.</p>

  <div style="text-align: center; margin: 32px 0;">
    <a href="{{meetingLink}}" style="background-color: #ef4444; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 14px; font-weight: bold; font-size: 13px; display: inline-block;">Securely Connect to Session</a>
  </div>
</div>`
  },
  {
    id: "temp_3",
    name: "Offer Letter Template",
    subject: "Official Stripe Offer Letter & Selection Confirmation!",
    category: "career",
    bodyHtml: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; border: 1px solid #10b981; border-radius: 24px; background-color: #ffffff; color: #18181b;">
  <div style="border-bottom: 2px solid #10b981; padding-bottom: 16px; margin-bottom: 24px; text-align: center;">
    <h2 style="margin: 0; color: #10b981; font-size: 22px; font-weight: 900;">STRIPE SELECTION INVITATION</h2>
    <span style="font-size: 10px; color: #34d399; font-family: monospace; letter-spacing: 1.5px;">AI PREPARATION TRACK</span>
  </div>
  <p style="font-size: 14px; line-height: 1.6; color: #3f3f46;">Dear <strong>Aarav Sharma</strong>,</p>
  <p style="font-size: 14px; line-height: 1.6; color: #3f3f46;">Following your stellar performance during the technical assessments, behavioral sandbox trials, and live recruiter interactions, we are thrilled to offer you the position of <strong>Frontend Specialist</strong> at Stripe India.</p>
  
  <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 24px; border-radius: 16px; margin: 24px 0;">
    <h4 style="margin: 0 0 12px 0; color: #065f46; font-size: 14px; font-weight: bold;">COMPENSATION & WORK PLAN:</h4>
    <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #047857; line-height: 1.8;">
      <li>Annual Remuneration: <strong>32 LPA Base</strong> + stock grants.</li>
      <li>Work Mode: Hybrid Core Hub, Bangalore.</li>
      <li>Joining Date: July 1, 2027.</li>
    </ul>
  </div>

  <div style="text-align: center; margin: 32px 0;">
    <a href="#" style="background-color: #10b981; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 14px; font-weight: bold; font-size: 13px; display: inline-block;">Review & Accept Official Agreement</a>
  </div>
</div>`
  },
  {
    id: "temp_4",
    name: "Interview Prep Congratulations Template",
    subject: "Big Congratulations from Coach Rajesh!",
    category: "career",
    bodyHtml: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; border: 1px solid #f472b6; border-radius: 24px; background-color: #fff5f7; color: #18181b;">
  <div style="text-align: center; margin-bottom: 24px;">
    <span style="font-size: 40px;">🎉</span>
    <h2 style="margin: 12px 0 0 0; color: #db2777; font-size: 22px; font-weight: 900;">COHORT ACHIEVEMENT UNLOCKED</h2>
    <p style="margin: 4px 0 0 0; font-size: 12px; color: #f472b6; font-family: monospace;">INTERVIEW SUCCESS HALL OF FAME</p>
  </div>
  <p style="font-size: 14px; line-height: 1.6; color: #3f3f46;">Aarav,</p>
  <p style="font-size: 14px; line-height: 1.6; color: #3f3f46;">On behalf of Dr. Sarah Jenkins and the entire interview prep board, I send you our warmest congratulations on securing your <strong>Stripe India offer letter!</strong> Your diligence and technical perseverance have elevated the department's standard.</p>
  
  <p style="font-size: 13px; line-height: 1.5; color: #71717a;">We are scheduling your virtual placement success interview inside our dashboard so you can share your key AI prep insights with junior cohorts.</p>
</div>`
  },
  {
    id: "temp_5",
    name: "Password Reset Template",
    subject: "Reset your Workspace Credentials",
    category: "auth",
    bodyHtml: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; border: 1px solid #e4e4e7; border-radius: 24px; background-color: #ffffff; color: #18181b;">
  <h2 style="margin: 0; color: #4f46e5; font-size: 20px; font-weight: 800; border-bottom: 1px solid #f4f4f5; padding-bottom: 16px; margin-bottom: 24px;">INTERVIEW CRACKER</h2>
  <p style="font-size: 14px; line-height: 1.6; color: #3f3f46;">We received a request to reset the password for your virtual mentor platform profile.</p>
  <p style="font-size: 14px; line-height: 1.6; color: #3f3f46;">Use the secure verification code listed below to log in or create your new security credential:</p>
  
  <div style="text-align: center; margin: 28px 0;">
    <span style="font-size: 24px; font-family: monospace; font-weight: 900; background-color: #f4f4f5; padding: 12px 28px; border-radius: 12px; border: 1px dashed #cbd5e1; letter-spacing: 4px; color: #4f46e5;">983-024</span>
  </div>
</div>`
  },
  {
    id: "temp_6",
    name: "Resume Analysis Complete Template",
    subject: "AI Resume Audit: Score Ready & Parsed",
    category: "resume",
    bodyHtml: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; border: 1px solid #e4e4e7; border-radius: 24px; background-color: #ffffff; color: #18181b;">
  <h2 style="margin: 0; color: #4f46e5; font-size: 20px; font-weight: 800; border-bottom: 2px solid #818cf8; padding-bottom: 16px; margin-bottom: 24px;">RESUME INTELLIGENCE ENGINE</h2>
  <p style="font-size: 14px; line-height: 1.6; color: #3f3f46;">Your master resume has been analyzed and audited across 12 product tier-1 recruitment filters.</p>
  
  <div style="background-color: #e0f2fe; padding: 20px; border-radius: 16px; border: 1px solid #bae6fd; margin: 24px 0; text-align: center;">
    <span style="font-size: 12px; color: #0369a1; font-weight: bold; block;">ATS COMPATIBILITY SCORE</span>
    <p style="font-size: 36px; font-weight: 900; color: #0284c7; margin: 8px 0 0 0;">88 / 100</p>
  </div>
</div>`
  },
  {
    id: "temp_7",
    name: "Certificate Award Template",
    subject: "Aptitude Certification Earned",
    category: "career",
    bodyHtml: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; border: 1px solid #e4e4e7; border-radius: 24px; background-color: #ffffff; color: #18181b;">
  <h2 style="margin: 0; color: #4f46e5; font-size: 20px; font-weight: 800; border-bottom: 1px solid #f4f4f5; padding-bottom: 16px; margin-bottom: 24px;">COHORT CREDENTIAL DISPATCH</h2>
  <p style="font-size: 14px; line-height: 1.6; color: #3f3f46;">We have generated your secure blockchain-verified certificate for <strong>Advanced System Design & Concurrency</strong>.</p>
</div>`
  },
  {
    id: "temp_8",
    name: "Weekly Progress Report Template",
    subject: "Your Weekly Practice Analytics Digest",
    category: "career",
    bodyHtml: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; border: 1px solid #e4e4e7; border-radius: 24px; background-color: #ffffff; color: #18181b;">
  <h2 style="margin: 0; color: #4f46e5; font-size: 20px; font-weight: 800; border-bottom: 1px solid #f4f4f5; padding-bottom: 16px; margin-bottom: 24px;">WEEKLY PERFORMANCE STATEMENT</h2>
  <p style="font-size: 14px; line-height: 1.6; color: #3f3f46;">Aarav, here is your dynamic preparation status statement over the past week:</p>
  <table style="width: 100%; font-size: 13px; margin: 20px 0; border-collapse: collapse;">
    <tr style="border-bottom: 1px solid #f4f4f5;">
      <td style="padding: 10px; font-weight: bold; color: #71717a;">Minutes Trained:</td>
      <td style="padding: 10px; font-weight: bold; text-align: right;">124 mins</td>
    </tr>
    <tr style="border-bottom: 1px solid #f4f4f5;">
      <td style="padding: 10px; font-weight: bold; color: #71717a;">System Design Mock Exams:</td>
      <td style="padding: 10px; font-weight: bold; text-align: right;">3 sessions</td>
    </tr>
    <tr style="border-bottom: 1px solid #f4f4f5;">
      <td style="padding: 10px; font-weight: bold; color: #71717a;">Average Voice Pitch Stability:</td>
      <td style="padding: 10px; font-weight: bold; text-align: right; color: #10b981;">92% Stable</td>
    </tr>
  </table>
</div>`
  },
  {
    id: "temp_9",
    name: "Welcome Email Template",
    subject: "Welcome to Interview Cracker Platform!",
    category: "auth",
    bodyHtml: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; border: 1px solid #e4e4e7; border-radius: 24px; background-color: #ffffff; color: #18181b;">
  <h2 style="margin: 0; color: #4f46e5; font-size: 20px; font-weight: 800; border-bottom: 1px solid #f4f4f5; padding-bottom: 16px; margin-bottom: 24px;">WELCOME TO INTERVIEW CRACKER</h2>
  <p style="font-size: 14px; line-height: 1.6; color: #3f3f46;">Hi <strong>Aarav</strong>,</p>
  <p style="font-size: 14px; line-height: 1.6; color: #3f3f46;">We're thrilled to set up your placement prep profile with our platform today. Your virtual placement mentor and AI mock panels are standing by.</p>
</div>`
  }
];

// Rich set of preloaded preferences for multiple roles
export const DEFAULT_PREFERENCES: NotificationPreferences[] = [
  {
    userId: "part_student_1",
    role: "Student",
    email: true,
    sms: true,
    push: true,
    inApp: true,
    weeklyDigest: true,
    marketing: false,
    placementAlerts: true
  },
  {
    userId: "part_faculty_1",
    role: "Admin",
    email: true,
    sms: false,
    push: true,
    inApp: true,
    weeklyDigest: false,
    marketing: false,
    placementAlerts: true
  },
  {
    userId: "part_recruiter_1",
    role: "Admin",
    email: true,
    sms: false,
    push: false,
    inApp: true,
    weeklyDigest: false,
    marketing: false,
    placementAlerts: false
  }
];

// Delivery Logs database for Notification Analytics dashboard
export const INITIAL_DELIVERY_LOGS: DeliveryLog[] = [
  {
    id: "log_dl_1",
    recipientEmail: "aarav.sharma@student.edu",
    recipientRole: "Student",
    channel: "email",
    status: "opened",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: "log_dl_2",
    recipientEmail: "aarav.sharma@student.edu",
    recipientRole: "Student",
    channel: "push",
    status: "read",
    timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString()
  },
  {
    id: "log_dl_3",
    recipientEmail: "aarav.sharma@student.edu",
    recipientRole: "Student",
    channel: "email",
    status: "delivered",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    id: "log_dl_4",
    recipientEmail: "meera.patel@student.edu",
    recipientRole: "Student",
    channel: "email",
    status: "opened",
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: "log_dl_5",
    recipientEmail: "sarah.jenkins@prep.ai",
    recipientRole: "Admin",
    channel: "push",
    status: "delivered",
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  },
  {
    id: "log_dl_6",
    recipientEmail: "external.spam@domain.com",
    recipientRole: "Student",
    channel: "email",
    status: "failed",
    timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    errorMessage: "SMTP rate limits or spam block triggered on remote host"
  },
  {
    id: "log_dl_7",
    recipientEmail: "invalid-user@undefined-domain.org",
    recipientRole: "Admin",
    channel: "sms",
    status: "failed",
    timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    errorMessage: "Failed to resolve destination number or mobile carrier"
  }
];
