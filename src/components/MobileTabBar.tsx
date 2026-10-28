import {
  Binoculars,
  ChatText,
  House,
  MapTrifold,
  UsersThree,
  type IconProps,
} from "@phosphor-icons/react";
import type { ComponentType } from "react";
import type { ViewId } from "../types";

interface TabItem {
  id: ViewId;
  label: string;
  icon: ComponentType<IconProps>;
}

const TABS: TabItem[] = [
  { id: "dashboard", label: "Home", icon: House },
  { id: "discover", label: "Discover", icon: Binoculars },
  { id: "maps", label: "Maps", icon: MapTrifold },
  { id: "tracker", label: "Leads", icon: UsersThree },
  { id: "templates", label: "Templates", icon: ChatText },
];

interface MobileTabBarProps {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
}

export function MobileTabBar({ activeView, onNavigate }: MobileTabBarProps) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <div className="grid grid-cols-5">
        {TABS.map((tab) => {
          const active = activeView === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(tab.id)}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 px-1 pt-1.5 text-[10px] font-semibold transition-colors ${
                active ? "text-accent" : "text-muted hover:text-ink"
              }`}
            >
              <Icon
                size={22}
                weight={active ? "fill" : "bold"}
                aria-hidden
              />
              <span className="leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
