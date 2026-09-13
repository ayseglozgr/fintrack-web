import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { AuthLayout } from "../components/AuthLayout";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [accountNameOrEmail, setAccountNameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ accountNameOrEmail, password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Aile Bütçenizi Akıllıca Yönetin."
      subtitle="Bu Ayki Tasarruf gibi özetlerle haneye dair harcamalarınızı tek yerden takip edin."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-form-header">
          <h2>Hoş Geldiniz</h2>
          <p>Bütçenizi yönetmek için giriş yapın.</p>
        </div>

        <div className="auth-input-group">
          <span className="auth-input-icon" aria-hidden="true">
            ✉
          </span>
          <input
            type="text"
            placeholder="E-posta / Kullanıcı Adı"
            value={accountNameOrEmail}
            onChange={(event) => setAccountNameOrEmail(event.target.value)}
            required
            aria-label="E-posta / Kullanıcı Adı"
          />
        </div>

        <div className="auth-input-group">
          <span className="auth-input-icon" aria-hidden="true">
            🔒
          </span>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Şifre"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
            aria-label="Şifre"
          />
          <button
            type="button"
            className="auth-toggle-visibility"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
          >
            {showPassword ? "🙈" : "👁"}
          </button>
        </div>

        <div className="auth-form-row">
          <label className="auth-remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            Beni Hatırla
          </label>
          <Link to="/forgot-password">Şifremi Unuttum?</Link>
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>

        <p className="auth-form-footer">
          Henüz hesabınız yok mu? <Link to="/register">Hane Hesabı Oluştur</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
