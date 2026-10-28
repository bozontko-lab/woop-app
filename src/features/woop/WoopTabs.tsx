import { NavLink } from 'react-router';
import { pl } from '../../content/pl';
import { cx } from '../../components/ui/cx';

/** Sub-navigation between a WOOP's card, progress and reminders. */
export function WoopTabs({ woopId }: { woopId: string }) {
  const links = [
    { to: `/woop/${woopId}`, label: pl.nav.woopCard, end: true },
    { to: `/woop/${woopId}/progress`, label: pl.nav.woopProgress, end: false },
    { to: `/woop/${woopId}/next`, label: pl.nav.woopReminders, end: false },
  ];
  return (
    <nav aria-label={pl.nav.woopNav}>
      <ul className="grid grid-cols-3 gap-1 rounded-xl bg-surface-2 p-1">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cx(
                  'flex min-h-11 items-center justify-center rounded-lg px-2 text-center text-sm font-semibold',
                  isActive ? 'bg-surface text-fg shadow-sm' : 'text-muted hover:text-fg',
                )
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
