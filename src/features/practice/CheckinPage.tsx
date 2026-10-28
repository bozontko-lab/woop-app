import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { WoopNotFound } from '../../app/errors';
import { useTodayISO } from '../../app/time';
import { useDocumentTitle } from '../../app/useDocumentTitle';
import { pl } from '../../content/pl';
import { t } from '../../content/t';
import { Button } from '../../components/ui/Button';
import { ChipGroup } from '../../components/ui/ChipGroup';
import { TextArea } from '../../components/ui/Field';
import { FocusHeader } from '../../components/ui/FocusHeader';
import { Loading } from '../../components/ui/Loading';
import { Notice } from '../../components/ui/Notice';
import { checkinRepository } from '../../data';
import { useToday } from '../../data/hooks';
import { formatShortDate } from '../../domain/dates';
import type { Checkin, PlanUse } from '../../domain/types';
import { useLoadedWoop } from '../woop/useLoadedWoop';

type YesNo = 'yes' | 'no';

function CheckinForm({ woopId, today, existing }: { woopId: string; today: string; existing: Checkin | null }) {
  const c = pl.checkin;
  const navigate = useNavigate();
  const [occurred, setOccurred] = useState<YesNo | null>(existing ? (existing.obstacleOccurred ? 'yes' : 'no') : null);
  const [planUsed, setPlanUsed] = useState<PlanUse | null>(existing?.planUsed ?? null);
  const [rating, setRating] = useState<string | null>(existing?.rating ? String(existing.rating) : null);
  const [note, setNote] = useState(existing?.note ?? '');
  const [showRequired, setShowRequired] = useState(false);

  const missingPlan = occurred === 'yes' && planUsed === null;
  const save = async () => {
    if (occurred === null || missingPlan || rating === null) {
      setShowRequired(true);
      return;
    }
    await checkinRepository.save({
      woopId,
      date: today,
      obstacleOccurred: occurred === 'yes',
      planUsed: occurred === 'yes' ? planUsed : null,
      rating: Number(rating),
      note: note.trim(),
    });
    navigate('/', { state: { message: c.saved } });
  };

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <ChipGroup<YesNo>
        legend={c.occurred}
        options={[
          { value: 'yes', label: c.yes },
          { value: 'no', label: c.no },
        ]}
        value={occurred}
        onChange={setOccurred}
        error={showRequired && occurred === null ? pl.common.requiredChoice : undefined}
      />
      {occurred === 'yes' && (
        <ChipGroup<PlanUse>
          legend={c.planUsed}
          options={(['yes', 'partly', 'no'] as const).map((value) => ({ value, label: pl.sos.answers[value] }))}
          value={planUsed}
          onChange={setPlanUsed}
          error={showRequired && missingPlan ? pl.common.requiredChoice : undefined}
        />
      )}
      <ChipGroup
        legend={
          <>
            {c.rating} <span className="font-normal text-muted">({c.ratingHint})</span>
          </>
        }
        options={['1', '2', '3', '4', '5'].map((value) => ({ value, label: value }))}
        value={rating}
        onChange={setRating}
        error={showRequired && rating === null ? pl.common.requiredChoice : undefined}
      />
      <TextArea
        label={c.note}
        hint={pl.common.optional}
        placeholder={c.notePlaceholder}
        value={note}
        onValueChange={setNote}
        rows={2}
      />
      <div>
        <Button type="submit" size="lg">
          {c.save}
        </Button>
      </div>
    </form>
  );
}

export function CheckinPage() {
  const loaded = useLoadedWoop();
  const today = useTodayISO();
  const activity = useToday(today);
  const [existing, setExisting] = useState<Checkin | null | undefined>(undefined);
  const c = pl.checkin;
  const woopId = loaded.state === 'ready' ? loaded.woop.id : null;
  useDocumentTitle(c.title);

  useEffect(() => {
    if (!woopId) return;
    let active = true;
    void checkinRepository.getForDay(woopId, today).then((row) => {
      if (active) setExisting(row ?? null);
    });
    return () => {
      active = false;
    };
  }, [woopId, today]);

  if (loaded.state === 'loading' || (loaded.state === 'ready' && existing === undefined)) return <Loading />;
  if (loaded.state === 'missing') return <WoopNotFound />;
  const { woop } = loaded;
  const sosToday =
    activity.status === 'ready'
      ? activity.value.practices.filter((p) => p.woopId === woop.id && p.kind === 'sos').length
      : 0;

  return (
    <div className="flex flex-col gap-5">
      <FocusHeader label={woop.wish.short || woop.wish.text} closeTo="/" />
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">{c.title}</h1>
        <p className="text-muted">{formatShortDate(today, pl.locale)}</p>
      </header>
      {existing && <Notice>{c.alreadyDone}</Notice>}
      {sosToday > 0 && <Notice>{t(c.sosToday, { count: sosToday })}</Notice>}
      <CheckinForm woopId={woop.id} today={today} existing={existing ?? null} />
    </div>
  );
}
