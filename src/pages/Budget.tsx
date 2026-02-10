import { useMemo } from "react";
import { getProjects } from "@/lib/storage";
import { Wallet, AlertTriangle, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const Budget = () => {
  const projects = getProjects();

  const totals = useMemo(() => {
    const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
    const totalSpent = projects.reduce((s, p) => s + p.spent, 0);
    return { totalBudget, totalSpent, remaining: totalBudget - totalSpent };
  }, [projects]);

  const chartData = projects.map(p => ({
    name: p.name.substring(0, 14),
    Budget: p.budget,
    Spent: p.spent,
  }));

  const pct = totals.totalBudget > 0 ? Math.round((totals.totalSpent / totals.totalBudget) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold">Budget Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Track spending across all projects</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2"><Wallet size={18} className="text-primary" /><span className="text-sm text-muted-foreground">Total Budget</span></div>
          <p className="text-2xl font-display font-bold">₦{totals.totalBudget.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2"><TrendingUp size={18} className="text-secondary" /><span className="text-sm text-muted-foreground">Total Spent</span></div>
          <p className="text-2xl font-display font-bold">₦{totals.totalSpent.toLocaleString()}</p>
          <Progress value={pct} className="mt-2 h-1.5" />
          <p className="text-xs text-muted-foreground mt-1">{pct}% used</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            {totals.remaining < 0 ? <AlertTriangle size={18} className="text-destructive" /> : <Wallet size={18} className="text-success" />}
            <span className="text-sm text-muted-foreground">Remaining</span>
          </div>
          <p className={`text-2xl font-display font-bold ${totals.remaining < 0 ? "text-destructive" : ""}`}>
            ₦{totals.remaining.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="stat-card">
        <h3 className="font-display font-semibold mb-4">Budget vs Spent by Project</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Budget" fill="hsl(217, 71%, 28%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Spent" fill="hsl(33, 95%, 54%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-12">No projects to display.</p>
        )}
      </div>

      {/* Per-project breakdown */}
      {projects.length > 0 && (
        <div className="stat-card p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-muted-foreground">Project</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Budget</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Spent</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Remaining</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Usage</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => {
                const rem = p.budget - p.spent;
                const usage = p.budget > 0 ? Math.round((p.spent / p.budget) * 100) : 0;
                return (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium">{p.name}</td>
                    <td className="p-4">₦{p.budget.toLocaleString()}</td>
                    <td className="p-4">₦{p.spent.toLocaleString()}</td>
                    <td className={`p-4 ${rem < 0 ? "text-destructive font-medium" : ""}`}>₦{rem.toLocaleString()}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(usage, 100)}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{usage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Budget;
