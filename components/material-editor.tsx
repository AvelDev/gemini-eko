"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MaterialData {
  title: string;
  content: string;
  imageUrl?: string;
}

interface MaterialEditorProps {
  onSave: (material: MaterialData) => void;
  onCancel: () => void;
  initialData?: MaterialData;
}

export function MaterialEditor({
  onSave,
  onCancel,
  initialData,
}: MaterialEditorProps) {
  const [material, setMaterial] = useState<MaterialData>({
    title: initialData?.title || "",
    content: initialData?.content || "",
    imageUrl: initialData?.imageUrl || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (material.title.trim() && material.content.trim()) {
      onSave(material);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edytor Materiału Edukacyjnego</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Tytuł</Label>
            <Input
              id="title"
              value={material.title}
              onChange={(e) =>
                setMaterial({ ...material, title: e.target.value })
              }
              placeholder="np. Jak segregować plastik?"
              required
            />
          </div>

          <div>
            <Label htmlFor="imageUrl">URL zdjęcia (opcjonalnie)</Label>
            <Input
              id="imageUrl"
              value={material.imageUrl}
              onChange={(e) =>
                setMaterial({ ...material, imageUrl: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
              type="url"
            />
          </div>

          <div>
            <Label>Treść (Markdown)</Label>
            <Tabs defaultValue="edit" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit">Edycja</TabsTrigger>
                <TabsTrigger value="preview">Podgląd</TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="mt-4">
                <Textarea
                  value={material.content}
                  onChange={(e) =>
                    setMaterial({ ...material, content: e.target.value })
                  }
                  placeholder="Wpisz treść materiału używając składni Markdown..."
                  rows={15}
                  className="font-mono"
                  required
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-4">
                <div className="border rounded-md p-4 min-h-[300px] bg-white">
                  {material.imageUrl && (
                    <img
                      src={material.imageUrl}
                      alt={material.title}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                  )}
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {material.content ||
                        "*Podgląd treści pojawi się tutaj...*"}
                    </ReactMarkdown>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Zapisz materiał
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Anuluj
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
