import { Outlet } from "react-router-dom";
import { useAuth } from "../../features/auth/context/useAuth";

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-title">FinTrack</span>
        {user && (
          <div className="app-user">
            <span>{user.accountName}</span>
            <button type="button" onClick={logout}>
              Çıkış Yap
            </button>
          </div>
        )}
      </header>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
