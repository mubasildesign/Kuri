import { Buildings, List, MapPin, SignOut, X } from "@phosphor-icons/react";
import { useAuth } from "../hooks/AuthProvider";

interface HeaderProps {
  cities: string[];
  activeCity: string;
  onActiveCityChange: (city: string) => void;
  onManageCities: () => void;
  mobileNavOpen: boolean;
  onToggleMobileNav: () => void;
}

export function Header({
  cities,
  activeCity,
  onActiveCityChange,
  onManageCities,
  mobileNavOpen,
  onToggleMobileNav,
}: HeaderProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="z-40 flex shrink-0 items-center gap-2 border-b border-border bg-surface/95 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3">
      <button
        type="button"
        onClick={onToggleMobileNav}
        aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={mobileNavOpen}
        className="grid size-10 shrink-0 place-items-center rounded-lg text-ink transition-colors hover:bg-surface-muted lg:hidden"
      >
        {mobileNavOpen ? (
          <X size={22} weight="bold" aria-hidden />
        ) : (
          <List size={22} weight="bold" aria-hidden />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="m-0 flex min-w-0 flex-col gap-0.5">
          <img
            src="/kuri-logo.jpg"
            alt="Kuri"
            className="h-8 w-auto object-contain object-left sm:h-[2.65rem]"
          />
          <span className="hidden text-xs font-normal text-muted sm:block sm:text-sm">
            Research, qualify, and convert local businesses
          </span>
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <label className="flex h-10 max-w-[9.5rem] items-center gap-1.5 rounded-lg border border-border bg-page px-2 text-sm text-muted sm:max-w-none sm:gap-2 sm:px-2.5">
          <MapPin
            size={16}
            weight="fill"
            className="shrink-0 text-accent"
            aria-hidden
          />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap sm:font-medium sm:text-ink">
            Active city
          </span>
          <select
            value={activeCity}
            onChange={(e) => onActiveCityChange(e.target.value)}
            aria-label="Active city"
            className="min-w-0 flex-1 truncate border-0 bg-transparent py-0 text-sm font-semibold text-ink outline-none"
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={onManageCities}
          aria-label="Manage cities"
          title="Manage cities"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-2.5 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent sm:px-3"
        >
          <Buildings size={18} weight="bold" aria-hidden />
          <span className="hidden sm:inline">Manage cities</span>
        </button>

        {user && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span
              className="grid size-8 place-items-center rounded-full bg-surface-muted text-xs font-semibold text-ink"
              title={user.name}
            >
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <button
              type="button"
              onClick={() => void signOut()}
              aria-label={`Sign out ${user.name}`}
              title={`Sign out (${user.email || user.name})`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-2.5 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent sm:px-3"
            >
              <SignOut size={18} weight="bold" aria-hidden />
              <span className="hidden md:inline">Sign out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
