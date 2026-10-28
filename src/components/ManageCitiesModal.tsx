import { useState, type FormEvent } from "react";

interface ManageCitiesModalProps {
  cities: string[];
  activeCity: string;
  onClose: () => void;
  onAdd: (name: string) => void;
  onRename: (oldName: string, newName: string) => void;
  onRemove: (name: string) => void;
}

export function ManageCitiesModal({
  cities,
  activeCity,
  onClose,
  onAdd,
  onRename,
  onRemove,
}: ManageCitiesModalProps) {
  const [newCity, setNewCity] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    const trimmed = newCity.trim();
    if (!trimmed) return;
    if (cities.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      alert("That city already exists.");
      return;
    }
    onAdd(trimmed);
    setNewCity("");
  }

  function startRename(city: string) {
    setEditing(city);
    setEditValue(city);
  }

  function commitRename() {
    if (!editing) return;
    const trimmed = editValue.trim();
    if (!trimmed) {
      setEditing(null);
      return;
    }
    if (
      trimmed !== editing &&
      cities.some((c) => c.toLowerCase() === trimmed.toLowerCase())
    ) {
      alert("That city already exists.");
      return;
    }
    onRename(editing, trimmed);
    setEditing(null);
  }

  function handleRemove(city: string) {
    if (cities.length <= 1) {
      alert("Keep at least one city.");
      return;
    }
    if (
      !confirm(
        `Remove "${city}"? Leads in this city will keep their city name but the city will disappear from filters.`,
      )
    ) {
      return;
    }
    onRemove(city);
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-[0_2px_16px_rgba(1,25,54,0.08)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="manage-cities-title"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="manage-cities-title"
            className="text-lg font-semibold text-ink"
          >
            Manage cities
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-muted hover:bg-surface-muted"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleAdd} className="mb-4 flex gap-2">
          <input
            value={newCity}
            onChange={(e) => setNewCity(e.target.value)}
            placeholder="Add a city…"
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-on-accent hover:bg-accent-hover"
          >
            Add
          </button>
        </form>

        <ul className="max-h-72 space-y-2 overflow-y-auto">
          {cities.map((city) => (
            <li
              key={city}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
            >
              {editing === city ? (
                <>
                  <input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename();
                      if (e.key === "Escape") setEditing(null);
                    }}
                    className="flex-1 rounded border border-border px-2 py-1 text-sm outline-none focus:border-accent"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={commitRename}
                    className="text-sm text-accent hover:underline"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium text-ink">
                    {city}
                    {city === activeCity && (
                      <span className="ml-2 text-xs font-normal text-accent">
                        (active)
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => startRename(city)}
                    className="text-sm text-muted hover:text-accent"
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(city)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
