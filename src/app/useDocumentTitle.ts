import { useEffect } from 'react';
import { pl } from '../content/pl';

export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${pl.app.name}` : pl.app.name;
  }, [title]);
}
