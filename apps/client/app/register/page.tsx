"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, type RegisterPayload } from "@rikka/shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, Hexagon } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [captchaUrl, setCaptchaUrl] = useState("/api/captcha");
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterPayload>({
    resolver: zodResolver(RegisterSchema),
  });

  const refreshCaptcha = () => {
    setCaptchaUrl(`/api/captcha?t=${Date.now()}`);
  };

  const onSubmit = async (data: RegisterPayload) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Registration failed");
      }

      toast.success("Registration successful! Please login.");
      router.push("/login");
    } catch (err: unknown) {
        toast.error("An unexpected error occurred");
        console.error(err);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Right: Branding Side (Hidden on Mobile) - Swapped side for variety? No, keep left for consistency */}
      <div className="hidden lg:flex w-1/2 bg-stone-900 relative items-center justify-center overflow-hidden">
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         
         <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-rikka-blue/20 rounded-full blur-[100px] animate-pulse"></div>
         <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-rikka-green/20 rounded-full blur-[80px]"></div>

         <div className="relative z-10 text-center p-12 max-w-lg">
             <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl mx-auto mb-8 flex items-center justify-center border border-white/10 shadow-2xl -rotate-12 hover:rotate-0 transition-transform duration-500">
                 <Hexagon className="size-12 text-white fill-white/20" />
             </div>
             <h1 className="text-5xl font-black text-white mb-6 tracking-tight">Join the Game</h1>
             <p className="text-xl text-stone-300 leading-relaxed font-light">
                 Create your account to track your progress, climb the leaderboard, and challenge players worldwide.
             </p>
         </div>
         
         <div className="absolute bottom-8 text-stone-500 text-xs font-mono uppercase tracking-widest">
             © 2025 Rikka Project
         </div>
      </div>

      {/* Left: Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col relative bg-stone-50/50">
        <div className="absolute top-8 left-8">
            <Link href="/" className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-medium">
                <ArrowLeft className="size-4" />
                Back to Login
            </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-8">
            <div className="mb-10">
                <h2 className="text-3xl font-bold text-stone-900 mb-2">Create Account</h2>
                <p className="text-stone-500">Enter your phone number and choose a password.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Phone Number"
                type="tel"
                placeholder="13800000000"
                error={errors.phone?.message}
                {...register("phone")}
                className="bg-white"
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
                className="bg-white"
              />

              <div className="space-y-1">
                 <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Captcha</label>
                 <div className="flex gap-3">
                     <Input 
                       placeholder="ABCD"
                       className="uppercase font-mono tracking-widest bg-white"
                       error={errors.captcha?.message}
                       {...register("captcha")} 
                     />
                     <div className="relative shrink-0 cursor-pointer group" onClick={refreshCaptcha}>
                         {/* eslint-disable-next-line @next/next/no-img-element */}
                         <img src={captchaUrl} alt="Captcha" className="h-10 w-32 rounded-xl object-cover border border-stone-200 shadow-sm" />
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl flex items-center justify-center">
                             <RefreshCw className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md size-5" />
                         </div>
                     </div>
                 </div>
              </div>

              <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-stone-200" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Creating Account...
                    </div>
                ) : (
                    "Create Account"
                )}
              </Button>
              
              <div className="text-center mt-8 text-sm text-stone-500">
                  Already have an account? <Link href="/login" className="font-bold text-stone-900 hover:text-rikka-purple transition-colors">Log in</Link>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
}
