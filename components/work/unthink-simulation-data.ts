/**
 * components/work/unthink-simulation-data.ts
 *
 * Data dictionary for the UnThink Master Interactive Simulation Engine.
 * Contains persona definitions, thematic color tokens, selectable sample
 * articles, recursive taxonomy folder structures, and mock fragment catalogs.
 *
 * Strictly free of emojis and em dashes across all fields.
 */

export type PersonaId =
  | "engineers"
  | "tech-professionals"
  | "lawyers"
  | "doctors"
  | "researchers"
  | "writers"
  | "knowledge-seekers";

export interface PersonaTheme {
  accentDark: string;
  accentLight: string;
  lightWash: string;
  cardTint: string;
  badgeBg: string;
  badgeText: string;
}

export interface ArticleParagraph {
  text: string;
  domain: string;
  folder: string;
}

export interface MockFragment {
  id: string;
  title: string;
  content: string;
  folder: string;
  sourceDomain: string;
  summary: string;
  tags: string[];
  date: string;
  status?: "processing" | "completed";
}

export interface FolderNode {
  id: string;
  name: string;
  path: string;
  level: number;
  hasChildren?: boolean;
}

export const PERSONA_THEMES: Record<PersonaId, PersonaTheme> = {
  engineers: {
    accentDark: "#5CC9A0",
    accentLight: "rgba(92, 201, 160, 0.08)",
    lightWash: "rgba(92, 201, 160, 0.15)",
    cardTint: "hover:border-[#5CC9A0]",
    badgeBg: "rgba(92, 201, 160, 0.12)",
    badgeText: "#5CC9A0",
  },
  "tech-professionals": {
    accentDark: "#60A5FA",
    accentLight: "rgba(96, 165, 250, 0.08)",
    lightWash: "rgba(96, 165, 250, 0.15)",
    cardTint: "hover:border-[#60A5FA]",
    badgeBg: "rgba(96, 165, 250, 0.12)",
    badgeText: "#60A5FA",
  },
  lawyers: {
    accentDark: "#818CF8",
    accentLight: "rgba(129, 140, 248, 0.08)",
    lightWash: "rgba(129, 140, 248, 0.15)",
    cardTint: "hover:border-[#818CF8]",
    badgeBg: "rgba(129, 140, 248, 0.12)",
    badgeText: "#818CF8",
  },
  doctors: {
    accentDark: "#2DD4BF",
    accentLight: "rgba(45, 212, 191, 0.08)",
    lightWash: "rgba(45, 212, 191, 0.15)",
    cardTint: "hover:border-[#2DD4BF]",
    badgeBg: "rgba(45, 212, 191, 0.12)",
    badgeText: "#2DD4BF",
  },
  researchers: {
    accentDark: "#4ADE80",
    accentLight: "rgba(74, 222, 128, 0.08)",
    lightWash: "rgba(74, 222, 128, 0.15)",
    cardTint: "hover:border-[#4ADE80]",
    badgeBg: "rgba(74, 222, 128, 0.12)",
    badgeText: "#4ADE80",
  },
  writers: {
    accentDark: "#F43F5E",
    accentLight: "rgba(244, 63, 94, 0.08)",
    lightWash: "rgba(244, 63, 94, 0.15)",
    cardTint: "hover:border-[#F43F5E]",
    badgeBg: "rgba(244, 63, 94, 0.12)",
    badgeText: "#F43F5E",
  },
  "knowledge-seekers": {
    accentDark: "#C084FC",
    accentLight: "rgba(192, 132, 252, 0.08)",
    lightWash: "rgba(192, 132, 252, 0.15)",
    cardTint: "hover:border-[#C084FC]",
    badgeBg: "rgba(192, 132, 252, 0.12)",
    badgeText: "#C084FC",
  },
};

