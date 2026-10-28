import { pl } from '../../../content/pl';
import { PHASE_STYLES } from '../../../components/ui/PhaseProgress';
import { cx } from '../../../components/ui/cx';
import { WOOP_PHASES } from '../../../domain/wizard/steps';

export function IntroStep() {
  return (
    <>
      <div className="flex flex-col gap-3 text-lg leading-relaxed">
        {pl.intro.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
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
      <p className="text-sm text-muted">{pl.app.methodCredit}</p>
    </>
  );
}
