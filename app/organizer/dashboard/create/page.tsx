"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Trophy, CalendarIcon, Upload, ArrowRight, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import type { SportType, TournamentFormat } from "@/lib/types"

const sportTypes: SportType[] = [
  "Soccer",
  "Basketball",
  "Tennis",
  "Volleyball",
  "Cricket",
  "Baseball",
  "Rugby",
  "Hockey",
]
const formatTypes: TournamentFormat[] = ["League", "Knockout", "Hybrid"]

export default function CreateTournamentPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    sport: "",
    format: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    location: "",
    description: "",
    teamsCount: "",
    rules: "",
    prizes: "",
    pointsForWin: "3",
    pointsForDraw: "1",
    pointsForLoss: "0",
  })

  const handleChange = (field: string, value: string | Date | undefined) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = () => {
    // Simulate tournament creation
    console.log("Creating tournament:", formData)
    router.push("/organizer/dashboard")
  }

  const isStep1Valid =
    formData.name && formData.sport && formData.format && formData.startDate && formData.endDate && formData.location
  const isStep2Valid = formData.description && formData.teamsCount
  const isStep3Valid = formData.rules

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center">
            <Trophy className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Create Tournament</h1>
            <p className="text-muted-foreground">Set up your new tournament in a few simple steps</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center font-semibold transition-colors",
                      step >= s ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {s}
                  </div>
                  <div className="text-xs mt-2 text-center">
                    {s === 1 && "Basic Info"}
                    {s === 2 && "Details"}
                    {s === 3 && "Rules"}
                    {s === 4 && "Review"}
                  </div>
                </div>
                {s < 4 && (
                  <div
                    className={cn("h-1 flex-1 mx-2 rounded transition-colors", step > s ? "bg-accent" : "bg-muted")}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the fundamental details of your tournament</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Tournament Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Summer Soccer Championship 2025"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sport">Sport Type *</Label>
                <Select value={formData.sport} onValueChange={(value) => handleChange("sport", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {sportTypes.map((sport) => (
                      <SelectItem key={sport} value={sport}>
                        {sport}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Tournament Format *</Label>
                <Select value={formData.format} onValueChange={(value) => handleChange("format", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {formatTypes.map((format) => (
                      <SelectItem key={format} value={format}>
                        {format}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => handleChange("startDate", date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => handleChange("endDate", date)}
                      disabled={(date) => (formData.startDate ? date < formData.startDate : false)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., New York, USA"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!isStep1Valid}>
                Next Step
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Tournament Details */}
      {step === 2 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Tournament Details</CardTitle>
            <CardDescription>Provide additional information about your tournament</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your tournament, its goals, and what makes it special..."
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamsCount">Number of Teams/Participants *</Label>
              <Input
                id="teamsCount"
                type="number"
                placeholder="e.g., 16"
                value={formData.teamsCount}
                onChange={(e) => handleChange("teamsCount", e.target.value)}
                min="2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prizes">Prizes (Optional)</Label>
              <Textarea
                id="prizes"
                placeholder="e.g., 1st Place: $50,000 | 2nd Place: $25,000 | 3rd Place: $10,000"
                value={formData.prizes}
                onChange={(e) => handleChange("prizes", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Tournament Banner (Optional)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-accent transition-colors cursor-pointer">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button onClick={() => setStep(3)} disabled={!isStep2Valid}>
                Next Step
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Rules & Configuration */}
      {step === 3 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Rules & Configuration</CardTitle>
            <CardDescription>Set up tournament rules and point system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="rules">Tournament Rules *</Label>
              <Textarea
                id="rules"
                placeholder="Enter the rules and regulations for your tournament..."
                value={formData.rules}
                onChange={(e) => handleChange("rules", e.target.value)}
                rows={6}
              />
            </div>

            {formData.format === "League" && (
              <div className="space-y-4">
                <h3 className="font-semibold">Points System</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pointsForWin">Points for Win</Label>
                    <Input
                      id="pointsForWin"
                      type="number"
                      value={formData.pointsForWin}
                      onChange={(e) => handleChange("pointsForWin", e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pointsForDraw">Points for Draw</Label>
                    <Input
                      id="pointsForDraw"
                      type="number"
                      value={formData.pointsForDraw}
                      onChange={(e) => handleChange("pointsForDraw", e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pointsForLoss">Points for Loss</Label>
                    <Input
                      id="pointsForLoss"
                      type="number"
                      value={formData.pointsForLoss}
                      onChange={(e) => handleChange("pointsForLoss", e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button onClick={() => setStep(4)} disabled={!isStep3Valid}>
                Next Step
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review & Submit */}
      {step === 4 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Review & Submit</CardTitle>
            <CardDescription>Review your tournament details before creating</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Tournament Name:</span>
                  <p className="font-medium">{formData.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Sport:</span>
                  <p className="font-medium">{formData.sport}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Format:</span>
                  <p className="font-medium">{formData.format}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <p className="font-medium">{formData.location}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Start Date:</span>
                  <p className="font-medium">{formData.startDate ? format(formData.startDate, "PPP") : "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">End Date:</span>
                  <p className="font-medium">{formData.endDate ? format(formData.endDate, "PPP") : "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Teams:</span>
                  <p className="font-medium">{formData.teamsCount}</p>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground text-sm">Description:</span>
                <p className="text-sm mt-1">{formData.description}</p>
              </div>

              {formData.prizes && (
                <div>
                  <span className="text-muted-foreground text-sm">Prizes:</span>
                  <p className="text-sm mt-1">{formData.prizes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button onClick={handleSubmit} size="lg">
                <Trophy className="mr-2 h-5 w-5" />
                Create Tournament
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
