import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Wallet, CreditCard, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

interface WithdrawalRequest {
  id: string;
  amount: number;
  payment_method: string;
  payment_details: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requested_at: string;
  processed_at?: string;
  admin_notes?: string;
}

const Withdrawal = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);

  // Form state
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);

      // Fetch user profile with KYC status
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);
      await fetchWithdrawalRequests();
    } catch (error) {
      console.error("Error checking user:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawalRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .eq("user_id", user?.id)
        .order("requested_at", { ascending: false });

      if (error) throw error;
      setWithdrawalRequests(data || []);
    } catch (error) {
      console.error("Error fetching withdrawal requests:", error);
      toast.error("Failed to load withdrawal requests");
    }
  };

  const checkKycStatus = async () => {
    try {
      const { data: kycData, error } = await supabase
        .from("kyc_documents")
        .select("status")
        .eq("user_id", user?.id)
        .eq("status", "approved")
        .limit(1);

      if (error) throw error;
      return kycData && kycData.length > 0;
    } catch (error) {
      console.error("Error checking KYC status:", error);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!amount || !paymentMethod || !paymentDetails) {
      toast.error("Please fill in all fields");
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    if (withdrawalAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (withdrawalAmount > (profile?.wallet_balance || 0)) {
      toast.error("Insufficient wallet balance");
      return;
    }

    // Check KYC status
    const hasKyc = await checkKycStatus();
    if (!hasKyc) {
      toast.error("KYC verification required for withdrawals. Please complete KYC first.");
      navigate("/kyc");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("withdrawal_requests")
        // @ts-ignore - Supabase typing issue
        .insert([{
          user_id: user.id,
          amount: withdrawalAmount,
          payment_method: paymentMethod,
          payment_details: paymentDetails,
          status: 'pending'
        }]);

      if (error) throw error;

      toast.success("Withdrawal request submitted successfully");
      await fetchWithdrawalRequests();

      // Reset form
      setAmount("");
      setPaymentMethod("");
      setPaymentDetails("");

    } catch (error) {
      console.error("Error submitting withdrawal:", error);
      toast.error("Failed to submit withdrawal request");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-xl text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Withdraw Winnings</h1>
          <p className="text-xl text-muted-foreground">Request withdrawal of your quiz winnings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Withdrawal Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Request Withdrawal
              </CardTitle>
              <CardDescription>
                Submit a withdrawal request for your winnings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* KYC Status Warning */}
              {profile?.kyc_status !== 'approved' && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">KYC Verification Required</span>
                  </div>
                  <p className="text-sm text-yellow-700 mb-3">
                    You need to complete KYC verification before you can withdraw winnings.
                  </p>
                  <Button onClick={() => navigate("/kyc")} variant="outline" size="sm">
                    Complete KYC Verification
                  </Button>
                </div>
              )}

              {/* Wallet Balance */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Available Balance</span>
                  <span className="text-lg font-bold text-green-600">
                    ₹{profile?.wallet_balance?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Withdrawal Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount to withdraw"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  max={profile?.wallet_balance || 0}
                  disabled={profile?.kyc_status !== 'approved'}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum withdrawal: ₹100 | Maximum: ₹{profile?.wallet_balance?.toFixed(2) || '0.00'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment Method *</Label>
                <select
                  id="payment-method"
                  className="w-full p-2 border rounded-md"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={profile?.kyc_status !== 'approved'}
                >
                  <option value="">Select payment method</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="upi">UPI</option>
                  <option value="paytm">Paytm</option>
                  <option value="phonepe">PhonePe</option>
                  <option value="google_pay">Google Pay</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-details">
                  {paymentMethod === 'bank_transfer' ? 'Bank Account Details *' :
                   paymentMethod === 'upi' ? 'UPI ID *' :
                   'Payment Details *'}
                </Label>
                <Input
                  id="payment-details"
                  placeholder={
                    paymentMethod === 'bank_transfer' ? 'Account Number / IFSC Code' :
                    paymentMethod === 'upi' ? 'yourname@upi' :
                    'Enter payment details'
                  }
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                  disabled={profile?.kyc_status !== 'approved'}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitting || profile?.kyc_status !== 'approved' || !amount || !paymentMethod || !paymentDetails}
                className="w-full"
              >
                {submitting ? "Submitting..." : "Submit Withdrawal Request"}
              </Button>
            </CardContent>
          </Card>

          {/* Withdrawal History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Withdrawal History
              </CardTitle>
              <CardDescription>
                View your withdrawal requests and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {withdrawalRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No withdrawal requests yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Complete KYC verification and submit your first withdrawal request
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {withdrawalRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">₹{request.amount.toFixed(2)}</span>
                            <Badge className={`${getStatusColor(request.status)}`}>
                              {getStatusIcon(request.status)}
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {request.payment_method.replace('_', ' ').toUpperCase()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Requested: {new Date(request.requested_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {request.admin_notes && (
                        <div className="mt-2 p-3 bg-muted rounded-md">
                          <p className="text-sm font-medium">Admin Notes:</p>
                          <p className="text-sm text-muted-foreground">{request.admin_notes}</p>
                        </div>
                      )}

                      {request.status === 'pending' && (
                        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-yellow-800">
                            Your withdrawal request is being processed. This typically takes 1-3 business days.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Withdrawal;
