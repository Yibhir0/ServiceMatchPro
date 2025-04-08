import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Briefcase, FileCheck, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";

export default function AdminDashboard() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCredential, setSelectedCredential] = useState<any>(null);
  const [isCredentialDialogOpen, setIsCredentialDialogOpen] = useState(false);
  
  // Fetch users
  const { 
    data: users = [], 
    isLoading: isLoadingUsers 
  } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!user && user.role === "admin",
  });
  
  // Fetch all bookings
  const { 
    data: bookings = [], 
    isLoading: isLoadingBookings 
  } = useQuery({
    queryKey: ["/api/admin/bookings"],
    queryFn: async () => {
      const res = await fetch("/api/bookings");
      return await res.json();
    },
    enabled: !!user && user.role === "admin",
  });
  
  // Fetch all credentials
  const { 
    data: allCredentials = [], 
    isLoading: isLoadingCredentials 
  } = useQuery({
    queryKey: ["/api/admin/credentials"],
    queryFn: async () => {
      // This is a placeholder - in a real app, there would be an admin endpoint to get all credentials
      // For now, we'll simulate by fetching from a few providers
      const providers = (users || []).filter((u: any) => u.role === "provider").slice(0, 5);
      
      let credentials: any[] = [];
      for (const provider of providers) {
        try {
          const res = await fetch(`/api/providers/${provider.id}/credentials`);
          if (res.ok) {
            const data = await res.json();
            credentials = [...credentials, ...data];
          }
        } catch (error) {
          console.error("Error fetching credentials:", error);
        }
      }
      
      return credentials;
    },
    enabled: !!user && user.role === "admin",
  });
  
  // Update credential verification status
  const updateCredentialMutation = useMutation({
    mutationFn: async ({ id, isVerified }: { id: number, isVerified: boolean }) => {
      const res = await apiRequest(
        "PATCH", 
        `/api/credentials/${id}`, 
        { isVerified }
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/credentials"] });
      setIsCredentialDialogOpen(false);
      toast({
        title: "Credential updated",
        description: "The credential verification status has been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Count metrics
  const userCounts = {
    total: users.length,
    customers: users.filter((u: any) => u.role === "customer").length,
    providers: users.filter((u: any) => u.role === "provider").length,
    admins: users.filter((u: any) => u.role === "admin").length,
  };
  
  const bookingCounts = {
    total: bookings.length,
    requested: bookings.filter((b: any) => b.status === "requested").length,
    active: bookings.filter((b: any) => ["accepted", "completed"].includes(b.status)).length,
    completed: bookings.filter((b: any) => b.status === "approved").length,
  };
  
  const credentialCounts = {
    total: allCredentials.length,
    pending: allCredentials.filter((c: any) => !c.isVerified).length,
    verified: allCredentials.filter((c: any) => c.isVerified).length,
  };
  
  const handleVerifyCredential = (credential: any, isVerified: boolean) => {
    updateCredentialMutation.mutate({ id: credential.id, isVerified });
  };
  
  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto py-16 px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => location.replace("/")}>Back to Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (isLoadingUsers || isLoadingBookings || isLoadingCredentials) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-neutral-500">Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{userCounts.total}</div>
            <div className="flex mt-2 justify-between text-sm text-neutral-500">
              <div><span className="font-medium text-neutral-700">{userCounts.customers}</span> Customers</div>
              <div><span className="font-medium text-neutral-700">{userCounts.providers}</span> Providers</div>
              <div><span className="font-medium text-neutral-700">{userCounts.admins}</span> Admins</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-neutral-500">Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{bookingCounts.total}</div>
            <div className="flex mt-2 justify-between text-sm text-neutral-500">
              <div><span className="font-medium text-neutral-700">{bookingCounts.requested}</span> Requested</div>
              <div><span className="font-medium text-neutral-700">{bookingCounts.active}</span> Active</div>
              <div><span className="font-medium text-neutral-700">{bookingCounts.completed}</span> Completed</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-neutral-500">Credentials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{credentialCounts.total}</div>
            <div className="flex mt-2 justify-between text-sm text-neutral-500">
              <div><span className="font-medium text-neutral-700">{credentialCounts.pending}</span> Pending</div>
              <div><span className="font-medium text-neutral-700">{credentialCounts.verified}</span> Verified</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main content tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="credentials" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Credentials
          </TabsTrigger>
        </TabsList>
        
        {/* Users tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage user accounts and roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            user.role === "admin" 
                              ? "bg-purple-100 text-purple-800 border-purple-200" 
                              : user.role === "provider"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-green-100 text-green-800 border-green-200"
                          }>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.city || "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" disabled>
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Bookings tab */}
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>View and manage service bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking: any) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.id}</TableCell>
                        <TableCell>{booking.service?.name || "N/A"}</TableCell>
                        <TableCell>{booking.customer?.name || "N/A"}</TableCell>
                        <TableCell>{booking.provider?.name || "N/A"}</TableCell>
                        <TableCell>
                          {booking.scheduledDate ? format(new Date(booking.scheduledDate), "MMM d, yyyy") : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            booking.status === "approved"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : booking.status === "completed" || booking.status === "accepted"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : booking.status === "requested"
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                  : "bg-red-100 text-red-800 border-red-200"
                          }>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" disabled>
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Credentials tab */}
        <TabsContent value="credentials">
          <Card>
            <CardHeader>
              <CardTitle>Provider Credentials</CardTitle>
              <CardDescription>Review and verify provider credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Provider ID</TableHead>
                      <TableHead>Document</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allCredentials.map((credential: any) => (
                      <TableRow key={credential.id}>
                        <TableCell className="font-medium">{credential.id}</TableCell>
                        <TableCell>{credential.providerId}</TableCell>
                        <TableCell>{credential.documentName}</TableCell>
                        <TableCell>
                          {credential.submittedAt ? format(new Date(credential.submittedAt), "MMM d, yyyy") : "N/A"}
                        </TableCell>
                        <TableCell>
                          {credential.isVerified ? (
                            <div className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                              <span>Verified</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <AlertCircle className="h-4 w-4 text-yellow-500 mr-1" />
                              <span>Pending</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCredential(credential);
                              setIsCredentialDialogOpen(true);
                            }}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Credential review dialog */}
      {selectedCredential && (
        <Dialog open={isCredentialDialogOpen} onOpenChange={setIsCredentialDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Credential</DialogTitle>
              <DialogDescription>
                Verify or reject this provider credential
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-neutral-500">Credential Details</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Provider ID:</span>
                      <span className="font-medium">{selectedCredential.providerId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Document Name:</span>
                      <span className="font-medium">{selectedCredential.documentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Submitted:</span>
                      <span className="font-medium">
                        {format(new Date(selectedCredential.submittedAt), "PPP")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Status:</span>
                      <span className={`font-medium ${
                        selectedCredential.isVerified ? "text-green-600" : "text-yellow-600"
                      }`}>
                        {selectedCredential.isVerified ? "Verified" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-neutral-500">Document URL</h3>
                  <a 
                    href={selectedCredential.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block text-primary-600 hover:underline"
                  >
                    {selectedCredential.documentUrl}
                  </a>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              {selectedCredential.isVerified ? (
                <Button
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => handleVerifyCredential(selectedCredential, false)}
                  disabled={updateCredentialMutation.isPending}
                >
                  {updateCredentialMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Revoke Verification
                    </>
                  )}
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => setIsCredentialDialogOpen(false)}
                  >
                    Dismiss
                  </Button>
                  <Button
                    onClick={() => handleVerifyCredential(selectedCredential, true)}
                    disabled={updateCredentialMutation.isPending}
                  >
                    {updateCredentialMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verify Credential
                      </>
                    )}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
