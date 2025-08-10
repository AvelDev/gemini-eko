"use client";

import { useState, useEffect } from "react";
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
import { Calendar, MapPin, Users, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  getEvents,
  getEventsByOrganizer,
  joinEvent,
  leaveEvent,
} from "@/lib/firestore";
import type { Event } from "@/lib/types";
import { toast } from "sonner";

export default function Events() {
  const { userData } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      if (!userData) return;

      try {
        let eventsData;
        if (userData.role === "organizer") {
          eventsData = await getEventsByOrganizer(userData.uid);
        } else {
          eventsData = await getEvents();
        }
        setEvents(eventsData);
      } catch (error) {
        console.error("Error loading events:", error);
        toast.error("Błąd podczas ładowania wydarzeń");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [userData]);

  const handleJoinEvent = async (eventId: string) => {
    if (!userData) return;

    try {
      await joinEvent(userData.uid, eventId);
      toast.success("Pomyślnie dołączono do wydarzenia!");

      // Refresh events
      const eventsData = await getEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error("Error joining event:", error);
      toast.error("Błąd podczas dołączania do wydarzenia");
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    if (!userData) return;

    try {
      await leaveEvent(userData.uid, eventId);
      toast.success("Opuszczono wydarzenie");

      // Refresh events
      const eventsData = await getEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error("Error leaving event:", error);
      toast.error("Błąd podczas opuszczania wydarzenia");
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const eventDate = new Date(event.date);

    if (eventDate > now) return "upcoming";
    return event.status;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "upcoming":
        return "Nadchodzące";
      case "ongoing":
        return "Trwa";
      case "completed":
        return "Zakończone";
      default:
        return "Nieznany";
    }
  };

  const isParticipant = (event: Event) => {
    return userData && event.participants.includes(userData.uid);
  };

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

  const isOrganizer = userData.role === "organizer";

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Wydarzenia
            </h1>
            <p className="text-gray-600">
              {isOrganizer
                ? "Zarządzaj swoimi wydarzeniami ekologicznymi"
                : "Odkrywaj i dołączaj do wydarzeń ekologicznych"}
            </p>
          </div>
          {isOrganizer && (
            <Link href="/events/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nowe wydarzenie
              </Button>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const status = getEventStatus(event);
              const userIsParticipant = isParticipant(event);

              return (
                <Card
                  key={event.id}
                  className="overflow-hidden transition-shadow hover:shadow-lg"
                >
                  <div className="relative">
                    {event.imageUrl ? (
                      <Image
                        src={event.imageUrl}
                        alt={event.title}
                        width={400}
                        height={192}
                        className="object-cover w-full h-48"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-white opacity-50" />
                      </div>
                    )}
                    <Badge className="absolute text-gray-900 top-4 right-4 bg-white/90">
                      {getStatusLabel(status)}
                    </Badge>
                  </div>

                  <CardHeader>
                    <CardTitle className="line-clamp-2">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(event.date)}
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      {event.participants.length} uczestników
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/events/${event.id}`} className="flex-1">
                        <Button className="w-full">
                          {isOrganizer ? "Zarządzaj" : "Zobacz szczegóły"}
                        </Button>
                      </Link>
                      {!isOrganizer && status === "upcoming" && (
                        <Button
                          variant={
                            userIsParticipant ? "destructive" : "outline"
                          }
                          className="px-3"
                          onClick={() =>
                            userIsParticipant
                              ? handleLeaveEvent(event.id)
                              : handleJoinEvent(event.id)
                          }
                        >
                          {userIsParticipant ? "Opuść" : "Dołącz"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="py-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              {isOrganizer
                ? "Nie masz jeszcze wydarzeń"
                : "Brak dostępnych wydarzeń"}
            </h3>
            <p className="mb-6 text-gray-600">
              {isOrganizer
                ? "Utwórz swoje pierwsze wydarzenie ekologiczne"
                : "Sprawdź ponownie później, może pojawią się nowe wydarzenia"}
            </p>
            {isOrganizer && (
              <Link href="/events/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Stwórz pierwsze wydarzenie
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
