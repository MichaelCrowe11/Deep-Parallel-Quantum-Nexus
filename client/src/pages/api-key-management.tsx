import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Check, Copy, Key, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ApiProvider {
  id: number;
  name: string;
  displayName: string;
  description: string | null;
  website: string | null;
  documentationUrl: string | null;
  logoUrl: string | null;
  isActive: boolean;
  capabilities: string[];
}

interface ApiKey {
  id: number;
  providerId: number;
  providerName: string;
  providerDisplayName: string;
  name: string;
  createdAt: string;
  lastUsed: string | null;
  isActive: boolean;
  expiresAt: string | null;
  testStatus: string | null;
  keyPreview: string;
}

interface ProviderStatus {
  id: number;
  name: string;
  displayName: string;
  description: string | null;
  logoUrl: string | null;
  capabilities: string[];
  keyStatus: {
    hasKey: boolean;
    isValid: boolean;
    lastTested: string | null;
    message?: string;
  };
}

// Form schema for adding a new API key
const apiKeyFormSchema = z.object({
  providerId: z.string().min(1, "Provider is required"),
  name: z.string().min(3, "Name must be at least 3 characters"),
  key: z.string().min(8, "API key must be at least 8 characters"),
});

type ApiKeyFormValues = z.infer<typeof apiKeyFormSchema>;

