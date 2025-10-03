"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Users,
  Calendar,
  TrendingUp,
  Search,
  ArrowRight,
  MapPin,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock featured tournaments data
const featuredTournaments = [
  {
    _id: "1",
    name: "Summer Soccer Championship 2025",
    sport: "Soccer",
    status: "In Progress",
    startDate: "2025-06-01",
    endDate: "2025-06-30",
    location: "New York, USA",
    teamsCount: 16,
    currentStage: "Quarter Finals",
    organizerName: "Elite Sports League",
    bannerImage: "/soccer-stadium-championship.jpg",
  },
  {
    _id: "2",
    name: "National Basketball Tournament",
    sport: "Basketball",
    status: "Upcoming",
    startDate: "2025-07-15",
    endDate: "2025-08-15",
    location: "Los Angeles, USA",
    teamsCount: 12,
    currentStage: "Registration Open",
    organizerName: "Pro Basketball Association",
    bannerImage: "/basketball-arena-tournament.jpg",
  },
  {
    _id: "3",
    name: "International Tennis Open",
    sport: "Tennis",
    status: "Upcoming",
    startDate: "2025-08-01",
    endDate: "2025-08-20",
    location: "London, UK",
    teamsCount: 32,
    currentStage: "Early Registration",
    organizerName: "Global Tennis Federation",
    bannerImage: "/tennis-court-professional.jpg",
  },
];

function AnimatedCounter({
  end,
  duration = 2000,
  suffix = "",
}: {
  end: number;
  duration?: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredTournaments.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-background to-background" />

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-20 left-20 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

        <div className="container relative z-10 mx-auto px-4 py-20">
          <div className="mx-auto max-w-4xl text-center space-y-8">
            <Badge variant="secondary" className="mb-4 text-sm px-4 py-1">
              The Future of Tournament Management
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance">
              Elevate Your{" "}
              <span className="text-accent">Sports Tournaments</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground text-balance max-w-2xl mx-auto">
              The premier platform for organizing, managing, and discovering
              professional sports tournaments worldwide
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="text-lg px-8" asChild>
                <Link href="/tournaments">
                  Explore Tournaments
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 bg-transparent"
                asChild
              >
                <Link href="/organizer/register">Become an Organizer</Link>
              </Button>
            </div>

            {/* Quick Search */}
            <div className="pt-8 max-w-2xl mx-auto">
              <div className="glass-strong rounded-lg p-2 flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <Input
                    type="search"
                    placeholder="Search tournaments..."
                    className="border-0 bg-transparent focus-visible:ring-0"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full sm:w-[180px] border-0 bg-transparent">
                    <SelectValue placeholder="Sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sports</SelectItem>
                    <SelectItem value="soccer">Soccer</SelectItem>
                    <SelectItem value="basketball">Basketball</SelectItem>
                    <SelectItem value="tennis">Tennis</SelectItem>
                    <SelectItem value="volleyball">Volleyball</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="lg" className="w-full sm:w-auto">
                  <Search className="h-5 w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Search</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-3">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div className="text-4xl font-bold">
                <AnimatedCounter end={1247} suffix="+" />
              </div>
              <div className="text-sm text-muted-foreground">
                Total Tournaments
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="flex justify-center mb-3">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div className="text-4xl font-bold">
                <AnimatedCounter end={342} />
              </div>
              <div className="text-sm text-muted-foreground">
                Active Matches
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="flex justify-center mb-3">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div className="text-4xl font-bold">
                <AnimatedCounter end={45678} suffix="+" />
              </div>
              <div className="text-sm text-muted-foreground">
                Registered Users
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="flex justify-center mb-3">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div className="text-4xl font-bold">
                <AnimatedCounter end={98} suffix="%" />
              </div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tournaments Carousel */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Tournaments
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the most exciting tournaments happening right now
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Carousel */}
            <div className="relative overflow-hidden rounded-xl">
              {featuredTournaments.map((tournament, index) => (
                <div
                  key={tournament._id}
                  className={cn(
                    "transition-all duration-500 ease-in-out",
                    index === currentSlide
                      ? "opacity-100"
                      : "opacity-0 absolute inset-0"
                  )}
                >
                  <Card className="glass border-0 overflow-hidden">
                    <div className="relative h-[300px] md:h-[400px]">
                      <img
                        src={tournament.bannerImage || "/placeholder.svg"}
                        alt={tournament.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge
                            variant="secondary"
                            className="bg-accent text-accent-foreground"
                          >
                            {tournament.sport}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="bg-green-500 text-white"
                          >
                            {tournament.status}
                          </Badge>
                        </div>

                        <h3 className="text-2xl md:text-3xl font-bold mb-3">
                          {tournament.name}
                        </h3>

                        <div className="flex flex-wrap gap-4 text-sm mb-4">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {tournament.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {tournament.teamsCount} Teams
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {tournament.currentStage}
                          </div>
                        </div>

                        <Button asChild>
                          <Link href={`/tournaments/${tournament._id}`}>
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>

            {/* Carousel Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {featuredTournaments.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    index === currentSlide
                      ? "w-8 bg-accent"
                      : "w-2 bg-muted-foreground/30"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link href="/tournaments">
                View All Tournaments
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto glass-strong rounded-2xl p-8 md:p-12 text-center">
            <Trophy className="h-16 w-16 text-accent mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Organize Your Tournament?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of organizers who trust TournamentPro to manage
              their events professionally and efficiently
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/organizer/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
