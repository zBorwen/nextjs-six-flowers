"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, type RegisterPayload } from "@rikka/shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw } from "lucide-react";

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
    } catch (err: any) {
      toast.error(err.message);
      refreshCaptcha();
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
            <h1 className="text-2xl font-bold">Sign Up</h1>
            <p className="text-stone-400 text-sm">Create your Rikka account</p>
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

          <div className="space-y-1">
             <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Captcha</label>
             <div className="flex gap-3">
                 <Input 
                   placeholder="ABCD"
                   className="uppercase font-mono tracking-widest"
                   error={errors.captcha?.message}
                   {...register("captcha")} 
                 />
                 <div className="relative shrink-0 cursor-pointer group" onClick={refreshCaptcha}>
                     <img src={captchaUrl} alt="Captcha" className="h-12 w-32 rounded-xl object-cover border border-stone-200" />
                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl flex items-center justify-center">
                         <RefreshCw className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                     </div>
                 </div>
             </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
          
          <div className="text-center text-sm text-stone-500">
              Already have an account? <Link href="/login" className="font-bold text-stone-900 hover:underline">Log in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
