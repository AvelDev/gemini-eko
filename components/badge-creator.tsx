"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "./badge-display";

interface BadgeData {
  shape: "circle" | "rosette";
  color: string;
  emoji: string;
  title: string;
  description: string;
}

const colors = [
  { name: "Zielony", value: "#16a34a" },
  { name: "Niebieski", value: "#2563eb" },
  { name: "Pomarańczowy", value: "#ea580c" },
  { name: "Czerwony", value: "#dc2626" },
  { name: "Fioletowy", value: "#9333ea" },
  { name: "Różowy", value: "#db2777" },
  { name: "Żółty", value: "#ca8a04" },
  { name: "Szary", value: "#6b7280" },
  { name: "Indygo", value: "#4f46e5" },
  { name: "Turkusowy", value: "#0891b2" },
];

const emojis = [
  "🌱",
  "♻️",
  "🌍",
  "🍃",
  "🌳",
  "💚",
  "🌿",
  "🌸",
  "🦋",
  "🌺",
  "🌞",
  "💧",
  "🌤️",
  "🌈",
  "🐝",
];

interface BadgeCreatorProps {
  onSave: (badge: BadgeData) => void;
  onCancel: () => void;
}

export function BadgeCreator({ onSave, onCancel }: BadgeCreatorProps) {
  const [badge, setBadge] = useState<BadgeData>({
    shape: "circle",
    color: colors[0].value,
    emoji: emojis[0],
    title: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (badge.title.trim()) {
      onSave(badge);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Kreator Odznaki</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Kształt</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant={badge.shape === "circle" ? "default" : "outline"}
                  onClick={() => setBadge({ ...badge, shape: "circle" })}
                >
                  Okrąg
                </Button>
                <Button
                  type="button"
                  variant={badge.shape === "rosette" ? "default" : "outline"}
                  onClick={() => setBadge({ ...badge, shape: "rosette" })}
                >
                  Rozeta
                </Button>
              </div>
            </div>

            <div>
              <Label>Kolor</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`w-10 h-10 rounded-full border-2 ${
                      badge.color === color.value
                        ? "border-gray-900"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setBadge({ ...badge, color: color.value })}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label>Emoji</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {emojis.map((emoji) => (
                  <Button
                    key={emoji}
                    type="button"
                    variant={badge.emoji === emoji ? "default" : "outline"}
                    className="text-lg p-2"
                    onClick={() => setBadge({ ...badge, emoji })}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="title">Tytuł odznaki</Label>
              <Input
                id="title"
                value={badge.title}
                onChange={(e) => setBadge({ ...badge, title: e.target.value })}
                placeholder="np. Mistrz Recyklingu"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Opis (opcjonalnie)</Label>
              <Textarea
                id="description"
                value={badge.description}
                onChange={(e) =>
                  setBadge({ ...badge, description: e.target.value })
                }
                placeholder="Za udział w warsztatach segregacji..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Zapisz odznakę
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Anuluj
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Podgląd</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Badge
              shape={badge.shape}
              color={badge.color}
              emoji={badge.emoji}
              title={badge.title || "Tytuł odznaki"}
              description={badge.description}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
