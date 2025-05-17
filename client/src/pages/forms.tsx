import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Form } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { 
  Plus, 
  FileText, 
  Edit, 
  BarChart2, 
  Trash2, 
  Eye, 
  Copy, 
  MoreVertical,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Forms() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [formToDelete, setFormToDelete] = useState<number | null>(null);

  const { data: forms, isLoading } = useQuery<Form[]>({
    queryKey: ["/api/forms"],
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (formId: number) => apiRequest("DELETE", `/api/forms/${formId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forms"] });
      toast({
        title: "Form deleted",
        description: "Your form has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete form: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDeleteForm = (formId: number) => {
    setFormToDelete(formId);
  };

  const confirmDelete = () => {
    if (formToDelete) {
      deleteMutation.mutate(formToDelete);
      setFormToDelete(null);
    }
  };

  const cancelDelete = () => {
    setFormToDelete(null);
  };

  const copyEmbedCode = (slug: string) => {
    const embedCode = `<iframe src="${window.location.origin}/f/${slug}" width="100%" height="500" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Embed code copied",
      description: "Form embed code copied to clipboard",
    });
  };

  // Filter and sort forms
  const filteredForms = forms
    ? forms
        .filter(form => 
          form.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
          if (sortBy === "newest") {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          } else if (sortBy === "oldest") {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          } else if (sortBy === "alphabetical") {
            return a.title.localeCompare(b.title);
          } else if (sortBy === "mostSubmissions") {
            const aSubmissions = (a as any).analytics?.submissions || 0;
            const bSubmissions = (b as any).analytics?.submissions || 0;
            return bSubmissions - aSubmissions;
          }
          return 0;
        })
    : [];

  const handleCreateForm = () => {
    if (user?.planType === "free" && forms && forms.length >= 3) {
      toast({
        title: "Free plan limit reached",
        description: "Upgrade to Pro to create unlimited forms",
        variant: "destructive",
      });
    } else {
      setLocation("/forms/new");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Forms</h1>
        <Button onClick={handleCreateForm} className="mt-4 sm:mt-0">
          <Plus className="h-5 w-5 mr-2" />
          Create Form
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search forms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-64">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="oldest">Oldest first</SelectItem>
                    <SelectItem value="alphabetical">Alphabetical</SelectItem>
                    <SelectItem value="mostSubmissions">Most submissions</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center my-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredForms.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            {searchQuery ? (
              <>
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No forms found</h3>
                <p className="text-gray-500 mt-2">
                  No forms match your search "{searchQuery}".
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </Button>
              </>
            ) : (
              <>
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No forms yet</h3>
                <p className="text-gray-500 mt-2">Create your first form to get started</p>
                <Button className="mt-4" onClick={handleCreateForm}>
                  Create a form
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForms.map((form) => (
            <Card key={form.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <FileText className="text-primary h-10 w-10 mr-4" />
                      <div className="truncate">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {form.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(form.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setLocation(`/forms/${form.id}`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLocation(`/analytics/${form.id}`)}>
                          <BarChart2 className="h-4 w-4 mr-2" />
                          Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/f/${form.slug}`, '_blank')}>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyEmbedCode(form.slug)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Embed Code
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDeleteForm(form.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <div className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                      {form.isPublished ? "Published" : "Draft"}
                    </div>
                    <div className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                      {(form as any).analytics?.submissions || 0} submissions
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 grid grid-cols-3 divide-x divide-gray-200">
                  <Button 
                    variant="ghost" 
                    className="py-3 text-sm font-medium rounded-none"
                    asChild
                  >
                    <Link href={`/forms/${form.id}`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="py-3 text-sm font-medium rounded-none"
                    asChild
                  >
                    <a href={`/f/${form.slug}`} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </a>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="py-3 text-sm font-medium rounded-none"
                    asChild
                  >
                    <Link href={form.id ? `/analytics/${form.id}` : "/analytics"}>
                      <BarChart2 className="h-4 w-4 mr-2" />
                      Analytics
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {user?.planType === "free" && forms && forms.length >= 3 && (
        <Card className="mt-6 bg-primary/10 border-primary/20">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900">Free Plan Limit Reached</h3>
            <p className="text-gray-600 mt-2">
              You've reached the limit of 3 forms on the free plan.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/subscription">Upgrade to Pro</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={formToDelete !== null} onOpenChange={cancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the form and all its submissions.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
