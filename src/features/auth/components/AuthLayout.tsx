import type { ReactNode } from "react";
import "./AuthLayout.css";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

const CATEGORY_LEGEND = [
  { label: "Gıda", value: "%35", color: "#22c55e" },
  { label: "Faturalar", value: "%25", color: "#38bdf8" },
  { label: "Kira", value: "%20", color: "#facc15" },
  { label: "Eğlence", value: "%10", color: "#f87171" },
  { label: "Diğer", value: "%10", color: "#a78bfa" },
];

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-brand-logo">
          <span className="auth-brand-logo-icon">📈</span> FinTrack
        </div>
        <h1 className="auth-brand-title">{title}</h1>
        <p className="auth-brand-subtitle">{subtitle}</p>

        <div className="auth-mock">
          <div className="auth-mock-badge">Bu Ayki Tasarruf: +₺12.450</div>
          <div className="auth-mock-card">
            <div
              className="auth-mock-donut"
              style={{
                background: `conic-gradient(${CATEGORY_LEGEND.map(
                  (item, index) =>
                    `${item.color} ${index * 20}% ${(index + 1) * 20}%`
                ).join(", ")})`,
              }}
            />
            <ul className="auth-mock-legend">
              {CATEGORY_LEGEND.map((item) => (
                <li key={item.label}>
                  <span
                    className="auth-mock-dot"
                    style={{ background: item.color }}
                  />
                  {item.label}
                  <span className="auth-mock-value">{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="auth-brand-footer">
          Aile bütçenizi modern ve kolay bir şekilde yönetmek için akıllı
          çözümler.
        </p>
      </div>

      <div className="auth-panel">
        <div className="auth-panel-inner">{children}</div>
      </div>
    </div>
  );
}
