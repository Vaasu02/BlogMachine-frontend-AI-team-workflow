export interface Blog {
  id: string;
  topic: string;
  title: string | null;
  content: string | null;
  meta_description: string | null;
  tags: string | null;
  subject: string | null;
  gs_paper: string | null;
  seo_score: number | null;
  status: string;
  mcqs: string | null;
  images: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogListResponse {
  blogs: Blog[];
  total: number;
}

export interface AgentEvent {
  blog_id: string;
  current_agent: string;
  state: string;
  status: string;
  message: string;
  progress: number;
  timestamp: string;
  feedback_loop: FeedbackLoop | null;
  details: AgentDetails | null;
}

export interface AgentDetails {
  type: string;
  // research
  search_queries?: string[];
  sources?: { url: string; title: string }[];
  key_points?: string[];
  topic?: string;
  // narrative
  section_count?: number;
  sections?: string[];
  gs_paper?: string;
  subject?: string;
  // writing
  word_count?: number;
  sections_written?: string[];
  // fact_check
  verified?: boolean;
  claims_checked?: number;
  issues?: { claim: string; problem: string; correction: string }[];
  sources_used?: { url: string; title: string }[];
  // humanize
  title?: string;
  changes_made?: string[];
  // seo
  seo_score?: number;
  scores?: Record<string, number>;
  improvements?: string[];
  meta_description?: string;
  tags?: string[];
  // mcq
  question_count?: number;
  // images
  image_count?: number;
  images?: { alt: string; credit: string }[];
}

export interface FeedbackLoop {
  active: boolean;
  from: string;
  to: string;
  reason: string;
  retry_count: number;
}

export interface AgentLog {
  id: string;
  agent_name: string;
  state: string;
  status: string;
  input_data: string | null;
  output_data: string | null;
  feedback: string | null;
  retry_count: number;
  timestamp: string;
}

export interface MCQ {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: string;
}

export interface BlogImage {
  url: string;
  alt_text: string;
  credit: string;
  placement: string;
}

export const AGENTS = [
  { key: "topic_scout", label: "Topic Scout" },
  { key: "narrative_planner", label: "Narrative Planner" },
  { key: "content_writer", label: "Content Writer" },
  { key: "fact_checker", label: "Fact Checker" },
  { key: "humanizer", label: "Humanizer" },
  { key: "seo_optimizer", label: "SEO Optimizer" },
  { key: "mcq_generator", label: "MCQ Generator" },
  { key: "image_selector", label: "Image Selector" },
] as const;
