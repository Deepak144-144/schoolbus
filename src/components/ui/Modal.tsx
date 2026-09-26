"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  footer,
  size = "md",
  children,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) {
    return <div style={{ display: "none" }}>{children}</div>;
  }

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  const content = (
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={handleClick}
      >
        <div
          className={cn(
            "bg-card border border-border/30 rounded-[16px] shadow-2xl w-full",
            sizeClasses[size]
          )}
        >
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-primary">{title}</h3>
              <button
                onClick={onClose}
                className="h-6 w-6 rounded-lg hover:bg-secondary/10 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-secondary" />
              </button>
            </div>
            {description && (
              <p className="text-sm text-secondary mt-1">{description}</p>
            )}
          </div>
          <div className="px-6 pb-6">{children}</div>
          {footer && <div className="p-6 pt-0">{footer}</div>}
        </div>
      </div>
    </>
  );

  return typeof document !== "undefined"
    ? createPortal(content, document.body)
    : null;
}
