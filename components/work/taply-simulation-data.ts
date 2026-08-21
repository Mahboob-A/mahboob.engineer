/**
 * components/work/taply-simulation-data.ts
 *
 * Master data dictionary and TypeScript interfaces for the Taply interactive
 * system explorer and product simulation sandbox on /work/taply.
 *
 * Strictly free of unicode emojis and em dashes across all data structures.
 */

export type LayoutVariant = "classic" | "hero" | "compact" | "banner";

export interface ProfileLink {
  id: number;
  label: string;
  url: string;
  link_type: string;
}

export interface ProfileThemeConfig {
  variant: LayoutVariant;
  primary_color: string;
  bg_color?: string;
  text_color?: string;
  font: string;
  border_radius: string;
}

export interface TaplyProfileState {
  username: string;
  display_name: string;
  title: string;
  company: string;
  bio: string;
  location: string;
  photo: string;
  cover_image: string;
  phone: string[];
  email_addresses: string[];
  website: string;
  links: ProfileLink[];
  skills: string[];
  theme_config: ProfileThemeConfig;
  is_published: boolean;
  published_at?: string;
}

export interface NetworkingAttendee {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  email: string;
  phone: string;
  avatar_color: string;
  avatar_initials: string;
  bio: string;
  has_tapped?: boolean;
}

export interface CapturedLead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: "nfc_tap" | "qr_scan" | "contact_form";
  location: string;
  timestamp: string;
  crm_synced: boolean;
}

export interface TimeSeriesDay {
  date: string;
  views: number;
  saves: number;
  taps: number;
  qr_scans: number;
}

export interface AnalyticsSummary {
  lifetime: {
    views: number;
    saves: number;
    taps: number;
    qr_scans: number;
  };
  last_30_days: {
    views: number;
    saves: number;
    taps: number;
    qr_scans: number;
  };
  sources: {
    nfc: number;
    qr: number;
    direct: number;
  };
  devices: {
    device_family: string;
    count: number;
  }[];
}

export const INITIAL_TAPLY_PROFILE: TaplyProfileState = {
  username: "mehboob",
  display_name: "Mehboob Alam",
  title: "Co-Founder & Lead Systems Architect",
  company: "Taply Technologies",
  bio: "Designing high-throughput physical-to-digital infrastructure, sub-80ms edge pipelines, and multi-tenant smart networking cards.",
  location: "San Francisco, CA",
  photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces",
  cover_image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop",
  phone: ["+1 (415) 555-2671"],
  email_addresses: ["mehboob@gettaply.me"],
  website: "https://gettaply.me",
  links: [
    { id: 1, label: "GitHub Architecture", url: "https://github.com", link_type: "github" },
    { id: 2, label: "LinkedIn Network", url: "https://linkedin.com", link_type: "linkedin" },
    { id: 3, label: "Schedule 15m Chat", url: "https://cal.com", link_type: "custom" },
    { id: 4, label: "Technical Publications", url: "https://medium.com", link_type: "custom" },
  ],
  skills: ["Distributed Systems", "NFC Hardware", "Next.js 15", "Django 5", "Redis Ingestion", "Cloudflare Edge"],
  theme_config: {
    variant: "classic",
    primary_color: "#5CC9A0",
    bg_color: "#161616",
    text_color: "#FFFFFF",
    font: "inter",
    border_radius: "lg",
  },
  is_published: true,
  published_at: "Updated just now",
};

