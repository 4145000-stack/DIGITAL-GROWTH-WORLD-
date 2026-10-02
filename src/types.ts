export type AnimationState =
  | 'idle'
  | 'walk'
  | 'sit'
  | 'work'
  | 'think'
  | 'talk'
  | 'happy'
  | 'alert'
  | 'sleep';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  x: number;
  y: number;
}

export interface CharacterCustomization {
  hairColor: string;
  hairStyle: 'short' | 'spiky' | 'bob' | 'ponytail' | 'curly' | 'bald';
  skinColor: string;
  outfitColor: string;
  pantColor: string;
  accessory?: 'glasses' | 'tie' | 'visor' | 'headphones' | 'badge';
}

export interface AgentPersonalityProfile {
  archetype: string;
  traits: string[];
  conversationalStyle: string;
  idleBehaviorType:
    | 'energetic_pacing'
    | 'analytical_coding'
    | 'creative_sketching'
    | 'executive_planning'
    | 'calm_meditation'
    | 'vector_analysis'
    | 'cheerful_welcoming';
  idleDescription: string;
  voiceTone: string;
  catchphrase: string;
  dialogueModifiers: {
    greetingPrefix: string;
    taskAcceptancePhrase: string;
    workingPhrase: string;
    completedPhrase: string;
  };
}

export type EmoteType = 'speech' | 'think' | 'alert' | 'happy' | 'sleep' | 'heart' | 'idea' | 'sparkles' | 'fire' | 'gear' | 'leaf' | 'wave' | 'confused' | 'laugh' | 'sad' | 'angry' | 'thumb_up';

export interface Character {
  id: string;
  name: string;
  position: Position;
  targetPosition?: Position;
  direction: Direction;
  animationState: AnimationState;
  customization: CharacterCustomization;
  isSitting?: boolean;
  sittingObjectId?: string;
  speed: number;
  aiAnimationOverride?: {
    state: AnimationState;
    expiresAt: number;
  };
  emote?: {
    type: EmoteType;
    text?: string;
    expiresAt: number;
  };
}

export interface AgentToolDefinition {
  name: string;
  description: string;
  parameters?: Record<string, any>;
}

export interface AgentDefinition {
  id: string;
  name: string;
  role: string;
  specialty: string;
  systemInstructions: string;
  personality: string;
  capabilities: string[];
  tools: AgentToolDefinition[] | string[];
  department?: string;
  characterId?: string;
  avatarColor?: string;
  starterPrompts?: string[];
}

export interface AIAgent extends Character {
  role: string;
  department: string;
  status: string;
  personality: string;
  personalityProfile: AgentPersonalityProfile;
  specialty: string;
  assignedRoom: string;
  workstationId?: string;
  dialoguePrompt?: string;
  path?: Position[];
  currentWaypointIndex?: number;
  nextMoveTime?: number;
  conversationHistory: Array<{
    sender: 'user' | 'agent' | 'system';
    text: string;
    timestamp: number;
  }>;
  energy: number;
  satisfaction: number;
}

export interface WorldObject {
  id: string;
  type:
    | 'desk'
    | 'table'
    | 'computer_desk'
    | 'chair'
    | 'board'
    | 'plant'
    | 'bed'
    | 'decoration'
    | 'desk_computer'
    | 'desk_laptop'
    | 'cubicle_desk'
    | 'office_chair'
    | 'bench'
    | 'couch'
    | 'water_cooler'
    | 'vending_machine'
    | 'whiteboard'
    | 'plant_potted'
    | 'plant_tree'
    | 'street_lamp'
    | 'parking_meter'
    | 'parking_sign'
    | 'bookshelf'
    | 'server_rack'
    | 'coffee_maker'
    | 'trash_can'
    | 'flower_planter'
    | 'wall_chart'
    | 'planning_desk'
    | 'documents'
    | 'design_board'
    | 'content_workspace'
    | 'sales_desk'
    | 'lead_board'
    | 'communication_device'
    | 'project_board'
    | 'task_desk'
    | 'workflow_area'
    | 'quiet_desk'
    | 'focus_timer'
    | 'focus_station'
    | 'conference_table'
    | 'conference_chair'
    | 'presentation_screen'
    | 'agenda_board'
    | 'bed'
    | 'decoration';
  x: number;
  y: number;
  width: number;
  height: number;
  solid: boolean;
  interactive?: boolean;
  interactLabel?: string;
  room: string;
  isSeat?: boolean;
  facing?: Direction;
  rotation?: 0 | 90 | 180 | 270;
  owner?: string;
  data?: Record<string, any>;
}

