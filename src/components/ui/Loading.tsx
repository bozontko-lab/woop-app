import { pl } from '../../content/pl';

export function Loading() {
  return (
    <p role="status" className="py-16 text-center text-muted">
      {pl.common.loading}
    </p>
  );
}
