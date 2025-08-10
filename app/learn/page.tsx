"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Calendar,
  MapPin,
  Search,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { getUserEvents, getMaterialsByEvent, getEvent } from "@/lib/firestore";
import type { Event, Material } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MaterialWithEvent extends Material {
  event: Event;
}

export default function LearnPage() {
  const [materials, setMaterials] = useState<MaterialWithEvent[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<
    MaterialWithEvent[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] =
    useState<MaterialWithEvent | null>(null);

  const { userData } = useAuth();

  // Utility function to truncate text content
  const truncateText = (text: string, maxLength: number = 100): string => {
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  const loadMaterials = useCallback(async () => {
    if (!userData) return;

    try {
      // Get events user participates in
      const userEvents = await getUserEvents(userData.uid);

      // Get all materials from these events
      const materialsWithEvents: MaterialWithEvent[] = [];

      for (const event of userEvents) {
        const eventMaterials = await getMaterialsByEvent(event.id);
        for (const material of eventMaterials) {
          materialsWithEvents.push({
            ...material,
            event,
          });
        }
      }

      // Sort by creation date (newest first)
      materialsWithEvents.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setMaterials(materialsWithEvents);
      setFilteredMaterials(materialsWithEvents);
    } catch (error) {
      console.error("Error loading materials:", error);
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Centrum Nauki
          </h1>
          <p className="text-gray-600">
            Przeglądaj materiały edukacyjne z wydarzeń, w których uczestniczysz
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Szukaj materiałów edukacyjnych..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredMaterials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => (
              <Card
                key={material.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                {material.imageUrl && (
                  <Image
                    src={material.imageUrl}
                    alt={material.title}
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover"
                  />
                )}

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="line-clamp-2 flex-1">
                      {material.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {truncateText(material.content)}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      {material.event.title}
                    </div>
                    <Badge variant="outline">
                      {material.createdAt.toLocaleDateString("pl-PL")}
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="flex-1"
                          onClick={() => setSelectedMaterial(material)}
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          Czytaj
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh]">
                        <DialogHeader>
                          <DialogTitle>{selectedMaterial?.title}</DialogTitle>
                          <DialogDescription>
                            Z wydarzenia: {selectedMaterial?.event.title}
                          </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="h-[70vh] w-full">
                          {selectedMaterial?.imageUrl && (
                            <Image
                              src={selectedMaterial.imageUrl}
                              alt={selectedMaterial.title}
                              width={800}
                              height={400}
                              className="w-full h-64 object-cover rounded-lg mb-6"
                            />
                          )}
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown>
                              {selectedMaterial?.content || ""}
                            </ReactMarkdown>
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>

                    <Link href={`/events/${material.event.id}`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery
                ? "Nie znaleziono materiałów"
                : "Brak dostępnych materiałów"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? "Spróbuj zmienić kryteria wyszukiwania"
                : "Dołącz do wydarzeń, aby uzyskać dostęp do materiałów edukacyjnych"}
            </p>
            {!searchQuery && (
              <Link href="/events">
                <Button>
                  <Calendar className="h-4 w-4 mr-2" />
                  Przeglądaj wydarzenia
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Statistics */}
        {!loading && materials.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-green-600">
                  {materials.length}
                </CardTitle>
                <CardDescription>Dostępne materiały</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-blue-600">
                  {new Set(materials.map((m) => m.event.id)).size}
                </CardTitle>
                <CardDescription>Wydarzenia z materiałami</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-purple-600">
                  {Math.round(
                    materials.reduce((sum, m) => sum + m.content.length, 0) /
                      1000
                  )}
                  k
                </CardTitle>
                <CardDescription>Znaków do przeczytania</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Learning Tips */}
        <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">
            💡 Wskazówki dotyczące nauki
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex items-start">
              <ArrowRight className="h-4 w-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
              <span>
                Materiały są automatycznie synchronizowane offline po pierwszym
                odczycie
              </span>
            </div>
            <div className="flex items-start">
              <ArrowRight className="h-4 w-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
              <span>
                Weź udział w większej liczbie wydarzeń, aby uzyskać więcej
                materiałów
              </span>
            </div>
            <div className="flex items-start">
              <ArrowRight className="h-4 w-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
              <span>
                Użyj wyszukiwarki, aby szybko znaleźć interesujące Cię tematy
              </span>
            </div>
            <div className="flex items-start">
              <ArrowRight className="h-4 w-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
              <span>Ukończ misje w wydarzeniach, aby zdobyć więcej odznak</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
