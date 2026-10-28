import { useCallback, useEffect, useRef, useState } from "react";
import { Header } from "./components/Header";
import { ManageCitiesModal } from "./components/ManageCitiesModal";
import { MobileTabBar } from "./components/MobileTabBar";
import { Sidebar } from "./components/Sidebar";
import { AuthProvider, useAuth } from "./hooks/AuthProvider";
import { ToastProvider } from "./hooks/ToastProvider";
import type { AreasByCity, Lead, ViewId } from "./types";
import {
  DEFAULT_CITIES,
  mergeAreasWithSeeds,
  mergeCitiesWithDefaults,
} from "./constants";
import {
  bootstrapUserData,
  saveUserSettings,
  subscribeUserLeads,
  syncUserLeads,
  type UserSettings,
} from "./utils/firestoreSync";
import { DiscoverView } from "./views/DiscoverView";
import { DashboardView } from "./views/DashboardView";
import { GuideView } from "./views/GuideView";
import { LoginView } from "./views/LoginView";
import { MapsSearchesView } from "./views/MapsSearchesView";
import { TargetTrackerView } from "./views/TargetTrackerView";
import { TemplatesView } from "./views/TemplatesView";

function emptySettings(displayName: string): UserSettings {
  const cities = mergeCitiesWithDefaults(null);
  return {
    cities,
    areas: mergeAreasWithSeeds(cities, null),
    activeCity: cities[0] ?? DEFAULT_CITIES[0] ?? "Trichy",
    placesApiKey: "",
    displayName,
  };
}

