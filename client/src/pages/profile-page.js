import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  User, Mail, Phone, MapPin, FileText, Edit,
  Briefcase, DollarSign, Image, Shield, Save, 
  Award, Upload, AlertCircle, Check
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [editingProvider, setEditingProvider] = useState(false);
  const [addingCredential, setAddingCredential] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    bio: "",
    profileImage: "",
  });
  
  // Provider profile form state
  const [providerForm, setProviderForm] = useState({
    hourlyRate: "",
    category: "",
    city: "",
    bio: "",
    yearsOfExperience: "",
    workImages: []
  });
  
  // Credential form state
  const [credentialForm, setCredentialForm] = useState({
    type: "license",
    number: "",
    description: "",
    issuedBy: "",
    expiresAt: ""
  });
  
  // Fetch user provider profile
  const { data: providerProfile, isLoading: providerLoading } = useQuery({
    queryKey: ["/api/providers/user", user?.id],
    enabled: !!user?.id && user?.role === "provider",
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch provider credentials
  const { 
    data: credentials, 
    isLoading: credentialsLoading,
    refetch: refetchCredentials
  } = useQuery({
    queryKey: ["/api/credentials", providerProfile?.id],
    enabled: !!providerProfile?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Set form values when user data is available
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        city: user.city || "",
        bio: user.bio || "",
        profileImage: user.profileImage || "",
      });
    }
  }, [user]);
  
  // Set provider form values when provider profile is available
  useEffect(() => {
    if (providerProfile) {
      setProviderForm({
        hourlyRate: providerProfile.hourlyRate || "",
        category: providerProfile.category || "",
        city: providerProfile.city || "",
        bio: providerProfile.bio || "",
        yearsOfExperience: providerProfile.yearsOfExperience || "",
        workImages: providerProfile.workImages || []
      });
    }
  }, [providerProfile]);
  
  // Update user profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData) => {
      const res = await apiRequest("PATCH", `/api/users/${user.id}`, profileData);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], data);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
        variant: "default",
      });
      setEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update or create provider profile mutation
  const updateProviderProfileMutation = useMutation({
    mutationFn: async (providerData) => {
      if (providerProfile?.id) {
        // Update existing profile
        const res = await apiRequest("PATCH", `/api/providers/${providerProfile.id}`, providerData);
        return await res.json();
      } else {
        // Create new profile
        const res = await apiRequest("POST", "/api/providers", {
          ...providerData,
          userId: user.id
        });
        return await res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["/api/providers/user", user?.id]);
      toast({
        title: "Provider Profile Updated",
        description: "Your provider information has been updated successfully.",
        variant: "default",
      });
      setEditingProvider(false);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Create credential mutation
  const createCredentialMutation = useMutation({
    mutationFn: async (credentialData) => {
      const res = await apiRequest("POST", "/api/credentials", {
        ...credentialData,
        providerId: providerProfile.id
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["/api/credentials", providerProfile?.id]);
      toast({
        title: "Credential Added",
        description: "Your credential has been submitted for verification.",
        variant: "default",
      });
      setAddingCredential(false);
      setCredentialForm({
        type: "license",
        number: "",
        description: "",
        issuedBy: "",
        expiresAt: ""
      });
      refetchCredentials();
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle profile form submission
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };
  
  // Handle provider profile form submission
  const handleProviderFormSubmit = (e) => {
    e.preventDefault();
    updateProviderProfileMutation.mutate(providerForm);
  };
  
  // Handle credential form submission
  const handleCredentialSubmit = (e) => {
    e.preventDefault();
    createCredentialMutation.mutate(credentialForm);
  };
  
  // Update profile form field
  const updateProfileField = (field, value) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
  };
  
  // Update provider form field
  const updateProviderField = (field, value) => {
    setProviderForm(prev => ({ ...prev, [field]: value }));
  };
  
  // Update credential form field
  const updateCredentialField = (field, value) => {
    setCredentialForm(prev => ({ ...prev, [field]: value }));
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };
  
  // Show not authenticated message if user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your profile.</p>
          <Button href="/auth">Sign In</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile - Left Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setEditing(!editing)}
                  className="flex items-center"
                >
                  {editing ? (
                    <>Cancel</>
                  ) : (
                    <>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </>
                  )}
                </Button>
              </div>
              
              <div className="p-6">
                {editing ? (
                  <form onSubmit={handleProfileSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                          value={profileForm.firstName}
                          onChange={(e) => updateProfileField("firstName", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                          value={profileForm.lastName}
                          onChange={(e) => updateProfileField("lastName", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                          value={profileForm.email}
                          onChange={(e) => updateProfileField("email", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                          value={profileForm.phone}
                          onChange={(e) => updateProfileField("phone", e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                        value={profileForm.city}
                        onChange={(e) => updateProfileField("city", e.target.value)}
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                      <textarea
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                        rows="4"
                        value={profileForm.bio}
                        onChange={(e) => updateProfileField("bio", e.target.value)}
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                        placeholder="https://example.com/your-image.jpg"
                        value={profileForm.profileImage}
                        onChange={(e) => updateProfileField("profileImage", e.target.value)}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        className="flex items-center"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </span>
                        ) : (
                          <>
                            <Save className="mr-2 h-5 w-5" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center">
                      <div className="h-20 w-20 bg-gray-200 rounded-full overflow-hidden mr-6">
                        {profileForm.profileImage ? (
                          <img 
                            src={profileForm.profileImage} 
                            alt={`${profileForm.firstName} ${profileForm.lastName}`}
                            className="h-full w-full object-cover" 
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-bold text-2xl uppercase">
                            {profileForm.firstName?.charAt(0) || ''}{profileForm.lastName?.charAt(0) || ''}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {profileForm.firstName} {profileForm.lastName}
                        </h3>
                        <p className="text-gray-600">
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start">
                        <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Email</p>
                          <p className="text-gray-600">{profileForm.email || "Not provided"}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Phone</p>
                          <p className="text-gray-600">{profileForm.phone || "Not provided"}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">City</p>
                        <p className="text-gray-600">{profileForm.city || "Not provided"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FileText className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Bio</p>
                        <p className="text-gray-600 whitespace-pre-line">{profileForm.bio || "No bio provided."}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Provider Profile Section - Only for providers */}
            {user.role === "provider" && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden mt-8">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Provider Information</h2>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setEditingProvider(!editingProvider)}
                    className="flex items-center"
                  >
                    {editingProvider ? (
                      <>Cancel</>
                    ) : (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        {providerProfile ? "Edit" : "Create"}
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="p-6">
                  {editingProvider ? (
                    <form onSubmit={handleProviderFormSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                            value={providerForm.hourlyRate}
                            onChange={(e) => updateProviderField("hourlyRate", e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                          <select
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                            value={providerForm.category}
                            onChange={(e) => updateProviderField("category", e.target.value)}
                            required
                          >
                            <option value="">Select a category</option>
                            <option value="plumbing">Plumbing</option>
                            <option value="electrical">Electrical</option>
                            <option value="landscaping">Landscaping</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                            value={providerForm.city}
                            onChange={(e) => updateProviderField("city", e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                          <input
                            type="number"
                            min="0"
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                            value={providerForm.yearsOfExperience}
                            onChange={(e) => updateProviderField("yearsOfExperience", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Professional Bio</label>
                        <textarea
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                          rows="4"
                          value={providerForm.bio}
                          onChange={(e) => updateProviderField("bio", e.target.value)}
                          required
                          placeholder="Describe your professional experience, skills, and the services you offer..."
                        />
                      </div>
                      
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Work Sample Images (URLs)</label>
                        <div className="space-y-2">
                          {providerForm.workImages.map((image, index) => (
                            <div key={index} className="flex items-center">
                              <input
                                type="text"
                                className="flex-grow border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                                value={image}
                                onChange={(e) => {
                                  const newImages = [...providerForm.workImages];
                                  newImages[index] = e.target.value;
                                  updateProviderField("workImages", newImages);
                                }}
                                placeholder="https://example.com/your-work-image.jpg"
                              />
                              <button
                                type="button"
                                className="ml-2 text-red-500 hover:text-red-700"
                                onClick={() => {
                                  const newImages = [...providerForm.workImages];
                                  newImages.splice(index, 1);
                                  updateProviderField("workImages", newImages);
                                }}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-medium"
                            onClick={() => updateProviderField("workImages", [...providerForm.workImages, ""])}
                          >
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            Add Image URL
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          className="flex items-center"
                          disabled={updateProviderProfileMutation.isPending}
                        >
                          {updateProviderProfileMutation.isPending ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving...
                            </span>
                          ) : (
                            <>
                              <Save className="mr-2 h-5 w-5" />
                              Save Provider Info
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  ) : providerProfile ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start">
                          <Briefcase className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Category</p>
                            <p className="text-gray-600 capitalize">{providerProfile.category || "Not specified"}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <DollarSign className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Hourly Rate</p>
                            <p className="text-gray-600">${providerProfile.hourlyRate || "0"}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Service Area</p>
                            <p className="text-gray-600">{providerProfile.city || "Not specified"}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Years of Experience</p>
                            <p className="text-gray-600">{providerProfile.yearsOfExperience || "0"} years</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <FileText className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Professional Bio</p>
                          <p className="text-gray-600 whitespace-pre-line">{providerProfile.bio || "No professional bio provided."}</p>
                        </div>
                      </div>
                      
                      {providerProfile.workImages && providerProfile.workImages.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-3">Work Samples</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {providerProfile.workImages.map((image, index) => (
                              <div key={index} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                                <img 
                                  src={image} 
                                  alt={`Work sample ${index + 1}`} 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center text-gray-600">
                        <Shield className="h-5 w-5 mr-2" />
                        <span>
                          Verification Status: 
                          <span className={providerProfile.isVerified ? "text-green-600 ml-1" : "text-yellow-600 ml-1"}>
                            {providerProfile.isVerified ? "Verified" : "Pending Verification"}
                          </span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Briefcase className="h-14 w-14 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Provider Profile Yet</h3>
                      <p className="text-gray-600 mb-6">
                        Create your provider profile to start offering services on the platform.
                      </p>
                      <Button onClick={() => setEditingProvider(true)}>
                        Create Provider Profile
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar - Right Column */}
          <div>
            {/* Account Information */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Account Information</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Username</span>
                    <span className="font-medium text-gray-900">{user.username}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Type</span>
                    <span className="font-medium text-gray-900 capitalize">{user.role}</span>
                  </div>
                  
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <Button 
                      variant="outline" 
                      className="w-full justify-center text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
                    >
                      Change Password
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Credentials Section - Only for providers */}
            {user.role === "provider" && providerProfile && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Credentials</h2>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setAddingCredential(!addingCredential)}
                    className="flex items-center"
                  >
                    {addingCredential ? (
                      <>Cancel</>
                    ) : (
                      <>
                        <Award className="mr-2 h-4 w-4" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="p-6">
                  {addingCredential ? (
                    <form onSubmit={handleCredentialSubmit}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Credential Type</label>
                          <select
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                            value={credentialForm.type}
                            onChange={(e) => updateCredentialField("type", e.target.value)}
                            required
                          >
                            <option value="license">License</option>
                            <option value="certification">Certification</option>
                            <option value="insurance">Insurance</option>
                            <option value="background_check">Background Check</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Number/ID</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                            value={credentialForm.number}
                            onChange={(e) => updateCredentialField("number", e.target.value)}
                            required
                            placeholder="License or certificate number"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                            value={credentialForm.description}
                            onChange={(e) => updateCredentialField("description", e.target.value)}
                            required
                            placeholder="e.g. Master Plumber License"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Authority</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                            value={credentialForm.issuedBy}
                            onChange={(e) => updateCredentialField("issuedBy", e.target.value)}
                            required
                            placeholder="e.g. State Board"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                          <input
                            type="date"
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                            value={credentialForm.expiresAt}
                            onChange={(e) => updateCredentialField("expiresAt", e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <Button 
                          type="submit" 
                          className="w-full justify-center"
                          disabled={createCredentialMutation.isPending}
                        >
                          {createCredentialMutation.isPending ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Submitting...
                            </span>
                          ) : (
                            <>
                              <Upload className="mr-2 h-5 w-5" />
                              Submit for Verification
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  ) : credentialsLoading ? (
                    <div className="animate-pulse space-y-4">
                      {[1, 2].map(i => (
                        <div key={i} className="border-b border-gray-200 pb-4 last:border-0">
                          <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : credentials && credentials.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {credentials.map(credential => (
                        <div key={credential.id} className="py-4 first:pt-0 last:pb-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900 capitalize">
                              {credential.type.replace('_', ' ')}
                            </h3>
                            
                            {credential.isVerified ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Check className="mr-1 h-3 w-3" />
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <AlertCircle className="mr-1 h-3 w-3" />
                                Pending
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-700 mt-1">{credential.description}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {credential.number} • Issued by {credential.issuedBy}
                          </p>
                          
                          {credential.expiresAt && (
                            <p className="text-sm text-gray-500 mt-1">
                              Expires: {formatDate(credential.expiresAt)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Award className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600 mb-4">No credentials added yet.</p>
                      <p className="text-sm text-gray-500">
                        Add your professional credentials to increase trust and get verified status.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}