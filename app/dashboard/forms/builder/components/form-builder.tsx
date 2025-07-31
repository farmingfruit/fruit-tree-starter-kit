"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  Copy, 
  Type, 
  Mail, 
  Phone, 
  MessageSquare, 
  List, 
  CheckSquare, 
  Calendar, 
  Hash,
  User,
  MapPin,
  Clock,
  FileText,
  Star,
  AlertCircle
} from "lucide-react";

interface FormField {
  id: string;
  type: "text" | "email" | "phone" | "textarea" | "select" | "checkbox" | "radio" | "date" | "number";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  description?: string;
}

interface FormData {
  name: string;
  description: string;
  type: "general" | "registration";
  fields: FormField[];
  settings: any;
}

interface FormBuilderProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

const fieldTypes = [
  { 
    type: "text", 
    label: "Text Input", 
    icon: Type, 
    description: "Single line text",
    examples: ["Name", "Address", "Job Title"]
  },
  { 
    type: "email", 
    label: "Email Address", 
    icon: Mail, 
    description: "Email validation",
    examples: ["Email", "Contact Email"]
  },
  { 
    type: "phone", 
    label: "Phone Number", 
    icon: Phone, 
    description: "Phone formatting",
    examples: ["Mobile", "Home Phone", "Work Phone"]
  },
  { 
    type: "textarea", 
    label: "Multi-line Text", 
    icon: MessageSquare, 
    description: "Large text area",
    examples: ["Comments", "Prayer Request", "Special Needs"]
  },
  { 
    type: "select", 
    label: "Dropdown Menu", 
    icon: List, 
    description: "Choose from options",
    examples: ["T-Shirt Size", "Age Group", "Service Preference"]
  },
  { 
    type: "checkbox", 
    label: "Checkboxes", 
    icon: CheckSquare, 
    description: "Multiple selection",
    examples: ["Volunteer Areas", "Dietary Restrictions", "Interests"]
  },
  { 
    type: "radio", 
    label: "Radio Buttons", 
    icon: CheckSquare, 
    description: "Single selection",
    examples: ["Gender", "Attendance", "Membership Status"]
  },
  { 
    type: "date", 
    label: "Date Picker", 
    icon: Calendar, 
    description: "Date selection",
    examples: ["Birth Date", "Event Date", "Available Date"]
  },
  { 
    type: "number", 
    label: "Number Input", 
    icon: Hash, 
    description: "Numeric values",
    examples: ["Age", "Number of Guests", "Years Attending"]
  },
];

// Common field templates for churches
const fieldTemplates = {
  general: [
    { label: "First Name", type: "text", required: true },
    { label: "Last Name", type: "text", required: true },
    { label: "Email Address", type: "email", required: true },
    { label: "Phone Number", type: "phone", required: false },
    { label: "Address", type: "text", required: false },
    { label: "City", type: "text", required: false },
    { label: "State", type: "text", required: false },
    { label: "Zip Code", type: "text", required: false },
    { label: "Date of Birth", type: "date", required: false },
    { label: "Emergency Contact", type: "text", required: false },
    { label: "Comments", type: "textarea", required: false }
  ],
  registration: [
    { label: "T-Shirt Size", type: "select", required: false, options: ["XS", "S", "M", "L", "XL", "XXL"] },
    { label: "Dietary Restrictions", type: "textarea", required: false },
    { label: "Special Needs", type: "textarea", required: false },
    { label: "How did you hear about this event?", type: "select", required: false, options: ["Website", "Social Media", "Friend", "Email", "Other"] },
    { label: "Number of Guests", type: "number", required: false }
  ]
};

