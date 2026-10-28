export function canShareFile(file: File): boolean {
  return typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });
}

export async function shareFile(file: File, title: string): Promise<'shared' | 'cancelled' | 'failed'> {
  try {
    await navigator.share({ files: [file], title });
    return 'shared';
  } catch (error) {
    return error instanceof DOMException && error.name === 'AbortError' ? 'cancelled' : 'failed';
  }
}
