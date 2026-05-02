import { Button } from "@/components/ui/button";

function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-4xl font-bold text-primary mb-4">Task Forge</h1>
      <p className="text-accent mb-6">Custom Color Test</p>
      
      <div className="flex gap-4">
        <Button>Primary Button</Button>
        <Button variant="outline">Outline</Button>
        <Button className="bg-accent text-black hover:bg-accent/90">
          Accent Color
        </Button>
      </div>
    </div>
  );
}

export default App;