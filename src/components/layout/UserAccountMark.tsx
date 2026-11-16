"use client";

import { useState } from "react";
import { LuUser } from "react-icons/lu";
import { useAuth } from "@/components/auth/AuthProvider";
import ImageComponent from "@/components/layout/common/ImageComponent";
import { useGetUserProfileQuery } from "@/store/endpoints/userApi";

function photoSrc(photo: string | null | undefined) {
  const value = photo?.trim() ?? "";
  if (!value || value.startsWith("blob:")) return "";
  const origin = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/api\/?$/, "");
  const resolved = value.startsWith("http://") || value.startsWith("https://")
    ? value
    : origin
      ? `${origin}${value.startsWith("/") ? value : `/${value}`}`
      : "";

  try {
    const url = new URL(resolved);
    const allowed = (url.protocol === "https:" && url.hostname === "goodies.plan-it.pro") || url.protocol === "http:";
    return allowed ? resolved : "";
  } catch {
    return "";
  }
}

export function useAccountIdentity() {
  const { token } = useAuth();
  const { data: profile } = useGetUserProfileQuery(undefined, { skip: !token });
  const name = `${profile?.name ?? ""} ${profile?.last_name ?? ""}`.trim();
  const initials = `${profile?.name?.[0] ?? ""}${profile?.last_name?.[0] ?? ""}`.toUpperCase();
  const photo = photoSrc(profile?.profile_pic);

  return { loggedIn: Boolean(token), name, initials, photo };
}

export function UserAccountMark({ className = "size-5.5" }: { className?: string }) {
  const { loggedIn, initials, photo } = useAccountIdentity();
  const [failedSrc, setFailedSrc] = useState("");
  const showPhoto = Boolean(photo) && failedSrc !== photo;

  if (!loggedIn || (!showPhoto && !initials)) {
    return <LuUser aria-hidden className={className} />;
  }

  if (showPhoto) {
    return (
      <span className="relative flex size-8 shrink-0 overflow-hidden rounded-full bg-primary-soft ring-1 ring-border">
        <ImageComponent
          src={photo}
          alt=""
          fill
          sizes="32px"
          objectFit="cover"
          onError={() => setFailedSrc(photo)}
        />
      </span>
    );
  }

  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold uppercase text-primary-foreground">
      {initials}
    </span>
  );
}
