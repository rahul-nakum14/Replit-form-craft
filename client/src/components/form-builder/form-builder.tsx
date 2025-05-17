import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormElements } from "@/components/form-builder/form-elements";
import { ElementOptions } from "@/components/form-builder/element-options";
import { Textarea } from "@/components/ui/textarea";
import { FormElement, formElementTypes } from "@/lib/utils/form-elements";
import { getFormIcon } from "@/lib/utils/form-icons";
import { useToast } from "@/hooks/use-toast";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { nanoid } from "nanoid";

interface FormBuilderProps {
  title: string;
  onTitleChange: (title: string) => void;
  elements: FormElement[];
  onChange: (elements: FormElement[]) => void;
}

export function FormBuilder({ title, onTitleChange, elements, onChange }: FormBuilderProps) {
  const { toast } = useToast();
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Get the selected element from the elements array
  const selectedElement = elements.find(el => el.id === selectedElementId);

  // Add an element to the form
  const handleAddElement = (type: string) => {
    const elementTemplate = formElementTypes.find(el => el.type === type);
    
    if (!elementTemplate) {
      toast({
        title: "Error",
        description: `Unknown element type: ${type}`,
        variant: "destructive",
      });
      return;
    }
    
    const newElement: FormElement = {
      id: nanoid(),
      type,
      label: elementTemplate.defaultLabel || `New ${type}`,
      placeholder: elementTemplate.hasPlaceholder ? `Enter ${type}` : undefined,
      required: false,
      options: elementTemplate.hasOptions ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
    };
    
    const updatedElements = [...elements, newElement];
    onChange(updatedElements);
    setSelectedElementId(newElement.id);
    
    toast({
      title: "Element added",
      description: `Added a new ${type} element`,
    });
  };

  // Update an element in the form
  const handleUpdateElement = (id: string, updates: Partial<FormElement>) => {
    const updatedElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    onChange(updatedElements);
  };

  // Delete an element from the form
  const handleDeleteElement = (id: string) => {
    const updatedElements = elements.filter(el => el.id !== id);
    onChange(updatedElements);
    
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
    
    toast({
      title: "Element deleted",
      description: "The form element has been removed",
    });
  };

  // Handle drag and drop reordering
  const moveElement = (dragIndex: number, hoverIndex: number) => {
    const dragElement = elements[dragIndex];
    const newElements = [...elements];
    newElements.splice(dragIndex, 1);
    newElements.splice(hoverIndex, 0, dragElement);
    onChange(newElements);
  };

  // Card for empty state
  const EmptyFormArea = () => (
    <div className="border border-dashed border-gray-300 rounded-md p-8 form-builder-area flex flex-col items-center justify-center bg-gray-50">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 className="text-lg font-medium text-gray-900">Add Elements to Your Form</h3>
      <p className="text-gray-500 text-center mt-2 mb-4">
        Drag and drop elements from the left panel to get started
      </p>
    </div>
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <div className="mb-6">
          <label htmlFor="form-title" className="block text-sm font-medium text-gray-700 mb-1">
            Form Title
          </label>
          <Input
            id="form-title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter form title"
            className="max-w-md text-lg font-medium"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* Form Elements Panel */}
          <div className="md:col-span-3">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Form Elements</h3>
                <div className="space-y-2">
                  {formElementTypes.map((element) => (
                    <div
                      key={element.type}
                      className="bg-gray-50 p-3 rounded-md border border-gray-200 flex items-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                      onClick={() => handleAddElement(element.type)}
                    >
                      <div className="text-gray-400 mr-2">{getFormIcon(element.iconType)}</div>
                      <span className="text-sm text-gray-700">{element.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Building Area */}
          <div className="md:col-span-6">
            <Card>
              <CardContent className="p-6">
                {elements.length === 0 ? (
                  <EmptyFormArea />
                ) : (
                  <div className="space-y-4">
                    {elements.map((element, index) => (
                      <FormElements
                        key={element.id}
                        element={element}
                        isSelected={selectedElementId === element.id}
                        onClick={() => setSelectedElementId(element.id)}
                        onDelete={() => handleDeleteElement(element.id)}
                        index={index}
                        moveElement={moveElement}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Element Options Panel */}
          <div className="md:col-span-3">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Element Properties</h3>
                {selectedElement ? (
                  <ElementOptions
                    element={selectedElement}
                    onChange={(updates) => handleUpdateElement(selectedElement.id, updates)}
                  />
                ) : (
                  <div className="text-sm text-gray-500 p-4 text-center bg-gray-50 rounded-md">
                    Select an element to edit its properties
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
