import axios from "axios";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  useContext,
} from "react";
import { LangContext } from "./LangContext";
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
  const { t } = useContext(LangContext);

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
      {status === "offline" && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed inset-x-0 top-0 z-100 flex items-center justify-center gap-3 bg-red-600 px-4 py-3 text-center text-sm text-white shadow-md"
        >
          <span>{t.strapiStatus.message}</span>
          <button
            type="button"
            onClick={checkConnection}
            className="shrink-0 rounded-lg border border-white/60 px-3 py-1 font-medium transition hover:bg-white/10"
          >
            {t.strapiStatus.retry}
          </button>
        </div>
      )}

      {children}
    </StrapiStatusContext.Provider>
  );
}
