"use client";

interface CompareSelectorProps {
  selectedCodes: string[];
  onChange: (codes: string[]) => void;
}

export default function CompareSelector({ selectedCodes, onChange }: CompareSelectorProps) {
  // Mock interactions for demo
  const mockRegions = [
    { code: "11680", name: "강남구" },
    { code: "11440", name: "마포구" },
    { code: "11620", name: "관악구" },
    { code: "41110", name: "수원시" }
  ];

  const toggleRegion = (code: string) => {
    if (selectedCodes.includes(code)) {
      onChange(selectedCodes.filter(c => c !== code));
    } else {
      if (selectedCodes.length >= 4) {
        alert("최대 4개까지만 선택 가능합니다.");
        return;
      }
      onChange([...selectedCodes, code]);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {mockRegions.map(region => {
        const isSelected = selectedCodes.includes(region.code);
        return (
          <button
            key={region.code}
            onClick={() => toggleRegion(region.code)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              isSelected 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "bg-secondary/20 text-muted-foreground hover:bg-secondary/40"
            }`}
          >
            {region.name} {isSelected ? "✓" : "+"}
          </button>
        );
      })}
    </div>
  );
}
