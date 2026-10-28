import { Lightbulb } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { pl } from '../../content/pl';
import { t } from '../../content/t';
import { Button } from '../../components/ui/Button';
import type { Nudge } from '../../domain/types';

export interface NudgeActions {
  /** Replace the field with the suggestion. */
  onApply: (nudge: Nudge, suggestion: string) => void;
  /** Pick one of several obstacles; the others are parked for a next WOOP. */
  onChoose: (nudge: Nudge, option: string) => void;
  /** Split a whole „jeśli…, to…” sentence typed into one field. */
  onSplit: (nudge: Nudge) => void;
  /** Close the hint and go back to the field. */
  onEdit: (nudge: Nudge) => void;
  /** Keep the user's version and move on. */
  onKeep: (nudge: Nudge) => void;
  onChangeWish: () => void;
}

interface NudgePanelProps extends NudgeActions {
  nudge: Nudge;
  index: number;
  total: number;
}

/** A gentle suggestion shown after „Dalej”. It never blocks: „Zostaw moją wersję” always moves on. */
export function NudgePanel({ nudge, index, total, ...actions }: NudgePanelProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const content = pl.nudges[nudge.code];
  const ui = pl.nudgeUi;

  useEffect(() => {
    headingRef.current?.focus();
  }, [nudge]);

  const example =
    nudge.code === 'obstacle.external'
      ? (pl.externalExamples[nudge.exampleKey ?? 'default'] ?? pl.externalExamples.default)
      : content.example;

  return (
    <section
      aria-labelledby="nudge-title"
      className="flex flex-col gap-3 rounded-2xl border-2 border-hint-line bg-hint-bg p-4 text-hint-fg"
      data-nudge={nudge.code}
    >
      <div className="flex items-start gap-3">
        <Lightbulb aria-hidden="true" className="mt-0.5 size-6 shrink-0" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold tracking-wide uppercase">
            {ui.heading}
            {total > 1 && ` ${index + 1}/${total}`}
          </p>
          <h2 id="nudge-title" ref={headingRef} tabIndex={-1} className="text-lg font-bold outline-none">
            {content.title}
          </h2>
          <p>{t(content.body, { match: nudge.match ?? '', count: nudge.match ?? '' })}</p>
          {example && (
            <p className="text-sm">
              <span className="font-semibold">{ui.example}</span> {example}
            </p>
          )}
        </div>
      </div>

      {nudge.code === 'obstacle.multiple' && nudge.options ? (
        <div className="flex flex-col gap-2">
          <p className="font-semibold">{ui.chooseOne}</p>
          <ul className="flex flex-col gap-2">
            {nudge.options.map((option) => (
              <li key={option}>
                <Button
                  variant="secondary"
                  block
                  className="justify-start text-left"
                  onClick={() => actions.onChoose(nudge, option)}
                >
                  {option}
                </Button>
              </li>
            ))}
          </ul>
          <p className="text-sm">{ui.parked}</p>
          <div>
            <Button variant="ghost" onClick={() => actions.onKeep(nudge)}>
              {ui.keepAll}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {nudge.suggestion && (
            <div className="rounded-xl bg-surface p-3 text-fg">
              <p className="text-sm font-semibold">{ui.suggestion}</p>
              <p className="font-medium">{nudge.suggestion}</p>
            </div>
          )}
          {nudge.code === 'plan.notIfThen' && nudge.options?.length === 2 && (
            <div className="rounded-xl bg-surface p-3 text-fg">
              <p>{t(pl.planBuilder.sentence, { if: nudge.options[0]!, then: nudge.options[1]! })}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {nudge.code === 'wish.lowImportance' ? (
              <>
                <Button onClick={actions.onChangeWish}>{ui.changeWish}</Button>
                <Button variant="secondary" onClick={() => actions.onKeep(nudge)}>
                  {ui.confirmWish}
                </Button>
              </>
            ) : nudge.code === 'wish.noCriterion' ? (
              <>
                <Button onClick={() => actions.onEdit(nudge)}>{ui.addCriterion}</Button>
                <Button variant="secondary" onClick={() => actions.onKeep(nudge)}>
                  {pl.common.skip}
                </Button>
              </>
            ) : (
              <>
                {nudge.suggestion && (
                  <Button onClick={() => actions.onApply(nudge, nudge.suggestion!)}>{ui.apply}</Button>
                )}
                {nudge.code === 'plan.notIfThen' && nudge.options?.length === 2 && (
                  <Button onClick={() => actions.onSplit(nudge)}>{ui.splitPlan}</Button>
                )}
                <Button variant={nudge.suggestion ? 'secondary' : 'primary'} onClick={() => actions.onEdit(nudge)}>
                  {ui.edit}
                </Button>
                <Button variant="secondary" onClick={() => actions.onKeep(nudge)}>
                  {ui.keep}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
