import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, UserRound, CalendarRange, CreditCard, 
  Receipt, Edit, Trash, Clock, ShoppingBag, Check, X 
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatCurrency, formatDateTime, formatPhoneNumber } from "@/utils/formatters";
import { calculateTierFromSpend, calculateSpendToNextTier, TIER_THRESHOLDS } from "@/utils/tierCalculator";
import { supabase } from "@/integrations/supabase/client";
import type { Customer, Transaction } from "@/types/index";
import StatCard from "@/components/StatCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

const customerFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional().nullable(),
  phone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  tier: z.string().optional().nullable(),
  loyalty_points: z.number().nonnegative().optional().nullable(),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

const ClientProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<string>("30days");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [metrics, setMetrics] = useState({
    avgTransaction: 0,
    numTransactions: 0,
    totalSpent: 0,
    mostPurchased: "None",
    currentTabBalance: 0,
    spendToNextTier: 0
  });

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      notes: "",
      tier: "Bronze",
      loyalty_points: 0,
    },
  });

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        setCustomer(data);
        
        form.reset({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          notes: data.notes,
          tier: data.tier || "Bronze",
          loyalty_points: data.loyalty_points || 0,
        });
      } catch (error) {
        console.error('Error fetching customer:', error);
      }
    };

    const fetchTransactions = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('customer_id', id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setTransactions(data || []);
        
        if (data && data.length > 0) {
          const totalSpent = data.reduce((sum, tx) => sum + (tx.total || 0), 0);
          const avgTransaction = totalSpent / data.length;
          const openTabs = data.filter(tx => tx.status === 'open');
          const tabBalance = openTabs.reduce((sum, tx) => sum + (tx.total || 0), 0);
          const spendToNextTier = calculateSpendToNextTier(totalSpent);
          
          setMetrics({
            avgTransaction,
            numTransactions: data.length,
            totalSpent,
            mostPurchased: "Coffee",
            currentTabBalance: tabBalance,
            spendToNextTier
          });
          
          const updateCustomerTier = async (totalSpent: number) => {
            if (!customer || !id) return;
            
            const calculatedTier = calculateTierFromSpend(totalSpent);
            
            const tierRanking = { "Bronze": 1, "Silver": 2, "Gold": 3 };
            const currentTierRank = tierRanking[customer.tier as keyof typeof tierRanking] || 1;
            const calculatedTierRank = tierRanking[calculatedTier as keyof typeof tierRanking];
            
            if (calculatedTierRank > currentTierRank) {
              try {
                const { error } = await supabase
                  .from('customers')
                  .update({
                    tier: calculatedTier,
                    total_spend: totalSpent,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', id);
                
                if (error) throw error;
                
                setCustomer(prev => {
                  if (!prev) return null;
                  return { ...prev, tier: calculatedTier, total_spend: totalSpent };
                });
                
                toast.success(`Customer tier upgraded to ${calculatedTier}!`);
              } catch (error) {
                console.error('Error updating customer tier:', error);
              }
            }
          };
          
          updateCustomerTier(totalSpent);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
    fetchTransactions();
  }, [id, form]);

  const handleGoBack = () => {
    navigate('/clients');
  };

  const handleEditCustomer = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (customer) {
      form.reset({
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email,
        phone: customer.phone,
        notes: customer.notes,
        tier: customer.tier || "Bronze",
        loyalty_points: customer.loyalty_points || 0,
      });
    }
    setIsEditing(false);
  };

  const onSubmit = async (values: CustomerFormValues) => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      const totalSpend = customer?.total_spend || 0;
      
      const calculatedTier = calculateTierFromSpend(totalSpend);
      
      const tierRanking = { "Bronze": 1, "Silver": 2, "Gold": 3 };
      const formTierRank = tierRanking[values.tier as keyof typeof tierRanking] || 1;
      const calculatedTierRank = tierRanking[calculatedTier as keyof typeof tierRanking];
      const finalTier = formTierRank >= calculatedTierRank ? values.tier : calculatedTier;
      
      const { error } = await supabase
        .from('customers')
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone: values.phone,
          notes: values.notes,
          tier: finalTier,
          loyalty_points: values.loyalty_points,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setCustomer(prev => {
        if (!prev) return null;
        return { 
          ...prev, 
          ...values, 
          tier: finalTier,
          updated_at: new Date().toISOString() 
        };
      });
      
      setIsEditing(false);
      toast.success("Client updated successfully");
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error("Failed to update client");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="animate-pulse">Loading client profile...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto p-4">
        <Alert>
          <AlertDescription>Client not found. The client may have been deleted or the URL is incorrect.</AlertDescription>
        </Alert>
        <Button 
          className="mt-4 border-theme-accent text-theme-accent hover:bg-theme-accent hover:text-white" 
          variant="outline" 
          onClick={handleGoBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clients
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleGoBack}
            className="border-theme-accent text-theme-accent hover:bg-theme-accent hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {isEditing ? (
            <div className="flex gap-2 items-center">
              <h1 className="text-3xl font-bold">Edit Client</h1>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold">
                {customer.first_name} {customer.last_name}
              </h1>
              {customer.tier && (
                <Badge variant={customer.tier === 'Gold' ? 'default' : customer.tier === 'Silver' ? 'outline' : 'secondary'}>
                  {customer.tier}
                </Badge>
              )}
            </>
          )}
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleCancelEdit}
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                disabled={isSaving}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button 
                onClick={form.handleSubmit(onSubmit)}
                className="bg-theme-accent hover:bg-theme-accent-hover text-white"
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              onClick={handleEditCustomer}
              className="border-theme-accent text-theme-accent hover:bg-theme-accent hover:text-white"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 space-y-6">
          {isEditing ? (
            <Card className="theme-container-bg border">
              <CardHeader>
                <CardTitle>Edit Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="First name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Email address" 
                              type="email" 
                              {...field} 
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Phone number" 
                              {...field} 
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="tier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Tier</FormLabel>
                          <FormControl>
                            <select 
                              className="w-full p-2 rounded-md border theme-section-bg"
                              {...field}
                              value={field.value || 'Bronze'}
                            >
                              <option value="Bronze">Bronze</option>
                              <option value="Silver">Silver</option>
                              <option value="Gold">Gold</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="loyalty_points"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loyalty Points</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              value={field.value !== null && field.value !== undefined ? field.value : 0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Customer notes" 
                              className="resize-none min-h-[100px]"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="theme-container-bg border">
                <CardHeader>
                  <CardTitle>Client Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center mb-6">
                    {customer.photo_url ? (
                      <img 
                        src={customer.photo_url} 
                        alt={`${customer.first_name} ${customer.last_name}`} 
                        className="rounded-full w-32 h-32 object-cover border-4 border-theme-accent/20" 
                      />
                    ) : (
                      <div className="rounded-full w-32 h-32 bg-theme-accent/10 flex items-center justify-center">
                        <UserRound className="h-16 w-16 text-theme-accent/40" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-6 flex-shrink-0">
                        <UserRound className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">{customer.first_name} {customer.last_name}</div>
                        <div className="text-sm text-muted-foreground">Name</div>
                      </div>
                    </div>
                    
                    {customer.email && (
                      <div className="flex items-start gap-2">
                        <div className="w-6 flex-shrink-0">
                          <svg className="h-5 w-5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="20" height="16" x="2" y="4" rx="2"/>
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">{customer.email}</div>
                          <div className="text-sm text-muted-foreground">Email</div>
                        </div>
                      </div>
                    )}
                    
                    {customer.phone && (
                      <div className="flex items-start gap-2">
                        <div className="w-6 flex-shrink-0">
                          <svg className="h-5 w-5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">{formatPhoneNumber(customer.phone)}</div>
                          <div className="text-sm text-muted-foreground">Phone</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-2">
                      <div className="w-6 flex-shrink-0">
                        <CalendarRange className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {customer.created_at ? format(new Date(customer.created_at), 'MMM d, yyyy') : 'Unknown'}
                        </div>
                        <div className="text-sm text-muted-foreground">Customer since</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="theme-container-bg border">
                <CardHeader>
                  <CardTitle>Loyalty Program</CardTitle>
                  <CardDescription>Points and rewards status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">{customer.loyalty_points || 0}</span>
                    <span className="text-sm text-muted-foreground">Points</span>
                  </div>
                  <div className="h-2.5 bg-secondary/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-theme-accent rounded-full" 
                      style={{ width: `${Math.min(((customer.loyalty_points || 0) / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-muted-foreground text-center">
                    {customer.loyalty_points || 0} / 100 points to next reward
                  </div>
                  
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Spending Tier Progress</span>
                      <Badge variant={customer.tier === 'Gold' ? 'default' : customer.tier === 'Silver' ? 'outline' : 'secondary'}>
                        {customer.tier || 'Bronze'}
                      </Badge>
                    </div>
                    
                    {customer.tier !== 'Gold' && (
                      <>
                        <div className="h-2.5 bg-secondary/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-theme-accent rounded-full" 
                            style={{ 
                              width: customer.tier === 'Silver' 
                                ? `${Math.min(((customer.total_spend || 0) / TIER_THRESHOLDS.GOLD) * 100, 100)}%`
                                : `${Math.min(((customer.total_spend || 0) / TIER_THRESHOLDS.SILVER) * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>
                            {formatCurrency(customer.total_spend || 0)}
                          </span>
                          <span>
                            {customer.tier === 'Silver' 
                              ? formatCurrency(TIER_THRESHOLDS.GOLD)
                              : formatCurrency(TIER_THRESHOLDS.SILVER)
                            }
                          </span>
                        </div>
                        <div className="text-sm text-center mt-2">
                          {metrics.spendToNextTier > 0 
                            ? `${formatCurrency(metrics.spendToNextTier)} more to reach ${customer.tier === 'Silver' ? 'Gold' : 'Silver'}`
                            : customer.tier === 'Gold' 
                              ? 'Highest tier reached!' 
                              : ''
                          }
                        </div>
                      </>
                    )}
                    
                    {customer.tier === 'Gold' && (
                      <div className="text-sm text-center py-2 text-theme-accent">
                        Highest tier reached!
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <span className="text-sm">Current Tier</span>
                  <Badge variant={customer.tier === 'Gold' ? 'default' : customer.tier === 'Silver' ? 'outline' : 'secondary'}>
                    {customer.tier || 'Bronze'}
                  </Badge>
                </CardFooter>
              </Card>

              {customer.notes && (
                <Card className="theme-container-bg border">
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line">{customer.notes}</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        <div className="md:col-span-8 space-y-6">
          <Card className="theme-container-bg border">
            <CardHeader>
              <CardTitle>Client Overview</CardTitle>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`${timeframe === "30days" ? "bg-theme-section-selected" : ""} border-theme-accent text-theme-accent hover:bg-theme-accent hover:text-white`}
                  onClick={() => setTimeframe("30days")}
                >
                  Last 30 Days
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`${timeframe === "90days" ? "bg-theme-section-selected" : ""} border-theme-accent text-theme-accent hover:bg-theme-accent hover:text-white`}
                  onClick={() => setTimeframe("90days")}
                >
                  Last 90 Days
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`${timeframe === "alltime" ? "bg-theme-section-selected" : ""} border-theme-accent text-theme-accent hover:bg-theme-accent hover:text-white`}
                  onClick={() => setTimeframe("alltime")}
                >
                  All Time
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                  title="Avg. Transaction" 
                  value={formatCurrency(metrics.avgTransaction)}
                  icon={<Receipt className="h-6 w-6" />}
                />
                <StatCard 
                  title="Transactions" 
                  value={metrics.numTransactions.toString()}
                  icon={<ShoppingBag className="h-6 w-6" />}
                />
                <StatCard 
                  title="Total Spent" 
                  value={formatCurrency(metrics.totalSpent)}
                  icon={<CreditCard className="h-6 w-6" />}
                />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="history">
            <TabsList className="mb-4 theme-container-bg">
              <TabsTrigger value="history">Transaction History</TabsTrigger>
              <TabsTrigger value="payment">Payment Methods</TabsTrigger>
            </TabsList>
            
            <TabsContent value="history">
              <Card className="theme-container-bg border">
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>Recent purchases and payments</CardDescription>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      No transactions found for this client.
                    </div>
                  ) : (
                    <Accordion type="single" collapsible className="w-full">
                      {transactions.map((transaction) => (
                        <AccordionItem key={transaction.id} value={transaction.id}>
                          <AccordionTrigger className="px-4 py-3 theme-section-bg hover:bg-theme-section-selected rounded-md my-1">
                            <div className="flex justify-between w-full items-center pr-4">
                              <div className="flex items-center gap-3">
                                <div className="flex flex-col items-start">
                                  <span className="font-medium text-sm">
                                    {transaction.created_at ? formatDateTime(transaction.created_at) : 'Unknown date'}
                                  </span>
                                  <Badge variant={transaction.status === 'completed' ? 'success' : transaction.status === 'open' ? 'secondary' : 'outline'}>
                                    {transaction.status}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-bold">{formatCurrency(transaction.total)}</span>
                                <div className="text-xs text-muted-foreground">
                                  {transaction.payment_method || 'No payment method'}
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-3">
                            <div className="space-y-4">
                              <div className="border rounded-md overflow-hidden theme-section-bg">
                                <Table>
                                  <TableHeader className="bg-theme-section-bg">
                                    <TableRow>
                                      <TableHead>Item</TableHead>
                                      <TableHead className="text-right">Quantity</TableHead>
                                      <TableHead className="text-right">Price</TableHead>
                                      <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {transaction.items && typeof transaction.items === 'object' ? 
                                      Object.values(transaction.items).map((item: any, index) => (
                                        <TableRow key={index} className="hover:bg-theme-section-selected">
                                          <TableCell>{item.name}</TableCell>
                                          <TableCell className="text-right">{item.quantity}</TableCell>
                                          <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                          <TableCell className="text-right">{formatCurrency(item.quantity * item.price)}</TableCell>
                                        </TableRow>
                                      )) : 
                                      <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                          No items available
                                        </TableCell>
                                      </TableRow>
                                    }
                                  </TableBody>
                                </Table>
                              </div>
                              
                              <div className="flex justify-between text-sm">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(transaction.subtotal)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Tax:</span>
                                <span>{formatCurrency(transaction.tax)}</span>
                              </div>
                              <div className="flex justify-between font-bold">
                                <span>Total:</span>
                                <span>{formatCurrency(transaction.total)}</span>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payment">
              <Card className="theme-container-bg border">
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Saved payment methods from Stripe</CardDescription>
                </CardHeader>
                <CardContent>
                  {customer.stripe_customer_id ? (
                    <div className="space-y-4">
                      <Card className="border theme-section-bg">
                        <CardContent className="p-4 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-8 w-8 text-theme-accent" />
                            <div>
                              <div className="font-medium">•••• •••• •••• 4242</div>
                              <div className="text-xs text-muted-foreground">Expires 12/25</div>
                            </div>
                          </div>
                          <Badge>Default</Badge>
                        </CardContent>
                      </Card>
                      
                      <Button className="w-full bg-theme-accent hover:bg-theme-accent-hover text-white">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Add Payment Method
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="text-muted-foreground mb-4">No payment methods added yet</div>
                      <Button className="bg-theme-accent hover:bg-theme-accent-hover text-white">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Add Payment Method
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
