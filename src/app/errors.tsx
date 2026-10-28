import { pl } from '../content/pl';
import { ButtonLink } from '../components/ui/Button';
import { useDocumentTitle } from './useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle(pl.errors.notFoundTitle);
  return (
    <section className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-bold">{pl.errors.notFoundTitle}</h1>
      <p className="text-muted">{pl.errors.notFoundBody}</p>
      <ButtonLink to="/">{pl.errors.backHome}</ButtonLink>
    </section>
  );
}

export function WoopNotFound() {
  return (
    <section className="flex flex-col items-start gap-4 py-6">
      <h1 className="text-2xl font-bold">{pl.errors.notFoundTitle}</h1>
      <p className="text-muted">{pl.errors.woopNotFound}</p>
      <ButtonLink to="/">{pl.errors.backHome}</ButtonLink>
    </section>
  );
}

export function RouteError() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-start gap-4 px-4 py-10">
      <h1 className="text-2xl font-bold">{pl.errors.generic}</h1>
      <a href="/" className="font-semibold text-primary underline">
        {pl.errors.backHome}
      </a>
    </main>
  );
}