export const PERSONA_ARTICLES: Record<PersonaId, ArticleParagraph[]> = {
  engineers: [
    {
      text: "Docker containers are virtualized runtime isolation boundaries encapsulating dependencies, configurations, and scripts.",
      domain: "docker.com",
      folder: "Infrastructure/Containers",
    },
    {
      text: "Deploying Kubernetes manifests requires custom kubectl configs and namespace definitions for cluster resources.",
      domain: "kubernetes.io",
      folder: "Infrastructure/Containers/Docker",
    },
    {
      text: "To scale pgvector searches offline, you should create HNSW indexes on your high-dimensional embeddings.",
      domain: "github.com",
      folder: "Infrastructure/Database/PostgreSQL",
    },
    {
      text: "PostgreSQL WAL replication logs should be configured to archive offsite on AWS S3 buckets every 5 minutes.",
      domain: "postgresql.org",
      folder: "Infrastructure/Database",
    },
  ],
  "tech-professionals": [
    {
      text: "PostgreSQL read-replicas scale database query rates by 80% when paired side-by-side with Redis cache clusters.",
      domain: "netflix.com",
      folder: "Architecture/Performance/Caching",
    },
    {
      text: "Redis cache eviction policies should be set to volatile-lru to preserve session tokens while expiring temp keys.",
      domain: "redis.io",
      folder: "Architecture/Performance",
    },
    {
      text: "Event sourcing architectures preserve absolute system audits but significantly expand secondary disk storage overhead.",
      domain: "martinfowler.com",
      folder: "Architecture/Patterns/Auditing",
    },
    {
      text: "Microservices communication should utilize async message queues like RabbitMQ for high-throughput transactional flows.",
      domain: "rabbitmq.com",
      folder: "Architecture/Patterns",
    },
  ],
  lawyers: [
    {
      text: "The Supreme Court ruled in Johnson v. Board of Education that arbitrary classification of public resources violates regulations.",
      domain: "supremecourt.gov",
      folder: "Briefs/Litigation/Civil-Rights",
    },
    {
      text: "Section 15 of general access codes allows immediate structural injunctions if systemic discrimination is evidenced.",
      domain: "supremecourt.gov",
      folder: "Briefs/Litigation",
    },
    {
      text: "Ninth Circuit appellate precedents hold that encryption of client metadata does not excuse failure to preserve direct citations.",
      domain: "uscourts.gov",
      folder: "Precedents/Property/Software",
    },
    {
      text: "Dockets relating to civil litigation cases must index historical briefs under primary and secondary appellate classes.",
      domain: "uscourts.gov",
      folder: "Precedents/Property",
    },
  ],
  doctors: [
    {
      text: "Clinical trial logs indicate a daily dosage of 25mg beta-blockers reduces post-infarction risk by 35% over 12 months.",
      domain: "pubmed.ncbi.nlm.nih.gov",
      folder: "Research/Cardiology/Clinical-Trials",
    },
    {
      text: "Infant penicillin dosage guidelines must scale strictly by body weight, not exceeding 12.5mg per kg under any condition.",
      domain: "pubmed.ncbi.nlm.nih.gov",
      folder: "Pharmacology/Safety/Contraindications",
    },
    {
      text: "Renal clearance rates should be evaluated prior to initiating aggressive ACE inhibitor treatment cycles.",
      domain: "pediatrics.org",
      folder: "Pharmacology/Safety",
    },
    {
      text: "HIPAA compliant storage requires automatic removal of patient names and dates of birth from all ingested text files.",
      domain: "hhs.gov",
      folder: "Research/Cardiology",
    },
  ],
  researchers: [
    {
      text: "Attention mechanisms in modern transformer architectures scale quadratically, prompting research into linear attention formulas.",
      domain: "arxiv.org",
      folder: "Papers/AI/Neural-Networks",
    },
    {
      text: "Deep network optimization benchmarks show SGD momentum decays converge more stably than ADAM under specific hyperparameters.",
      domain: "arxiv.org",
      folder: "Theory/Algorithms/Complexity",
    },
    {
      text: "Generative diffusion processes iteratively reduce noise levels to reconstruct images with high structural fidelity.",
      domain: "arxiv.org",
      folder: "Theory/Algorithms",
    },
    {
      text: "BibTeX citation keys must map dynamically to arXiv document identifiers to prevent broken cross-reference links.",
      domain: "github.com",
      folder: "Papers/AI",
    },
  ],
  writers: [
    {
      text: "A bruised copper plate sky cast a dull orange glow over the decaying dockyard monoliths.",
      domain: "manuscripts.unthink.ai",
      folder: "Storyboards/Sci-Fi/Characters",
    },
    {
      text: "Inspector Vance pulled up his collar against the constant rain, murmuring that water washes away the truth.",
      domain: "manuscripts.unthink.ai",
      folder: "Storyboards/Sci-Fi",
    },
    {
      text: "The historical clocktower built in 1884 stood tall as a crumbling monolith, keeping count of forgotten times.",
      domain: "theparisreview.org",
      folder: "Reference/Historical/Locations",
    },
    {
      text: "Dialogue outline drafts for the interrogation sequence require consistent tone matching Vance's cynical persona.",
      domain: "manuscripts.unthink.ai",
      folder: "Reference/Historical",
    },
  ],
  "knowledge-seekers": [
    {
      text: "The 2-minute rule states that if a new habit takes under two minutes, it should be done immediately to build pathways.",
      domain: "jamesclear.com",
      folder: "Personal/Hobbies",
    },
    {
      text: "Sourdough hydration ratios of 78% yield open, airy crumbs with thin crusts, but require gluten development folds.",
      domain: "theperfectloaf.com",
      folder: "Personal/Hobbies/Culinary",
    },
    {
      text: "Compounding dividends build long term financial freedom by reinvesting index fund gains early.",
      domain: "mrmoneymustache.com",
      folder: "Archives/Finance/Wealth-Management",
    },
    {
      text: "Daily habit triggers succeed when paired with distinct physical settings and minimal initial friction.",
      domain: "jamesclear.com",
      folder: "Archives/Finance",
    },
  ],
};

