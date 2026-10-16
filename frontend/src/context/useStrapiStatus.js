import { useContext } from "react";
import { StrapiStatusContext } from "./StrapiStatusStore";

export function useStrapiStatus() {
  const context = useContext(StrapiStatusContext);

  if (!context) {
    throw new Error("useStrapiStatus must be used inside StrapiStatusProvider");
  }

  return context;
}
