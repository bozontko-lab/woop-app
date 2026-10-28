import { isTimeframeValid } from '../timeframe';
import type { FieldPath, StepId, WoopCore, WoopMode } from '../types';

export type Phase = 'start' | 'wish' | 'outcome' | 'obstacle' | 'plan';
export type WoopPhase = Exclude<Phase, 'start'>;
export const WOOP_PHASES: readonly WoopPhase[] = ['wish', 'outcome', 'obstacle', 'plan'];

export type StepKind =
  | 'intro'
  | 'timeframe'
  | 'area'
  | 'text'
  | 'importance'
  | 'short'
  | 'deeper'
  | 'visualize'
  | 'obstacleType'
  | 'context'
  | 'realism'
  | 'release'
  | 'planBuilder'
  | 'planBackup'
  | 'rehearse';

export interface StepDef {
  id: StepId;
  phase: Phase;
  kind: StepKind;
  modes: readonly WoopMode[];
  /** Main field of the step (focus target, nudges). */
  field?: FieldPath;
  /** Can be left empty („Pomiń”). */
  optional?: boolean;
  /** Part of the normal forward flow (the release step is a side branch). */
  linear: boolean;
  /** Required fields are filled, so the user may move forward. */
  isComplete: (woop: WoopCore) => boolean;
}

const filled = (text: string) => text.trim().length > 0;
const ALL: readonly WoopMode[] = ['full', 'quick'];
const FULL: readonly WoopMode[] = ['full'];
const always = () => true;

export const STEPS: readonly StepDef[] = [
  { id: 'start-intro', phase: 'start', kind: 'intro', modes: ALL, linear: true, isComplete: always },
  {
    id: 'start-timeframe',
    phase: 'start',
    kind: 'timeframe',
    modes: FULL,
    field: 'timeframe',
    linear: true,
    isComplete: (w) => isTimeframeValid(w.timeframe),
  },
  { id: 'start-area', phase: 'start', kind: 'area', modes: FULL, optional: true, linear: true, isComplete: always },
  {
    id: 'wish-text',
    phase: 'wish',
    kind: 'text',
    modes: ALL,
    field: 'wish.text',
    linear: true,
    isComplete: (w) => w.wish.text.trim().length >= 2,
  },
  {
    id: 'wish-success',
    phase: 'wish',
    kind: 'text',
    modes: FULL,
    field: 'wish.successCriterion',
    optional: true,
    linear: true,
    isComplete: always,
  },
  {
    id: 'wish-importance',
    phase: 'wish',
    kind: 'importance',
    modes: FULL,
    field: 'wish.importance',
    linear: true,
    isComplete: (w) => w.wish.importance !== null,
  },
  {
    id: 'wish-short',
    phase: 'wish',
    kind: 'short',
    modes: FULL,
    field: 'wish.short',
    linear: true,
    isComplete: (w) => filled(w.wish.short),
  },
  {
    id: 'outcome-text',
    phase: 'outcome',
    kind: 'text',
    modes: ALL,
    field: 'outcome.text',
    linear: true,
    isComplete: (w) => filled(w.outcome.text),
  },
  {
    id: 'outcome-deeper',
    phase: 'outcome',
    kind: 'deeper',
    modes: FULL,
    optional: true,
    linear: true,
    isComplete: always,
  },
  { id: 'outcome-visualize', phase: 'outcome', kind: 'visualize', modes: ALL, linear: true, isComplete: always },
  {
    id: 'outcome-short',
    phase: 'outcome',
    kind: 'short',
    modes: FULL,
    field: 'outcome.short',
    linear: true,
    isComplete: (w) => filled(w.outcome.short),
  },
  {
    id: 'obstacle-text',
    phase: 'obstacle',
    kind: 'text',
    modes: ALL,
    field: 'obstacle.text',
    linear: true,
    isComplete: (w) => filled(w.obstacle.text),
  },
  {
    id: 'obstacle-type',
    phase: 'obstacle',
    kind: 'obstacleType',
    modes: FULL,
    optional: true,
    linear: true,
    isComplete: always,
  },
  {
    id: 'obstacle-context',
    phase: 'obstacle',
    kind: 'context',
    modes: FULL,
    optional: true,
    linear: true,
    isComplete: always,
  },
  { id: 'obstacle-visualize', phase: 'obstacle', kind: 'visualize', modes: ALL, linear: true, isComplete: always },
  {
    id: 'obstacle-short',
    phase: 'obstacle',
    kind: 'short',
    modes: FULL,
    field: 'obstacle.short',
    linear: true,
    isComplete: (w) => filled(w.obstacle.short),
  },
  {
    id: 'realism',
    phase: 'obstacle',
    kind: 'realism',
    modes: ALL,
    field: 'realism',
    linear: true,
    isComplete: (w) => w.realism !== null,
  },
  { id: 'realism-release', phase: 'obstacle', kind: 'release', modes: ALL, linear: false, isComplete: always },
  {
    id: 'plan-builder',
    phase: 'plan',
    kind: 'planBuilder',
    modes: ALL,
    field: 'plan.thenText',
    linear: true,
    isComplete: (w) => filled(w.plan.ifText) && filled(w.plan.thenText),
  },
  {
    id: 'plan-backup',
    phase: 'plan',
    kind: 'planBackup',
    modes: FULL,
    field: 'plan.backupPlan',
    optional: true,
    linear: true,
    isComplete: always,
  },
  {
    id: 'plan-short',
    phase: 'plan',
    kind: 'short',
    modes: FULL,
    field: 'plan.short',
    linear: true,
    isComplete: (w) => filled(w.plan.short),
  },
  { id: 'plan-rehearse', phase: 'plan', kind: 'rehearse', modes: ALL, linear: true, isComplete: always },
];
