import axios from "axios";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { StrapiStatusContext } from "./StrapiStatusStore";

const STRAPI_URL = "http://localhost:1337";

function isStrapiRequest(config) {
  if (!config?.url) return false;

  try {
    return new URL(config.url, config.baseURL || STRAPI_URL).origin === STRAPI_URL;
  } catch {
    return false;
  }
}

function isConnectionFailure(error) {
  return !error.response || error.response.status >= 500;
}

export function StrapiStatusProvider({ children }) {
  const [status, setStatus] = useState("online");

  const checkConnection = useCallback(async () => {
    try {
      await axios.get(`${STRAPI_URL}/api/my-contact`, { timeout: 8000 });
      setStatus("online");
      return true;
    } catch (error) {
      if (error.response && !isConnectionFailure(error)) {
        setStatus("online");
        return true;
      }

      setStatus("offline");
      return false;
    }
  }, []);

  useLayoutEffect(() => {
    const handleSuccess = (response) => {
      if (isStrapiRequest(response.config)) setStatus("online");
      return response;
    };

    const handleError = (error) => {
      if (isStrapiRequest(error.config)) {
        setStatus(isConnectionFailure(error) ? "offline" : "online");
      }

      return Promise.reject(error);
    };

    const interceptorId = axios.interceptors.response.use(handleSuccess, handleError);
    return () => axios.interceptors.response.eject(interceptorId);
  }, []);

  useEffect(() => {
    if (status !== "offline") return undefined;

    const intervalId = window.setInterval(checkConnection, 15000);
    return () => window.clearInterval(intervalId);
  }, [status, checkConnection]);

  return (
    <StrapiStatusContext.Provider
      value={{
        status,
        isOffline: status === "offline",
        checkConnection,
      }}
    >
      {children}
    </StrapiStatusContext.Provider>
  );
}
