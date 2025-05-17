import React, { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormElement } from "@/lib/utils/form-elements";
import { GripVertical, Trash2 } from "lucide-react";
import { useDrag, useDrop } from "react-dnd";

const ItemTypes = {
  FORM_ELEMENT: 'formElement',
};

interface FormElementsProps {
  element: FormElement;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  index: number;
  moveElement: (dragIndex: number, hoverIndex: number) => void;
}

export function FormElements({ 
  element, 
  isSelected, 
  onClick, 
  onDelete,
  index,
  moveElement
}: FormElementsProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Set up drag source
  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.FORM_ELEMENT,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Set up drop target
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.FORM_ELEMENT,
    hover: (item: { index: number }, monitor) => {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveElement(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drag(drop(ref));

  // Render different form elements based on type
  const renderFormElement = () => {
    switch (element.type) {
      case 'text':
        return (
          <div>
            <Label htmlFor={`text-${element.id}`}>{element.label} {element.required && '*'}</Label>
            <Input
              id={`text-${element.id}`}
              placeholder={element.placeholder}
              readOnly
              className="mt-1"
            />
          </div>
        );
        
      case 'email':
        return (
          <div>
            <Label htmlFor={`email-${element.id}`}>{element.label} {element.required && '*'}</Label>
            <Input
              id={`email-${element.id}`}
              type="email"
              placeholder={element.placeholder}
              readOnly
              className="mt-1"
            />
          </div>
        );
        
      case 'password':
        return (
          <div>
            <Label htmlFor={`password-${element.id}`}>{element.label} {element.required && '*'}</Label>
            <Input
              id={`password-${element.id}`}
              type="password"
              placeholder={element.placeholder}
              readOnly
              className="mt-1"
            />
          </div>
        );
        
      case 'number':
        return (
          <div>
            <Label htmlFor={`number-${element.id}`}>{element.label} {element.required && '*'}</Label>
            <Input
              id={`number-${element.id}`}
              type="number"
              placeholder={element.placeholder}
              readOnly
              className="mt-1"
            />
          </div>
        );
        
      case 'tel':
        return (
          <div>
            <Label htmlFor={`tel-${element.id}`}>{element.label} {element.required && '*'}</Label>
            <Input
              id={`tel-${element.id}`}
              type="tel"
              placeholder={element.placeholder}
              readOnly
              className="mt-1"
            />
          </div>
        );
        
      case 'textarea':
        return (
          <div>
            <Label htmlFor={`textarea-${element.id}`}>{element.label} {element.required && '*'}</Label>
            <Textarea
              id={`textarea-${element.id}`}
              placeholder={element.placeholder}
              readOnly
              className="mt-1"
            />
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox id={`checkbox-${element.id}`} />
            <Label htmlFor={`checkbox-${element.id}`}>
              {element.label} {element.required && '*'}
            </Label>
          </div>
        );
        
      case 'radio':
        return (
          <div>
            <Label>{element.label} {element.required && '*'}</Label>
            <RadioGroup defaultValue="option-1" className="mt-2">
              {element.options?.map((option, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <RadioGroupItem value={`option-${i + 1}`} id={`radio-${element.id}-${i}`} />
                  <Label htmlFor={`radio-${element.id}-${i}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
        
      case 'select':
        return (
          <div>
            <Label htmlFor={`select-${element.id}`}>{element.label} {element.required && '*'}</Label>
            <Select>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={element.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {element.options?.map((option, i) => (
                  <SelectItem key={i} value={`option-${i + 1}`}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
        
      case 'date':
        return (
          <div>
            <Label htmlFor={`date-${element.id}`}>{element.label} {element.required && '*'}</Label>
            <Input
              id={`date-${element.id}`}
              type="date"
              readOnly
              className="mt-1"
            />
          </div>
        );
        
      case 'file':
        return (
          <div>
            <Label htmlFor={`file-${element.id}`}>{element.label} {element.required && '*'}</Label>
            <Input
              id={`file-${element.id}`}
              type="file"
              disabled
              className="mt-1"
            />
          </div>
        );
        
      default:
        return (
          <div>Unknown element type: {element.type}</div>
        );
    }
  };

  const opacity = isDragging ? 0.4 : 1;

  return (
    <div 
      ref={ref} 
      style={{ opacity }}
      className={`relative transition-colors ${isSelected ? 'ring-2 ring-primary' : ''}`}
    >
      <Card 
        className={`
          ${isSelected ? 'border-primary' : 'border-gray-200'} 
          ${isOver ? 'border-dashed border-primary bg-primary/5' : ''}
          hover:border-primary/70 cursor-pointer
        `}
        onClick={onClick}
      >
        <CardContent className="p-4">
          {renderFormElement()}
          
          <div className="absolute top-0 right-0 p-2 flex space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-gray-400 hover:text-red-500" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="absolute top-3 left-1 cursor-move" ref={drag}>
            <GripVertical className="h-5 w-5 text-gray-300" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
