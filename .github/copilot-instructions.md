# AI Coding Agent Instructions - Score App Client

## Project Overview

This is a **Next.js 14.2.25** application using the **App Router** architecture for managing sports tournaments. The client connects to a separate backend API (running on `http://localhost:4000`) and handles tournament creation, team management, match tracking, and organizer dashboards.

### Core Technologies

- **Framework**: Next.js 14.2.25 with App Router
- **React**: 19.x with client-side hooks
- **TypeScript**: Strict typing enabled
- **Styling**: Tailwind CSS 3.4.0 with custom HSL variables
- **HTTP Client**: axios ^1.12.2
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: lucide-react
- **Date Handling**: date-fns
- **Authentication**: JWT Bearer tokens stored in localStorage

---

## Architecture Guidelines

### 1. API Integration Patterns

#### **Critical: Separate API Endpoints from Static Files**

The backend serves two different types of resources:

- **API Endpoints**: `http://localhost:4000/api/v1/*` (use `API_URL` environment variable)
- **Static Files**: `http://localhost:4000/uploads/*` (use direct URL, NOT `API_URL`)

**Environment Configuration**:

```typescript
// .env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

**Correct Usage**:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ✅ Correct: API endpoint call
const response = await axios.get(`${API_URL}/tournaments/${id}`);

// ✅ Correct: Static file URL (images, uploads)
const bannerUrl = `http://localhost:4000${tournament.tournamentBanner}`;
// where tournament.tournamentBanner is like "/uploads/banners/image.jpg"

// ❌ Wrong: DO NOT use API_URL for static files
const wrongUrl = `${API_URL}${tournament.tournamentBanner}`; // Results in /api/v1/uploads/...
```

#### **Authentication Pattern**

All protected API routes require JWT Bearer token authentication:

```typescript
const token = localStorage.getItem("token");
if (!token) {
  toast({
    title: "Authentication required",
    description: "Please login to continue",
    variant: "destructive",
  });
  router.push("/organizer/login");
  return;
}

const response = await axios.get(`${API_URL}/endpoint`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

#### **Error Handling Pattern**

Always use try-catch with axios error checking and toast notifications:

```typescript
try {
  const response = await axios.get(`${API_URL}/endpoint`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  // Handle success
} catch (error) {
  if (axios.isAxiosError(error)) {
    toast({
      title: "Error title",
      description: error.response?.data?.message || "Default error message",
      variant: "destructive",
    });
  }
}
```

---

### 2. File Upload Implementation

#### **FormData Pattern**

**Critical**: FormData field names must match backend multer configuration exactly.

**Known Field Names**:

- Tournament banner: `tournamentBanner`
- Team logo: `teamLogo`
- Tournament ID field: `tournamentId` (NOT `tournament`)

**Implementation Example**:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const token = localStorage.getItem("token");
    const formData = new FormData();

    // Add text fields
    formData.append("name", teamName);
    formData.append("tournamentId", selectedTournament); // NOT "tournament"
    formData.append("group", group);

    // Add file field
    if (logoFile) {
      formData.append("teamLogo", logoFile); // Exact field name required
    }

    const response = await axios.post(`${API_URL}/teams`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    toast({
      title: "Success",
      description: "Team created successfully",
    });

    // Reset form and close dialog
    setIsAddDialogOpen(false);
    setNewTeam({ name: "", tournamentId: "", group: "" });
    setLogoFile(null);
    setLogoPreview(null);

    // Refresh data
    fetchTeams();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      toast({
        title: "Error creating team",
        description: error.response?.data?.message || "Failed to create team",
        variant: "destructive",
      });
    }
  } finally {
    setIsSubmitting(false);
  }
};
```

#### **Drag-and-Drop File Upload**

```typescript
const [logoFile, setLogoFile] = useState<File | null>(null);
const [logoPreview, setLogoPreview] = useState<string | null>(null);
const [isDragging, setIsDragging] = useState(false);

const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(true);
};

const handleDragLeave = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(false);
};

const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(false);

  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) {
    handleFileSelection(file);
  }
};

