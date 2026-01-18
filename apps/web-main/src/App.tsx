import { Button } from "@/components/ui/button";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-semibold">Expense Tracker</h1>
        <p className="mt-2 text-sm text-gray-600">Phase 6 UI scaffold</p>

        <div className="mt-6">
          <Button>Shadcn Button</Button>
        </div>
      </div>
    </div>
  );
}