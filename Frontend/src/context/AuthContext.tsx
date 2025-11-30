import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../apiConfig";

interface AuthContextType {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  role: string;
  setRole: React.Dispatch<React.SetStateAction<string>>;
  organizationNumber: string;
  setOrganizationNumber: React.Dispatch<React.SetStateAction<string>>;
  profilePicture: string;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  handleLogin: (e: React.FormEvent, password: string) => Promise<boolean>;
  handleRegistration: (
    e: React.FormEvent,
    password: string
  ) => Promise<boolean>;
  handleLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Producer");
  const [organizationNumber, setOrganizationNumber] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/api/account/get-user-info`,
          {
            withCredentials: true,
          }
        );
        setIsLoggedIn(true);
        setName(data.name);
        setEmail(data.email);
        setRole(data.role);
        setOrganizationNumber(data.organizationNumber);
        setProfilePicture(data.profilePicture);
      } catch (error) {
        console.error("Feil ved sjekk av innloggingsstatus:", error);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogin = async (
    e: React.FormEvent,
    password: string
  ): Promise<boolean> => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_URL}/api/account/login`,
        { email, password },
        { withCredentials: true }
      );
      const { data } = response;
      setMessage("Innlogging vellykket!");
      setIsLoggedIn(true);
      setName(data.name);
      setEmail(data.email);
      setRole(data.role);
      setOrganizationNumber(data.organizationNumber);
      setProfilePicture(data.profilePicture);
      return true; // Returner true hvis innloggingen var vellykket
    } catch (error: any) {
      setMessage(
        error.response?.data?.message || "Innlogging feilet! Prøv igjen."
      );
      return false; // Returner false hvis innloggingen feilet
    }
  };

  const handleRegistration = async (
    e: React.FormEvent,
    password: string
  ): Promise<boolean> => {
    e.preventDefault();
    setMessage("");

    try {
      await axios.post(
        `${API_URL}/api/account/register`,
        { name, email, password, role, organizationNumber },
        { withCredentials: true }
      );

      setIsLoggedIn(true);
      setName(name);
      setEmail(email);
      setRole(role);
      setOrganizationNumber(organizationNumber);
      setMessage("Registrert! Du kan nå logge inn.");
      return true; // Returner true hvis registreringen var vellykket
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;

        if (status === 409) {
          setMessage(
            "E-post er allerede i bruk. Prøv en annen, eller logg inn."
          );
        } else if (status === 400 && data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          setMessage(
            `Registrering feilet:<ul><li>${errorMessages.join(
              "</li><li>"
            )}</ul>`
          );
        } else {
          setMessage(data.message || "En uventet feil oppstod.");
        }
      } else {
        setMessage("Nettverksfeil. Prøv igjen senere.");
      }
      return false; // Returner false hvis registreringen feilet
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_URL}/api/account/logout`,
        {},
        { withCredentials: true }
      );
      setMessage("Logout successful");
      setIsLoggedIn(false);
      setName("");
      setEmail("");
      setRole("");
      setOrganizationNumber("");
      setProfilePicture("");
      window.location.reload();
    } catch (error) {
      setMessage("Utlogging feilet! Prøv igjen.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        name,
        setName,
        email,
        setEmail,
        role,
        setRole,
        organizationNumber,
        setOrganizationNumber,
        profilePicture,
        message,
        setMessage,
        isLoggedIn,
        setIsLoggedIn,
        loading,
        handleLogin,
        handleRegistration,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth må brukes innenfor AuthProvider");
  }
  return context;
};
