import { woopRepository } from '../../data';
import type { Woop, WoopMode } from '../../domain/types';

/** Creates a draft, optionally pre-filled, and returns the wizard URL. */
export async function startDraft(prefill?: (draft: Woop) => Woop, mode: WoopMode = 'full'): Promise<string> {
  const draft = await woopRepository.createDraft(mode);
  if (prefill) await woopRepository.save(prefill(draft));
  return `/wizard/${draft.id}`;
}
