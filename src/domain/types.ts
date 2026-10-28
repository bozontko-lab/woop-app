export const TIMEFRAME_TYPES = ['today', 'week', 'month', 'date'] as const;
export type TimeframeType = (typeof TIMEFRAME_TYPES)[number];

export interface Timeframe {
  type: TimeframeType;
  /** Local ISO date (YYYY-MM-DD). */
  startDate: string;
  /** Local ISO date (YYYY-MM-DD), inclusive. */
  endDate: string;
}

export const AREAS = ['health', 'movement', 'work', 'learning', 'relationships', 'finance', 'other'] as const;
export type Area = (typeof AREAS)[number];

export const OBSTACLE_TYPES = ['emotion', 'habit', 'thought', 'belief', 'temptation', 'other'] as const;
export type ObstacleType = (typeof OBSTACLE_TYPES)[number];
export type InnerObstacleType = Exclude<ObstacleType, 'other'>;

export type WoopStatus = 'draft' | 'active' | 'achieved' | 'changed' | 'released';
export type WoopMode = 'full' | 'quick';

export interface Wish {
  text: string;
  short: string;
  successCriterion: string;
  /** 1–10, null until the user touches the slider. */
  importance: number | null;
}

export interface Outcome {
  text: string;
  short: string;
  /** Answers to "A co ci to da?" (up to two levels). */
  deeper: string[];
}

export interface Obstacle {
  text: string;
  short: string;
  type: ObstacleType | null;
  when: string;
  where: string;
  /** Approximate time of day ("HH:MM") used for reminders, or "". */
  time: string;
}

export interface Plan {
  ifText: string;
  thenText: string;
  backupPlan: string;
  short: string;
}

/** The content of a WOOP, i.e. everything that gets versioned. */
export interface WoopCore {
  timeframe: Timeframe | null;
  area: Area | null;
  wish: Wish;
  outcome: Outcome;
  obstacle: Obstacle;
  /** 1–10, null until answered. */
  realism: number | null;
  plan: Plan;
  /** Other obstacles mentioned along the way: candidates for a next WOOP. */
  parkedObstacles: string[];
}

export interface WoopSnapshot {
  /** The version this snapshot preserves. */
  version: number;
  /** When it was replaced by the next version. */
  savedAt: string;
  /** Why the next version was created (see VersionReason). */
  reason: string;
  core: WoopCore;
}

export type ClosingOutcome = 'achieved' | 'changed' | 'released';

export interface Closing {
  outcome: ClosingOutcome;
  reflection: string;
  closedAt: string;
}

export const STEP_IDS = [
  'start-intro',
  'start-timeframe',
  'start-area',
  'wish-text',
  'wish-success',
  'wish-importance',
  'wish-short',
  'outcome-text',
  'outcome-deeper',
  'outcome-visualize',
  'outcome-short',
  'obstacle-text',
  'obstacle-type',
  'obstacle-context',
  'obstacle-visualize',
  'obstacle-short',
  'realism',
  'realism-release',
  'plan-builder',
  'plan-backup',
  'plan-short',
  'plan-rehearse',
] as const;
export type StepId = (typeof STEP_IDS)[number];

export interface WizardState {
  stepId: StepId;
  /** Keys of nudges the user chose to ignore ("code:fingerprint of text"). */
  dismissed: string[];
}

export interface Woop extends WoopCore {
  id: string;
  createdAt: string;
  updatedAt: string;
  activatedAt: string | null;
  mode: WoopMode;
  status: WoopStatus;
  version: number;
  history: WoopSnapshot[];
  /** Local ISO date of the planned review, or null. */
  reviewDate: string | null;
  closing: Closing | null;
  /** Wizard progress, kept only while the WOOP is a draft. */
  wizard: WizardState | null;
}

