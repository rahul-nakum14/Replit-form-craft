import React from "react";
import { 
  FileText, 
  Inbox, 
  Percent, 
  Clock 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface StatsCardsProps {
  userId: number;
}

export function StatsCards({ userId }: StatsCardsProps) {
  const { data: formStats } = useQuery({
    queryKey: ["/api/forms"],
    enabled: !!userId,
  });

  // Calculate statistics from form data
  const totalForms = formStats?.length || 0;
  
  // Aggregated submission count across all forms
  const totalSubmissions = formStats?.reduce((total, form) => {
    return total + (form.analytics?.submissions || 0);
  }, 0) || 0;

  // Average conversion rate
  const avgConversionRate = formStats?.length 
    ? formStats.reduce((sum, form) => {
        return sum + (parseFloat(form.analytics?.conversionRate || "0"));
      }, 0) / formStats.length
    : 0;

  // Average completion time
  const avgCompletionTime = formStats?.length 
    ? formStats.reduce((sum, form) => {
        return sum + (form.analytics?.averageCompletionTime || 0);
      }, 0) / formStats.length
    : 0;

  // Format average completion time as minutes and seconds
  const formattedCompletionTime = () => {
    const mins = Math.floor(avgCompletionTime / 60);
    const secs = Math.floor(avgCompletionTime % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Forms
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {totalForms}
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <Inbox className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Submissions
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {totalSubmissions}
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <Percent className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Avg. Conversion Rate
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {avgConversionRate.toFixed(1)}%
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Avg. Completion Time
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {formattedCompletionTime()}
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