export const PERSONA_FOLDERS: Record<PersonaId, FolderNode[]> = {
  engineers: [
    { id: "Infrastructure", name: "Infrastructure", path: "Infrastructure", level: 0, hasChildren: true },
    { id: "Infrastructure/Containers", name: "Containers", path: "Infrastructure/Containers", level: 1, hasChildren: true },
    { id: "Infrastructure/Containers/Docker", name: "Docker", path: "Infrastructure/Containers/Docker", level: 2 },
    { id: "Infrastructure/Database", name: "Database", path: "Infrastructure/Database", level: 1, hasChildren: true },
    { id: "Infrastructure/Database/PostgreSQL", name: "PostgreSQL", path: "Infrastructure/Database/PostgreSQL", level: 2 },
    { id: "Scripts", name: "Scripts", path: "Scripts", level: 0, hasChildren: true },
    { id: "Scripts/Shell", name: "Shell", path: "Scripts/Shell", level: 1, hasChildren: true },
    { id: "Scripts/Shell/Linux", name: "Linux", path: "Scripts/Shell/Linux", level: 2 },
    { id: "Scripts/Python", name: "Python", path: "Scripts/Python", level: 1, hasChildren: true },
    { id: "Scripts/Python/Log-Management", name: "Log-Management", path: "Scripts/Python/Log-Management", level: 2 },
  ],
  "tech-professionals": [
    { id: "Architecture", name: "Architecture", path: "Architecture", level: 0, hasChildren: true },
    { id: "Architecture/Performance", name: "Performance", path: "Architecture/Performance", level: 1, hasChildren: true },
    { id: "Architecture/Performance/Caching", name: "Caching", path: "Architecture/Performance/Caching", level: 2 },
    { id: "Architecture/Patterns", name: "Patterns", path: "Architecture/Patterns", level: 1, hasChildren: true },
    { id: "Architecture/Patterns/Auditing", name: "Auditing", path: "Architecture/Patterns/Auditing", level: 2 },
    { id: "APIs", name: "APIs", path: "APIs", level: 0, hasChildren: true },
    { id: "APIs/GraphQL", name: "GraphQL", path: "APIs/GraphQL", level: 1, hasChildren: true },
    { id: "APIs/GraphQL/Optimization", name: "Optimization", path: "APIs/GraphQL/Optimization", level: 2 },
    { id: "APIs/REST", name: "REST", path: "APIs/REST", level: 1, hasChildren: true },
    { id: "APIs/REST/Version-Control", name: "Version-Control", path: "APIs/REST/Version-Control", level: 2 },
  ],
  lawyers: [
    { id: "Briefs", name: "Briefs", path: "Briefs", level: 0, hasChildren: true },
    { id: "Briefs/Litigation", name: "Litigation", path: "Briefs/Litigation", level: 1, hasChildren: true },
    { id: "Briefs/Litigation/Civil-Rights", name: "Civil-Rights", path: "Briefs/Litigation/Civil-Rights", level: 2 },
    { id: "Precedents", name: "Precedents", path: "Precedents", level: 0, hasChildren: true },
    { id: "Precedents/Property", name: "Property", path: "Precedents/Property", level: 1, hasChildren: true },
    { id: "Precedents/Property/Software", name: "Software", path: "Precedents/Property/Software", level: 2 },
  ],
  doctors: [
    { id: "Pharmacology", name: "Pharmacology", path: "Pharmacology", level: 0, hasChildren: true },
    { id: "Pharmacology/Safety", name: "Safety", path: "Pharmacology/Safety", level: 1, hasChildren: true },
    { id: "Pharmacology/Safety/Contraindications", name: "Contraindications", path: "Pharmacology/Safety/Contraindications", level: 2 },
    { id: "Research", name: "Research", path: "Research", level: 0, hasChildren: true },
    { id: "Research/Cardiology", name: "Cardiology", path: "Research/Cardiology", level: 1, hasChildren: true },
    { id: "Research/Cardiology/Clinical-Trials", name: "Clinical-Trials", path: "Research/Cardiology/Clinical-Trials", level: 2 },
  ],
  researchers: [
    { id: "Theory", name: "Theory", path: "Theory", level: 0, hasChildren: true },
    { id: "Theory/Algorithms", name: "Algorithms", path: "Theory/Algorithms", level: 1, hasChildren: true },
    { id: "Theory/Algorithms/Complexity", name: "Complexity", path: "Theory/Algorithms/Complexity", level: 2 },
    { id: "Papers", name: "Papers", path: "Papers", level: 0, hasChildren: true },
    { id: "Papers/AI", name: "AI", path: "Papers/AI", level: 1, hasChildren: true },
    { id: "Papers/AI/Neural-Networks", name: "Neural-Networks", path: "Papers/AI/Neural-Networks", level: 2 },
  ],
  writers: [
    { id: "Storyboards", name: "Storyboards", path: "Storyboards", level: 0, hasChildren: true },
    { id: "Storyboards/Sci-Fi", name: "Sci-Fi", path: "Storyboards/Sci-Fi", level: 1, hasChildren: true },
    { id: "Storyboards/Sci-Fi/Characters", name: "Characters", path: "Storyboards/Sci-Fi/Characters", level: 2 },
    { id: "Reference", name: "Reference", path: "Reference", level: 0, hasChildren: true },
    { id: "Reference/Historical", name: "Historical", path: "Reference/Historical", level: 1, hasChildren: true },
    { id: "Reference/Historical/Locations", name: "Locations", path: "Reference/Historical/Locations", level: 2 },
  ],
  "knowledge-seekers": [
    { id: "Personal", name: "Personal", path: "Personal", level: 0, hasChildren: true },
    { id: "Personal/Hobbies", name: "Hobbies", path: "Personal/Hobbies", level: 1, hasChildren: true },
    { id: "Personal/Hobbies/Culinary", name: "Culinary", path: "Personal/Hobbies/Culinary", level: 2 },
    { id: "Archives", name: "Archives", path: "Archives", level: 0, hasChildren: true },
    { id: "Archives/Finance", name: "Finance", path: "Archives/Finance", level: 1, hasChildren: true },
    { id: "Archives/Finance/Wealth-Management", name: "Wealth-Management", path: "Archives/Finance/Wealth-Management", level: 2 },
  ],
};