const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    handleFileSelection(file);
  }
};

const handleFileSelection = (file: File) => {
  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    toast({
      title: "File too large",
      description: "Please select an image under 5MB",
      variant: "destructive",
    });
    return;
  }

  setLogoFile(file);

  // Create preview
  const reader = new FileReader();
  reader.onloadend = () => {
    setLogoPreview(reader.result as string);
  };
  reader.readAsDataURL(file);
};
```

---

### 3. Next.js Image Component Configuration

**Critical**: External images require explicit domain configuration.

#### **next.config.mjs Configuration**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
```

#### **Image Component Usage**

```typescript
import Image from "next/image";

// For uploaded images from backend
<div className="relative h-40 w-full overflow-hidden rounded-md">
  <Image
    src={`http://localhost:4000${team.teamLogo}`}
    alt={team.name}
    fill
    className="object-cover"
  />
</div>

// For placeholder/local images
<Image
  src="/placeholder.svg"
  alt="Placeholder"
  width={100}
  height={100}
/>
```

**Common Pitfall**: If you see "Invalid src prop... hostname 'localhost' is not configured", you forgot to add the domain to `remotePatterns` in `next.config.mjs`.

---

### 4. Component Patterns

#### **Client Components**

All pages with state/hooks must use `"use client"` directive:

```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
// ... rest of imports

export default function MyPage() {
  // Component logic
}
```

#### **Loading States**

```typescript
const [isLoading, setIsLoading] = useState(true);
const [isSubmitting, setIsSubmitting] = useState(false);

// Display loading state
{isLoading ? (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
) : (
  // Content
)}

// Button loading state
<Button disabled={isSubmitting}>
  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isSubmitting ? "Saving..." : "Save"}
</Button>
```

#### **Confirmation Dialogs**

Always confirm destructive actions:

```typescript
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
const [isDeleting, setIsDeleting] = useState(false);

const handleDeleteClick = (item: Item) => {
  setItemToDelete(item);
  setIsDeleteDialogOpen(true);
};

