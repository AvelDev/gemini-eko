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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Settings, User, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateDoc, doc, deleteDoc } from "firebase/firestore";
import { updateProfile, deleteUser } from "firebase/auth";
import { db } from "@/lib/firebase";

export default function SettingsPage() {
  const { userData, user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    displayName: userData?.displayName || "",
    bio: userData?.bio || "",
    photoURL: userData?.photoURL || "",
  });
  const router = useRouter();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || !user) return;

    setIsLoading(true);

    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: formData.displayName,
        photoURL: formData.photoURL || undefined,
      });

      // Update Firestore user document
      await updateDoc(doc(db, "users", userData.uid), {
        displayName: formData.displayName,
        bio: formData.bio,
        photoURL: formData.photoURL || null,
      });

      toast.success("Profil został zaktualizowany!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Błąd podczas aktualizacji profilu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userData || !user) return;

    setIsDeleting(true);

    try {
      // Delete user document from Firestore
      await deleteDoc(doc(db, "users", userData.uid));

      // Delete Firebase Auth user
      await deleteUser(user);

      toast.success("Konto zostało usunięte");
      router.push("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Błąd podczas usuwania konta");
    } finally {
      setIsDeleting(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href="/profile"
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Wróć do profilu
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ustawienia konta
          </h1>
          <p className="text-gray-600">
            Zarządzaj swoim profilem i ustawieniami konta
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informacje o profilu
              </CardTitle>
              <CardDescription>
                Aktualizuj swoje podstawowe informacje
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Profile Picture Preview */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={formData.photoURL}
                      alt={formData.displayName}
                    />
                    <AvatarFallback className="text-2xl">
                      {formData.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Badge
                      variant={
                        userData.role === "organizer" ? "default" : "secondary"
                      }
                    >
                      {userData.role === "organizer"
                        ? "Organizator"
                        : "Uczestnik"}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">
                      Rola:{" "}
                      {userData.role === "organizer"
                        ? "Organizator wydarzeń"
                        : "Uczestnik wydarzeń"}
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="displayName">Nazwa wyświetlana</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) =>
                      setFormData({ ...formData, displayName: e.target.value })
                    }
                    placeholder="np. EkoMarta"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="photoURL">URL zdjęcia profilowego</Label>
                  <Input
                    id="photoURL"
                    type="url"
                    value={formData.photoURL}
                    onChange={(e) =>
                      setFormData({ ...formData, photoURL: e.target.value })
                    }
                    placeholder="https://example.com/photo.jpg"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Link do Twojego zdjęcia profilowego
                  </p>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder="Opowiedz o sobie..."
                    rows={4}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Krótki opis o Tobie (opcjonalnie)
                  </p>
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    value={userData.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Email nie może być zmieniony
                  </p>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Aktualizowanie..." : "Aktualizuj profil"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Akcje konta
              </CardTitle>
              <CardDescription>Zarządzaj swoim kontem i danymi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Wyloguj się</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Wyloguj się z aktualnej sesji
                </p>
                <Button variant="outline" onClick={logout}>
                  Wyloguj się
                </Button>
              </div>

              <hr />

              <div className="space-y-2">
                <h4 className="font-medium text-red-600">Usuń konto</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Trwale usuń swoje konto i wszystkie związane z nim dane. Ta
                  akcja jest nieodwracalna.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isDeleting}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isDeleting ? "Usuwanie..." : "Usuń konto"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Czy na pewno chcesz usunąć konto?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Ta akcja jest nieodwracalna. Wszystkie Twoje dane,
                        włączając zdobyte odznaki, utworzone wydarzenia (jeśli
                        jesteś organizatorem) i materiały edukacyjne zostaną
                        trwale usunięte.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Anuluj</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Tak, usuń konto
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Wskazówka</h3>
            <p className="text-blue-800 text-sm">
              Twoje zdobyte odznaki są trwałe i będą widoczne na Twoim profilu
              nawet po opuszczeniu wydarzeń. Jako organizator, utworzone przez
              Ciebie wydarzenia i materiały pozostaną dostępne dla uczestników.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
