import { useState } from 'react';
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
import { reviewRepository, woopRepository } from '../../data';
import { useTracking } from '../../data/hooks';
import { addDays, formatLongDate } from '../../domain/dates';
import { editTargetFor, nextReviewDate } from '../../domain/review';
import { planUsage, situations } from '../../domain/stats';
import type { ReviewDecision } from '../../domain/types';
import { PlanCard } from '../woop/PlanCard';
import { useLoadedWoop } from '../woop/useLoadedWoop';

type YesNo = 'yes' | 'no';
const DECISIONS: ReviewDecision[] = ['keep', 'fixPlan', 'newObstacle', 'changeWish', 'finish'];

/** Guided weekly review. Changes open the wizard and create a new version; history is kept. */
export function ReviewPage() {
  const loaded = useLoadedWoop();
  const tracking = useTracking(loaded.state === 'ready' ? loaded.woop.id : undefined);
  const today = useTodayISO();
  const navigate = useNavigate();
  const r = pl.review;
  const [whatWorked, setWhatWorked] = useState('');
  const [obstacleChanged, setObstacleChanged] = useState<YesNo | null>(null);
  const [planNeedsFix, setPlanNeedsFix] = useState<YesNo | null>(null);
  const [decision, setDecision] = useState<ReviewDecision | null>(null);
  const [showRequired, setShowRequired] = useState(false);
  useDocumentTitle(r.title);

  if (loaded.state === 'loading' || tracking.status === 'loading') return <Loading />;
  if (loaded.state === 'missing') return <WoopNotFound />;
  const { woop } = loaded;
  const weekAgo = addDays(today, -6);
  const { checkins, practices } = tracking.value;
  const recent = planUsage(situations(checkins, practices).filter((s) => s.date >= weekAgo));
  const checkinDays = new Set(checkins.filter((c) => c.date >= weekAgo).map((c) => c.date)).size;

  // A gentle default that follows the answers; the choice stays with the user.
  const suggested: ReviewDecision =
    obstacleChanged === 'yes' ? 'newObstacle' : planNeedsFix === 'yes' ? 'fixPlan' : 'keep';
  const chosen = decision ?? (obstacleChanged !== null || planNeedsFix !== null ? suggested : null);

  const save = async () => {
    if (!chosen) {
      setShowRequired(true);
      return;
    }
    await reviewRepository.add({
      woopId: woop.id,
      date: today,
      whatWorked: whatWorked.trim(),
      obstacleChanged: obstacleChanged === null ? null : obstacleChanged === 'yes',
      planNeedsFix: planNeedsFix === null ? null : planNeedsFix === 'yes',
      decision: chosen,
      version: woop.version,
    });
    const reviewDate = nextReviewDate(today, woop.timeframe);
    await woopRepository.save({ ...woop, reviewDate });
    if (chosen === 'finish') {
      navigate(`/woop/${woop.id}/close`, { replace: true });
      return;
    }
    const target = editTargetFor(chosen);
    if (target) {
      const reset = target.reset ? `&reset=${target.reset}` : '';
      navigate(`/wizard/${woop.id}?edit=${target.step}&reason=${target.reason}${reset}`, { replace: true });
      return;
    }
    navigate(`/woop/${woop.id}`, {
      replace: true,
      state: { message: t(r.saved, { date: formatLongDate(reviewDate, pl.locale) }) },
    });
  };

  const yesNo = [
    { value: 'yes' as const, label: r.yes },
    { value: 'no' as const, label: r.no },
  ];

  return (
    <div className="flex flex-col gap-6">
      <FocusHeader label={woop.wish.short || woop.wish.text} closeTo={`/woop/${woop.id}`} />
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">{r.title}</h1>
        <p className="text-lg text-muted">{r.intro}</p>
      </header>
      <Notice>{t(r.lastWeek, { used: recent.used, total: recent.total, checkins: checkinDays })}</Notice>
      <PlanCard woop={woop} label={pl.summary.full.plan} />
      <form
        noValidate
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <TextArea
          label={r.whatWorked}
          placeholder={r.whatWorkedPlaceholder}
          value={whatWorked}
          onValueChange={setWhatWorked}
          rows={2}
        />
        <ChipGroup<YesNo>
          legend={r.obstacleChanged}
          options={yesNo}
          value={obstacleChanged}
          onChange={setObstacleChanged}
        />
        <ChipGroup<YesNo> legend={r.planNeedsFix} options={yesNo} value={planNeedsFix} onChange={setPlanNeedsFix} />
        <ChipGroup<ReviewDecision>
          legend={r.decision}
          layout="list"
          options={DECISIONS.map((value) => ({
            value,
            label: r.decisions[value].label,
            hint: r.decisions[value].hint,
          }))}
          value={chosen}
          onChange={setDecision}
          error={showRequired && !chosen ? pl.common.requiredChoice : undefined}
        />
        {chosen && editTargetFor(chosen) && <p className="text-sm text-muted">{r.versionNote}</p>}
        <div>
          <Button type="submit" size="lg">
            {r.save}
          </Button>
        </div>
      </form>
    </div>
  );
}
