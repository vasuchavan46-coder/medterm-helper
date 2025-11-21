import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, Heart, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExplanationResponse {
  explanation: string;
}

const Index = () => {
  const [term, setTerm] = useState("");
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!term.trim()) {
      toast({
        title: "Please enter a term",
        description: "Type a medical term to get started",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setExplanation("");

    try {
      const { data, error } = await supabase.functions.invoke<ExplanationResponse>(
        "medical-terminology",
        {
          body: { term: term.trim() },
        }
      );

      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }

      if (data?.explanation) {
        setExplanation(data.explanation);
      } else {
        throw new Error("No explanation received");
      }
    } catch (error) {
      console.error("Error fetching explanation:", error);
      toast({
        title: "Error",
        description: "Failed to fetch explanation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-medical-light to-secondary">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-medical-teal bg-clip-text text-transparent">
            Medical Terminology Assistant
          </h1>
          <p className="text-xl text-muted-foreground">
            Understanding medical terms made simple
          </p>
        </div>

        {/* Disclaimer */}
        <Alert className="mb-8 border-primary/20 bg-accent/50">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            This tool explains medical terms for educational purposes only. 
            <strong> It does not provide medical diagnosis or treatment advice.</strong> 
            Please consult a healthcare professional for medical concerns.
          </AlertDescription>
        </Alert>

        {/* Search Form */}
        <Card className="mb-8 shadow-lg border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">Search Medical Terms</CardTitle>
            <CardDescription>
              Enter any medical term, abbreviation, or phrase to learn more
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-3">
              <Input
                type="text"
                placeholder="e.g., Tachycardia, MRI, Hypertension..."
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="flex-1 text-lg"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="lg" 
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Explanation Result */}
        {explanation && (
          <Card className="shadow-lg border-primary/20 animate-in fade-in-50 duration-500">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Explanation</CardTitle>
              <CardDescription>Understanding: <strong>{term}</strong></CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-slate max-w-none">
                <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                  {explanation}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Example Terms */}
        {!explanation && !isLoading && (
          <Card className="shadow-lg border-border/50">
            <CardHeader>
              <CardTitle className="text-xl">Try These Examples</CardTitle>
              <CardDescription>Click any term to search</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[
                  "Tachycardia",
                  "Hypertension",
                  "MRI",
                  "Anemia",
                  "ECG",
                  "Dermatology",
                  "Arthritis",
                  "Cardiology",
                ].map((example) => (
                  <Button
                    key={example}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTerm(example);
                      const form = document.querySelector("form");
                      if (form) {
                        form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
                      }
                    }}
                    className="hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;