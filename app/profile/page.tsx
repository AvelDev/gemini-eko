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
          const badgePromises = userBadgesData.map((ub) =>
            getBadge(ub.badgeId)
          );
          const badgeResults = await Promise.all(badgePromises);
          const validBadges = badgeResults.filter(
            (b) => b !== null
          ) as BadgeType[];
          setBadges(validBadges);

          // Load events for stats
          const userEvents = await getUserEvents(userData.uid);
          const totalMaterials = userEvents.reduce(
            (sum, event) => sum + event.materials.length,
            0
          );

          setStats({
            events: userEvents.length,
            badges: userBadgesData.length,
            materials: totalMaterials,
          });
        } else {
          // Load organizer stats
          const events = await getEventsByOrganizer(userData.uid);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie...</p>
        </div>
      </div>
    );
  }

  const isOrganizer = userData.role === "organizer";

  // Find badge details for user badges
  const getUserBadgeWithDetails = (userBadge: UserBadge) => {
    return badges.find((b) => b.id === userBadge.badgeId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={userData.photoURL}
                    alt={userData.displayName}
                  />
                  <AvatarFallback className="text-2xl">
                    {userData.displayName.charAt(0).toUpperCase()}
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
                  <Edit className="h-4 w-4 mr-2" />
                  Edytuj profil
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isOrganizer ? "Utworzone wydarzenia" : "Wydarzenia"}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isOrganizer ? "Przyznane odznaki" : "Zdobyte odznaki"}
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isOrganizer ? "Materiały" : "Dostępne materiały"}
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
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
                    <Award className="h-5 w-5 mr-2" />
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="text-center space-y-2">
                      <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : userBadges.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {userBadges.map((userBadge) => {
                    const badge = getUserBadgeWithDetails(userBadge);
                    if (!badge) return null;

                    return (
                      <div key={userBadge.id} className="text-center">
                        <BadgeDisplay
                          shape={badge.shape}
                          color={badge.color}
                          emoji={badge.emoji}
                          title={badge.title}
                          description={badge.description}
                          size="md"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Zdobyta:{" "}
                          {userBadge.awardedAt.toLocaleDateString("pl-PL")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nie masz jeszcze odznak
                  </h3>
                  <p className="text-gray-600 mb-4">
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
