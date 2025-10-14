import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Shield, LogOut, CheckCircle, XCircle, Eye, DollarSign } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string | null;
}

interface KYCRequest {
  id: string;
  user_id: string;
  document_type: string;
  document_url: string;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewer_id: string | null;
  notes: string | null;
}

interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  requested_at: string;
  processed_at: string | null;
  payment_method: string;
  account_details: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<Profile[]>([]);
  const [kycRequests, setKycRequests] = useState<KYCRequest[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if user is admin
      if (user.email !== "admin.winquizz@gmail.com") {
        toast.error("Access denied. Admin privileges required.");
        navigate("/dashboard");
        return;
      }

      setUser(user);
      setIsAdmin(true);

      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Fetch KYC requests (we'll need to create this table)
      // For now, we'll show empty state

      // Fetch withdrawal requests (we'll need to create this table)
      // For now, we'll show empty state

    } catch (error: any) {
      console.error("Error loading admin panel:", error);
      toast.error("Failed to load admin panel");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const approveKYC = async (requestId: string) => {
    try {
      // KYC table not yet created - show placeholder functionality
      toast.info("KYC functionality will be available once the database table is created");
      // TODO: Uncomment when kyc_requests table is created
      /*
      const { error } = await supabase
        .from("kyc_requests")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          reviewer_id: user?.id
        })
        .eq("id", requestId);

      if (error) throw error;

      toast.success("KYC request approved");
      // Refresh data
      checkAdminAccess();
      */
    } catch (error: any) {
      toast.error("Failed to approve KYC request");
    }
  };

  const rejectKYC = async (requestId: string) => {
    try {
      // KYC table not yet created - show placeholder functionality
      toast.info("KYC functionality will be available once the database table is created");
      // TODO: Uncomment when kyc_requests table is created
      /*
      const { error } = await supabase
        .from("kyc_requests")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
          reviewer_id: user?.id
        })
        .eq("id", requestId);

      if (error) throw error;

      toast.success("KYC request rejected");
      // Refresh data
      checkAdminAccess();
      */
    } catch (error: any) {
      toast.error("Failed to reject KYC request");
    }
  };

  const processWithdrawal = async (requestId: string, action: "approve" | "reject") => {
    try {
      // Withdrawal table not yet created - show placeholder functionality
      toast.info("Withdrawal functionality will be available once the database table is created");
      // TODO: Uncomment when withdrawal_requests table is created
      /*
      const { error } = await supabase
        .from("withdrawal_requests")
        .update({
          status: action === "approve" ? "processed" : "rejected",
          processed_at: new Date().toISOString()
        })
        .eq("id", requestId);

      if (error) throw error;

      toast.success(`Withdrawal request ${action}d`);
      // Refresh data
      checkAdminAccess();
      */
    } catch (error: any) {
      toast.error(`Failed to ${action} withdrawal request`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="h-16 w-16 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-xl text-muted-foreground">Manage users, KYC requests, and withdrawals</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verified Users</p>
                  <p className="text-3xl font-bold">
                    {users?.filter(u => u.email_verified && u.phone_verified).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-full">
                  <Eye className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending KYC</p>
                  <p className="text-3xl font-bold">{kycRequests?.filter(k => k.status === "pending").length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <DollarSign className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Withdrawals</p>
                  <p className="text-3xl font-bold">{withdrawalRequests?.filter(w => w.status === "pending").length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="kyc">KYC Requests</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Registered Users</CardTitle>
                <CardDescription>View all registered users and their verification status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{user.full_name || "Unnamed User"}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-sm text-muted-foreground">{user.phone}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={user.email_verified ? "default" : "secondary"}>
                          {user.email_verified ? "Email Verified" : "Email Pending"}
                        </Badge>
                        <Badge variant={user.phone_verified ? "default" : "secondary"}>
                          {user.phone_verified ? "Phone Verified" : "Phone Pending"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kyc">
            <Card>
              <CardHeader>
                <CardTitle>KYC Requests</CardTitle>
                <CardDescription>Review and approve user KYC submissions</CardDescription>
              </CardHeader>
              <CardContent>
                {kycRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Eye className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No KYC Requests</h3>
                    <p className="text-muted-foreground">KYC requests will appear here when users submit them.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {kycRequests.map((request) => (
                      <div key={request.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold">KYC Request #{request.id.slice(0, 8)}</h3>
                            <p className="text-sm text-muted-foreground">
                              Submitted: {new Date(request.submitted_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={request.status === "pending" ? "secondary" : request.status === "approved" ? "default" : "destructive"}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-sm mb-4">Document Type: {request.document_type}</p>
                        {request.status === "pending" && (
                          <div className="flex gap-2">
                            <Button onClick={() => approveKYC(request.id)} className="bg-green-500 hover:bg-green-600">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button onClick={() => rejectKYC(request.id)} variant="destructive">
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Requests</CardTitle>
                <CardDescription>Process user withdrawal requests</CardDescription>
              </CardHeader>
              <CardContent>
                {withdrawalRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Withdrawal Requests</h3>
                    <p className="text-muted-foreground">Withdrawal requests will appear here when users request them.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {withdrawalRequests.map((request) => (
                      <div key={request.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold">Withdrawal Request #{request.id.slice(0, 8)}</h3>
                            <p className="text-sm text-muted-foreground">
                              Requested: {new Date(request.requested_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={request.status === "pending" ? "secondary" : request.status === "processed" ? "default" : "destructive"}>
                            {request.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium">Amount</p>
                            <p className="text-lg font-bold">₹{request.amount}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Payment Method</p>
                            <p className="text-sm">{request.payment_method}</p>
                          </div>
                        </div>
                        {request.status === "pending" && (
                          <div className="flex gap-2">
                            <Button onClick={() => processWithdrawal(request.id, "approve")} className="bg-green-500 hover:bg-green-600">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button onClick={() => processWithdrawal(request.id, "reject")} variant="destructive">
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
