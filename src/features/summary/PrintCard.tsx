import { createPortal } from 'react-dom';
import { pl } from '../../content/pl';
import { buildCardData } from '../../domain/card/data';
import type { Woop } from '../../domain/types';

const BORDER: Record<string, string> = {
  wish: 'border-[#b45309]',
  outcome: 'border-[#0f766e]',
  obstacle: 'border-[#be123c]',
  plan: 'border-[#4338ca]',
};

/** A6 card rendered into #print-root; only visible when printing (see index.css). */
export function PrintCard({ woop }: { woop: Woop }) {
  const root = document.getElementById('print-root');
  if (!root) return null;
  const data = buildCardData(woop);
  return createPortal(
    <article
      className="flex h-[132mm] flex-col gap-[3mm] font-sans text-black [print-color-adjust:exact]"
      data-testid="print-card"
    >
      <p className="text-[8pt] font-semibold tracking-wide uppercase">{pl.app.name}</p>
      {data.sections.map((section) => (
        <section key={section.phase} className={`border-l-[3pt] pl-[3mm] ${BORDER[section.phase]}`}>
          <h2 className="text-[7.5pt] font-bold tracking-wide uppercase">
            {section.letter} · {section.label}
          </h2>
          <p className="text-[12pt] leading-snug font-semibold">{section.text}</p>
        </section>
      ))}
      <p className="mt-[1mm] border-t border-black/30 pt-[2mm] text-[9.5pt] leading-snug italic">{data.planSentence}</p>
      <p className="mt-auto text-[7pt]">{data.footer}</p>
    </article>,
    root,
  );
}
