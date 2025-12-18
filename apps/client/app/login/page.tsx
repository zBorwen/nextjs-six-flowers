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
import { Hexagon } from "lucide-react";
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
        password: data.password,
      });

      if (result?.error) {
        throw new Error("Invalid phone or password"); 
      }

      toast.success("欢迎回来！");
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      toast.error("登录失败，请检查手机号或密码");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Left: Branding Side (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-stone-900 relative items-center justify-center overflow-hidden">
         {/* Background Pattern */}
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         
         {/* Decorative Elements */}
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rikka-purple/30 rounded-full blur-[100px] animate-pulse"></div>
         <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rikka-red/20 rounded-full blur-[80px]"></div>

         <div className="relative z-10 text-center p-12 max-w-lg">
             <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl mx-auto mb-8 flex items-center justify-center border border-white/10 shadow-2xl rotate-12 hover:rotate-0 transition-transform duration-500">
                 <Hexagon className="size-12 text-white fill-white/20" />
             </div>
             <h1 className="text-5xl font-black text-white mb-6 tracking-tight">Rikka</h1>
             <p className="text-xl text-stone-300 leading-relaxed font-light">
                 Experience the elegance of Riichi Mahjong in a modern, immersive environment. Join the table and claim your victory.
             </p>
         </div>
         
         {/* Footer copyright or tagline */}
         <div className="absolute bottom-8 text-stone-500 text-xs font-mono uppercase tracking-widest">
             © 2025 Rikka Project
         </div>
      </div>

      {/* Right: Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col relative bg-stone-50/50">
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-8">
            <div className="mb-10">
                <h2 className="text-3xl font-bold text-stone-900 mb-2">欢迎回来</h2>
                <p className="text-stone-500">请输入您的账号信息登录</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="手机号"
                type="tel"
                placeholder="13800000000"
                error={errors.phone?.message}
                {...register("phone")}
                className="bg-white"
              />

              <div className="space-y-1">
                  <Input
                    label="密码"
                    type="password"
                    placeholder="••••••••"
                    error={errors.password?.message}
                    {...register("password")}
                    className="bg-white"
                  />
                  {/* <div className="flex justify-end">
                    <Link href="#" className="text-xs font-medium text-stone-500 hover:text-stone-900">Forgot Password?</Link>
                  </div> */}
              </div>

              <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-stone-200" size="lg" disabled={loading}>
                {loading ? (
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        登录中...
                    </div>
                ) : (
                    "登录"
                )}
              </Button>

              <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-stone-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-stone-50 px-2 text-stone-400 font-medium">或</span>
                  </div>
              </div>

              <div className="text-center mt-8 text-sm text-stone-500">
                  还没有账号？ <Link href="/register" className="font-bold text-stone-900 hover:text-rikka-purple transition-colors">注册账号</Link>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
}
