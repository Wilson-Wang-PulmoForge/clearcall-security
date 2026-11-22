// Sample data shown on the dashboard and lookup pages (no live call feed is connected yet).

export type ScreenedCall = {
  id: string;
  time: string;
  caller: string;
  callerName: string;
  channel: "Inbound IVR" | "Agent desk" | "Callback";
  duration: string;
  score: number;
  threat: string;
  status: "Blocked" | "Escalated" | "In review" | "Cleared";
  transcript: string;
};

export const recentCalls: ScreenedCall[] = [
  {
    id: "C-48213",
    time: "16:12",
    caller: "+1 (312) 555-0187",
    callerName: "Claims 'IRS agent'",
    channel: "Inbound IVR",
    duration: "4:38",
    score: 94,
    threat: "Government impersonation",
    status: "Blocked",
    transcript:
      "Caller: This is Officer Daniel Reyes with the IRS criminal investigations unit. There is a warrant in your name for unpaid taxes.\nAgent: I'm calling on behalf of the account holder, can you give me a case number?\nCaller: I don't have time for that. If the balance of $4,800 is not paid today in gift cards, local police will be dispatched within the hour. Do not hang up and do not tell anyone at the bank about this call.",
  },
  {
    id: "C-48207",
    time: "16:04",
    caller: "+1 (646) 555-0142",
    callerName: "'Son' requesting wire",
    channel: "Agent desk",
    duration: "6:02",
    score: 88,
    threat: "Voice clone / family emergency",
    status: "Escalated",
    transcript:
      "Caller: Hi, it's Michael, I'm calling for my mom Linda Park, she's on the account. I was in a car accident and I need $9,000 wired for bail right now.\nAgent: I can't move funds without the account holder verifying. Can Linda come on the line?\nCaller: She's too upset to talk. Please, just use the security answers, her mother's maiden name is Cho. I'll lose my lawyer if this isn't done in 20 minutes.",
  },
  {
    id: "C-48199",
    time: "15:51",
    caller: "+1 (415) 555-0119",
    callerName: "Vendor bank change",
    channel: "Callback",
    duration: "3:17",
    score: 72,
    threat: "Business email compromise",
    status: "In review",
    transcript:
      "Caller: Hello, this is Priya from Northgate Supply accounts receivable. We've moved banks, so the invoice due Friday needs to go to our new account ending 7731.\nAgent: We'll need that change on letterhead through the vendor portal.\nCaller: The portal is down this week, that's why I'm calling. Our CFO asked that it be handled today, it's quite urgent.",
  },
  {
    id: "C-48188",
    time: "15:33",
    caller: "+44 20 7946 0958",
    callerName: "'Fraud dept' callback",
    channel: "Inbound IVR",
    duration: "2:44",
    score: 81,
    threat: "Bank impersonation",
    status: "Blocked",
    transcript:
      "Caller: Good afternoon, this is the fraud department of your bank. We've detected suspicious activity on your card. To secure it, please read me the six-digit code we just sent to your phone.\nCustomer: Why do you need the code if you're the bank?\nCaller: It's only to verify you. Please hurry, the transaction is processing.",
  },
  {
    id: "C-48172",
    time: "15:10",
    caller: "+1 (206) 555-0164",
    callerName: "Account holder",
    channel: "Agent desk",
    duration: "5:21",
    score: 18,
    threat: "None detected",
    status: "Cleared",
    transcript:
      "Customer: Hi, I'd like to dispute a charge on my credit card from last Tuesday, it's a duplicate charge from a hotel.\nAgent: I can help with that. Can you verify the last four digits of the card and your billing ZIP?\nCustomer: Sure, it's 4421 and 98103.\nAgent: Thank you. I see two identical charges of $212. I'll open a dispute and you'll get a letter within 10 days.",
  },
  {
    id: "C-48161",
    time: "14:56",
    caller: "+1 (702) 555-0133",
    callerName: "Tech support refund",
    channel: "Inbound IVR",
    duration: "7:45",
    score: 63,
    threat: "Refund / tech support scam",
    status: "In review",
    transcript:
      "Caller: I'm calling from your computer security provider. We accidentally refunded you $1,500 instead of $150, so you need to send back the difference.\nCustomer: I didn't see any refund.\nCaller: Let me connect to your computer to show you. Please install the app I'm sending and log into your online banking.",
  },
  {
    id: "C-48150",
    time: "14:31",
    caller: "+1 (512) 555-0198",
    callerName: "Account holder",
    channel: "Callback",
    duration: "2:09",
    score: 9,
    threat: "None detected",
    status: "Cleared",
    transcript:
      "Agent: Hi, this is a callback from the branch about your mortgage appointment.\nCustomer: Yes, thanks for calling back. Can we move it to Thursday at 10?\nAgent: Thursday at 10 works. You'll get a confirmation in the app.",
  },
];

