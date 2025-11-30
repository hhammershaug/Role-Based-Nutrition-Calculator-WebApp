import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../apiConfig";
import RoleRightsTable from "../components/RoleRightsTable";
import PasswordSpecs from "../components/PasswordSpecs";
import { useAuth } from "../context/AuthContext";

const ProfilePage: React.FC = () => {
  const { email, name, role, organizationNumber, profilePicture, isLoggedIn } =
    useAuth();
  const [localName, setLocalName] = useState(name);
  const [localOrganizationNumber, setLocalOrganizationNumber] =
    useState(organizationNumber);
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState(""); // Ny state for gammelt passord
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedSection, setSelectedSection] = useState<
    "password" | "info" | "products" | "image" | "rights"
  >("info");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]); // For å holde på produktlisten
  const [isProductsLoading, setIsProductsLoading] = useState(false); // For å vise loading spinner

  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/account/login"); // Absolutt rute
    }
  }, [isLoggedIn, navigate]); // Kjør kun når isLoggedIn eller navigate endres

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const fetchProducts = async () => {
    setIsProductsLoading(true); // Start loading
    try {
      const response = await axios.get(
        `${API_URL}/api/products/my-products`, // Endepunkt for å hente produkter
        { withCredentials: true }
      );
      setProducts(response.data); // Sett produkter i state
      setError("");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Failed to fetch products.");
      }
    } finally {
      setIsProductsLoading(false); // Stop loading
    }
  };

  const handleChangePassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage(""); // Nullstill tidligere meldinger
      setError(""); // Nullstill feil-meldinger

      try {
        const changePasswordRequest = {
          email: email, // Brukerens epost
          oldPassword, // Gammelt passord
          newPassword, // Nytt passord
        };

        const response = await axios.post(
          `${API_URL}/api/account/change-password`,
          changePasswordRequest,
          { withCredentials: true }
        );

        // Når passordet er endret vellykket, sett success-melding
        setMessage(response.data.message || "Passord endret!");
        setOldPassword(""); // Tøm gammelt passord felt
        setNewPassword(""); // Tøm nytt passord felt
      } catch (error: any) {
        if (axios.isAxiosError(error)) {
          // Håndterer feil basert på statuskode
          if (error.response?.status === 400 && error.response?.data?.errors) {
            // Hvis vi har spesifikke feilmeldinger (f.eks. passordkrav)
            const errorMessages = error.response.data.errors;

            // Lag HTML-strukturen for å vise feilene
            const errorList = errorMessages
              .map((message: string) => `<li>${message}</li>`)
              .join(""); // Joins li elements

            setError(`Endring av passord feilet:<ul>${errorList}</ul>`);
            setOldPassword(""); // Tøm gammelt passord felt
            setNewPassword(""); // Tøm nytt passord felt
          } else {
            // Generell feilmelding
            setError(
              error.response?.data?.message ||
                "Feil ved endring av passord. Prøv igjen."
            );
            setOldPassword(""); // Tøm gammelt passord felt
            setNewPassword(""); // Tøm nytt passord felt
          }
        } else {
          // Håndterer nettverksfeil eller uventede feil
          setError("Nettverksfeil. Prøv igjen senere.");
          setOldPassword(""); // Tøm gammelt passord felt
          setNewPassword(""); // Tøm nytt passord felt
        }
      }
    },
    [newPassword, oldPassword, email] // Sørg for at alle nødvendige dependencies er inkludert
  );

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const updateUserInfoRequest = {
        email: email, // Brukerens epost
        name: localName, // Brukerens navn
        role: role, // Brukerens rolle
        organizationNumber: localOrganizationNumber, // Organisasjonsnummer (hvis det er en produsent)
      };

      // Send PUT-forespørsel til serveren for å oppdatere brukerens informasjon
      await axios.put(
        `${API_URL}/api/account/update-user-info`,
        updateUserInfoRequest,
        { withCredentials: true }
      );

      setMessage("Brukerinformasjon oppdatert.");
      navigate(0);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message || "Feil ved oppdatering av brukerinfo."
        );
      }
    }
  };

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) {
      setError("Vennligst velg et bilde.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedImage);

    try {
      await axios.post(
        `${API_URL}/api/account/upload-profile-picture`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      setMessage("Profilbilde ble lastet opp!");
      navigate(0);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message || "Feil ved opplasting av bilde."
        );
      }
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    // Main Account profile container
    <div className="container">
      <h1 className="h1">Konto</h1>

      <div className="row">
        {/* Left side navigation column */}
        <div className="col-md-3">
          {/* Profile picture */}
          <div className="position-relative">
            <img
              className="img-thumbnail mb-4 position-relative"
              src={
                profilePicture
                  ? `${API_URL}${profilePicture}`
                  : `${API_URL}/images/profile_pictures/male-placeholder-image.png`
              }
              alt="Profile picture"
            />
          </div>

          {/* Profile name */}
          <div className="list-group mb-4">
            <div className="list-group-item">
              <strong>{name}</strong>
            </div>
          </div>

          {/* Left side navigation nav items */}
          <div className="list-group mb-4">
            {/* Information page */}
            <button
              className={`list-group-item list-group-item-action ${
                selectedSection === "info" ? "active" : ""
              }`}
              onClick={() => {
                setSelectedSection("info");
                setError("");
                setMessage("");
              }}
            >
              <i className="bi bi-person-vcard"></i> Oppdater informasjon
            </button>
            {/* Profile picture upload nav item */}
            <button
              className={`list-group-item list-group-item-action ${
                selectedSection === "image" ? "active" : ""
              }`}
              onClick={() => {
                setSelectedSection("image");
                setError("");
                setMessage("");
              }}
            >
              <i className="bi bi-image"></i> Endre Profilbilde
            </button>
            {/* Password change nav item */}
            <button
              className={`list-group-item list-group-item-action ${
                selectedSection === "password" ? "active" : ""
              }`}
              onClick={() => {
                setSelectedSection("password");
                setError("");
                setMessage("");
              }}
            >
              <i className="bi bi-key"></i> Endre passord
            </button>
            {/* Role rights nav item */}
            <button
              className={`list-group-item list-group-item-action ${
                selectedSection === "rights" ? "active" : ""
              }`}
              onClick={() => {
                setSelectedSection("rights");
                setError("");
                setMessage("");
              }}
            >
              <i className="bi bi-person-lock"></i> Mine rollerettigheter
            </button>
            {/* My products nav item */}
            <button
              className={`list-group-item list-group-item-action ${
                selectedSection === "products" ? "active" : ""
              }`}
              onClick={() => {
                setSelectedSection("products");
                setError("");
                setMessage("");
              }}
            >
              <i className="bi bi-box"></i> Mine produkter
            </button>
          </div>
        </div>

        {/* Right side main content */}
        <div className="col-md-9">
          {/* If in Information state */}
          {selectedSection === "info" && (
            <div className="card">
              <div className="card-body">
                <h2 className="card-title">Oppdater informasjon</h2>
                {/* Form for updating profile information */}
                <form onSubmit={handleUpdateInfo}>
                  {/* Update name */}
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Navn
                    </label>
                    <div className="input-group">
                      <span className="input-group-text" id="basic-addon1">
                        <i
                          className="bi bi-person-vcard"
                          aria-hidden="true"
                        ></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        value={localName}
                        onChange={(e) => setLocalName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  {/* Display email */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Epost
                    </label>
                    <div className="input-group">
                      <span className="input-group-text" id="basic-addon1">
                        <i className="bi bi-at" aria-hidden="true"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={email}
                        required
                        disabled
                        readOnly
                      />
                    </div>
                  </div>
                  {/* Display role */}
                  <div className="mb-3">
                    <label htmlFor="role" className="form-label">
                      Rolle
                    </label>
                    <div className="input-group">
                      <span className="input-group-text" id="basic-addon2">
                        <i className="bi bi-tag" aria-hidden="true"></i>
                      </span>
                      <input
                        type="role"
                        className="form-control"
                        id="role"
                        value={role}
                        required
                        disabled
                        readOnly
                      />
                    </div>
                  </div>
                  {/* If producer, update organisation number */}
                  {role === "Producer" && (
                    <div className="mb-3">
                      <label htmlFor="org-num" className="form-label">
                        Organisasjonsnummer
                      </label>
                      <div className="input-group">
                        <span className="input-group-text" id="basic-addon1">
                          <i className="bi bi-building" aria-hidden="true"></i>
                        </span>
                        <input
                          type="org-num"
                          className="form-control"
                          id="org-num"
                          value={localOrganizationNumber}
                          onChange={(e) =>
                            setLocalOrganizationNumber(e.target.value)
                          }
                        />
                      </div>
                    </div>
                  )}
                  {/* Submission button */}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    aria-label="Oppdater informasjon"
                    title="Klikk for å oppdatere informasjon"
                  >
                    Oppdater
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* If in Image upload state */}
          {selectedSection === "image" && (
            <div className="card mb-3">
              <div className="card-body">
                <h2 className="card-title">Endre profilbilde</h2>
                {/* Preview chosen picture */}
                {selectedImage && (
                  <div className="mb-3">
                    <h5>Valgt bilde:</h5>
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="Preview"
                      className="img-thumbnail"
                      width="150"
                    />
                  </div>
                )}
                {/* Form for uploading new picture */}
                <form onSubmit={handleImageUpload}>
                  <div className="mb-3">
                    <label htmlFor="image" className="form-label">
                      Last opp profilbilde
                    </label>
                    <div className="input-group">
                      <input
                        type="file"
                        className="form-control"
                        id="image"
                        name="image"
                        accept="image/*"
                        onChange={(e) =>
                          setSelectedImage(
                            e.target.files ? e.target.files[0] : null
                          )
                        }
                      />
                    </div>
                  </div>
                  {/* Submission button */}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    aria-label="Last opp profilbilde"
                    title="Klikk for å laste opp bilde"
                  >
                    <i className="bi bi-upload"></i> Last opp
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* If in Passowrd change state */}
          {selectedSection === "password" && (
            <div className="card mb-3">
              <div className="card-body">
                <h2 className="card-title">Endre passord</h2>
                {/* Form for changing password */}
                <form onSubmit={handleChangePassword}>
                  {/* Old password */}
                  <div className="mb-3">
                    <label htmlFor="oldPassword" className="form-label">
                      Gammelt passord
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        id="oldPassword"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        aria-label={
                          showPassword ? "Skjul passord" : "Vis passord"
                        }
                        title={
                          showPassword
                            ? "Klikk for å skjule passord"
                            : "Klikk for å vise passord"
                        }
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
                  {/* New password */}
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">
                      Nytt passord <PasswordSpecs />
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        aria-label={
                          showPassword ? "Skjul passord" : "Vis passord"
                        }
                        title={
                          showPassword
                            ? "Klikk for å skjule passord"
                            : "Klikk for å vise passord"
                        }
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
                  {/* Submission button */}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    aria-label="Endre passord"
                    title="Klikk for å endre passord"
                  >
                    Endre
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* If in Role Rights state */}
          {selectedSection === "rights" && (
            <div className="card mb-3">
              <div className="card-body">
                <h2 className="card-title">Mine rettigheter</h2>
                <p>
                  <strong>Min rolle: </strong>
                  {role}
                </p>
                {/* Displaying the role rights table */}
                <div className="table-responsive">
                  {role === "Admin" ? (
                    <RoleRightsTable role={role} isAdmin={true} />
                  ) : (
                    <RoleRightsTable role={role} />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* If in My products state */}
          {selectedSection === "products" && (
            <div className="card">
              <div className="card-body">
                <h2 className="card-title">Mine produkter</h2>
                {/* Display products of loading state */}
                {isProductsLoading ? (
                  <p>Laster produkter...</p>
                ) : (
                  <>
                    <ul className="list-group mb-3">
                      {products.length > 0 ? (
                        products.map((product) => (
                          <li key={product.id} className="list-group-item">
                            <img
                              className="img-thumbnail me-4"
                              style={{ height: "50px" }}
                              src={
                                product.imageUrl
                                  ? `${API_URL}${product.imageUrl}`
                                  : `${API_URL}/images/product_images/placeholder.png`
                              }
                              alt={`${product.name} produktbilde`}
                            ></img>
                            <Link
                              to={`/products/details/${product.productId}`}
                              className="text-decoration-none"
                            >
                              {product.name}
                            </Link>
                          </li>
                        ))
                      ) : (
                        <li className="list-group-item">
                          Ingen produkter funnet.
                        </li>
                      )}
                    </ul>
                    {/* Fetch products button */}
                    <button
                      className="btn btn-primary"
                      aria-label="Hent alle mine produkter"
                      title="Klikk for å hente alle mine produkter"
                      onClick={fetchProducts}
                    >
                      Se alle produkter
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Melding / Feil */}
          {message && <div className="alert alert-success mt-3">{message}</div>}
          {error && (
            <div
              className="alert alert-danger mt-3"
              dangerouslySetInnerHTML={{ __html: error }}
            ></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
