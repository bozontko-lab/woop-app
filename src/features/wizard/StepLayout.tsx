import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import type { ReactNode, Ref } from 'react';
import { pl } from '../../content/pl';
import { Button } from '../../components/ui/Button';
import { Notice } from '../../components/ui/Notice';
import { PhaseProgress } from '../../components/ui/PhaseProgress';
import type { phaseProgress } from '../../domain/wizard/engine';

interface StepLayoutProps {
  progress: ReturnType<typeof phaseProgress>;
  title: string;
  subtitle?: string;
  headingRef: Ref<HTMLHeadingElement>;
  editing: boolean;
  saveError: boolean;
  onClose: () => void;
  onBack: () => void;
  onSubmit: () => void;
  showNext: boolean;
  nextLabel: string;
  skip?: { label: string; onSkip: () => void } | null;
  onReturnToSummary?: () => void;
  context?: ReactNode;
  help?: ReactNode;
  nudges?: ReactNode;
  children?: ReactNode;
}

export function StepLayout(props: StepLayoutProps) {
  const { progress, title, subtitle, headingRef, editing, saveError, skip } = props;
  return (
    <div className="flex flex-col gap-5 pt-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 pt-1">
          <PhaseProgress current={progress.current} phases={progress.phases} />
        </div>
        <button
          type="button"
          onClick={props.onClose}
          aria-label={pl.nav.closeWizard}
          className="grid size-11 shrink-0 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-fg"
        >
          <X aria-hidden="true" className="size-6" />
        </button>
      </div>

      {editing && <Notice tone="info">{pl.edit.editing}</Notice>}
      {saveError && (
        <Notice tone="error" role="alert">
          {pl.errors.storage}
        </Notice>
      )}

      <form
        noValidate
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          props.onSubmit();
        }}
      >
        <header className="flex flex-col gap-2">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl leading-tight font-bold text-balance outline-none sm:text-3xl"
          >
            {title}
          </h1>
          {subtitle && <p className="text-lg text-muted">{subtitle}</p>}
        </header>

        {props.context}
        {props.children && <div className="flex flex-col gap-5">{props.children}</div>}
        {props.help}
        {props.nudges}

        <div className="flex flex-col gap-3 border-t border-line pt-5">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              onClick={props.onBack}
              icon={<ArrowLeft aria-hidden="true" className="size-5" />}
            >
              {pl.common.back}
            </Button>
            <div className="ml-auto flex flex-wrap justify-end gap-2">
              {skip && (
                <Button variant="ghost" onClick={skip.onSkip}>
                  {skip.label}
                </Button>
              )}
              {props.showNext && (
                <Button type="submit">
                  {props.nextLabel}
                  <ArrowRight aria-hidden="true" className="size-5" />
                </Button>
              )}
            </div>
          </div>
          {props.onReturnToSummary && (
            <Button variant="ghost" block onClick={props.onReturnToSummary}>
              {pl.edit.returnToSummary}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
