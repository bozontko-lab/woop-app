import { pl } from '../../../content/pl';
import { t } from '../../../content/t';
import { ChipGroup } from '../../../components/ui/ChipGroup';
import { TextInput } from '../../../components/ui/Field';
import { formatShortDate, todayISO } from '../../../domain/dates';
import { computeTimeframe, isTimeframeValid } from '../../../domain/timeframe';
import { TIMEFRAME_TYPES, type TimeframeType } from '../../../domain/types';
import type { StepProps } from '../types';

export function TimeframeStep({ woop, update, showRequired, registerField }: StepProps) {
  const today = todayISO();
  const current = woop.timeframe;
  const options = TIMEFRAME_TYPES.map((type) => {
    const content = pl.timeframes[type];
    const end = computeTimeframe(type, today).endDate;
    return {
      value: type,
      label: content.label,
      hint: type === 'date' ? content.hint : t(content.hint, { date: formatShortDate(end, pl.locale) }),
    };
  });

  const choose = (type: TimeframeType) =>
    update((w) => ({
      ...w,
      timeframe: computeTimeframe(
        type,
        today,
        type === 'date' && w.timeframe?.type === 'date' ? w.timeframe.endDate : undefined,
      ),
    }));

  return (
    <div className="flex flex-col gap-4" ref={(el) => registerField(el?.querySelector('input') ?? null)}>
      <ChipGroup
        legend={pl.steps['start-timeframe'].title}
        legendHidden
        layout="list"
        options={options}
        value={current?.type ?? null}
        onChange={choose}
        error={showRequired && !current ? pl.common.requiredChoice : undefined}
      />
      {current?.type === 'date' && (
        <TextInput
          type="date"
          label={pl.timeframeDateLabel}
          min={today}
          value={current.endDate}
          onValueChange={(endDate) => update((w) => ({ ...w, timeframe: { type: 'date', startDate: today, endDate } }))}
          error={showRequired && !isTimeframeValid(current) ? pl.timeframeDateError : undefined}
        />
      )}
    </div>
  );
}
