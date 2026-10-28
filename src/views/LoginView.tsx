import { useState, type FormEvent } from "react";
import { useAuth } from "../hooks/AuthProvider";

type Mode = "signin" | "signup";

export function LoginView() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }
        await signUp(email, password, name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not continue.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-page px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(237,37,78,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(249,220,92,0.18),_transparent_45%)]"
      />

      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-[0_20px_50px_rgba(1,25,54,0.08)] sm:p-8">
        <div className="flex flex-col items-center text-center">
          <img
            src="/kuri-logo.jpg"
            alt="Kuri"
            className="h-12 w-auto object-contain sm:h-14"
          />
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">
            {mode === "signin" ? "Sign in to Kuri" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Your leads and cities sync to your account across devices.
          </p>
        </div>

        <div className="mt-6 inline-flex w-full rounded-lg border border-border bg-page p-0.5 text-sm">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError(null);
            }}
            className={`flex-1 rounded-md px-3 py-2 font-semibold transition-colors ${
              mode === "signin"
                ? "bg-ink text-on-ink"
                : "text-muted hover:text-ink"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            className={`flex-1 rounded-md px-3 py-2 font-semibold transition-colors ${
              mode === "signup"
                ? "bg-ink text-on-ink"
                : "text-muted hover:text-ink"
            }`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          {mode === "signup" && (
            <label className="block text-left text-xs font-medium text-muted">
              Your name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mubasil"
                autoComplete="name"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm font-normal text-ink outline-none focus:border-accent"
              />
            </label>
          )}

          <label className="block text-left text-xs font-medium text-muted">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm font-normal text-ink outline-none focus:border-accent"
            />
          </label>

          <label className="block text-left text-xs font-medium text-muted">
            Password
            <div className="mt-1 flex gap-2">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  mode === "signup" ? "At least 6 characters" : "Your password"
                }
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                required
                minLength={mode === "signup" ? 6 : undefined}
                className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2.5 text-sm font-normal text-ink outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted hover:text-ink"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-accent/30 bg-[#FDEBEC] px-3 py-2 text-left text-sm text-accent"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-accent px-3 py-2.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {busy
              ? "Please wait…"
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-muted">
          Secured with Firebase Authentication. Each account has its own private
          lead pipeline.
        </p>
      </div>
    </div>
  );
}
