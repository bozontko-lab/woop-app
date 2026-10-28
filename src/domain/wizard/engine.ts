import type { StepId, WoopCore, WoopMode } from '../types';
import { STEPS, WOOP_PHASES, type Phase, type StepDef, type WoopPhase } from './steps';

const byId = new Map(STEPS.map((step) => [step.id, step]));

export function getStep(id: StepId): StepDef {
  const step = byId.get(id);
  if (!step) throw new Error(`Unknown wizard step: ${id}`);
  return step;
}

/** The forward flow for a mode, without side branches. */
export function linearSteps(mode: WoopMode): StepDef[] {
  return STEPS.filter((step) => step.linear && step.modes.includes(mode));
}

export function nextStepId(mode: WoopMode, id: StepId): StepId | null {
  const steps = linearSteps(mode);
  const index = steps.findIndex((s) => s.id === id);
  return index >= 0 ? (steps[index + 1]?.id ?? null) : null;
}

export function prevStepId(mode: WoopMode, id: StepId): StepId | null {
  if (id === 'realism-release') return 'realism';
  const steps = linearSteps(mode);
  const index = steps.findIndex((s) => s.id === id);
  return index > 0 ? steps[index - 1]!.id : null;
}

export function firstIncompleteStepId(mode: WoopMode, woop: WoopCore): StepId | null {
  return linearSteps(mode).find((step) => !step.isComplete(woop))?.id ?? null;
}

/** Steps can only be entered when every earlier step has its required fields filled. */
export function canEnter(mode: WoopMode, id: StepId, woop: WoopCore): boolean {
  const target = id === 'realism-release' ? 'realism' : id;
  const steps = linearSteps(mode);
  const index = steps.findIndex((s) => s.id === target);
  if (index < 0) return false;
  const before = id === 'realism-release' ? steps.slice(0, index + 1) : steps.slice(0, index);
  return before.every((step) => step.isComplete(woop));
}

/** The step to show: the requested one if allowed, otherwise the first one that still needs an answer. */
export function resolveStep(mode: WoopMode, requested: StepId | null | undefined, woop: WoopCore): StepId {
  if (requested && canEnter(mode, requested, woop)) return requested;
  const steps = linearSteps(mode);
  return firstIncompleteStepId(mode, woop) ?? steps[steps.length - 1]!.id;
}

export function isFlowComplete(mode: WoopMode, woop: WoopCore): boolean {
  return firstIncompleteStepId(mode, woop) === null;
}

export interface PhaseState {
  phase: WoopPhase;
  state: 'done' | 'current' | 'todo';
  /** 0–1 share of the phase's steps already passed. */
  progress: number;
}

export function phaseProgress(mode: WoopMode, id: StepId): { current: Phase; phases: PhaseState[] } {
  const step = getStep(id);
  const steps = linearSteps(mode);
  const currentIndex = WOOP_PHASES.indexOf(step.phase as WoopPhase);
  const phases = WOOP_PHASES.map((phase, i): PhaseState => {
    if (step.phase === 'start' || i > currentIndex) return { phase, state: 'todo', progress: 0 };
    if (i < currentIndex) return { phase, state: 'done', progress: 1 };
    const inPhase = steps.filter((s) => s.phase === phase);
    const position = Math.max(
      0,
      inPhase.findIndex((s) => s.id === (id === 'realism-release' ? 'realism' : id)),
    );
    return { phase, state: 'current', progress: inPhase.length ? position / inPhase.length : 0 };
  });
  return { current: step.phase, phases };
}
