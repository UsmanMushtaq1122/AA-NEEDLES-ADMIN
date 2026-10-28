"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue>({
  open: false,
  setOpen: () => {},
  containerRef: { current: null },
});

interface DropdownMenuProps {
  children: React.ReactNode;
}

function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, containerRef: ref }}>
      <div ref={ref} className="relative inline-block">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

interface DropdownMenuTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

function DropdownMenuTrigger({
  className,
  asChild,
  children,
  onClick,
  ...props
}: DropdownMenuTriggerProps) {
  const { open, setOpen } = React.useContext(DropdownMenuContext);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(!open);
    onClick?.(e);
    if (React.isValidElement<{ onClick?: (e: React.MouseEvent) => void }>(children)) {
      children.props.onClick?.(e);
    }
  };

  const childIsButton =
    React.isValidElement<{ type?: unknown }>(children) &&
    typeof children.type === "string" &&
    children.type === "button";

  if (
    React.isValidElement<{
      className?: string;
      onClick?: React.MouseEventHandler<HTMLButtonElement>;
    }>(children) &&
    (asChild || childIsButton)
  ) {
    return React.cloneElement(children, {
      onClick: handleClick,
      "aria-expanded": open,
      className: cn(children.props.className, className),
      ...props,
    });
  }

  return (
    <button
      type="button"
      className={cn("inline-flex items-center", className)}
      onClick={handleClick}
      aria-expanded={open}
      {...props}
    >
      {children}
    </button>
  );
}

interface DropdownMenuContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
  portal?: boolean;
}

function DropdownMenuContent({
  className,
  align = "start",
  portal = false,
  children,
  ...props
}: DropdownMenuContentProps) {
  const { open, containerRef } = React.useContext(DropdownMenuContext);
  const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null);

  React.useLayoutEffect(() => {
    if (!open || !portal) {
      return;
    }

    const updatePosition = () => {
      const container = containerRef.current;
      if (!container) return;

      const bounds = container.getBoundingClientRect();
      const left = align === "end"
        ? bounds.right - 180
        : align === "center"
          ? bounds.left + (bounds.width - 180) / 2
          : bounds.left;

      setPosition({ top: bounds.bottom + 8, left });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [align, containerRef, open, portal]);

  if (!open) return null;

  const alignment = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  };

  const content = (
    <div
      className={cn(
        "absolute top-full z-50 mt-2 min-w-[180px] overflow-hidden rounded-xl border border-gray-100 bg-white py-1.5 shadow-xl",
        alignment[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );

  if (!portal || !position) {
    return content;
  }

  return createPortal(
    <div
      className={cn(
        "fixed z-[100] min-w-[180px] overflow-hidden rounded-xl border border-gray-100 bg-white py-1.5 shadow-xl",
        className
      )}
      style={position}
      onMouseDown={(event) => event.stopPropagation()}
      {...props}
    >
      {children}
    </div>,
    document.body
  );
}

interface DropdownMenuItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  destructive?: boolean;
}

function DropdownMenuItem({
  className,
  destructive,
  onClick,
  children,
  ...props
}: DropdownMenuItemProps) {
  const { setOpen } = React.useContext(DropdownMenuContext);
  return (
    <button
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50",
        destructive
          ? "text-red-600 hover:bg-red-50"
          : "text-[#1A1A1A]",
        className
      )}
      onClick={(e) => {
        onClick?.(e);
        setOpen(false);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-gray-100" />;
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
};
