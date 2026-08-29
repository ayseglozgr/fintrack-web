import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

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
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Kayıt Ol</h1>
        <label>
          Hesap adı
          <input
            value={accountName}
            onChange={(event) => setAccountName(event.target.value)}
            minLength={3}
            maxLength={50}
            required
          />
        </label>
        <label>
          Ad
          <input
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            minLength={2}
            maxLength={100}
            required
          />
        </label>
        <label>
          Soyad
          <input
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            minLength={2}
            maxLength={100}
            required
          />
        </label>
        <label>
          E-posta
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Şifre
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            maxLength={128}
            required
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Kayıt oluşturuluyor..." : "Kayıt Ol"}
        </button>
        <p>
          Zaten hesabın var mı? <Link to="/login">Giriş yap</Link>
        </p>
      </form>
    </div>
  );
}
