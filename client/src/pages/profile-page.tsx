import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, User, Settings, BookOpen, Drill, FileCheck } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Profile update schema
const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  city: z.string().min(1, "City is required"),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Provider profile schema
const providerProfileSchema = z.object({
  hourlyRate: z.coerce.number().min(1, "Hourly rate is required"),
  category: z.enum(["plumbing", "electrical", "landscaping"], {
    errorMap: () => ({ message: "Please select a service category" }),
  }),
  yearsOfExperience: z.coerce.number().min(0, "Years of experience must be a positive number"),
  workImages: z.array(z.string()).optional(),
});

type ProviderFormValues = z.infer<typeof providerProfileSchema>;

// Credential schema
const credentialSchema = z.object({
  documentName: z.string().min(1, "Document name is required"),
  documentUrl: z.string().url("Please enter a valid URL"),
});

type CredentialFormValues = z.infer<typeof credentialSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  // Fetch provider profile if user is a provider
  const {
    data: providerProfile,
    isLoading: isLoadingProfile,
  } = useQuery({
    queryKey: ["/api/providers", user?.id],
    queryFn: async () => {
      if (user?.role !== "provider") return null;
      try {
        const res = await fetch(`/api/providers/${user.id}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.providerProfile;
      } catch (error) {
        return null;
      }
    },
    enabled: !!user && user.role === "provider",
  });

  // Fetch credentials if user is a provider
  const {
    data: credentials,
    isLoading: isLoadingCredentials,
  } = useQuery({
    queryKey: ["/api/providers", user?.id, "credentials"],
    queryFn: async () => {
      if (user?.role !== "provider" || !providerProfile) return [];
      const res = await fetch(`/api/providers/${user.id}/credentials`);
      if (!res.ok) return [];
      return await res.json();
    },
    enabled: !!user && !!providerProfile && user.role === "provider",
  });

  // Profile form setup
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      city: user?.city || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
    },
  });

  // Provider profile form setup
  const providerForm = useForm<ProviderFormValues>({
    resolver: zodResolver(providerProfileSchema),
    defaultValues: {
      hourlyRate: providerProfile?.hourlyRate || 0,
      category: providerProfile?.category || "plumbing",
      yearsOfExperience: providerProfile?.yearsOfExperience || 0,
      workImages: providerProfile?.workImages || [],
    },
  });

  // Credential form setup
  const credentialForm = useForm<CredentialFormValues>({
    resolver: zodResolver(credentialSchema),
    defaultValues: {
      documentName: "",
      documentUrl: "",
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PATCH", `/api/users/${user?.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
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

  // Create provider profile mutation
  const createProviderProfileMutation = useMutation({
    mutationFn: async (data: ProviderFormValues) => {
      const payload = {
        ...data,
        userId: user?.id,
      };
      const res = await apiRequest("POST", "/api/providers/profile", payload);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers", user?.id] });
      toast({
        title: "Provider profile created",
        description: "Your provider profile has been created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update provider profile mutation
  const updateProviderProfileMutation = useMutation({
    mutationFn: async (data: ProviderFormValues) => {
      const res = await apiRequest(
        "PATCH",
        `/api/providers/profile/${providerProfile?.id}`,
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers", user?.id] });
      toast({
        title: "Provider profile updated",
        description: "Your provider profile has been updated successfully",
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

  // Create credential mutation
  const createCredentialMutation = useMutation({
    mutationFn: async (data: CredentialFormValues) => {
      const payload = {
        ...data,
        providerId: providerProfile?.id,
      };
      const res = await apiRequest("POST", "/api/credentials", payload);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/providers", user?.id, "credentials"],
      });
      credentialForm.reset({
        documentName: "",
        documentUrl: "",
      });
      toast({
        title: "Credential submitted",
        description: "Your credential has been submitted for verification",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handlers
  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  const onProviderProfileSubmit = (data: ProviderFormValues) => {
    if (providerProfile) {
      updateProviderProfileMutation.mutate(data);
    } else {
      createProviderProfileMutation.mutate(data);
    }
  };

  const onCredentialSubmit = (data: CredentialFormValues) => {
    createCredentialMutation.mutate(data);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center space-y-3">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.profileImage} />
                  <AvatarFallback className="bg-primary-100 text-primary-800 text-xl">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <p className="text-sm text-neutral-500 capitalize">{user.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col space-y-1">
            <Button
              variant={activeTab === "profile" ? "default" : "ghost"}
              className="justify-start"
              onClick={() => setActiveTab("profile")}
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
            {user.role === "provider" && (
              <>
                <Button
                  variant={activeTab === "provider" ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => setActiveTab("provider")}
                >
                  <Drill className="mr-2 h-4 w-4" />
                  Provider Profile
                </Button>
                <Button
                  variant={activeTab === "credentials" ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => setActiveTab("credentials")}
                >
                  <FileCheck className="mr-2 h-4 w-4" />
                  Credentials
                </Button>
              </>
            )}
            {/* These would be implemented in a complete app */}
            <Button variant="ghost" className="justify-start" disabled>
              <BookOpen className="mr-2 h-4 w-4" />
              Bookings
            </Button>
            <Button variant="ghost" className="justify-start" disabled>
              <Settings className="mr-2 h-4 w-4" />
              Account Settings
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div>
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form
                    onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (optional)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio (optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us a bit about yourself"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {activeTab === "provider" && (
            <Card>
              <CardHeader>
                <CardTitle>Provider Information</CardTitle>
                <CardDescription>
                  {providerProfile
                    ? "Update your service provider details"
                    : "Create your service provider profile"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProfile ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                  </div>
                ) : (
                  <Form {...providerForm}>
                    <form
                      onSubmit={providerForm.handleSubmit(onProviderProfileSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={providerForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Category</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your service category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="plumbing">Plumbing</SelectItem>
                                <SelectItem value="electrical">Electrical</SelectItem>
                                <SelectItem value="landscaping">Landscaping</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={providerForm.control}
                        name="hourlyRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hourly Rate ($)</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={providerForm.control}
                        name="yearsOfExperience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Years of Experience</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={
                          createProviderProfileMutation.isPending ||
                          updateProviderProfileMutation.isPending
                        }
                      >
                        {createProviderProfileMutation.isPending ||
                        updateProviderProfileMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : providerProfile ? (
                          "Update Profile"
                        ) : (
                          "Create Profile"
                        )}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "credentials" && (
            <Card>
              <CardHeader>
                <CardTitle>Credentials</CardTitle>
                <CardDescription>
                  Submit your professional credentials for verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingCredentials ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Your Credentials</h3>
                      {credentials && credentials.length > 0 ? (
                        <div className="space-y-4">
                          {credentials.map((cred: any) => (
                            <div
                              key={cred.id}
                              className="flex items-center justify-between border p-4 rounded-md"
                            >
                              <div>
                                <h4 className="font-medium">{cred.documentName}</h4>
                                <p className="text-sm text-neutral-500">
                                  Submitted on{" "}
                                  {new Date(cred.submittedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center">
                                {cred.isVerified ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Verified
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Pending
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-neutral-500">
                          You haven't submitted any credentials yet.
                        </p>
                      )}
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium mb-4">Submit New Credential</h3>
                      <Form {...credentialForm}>
                        <form
                          onSubmit={credentialForm.handleSubmit(onCredentialSubmit)}
                          className="space-y-4"
                        >
                          <FormField
                            control={credentialForm.control}
                            name="documentName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Document Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g. Plumbing License"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={credentialForm.control}
                            name="documentUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Document URL</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="https://example.com/my-credential.pdf"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            disabled={createCredentialMutation.isPending}
                          >
                            {createCredentialMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              "Submit Credential"
                            )}
                          </Button>
                        </form>
                      </Form>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
