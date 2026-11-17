"use client";

import { useRef } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

/** Runs the gateway only when the shopper clicks Place order and checkout is ready. */
export function usePlaceWhenSignedIn(place: () => void, ready: boolean) {
  const { token } = useAuth();
  const placeOrder = useRef(place);
  placeOrder.current = place;
  const canPlace = useRef(Boolean(token) && ready);
  canPlace.current = Boolean(token) && ready;

  return function requestPlace() {
    if (!canPlace.current) return;
    placeOrder.current();
  };
}
