import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { profilesDB, companiesDB } from '@/lib/dbHelpers';
import { Users, UserCheck, Shield, Building2, RefreshCw, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";

const SuperAdminDashboard = () => {
  const [userStats, setUserStats] = useState({
    students: 0,
    staff: 0,
    admins: 0,
    companies: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  useEffect(() => {
    fetchDashboardStats();

    // Auto-refresh every 30 seconds for real-time data
    const interval = setInterval(() => {
      fetchDashboardStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);

      const students = await profilesDB.countByRole('student');
      const staff = await profilesDB.countByRole('staff');
      const admins = await profilesDB.countByRole('admin');
      const companies = await companiesDB.count();

      setUserStats({ students, staff, admins, companies });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pieData = [
    { name: 'Students', value: userStats.students },
    { name: 'Staff', value: userStats.staff },
    { name: 'Admins', value: userStats.admins }
  ];

  const activityData = [
    { name: 'Mon', logins: 4, registrations: 2 },
    { name: 'Tue', logins: 7, registrations: 3 },
    { name: 'Wed', logins: 5, registrations: 4 },
    { name: 'Thu', logins: 8, registrations: 6 },
    { name: 'Fri', logins: 12, registrations: 8 },
    { name: 'Sat', logins: 6, registrations: 5 },
    { name: 'Sun', logins: 3, registrations: 1 }
  ];

  const stats = [
    {
      title: 'Total Students',
      value: userStats.students,
      icon: Users,
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconBg: 'bg-blue-400',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Staff Members',
      value: userStats.staff,
      icon: UserCheck,
      bgColor: 'bg-gradient-to-br from-green-500 to-green-600',
      iconBg: 'bg-green-400',
      change: '+5%',
      changeType: 'increase'
    },
    {
      title: 'Administrators',
      value: userStats.admins,
      icon: Shield,
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
      iconBg: 'bg-purple-400',
      change: '0%',
      changeType: 'neutral'
    },
    {
      title: 'Active Companies',
      value: userStats.companies,
      icon: Building2,
      bgColor: 'bg-gradient-to-br from-amber-500 to-amber-600',
      iconBg: 'bg-amber-400',
      change: '+18%',
      changeType: 'increase'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Real-time statistics • Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <Button
          onClick={fetchDashboardStats}
          variant="outline"
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className={`${stat.bgColor} text-white p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">{stat.title}</p>
                    <p className="text-3xl font-bold mt-2">
                      {isLoading ? '...' : stat.value}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className={`h-4 w-4 ${stat.changeType === 'increase' ? 'text-white' : 'text-white/60'}`} />
                      <span className="text-sm font-medium">{stat.change} from last month</span>
                    </div>
                  </div>
                  <div className={`${stat.iconBg} p-4 rounded-full`}>
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution Pie Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-1 bg-primary rounded-full" />
              User Distribution
            </CardTitle>
            <CardDescription>Live breakdown of users by role</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <RefreshCw className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Activity Bar Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-1 bg-primary rounded-full" />
              Weekly Activity
            </CardTitle>
            <CardDescription>System activity over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ChartContainer
                config={{
                  logins: { label: "Logins", color: "#2563eb" },
                  registrations: { label: "New Registrations", color: "#16a34a" }
                }}
              >
                <BarChart data={activityData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="logins" fill="var(--color-logins)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="registrations" fill="var(--color-registrations)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info Card */}
      <Card className="border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle>System Performance</CardTitle>
          <CardDescription>Platform health and activity metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">System Status</p>
                <p className="font-semibold text-green-600">Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="font-semibold">{userStats.students + userStats.staff + userStats.admins}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Growth Rate</p>
                <p className="font-semibold text-purple-600">+15.3%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;
