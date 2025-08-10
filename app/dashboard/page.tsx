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
import { Calendar, Users, Award, BookOpen, Plus, Settings } from "lucide-react";
import Link from "next/link";
import {
  getEventsByOrganizer,
  getUserEvents,
  getUserBadges,
} from "@/lib/firestore";
import type { Event, UserBadge } from "@/lib/types";

export default function Dashboard() {
  const { userData, loading } = useAuth();
  const [stats, setStats] = useState({
    events: 0,
    badges: 0,
    participants: 0,
    materials: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!userData) return;

      try {
        if (userData.role === "organizer") {
          const events = await getEventsByOrganizer(userData.uid);
          const totalParticipants = events.reduce(
            (sum, event) => sum + event.participants.length,
            0
          );
          const totalMaterials = events.reduce(
            (sum, event) => sum + event.materials.length,
            0
          );
          const totalBadges = events.reduce(
            (sum, event) => sum + event.badges.length,
            0
          );

          setStats({
            events: events.length,
            badges: totalBadges,
            participants: totalParticipants,
            materials: totalMaterials,
          });
        } else {
          const [userEvents, userBadges] = await Promise.all([
            getUserEvents(userData.uid),
            getUserBadges(userData.uid),
          ]);

          // Count materials from events user participates in
          const totalMaterials = userEvents.reduce(
            (sum, event) => sum + event.materials.length,
            0
          );

          setStats({
            events: userEvents.length,
            badges: userBadges.length,
            participants: 0, // Not relevant for participants
            materials: totalMaterials,
          });
        }
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setStatsLoading(false);
      }
    }

    loadStats();
  }, [userData]);

  // Show loading spinner while auth is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-green-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Ładowanie...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="mb-4 text-gray-600">
            Musisz się zalogować, aby uzyskać dostęp do tej strony.
          </p>
          <Link href="/login">
            <Button>Przejdź do logowania</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOrganizer = userData.role === "organizer";

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Witaj, {userData.displayName}!
          </h1>
          <p className="text-gray-600">
            {isOrganizer
              ? "Zarządzaj swoimi wydarzeniami i twórz niesamowite doświadczenia ekologiczne."
              : "Odkrywaj wydarzenia, zdobywaj wiedzę i kolekcjonuj unikalne odznaki ekologiczne."}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Wydarzenia</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats.events}
              </div>
              <p className="text-xs text-muted-foreground">
                {isOrganizer ? "Utworzone" : "Uczestniczę"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Odznaki</CardTitle>
              <Award className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats.badges}
              </div>
              <p className="text-xs text-muted-foreground">
                {isOrganizer ? "Utworzone" : "Zdobyte"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {isOrganizer ? "Uczestnicy" : "Materiały"}
              </CardTitle>
              {isOrganizer ? (
                <Users className="w-4 h-4 text-muted-foreground" />
              ) : (
                <BookOpen className="w-4 h-4 text-muted-foreground" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading
                  ? "..."
                  : isOrganizer
                  ? stats.participants
                  : stats.materials}
              </div>
              <p className="text-xs text-muted-foreground">
                {isOrganizer ? "Łącznie" : "Dostępne"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {isOrganizer ? "Materiały" : "Misje"}
              </CardTitle>
              <Settings className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : isOrganizer ? stats.materials : "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                {isOrganizer ? "Utworzone" : "Ukończone"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isOrganizer ? (
            <>
              <Card className="transition-shadow cursor-pointer hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Nowe wydarzenie
                  </CardTitle>
                  <CardDescription>
                    Utwórz nowe wydarzenie ekologiczne i zaproś uczestników
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/events/create">
                    <Button className="w-full">Stwórz wydarzenie</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* <Card className="transition-shadow cursor-pointer hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Zarządzaj odznakami
                  </CardTitle>
                  <CardDescription>
                    Twórz nowe odznaki i przyznawaj je uczestnikom
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/badges">
                    <Button className="w-full" variant="outline">
                      Przejdź do odznak
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="transition-shadow cursor-pointer hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Materiały edukacyjne
                  </CardTitle>
                  <CardDescription>
                    Dodaj treści edukacyjne do swoich wydarzeń
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/materials">
                    <Button className="w-full" variant="outline">
                      Zarządzaj materiałami
                    </Button>
                  </Link>
                </CardContent>
              </Card> */}
            </>
          ) : (
            <>
              <Card className="transition-shadow cursor-pointer hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Wydarzenia
                  </CardTitle>
                  <CardDescription>
                    Odkrywaj nadchodzące wydarzenia ekologiczne w Twojej okolicy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/events">
                    <Button className="w-full">Przeglądaj wydarzenia</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="transition-shadow cursor-pointer hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Moje odznaki
                  </CardTitle>
                  <CardDescription>
                    Zobacz wszystkie zdobyte odznaki i śledź swoje postępy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/profile">
                    <Button className="w-full" variant="outline">
                      Zobacz odznaki
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="transition-shadow cursor-pointer hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Nauka
                  </CardTitle>
                  <CardDescription>
                    Czytaj materiały edukacyjne i poszerzaj swoją wiedzę
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/learn">
                    <Button className="w-full" variant="outline">
                      Rozpocznij naukę
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
