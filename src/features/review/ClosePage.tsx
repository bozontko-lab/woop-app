import { useState } from 'react';
import { useNavigate } from 'react-router';
import { WoopNotFound } from '../../app/errors';
import { useDocumentTitle } from '../../app/useDocumentTitle';
import { pl } from '../../content/pl';
import { Button } from '../../components/ui/Button';
import { ChipGroup } from '../../components/ui/ChipGroup';
import { TextArea } from '../../components/ui/Field';
import { FocusHeader } from '../../components/ui/FocusHeader';
import { Loading } from '../../components/ui/Loading';
import { woopRepository } from '../../data';
import type { ClosingOutcome } from '../../domain/types';
import { useLoadedWoop } from '../woop/useLoadedWoop';

const OUTCOMES: ClosingOutcome[] = ['achieved', 'changed', 'released'];

/** Ending a WOOP: achieved, changed or consciously released – plus „Czego cię to nauczyło?”. */
export function ClosePage() {
  const loaded = useLoadedWoop();
  const navigate = useNavigate();
  const c = pl.close;
  const [outcome, setOutcome] = useState<ClosingOutcome | null>(null);
  const [reflection, setReflection] = useState('');
  const [showRequired, setShowRequired] = useState(false);
  useDocumentTitle(c.title);

  if (loaded.state === 'loading') return <Loading />;
  if (loaded.state === 'missing') return <WoopNotFound />;
  const { woop } = loaded;

  const confirm = async () => {
    if (!outcome) {
      setShowRequired(true);
      return;
    }
    await woopRepository.save({
      ...woop,
      status: outcome,
      closing: { outcome, reflection: reflection.trim(), closedAt: new Date().toISOString() },
    });
    navigate(`/woop/${woop.id}`, { replace: true });
  };

  return (
    <div className="flex flex-col gap-6">
      <FocusHeader label={woop.wish.short || woop.wish.text} closeTo={`/woop/${woop.id}`} />
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">{c.title}</h1>
        <p className="text-lg text-muted">{c.intro}</p>
      </header>
      <form
        noValidate
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          void confirm();
        }}
      >
        <ChipGroup<ClosingOutcome>
          legend={c.question}
          layout="list"
          options={OUTCOMES.map((value) => ({ value, label: c.outcomes[value].label, hint: c.outcomes[value].hint }))}
          value={outcome}
          onChange={setOutcome}
          error={showRequired && !outcome ? pl.common.requiredChoice : undefined}
        />
        <TextArea
          label={c.reflection}
          hint={pl.common.optional}
          placeholder={c.reflectionPlaceholder}
          value={reflection}
          onValueChange={setReflection}
        />
        <div>
          <Button type="submit" size="lg">
            {c.confirm}
          </Button>
        </div>
      </form>
    </div>
  );
}
