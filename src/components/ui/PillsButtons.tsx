import { borderColors, bgColors, textColors } from "../../config/branding";
import { cn } from "../../utils/cn";


type PillsButtonsProps = {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    isActive?: boolean;
}

export default function PillsButtons({ label, icon, onClick, isActive }: PillsButtonsProps) {
    return(
        <div>
            <button onClick={onClick} className={cn("rounded-full border px-4 py-2 text-sm font-medium", 
                isActive ? cn(textColors.white, bgColors.brandStart, borderColors.brandEnd) : cn(textColors.textSecondaryLight, borderColors.stock, bgColors.white)
            )}>
                {icon}
                {label}
            </button>

        </div>
    )
}