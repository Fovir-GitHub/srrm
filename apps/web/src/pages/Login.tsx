import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../contexts/I18nContext";
import { api } from "../api/client";

export default function Login() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [ssoAvailable, setSsoAvailable] = useState(false);
  const [passwordAvailable, setPasswordAvailable] = useState(false);
  const navigate = useNavigate();

  // 获取登录方式配置
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await api.auth.config();
        setSsoAvailable(config.ssoAvailable);
        setPasswordAvailable(config.passwordAvailable);
      } catch (err) {
        console.error("Failed to fetch auth config:", err);
        // 如果配置获取失败，至少尝试 SSO（保持向后兼容）
      }
    };
    fetchConfig();
  }, []);

  const handleSSOLogin = () => {
    setLoading(true);
    setError(null);
    window.location.href = "/api/auth/login";
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!password) {
      setError(t("login.passwordRequired"));
      setLoading(false);
      return;
    }

    try {
      await api.auth.passwordLogin(password);
      // 重新加载页面以重新初始化认证状态
      window.location.href = "/";
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Login failed";
      setError(message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.authenticated) navigate("/", { replace: true });
      } catch {
        /* not authenticated, stay on login */
      }
    };
    checkAuth();
  }, [navigate]);

  // 如果没有任何登录方式可用，显示错误
  if (!ssoAvailable && !passwordAvailable) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ctp-text">
        <div className="w-full max-w-md space-y-6 px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">
              {t("login.title")}
            </h2>
          </div>
          <div className="bg-ctp-red/10 border border-ctp-red/20 text-ctp-red px-4 py-3 rounded-lg text-sm">
            No login methods configured
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-ctp-text">
      <div className="w-full max-w-md space-y-6 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">
            {t("login.title")}
          </h2>
          <p className="text-ctp-subtext1 mt-2">
            {t("login.subtitle")}
          </p>
        </div>

        {error && (
          <div className="bg-ctp-red/10 border border-ctp-red/20 text-ctp-red px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {passwordAvailable && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-ctp-text mb-1"
              >
                {t("login.password")}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="Enter password"
                className="w-full px-4 py-2 bg-ctp-surface1 border border-ctp-surface2 rounded-lg text-ctp-text placeholder-ctp-subtext1 focus:outline-none focus:border-ctp-blue focus:ring-1 focus:ring-ctp-blue disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-ctp-blue text-ctp-base font-medium rounded-lg hover:bg-ctp-blue/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-ctp-text"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth={4}
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span>{t("login.signingIn")}</span>
                </>
              ) : (
                t("login.signIn")
              )}
            </button>
          </form>
        )}

        {ssoAvailable && passwordAvailable && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ctp-surface2" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-ctp-base text-ctp-subtext1">
                {t("login.or")}
              </span>
            </div>
          </div>
        )}

        {ssoAvailable && (
          <button
            onClick={handleSSOLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-ctp-blue text-ctp-base font-medium rounded-lg hover:bg-ctp-blue/90 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-ctp-text"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth={4}
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span>{t("login.signingIn")}</span>
              </>
            ) : (
              t("login.signInWithSSO")
            )}
          </button>
        )}
      </div>
    </div>
  );
}
