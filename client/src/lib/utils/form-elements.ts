// Form element interface
export interface FormElement {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<string | { label: string; value: string }>;
  helpText?: string;
  rows?: number;
  min?: string | number;
  max?: string | number;
  accept?: string;
  [key: string]: any;
}

// Define available form element types (icons are now imported from a separate file)
export const formElementTypes = [
  {
    type: "text",
    label: "Text Field",
    defaultLabel: "Text Field",
    hasPlaceholder: true,
    hasOptions: false,
    iconType: "text"
  },
  {
    type: "email",
    label: "Email",
    defaultLabel: "Email",
    hasPlaceholder: true,
    hasOptions: false,
    iconType: "email"
  },
  {
    type: "password",
    label: "Password",
    defaultLabel: "Password",
    hasPlaceholder: true,
    hasOptions: false,
    iconType: "password"
  },
  {
    type: "number",
    label: "Number",
    defaultLabel: "Number",
    hasPlaceholder: true,
    hasOptions: false,
    iconType: "number"
  },
  {
    type: "tel",
    label: "Phone Number",
    defaultLabel: "Phone Number",
    hasPlaceholder: true,
    hasOptions: false,
    iconType: "tel"
  },
  {
    type: "textarea",
    label: "Text Area",
    defaultLabel: "Text Area",
    hasPlaceholder: true,
    hasOptions: false,
    iconType: "textarea"
  },
  {
    type: "checkbox",
    label: "Checkbox",
    defaultLabel: "Checkbox",
    hasPlaceholder: false,
    hasOptions: false,
    iconType: "checkbox"
  },
  {
    type: "radio",
    label: "Radio Buttons",
    defaultLabel: "Radio Button Group",
    hasPlaceholder: false,
    hasOptions: true,
    iconType: "radio"
  },
  {
    type: "select",
    label: "Dropdown",
    defaultLabel: "Dropdown",
    hasPlaceholder: true,
    hasOptions: true,
    iconType: "select"
  },
  {
    type: "date",
    label: "Date Picker",
    defaultLabel: "Date",
    hasPlaceholder: false,
    hasOptions: false,
    iconType: "date"
  },
  {
    type: "file",
    label: "File Upload",
    defaultLabel: "File Upload",
    hasPlaceholder: false,
    hasOptions: false,
    iconType: "file"
  },
];

// Get default value for a form element based on its type
export function getDefaultValueForElementType(type: string): any {
  switch (type) {
    case "checkbox":
      return false;
    case "number":
      return 0;
    case "select":
    case "radio":
      return "";
    default:
      return "";
  }
}

// Validate form element value
export function validateFormElementValue(element: FormElement, value: any): string | null {
  // Skip validation if field is not required and value is empty
  if (!element.required && (value === "" || value === null || value === undefined)) {
    return null;
  }

  switch (element.type) {
    case "email":
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      if (!emailRegex.test(value)) {
        return "Please enter a valid email address";
      }
      break;
    case "tel":
      const phoneRegex = /^\+?[0-9\s\-()]{6,20}$/;
      if (!phoneRegex.test(value)) {
        return "Please enter a valid phone number";
      }
      break;
    case "number":
      if (isNaN(Number(value))) {
        return "Please enter a valid number";
      }
      if (element.min !== undefined && Number(value) < Number(element.min)) {
        return `Value must be at least ${element.min}`;
      }
      if (element.max !== undefined && Number(value) > Number(element.max)) {
        return `Value must be at most ${element.max}`;
      }
      break;
    default:
      if (element.required && (value === "" || value === null || value === undefined)) {
        return "This field is required";
      }
  }

  return null;
}
