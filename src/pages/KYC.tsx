import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, FileText, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

interface KycDocument {
  id: string;
  document_type: string;
  front_photo_url: string;
  back_photo_url?: string;
  document_number?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  submitted_at: string;
  reviewed_at?: string;
}

const KYC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [kycDocuments, setKycDocuments] = useState<KycDocument[]>([]);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [frontPhoto, setFrontPhoto] = useState<File | null>(null);
  const [backPhoto, setBackPhoto] = useState<File | null>(null);

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
      await fetchKycDocuments();
    } catch (error) {
      console.error("Error checking user:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const fetchKycDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("kyc_documents")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      setKycDocuments(data || []);
    } catch (error) {
      console.error("Error fetching KYC documents:", error);
      toast.error("Failed to load KYC documents");
    }
  };

  const handleFileUpload = async (file: File, type: 'front' | 'back') => {
    if (!file) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('kyc-documents')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error(`Error uploading ${type} photo:`, error);
      toast.error(`Failed to upload ${type} photo`);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!documentType || !frontPhoto) {
      toast.error("Please select document type and upload front photo");
      return;
    }

    setUploading(true);
    try {
      // Upload files
      const frontPhotoUrl = await handleFileUpload(frontPhoto, 'front');
      if (!frontPhotoUrl) return;

      let backPhotoUrl = null;
      if (backPhoto) {
        backPhotoUrl = await handleFileUpload(backPhoto, 'back');
        if (!backPhotoUrl) return;
      }

      // Submit KYC document
      const { error } = await supabase
        .from("kyc_documents")
        // @ts-ignore - Supabase typing issue
        .insert([{
          user_id: user.id,
          document_type: documentType,
          front_photo_url: frontPhotoUrl,
          back_photo_url: backPhotoUrl,
          document_number: documentNumber || null,
          status: 'pending'
        }]);

      if (error) throw error;

      toast.success("KYC documents submitted successfully for review");
      await fetchKycDocuments();

      // Reset form
      setDocumentType("");
      setDocumentNumber("");
      setFrontPhoto(null);
      setBackPhoto(null);

    } catch (error) {
      console.error("Error submitting KYC:", error);
      toast.error("Failed to submit KYC documents");
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
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
          <h1 className="text-4xl font-bold mb-2">KYC Verification</h1>
          <p className="text-xl text-muted-foreground">Upload your ID documents for verification</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Submit KYC Documents
              </CardTitle>
              <CardDescription>
                Upload front and back photos of your valid ID proof for verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="document-type">Document Type *</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ID document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aadhar">Aadhar Card</SelectItem>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="driving_license">Driving License</SelectItem>
                    <SelectItem value="voter_id">Voter ID</SelectItem>
                    <SelectItem value="pan_card">PAN Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document-number">Document Number (Optional)</Label>
                <Input
                  id="document-number"
                  placeholder="Enter document number if applicable"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="front-photo">Front Photo *</Label>
                <Input
                  id="front-photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFrontPhoto(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Upload clear photo of the front side of your ID document
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="back-photo">Back Photo (Optional)</Label>
                <Input
                  id="back-photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBackPhoto(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Upload photo of the back side if applicable
                </p>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={uploading || !documentType || !frontPhoto}
                className="w-full"
              >
                {uploading ? "Submitting..." : "Submit for Verification"}
              </Button>
            </CardContent>
          </Card>

          {/* KYC Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                KYC Status & History
              </CardTitle>
              <CardDescription>
                View your KYC verification status and history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {kycDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No KYC documents submitted yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Submit your ID documents for verification to enable withdrawals
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {kycDocuments.map((doc) => (
                    <div key={doc.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium capitalize">
                            {doc.document_type.replace('_', ' ')}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Submitted: {new Date(doc.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={`${getStatusColor(doc.status)} flex items-center gap-1`}>
                          {getStatusIcon(doc.status)}
                          {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                        </Badge>
                      </div>

                      {doc.admin_notes && (
                        <div className="mt-2 p-3 bg-muted rounded-md">
                          <p className="text-sm font-medium">Admin Notes:</p>
                          <p className="text-sm text-muted-foreground">{doc.admin_notes}</p>
                        </div>
                      )}

                      {doc.status === 'pending' && (
                        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-yellow-800">
                            Your documents are under review. This process typically takes 1-2 business days.
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

export default KYC;
