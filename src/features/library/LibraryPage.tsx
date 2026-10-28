import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useDocumentTitle } from '../../app/useDocumentTitle';
import { pl } from '../../content/pl';
import { t } from '../../content/t';
import { Button } from '../../components/ui/Button';
import { Loading } from '../../components/ui/Loading';
import { PHASE_STYLES } from '../../components/ui/PhaseProgress';
import { cx } from '../../components/ui/cx';
import { useWoops } from '../../data/hooks';
import { draftFromObstacle, draftFromTemplate, myObstaclesAndPlans, parkedIdeas } from '../../domain/library';
import { formatPlanSentence } from '../../domain/plan';
import { startDraft } from './startDraft';

function Row({ letter, phase, text }: { letter: string; phase: keyof typeof PHASE_STYLES; text: string }) {
  return (
    <p className="flex items-start gap-2">
      <span
        aria-hidden="true"
        className={cx(
          'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold',
          PHASE_STYLES[phase].badge,
        )}
      >
        {letter}
      </span>
      <span>{text}</span>
    </p>
  );
}

export function LibraryPage() {
  const l = pl.library;
  const navigate = useNavigate();
  const loaded = useWoops();
  useDocumentTitle(l.title);
  if (loaded.status === 'loading') return <Loading />;
  const entries = myObstaclesAndPlans(loaded.value);
  const ideas = parkedIdeas(loaded.value);
  const go = async (...args: Parameters<typeof startDraft>) => navigate(await startDraft(...args));
  const sentence = (ifText: string, thenText: string) =>
    formatPlanSentence({ ifText, thenText }, pl.planBuilder.sentence, pl.lexicon);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">{l.title}</h1>
        <p className="text-lg text-muted">{l.intro}</p>
      </header>

      <section aria-labelledby="mine-title" className="flex flex-col gap-3">
        <h2 id="mine-title" className="text-xl font-bold">
          {l.mine}
        </h2>
        {entries.length === 0 ? (
          <p className="text-muted">{l.mineEmpty}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {entries.map((entry) => (
              <li key={entry.key} className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-4">
                <p className="text-sm text-muted">{t(l.from, { wish: entry.wish })}</p>
                <Row letter={pl.phases.obstacle.letter} phase="obstacle" text={entry.obstacle} />
                <Row letter={pl.phases.plan.letter} phase="plan" text={sentence(entry.ifText, entry.thenText)} />
                <div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => void go((draft) => draftFromObstacle(draft, entry))}
                  >
                    {l.useEntry}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {ideas.length > 0 && (
        <section aria-labelledby="ideas-title" className="flex flex-col gap-3">
          <h2 id="ideas-title" className="text-xl font-bold">
            {l.ideas}
          </h2>
          <p className="text-muted">{l.ideasHint}</p>
          <ul className="flex flex-col gap-2">
            {ideas.map((idea) => (
              <li
                key={`${idea.woopId}-${idea.obstacle}`}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-field bg-surface p-4"
              >
                <div className="flex-1 basis-48">
                  <p className="font-semibold">{idea.obstacle}</p>
                  <p className="text-sm text-muted">{t(l.from, { wish: idea.wish })}</p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => void go((draft) => draftFromObstacle(draft, { obstacle: idea.obstacle }))}
                >
                  {l.useIdea}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="examples-title" className="flex flex-col gap-3">
        <h2 id="examples-title" className="text-xl font-bold">
          {l.examples}
        </h2>
        <p className="text-muted">{l.examplesHint}</p>
        <ul className="flex flex-col gap-3">
          {l.templates.map((template) => (
            <li key={template.id} className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-4">
              <h3 className="font-bold">{template.label}</h3>
              <Row letter={pl.phases.wish.letter} phase="wish" text={template.wish} />
              <Row letter={pl.phases.outcome.letter} phase="outcome" text={template.outcome} />
              <Row letter={pl.phases.obstacle.letter} phase="obstacle" text={template.obstacle} />
              <Row letter={pl.phases.plan.letter} phase="plan" text={sentence(template.ifText, template.thenText)} />
              <div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => void go((draft) => draftFromTemplate(draft, template))}
                  aria-label={`${l.useTemplate}: ${template.label}`}
                >
                  {l.useTemplate}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