export const hourlyTrend = [
  { hour: "00", screened: 120, flagged: 6 },
  { hour: "02", screened: 84, flagged: 5 },
  { hour: "04", screened: 61, flagged: 7 },
  { hour: "06", screened: 190, flagged: 9 },
  { hour: "08", screened: 640, flagged: 22 },
  { hour: "10", screened: 980, flagged: 31 },
  { hour: "12", screened: 1120, flagged: 38 },
  { hour: "14", screened: 1040, flagged: 44 },
  { hour: "16", screened: 910, flagged: 41 },
  { hour: "18", screened: 620, flagged: 27 },
  { hour: "20", screened: 410, flagged: 19 },
  { hour: "22", screened: 230, flagged: 12 },
];

export const threatMix = [
  { type: "Bank impersonation", share: 31 },
  { type: "Voice clone / family emergency", share: 22 },
  { type: "Government impersonation", share: 17 },
  { type: "Business email compromise", share: 14 },
  { type: "Refund / tech support", share: 11 },
  { type: "Other", share: 5 },
];

export const kpis = {
  screened: 6405,
  flagged: 261,
  blockedValue: 482300,
  avgTrust: 91.4,
};

export type NumberReport = {
  number: string;
  trust: number;
  category: string;
  lineType: "Mobile" | "Landline" | "VoIP";
  carrier: string;
  region: string;
  reports: number;
  firstSeen: string;
  lastSeen: string;
  notes: string[];
};

export const reputationList: NumberReport[] = [
  {
    number: "+13125550187",
    trust: 4,
    category: "Government impersonation",
    lineType: "VoIP",
    carrier: "Spoofed / unknown VoIP",
    region: "Chicago, IL (spoofed)",
    reports: 412,
    firstSeen: "2026-09-03",
    lastSeen: "2026-11-22",
    notes: [
      "Demands gift card payment for 'unpaid taxes'",
      "Caller ID rotates across Chicago area codes",
      "Linked to 3 blocked IVR sessions today",
    ],
  },
  {
    number: "+442079460958",
    trust: 11,
    category: "Bank impersonation",
    lineType: "VoIP",
    carrier: "Offshore SIP trunk",
    region: "London, UK",
    reports: 188,
    firstSeen: "2026-10-14",
    lastSeen: "2026-11-22",
    notes: ["Requests one-time passcodes", "Claims to be 'fraud department'"],
  },
  {
    number: "+16465550142",
    trust: 23,
    category: "Voice clone / family emergency",
    lineType: "Mobile",
    carrier: "Prepaid MVNO",
    region: "New York, NY",
    reports: 37,
    firstSeen: "2026-11-02",
    lastSeen: "2026-11-22",
    notes: ["Voice matches synthetic profile VX-219", "Targets elderly account holders"],
  },
  {
    number: "+17025550133",
    trust: 38,
    category: "Refund / tech support",
    lineType: "VoIP",
    carrier: "Hosted PBX reseller",
    region: "Las Vegas, NV",
    reports: 54,
    firstSeen: "2026-08-21",
    lastSeen: "2026-11-21",
    notes: ["Asks customers to install remote-access apps"],
  },
  {
    number: "+12065550164",
    trust: 96,
    category: "Verified customer",
    lineType: "Mobile",
    carrier: "Major US carrier",
    region: "Seattle, WA",
    reports: 0,
    firstSeen: "2019-04-11",
    lastSeen: "2026-11-22",
    notes: ["Matches account holder on file", "Passed voiceprint check 14 times"],
  },
];
