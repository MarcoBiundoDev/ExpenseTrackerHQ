import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

type MonthTabsProps = {
  value: string;
  onChange: (value: string) => void;
};

export function MonthTabs({ value, onChange }: MonthTabsProps) {
  return (
    <Tabs value={value} onValueChange={onChange}>
      <TabsList className="w-full h-auto items-start flex flex-wrap gap-1 justify-start rounded-md bg-muted/40 p-1 sm:h-10 sm:flex-nowrap sm:items-center sm:overflow-x-auto">
        {months.map((m) => (
          <TabsTrigger key={m} value={m}>
            {m}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}