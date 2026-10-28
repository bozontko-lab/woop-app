import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, NavigationType, useBlocker, useNavigate, useParams, useSearchParams } from 'react-router';
import { WoopNotFound } from '../../app/errors';
import { useDocumentTitle } from '../../app/useDocumentTitle';
import { pl } from '../../content/pl';
import { t } from '../../content/t';
import { Loading } from '../../components/ui/Loading';
import { requestPersistentStorage, woopRepository } from '../../data';
import { useSettings } from '../../data/hooks';
import { fingerprint } from '../../domain/text/normalize';
import { STEP_IDS, type Nudge, type StepId, type Woop } from '../../domain/types';
import { validateStep } from '../../domain/validators';
import { getStep, nextStepId, phaseProgress, prevStepId, resolveStep } from '../../domain/wizard/engine';
import { activateWoop, releaseWoop } from '../../domain/wizard/lifecycle';
import type { StepDef } from '../../domain/wizard/steps';
import { getText, isTextField, setText } from '../../domain/woop';
import { NudgePanel, type NudgeActions } from './NudgePanel';
import { QuestionHelp } from './QuestionHelp';
import { StepBody } from './StepBody';
import { StepLayout } from './StepLayout';
import { realismBand, type RealismBand } from './steps/RealismStep';
import { templateParams } from './templateParams';
import type { UpdateWoop } from './types';
import { useAutosave } from './useAutosave';

const isStepId = (value: string | null): value is StepId =>
  value !== null && (STEP_IDS as readonly string[]).includes(value);

