import {
  Binoculars,
  BookOpenText,
  CaretDown,
  ChatText,
  Database,
  House,
  MapTrifold,
  UsersThree,
  X,
  type IconProps,
} from "@phosphor-icons/react";
import { useState, type ComponentType } from "react";
import type { ViewId } from "../types";

interface NavItem {
  id: ViewId;
  label: string;
  description: string;
  icon: ComponentType<IconProps>;
}

interface NavGroup {
  id: "prospecting" | "pipeline";
  label: string;
  icon: ComponentType<IconProps>;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: "prospecting",
    label: "Prospecting",
    icon: Binoculars,
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        description: "Today's work queue",
        icon: House,
      },
      {
        id: "guide",
        label: "Guide",
        description: "How Kuri works",
        icon: BookOpenText,
      },
      {
        id: "discover",
        label: "Discover",
        description: "Find businesses",
        icon: Binoculars,
      },
      {
        id: "maps",
        label: "Maps searches",
        description: "Queries and area sweeps",
        icon: MapTrifold,
      },
    ],
  },
  {
    id: "pipeline",
    label: "Pipeline",
    icon: Database,
    items: [
      {
        id: "tracker",
        label: "Leads",
        description: "Qualify and follow up",
        icon: UsersThree,
      },
      {
        id: "templates",
        label: "Templates",
        description: "Outreach messages",
        icon: ChatText,
      },
    ],
  },
];

interface SidebarProps {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  activeView,
  onNavigate,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const [openGroups, setOpenGroups] = useState<Set<NavGroup["id"]>>(
    () => new Set(["prospecting", "pipeline"]),
  );

  function toggleGroup(groupId: NavGroup["id"]) {
    setOpenGroups((current) => {
      const next = new Set(current);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-20 bg-ink/40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-[17rem] flex-col border-r border-white/10 bg-ink transition-transform duration-200 lg:static lg:z-0 lg:h-full lg:w-64 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4 lg:hidden">
          <p className="text-sm font-semibold text-on-ink">Menu</p>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation"
            className="grid size-10 place-items-center rounded-lg text-on-ink/70 transition-colors hover:bg-white/10 hover:text-on-ink"
          >
            <X size={20} weight="bold" aria-hidden />
          </button>
        </div>

        <nav
          className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-3 lg:pt-5"
          aria-label="Main navigation"
        >
          {NAV_GROUPS.map((group) => {
            const expanded = openGroups.has(group.id);
            const GroupIcon = group.icon;
            return (
              <section key={group.id}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={expanded}
                  aria-controls={`nav-group-${group.id}`}
                  className="flex min-h-11 w-full items-center gap-2 rounded-lg px-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-on-ink/45 transition-colors hover:bg-white/[0.06] hover:text-on-ink/75"
                >
                  <GroupIcon size={15} weight="bold" aria-hidden />
                  <span className="flex-1">{group.label}</span>
                  <CaretDown
                    size={14}
                    weight="bold"
                    className={`transition-transform duration-200 ${
                      expanded ? "rotate-0" : "-rotate-90"
                    }`}
                    aria-hidden
                  />
                </button>

                <div
                  id={`nav-group-${group.id}`}
                  className={`grid transition-[grid-template-rows,opacity] duration-200 ${
                    expanded
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-60"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-1 pb-2 pt-1">
                      {group.items.map((item) => {
                        const active = activeView === item.id;
                        const ItemIcon = item.icon;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              onNavigate(item.id);
                              onCloseMobile();
                            }}
                            aria-current={active ? "page" : undefined}
                            className={`group relative flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left transition-colors duration-200 ${
                              active
                                ? "bg-accent text-on-accent"
                                : "text-on-ink/70 hover:bg-white/[0.08] hover:text-on-ink"
                            }`}
                          >
                            <span
                              className={`grid size-8 shrink-0 place-items-center rounded-lg transition-colors ${
                                active
                                  ? "bg-white/15"
                                  : "bg-white/[0.06] group-hover:bg-white/10"
                              }`}
                            >
                              <ItemIcon size={18} weight="bold" aria-hidden />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold">
                                {item.label}
                              </span>
                              <span
                                className={`block truncate text-[10px] ${
                                  active ? "text-white/70" : "text-on-ink/40"
                                }`}
                              >
                                {item.description}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-white/10 p-3">
          <div className="flex items-center gap-2.5 rounded-lg bg-white/[0.04] px-3 py-2.5">
            <Database size={16} weight="bold" className="text-gold" aria-hidden />
            <p className="text-[11px] leading-4 text-on-ink/50">
              Private, local-first data
              <span className="block text-on-ink/35">Saved in this browser</span>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
