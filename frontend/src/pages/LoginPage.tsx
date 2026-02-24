import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LogIn, AlertCircle } from "lucide-react";
import { cn } from "../shared/lib/cn";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data
              ?.detail
          : null;
      setError(message ?? "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-50/80 to-white px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <Link
            to="/"
            className="inline-block focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg"
          >
            <h1 className="font-display text-fluid-3xl font-bold text-primary-600">
              AI Cost Auditor
            </h1>
          </Link>
          <h2 className="mt-4 text-fluid-2xl font-semibold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-fluid-sm text-gray-600">
            Or{" "}
            <Link
              to="/"
              className="font-medium text-primary-600 hover:text-primary-700 focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
            >
              explore the features
            </Link>
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800"
                role="alert"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden />
                <span className="text-fluid-sm">{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-fluid-sm font-medium text-gray-900"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "mt-2 block w-full rounded-xl border border-gray-300 px-4 py-3 text-fluid-base text-gray-900",
                  "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0",
                  "min-h-[3rem] touch-manipulation",
                )}
                placeholder="admin@local"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-fluid-sm font-medium text-gray-900"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "mt-2 block w-full rounded-xl border border-gray-300 px-4 py-3 text-fluid-base text-gray-900",
                  "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0",
                  "min-h-[3rem] touch-manipulation",
                )}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "flex min-h-[3rem] w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-fluid-base font-semibold text-white",
                "hover:bg-primary-700 focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                "disabled:opacity-70 touch-manipulation",
              )}
            >
              {loading ? (
                <span
                  className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
                  aria-hidden
                />
              ) : (
                <>
                  <LogIn className="h-5 w-5" aria-hidden />
                  Sign in
                </>
              )}
            </button>

            <div className="rounded-xl bg-gray-50 p-4 text-center text-fluid-sm text-gray-700">
              <p className="font-medium text-gray-900">Demo credentials</p>
              <p className="mt-1">Email: admin@local</p>
              <p>Password: admin123</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