export function WizardPage() {
  const { id = '' } = useParams();
  const [searchParams] = useSearchParams();
  const [loaded, setLoaded] = useState<{ id: string; woop: Woop | null } | null>(null);

  // Read once: the session owns the state afterwards (no live re-sync while typing).
  useEffect(() => {
    let active = true;
    void woopRepository
      .recover()
      .then(() => woopRepository.get(id))
      .then((woop) => {
        if (active) setLoaded({ id, woop: woop ?? null });
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (!loaded || loaded.id !== id) return <Loading />;
  const initial = loaded.woop;
  if (!initial) return <WoopNotFound />;
  const edit = searchParams.get('edit');
  const editStep = initial.status === 'active' && isStepId(edit) ? edit : null;
  if (initial.status !== 'draft' && !editStep) return <Navigate to={`/woop/${initial.id}`} replace />;
  return <WizardSession key={`${initial.id}:${editStep ?? 'draft'}`} initial={initial} editStep={editStep} />;
}

function canSkip(step: StepDef, woop: Woop): boolean {
  switch (step.id) {
    case 'start-area':
      return woop.area === null;
    case 'outcome-deeper':
      return woop.outcome.deeper.every((d) => !d.trim());
    case 'obstacle-type':
      return woop.obstacle.type === null;
    case 'obstacle-context':
      return !woop.obstacle.when.trim() && !woop.obstacle.where.trim() && !woop.obstacle.time;
    case 'plan-backup':
      return !woop.plan.backupPlan.trim();
    default:
      return false;
  }
}

const CUSTOM_ACTIONS = new Set<StepDef['kind']>(['visualize', 'release', 'rehearse']);

function WizardSession({ initial, editStep }: { initial: Woop; editStep: StepId | null }) {
  const navigate = useNavigate();
  const settings = useSettings();
  const editing = editStep !== null;
  const mode = initial.mode;

  const woopRef = useRef(initial);
  const [woop, setWoop] = useState(initial);
  const [stepId, setStepId] = useState<StepId>(() => resolveStep(mode, editStep ?? initial.wizard?.stepId, initial));
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [nudgeTotal, setNudgeTotal] = useState(0);
  const [realismPanel, setRealismPanel] = useState<RealismBand | null>(null);
  const [showRequired, setShowRequired] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>(initial.wizard?.dismissed ?? []);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const fieldRef = useRef<HTMLElement | null>(null);
  const shownStep = useRef(stepId);
  const { schedule, flush, error: saveError } = useAutosave(woopRef);

  const step = getStep(stepId);
  const content = pl.steps[stepId];
  const params = templateParams(woop);
  const title = t(content.title, params);
  useDocumentTitle(title);

  const update = useCallback<UpdateWoop>(
    (fn) => {
      const next = fn(woopRef.current);
      woopRef.current = next;
      setWoop(next);
      schedule();
    },
    [schedule],
  );

  const goTo = useCallback(
    (target: StepId) => {
      setNudges([]);
      setRealismPanel(null);
      setShowRequired(false);
      setStepId(target);
      if (!editing) update((w) => ({ ...w, wizard: { stepId: target, dismissed: w.wizard?.dismissed ?? [] } }));
    },
    [editing, update],
  );

  // New step: start at the top and move focus to its question for screen readers and keyboards.
  useEffect(() => {
    if (shownStep.current === stepId) return;
    shownStep.current = stepId;
    window.scrollTo({ top: 0 });
    headingRef.current?.focus();
  }, [stepId]);

  const focusField = () => requestAnimationFrame(() => fieldRef.current?.focus());

  const saveAndGo = useCallback(
    async (next: Woop, to: string) => {
      woopRef.current = next;
      setWoop(next);
      schedule();
      await flush();
      navigate(to, { replace: true });
    },
    [flush, navigate, schedule],
  );

  const finish = useCallback(() => {
    if (editing) {
      void saveAndGo(woopRef.current, `/woop/${woopRef.current.id}`);
      return;
    }
    const active = activateWoop(woopRef.current, new Date().toISOString(), pl.lexicon);
    void requestPersistentStorage();
    void saveAndGo(active, `/woop/${active.id}?created=1`);
  }, [editing, saveAndGo]);

  const release = useCallback(
    (reflection: string) => {
      const released = releaseWoop(woopRef.current, reflection, new Date().toISOString());
      void saveAndGo(released, `/woop/${released.id}`);
    },
    [saveAndGo],
  );

  const advance = useCallback(() => {
    const next = nextStepId(mode, stepId);
    if (next) goTo(next);
    else finish();
  }, [mode, stepId, goTo, finish]);

  const leave = useCallback(async () => {
    await flush();
    navigate(editing ? `/woop/${woopRef.current.id}` : '/');
  }, [editing, flush, navigate]);

  const back = useCallback(() => {
    const previous = prevStepId(mode, stepId);
    if (previous) goTo(previous);
    else void leave();
  }, [mode, stepId, goTo, leave]);

  // The phone's back button goes one step back instead of leaving the wizard.
  const blocker = useBlocker(
    ({ historyAction }) => historyAction === NavigationType.Pop && prevStepId(mode, stepId) !== null,
  );
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    blocker.reset();
    // Reacting to the router (an external system) is what this effect is for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    back();
  }, [blocker, back]);

  const fieldValue = (nudge: Nudge): string => {
    const current = woopRef.current;
    if (nudge.field === 'wish.importance') return String(current.wish.importance);
    if (nudge.field === 'realism') return String(current.realism);
    return isTextField(nudge.field) ? getText(current, nudge.field) : '';
  };
  const nudgeKey = (nudge: Nudge) => `${nudge.code}:${fingerprint(fieldValue(nudge))}`;

  const handleNext = () => {
    const current = woopRef.current;
    if (!step.isComplete(current)) {
      setShowRequired(true);
      focusField();
      return;
    }
    setShowRequired(false);
    if (step.kind === 'realism') {
      const band = realismBand(current.realism ?? 10);
      if (band === 'high') advance();
      else setRealismPanel(band);
      return;
    }
    const pending = validateStep(stepId, current, pl.lexicon).filter((nudge) => !dismissed.includes(nudgeKey(nudge)));
    if (pending.length > 0) {
      setNudges(pending);
      setNudgeTotal(pending.length);
      return;
    }
    advance();
  };

  const keep = (nudge: Nudge) => {
    const key = nudgeKey(nudge);
    setDismissed((list) => (list.includes(key) ? list : [...list, key]));
    if (!editing) {
      update((w) => ({
        ...w,
        wizard: { stepId: w.wizard?.stepId ?? stepId, dismissed: [...new Set([...(w.wizard?.dismissed ?? []), key])] },
      }));
    }
    const rest = nudges.slice(1);
    setNudges(rest);
    if (rest.length === 0) advance();
  };

  const actions: NudgeActions = {
    onApply: (nudge, suggestion) => {
      if (isTextField(nudge.field)) update((w) => setText(w, nudge.field as Parameters<typeof setText>[1], suggestion));
      setNudges([]);
      focusField();
    },
    onChoose: (nudge, option) => {
      const others = (nudge.options ?? []).filter((o) => o !== option);
      update((w) => ({
        ...w,
        obstacle: { ...w.obstacle, text: option, short: '' },
        parkedObstacles: [...new Set([...w.parkedObstacles, ...others])],
      }));
      setNudges([]);
      focusField();
    },
    onSplit: (nudge) => {
      const [ifText = '', thenText = ''] = nudge.options ?? [];
      update((w) => ({ ...w, plan: { ...w.plan, ifText, thenText } }));
      setNudges([]);
      focusField();
    },
    onEdit: () => {
      setNudges([]);
      focusField();
    },
    onKeep: keep,
    onChangeWish: () => goTo('wish-text'),
  };

  const skip =
    step.optional && canSkip(step, woop)
      ? { label: stepId === 'outcome-deeper' ? pl.deeper.skip : pl.common.skip, onSkip: advance }
      : null;
  const returnToSummary = editing
    ? () => {
        if (!step.isComplete(woopRef.current)) {
          setShowRequired(true);
          focusField();
          return;
        }
        void saveAndGo(woopRef.current, `/woop/${woopRef.current.id}`);
      }
    : undefined;

  return (
    <StepLayout
      key={stepId}
      progress={phaseProgress(mode, stepId)}
      title={title}
      subtitle={content.subtitle ? t(content.subtitle, params) : undefined}
      headingRef={headingRef}
      editing={editing}
      saveError={saveError}
      onClose={() => void leave()}
      onBack={back}
      onSubmit={handleNext}
      showNext={!CUSTOM_ACTIONS.has(step.kind) && !(step.kind === 'realism' && realismPanel)}
      nextLabel={step.kind === 'intro' ? pl.intro.start : pl.common.next}
      skip={skip}
      onReturnToSummary={returnToSummary}
      help={<QuestionHelp why={content.why} help={content.help} examples={content.examples} params={params} />}
      nudges={
        nudges[0] && <NudgePanel nudge={nudges[0]} index={nudgeTotal - nudges.length} total={nudgeTotal} {...actions} />
      }
    >
      <StepBody
        step={step}
        woop={woop}
        update={update}
        registerField={(element) => {
          fieldRef.current = element;
        }}
        showRequired={showRequired}
        params={params}
        settings={settings}
        editing={editing}
        advance={advance}
        goTo={goTo}
        finish={finish}
        realismPanel={realismPanel}
        onRealismChange={() => setRealismPanel(null)}
        onRelease={release}
      />
    </StepLayout>
  );
}
