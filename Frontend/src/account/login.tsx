import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RoleRightsTable from "../components/RoleRightsTable";
import PasswordSpecs from "../components/PasswordSpecs";
import LoadingSpinner from "../components/LoadingSpinner";
import { validatePassword } from "../services/PasswordValidation";

const LoginPage: React.FC = () => {
  const {
    email,
    setEmail,
    name,
    setName,
    role,
    setRole,
    organizationNumber,
    setOrganizationNumber,
    message,
    setMessage,
    handleLogin,
    handleRegistration,
    isLoggedIn,
    loading,
  } = useAuth();

  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      // Hvis brukeren er logget inn, naviger til profilen
      navigate("/account/profile");
    }
  }, [isLoggedIn, navigate]); // Kjører hver gang isLoggedIn endres

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validatePassword(password);
    if (validationErrors.length > 0) {
      setMessage(
        `Passordet må oppfylle følgende:<ul><li>${validationErrors.join(
          "</li><li>"
        )}</ul>`
      );
      return;
    }

    let success = false;
    if (isRegister) {
      success = await handleRegistration(e, password);
    } else {
      success = await handleLogin(e, password);
    }
    if (success) {
      setIsRegister(false);
      navigate("account/profile");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    // Main Registration and Login container
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h1 className="card-title">
                {isRegister ? "Registrering" : "Innlogging"}
              </h1>
              {/* Display nothing if in logged-in state */}
              {isLoggedIn ? (
                ""
              ) : (
                // Registration and Login Page if NOT in logged-in state
                <form onSubmit={handleSubmit}>
                  {/* Formularelementer her */}
                  {/* Display Name input if in registration state */}
                  {isRegister && (
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">
                        Navn*
                      </label>
                      <input
                        type="name"
                        className="form-control"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  )}
                  {/* Display Email input in any state */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Epost*
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  {/* Display Password input in any state */}
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Passord* <PasswordSpecs />
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        aria-label={
                          showPassword ? "Skjul passord" : "Vis passord"
                        }
                        title={showPassword ? "Skjul passord" : "Vis passord"}
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <i className="bi bi-eye-slash"></i>
                        ) : (
                          <i className="bi bi-eye"></i>
                        )}
                      </button>
                    </div>
                  </div>
                  {/* Display Role input if in registration state */}
                  {isRegister && (
                    <div className="mb-3">
                      <label htmlFor="role" className="form-label">
                        Rolle*
                      </label>
                      <select
                        className="form-select"
                        id="role"
                        value={role}
                        aria-label="Velg din rolle"
                        onChange={(e) => setRole(e.target.value)}
                      >
                        <option value="" disabled>
                          Velg rolle
                        </option>
                        <option value="Producer">Producer</option>
                        <option value="Researcher">Researcher</option>
                      </select>
                    </div>
                  )}
                  {/* Display Organisation Number input if in registration state */}
                  {isRegister && (
                    <div className="mb-3">
                      <label htmlFor="org-num" className="form-label">
                        Organisasjonsnummer
                      </label>
                      <input
                        type="org-num"
                        className="form-control"
                        id="org-num"
                        value={organizationNumber}
                        onChange={(e) => setOrganizationNumber(e.target.value)}
                      />
                    </div>
                  )}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    aria-label={
                      isRegister
                        ? "Send inn registreringsskjema"
                        : "Send inn innloggingsskjema"
                    }
                    title={
                      isRegister
                        ? "Klikk for å registrere"
                        : "Klikk for å logge inn"
                    }
                  >
                    {isRegister ? "Registrer" : "Logg inn"}
                  </button>
                </form>
              )}
              {/* Section for switching between registration and Login */}
              <p className="mt-3">
                {isRegister ? (
                  <span>Allerede har en konto?</span>
                ) : (
                  <span>Trenger du en konto?</span>
                )}
                <button
                  className="btn btn-link"
                  role="button"
                  aria-label={
                    isRegister ? "Gå til innlogging" : "Gå til registrering"
                  }
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setMessage("");
                  }}
                >
                  {isRegister ? "Tilbake til innlogging" : "Registrering"}
                </button>
              </p>
              {/* Display Role Rights Table if in registration state */}
              {isRegister && (
                <p>
                  <span>Vil du vite mer om rollerettigheter?</span>
                  <a
                    type="button"
                    className="btn btn-link"
                    data-bs-toggle="modal"
                    data-bs-target="#exampleModal"
                  >
                    Åpne oversikt
                  </a>
                </p>
              )}
              {/* Role Rights Table Modal */}
              <div
                className="modal fade"
                id="exampleModal"
                tabIndex={-1}
                aria-labelledby="exampleModalLabel"
                aria-hidden="true"
              >
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h2 className="modal-title fs-5" id="exampleModalLabel">
                        Rollerettigheter
                      </h2>
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Lukk oversikt"
                        title="Lukk oversikt"
                      ></button>
                    </div>
                    <div className="modal-body">
                      <RoleRightsTable role="" />
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        data-bs-dismiss="modal"
                        aria-label="Lukk oversikt"
                        title="Lukk oversikt"
                      >
                        Lukk
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Display HTTP messages */}
              {message && (
                <div
                  className="alert alert-info mt-3"
                  role="alert"
                  aria-live="polite"
                >
                  <div dangerouslySetInnerHTML={{ __html: message }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
