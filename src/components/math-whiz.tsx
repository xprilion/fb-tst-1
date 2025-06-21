"use client";

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Equal, BrainCircuit, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { verifyAddition, type VerifyAdditionOutput } from '@/ai/flows/verify-addition';
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  num1: z.coerce.number(),
  num2: z.coerce.number(),
  userSum: z.string({required_error: "Please enter your answer."}).min(1, "Please enter your answer.").pipe(z.coerce.number())
});

type FormData = z.infer<typeof formSchema>;

export function MathWhiz() {
  const [aiResult, setAiResult] = useState<VerifyAdditionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userSum: '',
    },
  });

  const generateNewProblem = useCallback(() => {
    const num1 = Math.floor(Math.random() * 100);
    const num2 = Math.floor(Math.random() * 100);
    form.reset({
        num1,
        num2,
        userSum: '',
    });
    setAiResult(null);
  }, [form]);

  useEffect(() => {
    generateNewProblem();
  }, [generateNewProblem]);


  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setAiResult(null);
    try {
      const result = await verifyAddition(data);
      setAiResult(result);
    } catch (error) {
      console.error("AI verification failed:", error);
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "There was a problem with the AI verification. Please try again.",
      })
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-lg shadow-2xl bg-card border-none">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                    <BrainCircuit className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <CardTitle className="font-headline text-3xl">MathWhiz</CardTitle>
                    <CardDescription className="text-base">Let's check your addition skills!</CardDescription>
                </div>
            </div>
            <Button variant="ghost" size="icon" onClick={generateNewProblem} aria-label="New problem">
                <RefreshCw className="h-5 w-5" />
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex items-end justify-center space-x-4 p-4 rounded-lg bg-muted/50">
              <FormField
                control={form.control}
                name="num1"
                render={({ field }) => (
                  <FormItem className="w-28 text-center">
                    <FormLabel className="text-sm text-muted-foreground">First Number</FormLabel>
                    <FormControl>
                      <Input value={field.value} className="text-center text-4xl h-16 font-bold bg-transparent border-none shadow-none p-0" readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Plus className="text-muted-foreground size-8 mb-4" />
              <FormField
                control={form.control}
                name="num2"
                render={({ field }) => (
                  <FormItem className="w-28 text-center">
                    <FormLabel className="text-sm text-muted-foreground">Second Number</FormLabel>
                    <FormControl>
                      <Input value={field.value} className="text-center text-4xl h-16 font-bold bg-transparent border-none shadow-none p-0" readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator />

            <div className="flex items-center space-x-4 justify-center">
                <Equal className="text-muted-foreground size-8" />
                <FormField
                    control={form.control}
                    name="userSum"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Your Answer</FormLabel>
                        <FormControl>
                            <Input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="Type here..." {...field} className="text-xl h-12 w-48" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            
            <Button type="submit" size="lg" className="w-full text-lg" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Check My Answer'}
            </Button>
          </form>
        </Form>
      </CardContent>

      {aiResult && (
        <CardFooter className="mt-4 animate-in fade-in-50 duration-500">
            <div className="w-full">
                {aiResult.isCorrect ? (
                    <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle className="font-bold">Correct!</AlertTitle>
                        <AlertDescription>
                            Great job! You got the right answer.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle className="font-bold">Not quite...</AlertTitle>
                        <AlertDescription className="space-y-2">
                            <p>The correct answer is <strong>{aiResult.correctSum}</strong>.</p>
                            <div>
                                <h4 className="font-semibold text-sm">Here's how to solve it:</h4>
                                <p className="text-sm whitespace-pre-wrap">{aiResult.explanation}</p>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </CardFooter>
      )}
    </Card>
  );
}