export const HALL_ATTENDEES: NetworkingAttendee[] = [
  {
    id: "att_1",
    name: "Elena Rostova",
    role: "VP of Product Engineering",
    company: "Veloce Cloud",
    location: "London, UK",
    email: "elena.rostova@veloce.io",
    phone: "+44 20 7946 0912",
    avatar_color: "#5CC9A0",
    avatar_initials: "ER",
    bio: "Scaling real-time event platforms across EMEA.",
  },
  {
    id: "att_2",
    name: "Marcus Vance",
    role: "Managing Director",
    company: "Apex Capital Partners",
    location: "New York, NY",
    email: "mvance@apexcap.com",
    phone: "+1 (212) 555-0199",
    avatar_color: "#F59E0B",
    avatar_initials: "MV",
    bio: "Early-stage infrastructure and hardware-software integration investor.",
  },
  {
    id: "att_3",
    name: "Sophia Chen",
    role: "Chief Technology Officer",
    company: "Synapse AI",
    location: "San Francisco, CA",
    email: "sophia@synapseai.tech",
    phone: "+1 (415) 555-8831",
    avatar_color: "#60A5FA",
    avatar_initials: "SC",
    bio: "Building multimodal distributed models for enterprise analytics.",
  },
  {
    id: "att_4",
    name: "David Kim",
    role: "Head of Enterprise Sales",
    company: "Datastream Global",
    location: "Seattle, WA",
    email: "dkim@datastream.io",
    phone: "+1 (206) 555-4120",
    avatar_color: "#2DD4BF",
    avatar_initials: "DK",
    bio: "Leading North American expansion for real-time telemetry systems.",
  },
  {
    id: "att_5",
    name: "Aisha Patel",
    role: "Principal Solutions Architect",
    company: "Nexis Cloud Systems",
    location: "Austin, TX",
    email: "aisha.patel@nexis.cloud",
    phone: "+1 (512) 555-3901",
    avatar_color: "#38BDF8",
    avatar_initials: "AP",
    bio: "Specializing in zero-trust network boundaries and edge isolates.",
  },
  {
    id: "att_6",
    name: "Carlos Mendez",
    role: "Founder & CEO",
    company: "Aura Robotics",
    location: "Boston, MA",
    email: "carlos@aurarobotics.io",
    phone: "+1 (617) 555-7782",
    avatar_color: "#A5B4FC",
    avatar_initials: "CM",
    bio: "Autonomous robotics and hardware telemetry platforms.",
  },
  {
    id: "att_7",
    name: "Liam O'Connor",
    role: "Staff Infrastructure Engineer",
    company: "Stratos Networks",
    location: "Dublin, Ireland",
    email: "liam@stratosnet.eu",
    phone: "+353 1 496 0122",
    avatar_color: "#818CF8",
    avatar_initials: "LO",
    bio: "Edge routing, BGP optimizations, and ultra-low latency CDNs.",
  },
  {
    id: "att_8",
    name: "Yuki Tanaka",
    role: "Lead UI/UX Architect",
    company: "Kuro Design Labs",
    location: "Tokyo, Japan",
    email: "yuki@kurodesign.jp",
    phone: "+81 3 5555 0144",
    avatar_color: "#4ADE80",
    avatar_initials: "YT",
    bio: "Creating high-fidelity tactile digital interfaces.",
  },
];

export const INITIAL_LEADS: CapturedLead[] = [
  {
    id: "lead_init_1",
    name: "Alexander Wright",
    company: "Quantum Scale",
    email: "alex@quantumscale.io",
    phone: "+1 (415) 555-9011",
    source: "nfc_tap",
    location: "San Francisco, CA",
    timestamp: "10 mins ago",
    crm_synced: true,
  },
  {
    id: "lead_init_2",
    name: "Maya Lin",
    company: "Aether Dynamics",
    email: "mlin@aetherdynamics.com",
    phone: "+1 (206) 555-8812",
    source: "qr_scan",
    location: "Seattle, WA",
    timestamp: "2 hours ago",
    crm_synced: true,
  },
];

export const INITIAL_ANALYTICS: AnalyticsSummary = {
  lifetime: {
    views: 14820,
    saves: 3940,
    taps: 8420,
    qr_scans: 2460,
  },
  last_30_days: {
    views: 4210,
    saves: 1180,
    taps: 2450,
    qr_scans: 580,
  },
  sources: {
    nfc: 2450,
    qr: 580,
    direct: 1180,
  },
  devices: [
    { device_family: "iOS (Apple Safari)", count: 2680 },
    { device_family: "Android (Chrome)", count: 1240 },
    { device_family: "macOS (Desktop)", count: 210 },
    { device_family: "Windows (Desktop)", count: 80 },
  ],
};

export const INITIAL_TIME_SERIES: TimeSeriesDay[] = [
  { date: "2026-08-15", views: 120, saves: 32, taps: 78, qr_scans: 10 },
  { date: "2026-08-16", views: 145, saves: 40, taps: 92, qr_scans: 13 },
  { date: "2026-08-17", views: 132, saves: 35, taps: 84, qr_scans: 13 },
  { date: "2026-08-18", views: 180, saves: 52, taps: 115, qr_scans: 13 },
  { date: "2026-08-19", views: 210, saves: 64, taps: 138, qr_scans: 8 },
  { date: "2026-08-20", views: 260, saves: 82, taps: 165, qr_scans: 13 },
  { date: "2026-08-21", views: 310, saves: 95, taps: 195, qr_scans: 20 },
];
