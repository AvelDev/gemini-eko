"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Leaf, Users, Award, BookOpen } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <section className="px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Leaf className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h1 className="mb-6 text-5xl font-bold text-gray-900">
              EKO-Odznaki
            </h1>
            <p className="mb-8 text-xl text-gray-600">
              Zdobywaj wiedzę ekologiczną, kolekcjonuj odznaki i twórz lepszą
              przyszłość dla naszej planety
            </p>
            {!user ? (
              <div className="flex justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="px-8">
                    Rozpocznij przygodę
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="px-8">
                    Zaloguj się
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/dashboard">
                <Button size="lg" className="px-8">
                  Przejdź do panelu
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-center text-gray-900">
            Jak to działa?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="text-center transition-shadow hover:shadow-lg">
              <CardHeader>
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <CardTitle>Ucz się</CardTitle>
                <CardDescription>
                  Zdobywaj wiedzę ekologiczną poprzez interaktywne materiały i
                  praktyczne wskazówki
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center transition-shadow hover:shadow-lg">
              <CardHeader>
                <Users className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <CardTitle>Uczestniczaj</CardTitle>
                <CardDescription>
                  Bierz udział w wydarzeniach ekologicznych, warsztatach i
                  konferencjach
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center transition-shadow hover:shadow-lg">
              <CardHeader>
                <Award className="w-12 h-12 mx-auto mb-4 text-orange-600" />
                <CardTitle>Zdobywaj odznaki</CardTitle>
                <CardDescription>
                  Otrzymuj unikalne cyfrowe odznaki za swoje osiągnięcia i
                  zaangażowanie
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 text-white bg-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Dołącz do społeczności EKO-Odznak
          </h2>
          <p className="mb-8 text-xl text-green-100">
            Rozpocznij swoją przygodę z ekologią już dziś i stań się częścią
            ruchu na rzecz lepszej planety
          </p>
          {!user && (
            <Link href="/register">
              <Button size="lg" variant="secondary" className="px-8">
                Zarejestruj się za darmo
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
