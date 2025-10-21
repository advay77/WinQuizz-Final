"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";
import { Input } from "../ui/input";

type ValidationFunction =
  | ((value: string) => boolean | string)
  | ((value: string) => Promise<boolean | string>);

interface EnhancedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  validation?: ValidationFunction;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  asyncValidation?: boolean;
  validationDelay?: number;
  className?: string;
}

const EnhancedInput: React.FC<EnhancedInputProps> = ({
  validation,
  value,
  onChange,
  asyncValidation = false,
  validationDelay = 500,
  className = "",
  ...props
}) => {
  const [status, setStatus] = useState<"idle" | "validating" | "valid" | "invalid">("idle");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!value) {
      setStatus("idle");
      setError("");
      return;
    }

    if (validation) {
      if (asyncValidation) {
        setStatus("validating");
        const timer = setTimeout(async () => {
          try {
            const result = await validation(value);
            if (result === true) {
              setStatus("valid");
              setError("");
            } else {
              setStatus("invalid");
              setError(typeof result === "string" ? result : "Invalid input");
            }
          } catch {
            setStatus("invalid");
            setError("Validation failed");
          }
        }, validationDelay);

        return () => clearTimeout(timer);
      } else {
        const result = validation(value);
        if (result === true) {
          setStatus("valid");
          setError("");
        } else {
          setStatus("invalid");
          setError(typeof result === "string" ? result : "Invalid input");
        }
      }
    }
  }, [value, validation, asyncValidation, validationDelay]);

  const getStatusStyles = (): string => {
    switch (status) {
      case "valid":
        return "border-green-500 focus:ring-green-500/20";
      case "invalid":
        return "border-red-500 focus:ring-red-500/20 animate-[shake_0.5s_ease-in-out]";
      case "validating":
        return "border-blue-500 focus:ring-blue-500/20";
      default:
        return "";
    }
  };

  return (
    <div className="relative">
      <motion.div
        whileFocus={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Input
          {...props}
          value={value}
          onChange={onChange}
          className={`pr-10 transition-all duration-200 ${getStatusStyles()} ${className}`}
        />
      </motion.div>

      {/* Status Icon */}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        <AnimatePresence mode="wait">
          {status === "validating" && (
            <motion.div
              key="validating"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Loader className="w-4 h-4 text-blue-500 animate-spin" />
            </motion.div>
          )}

          {status === "valid" && (
            <motion.div
              key="valid"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <CheckCircle className="w-4 h-4 text-green-500" />
            </motion.div>
          )}

          {status === "invalid" && (
            <motion.div
              key="invalid"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <AlertCircle className="w-4 h-4 text-red-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && status === "invalid" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-1 text-sm text-red-600"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedInput;
