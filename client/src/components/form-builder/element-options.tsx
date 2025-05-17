import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormElement } from "@/lib/utils/form-elements";
import { X, Plus } from "lucide-react";

interface ElementOptionsProps {
  element: FormElement;
  onChange: (updates: Partial<FormElement>) => void;
}

export function ElementOptions({ element, onChange }: ElementOptionsProps) {
  // Update an element property
  const handleChange = (key: string, value: any) => {
    onChange({ [key]: value });
  };

  // Add a new option (for select, radio, checkbox)
  const handleAddOption = () => {
    const newOptions = [...(element.options || []), `Option ${(element.options?.length || 0) + 1}`];
    onChange({ options: newOptions });
  };

  // Remove an option
  const handleRemoveOption = (index: number) => {
    const newOptions = [...(element.options || [])];
    newOptions.splice(index, 1);
    onChange({ options: newOptions });
  };

  // Update an option value
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(element.options || [])];
    newOptions[index] = value;
    onChange({ options: newOptions });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="element-label">Label</Label>
        <Input
          id="element-label"
          value={element.label || ""}
          onChange={(e) => handleChange("label", e.target.value)}
          className="mt-1"
        />
      </div>

      {element.type !== 'checkbox' && element.type !== 'radio' && (
        <div>
          <Label htmlFor="element-placeholder">Placeholder</Label>
          <Input
            id="element-placeholder"
            value={element.placeholder || ""}
            onChange={(e) => handleChange("placeholder", e.target.value)}
            className="mt-1"
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <Label htmlFor="element-required">Required</Label>
        <Switch
          id="element-required"
          checked={element.required || false}
          onCheckedChange={(checked) => handleChange("required", checked)}
        />
      </div>

      {/* Options for select, radio, checkbox group */}
      {(element.type === 'select' || element.type === 'radio') && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Options</Label>
            <Button 
              type="button" 
              size="sm" 
              variant="outline" 
              onClick={handleAddOption}
              className="h-8 px-2"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {element.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
                <Button 
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemoveOption(index)}
                  className="h-8 w-8 text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {(element.options?.length || 0) === 0 && (
              <p className="text-sm text-gray-500">No options added. Click "Add" to create options.</p>
            )}
          </div>
        </div>
      )}

      {/* Additional properties based on element type */}
      {element.type === 'textarea' && (
        <div>
          <Label htmlFor="element-rows">Rows</Label>
          <Input
            id="element-rows"
            type="number"
            value={element.rows || 3}
            onChange={(e) => handleChange("rows", parseInt(e.target.value) || 3)}
            min={1}
            max={20}
            className="mt-1"
          />
        </div>
      )}

      {element.type === 'number' && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="element-min">Min Value</Label>
            <Input
              id="element-min"
              type="number"
              value={element.min || ""}
              onChange={(e) => handleChange("min", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="element-max">Max Value</Label>
            <Input
              id="element-max"
              type="number"
              value={element.max || ""}
              onChange={(e) => handleChange("max", e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      )}

      {element.type === 'file' && (
        <div>
          <Label htmlFor="element-accept">Accepted File Types</Label>
          <Input
            id="element-accept"
            value={element.accept || ""}
            onChange={(e) => handleChange("accept", e.target.value)}
            placeholder="e.g. .pdf,.doc,.jpg"
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            Comma-separated list of accepted file extensions
          </p>
        </div>
      )}

      {/* Help text / description */}
      <div>
        <Label htmlFor="element-help-text">Help Text</Label>
        <Textarea
          id="element-help-text"
          value={element.helpText || ""}
          onChange={(e) => handleChange("helpText", e.target.value)}
          placeholder="Provide additional instructions for this field"
          className="mt-1"
        />
      </div>
    </div>
  );
}
