import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Edit, BarChart2 } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Form } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface RecentFormsProps {
  userId: number;
  limit?: number;
}

export function RecentForms({ userId, limit = 3 }: RecentFormsProps) {
  const { data: forms, isLoading } = useQuery<Form[]>({
    queryKey: ["/api/forms"],
    enabled: !!userId,
  });

  const recentForms = forms ? forms.slice(0, limit) : [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!forms?.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No forms yet</h3>
          <p className="text-gray-500 mt-2">Create your first form to get started</p>
          <Button className="mt-4" asChild>
            <Link href="/forms/new">Create a form</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200">
          {recentForms.map((form) => (
            <div key={form.id} className="px-6 py-5 flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="text-primary h-10 w-10 mr-4" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{form.title}</h3>
                  <p className="text-sm text-gray-500">
                    Created {formatDistanceToNow(new Date(form.createdAt), { addSuffix: true })} • 
                    {form.analytics?.submissions || 0} submissions
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/forms/${form.id}`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={form.id ? `/analytics/${form.id}` : "/analytics"}>
                    <BarChart2 className="h-4 w-4 mr-2" />
                    Analytics
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-6 py-3">
        <div className="text-sm">
          <Link href="/forms" className="font-medium text-primary hover:text-primary-700">
            View all forms <span aria-hidden="true">→</span>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
