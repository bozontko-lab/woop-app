import { Copy, FileJson, FileText, Image, Printer, Share2, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { pl } from '../../content/pl';
import { t } from '../../content/t';
import { Button } from '../../components/ui/Button';
import { LiveMessage } from '../../components/ui/Notice';
import { buildCardData } from '../../domain/card/data';
import type { CardFormat } from '../../domain/card/layout';
import { exportFileName } from '../../domain/summary/format';
import { buildJsonExport } from '../../domain/summary/json';
import { buildMarkdown } from '../../domain/summary/markdown';
import { buildPlainText } from '../../domain/summary/text';
import type { Woop } from '../../domain/types';
import { renderCardPng } from '../../lib/cardCanvas';
import { copyText } from '../../lib/clipboard';
import { downloadBlob, downloadText } from '../../lib/download';
import { canShareFile, shareFile } from '../../lib/share';

const icon = 'size-5';

export function ExportPanel({ woop }: { woop: Woop }) {
  const s = pl.summary;
  const [message, setMessage] = useState<string | null>(null);
  const shareSupported = typeof navigator.canShare === 'function';

  const say = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage((current) => (current === text ? null : current)), 4000);
  };

  const copy = async () => say((await copyText(buildPlainText(woop))) ? s.copied : s.copyFailed);

  const png = async (format: CardFormat) => {
    const name = exportFileName(woop, 'png', format === 'story' ? '9x16' : '1x1');
    downloadBlob(await renderCardPng(buildCardData(woop), format), name);
    say(t(s.downloaded, { name }));
  };

  const share = async () => {
    const name = exportFileName(woop, 'png', '9x16');
    const file = new File([await renderCardPng(buildCardData(woop), 'story')], name, { type: 'image/png' });
    if (!canShareFile(file) || (await shareFile(file, pl.app.name)) === 'failed') {
      downloadBlob(file, name);
      say(t(s.downloaded, { name }));
    }
  };

  const text = (kind: 'md' | 'json') => {
    const name = exportFileName(woop, kind);
    if (kind === 'md') downloadText(buildMarkdown(woop), name, 'text/markdown');
    else downloadText(buildJsonExport(woop, new Date().toISOString()), name, 'application/json');
    say(t(s.downloaded, { name }));
  };

  return (
    <section aria-labelledby="export-title" className="flex flex-col gap-3">
      <h2 id="export-title" className="text-xl font-bold">
        {s.exportTitle}
      </h2>
      <div className="grid gap-2 sm:grid-cols-2">
        <Button variant="secondary" onClick={() => void copy()} icon={<Copy aria-hidden="true" className={icon} />}>
          {s.copyText}
        </Button>
        <Button
          variant="secondary"
          onClick={() => window.print()}
          icon={<Printer aria-hidden="true" className={icon} />}
        >
          {s.print}
        </Button>
        <Button
          variant="secondary"
          onClick={() => void png('story')}
          icon={<Smartphone aria-hidden="true" className={icon} />}
          aria-describedby="png-story-hint"
        >
          {s.pngStory}
        </Button>
        <Button
          variant="secondary"
          onClick={() => void png('square')}
          icon={<Image aria-hidden="true" className={icon} />}
        >
          {s.pngSquare}
        </Button>
        {shareSupported && (
          <Button
            variant="secondary"
            onClick={() => void share()}
            icon={<Share2 aria-hidden="true" className={icon} />}
          >
            {s.share}
          </Button>
        )}
        <Button variant="secondary" onClick={() => text('md')} icon={<FileText aria-hidden="true" className={icon} />}>
          {s.markdown}
        </Button>
        <Button
          variant="secondary"
          onClick={() => text('json')}
          icon={<FileJson aria-hidden="true" className={icon} />}
        >
          {s.json}
        </Button>
      </div>
      <p id="png-story-hint" className="text-sm text-muted">
        {s.pngStoryHint} {s.printHint}
      </p>
      <LiveMessage message={message} />
    </section>
  );
}
