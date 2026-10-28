import { LifeBuoy, RefreshCw } from 'lucide-react';
import { useId, useState } from 'react';
import { pl } from '../../content/pl';
import { t, type TemplateParams } from '../../content/t';
import { Button } from '../../components/ui/Button';
import { Disclosure } from '../../components/ui/Disclosure';

interface QuestionHelpProps {
  why?: string;
  help?: string[];
  examples?: string[];
  params: TemplateParams;
}

/** Examples, one helper question at a time („Inne pytanie”) and „Dlaczego o to pytam?”. */
export function QuestionHelp({ why, help = [], examples = [], params }: QuestionHelpProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const panelId = useId();
  if (!why && help.length === 0 && examples.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      {examples.length > 0 && (
        <div className="rounded-xl bg-surface-2 px-4 py-3 text-sm">
          <p className="font-semibold">{examples.length > 1 ? pl.help.examples : pl.help.example}</p>
          <ul className="mt-1 flex flex-col gap-1 text-muted">
            {examples.map((example) => (
              <li key={example} className="italic">
                {t(example, params)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {help.length > 0 && (
        <div>
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
            icon={<LifeBuoy aria-hidden="true" className="size-5" />}
          >
            {open ? pl.help.hideHelp : pl.help.needHelp}
          </Button>
          <div id={panelId} hidden={!open} className="mt-2 rounded-xl border border-line bg-surface p-4">
            <p className="text-sm text-muted">{t(pl.help.helpLabel, { index: index + 1, total: help.length })}</p>
            <p className="mt-1 text-lg" aria-live="polite">
              {t(help[index] ?? '', params)}
            </p>
            {help.length > 1 && (
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => setIndex((value) => (value + 1) % help.length)}
                icon={<RefreshCw aria-hidden="true" className="size-4" />}
              >
                {pl.help.another}
              </Button>
            )}
          </div>
        </div>
      )}

      {why && <Disclosure summary={pl.help.why}>{why}</Disclosure>}
    </div>
  );
}
