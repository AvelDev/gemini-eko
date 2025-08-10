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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeDisplay } from "@/components/badge-display";
import { BadgeCreator } from "@/components/badge-creator";
import { MaterialEditor } from "@/components/material-editor";
import {
  Calendar,
  MapPin,
  Users,
  Award,
  BookOpen,
  Plus,
  ArrowLeft,
  Edit,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getEvent,
  joinEvent,
  leaveEvent,
  getMaterialsByEvent,
  getBadgesByEvent,
  createMaterial,
  createBadge,
  awardBadge,
  getUserBadges,
  getMissionsByEvent,
  createMission,
} from "@/lib/firestore";
import type {
  Event,
  Material,
  Badge as BadgeType,
  UserBadge,
  Mission,
} from "@/lib/types";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function EventPage() {
  const [event, setEvent] = useState<Event | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBadgeCreator, setShowBadgeCreator] = useState(false);
  const [showMaterialEditor, setShowMaterialEditor] = useState(false);
  const [showMissionEditor, setShowMissionEditor] = useState(false);
  const [missionData, setMissionData] = useState({
    title: "",
    description: "",
    isRequired: false,
  });
  const [showAwardDialog, setShowAwardDialog] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<string>("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );

  const { userData } = useAuth();
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  // Utility function to shorten IDs for display
  const shortenId = (id: string, length: number = 8): string => {
    return id.length > length ? `${id.substring(0, length)}...` : id;
  };

  const loadEventData = useCallback(async () => {
    if (!eventId || !userData) return;

    try {
      const [eventData, materialsData, badgesData, missionsData] =
        await Promise.all([
          getEvent(eventId),
          getMaterialsByEvent(eventId),
          getBadgesByEvent(eventId),
          getMissionsByEvent(eventId),
        ]);

      if (!eventData) {
        toast.error("Wydarzenie nie zostało znalezione");
        router.push("/events");
        return;
      }

      setEvent(eventData);
      setMaterials(materialsData);
      setBadges(badgesData);
      setMissions(missionsData);

      // Load user badges if participant
      if (userData.role === "participant") {
        const userBadgesData = await getUserBadges(userData.uid);
        setUserBadges(userBadgesData.filter((ub) => ub.eventId === eventId));
      }
    } catch (error) {
      console.error("Error loading event data:", error);
      toast.error("Błąd podczas ładowania danych wydarzenia");
    } finally {
      setLoading(false);
    }
  }, [eventId, userData, router]);

  useEffect(() => {
    loadEventData();
  }, [loadEventData]);

  const handleJoinEvent = async () => {
    if (!userData || !event) return;

    try {
      await joinEvent(userData.uid, event.id);
      toast.success("Pomyślnie dołączono do wydarzenia!");
      await loadEventData();
    } catch (error) {
      console.error("Error joining event:", error);
      toast.error("Błąd podczas dołączania do wydarzenia");
    }
  };

  const handleLeaveEvent = async () => {
    if (!userData || !event) return;

    try {
      await leaveEvent(userData.uid, event.id);
      toast.success("Opuszczono wydarzenie");
      await loadEventData();
    } catch (error) {
      console.error("Error leaving event:", error);
      toast.error("Błąd podczas opuszczania wydarzenia");
    }
  };

  const handleCreateMaterial = async (materialData: any) => {
    if (!userData || !event) return;

    try {
      await createMaterial({
        ...materialData,
        eventId: event.id,
        organizerId: userData.uid,
      });
      toast.success("Materiał został utworzony!");
      setShowMaterialEditor(false);
      await loadEventData();
    } catch (error) {
      console.error("Error creating material:", error);
      toast.error("Błąd podczas tworzenia materiału");
    }
  };

  const handleCreateBadge = async (badgeData: any) => {
    if (!userData || !event) return;

    try {
      await createBadge({
        ...badgeData,
        eventId: event.id,
        organizerId: userData.uid,
      });
      toast.success("Odznaka została utworzona!");
      setShowBadgeCreator(false);
      await loadEventData();
    } catch (error) {
      console.error("Error creating badge:", error);
      toast.error("Błąd podczas tworzenia odznaki");
    }
  };

  const handleCreateMission = async () => {
    if (!userData || !event || !missionData.title.trim()) return;

    try {
      await createMission({
        title: missionData.title,
        description: missionData.description,
        eventId: event.id,
        organizerId: userData.uid,
        isRequired: missionData.isRequired,
      });
      toast.success("Misja została utworzona!");
      setShowMissionEditor(false);
      setMissionData({ title: "", description: "", isRequired: false });
      await loadEventData();
    } catch (error) {
      console.error("Error creating mission:", error);
      toast.error("Błąd podczas tworzenia misji");
    }
  };

  const handleAwardBadge = async () => {
    if (
      !userData ||
      !event ||
      !selectedBadge ||
      selectedParticipants.length === 0
    )
      return;

    try {
      await Promise.all(
        selectedParticipants.map((participantId) =>
          awardBadge(participantId, selectedBadge, event.id, userData.uid)
        )
      );
      toast.success(
        `Odznaka została przyznana ${selectedParticipants.length} uczestnik(om)!`
      );
      setShowAwardDialog(false);
      setSelectedBadge("");
      setSelectedParticipants([]);
    } catch (error) {
      console.error("Error awarding badge:", error);
      toast.error("Błąd podczas przyznawania odznaki");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-green-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Ładowanie wydarzenia...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Wydarzenie nie znalezione</CardTitle>
            <CardDescription>
              Wydarzenie mogło zostać usunięte lub nie masz uprawnień do jego
              przeglądania
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

  const isOrganizer = userData?.uid === event.organizerId;
  const isParticipant = userData && event.participants.includes(userData.uid);

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            href="/events"
            className="inline-flex items-center mb-4 text-green-600 hover:text-green-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Wróć do wydarzeń
          </Link>

          {/* Event Header */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {event.imageUrl && (
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  width={800}
                  height={400}
                  className="object-cover w-full h-64 mb-6 rounded-lg"
                />
              )}

              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="mb-2 text-3xl font-bold text-gray-900">
                    {event.title}
                  </h1>
                  <p className="mb-4 text-gray-600">{event.description}</p>
                </div>
                <Badge
                  variant={
                    event.status === "upcoming" ? "default" : "secondary"
                  }
                >
                  {event.status === "upcoming"
                    ? "Nadchodzące"
                    : event.status === "ongoing"
                    ? "Trwa"
                    : "Zakończone"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>{event.date.toLocaleDateString("pl-PL")}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="w-5 h-5 mr-2" />
                  <span>{event.participants.length} uczestników</span>
                </div>
              </div>
            </div>

            {/* Action Panel */}
            <div className="space-y-4">
              {!isOrganizer && (
                <Card>
                  <CardHeader>
                    <CardTitle>Uczestnictwo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isParticipant ? (
                      <div className="space-y-4">
                        <div className="font-medium text-green-600">
                          ✓ Bierzesz udział w tym wydarzeniu
                        </div>
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={handleLeaveEvent}
                        >
                          Opuść wydarzenie
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={handleJoinEvent}
                        disabled={event.status !== "upcoming"}
                      >
                        Dołącz do wydarzenia
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {isOrganizer && (
                <Card>
                  <CardHeader>
                    <CardTitle>Panel organizatora</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Dialog
                      open={showMaterialEditor}
                      onOpenChange={setShowMaterialEditor}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Dodaj materiał
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Nowy materiał edukacyjny</DialogTitle>
                        </DialogHeader>
                        <MaterialEditor
                          onSave={handleCreateMaterial}
                          onCancel={() => setShowMaterialEditor(false)}
                        />
                      </DialogContent>
                    </Dialog>

                    <Dialog
                      open={showBadgeCreator}
                      onOpenChange={setShowBadgeCreator}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <Award className="w-4 h-4 mr-2" />
                          Stwórz odznakę
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Nowa odznaka</DialogTitle>
                        </DialogHeader>
                        <BadgeCreator
                          onSave={handleCreateBadge}
                          onCancel={() => setShowBadgeCreator(false)}
                        />
                      </DialogContent>
                    </Dialog>

                    <Dialog
                      open={showMissionEditor}
                      onOpenChange={setShowMissionEditor}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <Settings className="w-4 h-4 mr-2" />
                          Stwórz misję
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Nowa misja</DialogTitle>
                          <DialogDescription>
                            Stwórz zadanie dla uczestników wydarzenia
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">
                              Tytuł misji
                            </label>
                            <Input
                              value={missionData.title}
                              onChange={(e) =>
                                setMissionData({
                                  ...missionData,
                                  title: e.target.value,
                                })
                              }
                              placeholder="np. Zrób zdjęcie EKO-instalacji"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Opis</label>
                            <Textarea
                              value={missionData.description}
                              onChange={(e) =>
                                setMissionData({
                                  ...missionData,
                                  description: e.target.value,
                                })
                              }
                              placeholder="Szczegółowy opis zadania..."
                              rows={3}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="isRequired"
                              checked={missionData.isRequired}
                              onCheckedChange={(checked) =>
                                setMissionData({
                                  ...missionData,
                                  isRequired: !!checked,
                                })
                              }
                            />
                            <label htmlFor="isRequired" className="text-sm">
                              Misja wymagana do zdobycia odznaki
                            </label>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleCreateMission}
                              className="flex-1"
                            >
                              Stwórz misję
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowMissionEditor(false)}
                            >
                              Anuluj
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {badges.length > 0 && (
                      <Dialog
                        open={showAwardDialog}
                        onOpenChange={setShowAwardDialog}
                      >
                        <DialogTrigger asChild>
                          <Button className="w-full">
                            <Award className="w-4 h-4 mr-2" />
                            Przyznaj odznakę
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Przyznaj odznakę</DialogTitle>
                            <DialogDescription>
                              Wybierz odznakę i uczestników, którym chcesz ją
                              przyznać
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">
                                Odznaka
                              </label>
                              <Select
                                value={selectedBadge}
                                onValueChange={setSelectedBadge}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Wybierz odznakę" />
                                </SelectTrigger>
                                <SelectContent>
                                  {badges.map((badge) => (
                                    <SelectItem key={badge.id} value={badge.id}>
                                      {badge.emoji} {badge.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="text-sm font-medium">
                                Uczestnicy
                              </label>
                              <div className="space-y-2 overflow-y-auto max-h-48">
                                {event.participants.map((participantId) => (
                                  <div
                                    key={participantId}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={participantId}
                                      checked={selectedParticipants.includes(
                                        participantId
                                      )}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setSelectedParticipants([
                                            ...selectedParticipants,
                                            participantId,
                                          ]);
                                        } else {
                                          setSelectedParticipants(
                                            selectedParticipants.filter(
                                              (id) => id !== participantId
                                            )
                                          );
                                        }
                                      }}
                                    />
                                    <label
                                      htmlFor={participantId}
                                      className="text-sm"
                                    >
                                      Uczestnik {shortenId(participantId)}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={handleAwardBadge}
                                disabled={
                                  !selectedBadge ||
                                  selectedParticipants.length === 0
                                }
                                className="flex-1"
                              >
                                Przyznaj odznakę
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setShowAwardDialog(false)}
                              >
                                Anuluj
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* User's event badges */}
              {!isOrganizer && userBadges.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="w-5 h-5 mr-2" />
                      Twoje odznaki
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {userBadges.map((userBadge) => {
                        const badge = badges.find(
                          (b) => b.id === userBadge.badgeId
                        );
                        if (!badge) return null;

                        return (
                          <div key={userBadge.id} className="text-center">
                            <BadgeDisplay
                              shape={badge.shape}
                              color={badge.color}
                              emoji={badge.emoji}
                              title={badge.title}
                              description={badge.description}
                              size="sm"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="materials" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="materials">
              <BookOpen className="w-4 h-4 mr-2" />
              Materiały ({materials.length})
            </TabsTrigger>
            <TabsTrigger value="badges">
              <Award className="w-4 h-4 mr-2" />
              Odznaki ({badges.length})
            </TabsTrigger>
            <TabsTrigger value="missions">
              <Settings className="w-4 h-4 mr-2" />
              Misje ({missions.length})
            </TabsTrigger>
            <TabsTrigger value="participants">
              <Users className="w-4 h-4 mr-2" />
              Uczestnicy ({event.participants.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="materials" className="mt-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {materials.map((material) => (
                <Card key={material.id}>
                  <CardHeader>
                    {material.imageUrl && (
                      <Image
                        src={material.imageUrl}
                        alt={material.title}
                        width={400}
                        height={200}
                        className="object-cover w-full h-48 mb-4 rounded-lg"
                      />
                    )}
                    <CardTitle>{material.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose-sm prose max-w-none">
                      <ReactMarkdown>{material.content}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {materials.length === 0 && (
              <div className="py-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Brak materiałów edukacyjnych
                </h3>
                <p className="text-gray-600">
                  {isOrganizer
                    ? "Dodaj pierwszy materiał edukacyjny dla uczestników"
                    : "Organizator nie dodał jeszcze materiałów edukacyjnych"}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="badges" className="mt-6">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-6">
              {badges.map((badge) => (
                <div key={badge.id} className="text-center">
                  <BadgeDisplay
                    shape={badge.shape}
                    color={badge.color}
                    emoji={badge.emoji}
                    title={badge.title}
                    description={badge.description}
                    size="md"
                  />
                </div>
              ))}
            </div>
            {badges.length === 0 && (
              <div className="py-12 text-center">
                <Award className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Brak odznak
                </h3>
                <p className="text-gray-600">
                  {isOrganizer
                    ? "Stwórz pierwszą odznakę dla uczestników"
                    : "Organizator nie stworzył jeszcze odznak"}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="missions" className="mt-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {missions.map((mission) => (
                <Card key={mission.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="flex items-center">
                        <Settings className="w-5 h-5 mr-2" />
                        {mission.title}
                      </CardTitle>
                      {mission.isRequired && (
                        <Badge variant="destructive" className="text-xs">
                          Wymagana
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{mission.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600">
                      Utworzona: {mission.createdAt.toLocaleDateString("pl-PL")}
                    </div>
                    {!isOrganizer && (
                      <div className="mt-3">
                        <Button size="sm" variant="outline" className="w-full">
                          Oznacz jako ukończone
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            {missions.length === 0 && (
              <div className="py-12 text-center">
                <Settings className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Brak misji
                </h3>
                <p className="text-gray-600">
                  {isOrganizer
                    ? "Stwórz pierwszą misję dla uczestników"
                    : "Organizator nie stworzył jeszcze misji"}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="participants" className="mt-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {event.participants.map((participantId) => (
                <Card key={participantId}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Uczestnik</p>
                        <p className="text-sm text-gray-600">
                          ID: {shortenId(participantId)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {event.participants.length === 0 && (
              <div className="py-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Brak uczestników
                </h3>
                <p className="text-gray-600">
                  Wydarzenie jeszcze nie ma uczestników
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