export interface FocusStats {
  dailyFocusTimeMinutes: number;
  completedSessions: number;
  currentStreak: number;
}

export interface MeetingUtterance {
  id: string;
  speakerId: string;
  speakerName: string;
  speakerRole: string;
  department: string;
  text: string;
  timestamp: number;
  animation?: AnimationState;
  suggestedAction?: string;
  createdTask?: {
    title: string;
    description: string;
    category: 'Growth' | 'Engineering' | 'Design' | 'Product' | 'Operations';
  };
}

export interface MultiAgentMeetingSession {
  id: string;
  agenda: string;
  status: 'idle' | 'convening' | 'in_session' | 'adjourned';
  attendeeIds: string[];
  currentSpeakerId: string | null;
  transcript: MeetingUtterance[];
  decision?: string;
  nextSteps?: string;
  actionItems: TaskItem[];
  startedAt: number;
  endedAt?: number;
}

export interface RoomZone {
  id: string;
  name: string;
  displayName: string;
  floor: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  colorTheme?: string;
}

export interface Doorway {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  label: string;
  fromRoom: string;
  toRoom: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  assignedToAgentId?: string;
  status: 'todo' | 'in_progress' | 'done';
  progress: number; // 0 to 100
  priority: 'low' | 'medium' | 'high';
  xpReward: number;
  category: 'Growth' | 'Engineering' | 'Design' | 'Product' | 'Operations';
  createdAt?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  text: string;
  timestamp: number;
  isAgent?: boolean;
  channel: 'world' | 'agent_dm' | 'system';
}

export interface FocusSessionState {
  isActive: boolean;
  partnerAgentId?: string;
  goal: string;
  durationMinutes: number;
  secondsRemaining: number;
  startTime?: number;
  isPaused: boolean;
  soundEnabled: boolean;
}

export interface ClientRecord {
  id: string;
  name: string;
  industry: string;
  status: 'active' | 'churned' | 'onboarding';
  mrr: number;
  contactEmail: string;
}

export interface AuditRecord {
  id: string;
  clientId: string;
  title: string;
  date: number;
  score: number;
  findings: string[];
}

export interface Proposal {
  id: string;
  leadId: string;
  title: string;
  value: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  createdAt: number;
}

export interface Project {
  id: string;
  clientId?: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  progress: number;
  dueDate?: number;
}

export interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'lost';
  estimatedValue: number;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  platform: string;
  status: 'planned' | 'active' | 'paused' | 'completed';
  budget: number;
  spend: number;
  leadsGenerated: number;
}

export interface AnalyticsData {
  pageViews: number;
  conversionRate: number;
  bounceRate: number;
  topChannels: { channel: string; visitors: number }[];
}

export interface Opportunity {
  id: string;
  name: string;
  category: 'High-Intent Search' | 'Expansion' | 'Conversion Funnel' | 'Viral Referral' | 'Pricing Leverage';
  score: number; // 0-100
  commercialIntent: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  conversionProbability: 'LOW' | 'MEDIUM' | 'HIGH';
  offerFit: number; // 0-100
  competition: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedValue: number;
  trafficPotential: string;
  recommendedAction: string;
  assignedAgentId: string;
  status: 'detected' | 'analyzing' | 'actionable' | 'executed';
  funnelReady: boolean;
}

export interface FunnelStep {
  id: string;
  name: string;
  visitors: number;
  conversionRate: number;
  dropoffRate: number;
  assignedAgent: string;
}

export interface FunnelRecord {
  id: string;
  name: string;
  opportunityId?: string;
  status: 'active' | 'draft' | 'optimizing';
  trafficSource: string;
  targetOffer: string;
  totalRevenue: number;
  conversionRate: number;
  steps: FunnelStep[];
}

export interface CompanyMetrics {
  mrr: number;
  monthlyGrowthRate: number;
  activeUsers: number;
  retentionRate: number;
  runwayMonths: number;
  experimentsLive: number;
  completedTasks: number;
}

