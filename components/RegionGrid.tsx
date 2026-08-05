import RegionCard from "./RegionCard";

interface RegionGridProps {
  regions: Array<{
    code: string;
    name: string;
    price: string;
    change: number;
    radiusPattern: number;
  }>;
}

export default function RegionGrid({ regions }: RegionGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
      {regions.map((region) => (
        <RegionCard key={region.code} {...region} />
      ))}
    </div>
  );
}
