
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface EyeSwap {
  id: string;
  title: string | null;
  image_path: string;
  eye_style: string;
  created_at: string;
}

const MySwaps = () => {
  const { user } = useAuth();
  const [swaps, setSwaps] = useState<EyeSwap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSwaps = async () => {
      try {
        setLoading(true);
        if (!user) return;

        const { data, error } = await supabase
          .from("eye_swaps")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setSwaps(data || []);
      } catch (error) {
        console.error("Error fetching swaps:", error);
        toast.error("Failed to load your eye swaps");
      } finally {
        setLoading(false);
      }
    };

    fetchSwaps();
  }, [user]);

  const handleDelete = async (id: string, imagePath: string) => {
    try {
      // Delete the record from the database
      const { error: dbError } = await supabase
        .from("eye_swaps")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      // Delete the file from storage
      const path = imagePath.split("/").pop(); // Get just the filename
      if (path) {
        const { error: storageError } = await supabase
          .storage
          .from("eye_swap_images")
          .remove([path]);

        if (storageError) console.error("Storage delete error:", storageError);
      }

      // Update the local state
      setSwaps(swaps.filter(swap => swap.id !== id));
      toast.success("Eye swap deleted successfully");
    } catch (error) {
      console.error("Error deleting swap:", error);
      toast.error("Failed to delete eye swap");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-10">
        <div className="container max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">My Eye Swaps</h1>
          
          {loading ? (
            <div className="text-center py-8">Loading your eye swaps...</div>
          ) : swaps.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">You haven't created any eye swaps yet.</p>
              <Button asChild>
                <a href="/">Create Your First Eye Swap</a>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {swaps.map((swap) => (
                <Card key={swap.id} className="overflow-hidden">
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">
                      {swap.title || `Eye Swap (${new Date(swap.created_at).toLocaleDateString()})`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <img 
                      src={swap.image_path} 
                      alt="Eye swap result" 
                      className="w-full aspect-square object-cover"
                    />
                  </CardContent>
                  <CardFooter className="p-4 flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Style: {swap.eye_style.replace(/-/g, ' ')}
                    </div>
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      onClick={() => handleDelete(swap.id, swap.image_path)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MySwaps;