export default function ApiKeyManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddKeyDialogOpen, setIsAddKeyDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ApiProvider | null>(null);

  // Form for adding a new API key
  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeyFormSchema),
    defaultValues: {
      providerId: "",
      name: "",
      key: "",
    },
  });

  // Query providers
  const {
    data: providers = [],
    isLoading: isLoadingProviders,
    error: providersError,
  } = useQuery({
    queryKey: ["/api/providers"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/providers");
      return response.json();
    },
  });

  // Query user's API keys
  const {
    data: apiKeys = [],
    isLoading: isLoadingKeys,
    error: keysError,
  } = useQuery({
    queryKey: ["/api/keys"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/keys");
      return response.json();
    },
  });

  // Query provider status
  const {
    data: providerStatus = [],
    isLoading: isLoadingStatus,
    error: statusError,
  } = useQuery({
    queryKey: ["/api/provider-status"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/provider-status");
      return response.json();
    },
  });

  // Add API key mutation
  const addApiKeyMutation = useMutation({
    mutationFn: async (data: ApiKeyFormValues) => {
      const response = await apiRequest("POST", "/api/keys", {
        providerId: parseInt(data.providerId),
        name: data.name,
        key: data.key,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/provider-status"] });
      toast({
        title: "API Key Added",
        description: "Your API key has been successfully added and tested.",
      });
      setIsAddKeyDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to add API key",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Delete API key mutation
  const deleteApiKeyMutation = useMutation({
    mutationFn: async (keyId: number) => {
      const response = await apiRequest("DELETE", `/api/keys/${keyId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/provider-status"] });
      toast({
        title: "API Key Deleted",
        description: "Your API key has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete API key",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Test API key mutation
  const testApiKeyMutation = useMutation({
    mutationFn: async (keyId: number) => {
      const response = await apiRequest("POST", `/api/keys/${keyId}/test`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/provider-status"] });
      toast({
        title: data.success ? "API Key is Valid" : "API Key Test Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to test API key",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Update selected provider when providers are loaded
  useEffect(() => {
    if (providers.length > 0 && form.getValues("providerId") === "") {
      setSelectedProvider(providers[0]);
      form.setValue("providerId", String(providers[0].id));
    }
  }, [providers, form]);

  // Handle form submission for adding a new API key
  function onSubmit(data: ApiKeyFormValues) {
    addApiKeyMutation.mutate(data);
  }

  // Handle provider change in the form
  function handleProviderChange(providerId: string) {
    const provider = providers.find((p) => p.id === parseInt(providerId));
    setSelectedProvider(provider || null);
  }

  // Get status badge for API key
  function getStatusBadge(status: string | null) {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    
    switch (status) {
      case "valid":
        return <Badge className="bg-green-500">Valid</Badge>;
      case "invalid":
        return <Badge variant="destructive">Invalid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  // Format date string
  function formatDate(dateString: string | null) {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  }

  if (isLoadingProviders || isLoadingKeys || isLoadingStatus) {
    return (
      <div className="container py-6">
        <Card>
          <CardHeader>
            <CardTitle>API Key Management</CardTitle>
            <CardDescription>Loading API key information...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (providersError || keysError || statusError) {
    return (
      <div className="container py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load API key information. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Key Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your API keys for different AI service providers
          </p>
        </div>
        <Dialog open={isAddKeyDialogOpen} onOpenChange={setIsAddKeyDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New API Key</DialogTitle>
              <DialogDescription>
                Enter your API key details for the selected service provider.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="providerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Provider</FormLabel>
                      <Select
                        defaultValue={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleProviderChange(value);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {providers.map((provider) => (
                            <SelectItem
                              key={provider.id}
                              value={provider.id.toString()}
                            >
                              {provider.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {selectedProvider?.description || "Select a provider to see details"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Production Key, Test Key"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A descriptive name to help you identify this API key
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your API key"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your API key will be encrypted and stored securely
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddKeyDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={addApiKeyMutation.isPending}
                  >
                    {addApiKeyMutation.isPending ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Key className="mr-2 h-4 w-4" />
                        Add API Key
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="status">
        <TabsList>
          <TabsTrigger value="status">Provider Status</TabsTrigger>
          <TabsTrigger value="keys">Your API Keys</TabsTrigger>
        </TabsList>
        <TabsContent value="status" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Provider Status</CardTitle>
              <CardDescription>
                Overview of available AI service providers and your API key status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {providerStatus.map((provider) => (
                    <Card key={provider.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {provider.displayName}
                          </CardTitle>
                          {provider.keyStatus.hasKey ? (
                            provider.keyStatus.isValid ? (
                              <Badge className="bg-green-500">
                                <Check className="mr-1 h-3 w-3" />
                                Valid
                              </Badge>
                            ) : (
                              <Badge variant="destructive">Invalid</Badge>
                            )
                          ) : (
                            <Badge variant="outline">Not Configured</Badge>
                          )}
                        </div>
                        <CardDescription className="line-clamp-2">
                          {provider.description || `${provider.displayName} API service`}
                        </CardDescription>
                      </CardHeader>
                      <Separator />
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Capabilities: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {provider.capabilities?.map((cap) => (
                                <Badge
                                  key={cap}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {cap}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          {provider.keyStatus.hasKey && (
                            <div className="text-sm">
                              <span className="font-medium">Last Tested: </span>
                              <span className="text-muted-foreground">
                                {formatDate(provider.keyStatus.lastTested)}
                              </span>
                            </div>
                          )}
                          {provider.keyStatus.message && (
                            <div className="text-sm">
                              <span className="font-medium">Status: </span>
                              <span className="text-muted-foreground">
                                {provider.keyStatus.message}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="mt-4">
                          {provider.keyStatus.hasKey ? (
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const key = apiKeys.find(
                                    (k) => k.providerId === provider.id
                                  );
                                  if (key) {
                                    testApiKeyMutation.mutate(key.id);
                                  }
                                }}
                                disabled={testApiKeyMutation.isPending}
                              >
                                {testApiKeyMutation.isPending ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <RefreshCw className="mr-1 h-3 w-3" />
                                    Test Key
                                  </>
                                )}
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="mr-1 h-3 w-3" />
                                    Remove
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Confirm Deletion</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to delete your {provider.displayName} API key?
                                      This action cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        const dialogElement = document.querySelector('[role="dialog"]');
                                        if (dialogElement) {
                                          (dialogElement as HTMLElement).setAttribute('data-state', 'closed');
                                        }
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => {
                                        const key = apiKeys.find(
                                          (k) => k.providerId === provider.id
                                        );
                                        if (key) {
                                          deleteApiKeyMutation.mutate(key.id);
                                        }
                                        const dialogElement = document.querySelector('[role="dialog"]');
                                        if (dialogElement) {
                                          (dialogElement as HTMLElement).setAttribute('data-state', 'closed');
                                        }
                                      }}
                                      disabled={deleteApiKeyMutation.isPending}
                                    >
                                      {deleteApiKeyMutation.isPending ? (
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                      ) : (
                                        "Delete"
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          ) : (
                            <Button
                              onClick={() => {
                                setSelectedProvider(
                                  providers.find((p) => p.id === provider.id) || null
                                );
                                form.setValue("providerId", String(provider.id));
                                setIsAddKeyDialogOpen(true);
                              }}
                            >
                              <Plus className="mr-1 h-3 w-3" />
                              Add Key
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="keys" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your API Keys</CardTitle>
              <CardDescription>
                Manage all your API keys for different service providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {apiKeys.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Key className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No API Keys Found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You haven't added any API keys yet. Add your first key to get started.
                  </p>
                  <Button
                    onClick={() => setIsAddKeyDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First API Key
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Key Preview</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell>
                          <div className="font-medium">{key.providerDisplayName}</div>
                          <div className="text-xs text-muted-foreground">{key.providerName}</div>
                        </TableCell>
                        <TableCell>{key.name}</TableCell>
                        <TableCell>
                          <code className="bg-muted px-1 py-0.5 rounded text-sm">
                            {key.keyPreview}
                          </code>
                        </TableCell>
                        <TableCell>{getStatusBadge(key.testStatus)}</TableCell>
                        <TableCell>{formatDate(key.lastUsed)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => testApiKeyMutation.mutate(key.id)}
                                    disabled={testApiKeyMutation.isPending}
                                  >
                                    {testApiKeyMutation.isPending ? (
                                      <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <RefreshCw className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Test key</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => {
                                      if (confirm("Are you sure you want to delete this API key?")) {
                                        deleteApiKeyMutation.mutate(key.id);
                                      }
                                    }}
                                    disabled={deleteApiKeyMutation.isPending}
                                  >
                                    {deleteApiKeyMutation.isPending ? (
                                      <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete key</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}