export function FormBuilder({ formData, setFormData }: FormBuilderProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const addField = (fieldType: string) => {
    const newField: FormField = {
      id: Date.now().toString(),
      type: fieldType as any,
      label: `New ${fieldTypes.find(f => f.type === fieldType)?.label || "Field"}`,
      required: false,
      ...(fieldType === "select" || fieldType === "checkbox" || fieldType === "radio" ? {
        options: ["Option 1", "Option 2", "Option 3"]
      } : {})
    };
    
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
    setEditingField(newField.id);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const deleteField = (fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
    setEditingField(null);
  };

  const duplicateField = (fieldId: string) => {
    const field = formData.fields.find(f => f.id === fieldId);
    if (field) {
      const newField = {
        ...field,
        id: Date.now().toString(),
        label: `${field.label} (Copy)`
      };
      setFormData(prev => ({
        ...prev,
        fields: [...prev.fields, newField]
      }));
    }
  };

  const moveField = (fieldId: string, direction: "up" | "down") => {
    const currentIndex = formData.fields.findIndex(f => f.id === fieldId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= formData.fields.length) return;

    const newFields = [...formData.fields];
    [newFields[currentIndex], newFields[newIndex]] = [newFields[newIndex], newFields[currentIndex]];
    
    setFormData(prev => ({ ...prev, fields: newFields }));
  };

  const addTemplateField = (template: any) => {
    const newField: FormField = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: template.type,
      label: template.label,
      required: template.required,
      ...(template.options ? { options: template.options } : {})
    };
    
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Quick Add Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Add Common Fields
          </CardTitle>
          <CardDescription>
            Add commonly used church form fields with one click
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {fieldTemplates.general.slice(0, 6).map((template, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => addTemplateField(template)}
                className="justify-start h-auto py-2"
              >
                <span className="text-xs">{template.label}</span>
              </Button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
            className="mt-2"
          >
            {showTemplates ? "Show Less" : "Show More Fields"}
          </Button>
          
          {showTemplates && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
              {[...fieldTemplates.general.slice(6), ...fieldTemplates.registration].map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => addTemplateField(template)}
                  className="justify-start h-auto py-2"
                >
                  <span className="text-xs">{template.label}</span>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Field Types */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Field</CardTitle>
          <CardDescription>
            Choose a field type to add to your form
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fieldTypes.map((fieldType) => {
              const Icon = fieldType.icon;
              return (
                <button
                  key={fieldType.type}
                  onClick={() => addField(fieldType.type)}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
                >
                  <div className="bg-primary/10 rounded-lg p-2">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{fieldType.label}</div>
                    <div className="text-xs text-muted-foreground">{fieldType.description}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      e.g., {fieldType.examples.join(", ")}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Form Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Form Fields ({formData.fields.length})</span>
            {formData.fields.length === 0 && (
              <Badge variant="secondary">No fields yet</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Drag to reorder, click to edit. Required fields are marked with a star.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formData.fields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p>No fields added yet.</p>
              <p className="text-sm">Add fields using the options above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {formData.fields.map((field, index) => (
                <div
                  key={field.id}
                  className={`border rounded-lg p-4 ${
                    editingField === field.id ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{field.label}</span>
                          {field.required && (
                            <Star className="h-3 w-3 text-red-500" />
                          )}
                          <Badge variant="outline" className="text-xs">
                            {fieldTypes.find(f => f.type === field.type)?.label}
                          </Badge>
                        </div>
                        {field.description && (
                          <p className="text-sm text-muted-foreground mt-1">{field.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveField(field.id, "up")}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveField(field.id, "down")}
                        disabled={index === formData.fields.length - 1}
                      >
                        ↓
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingField(editingField === field.id ? null : field.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => duplicateField(field.id)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteField(field.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {editingField === field.id && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`label-${field.id}`}>Field Label</Label>
                          <Input
                            id={`label-${field.id}`}
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                            placeholder="Enter field label"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`placeholder-${field.id}`}>Placeholder Text</Label>
                          <Input
                            id={`placeholder-${field.id}`}
                            value={field.placeholder || ""}
                            onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                            placeholder="Hint text for users"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`description-${field.id}`}>Help Text (Optional)</Label>
                        <Input
                          id={`description-${field.id}`}
                          value={field.description || ""}
                          onChange={(e) => updateField(field.id, { description: e.target.value })}
                          placeholder="Additional instructions for this field"
                        />
                      </div>

                      {(field.type === "select" || field.type === "checkbox" || field.type === "radio") && (
                        <div>
                          <Label>Options</Label>
                          <div className="space-y-2">
                            {field.options?.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex gap-2">
                                <Input
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...(field.options || [])];
                                    newOptions[optionIndex] = e.target.value;
                                    updateField(field.id, { options: newOptions });
                                  }}
                                  placeholder={`Option ${optionIndex + 1}`}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newOptions = field.options?.filter((_, i) => i !== optionIndex);
                                    updateField(field.id, { options: newOptions });
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
                                updateField(field.id, { options: newOptions });
                              }}
                            >
                              <Plus className="mr-1 h-3 w-3" />
                              Add Option
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`required-${field.id}`}
                          checked={field.required}
                          onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                        />
                        <Label htmlFor={`required-${field.id}`}>Required field</Label>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setEditingField(null)}
                        >
                          Done
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteField(field.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete Field
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}