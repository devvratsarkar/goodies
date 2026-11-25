"use client";

import { useState } from "react";
import { useFormik } from "formik";
import { useTranslations } from "next-intl";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { RequiredMark } from "@/components/form/RequiredMark";
import { useModal } from "@/components/layout/common/ModalProvider";
import { useChangePasswordMutation } from "@/store/endpoints/userApi";
import { changePasswordValidationSchema } from "@/validations";

const fieldClassName =
  "h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm font-normal text-foreground outline-none transition-colors placeholder:text-muted/70 focus:border-primary focus:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-invalid:border-primary";

function Form({ onDone }: { onDone: () => void }) {
  const t = useTranslations("AccountPage");
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const formik = useFormik({
    initialValues: { currentPassword: "", password: "", confirmPassword: "" },
    validationSchema: changePasswordValidationSchema,
    onSubmit: async (values) => {
      await changePassword({
        current_password: values.currentPassword,
        password: values.password,
        password_confirmation: values.confirmPassword,
      }).unwrap();
      onDone();
    },
  });

  function error(name: "currentPassword" | "password" | "confirmPassword") {
    const key = formik.touched[name] ? formik.errors[name] : undefined;
    return key ? t(key as "required" | "tooShort" | "lowercase" | "uppercase" | "number" | "special" | "passwordMismatch" | "passwordSame") : undefined;
  }

  const fields = [
    { name: "currentPassword" as const, label: t("currentPassword"), autoComplete: "current-password", shown: showCurrent, toggle: () => setShowCurrent((v) => !v) },
    { name: "password" as const, label: t("newPassword"), autoComplete: "new-password", shown: showPassword, toggle: () => setShowPassword((v) => !v) },
    { name: "confirmPassword" as const, label: t("confirmPassword"), autoComplete: "new-password", shown: showConfirm, toggle: () => setShowConfirm((v) => !v) },
  ];

  return (
    <form noValidate onSubmit={formik.handleSubmit} className="grid gap-4">
      {fields.map((field) => (
        <label key={field.name} className="block text-[13px] font-semibold text-heading">
          {field.label}
          <RequiredMark />
          <span className="relative mt-1 block">
            <input
              name={field.name}
              type={field.shown ? "text" : "password"}
              autoComplete={field.autoComplete}
              value={formik.values[field.name]}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={Boolean(error(field.name))}
              className={`${fieldClassName} pe-12`}
            />
            <button
              type="button"
              onClick={field.toggle}
              aria-label={field.shown ? t("hidePassword") : t("showPassword")}
              aria-pressed={field.shown}
              className="absolute inset-e-1.5 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors hover:bg-primary-soft hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {field.shown ? <LuEyeOff aria-hidden className="size-4" /> : <LuEye aria-hidden className="size-4" />}
            </button>
          </span>
          {error(field.name) ? <p className="mt-1.5 text-xs font-normal text-primary">{error(field.name)}</p> : null}
        </label>
      ))}
      <button
        type="submit"
        disabled={isLoading}
        className="mt-1 inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {t("updatePassword")}
      </button>
    </form>
  );
}

export function useOpenChangePassword() {
  const t = useTranslations("AccountPage");
  const { openModal, closeModal } = useModal();
  return () => openModal({ title: t("changePassword"), size: "sm", content: <Form onDone={closeModal} /> });
}
