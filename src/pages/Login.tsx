import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, Mail, User, ArrowRight, Lock, Phone, Briefcase, Shield, HardHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  const { loginAdmin, loginWorker, signupWorker } = useAuth();
  const [tab, setTab] = useState("admin");
  const [error, setError] = useState("");

  // Admin form
  const [adminName, setAdminName] = useState("");
  const [adminPass, setAdminPass] = useState("");

  // Worker login
  const [wLoginEmail, setWLoginEmail] = useState("");
  const [wLoginPass, setWLoginPass] = useState("");

  // Worker signup
  const [wName, setWName] = useState("");
  const [wEmail, setWEmail] = useState("");
  const [wPhone, setWPhone] = useState("");
  const [wRole, setWRole] = useState("");
  const [wPass, setWPass] = useState("");

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const err = loginAdmin(adminName.trim(), adminPass);
    if (err) setError(err);
  };

  const handleWorkerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const err = loginWorker(wLoginEmail.trim(), wLoginPass);
    if (err) setError(err);
  };

  const handleWorkerSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (wPass.length < 4) { setError("Password must be at least 4 characters"); return; }
    const err = signupWorker(wName, wEmail, wPhone, wRole, wPass);
    if (err) setError(err);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary/[0.03] px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4">
            <Building2 size={32} />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">BuildSync</h1>
          <p className="text-muted-foreground mt-2">Construction Project Management</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-lg p-8">
          <Tabs value={tab} onValueChange={v => { setTab(v); setError(""); }}>
            <TabsList className="grid grid-cols-3 w-full mb-6">
              <TabsTrigger value="admin" className="gap-1.5 text-xs"><Shield size={14} /> Admin</TabsTrigger>
              <TabsTrigger value="worker-login" className="gap-1.5 text-xs"><HardHat size={14} /> Worker</TabsTrigger>
              <TabsTrigger value="worker-signup" className="gap-1.5 text-xs"><User size={14} /> Sign Up</TabsTrigger>
            </TabsList>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-3 py-2 mb-4">{error}</div>
            )}

            <TabsContent value="admin">
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <h2 className="text-lg font-display font-semibold">Admin Sign In</h2>
                <div className="space-y-2">
                  <Label htmlFor="admin-name">Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input id="admin-name" value={adminName} onChange={e => setAdminName(e.target.value)} placeholder="Admin name" className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-pass">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input id="admin-pass" type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} placeholder="Enter admin password" className="pl-10" required />
                  </div>
                </div>
                <Button type="submit" className="w-full gap-2">Sign In <ArrowRight size={16} /></Button>
              </form>
            </TabsContent>

            <TabsContent value="worker-login">
              <form onSubmit={handleWorkerLogin} className="space-y-4">
                <h2 className="text-lg font-display font-semibold">Worker Sign In</h2>
                <div className="space-y-2">
                  <Label htmlFor="w-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input id="w-email" type="email" value={wLoginEmail} onChange={e => setWLoginEmail(e.target.value)} placeholder="you@email.com" className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="w-pass">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input id="w-pass" type="password" value={wLoginPass} onChange={e => setWLoginPass(e.target.value)} placeholder="Your password" className="pl-10" required />
                  </div>
                </div>
                <Button type="submit" className="w-full gap-2">Sign In <ArrowRight size={16} /></Button>
                <p className="text-xs text-center text-muted-foreground">Don't have an account? Switch to the Sign Up tab.</p>
              </form>
            </TabsContent>

            <TabsContent value="worker-signup">
              <form onSubmit={handleWorkerSignup} className="space-y-4">
                <h2 className="text-lg font-display font-semibold">Worker Sign Up</h2>
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input value={wName} onChange={e => setWName(e.target.value)} placeholder="Your name" className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input type="email" value={wEmail} onChange={e => setWEmail(e.target.value)} placeholder="you@email.com" className="pl-10" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                      <Input value={wPhone} onChange={e => setWPhone(e.target.value)} placeholder="080..." className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                      <Input value={wRole} onChange={e => setWRole(e.target.value)} placeholder="Mason, Electrician..." className="pl-10" required />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input type="password" value={wPass} onChange={e => setWPass(e.target.value)} placeholder="Min 4 characters" className="pl-10" required />
                  </div>
                </div>
                <Button type="submit" className="w-full gap-2">Create Account <ArrowRight size={16} /></Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Ilara-Mokin, Ondo State, Nigeria
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
