import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface InputField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface InputSchema {
  fields: InputField[];
}

export interface DynamicFormProps {
  inputSchema: InputSchema;
  onSubmit: (data: Record<string, unknown>) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function DynamicForm({
  inputSchema,
  onSubmit,
  isLoading = false,
  submitLabel = 'Generate',
}: DynamicFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Record<string, unknown>>();

  const renderField = (field: InputField) => {
    const errorMessage = errors[field.name]?.message as string | undefined;

    const validationRules = {
      required: field.required ? `${field.label} is required` : false,
      ...(field.validation?.minLength && {
        minLength: {
          value: field.validation.minLength,
          message: `${field.label} must be at least ${field.validation.minLength} characters`,
        },
      }),
      ...(field.validation?.maxLength && {
        maxLength: {
          value: field.validation.maxLength,
          message: `${field.label} must be at most ${field.validation.maxLength} characters`,
        },
      }),
      ...(field.validation?.pattern && {
        pattern: {
          value: new RegExp(field.validation.pattern),
          message: `${field.label} format is invalid`,
        },
      }),
    };

    switch (field.type) {
      case 'text':
        return (
          <Controller
            key={field.name}
            name={field.name}
            control={control}
            rules={validationRules}
            defaultValue=""
            render={({ field: controllerField }) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Input
                  id={field.name}
                  placeholder={field.placeholder}
                  {...controllerField}
                  value={controllerField.value as string}
                />
                {errorMessage && (
                  <p className="text-sm text-destructive">{errorMessage}</p>
                )}
              </div>
            )}
          />
        );

      case 'textarea':
        return (
          <Controller
            key={field.name}
            name={field.name}
            control={control}
            rules={validationRules}
            defaultValue=""
            render={({ field: controllerField }) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Textarea
                  id={field.name}
                  placeholder={field.placeholder}
                  rows={4}
                  {...controllerField}
                  value={controllerField.value as string}
                />
                {errorMessage && (
                  <p className="text-sm text-destructive">{errorMessage}</p>
                )}
              </div>
            )}
          />
        );

      case 'number':
        return (
          <Controller
            key={field.name}
            name={field.name}
            control={control}
            rules={validationRules}
            defaultValue=""
            render={({ field: controllerField }) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Input
                  id={field.name}
                  type="number"
                  placeholder={field.placeholder}
                  {...controllerField}
                  value={controllerField.value as string}
                  onChange={(e) => controllerField.onChange(e.target.value ? Number(e.target.value) : '')}
                />
                {errorMessage && (
                  <p className="text-sm text-destructive">{errorMessage}</p>
                )}
              </div>
            )}
          />
        );

      case 'select':
        return (
          <Controller
            key={field.name}
            name={field.name}
            control={control}
            rules={validationRules}
            defaultValue=""
            render={({ field: controllerField }) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Select
                  value={controllerField.value as string}
                  onValueChange={controllerField.onChange}
                >
                  <SelectTrigger id={field.name}>
                    <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errorMessage && (
                  <p className="text-sm text-destructive">{errorMessage}</p>
                )}
              </div>
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {inputSchema.fields.map(renderField)}
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Generating...' : submitLabel}
      </Button>
    </form>
  );
}