const handleDeleteConfirm = async () => {
  if (!itemToDelete) return;

  setIsDeleting(true);
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`${API_URL}/items/${itemToDelete._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    toast({
      title: "Deleted successfully",
      description: "Item has been removed",
    });

    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
    fetchItems(); // Refresh list
  } catch (error) {
    if (axios.isAxiosError(error)) {
      toast({
        title: "Error deleting item",
        description: error.response?.data?.message || "Failed to delete",
        variant: "destructive",
      });
    }
  } finally {
    setIsDeleting(false);
  }
};

// In JSX
<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogDescription>
        Are you sure you want to delete "{itemToDelete?.name}"? This action
        cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => setIsDeleteDialogOpen(false)}
        disabled={isDeleting}
      >
        Cancel
      </Button>
      <Button
        variant="destructive"
        onClick={handleDeleteConfirm}
        disabled={isDeleting}
      >
        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isDeleting ? "Deleting..." : "Delete"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>;
```

#### **Empty States**

```typescript
{filteredItems.length === 0 ? (
  <Card className="glass">
    <CardContent className="flex flex-col items-center justify-center p-8">
      <Users className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground text-center mb-4">
        {searchQuery
          ? "No items found matching your search"
          : "No items yet. Create your first one!"}
      </p>
      <Button onClick={() => setIsAddDialogOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Item
      </Button>
    </CardContent>
  </Card>
) : (
  // Display items
)}
```

---

### 5. Styling Guidelines

#### **Tailwind CSS Custom Classes**

The project uses custom utility classes defined in `globals.css`:

```css
.glass {
  @apply backdrop-blur-md border border-border/50;
  background-color: hsl(var(--card) / 0.8);
}

.glass-strong {
  @apply backdrop-blur-lg border border-border/60;
  background-color: hsl(var(--card) / 0.9);
}
```

**Usage**:

```typescript
<Card className="glass">
  {/* Frosted glass effect card */}
</Card>

<Card className="glass-strong">
  {/* Stronger glass effect */}
</Card>
```

#### **Color Variables**

Colors are defined as HSL custom properties supporting light/dark modes:

- `--background`, `--foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--muted`, `--muted-foreground`
- `--border`, `--input`, `--ring`

Use Tailwind utilities: `bg-background`, `text-foreground`, `border-border`, etc.

---

### 6. Common Pitfalls & Solutions

#### **Pitfall 1: Null/Undefined Date Formatting**

❌ **Wrong**:

```typescript
<p>{format(new Date(tournament.startDate), "PPP")}</p>
// Error: Invalid time value (if date is null)
```

✅ **Correct**:

```typescript
{
  tournament.startDate && tournament.endDate && (
    <p>
      {format(new Date(tournament.startDate), "PPP")} -{" "}
      {format(new Date(tournament.endDate), "PPP")}
    </p>
  );
}
```

#### **Pitfall 2: Using API_URL for Static Files**

❌ **Wrong**:

```typescript
const imageUrl = `${API_URL}${tournament.tournamentBanner}`;
// Results in: http://localhost:4000/api/v1/uploads/banner.jpg (404)
```

✅ **Correct**:

```typescript
const imageUrl = `http://localhost:4000${tournament.tournamentBanner}`;
// Results in: http://localhost:4000/uploads/banner.jpg
```

#### **Pitfall 3: Wrong FormData Field Names**

❌ **Wrong**:

```typescript
formData.append("tournament", tournamentId); // Backend expects "tournamentId"
formData.append("logo", logoFile); // Backend expects "teamLogo"
```

✅ **Correct**:

```typescript
formData.append("tournamentId", tournamentId);
formData.append("teamLogo", logoFile);
```

**Best Practice**: Always verify field names with backend multer configuration before implementing uploads.

#### **Pitfall 4: Forgetting "use client" Directive**

If using hooks (`useState`, `useEffect`, `useRouter`, etc.), the component MUST have `"use client"` at the top:

```typescript
"use client"; // REQUIRED for hooks/state

import { useState } from "react";
```

#### **Pitfall 5: Not Refreshing Data After Mutations**

After create/update/delete operations, always refresh the data:

```typescript
const handleCreate = async () => {
  await axios.post(/* ... */);
  toast({ title: "Created successfully" });

  // ✅ Refresh data
  fetchItems();

  // ✅ Close dialog
  setIsAddDialogOpen(false);

  // ✅ Reset form
  setFormData({ name: "", ... });
};
```

---

### 7. TypeScript Type Definitions

Types are defined in `lib/types.ts`. Always import and use these types:

```typescript
import type { Tournament, Team, Match, TournamentStatus } from "@/lib/types";

// Example interface for API response
interface Team {
  _id: string;
  name: string;
  logo?: string;
  teamLogo?: string;
  tournament: {
    _id: string;
    name: string;
  };
  group?: string;
  players?: number;
}
```

**Convention**: Backend uses `_id` for MongoDB IDs, frontend types use `id`. Handle this mapping when fetching data.

---

### 8. Routing Structure

The app uses Next.js App Router with the following structure:

```
app/
  ├── page.tsx                        # Homepage
  ├── tournaments/
  │   ├── page.tsx                    # Tournament list
  │   └── [id]/
  │       ├── page.tsx                # Tournament detail
  │       └── edit/
  │           └── page.tsx            # Edit tournament
  └── organizer/
      ├── login/page.tsx
      ├── register/page.tsx
      └── dashboard/
          ├── page.tsx                # Main dashboard
          ├── create/page.tsx         # Create tournament
          ├── teams/page.tsx          # Team management
          └── matches/page.tsx        # Match management
```

**Navigation Patterns**:

```typescript
import { useRouter } from "next/navigation";

const router = useRouter();

// Navigate to another page
router.push("/organizer/dashboard");

// Navigate back
router.back();

// Refresh current route
router.refresh();
```

---

### 9. shadcn/ui Component Usage

The project uses shadcn/ui components. Always import from `@/components/ui/*`:

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
```

**Common Component Patterns**:

```typescript
// Button variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Ghost</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>

// Card structure
<Card className="glass">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>

// Select component
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    {options.map(option => (
      <SelectItem key={option.id} value={option.id}>
        {option.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

---

### 10. Development Workflow

#### **Starting Development**

```bash
npm run dev
# Opens on http://localhost:3000
```

#### **Environment Variables**

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

**Note**: All client-accessible variables must start with `NEXT_PUBLIC_`.

#### **Building for Production**

```bash
npm run build
npm run start
```

#### **Common Commands**

```bash
npm run lint          # Run ESLint
npm run dev           # Development server
npm run build         # Production build
```

---

### 11. Testing API Integration Checklist

When implementing new API features:

- [ ] Use `NEXT_PUBLIC_API_URL` from environment variables
- [ ] Add Bearer token authentication for protected routes
- [ ] Implement try-catch with axios error handling
- [ ] Show loading state during request
- [ ] Display toast notification on success/error
- [ ] Refresh data after mutations
- [ ] Handle 401 (redirect to login) and 403 (permission denied) errors
- [ ] Add null/undefined checks before rendering data
- [ ] Use correct field names for FormData uploads
- [ ] Configure `next.config.mjs` for new image domains
- [ ] Test with empty states (no data)
- [ ] Add confirmation dialogs for destructive actions

---

### 12. Code Organization Best Practices

#### **File Structure Pattern**

```typescript
"use client";

// 1. React/Next.js imports
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

// 2. Third-party library imports
import axios from "axios";
import { format } from "date-fns";

// 3. UI component imports
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// 4. Icon imports
import { Plus, Trash2, Edit, Loader2 } from "lucide-react";

// 5. Utility/type imports
import { useToast } from "@/hooks/use-toast";
import type { Tournament } from "@/lib/types";

// 6. Constants
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 7. Interfaces (component-specific)
interface ComponentProps {
  // ...
}

// 8. Component definition
export default function ComponentName() {
  // Hooks
  const router = useRouter();
  const { toast } = useToast();

  // State
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Effects
  useEffect(() => {
    fetchData();
  }, []);

  // Functions
  const fetchData = async () => {
    // Implementation
  };

  // Render
  return (
    // JSX
  );
}
```

#### **State Management Convention**

```typescript
// Boolean states: use "is" prefix
const [isLoading, setIsLoading] = useState(false);
const [isOpen, setIsOpen] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);

// Data states: descriptive names
const [teams, setTeams] = useState<Team[]>([]);
const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

// Form states: use object or individual fields
const [formData, setFormData] = useState({ name: "", description: "" });
```

---

## Quick Reference

### Essential Imports Checklist

```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
```

### API Call Template

```typescript
const fetchData = async () => {
  try {
    setIsLoading(true);
    const token = localStorage.getItem("token");

    const response = await axios.get(`${API_URL}/endpoint`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setData(response.data.items);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load data",
        variant: "destructive",
      });
    }
  } finally {
    setIsLoading(false);
  }
};
```

### File Upload Template

```typescript
const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append("fieldName", file); // Match backend field name
  formData.append("otherField", value);

  const response = await axios.post(`${API_URL}/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};
```

---

## Summary

This codebase follows Next.js 14 App Router conventions with strict TypeScript, Tailwind CSS styling, and shadcn/ui components. Key principles:

1. **API URLs**: Separate endpoints (`/api/v1`) from static files (`/uploads`)
2. **Authentication**: JWT Bearer tokens in all protected requests
3. **Error Handling**: Try-catch with axios checks and toast notifications
4. **File Uploads**: FormData with exact field names matching backend
5. **Images**: Next.js Image component with remotePatterns configuration
6. **Loading States**: Always show feedback during async operations
7. **Confirmation**: Destructive actions require user confirmation
8. **Type Safety**: Use TypeScript interfaces from `lib/types.ts`

When in doubt, reference existing implementations in `app/organizer/dashboard/teams/page.tsx` or `app/tournaments/[id]/page.tsx` for patterns.
