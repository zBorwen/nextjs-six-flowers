import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

interface ProfileCardProps {
    name: string;
    id?: string;
    score?: number; // Optional for now
}

export function ProfileCard({ name, id, score }: ProfileCardProps) {
    // Generate deterministic avatar or use placeholder
    const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`;

    return (
        <Card className="bg-white/80 backdrop-blur-md border-stone-200 shadow-lg overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-rikka-purple to-rikka-red relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                <div className="absolute -bottom-8 left-6 border-4 border-white rounded-full bg-stone-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={avatarUrl} 
                        alt={name} 
                        className="w-20 h-20 rounded-full bg-stone-100 object-cover" 
                    />
                </div>
            </div>
            <CardContent className="pt-10 pb-6 px-6">
                 <div className="flex justify-between items-start">
                     <div>
                         <h2 className="text-xl font-bold text-stone-900">{name}</h2>
                         <p className="text-stone-500 text-xs font-mono mt-1">ID: {id?.substring(0, 8) || 'Guest'}</p>
                     </div>
                     <Button variant="ghost" size="icon" className="text-stone-400 hover:text-red-500" onClick={() => signOut()}>
                         <LogOut className="size-5" />
                     </Button>
                 </div>
                 
                 <div className="mt-6 flex gap-4">
                     <div className="flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-lg text-sm font-medium text-stone-700">
                         <Trophy className="size-4 text-yellow-600" />
                         <span>Score: {score ?? 1000}</span>
                     </div>
                     <Badge variant="outline" className="text-stone-500 border-stone-300 font-normal">
                         {/* Dynamic title logic later */}
                         Novice
                     </Badge>
                 </div>
            </CardContent>
        </Card>
    );
}