export interface NextBestAction {
  id: string;
  title: string;
  tagline: string;
  reason: string;
  impactScore: number;
  actionType: 'analyze_opportunity' | 'launch_funnel' | 'call_prospect' | 'run_audit' | 'deep_focus';
  agentId: string;
  actionLabel: string;
  metrics: {
    commercialIntent: string;
    opportunityScore: number;
    offerFit: number;
  };
  factors?: string[];
  expectedOutcome?: string;
  targetEntityId?: string;
  targetEntityType?: 'opportunity' | 'lead' | 'task' | 'funnel';
}

// -------------------------------------------------------------
// SPRINT 03 — OPERATIONAL INTELLIGENCE & AGENT EXECUTION MODELS
// -------------------------------------------------------------

export type SignalType =
  | 'HIGH_VALUE_LEAD'
  | 'STALLING_OPPORTUNITY'
  | 'OVERDUE_TASK'
  | 'FUNNEL_DROP'
  | 'REVENUE_ANOMALY'
  | 'LOW_AGENT_CAPACITY'
  | 'MISSED_FOLLOW_UP'
  | 'EXPERIMENT_WIN'
  | 'EXPERIMENT_FAILURE';

export type SignalSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface BusinessSignal {
  id: string;
  type: SignalType;
  severity: SignalSeverity;
  title: string;
  description: string;
  entityId?: string;
  entityType: 'lead' | 'opportunity' | 'task' | 'funnel' | 'finance' | 'agent';
  evidence: Record<string, any>;
  detectedAt: number;
  status: 'active' | 'acknowledged' | 'resolved';
}

export interface ScoringFactors {
  commercialIntent: number; // max 25
  economicValue: number; // max 20
  conversionProbability: number; // max 18
  urgency: number; // max 12
  fit: number; // max 8
  evidenceStrength: number; // max 4
}

export interface OpportunityScoreDetail {
  score: number;
  confidence: number;
  factors: ScoringFactors;
  calculatedAt: number;
  version: string;
  summary: string;
}

export interface LeadIntelligenceDetail {
  leadId: string;
  score: number;
  temperature: 'cold' | 'warm' | 'hot' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recommendedAction: string;
  recommendedAgent: string;
  rationale: string;
}

export type AgentOperationalState =
  | 'AVAILABLE'
  | 'ASSIGNED'
  | 'THINKING'
  | 'EXECUTING'
  | 'WAITING_APPROVAL'
  | 'BLOCKED'
  | 'COMPLETED'
  | 'FAILED';

export interface AgentWorkItem {
  id: string;
  agentId: string;
  title: string;
  description: string;
  priority: number; // 0 - 100
  category: 'Strategy' | 'Creative' | 'Sales' | 'Operations' | 'Focus';
  state: AgentOperationalState;
  entityType?: 'opportunity' | 'lead' | 'task' | 'funnel';
  entityId?: string;
  deadline?: number;
  actionPayload?: {
    toolName: string;
    args: Record<string, any>;
  };
  assignedAt: number;
  startedAt?: number;
  completedAt?: number;
  result?: any;
}

export type ActionRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ApprovalRequest {
  id: string;
  requestedBy: string;
  agentId: string;
  tool: string;
  action: string;
  payload: Record<string, any>;
  riskLevel: ActionRiskLevel;
  reason: string;
  customerName?: string;
  commercialValue?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: number;
  resolvedAt?: number;
  resolvedBy?: string;
  rejectionReason?: string;
}

export type ExecutionStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'RETRYING'
  | 'CANCELLED';

export interface ToolExecutionRecord {
  executionId: string;
  agentId: string;
  toolName: string;
  requestArgs: Record<string, any>;
  riskLevel: ActionRiskLevel;
  approvalStatus: 'NOT_REQUIRED' | 'APPROVED' | 'REJECTED' | 'PENDING';
  approvalId?: string;
  executionStatus: ExecutionStatus;
  startedAt: number;
  completedAt?: number;
  result?: any;
  error?: string;
  entityIds?: string[];
  idempotencyKey?: string;
}

export interface LearningRecord {
  id: string;
  action: string;
  agentId: string;
  context: Record<string, any>;
  expectedOutcome: string;
  actualOutcome: string;
  metric: string;
  result: 'positive' | 'neutral' | 'negative';
  deltaValue?: number;
  timestamp: number;
}

export type AutonomyLevel = 0 | 1 | 2 | 3 | 4;

export interface AgentAutonomySetting {
  agentId: string;
  level: AutonomyLevel;
  isPaused: boolean;
  maxDailyExecutions: number;
  currentDailyExecutions: number;
  updatedAt: number;
}

