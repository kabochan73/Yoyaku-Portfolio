"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AxiosError } from "axios";
import { useUser, type User } from "@/hooks/useUser";

const schema = z
  .object({
    name: z.string().min(1, "名前を入力してください").max(20, "名前は20文字以内で入力してください"),
    email: z.email("メールアドレスの形式が正しくありません"),
    currentPassword: z.string().optional(),
    password: z.string().optional(),
    passwordConfirmation: z.string().optional(),
  })
  .refine((d) => !d.password || d.password.length >= 8, {
    message: "パスワードは8文字以上で入力してください",
    path: ["password"],
  })
  .refine((d) => !d.password || !!d.currentPassword, {
    message: "現在のパスワードを入力してください",
    path: ["currentPassword"],
  })
  .refine((d) => !d.password || d.password === d.passwordConfirmation, {
    message: "パスワードが一致しません",
    path: ["passwordConfirmation"],
  });

type FormData = z.infer<typeof schema>;

export function ProfileForm({ user }: { user: User }) {
  const { updateProfile } = useUser();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: user.name, email: user.email },
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    setSuccessMessage(null);
    try {
      await updateProfile({
        name: data.name,
        email: data.email,
        ...(data.password && {
          current_password: data.currentPassword,
          password: data.password,
          password_confirmation: data.passwordConfirmation,
        }),
      });
      setSuccessMessage("プロフィールを更新しました。");
      reset({ name: data.name, email: data.email });
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 422) {
        setServerError(error.response.data.message ?? "入力内容を確認してください。");
      } else {
        setServerError("更新に失敗しました。時間をおいて再度お試しください。");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">お名前</label>
        <input
          type="text"
          {...register("name")}
          className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>}
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
          メールアドレス
        </label>
        <input
          type="email"
          {...register("email")}
          className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="border-t border-zinc-200 pt-5">
        <p className="mb-3 text-xs text-zinc-500">
          パスワードを変更する場合のみ入力してください
        </p>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              現在のパスワード
            </label>
            <input
              type="password"
              {...register("currentPassword")}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            {errors.currentPassword && (
              <p className="mt-1.5 text-xs text-red-500">{errors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              新しいパスワード
            </label>
            <input
              type="password"
              {...register("password")}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="8文字以上"
            />
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              新しいパスワード（確認）
            </label>
            <input
              type="password"
              {...register("passwordConfirmation")}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            {errors.passwordConfirmation && (
              <p className="mt-1.5 text-xs text-red-500">
                {errors.passwordConfirmation.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {serverError && <p className="text-center text-xs text-red-500">{serverError}</p>}
      {successMessage && (
        <p className="text-center text-xs text-green-600">{successMessage}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "更新中..." : "更新する"}
      </button>
    </form>
  );
}