export const INITIAL_MOCK_DATA: Record<PersonaId, MockFragment[]> = {
  engineers: [
    {
      id: "eng-1",
      title: "HNSW Vector Indexes",
      content: "To scale pgvector searches offline, you should create HNSW indexes on your high-dimensional embeddings.",
      folder: "Infrastructure/Database/PostgreSQL",
      sourceDomain: "github.com",
      summary: "Offline vector indexing optimization guide suggesting HNSW structures for high-dimensional embeddings.",
      tags: ["pgvector", "PostgreSQL", "Database"],
      date: "2 hours ago",
    },
    {
      id: "eng-2",
      title: "Bash Dry Run Check",
      content: "Bash scripts running disk operations must execute a dry-run check before deleting unzipped logs from active files.",
      folder: "Scripts/Shell/Linux",
      sourceDomain: "stackoverflow.com",
      summary: "Defensive shell script pattern advising dry-run operations before executing recursive cleanups.",
      tags: ["bash", "Linux", "Scripting"],
      date: "1 day ago",
    },
    {
      id: "eng-3",
      title: "Docker Virtual Isolation Boundaries",
      content: "Docker containers are virtualized runtime isolation boundaries encapsulating dependencies, configurations, and scripts.",
      folder: "Infrastructure/Containers",
      sourceDomain: "docker.com",
      summary: "Definition of Docker containers as virtualized runtime isolation environments.",
      tags: ["Docker", "Containers", "DevOps"],
      date: "3 hours ago",
    },
    {
      id: "eng-4",
      title: "Kubernetes Manifest Namespaces",
      content: "Deploying Kubernetes manifests requires custom kubectl configs and namespace definitions for cluster resources.",
      folder: "Infrastructure/Containers/Docker",
      sourceDomain: "kubernetes.io",
      summary: "Guidelines for deploying Kubernetes manifests with customized namespace definitions.",
      tags: ["Kubernetes", "Docker", "DevOps"],
      date: "10 mins ago",
    },
    {
      id: "eng-5",
      title: "PostgreSQL WAL Replication S3 Archiving",
      content: "PostgreSQL WAL replication logs should be configured to archive offsite on AWS S3 buckets every 5 minutes.",
      folder: "Infrastructure/Database",
      sourceDomain: "postgresql.org",
      summary: "Best practice guide for archiving PostgreSQL WAL replication logs offsite on S3 storage.",
      tags: ["PostgreSQL", "WAL", "Replication"],
      date: "5 hours ago",
    },
    {
      id: "eng-6",
      title: "WebSocket Subscription Cleanup Leak",
      content: "A memory leak was resolved in the WebSocket event listeners by cleaning subscriptions in the useEffect cleanup phase.",
      folder: "Scripts/Shell/Linux",
      sourceDomain: "github.com",
      summary: "Resolution of WebSocket event subscription memory leak in React useEffect hooks.",
      tags: ["React", "WebSocket", "Bugfix"],
      date: "1 hour ago",
    },
    {
      id: "eng-7",
      title: "Log Parsing Python Regex Script",
      content: "Log management python scripts parse multi-line stack traces using regex patterns to feed centralized ELK agents.",
      folder: "Scripts/Python/Log-Management",
      sourceDomain: "medium.com",
      summary: "Scripting guide for parsing stack traces using regex to feed Elasticsearch agents.",
      tags: ["Python", "Logging", "Regex"],
      date: "1 day ago",
    },
    {
      id: "eng-8",
      title: "Iterative Python Execution Loops",
      content: "Python script execution performance increases by 20% when migrating from deep recursive operations to iterative loops.",
      folder: "Scripts/Python",
      sourceDomain: "medium.com",
      summary: "Python performance optimization advising iterative loops instead of recursion.",
      tags: ["Python", "Performance", "Optimization"],
      date: "2 days ago",
    },
  ],
  "tech-professionals": [
    {
      id: "tech-1",
      title: "Postgres Read Replicas Caching",
      content: "PostgreSQL read-replicas scale database query rates by 80% when paired side-by-side with Redis cache clusters.",
      folder: "Architecture/Performance/Caching",
      sourceDomain: "netflix.com",
      summary: "System architecture study showing 80% scaling benefits of combining Redis clusters with read-replicas.",
      tags: ["PostgreSQL", "Caching", "Performance"],
      date: "3 hours ago",
    },
    {
      id: "tech-2",
      title: "Event Sourcing Storage Overheads",
      content: "Event sourcing architectures preserve absolute system audits but significantly expand secondary disk storage overhead.",
      folder: "Architecture/Patterns/Auditing",
      sourceDomain: "martinfowler.com",
      summary: "Study of storage space expansions and auditing capabilities in event logs systems.",
      tags: ["Event-Sourcing", "Architecture", "Audit"],
      date: "1 day ago",
    },
    {
      id: "tech-3",
      title: "Redis volatile-lru Eviction Strategy",
      content: "Redis cache eviction policies should be set to volatile-lru to preserve session tokens while expiring temp keys.",
      folder: "Architecture/Performance",
      sourceDomain: "redis.io",
      summary: "Redis setup recommendation favoring volatile-lru policy to avoid session eviction.",
      tags: ["Redis", "Caching", "Memory"],
      date: "5 hours ago",
    },
    {
      id: "tech-4",
      title: "Async RabbitMQ Microservices Integration",
      content: "Microservices communication should utilize async message queues like RabbitMQ for high-throughput transactional flows.",
      folder: "Architecture/Patterns",
      sourceDomain: "rabbitmq.com",
      summary: "Asynchronous integration study favoring message broker scaling.",
      tags: ["RabbitMQ", "Microservices", "Queues"],
      date: "1 hour ago",
    },
    {
      id: "tech-5",
      title: "GraphQL Resolver N+1 DataLoader",
      content: "N+1 query bottlenecks in GraphQL resolvers should be mitigated using DataLoader batch aggregation windows.",
      folder: "APIs/GraphQL/Optimization",
      sourceDomain: "medium.com",
      summary: "DataLoader batching techniques to resolve query loop bottlenecks.",
      tags: ["GraphQL", "DataLoader", "Bottleneck"],
      date: "2 days ago",
    },
    {
      id: "tech-6",
      title: "GraphQL Schema Stitching Federation",
      content: "GraphQL schema stitching merges multiple nested backend services into a single unified gateway schema.",
      folder: "APIs/GraphQL",
      sourceDomain: "medium.com",
      summary: "Unified schema design pattern resolving federated service queries.",
      tags: ["GraphQL", "Schema-Stitching", "Federation"],
      date: "12 mins ago",
    },
    {
      id: "tech-7",
      title: "REST Versioning with Accept Headers",
      content: "REST API version control is best implemented using Accept headers to avoid breaking client-facing URLs.",
      folder: "APIs/REST/Version-Control",
      sourceDomain: "github.com",
      summary: "REST versioning patterns using accept headers to protect url endpoints.",
      tags: ["REST", "APIs", "Versioning"],
      date: "1 day ago",
    },
    {
      id: "tech-8",
      title: "API Gateways JWT CORS Security",
      content: "API gateways intercept incoming REST traffic to perform rate limiting, JWT validation, and CORS checks.",
      folder: "APIs/REST",
      sourceDomain: "github.com",
      summary: "API Gateway pattern for centralized security validation checks.",
      tags: ["API-Gateway", "JWT", "Security"],
      date: "4 hours ago",
    },
  ],
  lawyers: [
    {
      id: "law-1",
      title: "Section 15 Injunctions",
      content: "Section 15 of general access codes allows immediate structural injunctions if systemic discrimination is evidenced.",
      folder: "Briefs/Litigation",
      sourceDomain: "supremecourt.gov",
      summary: "Constitutional law analysis regarding Section 15 structural injunction thresholds.",
      tags: ["Injunctions", "Civil-Rights", "Appellate"],
      date: "5 hours ago",
    },
    {
      id: "law-2",
      title: "Client Encryption Precedents",
      content: "Ninth Circuit appellate precedents hold that encryption of client metadata does not excuse failure to preserve direct citations.",
      folder: "Precedents/Property/Software",
      sourceDomain: "uscourts.gov",
      summary: "Appellate citation guidelines confirming encryption does not impact evidentiary preservation responsibilities.",
      tags: ["Encryption", "Intellectual-Property", "Metadata"],
      date: "2 days ago",
    },
    {
      id: "law-3",
      title: "Johnson Appellate Civil Injunctions",
      content: "The Supreme Court ruled in Johnson v. Board of Education that arbitrary classification of public resources violates regulations.",
      folder: "Briefs/Litigation/Civil-Rights",
      sourceDomain: "supremecourt.gov",
      summary: "Supreme Court review on classification rights and access injunction regulations.",
      tags: ["Supreme-Court", "Appellate", "Litigation"],
      date: "10 mins ago",
    },
    {
      id: "law-4",
      title: "Civil Litigation Docket Indexing",
      content: "Dockets relating to civil litigation cases must index historical briefs under primary and secondary appellate classes.",
      folder: "Precedents/Property",
      sourceDomain: "uscourts.gov",
      summary: "Precedent study detailing docket indexing workflows for civil briefs.",
      tags: ["Litigation", "Civil-Law", "Precedent"],
      date: "4 hours ago",
    },
  ],
  doctors: [
    {
      id: "doc-1",
      title: "Renal Clearance Evaluates ACE",
      content: "Renal clearance rates should be evaluated prior to initiating aggressive ACE inhibitor treatment cycles.",
      folder: "Pharmacology/Safety",
      sourceDomain: "pediatrics.org",
      summary: "Safety brief advising clearance tests before starting aggressive inhibitor treatment regimens.",
      tags: ["Pharmacology", "ACE-Inhibitor", "Safety"],
      date: "1 hour ago",
    },
    {
      id: "doc-2",
      title: "Infant Penicillin Dosage Caps",
      content: "Infant penicillin dosage guidelines must scale strictly by body weight, not exceeding 12.5mg per kg under any condition.",
      folder: "Pharmacology/Safety/Contraindications",
      sourceDomain: "pubmed.ncbi.nlm.nih.gov",
      summary: "Safety guidelines constraining infant penicillin dosages based on weight metrics.",
      tags: ["Pharmacology", "Dosage", "Contraindications"],
      date: "2 hours ago",
    },
    {
      id: "doc-3",
      title: "HIPAA Patient Data Redactions",
      content: "HIPAA compliant storage requires automatic removal of patient names and dates of birth from all ingested text files.",
      folder: "Research/Cardiology",
      sourceDomain: "hhs.gov",
      summary: "Privacy compliance standard requiring automatic redaction of patient names in databases.",
      tags: ["HIPAA", "Privacy", "Storage"],
      date: "3 days ago",
    },
    {
      id: "doc-4",
      title: "Clinical Trial Cardiology Logs",
      content: "Clinical trial logs indicate a daily dosage of 25mg beta-blockers reduces post-infarction risk by 35% over 12 months.",
      folder: "Research/Cardiology/Clinical-Trials",
      sourceDomain: "pubmed.ncbi.nlm.nih.gov",
      summary: "Cardiology research log assessing post-infarction risk reductions via beta-blockers.",
      tags: ["Cardiology", "Beta-Blockers", "Clinical-Trials"],
      date: "15 mins ago",
    },
  ],
  researchers: [
    {
      id: "res-1",
      title: "Deep Diffusion Noise Reductions",
      content: "Generative diffusion processes iteratively reduce noise levels to reconstruct images with high structural fidelity.",
      folder: "Theory/Algorithms",
      sourceDomain: "arxiv.org",
      summary: "Deep learning logic describing noise reduction phases in image generation.",
      tags: ["AI", "Algorithms", "Diffusion"],
      date: "2 hours ago",
    },
    {
      id: "res-2",
      title: "SGD vs ADAM Optimizations",
      content: "Deep network optimization benchmarks show SGD momentum decays converge more stably than ADAM under specific hyperparameters.",
      folder: "Theory/Algorithms/Complexity",
      sourceDomain: "arxiv.org",
      summary: "Optimization analysis documenting stable convergence rates of SGD momentum over ADAM options.",
      tags: ["AI", "Algorithms", "Optimization"],
      date: "4 hours ago",
    },
    {
      id: "res-3",
      title: "BibTeX Dynamic Sync Keys",
      content: "BibTeX citation keys must map dynamically to arXiv document identifiers to prevent broken cross-reference links.",
      folder: "Papers/AI",
      sourceDomain: "github.com",
      summary: "Reference synchronization pattern detailing arXiv key mapping mechanisms.",
      tags: ["BibTeX", "Reference-Sync", "AI"],
      date: "2 days ago",
    },
    {
      id: "res-4",
      title: "Attention Quadratic Scaling Neural Nets",
      content: "Attention mechanisms in modern transformer architectures scale quadratically, prompting research into linear attention formulas.",
      folder: "Papers/AI/Neural-Networks",
      sourceDomain: "arxiv.org",
      summary: "Neural network transformer scaling analysis mapping quadratic complexity limitations.",
      tags: ["AI", "Neural-Networks", "Transformers"],
      date: "12 mins ago",
    },
  ],
  writers: [
    {
      id: "wri-1",
      title: "Rain Metaphor in Vance Outlines",
      content: "Inspector Vance pulled up his collar against the constant rain, murmuring that water washes away the truth.",
      folder: "Storyboards/Sci-Fi",
      sourceDomain: "manuscripts.unthink.ai",
      summary: "Atmospheric character dialogue snippet reflecting cynical outlook in rainy settings.",
      tags: ["Dialogue", "Sci-Fi", "Character"],
      date: "10 mins ago",
    },
    {
      id: "wri-2",
      title: "Sci-Fi Character Setting Outline",
      content: "A bruised copper plate sky cast a dull orange glow over the decaying dockyard monoliths.",
      folder: "Storyboards/Sci-Fi/Characters",
      sourceDomain: "manuscripts.unthink.ai",
      summary: "Atmospheric setting outline details describing bruised copper sky over dockyard monoliths.",
      tags: ["Settings", "Sci-Fi", "Locations"],
      date: "2 hours ago",
    },
    {
      id: "wri-3",
      title: "Dialogue Outline Interrogations",
      content: "Dialogue outline drafts for the interrogation sequence require consistent tone matching Vance's cynical persona.",
      folder: "Reference/Historical",
      sourceDomain: "manuscripts.unthink.ai",
      summary: "Dialogue draft directives outline rules mapping to Vance's cynical persona.",
      tags: ["Dialogue", "Historical", "Interrogation"],
      date: "1 day ago",
    },
    {
      id: "wri-4",
      title: "Historical Decaying Monolith",
      content: "The historical clocktower built in 1884 stood tall as a crumbling monolith, keeping count of forgotten times.",
      folder: "Reference/Historical/Locations",
      sourceDomain: "theparisreview.org",
      summary: "Setting descriptions mapping the decaying clocktower locations for outline climax sequences.",
      tags: ["Settings", "Historical", "Locations"],
      date: "4 hours ago",
    },
  ],
  "knowledge-seekers": [
    {
      id: "seek-1",
      title: "Habit Loops 2-Minute Rule",
      content: "The 2-minute rule states that if a new habit takes under two minutes, it should be done immediately to build pathways.",
      folder: "Personal/Hobbies",
      sourceDomain: "jamesclear.com",
      summary: "Behavioral science tips on habit formation outlining 2-minute trigger rules.",
      tags: ["Habits", "Personal-Growth", "Hobbies"],
      date: "1 hour ago",
    },
    {
      id: "seek-2",
      title: "Sourdough Hydration Glutes",
      content: "Sourdough hydration ratios of 78% yield open, airy crumbs with thin crusts, but require gluten development folds.",
      folder: "Personal/Hobbies/Culinary",
      sourceDomain: "theperfectloaf.com",
      summary: "Bread baking guidelines describing hydration effects on crumb density and gluten folds.",
      tags: ["Hobbies", "Culinary", "Baking"],
      date: "2 hours ago",
    },
    {
      id: "seek-3",
      title: "Habit Triggers and Friction",
      content: "Daily habit triggers succeed when paired with distinct physical settings and minimal initial friction.",
      folder: "Archives/Finance",
      sourceDomain: "jamesclear.com",
      summary: "Guidelines on structuring environment cues to optimize habit creation.",
      tags: ["Habits", "Friction", "Cues"],
      date: "3 days ago",
    },
    {
      id: "seek-4",
      title: "Dividend Compounding Dynamics",
      content: "Compounding dividends build long term financial freedom by reinvesting index fund gains early.",
      folder: "Archives/Finance/Wealth-Management",
      sourceDomain: "mrmoneymustache.com",
      summary: "Personal finance tips highlighting compounding dividends and overhead reductions.",
      tags: ["Finance", "Wealth-Management", "Compounding"],
      date: "15 mins ago",
    },
  ],
};