export type FieldPath =
  | 'timeframe'
  | 'wish.text'
  | 'wish.successCriterion'
  | 'wish.importance'
  | 'wish.short'
  | 'outcome.text'
  | 'outcome.short'
  | 'obstacle.text'
  | 'obstacle.short'
  | 'realism'
  | 'plan.ifText'
  | 'plan.thenText'
  | 'plan.backupPlan'
  | 'plan.short';

export type NudgeCode =
  | 'wish.dependent'
  | 'wish.vague'
  | 'wish.negation'
  | 'wish.noCriterion'
  | 'wish.lowImportance'
  | 'outcome.repeatsWish'
  | 'obstacle.multiple'
  | 'obstacle.external'
  | 'obstacle.tooGeneral'
  | 'plan.notIfThen'
  | 'plan.weakThen'
  | 'plan.ifIsWish'
  | 'plan.negativeThen'
  | 'plan.infinitive'
  | 'plan.noAction'
  | 'short.tooLong';

/** A gentle suggestion produced by a validator. Never blocks progress. */
export interface Nudge {
  code: NudgeCode;
  field: FieldPath;
  /** Original fragment of the user's text that triggered the nudge. */
  match?: string;
  /** Ready-to-use replacement for the field. */
  suggestion?: string;
  /** Alternatives to pick from (e.g. one of several obstacles). */
  options?: string[];
  /** Key of a tailored example in the content file. */
  exampleKey?: string;
}

/** Word lists used by validators. Entries are patterns, see `text/patterns.ts`. */
export interface Lexicon {
  stopwords: string[];
  vague: string[];
  measure: string[];
  dependent: string[];
  negation: string[];
  feeling: string[];
  external: string[];
  externalReframes: { key: string; patterns: string[] }[];
  internal: Record<InnerObstacleType, string[]>;
  weakPlan: string[];
  wishLike: string[];
  fillerStart: string[];
  functionWords: string[];
  subordinators: string[];
  listConjunctions: string[];
  /** Lower-case words ending in -ę/-am/-em that are not verbs. */
  verbStoplist: string[];
  conditionalStart: string[];
}

// ── Stage 2: keeping up with the plan ──────────────────────────────────────

export type PlanUse = 'yes' | 'partly' | 'no';

/** Daily check-in, at most one per WOOP and day. */
export interface Checkin {
  id: string;
  woopId: string;
  /** Local ISO date. */
  date: string;
  obstacleOccurred: boolean;
  /** Only when the obstacle occurred. */
  planUsed: PlanUse | null;
  /** 1–5 */
  rating: number | null;
  note: string;
  createdAt: string;
  updatedAt: string;
}

/** A single moment: „Przeszkoda teraz!” or the daily rehearsal. */
export type PracticeKind = 'sos' | 'rehearsal';

export interface Practice {
  id: string;
  woopId: string;
  kind: PracticeKind;
  /** ISO timestamp. */
  at: string;
  /** Local ISO date (for grouping). */
  date: string;
  /** For „Przeszkoda teraz!”: was the plan used? */
  planUsed: PlanUse | null;
  updatedAt: string;
}

export type ReviewDecision = 'keep' | 'fixPlan' | 'newObstacle' | 'changeWish' | 'finish';

export interface Review {
  id: string;
  woopId: string;
  /** Local ISO date. */
  date: string;
  whatWorked: string;
  obstacleChanged: boolean | null;
  planNeedsFix: boolean | null;
  decision: ReviewDecision;
  /** WOOP version that was reviewed. */
  version: number;
  createdAt: string;
  updatedAt: string;
}

export type ReminderKind = 'obstacle' | 'checkin' | 'review';

export interface Reminder {
  id: string;
  woopId: string;
  kind: ReminderKind;
  /** HH:MM, local time. */
  time: string;
  /** ISO weekdays: 1 = Monday … 7 = Sunday. */
  days: number[];
  enabled: boolean;
  /** Local date of the last system notification (avoids repeats). */
  lastNotified: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Why a new version of a WOOP was created. */
export type VersionReason = 'edit' | 'fixPlan' | 'newObstacle' | 'changeWish';
