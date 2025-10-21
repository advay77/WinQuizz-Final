"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Controller, FormProvider, useFormContext, ControllerProps } from "react-hook-form";
import { cn } from "../../lib/utils";
import { Label, type LabelProps } from "@/components/ui/label";

// Form provider
const Form = FormProvider;

// Context types
interface FormFieldContextValue {
  name: string;
}
const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

interface FormItemContextValue {
  id: string;
}
const FormItemContext = React.createContext<FormItemContextValue | null>(null);

// FormField wrapper
interface FormFieldProps<T> extends ControllerProps<T> {}
const FormField = <T,>({ ...props }: FormFieldProps<T>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name as string }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

// Hook for consuming field state
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }
  if (!itemContext) {
    throw new Error("useFormField should be used within <FormItem>");
  }

  const fieldState = getFieldState(fieldContext.name, formState);
  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

// FormItem component
interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {}
const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(({ className, ...props }, ref) => {
  const id = React.useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

// FormLabel component

const FormLabel = React.forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();
  return <Label ref={ref} className={cn(error && "text-destructive", className)} htmlFor={formItemId} {...props} />;
});
FormLabel.displayName = "FormLabel";

// FormControl component
interface FormControlProps extends React.HTMLAttributes<HTMLElement> {}
const FormControl = React.forwardRef<HTMLElement, FormControlProps>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={!error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

// FormDescription component
interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
const FormDescription = React.forwardRef<HTMLParagraphElement, FormDescriptionProps>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();
  return <p ref={ref} id={formDescriptionId} className={cn("text-[0.8rem] text-muted-foreground", className)} {...props} />;
});
FormDescription.displayName = "FormDescription";

// FormMessage component
interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
}
const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : children;

  if (!body) return null;

  return (
    <p ref={ref} id={formMessageId} className={cn("text-[0.8rem] font-medium text-destructive", className)} {...props}>
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField };
