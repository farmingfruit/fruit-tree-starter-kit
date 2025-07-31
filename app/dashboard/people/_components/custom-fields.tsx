"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Type,
  Hash,
  Calendar,
  Check,
  List
} from "lucide-react";

interface CustomField {
  id: string;
  label: string;
  type: "text" | "number" | "date" | "boolean" | "select" | "textarea";
  value?: any;
  options?: string[]; // For select fields
  required?: boolean;
}

interface CustomFieldsProps {
  fields: CustomField[];
  isEditing: boolean;
  onFieldsChange: (fields: CustomField[]) => void;
}

const fieldIcons = {
  text: Type,
  textarea: Type,
  number: Hash,
  date: Calendar,
  boolean: Check,
  select: List,
};

const defaultCustomFields: CustomField[] = [
  {
    id: "ministry_involvement",
    label: "Ministry Involvement",
    type: "select",
    value: "Youth Ministry",
    options: ["Youth Ministry", "Worship Team", "Children's Ministry", "Small Groups", "Outreach", "Administration"],
  },
  {
    id: "spiritual_gifts",
    label: "Spiritual Gifts",
    type: "textarea",
    value: "Teaching, Leadership, Encouragement",
  },
  {
    id: "membership_class_date",
    label: "Membership Class Date",
    type: "date",
    value: "2020-03-15",
  },
  {
    id: "volunteer_hours",
    label: "Volunteer Hours (Monthly)",
    type: "number",
    value: 8,
  },
  {
    id: "small_group_leader",
    label: "Small Group Leader",
    type: "boolean",
    value: false,
  },
];

export default function CustomFields({ 
  fields = defaultCustomFields, 
  isEditing, 
  onFieldsChange 
}: CustomFieldsProps) {
  const [isAddingField, setIsAddingField] = useState(false);
  const [newField, setNewField] = useState<Partial<CustomField>>({
    label: "",
    type: "text",
    options: [],
  });

  const updateFieldValue = (fieldId: string, value: any) => {
    const updatedFields = fields.map(field => 
      field.id === fieldId ? { ...field, value } : field
    );
    onFieldsChange(updatedFields);
  };

  const addCustomField = () => {
    if (!newField.label) return;
    
    const field: CustomField = {
      id: newField.label.toLowerCase().replace(/\s+/g, '_'),
      label: newField.label,
      type: newField.type || "text",
      options: newField.options,
      value: getDefaultValue(newField.type || "text"),
    };
    
    onFieldsChange([...fields, field]);
    setNewField({ label: "", type: "text", options: [] });
    setIsAddingField(false);
  };

  const removeField = (fieldId: string) => {
    const updatedFields = fields.filter(field => field.id !== fieldId);
    onFieldsChange(updatedFields);
  };

  const getDefaultValue = (type: string) => {
    switch (type) {
      case "boolean": return false;
      case "number": return 0;
      case "date": return "";
      default: return "";
    }
  };

  const renderFieldValue = (field: CustomField) => {
    const IconComponent = fieldIcons[field.type];
    
    if (isEditing) {
      switch (field.type) {
        case "text":
          return (
            <Input
              value={field.value || ""}
              onChange={(e) => updateFieldValue(field.id, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          );
        
        case "textarea":
          return (
            <Textarea
              value={field.value || ""}
              onChange={(e) => updateFieldValue(field.id, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              rows={3}
            />
          );
        
        case "number":
          return (
            <Input
              type="number"
              value={field.value || 0}
              onChange={(e) => updateFieldValue(field.id, parseInt(e.target.value) || 0)}
            />
          );
        
        case "date":
          return (
            <Input
              type="date"
              value={field.value || ""}
              onChange={(e) => updateFieldValue(field.id, e.target.value)}
            />
          );
        
        case "boolean":
          return (
            <Select 
              value={field.value ? "true" : "false"} 
              onValueChange={(value) => updateFieldValue(field.id, value === "true")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          );
        
        case "select":
          return (
            <Select 
              value={field.value || ""} 
              onValueChange={(value) => updateFieldValue(field.id, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        
        default:
          return <span className="text-sm text-muted-foreground">Unknown field type</span>;
      }
    } else {
      // Display mode
      return (
        <div className="flex items-center space-x-2">
          <IconComponent className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {field.type === "boolean" 
              ? (field.value ? "Yes" : "No")
              : field.type === "date" 
                ? (field.value ? new Date(field.value).toLocaleDateString() : "Not set")
                : field.value || "Not set"
            }
          </span>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Custom Fields</h3>
          <p className="text-sm text-muted-foreground">
            Additional information specific to your church.
          </p>
        </div>
        {isEditing && (
          <Dialog open={isAddingField} onOpenChange={setIsAddingField}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Field
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Field</DialogTitle>
                <DialogDescription>
                  Create a new custom field for member profiles.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="field-label">Field Label</Label>
                  <Input
                    id="field-label"
                    value={newField.label || ""}
                    onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                    placeholder="e.g., Volunteer Interest"
                  />
                </div>
                <div>
                  <Label htmlFor="field-type">Field Type</Label>
                  <Select 
                    value={newField.type || "text"} 
                    onValueChange={(type) => setNewField({ ...newField, type: type as CustomField["type"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="textarea">Long Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="boolean">Yes/No</SelectItem>
                      <SelectItem value="select">Dropdown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newField.type === "select" && (
                  <div>
                    <Label>Options (one per line)</Label>
                    <Textarea
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                      onChange={(e) => setNewField({ 
                        ...newField, 
                        options: e.target.value.split('\n').filter(Boolean) 
                      })}
                    />
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddingField(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addCustomField}>
                    Add Field
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {fields.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Type className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2">No custom fields</h3>
            <p className="text-muted-foreground mb-4">
              Add custom fields to capture additional information about your members.
            </p>
            {isEditing && (
              <Button onClick={() => setIsAddingField(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Field
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => (
            <Card key={field.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">{field.label}</Label>
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(field.id)}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                {renderFieldValue(field)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}