import { ExternalLink } from 'lucide-react';
import { useDocumentTitle } from '../../app/useDocumentTitle';
import { pl } from '../../content/pl';
import { t } from '../../content/t';
import { PHASE_STYLES } from '../../components/ui/PhaseProgress';
import { cx } from '../../components/ui/cx';
import { WOOP_PHASES } from '../../domain/wizard/steps';

export function AboutPage() {
  const a = pl.about;
  useDocumentTitle(a.title);
  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">{a.title}</h1>
        <p className="text-lg text-muted">{t(a.intro, { app: pl.app.name })}</p>
      </header>
      <ol className="grid gap-2 sm:grid-cols-2">
        {pl.intro.letters.map((item, i) => (
          <li key={item.name} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5">
            <span
              aria-hidden="true"
              className={cx(
                'grid size-9 shrink-0 place-items-center rounded-full font-bold',
                PHASE_STYLES[WOOP_PHASES[i]!].badge,
              )}
            >
              {item.letter}
            </span>
            <span>
              <span className="block font-semibold">{item.name}</span>
              <span className="block text-sm text-muted">{item.text}</span>
            </span>
          </li>
        ))}
      </ol>
      {a.sections.map((section) => (
        <section key={section.title} className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">{section.title}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="leading-relaxed">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
      <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5">
        <h2 className="text-xl font-bold">{a.sourceTitle}</h2>
        <p className="leading-relaxed">{a.source}</p>
        <p>
          <a
            href={pl.app.methodUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline underline-offset-4"
          >
            {pl.app.methodUrlLabel}
            <ExternalLink aria-hidden="true" className="size-4" />
          </a>
        </p>
        <p className="text-sm text-muted">{t(a.disclaimer, { app: pl.app.name })}</p>
      </section>
    </article>
  );
}
