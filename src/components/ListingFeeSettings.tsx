import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Save, DollarSign } from 'lucide-react';

interface ListingFeeSetting {
  id: string;
  fee_amount: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const ListingFeeSettings: React.FC = () => {
  const [feeAmount, setFeeAmount] = useState<string>('');
  const [currency, setCurrency] = useState<string>('KWD');
  const [isActive, setIsActive] = useState<boolean>(true);
  const queryClient = useQueryClient();

  // Fetch current listing fee settings
  const { data: feeSettings, isLoading } = useQuery({
    queryKey: ['listing-fee-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listing_fee_settings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data?.[0] as ListingFeeSetting | null;
    }
  });

  // Update form when data is loaded
  useEffect(() => {
    if (feeSettings) {
      setFeeAmount(feeSettings.fee_amount.toString());
      setCurrency(feeSettings.currency);
      setIsActive(feeSettings.is_active);
    }
  }, [feeSettings]);

  // Mutation to update listing fee settings
  const updateFeeSettings = useMutation({
    mutationFn: async (newSettings: { fee_amount: number; currency: string; is_active: boolean }) => {
      // Deactivate all existing settings first
      await supabase
        .from('listing_fee_settings')
        .update({ is_active: false })
        .eq('is_active', true);

      // Insert new active setting
      const { data, error } = await supabase
        .from('listing_fee_settings')
        .insert({
          fee_amount: newSettings.fee_amount,
          currency: newSettings.currency,
          is_active: newSettings.is_active
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing-fee-settings'] });
      toast({
        title: "Settings Updated",
        description: "Listing fee settings have been updated successfully."
      });
    },
    onError: (error) => {
      console.error('Error updating fee settings:', error);
      toast({
        title: "Error",
        description: "Failed to update listing fee settings.",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    const amount = parseFloat(feeAmount);
    if (isNaN(amount) || amount < 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid fee amount.",
        variant: "destructive"
      });
      return;
    }

    updateFeeSettings.mutate({
      fee_amount: amount,
      currency,
      is_active: isActive
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-10 bg-muted rounded mt-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="fee-amount">Listing Fee Amount</Label>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <Input
              id="fee-amount"
              type="number"
              step="0.01"
              min="0"
              value={feeAmount}
              onChange={(e) => setFeeAmount(e.target.value)}
              placeholder="Enter fee amount"
              className="flex-1"
            />
            <Input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="Currency"
              className="w-20"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Set the fee amount property owners must pay to list their properties. Set to 0 to disable fees.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is-active"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          <Label htmlFor="is-active">Active</Label>
        </div>
      </div>

      <Button 
        onClick={handleSave} 
        disabled={updateFeeSettings.isPending}
        className="w-full"
      >
        <Save className="mr-2 h-4 w-4" />
        {updateFeeSettings.isPending ? 'Saving...' : 'Save Settings'}
      </Button>

      {feeSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Settings</CardTitle>
            <CardDescription>Active listing fee configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Fee Amount:</span>
                <span className="font-medium">{feeSettings.fee_amount} {feeSettings.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <span className={`font-medium ${feeSettings.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {feeSettings.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last Updated:</span>
                <span className="text-sm">{new Date(feeSettings.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ListingFeeSettings;