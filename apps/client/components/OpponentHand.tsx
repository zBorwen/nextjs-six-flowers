import { Card } from "./Card";
import { Player } from "@rikka/shared";

interface OpponentHandProps {
    player: Player;
}

export function OpponentHand({ player }: OpponentHandProps) {
    if (!player) return null;

    // Use player.hand length to render hidden cards
    return (
        <div className="flex justify-center items-start gap-[-1.5rem] p-4 scale-75 opacity-90">
            {player.hand.map((card, index) => (
                 <div key={index} style={{ zIndex: index, marginLeft: index === 0 ? 0 : -30 }}>
                     <Card 
                        card={card}
                        isHidden 
                        className="w-20 h-32"
                    />
                 </div>
            ))}
        </div>
    );
}
