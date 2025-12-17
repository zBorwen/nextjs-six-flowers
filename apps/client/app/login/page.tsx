"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginPayload } from "@rikka/shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginPayload) => {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
          redirect: false,
          phone: data.phone,
          password: data.password
      });

      if (result?.error) {
          throw new Error("Invalid phone or password"); // NextAuth default error generic
      }

      toast.success("Welcome back!");
      router.push("/");
      router.refresh();
      
    } catch (err: any) {
      toast.error(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-200">
        <div className="bg-stone-900 p-6 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
             <Link href="/" className="absolute left-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full transition-colors">
                 <ArrowLeft className="size-5" />
            </Link>
            <h1 className="text-2xl font-bold">Rikka Login</h1>
            <p className="text-stone-400 text-sm">Enter the world of Six Flowers</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <Input
            label="Phone Number"
            type="tel"
            placeholder="13800000000"
            error={errors.phone?.message}
            {...register("phone")}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </Button>

          <div className="text-center text-sm text-stone-500">
              New player? <Link href="/register" className="font-bold text-stone-900 hover:underline">Create Account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
