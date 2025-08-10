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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeDisplay } from "@/components/badge-display";
import { Badge } from "@/components/ui/badge";
import { Settings, Award, Calendar, BookOpen, Edit } from "lucide-react";
import Link from "next/link";
import {
  getUserBadges,
  getBadge,
  getUserEvents,
  getEventsByOrganizer,
} from "@/lib/firestore";
import type { UserBadge, Badge as BadgeType, Event } from "@/lib/types";

export default function Profile() {
  const { userData } = useAuth();
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [stats, setStats] = useState({
    events: 0,
    badges: 0,
    materials: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfileData() {
      if (!userData) return;

      try {
        if (userData.role === "participant") {
          // Load user badges
          const userBadgesData = await getUserBadges(userData.uid);
          setUserBadges(userBadgesData);

          // Load badge details
          const badgePromises = [];
          for (const ub of userBadgesData) {
            badgePromises.push(getBadge(ub.badgeId));
          }
          const badgeResults = await Promise.all(badgePromises);
          const validBadges = [];
          for (const badge of badgeResults) {
            if (badge !== null) {
              validBadges.push(badge as BadgeType);
            }
          }
          setBadges(validBadges);

          // Load events for stats
          const userEvents = await getUserEvents(userData.uid);
          let totalMaterials = 0;
          for (const event of userEvents) {
            totalMaterials += event.materials.length;
          }

          setStats({
            events: userEvents.length,
            badges: userBadgesData.length,
            materials: totalMaterials,
          });
        } else {
          // Load organizer stats
          const events = await getEventsByOrganizer(userData.uid);
          let totalMaterials = 0;
          for (const event of events) {
            totalMaterials += event.materials.length;
          }
          let totalBadges = 0;
          for (const event of events) {
            totalBadges += event.badges.length;
          }

          setStats({
            events: events.length,
            badges: totalBadges,
            materials: totalMaterials,
          });
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfileData();
  }, [userData]);

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-green-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Ładowanie...</p>
        </div>
      </div>
    );
  }

  const isOrganizer = userData.role === "organizer";

  // Find badge details for user badges
  const getUserBadgeWithDetails = (userBadge: UserBadge) => {
    for (const badge of badges) {
      if (badge.id === userBadge.badgeId) {
        return badge;
      }
    }
    return undefined;
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage
                    src={userData.photoURL}
                    alt={userData.displayName}
                  />
                  <AvatarFallback className="text-2xl">
                    {userData.displayName.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">
                    {userData.displayName}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    <Badge variant={isOrganizer ? "default" : "secondary"}>
                      {isOrganizer ? "Organizator" : "Uczestnik"}
                    </Badge>
                  </CardDescription>
                  {userData.bio && (
                    <p className="mt-2 text-gray-600">{userData.bio}</p>
                  )}
                </div>
              </div>
              <Link href="/settings">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edytuj profil
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {isOrganizer ? "Utworzone wydarzenia" : "Wydarzenia"}
              </CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.events}
              </div>
              <p className="text-xs text-muted-foreground">
                {isOrganizer ? "Utworzone łącznie" : "Wzięto udział"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {isOrganizer ? "Przyznane odznaki" : "Zdobyte odznaki"}
              </CardTitle>
              <Award className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.badges}
              </div>
              <p className="text-xs text-muted-foreground">
                {isOrganizer ? "Łącznie utworzone" : "W kolekcji"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {isOrganizer ? "Materiały" : "Dostępne materiały"}
              </CardTitle>
              <BookOpen className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.materials}
              </div>
              <p className="text-xs text-muted-foreground">
                {isOrganizer ? "Utworzone" : "Dostępne"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Badges Collection */}
        {!isOrganizer && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Moje Odznaki
                  </CardTitle>
                  <CardDescription>
                    Kolekcja zdobytych odznak ekologicznych
                  </CardDescription>
                </div>
                <Badge variant="outline">{userBadges.length} odznak</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                  <div className="space-y-2 text-center">
                    <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-2 text-center">
                    <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-2 text-center">
                    <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-2 text-center">
                    <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ) : userBadges.length > 0 ? (
                <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                  {(() => {
                    const badgeElements = [];
                    for (const userBadge of userBadges) {
                      const badge = getUserBadgeWithDetails(userBadge);
                      if (!badge) continue;

                      badgeElements.push(
                        <div key={userBadge.id} className="text-center">
                          <BadgeDisplay
                            shape={badge.shape}
                            color={badge.color}
                            emoji={badge.emoji}
                            title={badge.title}
                            description={badge.description}
                            size="md"
                          />
                          <p className="mt-2 text-xs text-gray-500">
                            Zdobyta:{" "}
                            {userBadge.awardedAt.toLocaleDateString("pl-PL")}
                          </p>
                        </div>
                      );
                    }
                    return badgeElements;
                  })()}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Award className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Nie masz jeszcze odznak
                  </h3>
                  <p className="mb-4 text-gray-600">
                    Weź udział w wydarzeniach, aby zdobyć swoje pierwsze
                    odznaki!
                  </p>
                  <Link href="/events">
                    <Button>Przeglądaj wydarzenia</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
