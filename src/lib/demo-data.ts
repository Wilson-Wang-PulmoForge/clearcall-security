// Sample calls and number reports shown in the app (no phone call feed is connected yet).

export type CallerKind = "fraud" | "spam" | "verified" | "contact" | "unknown";

export type PhoneCall = {
  id: string;
  number: string; // E.164
  name: string;
  kind: CallerKind;
  /** 0–100 fraud risk. */
  score: number;
  label: string;
  direction: "incoming" | "missed" | "blocked" | "outgoing";
  when: string;
  day: "Today" | "Yesterday" | "Earlier";
  duration: string | null;
  location: string;
  /** What the caller said (screened call or voicemail), when available. */
  transcript: string | null;
};

export const recentCalls: PhoneCall[] = [
  {
    id: "c1",
    number: "+13125550187",
    name: "Fraud risk",
    kind: "fraud",
    score: 94,
    label: "Government impersonation",
    direction: "blocked",
    when: "4:12 PM",
    day: "Today",
    duration: null,
    location: "Chicago, IL",
    transcript:
      "This is Officer Daniel Reyes with the IRS criminal investigations unit. There is a warrant in your name for unpaid taxes. If the balance of $4,800 is not paid today in gift cards, local police will be dispatched within the hour. Do not hang up and do not tell anyone about this call.",
  },
  {
    id: "c2",
    number: "+16465550142",
    name: "\"Michael\"",
    kind: "fraud",
    score: 88,
    label: "Possible voice clone",
    direction: "missed",
    when: "3:40 PM",
    day: "Today",
    duration: null,
    location: "New York, NY",
    transcript:
      "Mom, it's me, Michael. I was in a car accident and I'm at the police station. I need $9,000 for bail right now, please don't tell Dad. A lawyer is going to call you, just do what he says. Please hurry, I only have a few minutes.",
  },
  {
    id: "c3",
    number: "+18005550111",
    name: "First Harbor Bank",
    kind: "verified",
    score: 6,
    label: "Verified business",
    direction: "incoming",
    when: "1:05 PM",
    day: "Today",
    duration: "3:12",
    location: "Toll-free",
    transcript: null,
  },
  {
    id: "c4",
    number: "+17025550133",
    name: "Spam risk",
    kind: "spam",
    score: 63,
    label: "Tech support / refund",
    direction: "missed",
    when: "11:48 AM",
    day: "Today",
    duration: null,
    location: "Las Vegas, NV",
    transcript:
      "Hello, I'm calling from your computer security provider. We accidentally refunded you $1,500 instead of $150, so you need to send back the difference. Please call us back and install the app we send you so we can fix your account.",
  },
  {
    id: "c5",
    number: "+12065550164",
    name: "Alex Rivera",
    kind: "contact",
    score: 3,
    label: "Contact",
    direction: "outgoing",
    when: "9:20 AM",
    day: "Today",
    duration: "12:47",
    location: "Seattle, WA",
    transcript: null,
  },
  {
    id: "c6",
    number: "+442079460958",
    name: "Fraud risk",
    kind: "fraud",
    score: 81,
    label: "Bank impersonation",
    direction: "blocked",
    when: "6:31 PM",
    day: "Yesterday",
    duration: null,
    location: "London, UK",
    transcript:
      "Good afternoon, this is the fraud department of your bank. We've detected suspicious activity on your card. To secure it, please read me the six-digit code we just sent to your phone. Please hurry, the transaction is processing.",
  },
  {
    id: "c7",
    number: "+14155550119",
    name: "Spam risk",
    kind: "spam",
    score: 52,
    label: "Car warranty",
    direction: "missed",
    when: "2:15 PM",
    day: "Yesterday",
    duration: null,
    location: "San Francisco, CA",
    transcript:
      "We've been trying to reach you about your car's extended warranty. This is your final courtesy call before your coverage expires. Press 1 to speak with a warranty specialist now.",
  },
  {
    id: "c8",
    number: "+15125550198",
    name: "Unknown caller",
    kind: "unknown",
    score: 22,
    label: "No reports",
    direction: "incoming",
    when: "Mon",
    day: "Earlier",
    duration: "0:48",
    location: "Austin, TX",
    transcript: null,
  },
];

export const weeklyStats = {
  screened: 37,
  blocked: 12,
  fraudStopped: 4,
};

export type NumberReport = {
  number: string;
  trust: number;
  category: string;
  lineType: "Mobile" | "Landline" | "VoIP" | "Toll-free";
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
    firstSeen: "Sep 3, 2026",
    lastSeen: "Today",
    notes: [
      "Claims to be the IRS and threatens arrest",
      "Demands payment in gift cards",
      "Caller ID rotates across Chicago numbers",
    ],
  },
  {
    number: "+442079460958",
    trust: 11,
    category: "Bank impersonation",
    lineType: "VoIP",
    carrier: "Offshore internet line",
    region: "London, UK",
    reports: 188,
    firstSeen: "Oct 14, 2026",
    lastSeen: "Yesterday",
    notes: ["Asks for the one-time code sent to your phone", "Pretends to be your bank's fraud team"],
  },
  {
    number: "+16465550142",
    trust: 23,
    category: "Possible voice clone",
    lineType: "Mobile",
    carrier: "Prepaid carrier",
    region: "New York, NY",
    reports: 37,
    firstSeen: "Nov 2, 2026",
    lastSeen: "Today",
    notes: [
      "Voice matches a known AI-generated voice pattern",
      "Pretends to be a family member in trouble",
    ],
  },
  {
    number: "+17025550133",
    trust: 38,
    category: "Tech support / refund",
    lineType: "VoIP",
    carrier: "Internet phone reseller",
    region: "Las Vegas, NV",
    reports: 54,
    firstSeen: "Aug 21, 2026",
    lastSeen: "Today",
    notes: ["Asks people to install remote-access apps"],
  },
  {
    number: "+14155550119",
    trust: 48,
    category: "Car warranty",
    lineType: "VoIP",
    carrier: "Robocall platform",
    region: "San Francisco, CA",
    reports: 1290,
    firstSeen: "Jan 9, 2026",
    lastSeen: "Yesterday",
    notes: ["Pre-recorded robocall", "Not affiliated with any car maker"],
  },
  {
    number: "+18005550111",
    trust: 97,
    category: "Verified business · First Harbor Bank",
    lineType: "Toll-free",
    carrier: "Registered business line",
    region: "United States",
    reports: 0,
    firstSeen: "Mar 2, 2018",
    lastSeen: "Today",
    notes: ["Business identity verified", "Calls are signed by the carrier (no spoofing)"],
  },
];

export function findReport(number: string) {
  return reputationList.find((r) => r.number === number);
}
