import * as React from "react";
import { cn } from "../../utils/cn";

type SwitchProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

export default function Switch({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  className,
  ...props
}: SwitchProps) {
  const isControlled = typeof checked === "boolean";
  const [internal, setInternal] = React.useState<boolean>(defaultChecked ?? false);
  const isOn = isControlled ? (checked as boolean) : internal;

  const toggle = () => {
    if (disabled) return;
    const next = !isOn;
    if (!isControlled) setInternal(next);
    onCheckedChange?.(next);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-disabled={disabled}
      onClick={toggle}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
        isOn ? "bg-[#487FFF]" : "bg-[#9CA3AF]",
        disabled && "opacity-60 cursor-not-allowed",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none absolute left-0.5 top-0.5 inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
          isOn ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

