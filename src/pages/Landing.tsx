import { Link } from "react-router-dom";
import { Building2, Shield, HardHat, BarChart3, Users, Package, Wallet, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: BarChart3, title: "Real-Time Dashboard", desc: "Monitor project progress, budgets, and deadlines with live visual analytics." },
  { icon: Users, title: "Worker Management", desc: "Workers sign up, get assigned to projects, and mark tasks as completed." },
  { icon: Package, title: "Materials Tracking", desc: "Track materials, purchases, and costs with automatic budget updates." },
  { icon: Wallet, title: "Dynamic Budget", desc: "Budget updates automatically as tasks are completed and materials purchased." },
  { icon: CheckCircle2, title: "Task System", desc: "Create tasks per project, assign costs, and track completion in real time." },
  { icon: Shield, title: "Role-Based Access", desc: "Separate admin and worker interfaces with secure authentication." },
];

const Landing = () => (
  <div className="min-h-screen bg-background">
    {/* Hero */}
    <header className="border-b border-border bg-card">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <Building2 size={20} />
          </div>
          <span className="font-display font-bold text-xl">BuildSync</span>
        </div>
        <Link to="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    </header>

    <section className="max-w-6xl mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight">
        Construction Project<br />Management, <span className="text-primary">Simplified</span>
      </h1>
      <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
        Plan, monitor, and manage construction projects with real-time progress tracking,
        budget management, and seamless worker coordination.
      </p>
      <div className="flex gap-3 justify-center mt-8">
        <Link to="/login">
          <Button size="lg" className="gap-2"><Shield size={18} /> Admin Login</Button>
        </Link>
        <Link to="/login">
          <Button size="lg" variant="outline" className="gap-2"><HardHat size={18} /> Worker Login</Button>
        </Link>
      </div>
    </section>

    {/* How it works */}
    <section className="bg-muted/30 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-display font-bold text-center mb-4">How BuildSync Works</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          Two simple workflows — one for admins, one for workers.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Shield size={24} />
            </div>
            <h3 className="font-display font-semibold text-lg">For Admins</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" /> Create and manage construction projects</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" /> Add tasks with associated costs to each project</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" /> Assign workers and track their progress</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" /> Monitor budgets, spending, and materials</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" /> Receive notifications when tasks are completed</li>
            </ul>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <HardHat size={24} />
            </div>
            <h3 className="font-display font-semibold text-lg">For Workers</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" /> Sign up with your details and get authenticated</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" /> View all projects you're assigned to</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" /> See your tasks and mark them as done</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" /> Leave comments visible to the admin</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" /> Progress and budget update automatically</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-display font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => (
            <div key={f.title} className="stat-card text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <f.icon size={24} />
              </div>
              <h3 className="font-display font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="border-t border-border py-6">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-sm text-muted-foreground">BuildSync © 2026 — Ilara-Mokin, Ondo State, Nigeria</p>
      </div>
    </footer>
  </div>
);

export default Landing;
