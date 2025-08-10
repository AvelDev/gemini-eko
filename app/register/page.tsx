"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Leaf, Users, Briefcase } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"participant" | "organizer">("participant");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signUp(email, password, displayName, role);
      toast.success("Konto zostało utworzone pomyślnie!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "Błąd rejestracji. Spróbuj ponownie.";

      // Handle specific Firebase auth errors
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Konto z tym adresem email już istnieje.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Hasło jest zbyt słabe. Użyj co najmniej 6 znaków.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Nieprawidłowy format adresu email.";
      } else if (error.code === "auth/operation-not-allowed") {
        errorMessage = "Rejestracja jest tymczasowo wyłączona.";
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Leaf className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Dołącz do EKO-Odznak</CardTitle>
          <CardDescription>
            Utwórz konto i rozpocznij swoją ekologiczną przygodę
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="displayName">Nazwa wyświetlana</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="np. EkoMarta"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="twoj@email.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 znaków"
                minLength={6}
                required
              />
            </div>

            <div>
              <Label>Wybierz swoją rolę</Label>
              <RadioGroup
                value={role}
                onValueChange={(value: "participant" | "organizer") =>
                  setRole(value)
                }
                className="mt-2"
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="participant" id="participant" />
                  <Label
                    htmlFor="participant"
                    className="flex items-center cursor-pointer flex-1"
                  >
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    <div>
                      <div className="font-medium">Uczestnik</div>
                      <div className="text-sm text-gray-600">
                        Chcę uczestniczyć w wydarzeniach i zdobywać odznaki
                      </div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="organizer" id="organizer" />
                  <Label
                    htmlFor="organizer"
                    className="flex items-center cursor-pointer flex-1"
                  >
                    <Briefcase className="h-5 w-5 mr-2 text-green-600" />
                    <div>
                      <div className="font-medium">Organizator</div>
                      <div className="text-sm text-gray-600">
                        Chcę tworzyć wydarzenia i zarządzać odznakami
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Tworzenie konta..." : "Utwórz konto"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Masz już konto? </span>
            <Link href="/login" className="text-green-600 hover:underline">
              Zaloguj się
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
