import React, { useState } from "react";
import { useParams } from "wouter";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { formatDistance } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";

const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#f97316'];

export default function Analytics() {
  const { id } = useParams();
  // We're now using MongoDB which has string IDs, not numeric
  const formId = id;
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Define interface for analytics data
  interface AnalyticsData {
    analytics?: {
      views: number;
      submissions: number;
      conversionRate: number;
      averageCompletionTime?: number;
    };
    submissions?: Array<{
      id: string | number;
      formId: string | number;
      data: Record<string, any>;
      submittedAt: string;
      form?: {
        title: string;
        description?: string;
      };
    }>;
  }

  const { data, isLoading, error, isError } = useQuery<AnalyticsData, Error>({
    queryKey: [`/api/forms/${formId}/analytics`],
    enabled: !!formId,
    retry: 1,
    // Use onError function via options object
    onSuccess: (data) => {
      if (!data || Object.keys(data).length === 0) {
        toast({
          title: "No data available",
          description: "There's no analytics data for this form yet.",
          variant: "default",
        });
      }
    }
  });

  const handleExportData = () => {
    if (!data?.submissions) return;

    try {
      // Convert submissions to CSV
      const replacer = (key, value) => value === null ? '' : value;
      const header = Object.keys(data.submissions[0]?.data || {});
      const csv = [
        header.join(','),
        ...data.submissions.map(row => {
          return header.map(fieldName => {
            return JSON.stringify(row.data[fieldName], replacer);
          }).join(',');
        })
      ].join('\r\n');

      // Create a download link
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `form-submissions-${formId}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast({
        title: "Export successful",
        description: "Your data has been exported as a CSV file",
      });
    } catch (err) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your data",
        variant: "destructive",
      });
    }
  };

  const isPremiumFeature = user?.planType !== "pro";

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="container mt-6">
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href="/forms">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to forms
            </Link>
          </Button>
          
          <Card className="mt-4">
            <CardContent className="text-center py-12">
              <div className="bg-red-100 text-red-800 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Error loading analytics</h2>
              <p className="text-gray-500 mt-2 max-w-md mx-auto">
                There was a problem loading analytics data. This could be due to a network issue or the form might not exist.
              </p>
              <div className="mt-6 space-x-3">
                <Button onClick={() => window.location.reload()}>
                  Try again
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/forms">
                    Go back to forms
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const { analytics, submissions = [] } = data;
  const form = submissions[0]?.form;

  // Generate daily submission data for chart
  const submissionsByDate = submissions.reduce((acc, submission) => {
    const date = new Date(submission.createdAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const submissionChartData = Object.keys(submissionsByDate).map(date => ({
    date,
    submissions: submissionsByDate[date],
  }));

  // Generate field data for pie chart
  const fieldCompletionData = [];
  if (submissions.length > 0 && submissions[0].data) {
    const totalSubmissions = submissions.length;
    const fieldNames = Object.keys(submissions[0].data);
    
    fieldNames.forEach(field => {
      const filledCount = submissions.filter(s => s.data[field] && s.data[field] !== "").length;
      const percentage = (filledCount / totalSubmissions) * 100;
      fieldCompletionData.push({
        name: field,
        value: percentage,
      });
    });
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <div className="flex items-center mb-2">
            <Button variant="ghost" size="sm" className="mr-2" asChild>
              <Link href="/forms">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900">
              Analytics: {form?.title || "Form"}
            </h1>
          </div>
          <p className="text-gray-500">
            {analytics?.views || 0} views • {analytics?.submissions || 0} submissions • 
            {analytics?.conversionRate ? ` ${analytics.conversionRate}% conversion rate` : " 0% conversion rate"}
          </p>
        </div>
        <Button 
          variant="outline" 
          className="mt-4 sm:mt-0"
          onClick={handleExportData}
          disabled={submissions.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger 
            value="advanced"
            className={isPremiumFeature ? "opacity-70" : ""}
            disabled={isPremiumFeature}
          >
            Advanced Analytics {isPremiumFeature && <span className="ml-2 text-xs bg-primary/20 text-primary px-1 rounded">Pro</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Submissions Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {submissionChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={submissionChartData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="submissions" fill="#6366f1" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-500">
                      No submission data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Total Views</div>
                    <div className="text-2xl font-bold">{analytics?.views || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Total Submissions</div>
                    <div className="text-2xl font-bold">{analytics?.submissions || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Conversion Rate</div>
                    <div className="text-2xl font-bold">{analytics?.conversionRate || 0}%</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Avg. Completion Time</div>
                    <div className="text-2xl font-bold">
                      {analytics?.averageCompletionTime
                        ? `${Math.floor(analytics.averageCompletionTime / 60)}m ${analytics.averageCompletionTime % 60}s`
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Field Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  {fieldCompletionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={fieldCompletionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {fieldCompletionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-500">
                      No field data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="submissions" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Form Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No submissions yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        {Object.keys(submissions[0].data || {}).map((field) => (
                          <TableHead key={field}>{field}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {new Date(submission.createdAt).toLocaleDateString()}
                            <div className="text-xs text-gray-500">
                              {formatDistance(new Date(submission.createdAt), new Date(), { addSuffix: true })}
                            </div>
                          </TableCell>
                          {Object.keys(submissions[0].data || {}).map((field) => (
                            <TableCell key={`${submission.id}-${field}`}>
                              {submission.data[field] || "-"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="mt-0">
          {isPremiumFeature ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 flex items-center justify-center rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Advanced Analytics</h3>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                  Upgrade to our Pro plan to access advanced analytics features including user demographics, 
                  form completion heatmaps, and detailed conversion funnels.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/subscription">Upgrade to Pro</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Demographics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Desktop', value: 60 },
                            { name: 'Mobile', value: 30 },
                            { name: 'Tablet', value: 10 },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[0, 1, 2].map((index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Submission Time Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { time: "Morning", submissions: 12 },
                          { time: "Afternoon", submissions: 24 },
                          { time: "Evening", submissions: 18 },
                          { time: "Night", submissions: 6 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="submissions" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Form Completion Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { step: "View", count: 100, fill: "#6366f1" },
                          { step: "Start", count: 75, fill: "#8b5cf6" },
                          { step: "Fill 50%", count: 60, fill: "#d946ef" },
                          { step: "Fill 90%", count: 45, fill: "#ec4899" },
                          { step: "Submit", count: 30, fill: "#f43f5e" },
                        ]}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="step" type="category" />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8">
                          {[0, 1, 2, 3, 4].map((index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
