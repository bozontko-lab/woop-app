import { Pencil } from 'lucide-react';
import { Link } from 'react-router';
import { pl } from '../../content/pl';
import { Disclosure } from '../../components/ui/Disclosure';
import { backupSentence, planSentence } from '../../domain/summary/format';
import type { StepId, Woop } from '../../domain/types';

interface Row {
  label: string;
  value: string | string[];
}

interface Group {
  title: string;
  step: StepId;
  rows: Row[];
}

export function FullAnswers({ woop, editable }: { woop: Woop; editable: boolean }) {
  const f = pl.summary.full;
  const groups: Group[] = [
    {
      title: f.wish,
      step: 'wish-text',
      rows: [
        { label: f.wish, value: woop.wish.text },
        { label: f.success, value: woop.wish.successCriterion },
        { label: f.area, value: woop.area ? pl.areas[woop.area].label : '' },
      ],
    },
    {
      title: f.outcome,
      step: 'outcome-text',
      rows: [
        { label: f.outcome, value: woop.outcome.text },
        { label: f.deeper, value: woop.outcome.deeper.filter((d) => d.trim()) },
      ],
    },
    {
      title: f.obstacle,
      step: 'obstacle-text',
      rows: [
        { label: f.obstacle, value: woop.obstacle.text },
        { label: f.type, value: woop.obstacle.type ? pl.obstacleTypes[woop.obstacle.type].label : '' },
        { label: f.when, value: woop.obstacle.when },
        { label: f.where, value: woop.obstacle.where },
        { label: f.time, value: woop.obstacle.time },
        { label: f.parked, value: woop.parkedObstacles },
      ],
    },
    {
      title: f.plan,
      step: 'plan-builder',
      rows: [
        { label: f.plan, value: planSentence(woop.plan) },
        { label: f.backup, value: backupSentence(woop.plan) ?? '' },
      ],
    },
  ];

  return (
    <Disclosure summary={pl.summary.fullAnswers}>
      <div className="flex flex-col gap-5">
        {groups.map((group) => (
          <section key={group.title} aria-label={group.title} className="flex flex-col gap-2">
            <dl className="flex flex-col gap-2">
              {group.rows
                .filter((row) => (Array.isArray(row.value) ? row.value.length > 0 : row.value.trim()))
                .map((row) => (
                  <div key={row.label}>
                    <dt className="text-sm font-semibold text-muted">{row.label}</dt>
                    {Array.isArray(row.value) ? (
                      row.value.map((item) => <dd key={item}>{item}</dd>)
                    ) : (
                      <dd className="whitespace-pre-line">{row.value}</dd>
                    )}
                  </div>
                ))}
            </dl>
            {editable && (
              <Link
                to={`/wizard/${woop.id}?edit=${group.step}`}
                className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-lg font-semibold text-primary underline-offset-4 hover:underline"
              >
                <Pencil aria-hidden="true" className="size-4" />
                {pl.summary.edit}: {group.title.toLowerCase()}
              </Link>
            )}
          </section>
        ))}
      </div>
    </Disclosure>
  );
}
