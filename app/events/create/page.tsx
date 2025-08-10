"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createEvent } from "@/lib/firestore";

export default function CreateEvent() {
  const [isLoading, setIsLoading] = useState(false);
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    imageUrl: "",
  });
  const { userData } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    setIsLoading(true);

    try {
      const eventId = await createEvent({
        title: eventData.title,
        description: eventData.description,
        date: new Date(eventData.date),
        location: eventData.location,
        organizerId: userData.uid,
        organizerName: userData.displayName,
        status: "upcoming",
        imageUrl: eventData.imageUrl || undefined,
        participants: [],
        materials: [],
        badges: [],
        missions: [],
      });

      toast.success("Wydarzenie zostało utworzone pomyślnie!");
      router.push(`/events/${eventId}`);
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Błąd podczas tworzenia wydarzenia");
    } finally {
      setIsLoading(false);
    }
  };

  if (!userData || userData.role !== "organizer") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Brak uprawnień</CardTitle>
            <CardDescription>
              Tylko organizatorzy mogą tworzyć wydarzenia
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/events">
              <Button>Wróć do wydarzeń</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href="/events"
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Wróć do wydarzeń
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Stwórz nowe wydarzenie
          </h1>
          <p className="text-gray-600">
            Utwórz wydarzenie ekologiczne i zaproś uczestników do nauki i
            zdobywania odznak
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Dane wydarzenia
            </CardTitle>
            <CardDescription>
              Wypełnij szczegóły swojego wydarzenia ekologicznego
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Nazwa wydarzenia *</Label>
                <Input
                  id="title"
                  value={eventData.title}
                  onChange={(e) =>
                    setEventData({ ...eventData, title: e.target.value })
                  }
                  placeholder="np. Zielony Festiwal 2025"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Opis wydarzenia *</Label>
                <Textarea
                  id="description"
                  value={eventData.description}
                  onChange={(e) =>
                    setEventData({ ...eventData, description: e.target.value })
                  }
                  placeholder="Opisz czego dotyczy wydarzenie, co uczestnicy mogą się nauczyć..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Data wydarzenia *</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={eventData.date}
                    onChange={(e) =>
                      setEventData({ ...eventData, date: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location">Lokalizacja *</Label>
                  <Input
                    id="location"
                    value={eventData.location}
                    onChange={(e) =>
                      setEventData({ ...eventData, location: e.target.value })
                    }
                    placeholder="np. Park Łazienkowski, Warszawa"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="imageUrl">URL zdjęcia (opcjonalnie)</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={eventData.imageUrl}
                  onChange={(e) =>
                    setEventData({ ...eventData, imageUrl: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Link do zdjęcia, które będzie reprezentować wydarzenie
                </p>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Tworzenie..." : "Stwórz wydarzenie"}
                </Button>
                <Link href="/events">
                  <Button type="button" variant="outline">
                    Anuluj
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Co dalej?</h3>
          <p className="text-blue-800 text-sm">
            Po utworzeniu wydarzenia będziesz mógł dodać materiały edukacyjne,
            stworzyć odznaki i zarządzać uczestnikami. Wszystkie te opcje będą
            dostępne na stronie wydarzenia.
          </p>
        </div>
      </div>
    </div>
  );
}
