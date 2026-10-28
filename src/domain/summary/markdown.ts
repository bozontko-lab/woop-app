import { pl } from '../../content/pl';
import { t } from '../../content/t';
import type { Woop } from '../types';
import { backupSentence, createdDate, describeTimeframe, planSentence } from './format';

const escape = (text: string) => text.replace(/([\\`*_[\]#|])/gu, '\\$1');

export function buildMarkdown(woop: Woop): string {
  const s = pl.summary;
  const x = pl.exportText;
  const value = (text: string) => (text.trim() ? escape(text.trim()) : s.full.empty);
  const lines: string[] = [
    `# ${t(x.mdTitle, { value: value(woop.wish.short || woop.wish.text) })}`,
    '',
    `## ${x.mdCard}`,
    '',
    `- **${s.labels.wish}:** ${value(woop.wish.short)}`,
    `- **${s.labels.outcome}:** ${value(woop.outcome.short)}`,
    `- **${s.labels.obstacle}:** ${value(woop.obstacle.short)}`,
    `- **${s.labels.plan}:** ${value(planSentence(woop.plan))}`,
    '',
    `## ${x.mdDetails}`,
    '',
    `### ${s.full.wish}`,
    '',
    value(woop.wish.text),
    '',
    `**${s.full.success}:** ${value(woop.wish.successCriterion)}`,
    '',
    `### ${s.full.outcome}`,
    '',
    value(woop.outcome.text),
  ];
  for (const answer of woop.outcome.deeper.filter((d) => d.trim())) {
    lines.push('', `**${s.full.deeper}** ${escape(answer.trim())}`);
  }
  lines.push('', `### ${s.full.obstacle}`, '', value(woop.obstacle.text), '');
  if (woop.obstacle.type) lines.push(`- **${s.full.type}:** ${pl.obstacleTypes[woop.obstacle.type].label}`);
  if (woop.obstacle.when.trim()) lines.push(`- **${s.full.when}:** ${escape(woop.obstacle.when.trim())}`);
  if (woop.obstacle.where.trim()) lines.push(`- **${s.full.where}:** ${escape(woop.obstacle.where.trim())}`);
  if (woop.obstacle.time) lines.push(`- **${s.full.time}:** ${woop.obstacle.time}`);
  lines.push('', `### ${s.full.plan}`, '', value(planSentence(woop.plan)));
  const backup = backupSentence(woop.plan);
  if (backup) lines.push('', `**${s.full.backup}:** ${escape(backup)}`);
  if (woop.parkedObstacles.length) {
    lines.push('', `### ${s.full.parked}`, '', ...woop.parkedObstacles.map((o) => `- ${escape(o)}`));
  }
  lines.push(
    '',
    `## ${x.mdMeta}`,
    '',
    `- **${s.meta.timeframe}:** ${describeTimeframe(woop.timeframe)}`,
    `- **${s.meta.created}:** ${createdDate(woop)}`,
  );
  if (woop.wish.importance !== null)
    lines.push(`- **${s.meta.importance}:** ${t(pl.common.scale, { value: woop.wish.importance })}`);
  if (woop.realism !== null) lines.push(`- **${s.meta.realism}:** ${t(pl.common.scale, { value: woop.realism })}`);
  if (woop.area) lines.push(`- **${s.full.area}:** ${pl.areas[woop.area].label}`);
  lines.push(`- **${x.statusLabel}:** ${pl.statuses[woop.status]}`, '', '---', '', `_${x.footer}_`, '');
  return lines.join('\n');
}
