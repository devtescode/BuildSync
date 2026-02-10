import { useMemo } from "react";
import { getProjects } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import {
  FolderKanban,
  Activity,
  AlertTriangle,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const Dashboard = () => {
  const { user } = useAuth();
  const projects = getProjects();

  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(p => p.status === "active").length;
    const delayed = projects.filter(p => p.status === "delayed").length;
    const completed = projects.filter(p => p.status === "completed").length;
    const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
    const totalSpent = projects.reduce((s, p) => s + p.spent, 0);
    return { total, active, delayed, completed, totalBudget, totalSpent };
  }, [projects]);

  const cards = [
    { label: "Total Projects", value: stats.total, icon: FolderKanban, color: "text-primary" },
    { label: "Active Projects", value: stats.active, icon: Activity, color: "text-success" },
    { label: "Delayed Projects", value: stats.delayed, icon: AlertTriangle, color: "text-destructive" },
    { label: "Budget Used", value: `₦${(stats.totalSpent / 1_000_000).toFixed(1)}M`, icon: Wallet, color: "text-secondary" },
  ];

  const progressData = projects.slice(0, 6).map(p => ({ name: p.name.substring(0, 12), progress: p.progress }));

  const pieData = [
    { name: "Active", value: stats.active, color: "hsl(142, 71%, 40%)" },
    { name: "Completed", value: stats.completed, color: "hsl(217, 71%, 28%)" },
    { name: "Delayed", value: stats.delayed, color: "hsl(0, 72%, 51%)" },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Welcome back, {user?.name?.split(" ")[0] || "Engineer"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Here's your project overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="text-2xl font-display font-bold mt-1">{c.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center ${c.color}`}>
                <c.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="stat-card">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" /> Project Progress
          </h3>
          {progressData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={progressData}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="progress" fill="hsl(217, 71%, 28%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-12">No projects yet. Create one to see progress.</p>
          )}
        </div>

        <div className="stat-card">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <FolderKanban size={18} className="text-secondary" /> Status Breakdown
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={4}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-12">No data available yet.</p>
          )}
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