function AppInner() {
  const { user, ready } = useAuth();
  const [dataReady, setDataReady] = useState(false);
  const [cities, setCities] = useState<string[]>(() =>
    mergeCitiesWithDefaults(null),
  );
  const [activeCity, setActiveCity] = useState(
    () => mergeCitiesWithDefaults(null)[0] ?? "Trichy",
  );
  const [areasByCity, setAreasByCity] = useState<AreasByCity>(() =>
    mergeAreasWithSeeds(mergeCitiesWithDefaults(null), null),
  );
  const [leads, setLeads] = useState<Lead[]>([]);
  const [placesApiKey, setPlacesApiKey] = useState("");
  const [view, setView] = useState<ViewId>("dashboard");
  const [manageOpen, setManageOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const hydrateDone = useRef(false);
  const applyingRemote = useRef(false);
  const leadsRef = useRef(leads);
  leadsRef.current = leads;

  // Load + subscribe when signed in
  useEffect(() => {
    if (!user) {
      setDataReady(false);
      hydrateDone.current = false;
      return;
    }

    let cancelled = false;
    let unsub: (() => void) | undefined;

    async function hydrate() {
      setDataReady(false);
      setSyncError(null);
      hydrateDone.current = false;
      try {
        const { settings, leads: cloudLeads } = await bootstrapUserData(
          user!.uid,
          user!.name,
        );
        if (cancelled) return;
        applyingRemote.current = true;
        setCities(settings.cities);
        setAreasByCity(settings.areas);
        setActiveCity(settings.activeCity);
        setPlacesApiKey(settings.placesApiKey);
        setLeads(cloudLeads);
        applyingRemote.current = false;
        hydrateDone.current = true;
        setDataReady(true);

        unsub = subscribeUserLeads(user!.uid, (next) => {
          if (cancelled) return;
          applyingRemote.current = true;
          setLeads(next);
          applyingRemote.current = false;
        });
      } catch (error) {
        if (cancelled) return;
        setSyncError(
          error instanceof Error
            ? error.message
            : "Could not load your cloud workspace.",
        );
        applyingRemote.current = true;
        const fallback = emptySettings(user!.name);
        setCities(fallback.cities);
        setAreasByCity(fallback.areas);
        setActiveCity(fallback.activeCity);
        setPlacesApiKey("");
        setLeads([]);
        applyingRemote.current = false;
        hydrateDone.current = true;
        setDataReady(true);
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [user]);

  // Debounced settings sync
  useEffect(() => {
    if (!user || !hydrateDone.current || applyingRemote.current) return;
    const settings: UserSettings = {
      cities,
      areas: areasByCity,
      activeCity,
      placesApiKey,
      displayName: user.name,
    };
    const id = window.setTimeout(() => {
      void saveUserSettings(user.uid, settings).catch((error) => {
        setSyncError(
          error instanceof Error ? error.message : "Could not save settings.",
        );
      });
    }, 400);
    return () => window.clearTimeout(id);
  }, [user, cities, areasByCity, activeCity, placesApiKey]);

  // Debounced leads sync
  useEffect(() => {
    if (!user || !hydrateDone.current || applyingRemote.current) return;
    const id = window.setTimeout(() => {
      void syncUserLeads(user.uid, leadsRef.current).catch((error) => {
        setSyncError(
          error instanceof Error ? error.message : "Could not save leads.",
        );
      });
    }, 500);
    return () => window.clearTimeout(id);
  }, [user, leads]);

  const handleActiveCityChange = useCallback((city: string) => {
    setActiveCity(city);
  }, []);

  const addCity = useCallback((name: string) => {
    setCities((prev) => [...prev, name]);
    setAreasByCity((prev) => ({ ...prev, [name]: prev[name] ?? [] }));
  }, []);

  const renameCity = useCallback((oldName: string, newName: string) => {
    if (oldName === newName) return;
    setCities((prev) => prev.map((c) => (c === oldName ? newName : c)));
    setAreasByCity((prev) => {
      const next = { ...prev };
      next[newName] = next[oldName] ?? [];
      delete next[oldName];
      return next;
    });
    setLeads((prev) =>
      prev.map((l) => (l.city === oldName ? { ...l, city: newName } : l)),
    );
    setActiveCity((c) => (c === oldName ? newName : c));
  }, []);

  const removeCity = useCallback((name: string) => {
    setCities((prev) => {
      const next = prev.filter((c) => c !== name);
      setActiveCity((current) =>
        current === name ? (next[0] ?? "Trichy") : current,
      );
      return next;
    });
    setAreasByCity((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  if (!ready) {
    return (
      <div className="grid min-h-dvh place-items-center bg-page text-sm text-muted">
        Checking account…
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  if (!dataReady) {
    return (
      <div className="grid min-h-dvh place-items-center bg-page text-sm text-muted">
        Loading your workspace…
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <a
        href="#main-content"
        className="absolute left-4 top-4 z-50 -translate-y-16 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-on-accent transition focus:translate-y-0"
      >
        Skip to content
      </a>
      {syncError && (
        <div className="border-b border-accent/30 bg-[#FDEBEC] px-4 py-2 text-center text-xs text-accent sm:text-sm">
          Sync issue: {syncError}
        </div>
      )}
      <Header
        cities={cities}
        activeCity={activeCity}
        onActiveCityChange={handleActiveCityChange}
        onManageCities={() => setManageOpen(true)}
        mobileNavOpen={mobileNav}
        onToggleMobileNav={() => setMobileNav((open) => !open)}
      />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar
          activeView={view}
          onNavigate={setView}
          mobileOpen={mobileNav}
          onCloseMobile={() => setMobileNav(false)}
        />
        <main
          id="main-content"
          className="min-w-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:p-6 lg:p-8 lg:pb-8"
        >
          {view === "dashboard" && (
            <DashboardView
              leads={leads}
              activeCity={activeCity}
              onOpenLeads={() => setView("tracker")}
              onOpenGuide={() => setView("guide")}
            />
          )}
          {view === "guide" && <GuideView activeCity={activeCity} />}
          {view === "discover" && (
            <DiscoverView
              activeCity={activeCity}
              areasByCity={areasByCity}
              leads={leads}
              placesApiKey={placesApiKey}
              onPlacesApiKeyChange={setPlacesApiKey}
              onAddLead={(lead) => setLeads((prev) => [lead, ...prev])}
            />
          )}
          {view === "maps" && (
            <MapsSearchesView
              activeCity={activeCity}
              areasByCity={areasByCity}
              onAreasChange={setAreasByCity}
            />
          )}
          {view === "tracker" && (
            <TargetTrackerView
              leads={leads}
              cities={cities}
              activeCity={activeCity}
              onLeadsChange={setLeads}
            />
          )}
          {view === "templates" && (
            <TemplatesView activeCity={activeCity} leads={leads} />
          )}
        </main>
      </div>
      <MobileTabBar activeView={view} onNavigate={setView} />
      {manageOpen && (
        <ManageCitiesModal
          cities={cities}
          activeCity={activeCity}
          onClose={() => setManageOpen(false)}
          onAdd={addCity}
          onRename={renameCity}
          onRemove={removeCity}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </ToastProvider>
  );
}
