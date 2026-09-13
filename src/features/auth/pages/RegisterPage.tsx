import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { AuthLayout } from "../components/AuthLayout";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [accountName, setAccountName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register({ accountName, firstName, lastName, email, password });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt başarısız");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Hane Bütçenizi Yönetmeye Başlayın."
      subtitle="Hane hesabınızı oluşturun, üyelerinizi davet edin ve bütçenizi birlikte takip edin."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-form-header">
          <h2>Hane Hesabı Oluştur</h2>
          <p>Başlamak için birkaç bilgi girin.</p>
        </div>

        <div className="auth-input-group">
          <span className="auth-input-icon" aria-hidden="true">
            👤
          </span>
          <input
            placeholder="Hesap adı"
            value={accountName}
            onChange={(event) => setAccountName(event.target.value)}
            minLength={3}
            maxLength={50}
            required
            aria-label="Hesap adı"
          />
        </div>
        <div className="auth-input-group">
          <span className="auth-input-icon" aria-hidden="true">
            👤
          </span>
          <input
            placeholder="Ad"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            minLength={2}
            maxLength={100}
            required
            aria-label="Ad"
          />
        </div>
        <div className="auth-input-group">
          <span className="auth-input-icon" aria-hidden="true">
            👤
          </span>
          <input
            placeholder="Soyad"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            minLength={2}
            maxLength={100}
            required
            aria-label="Soyad"
          />
        </div>
        <div className="auth-input-group">
          <span className="auth-input-icon" aria-hidden="true">
            ✉
          </span>
          <input
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            aria-label="E-posta"
          />
        </div>
        <div className="auth-input-group">
          <span className="auth-input-icon" aria-hidden="true">
            🔒
          </span>
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            maxLength={128}
            required
            aria-label="Şifre"
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? "Kayıt oluşturuluyor..." : "Kayıt Ol"}
        </button>

        <p className="auth-form-footer">
          Zaten hesabın var mı? <Link to="/login">Giriş yap</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
