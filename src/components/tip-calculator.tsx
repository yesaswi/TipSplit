
"use client";

import type * as React from 'react';
import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DollarSign, Users, Percent, MessageSquare, Lightbulb, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { suggestTipPercentage, type SuggestTipPercentageOutput } from '@/ai/flows/suggest-tip-percentage';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  billAmount: z.coerce.number().min(0.01, "Bill amount must be greater than 0."),
  tipPercentage: z.coerce.number().min(0, "Tip can't be negative."),
  numberOfPeople: z.coerce.number().int().min(1, "At least one person is required."),
  serviceQuality: z.string().optional(),
  roundTotal: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResults {
  tipAmount: number;
  totalAmount: number;
  amountPerPerson: number;
}

export default function TipCalculator() {
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<SuggestTipPercentageOutput | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      billAmount: '' as unknown as number, // Keep as empty string for controlled input
      tipPercentage: 15,
      numberOfPeople: 1,
      serviceQuality: '',
      roundTotal: false,
    },
  });

  const { billAmount, tipPercentage, numberOfPeople, roundTotal } = form.watch();

  useEffect(() => {
    // Ensure all dependent values are valid numbers before calculating
    const bill = parseFloat(String(billAmount));
    const tipPercentValue = parseFloat(String(tipPercentage));
    const people = parseInt(String(numberOfPeople), 10);

    if (!isNaN(bill) && bill > 0 && !isNaN(tipPercentValue) && tipPercentValue >= 0 && !isNaN(people) && people > 0) {
      const tipPercentDecimal = tipPercentValue / 100;

      let rawTip = bill * tipPercentDecimal;
      let rawTotal = bill + rawTip;
      
      let finalTotal = rawTotal;
      let finalTip = rawTip;

      if (roundTotal) {
        finalTotal = Math.round(rawTotal);
        finalTip = finalTotal - bill;
      }
      
      if (finalTip < 0) finalTip = 0; // Ensure tip isn't negative after rounding

      const perPerson = finalTotal / people;

      setResults({
        tipAmount: finalTip,
        totalAmount: finalTotal,
        amountPerPerson: perPerson,
      });
    } else {
      setResults(null);
    }
  }, [billAmount, tipPercentage, numberOfPeople, roundTotal]);

  const handleAiSuggest = async () => {
    const serviceQualityValue = form.getValues("serviceQuality");
    const billAmountValue = form.getValues("billAmount");

    if (!serviceQualityValue || serviceQualityValue.trim() === "") {
      form.setError("serviceQuality", { type: "manual", message: "Please describe the service quality." });
      return;
    }
    if (billAmountValue === undefined || billAmountValue === null || isNaN(Number(billAmountValue)) || Number(billAmountValue) <= 0) {
      form.setError("billAmount", {type: "manual", message: "Please enter a valid bill amount first."});
      return;
    }

    setIsAiLoading(true);
    setAiSuggestion(null);
    try {
      const suggestion = await suggestTipPercentage({ serviceQuality: serviceQualityValue, billAmount: Number(billAmountValue) });
      setAiSuggestion(suggestion);
      toast({
        title: "AI Suggestion Ready!",
        description: `Suggested Tip: ${(suggestion.suggestedTipPercentage * 100).toFixed(0)}%.`,
      });
    } catch (error) {
      console.error("AI suggestion error:", error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not get AI tip suggestion. Please try again.",
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const applyAiSuggestion = () => {
    if (aiSuggestion) {
      form.setValue("tipPercentage", parseFloat((aiSuggestion.suggestedTipPercentage * 100).toFixed(2)));
      toast({
        title: "Tip Updated",
        description: `Tip percentage set to ${(aiSuggestion.suggestedTipPercentage * 100).toFixed(0)}%.`,
      });
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader className="text-center">
        <div className="inline-flex items-center justify-center gap-2 mb-2">
           <Sparkles className="w-8 h-8 text-primary" />
           <CardTitle className="text-3xl font-bold tracking-tight">TipSplit</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground">
          Calculate tips and split bills with ease. Powered by AI suggestions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="billAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Bill Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          {...field} 
                          onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} 
                          value={field.value === undefined || field.value === null || isNaN(field.value) ? '' : String(field.value)} 
                          className="pl-10 text-base" 
                          step="0.01" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="tipPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Tip Percentage</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input 
                            type="number" 
                            placeholder="15" 
                            {...field} 
                            onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} 
                            value={field.value === undefined || field.value === null || isNaN(field.value) ? '' : String(field.value)} 
                            className="pr-10 text-base" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numberOfPeople"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Number of People</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input 
                            type="number" 
                            placeholder="1" 
                            {...field} 
                            onChange={e => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))} 
                            value={field.value === undefined || field.value === null || isNaN(field.value) ? '' : String(field.value)} 
                            className="pl-10 text-base" 
                            step="1" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2"><Lightbulb className="text-primary"/> AI Tip Suggestion</h3>
              <FormField
                control={form.control}
                name="serviceQuality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Describe the service quality</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., The waiter was very attentive and friendly." {...field} rows={3}/>
                    </FormControl>
                    <FormDescription>
                      Our AI will suggest a tip based on your description.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" onClick={handleAiSuggest} disabled={isAiLoading} className="w-full md:w-auto">
                {isAiLoading ? "Getting Suggestion..." : "Suggest Tip with AI"}
              </Button>
              {aiSuggestion && (
                <Card className="bg-accent/50 p-4 mt-4 border-accent">
                  <CardContent className="p-0 space-y-2">
                    <p className="font-semibold">AI Suggests: <span className="text-primary">{(aiSuggestion.suggestedTipPercentage * 100).toFixed(0)}% Tip</span></p>
                    <p className="text-sm text-muted-foreground"><MessageSquare className="inline h-4 w-4 mr-1"/>Reasoning: {aiSuggestion.reasoning}</p>
                    <Button variant="outline" size="sm" onClick={applyAiSuggestion} className="mt-2">
                      Use This Tip
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <Separator />

            <FormField
              control={form.control}
              name="roundTotal"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Round Total Bill</FormLabel>
                    <FormDescription>
                      Round the total bill (including tip) to the nearest dollar.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {results && (
              <>
                <Separator />
                <div className="space-y-4 pt-4">
                  <h3 className="text-2xl font-semibold text-center text-primary">Your Split</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-card p-4 rounded-lg shadow">
                      <p className="text-sm text-muted-foreground">Tip Amount</p>
                      <p className="text-2xl font-bold">{formatCurrency(results.tipAmount)}</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg shadow">
                      <p className="text-sm text-muted-foreground">Total Bill</p>
                      <p className="text-2xl font-bold">{formatCurrency(results.totalAmount)}</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg shadow">
                      <p className="text-sm text-muted-foreground">Per Person</p>
                      <p className="text-2xl font-bold">{formatCurrency(results.amountPerPerson)}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" onClick={() => {
          form.reset(); 
          setResults(null);
          setAiSuggestion(null);
        }}>Clear All</Button>
      </CardFooter>
    </Card>
  );
}

