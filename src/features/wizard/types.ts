import type { TemplateParams } from '../../content/t';
import type { Settings } from '../../data';
import type { StepId, Woop } from '../../domain/types';
import type { StepDef } from '../../domain/wizard/steps';

export type UpdateWoop = (fn: (woop: Woop) => Woop) => void;

/** What every step body receives from the wizard session. */
export interface StepProps {
  step: StepDef;
  woop: Woop;
  update: UpdateWoop;
  /** Registers the main field so the wizard can focus it (required field, „Poprawię”). */
  registerField: (element: HTMLElement | null) => void;
  /** „Dalej” was pressed with a required field still empty. */
  showRequired: boolean;
  params: TemplateParams;
  settings: Settings;
  editing: boolean;
  advance: () => void;
  goTo: (id: StepId) => void;
  finish: () => void;
}
