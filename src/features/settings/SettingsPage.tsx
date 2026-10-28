import { useDocumentTitle } from '../../app/useDocumentTitle';
import { setThemePreference, useThemePreference, type ThemePreference } from '../../app/theme';
import { pl } from '../../content/pl';
import { t } from '../../content/t';
import { ChipGroup } from '../../components/ui/ChipGroup';
import { PAUSE_OPTIONS, settingsRepository, type PauseSeconds } from '../../data';
import { useSettings } from '../../data/hooks';
import { NotificationsToggle } from '../reminders/NotificationsToggle';
import { BackupSection } from './BackupSection';

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5">
      <h2 id={id} className="text-xl font-bold">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function SettingsPage() {
  const s = pl.settings;
  const theme = useThemePreference();
  const settings = useSettings();
  useDocumentTitle(s.title);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">{s.title}</h1>

      <Section id="appearance-title" title={s.theme.label}>
        <ChipGroup<ThemePreference>
          legend={s.theme.label}
          legendHidden
          options={[
            { value: 'system', label: s.theme.system },
            { value: 'light', label: s.theme.light },
            { value: 'dark', label: s.theme.dark },
          ]}
          value={theme}
          onChange={setThemePreference}
        />
      </Section>

      <Section id="pause-title" title={s.pause.label}>
        <p className="text-muted">{s.pause.hint}</p>
        <ChipGroup
          legend={s.pause.label}
          legendHidden
          options={PAUSE_OPTIONS.map((value) => ({ value: String(value), label: t(pl.pause.seconds, { n: value }) }))}
          value={String(settings.pauseSeconds)}
          onChange={(value) => void settingsRepository.update({ pauseSeconds: Number(value) as PauseSeconds })}
        />
        <div className="flex min-h-11 items-start gap-3 pt-2">
          <input
            id="chime"
            type="checkbox"
            checked={settings.chime}
            onChange={(event) => void settingsRepository.update({ chime: event.target.checked })}
            className="mt-0.5 size-5 shrink-0 accent-[var(--primary)]"
            aria-describedby="chime-hint"
          />
          <div>
            <label htmlFor="chime" className="block font-semibold">
              {s.chime.label}
            </label>
            <p id="chime-hint" className="text-sm text-muted">
              {s.chime.hint}
            </p>
          </div>
        </div>
      </Section>

      <Section id="backup-title" title={pl.backup.title}>
        <BackupSection />
      </Section>

      <Section id="notifications-title" title={pl.reminders.notifications.title}>
        <NotificationsToggle showTitle={false} />
      </Section>

      <Section id="privacy-title" title={s.privacy.title}>
        <p>{s.privacy.body}</p>
      </Section>

      <Section id="about-title" title={s.about.title}>
        <p>{t(s.about.version, { version: __APP_VERSION__ })}</p>
        <p className="text-muted">
          {s.about.method}{' '}
          <a
            href={pl.app.methodUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary underline"
          >
            {pl.app.methodUrlLabel}
          </a>
        </p>
      </Section>
    </div>
  );
}
