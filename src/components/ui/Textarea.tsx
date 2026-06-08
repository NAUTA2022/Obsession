import * as React from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  // future variants could go here
};

const baseTextareaClasses =
  "w-full min-h-[120px] rounded-lg border border-gray-300 bg-white pl-4 pr-3 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-60 resize-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-primary-900";

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, ...props },
  ref
) {
  return <textarea ref={ref} className={cn(baseTextareaClasses, className)} {...props} />;
});

export default Textarea;

