import * as React from "react";
import { cn } from "../../utils/cn";

type TabsContextValue = {
  value: string;
  setValue: (val: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs components must be used within <Tabs>");
  return ctx;
}

type TabsProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
};

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
}: TabsProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState<string>(defaultValue ?? "");
  const current = isControlled ? (value as string) : internal;

  const setValue = React.useCallback(
    (val: string) => {
      if (!isControlled) setInternal(val);
      onValueChange?.(val);
    },
    [isControlled, onValueChange],
  );

  const ctx: TabsContextValue = React.useMemo(
    () => ({ value: current, setValue }),
    [current, setValue],
  );

  return (
    <TabsContext.Provider value={ctx}>
      <div className={cn("w-full h-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

type TabsListProps = React.HTMLAttributes<HTMLDivElement>;
export function TabsList({ className, ...props }: TabsListProps) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-6",
        "border-b border-gray-200 dark:border-gray-700",
        className,
      )}
      {...props}
    />
  );
}

type TabsTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
  disabled?: boolean;
};

export function TabsTrigger({
  value,
  className,
  disabled,
  children,
  ...props
}: TabsTriggerProps) {
  const { value: current, setValue } = useTabsContext();
  const isActive = current === value;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && setValue(value)}
      className={cn(
        "relative px-1 pb-3 text-sm font-medium transition-colors",
        "focus:outline-none",
        disabled && "cursor-not-allowed opacity-60",
        isActive
          ? "text-[#487FFF] border-b-2 border-[#487FFF] -mb-[2px]"
          : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

type TabsContentProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
};
export function TabsContent({
  value,
  className,
  children,
  ...props
}: TabsContentProps) {
  const { value: current } = useTabsContext();
  const isActive = current === value;
  return (
    <div className={cn(isActive ? "block" : "hidden", className)} {...props}>
      {children}
    </div>
  );
}

export default Object.assign(Tabs, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
});
