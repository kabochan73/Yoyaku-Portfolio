"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import { useUser } from "@/hooks/useUser";

const schema = z
  .object({
    name: z.string().min(1, "名前を入力してください").max(20, "名前は20文字以内で入力してください"),
    email: z.email("メールアドレスの形式が正しくありません"),
    password: z.string().min(8, "パスワードは8文字以上で入力してください"),
    password_confirmation: z.string().min(1, "パスワード（確認）を入力してください"),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "パスワードが一致しません",
    path: ["password_confirmation"],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { user, register: registerUser } = useUser();
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      await registerUser(data);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 422) {
        const firstError = Object.values(error.response.data.errors ?? {})[0];
        setServerError(Array.isArray(firstError) ? firstError[0] : "入力内容を確認してください。");
      } else {
        setServerError("登録に失敗しました。時間をおいて再度お試しください。");
      }
    }
  };

  return (
    <div className="flex w-full flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="mb-8 text-center text-2xl font-bold text-zinc-900">新規登録</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">お名前</label>
            <input
              type="text"
              {...register("name")}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="山田 太郎"
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
              placeholder="example@mail.com"
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              パスワード
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
              パスワード（確認）
            </label>
            <input
              type="password"
              {...register("password_confirmation")}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="••••••••"
            />
            {errors.password_confirmation && (
              <p className="mt-1.5 text-xs text-red-500">{errors.password_confirmation.message}</p>
            )}
          </div>
          {serverError && <p className="text-center text-xs text-red-500">{serverError}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "登録中..." : "アカウントを作成"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-500">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" className="font-medium text-green-600 underline underline-offset-2">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
