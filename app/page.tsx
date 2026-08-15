"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import GraphViewer from '@/components/GraphViewer';
import { Property } from '@/lib/types';
import PropertyDetailPanel from '@/components/PropertyDetailPanel';

const MapViewer = dynamic(() => import('@/components/MapViewer'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full bg-[#FBFBF7] animate-pulse flex flex-col items-center justify-center text-[#647161]">Loading Satellite Map...</div> 
});

const initialGraphData = {
  nodes: [
    { id: 'user', label: '사용자', group: 'user' },
    { id: 'seoul', label: '서울 (전체)', group: 'region' }
  ],
  links: [
    { source: 'user', target: 'seoul' }
  ]
};

export default function AiSearchPage() {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [graphData, setGraphData] = useState<any>(initialGraphData);
  const [aiReport, setAiReport] = useState<string>("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    const currentPrompt = prompt;
    setPrompt("");

    try {
      const response = await fetch('/api/chat-to-graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentPrompt })
      });
      
      const data = await response.json();
      
      if (!data.error) {
        setGraphData((prev: any) => {
          // Merge nodes based on unique ID
          const existingNodeIds = new Set(prev.nodes.map((n: any) => n.id));
          const newNodes = data.graphData.nodes.filter((n: any) => !existingNodeIds.has(n.id));
          
          // Merge links
          const existingLinkKeys = new Set(prev.links.map((l: any) => `${l.source.id || l.source}-${l.target.id || l.target}`));
          const newLinks = data.graphData.links.filter((l: any) => !existingLinkKeys.has(`${l.source}-${l.target}`));
          
          return {
            nodes: [...prev.nodes, ...newNodes],
            links: [...prev.links, ...newLinks]
          };
        });
        setAiReport(prev => prev ? `${prev}\n\n[추가 분석]\n${data.aiMessage}` : data.aiMessage);
        if (data.properties && data.properties.length > 0) {
          setProperties(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newProps = data.properties.filter((p: Property) => !existingIds.has(p.id));
            return [...prev, ...newProps];
          });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-10 relative bg-[#FBFBF7] overflow-hidden">
      {/* Intense Breathing Backgrounds */}
      <div className="fixed top-[-10%] right-[-5%] w-[50rem] h-[50rem] bg-[#2C4C3B]/10 rounded-full blur-[120px] -z-10 pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="fixed bottom-[-10%] left-[-5%] w-[40rem] h-[40rem] bg-[#6B8E6B]/15 rounded-full blur-[120px] -z-10 pointer-events-none animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />

      {/* High-End English Header (Full Screen Height) */}
      <header className="flex flex-col items-center justify-center text-center relative z-10 min-h-[85vh] animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <h1 className="font-serif text-[3.5rem] leading-[1.05] font-normal tracking-tight text-[#1A2421] sm:text-[5rem] max-w-5xl">
          Find your perfect space, <br />
          <span className="relative inline-block mt-3 font-serif tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#2C4C3B] to-[#6B8E6B]">
            <span className="relative z-10">Visualized at light speed.</span>
            <div className="absolute -top-1 -right-4 h-3 w-3 animate-ping rounded-full bg-[#6B8E6B] opacity-80"></div>
            <div className="absolute -bottom-2 -left-4 h-2 w-2 animate-ping rounded-full bg-[#2C4C3B] opacity-60" style={{animationDelay: '1s'}}></div>
          </span>
        </h1>
        <p className="mt-8 text-xl/8 text-[#647161] font-light max-w-2xl mx-auto tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 fill-mode-both">
          Just chat naturally about your preferences. Our AI instantly maps out the best real estate matches for you in an interactive knowledge graph.
        </p>

        {/* Social Links (GitHub & LinkedIn) */}
        <div className="mt-12 flex items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-both">
          <a href="https://github.com/qkrwnscjf" target="_blank" rel="noopener noreferrer" title="GitHub"
             className="w-12 h-12 rounded-full bg-white/60 border border-[#E5E7E1] shadow-sm flex items-center justify-center text-[#2C4C3B] hover:bg-[#2C4C3B] hover:text-white hover:scale-110 transition-all duration-300 backdrop-blur-md">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" title="LinkedIn"
             className="w-12 h-12 rounded-full bg-white/60 border border-[#E5E7E1] shadow-sm flex items-center justify-center text-[#2C4C3B] hover:bg-[#2C4C3B] hover:text-white hover:scale-110 transition-all duration-300 backdrop-blur-md">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </a>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 animate-bounce text-[#6B8E6B]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </header>

      {/* Project Explanation Section */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-5xl mx-auto mb-32 pt-20 text-center relative z-10"
      >
        <h2 className="text-3xl font-serif text-[#1A2421] mb-12">Redefining Real Estate Discovery</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-[#E5E7E1] shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 rounded-2xl bg-[#2C4C3B]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-[#2C4C3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h3 className="font-bold text-lg text-[#1A2421] mb-3">AI-Driven Intent</h3>
            <p className="text-[#647161] text-sm leading-relaxed">Simply type what you want in plain text. Our Llama-3 model instantly extracts your intent and context.</p>
          </div>
          <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-[#E5E7E1] shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 rounded-2xl bg-[#2C4C3B]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-[#2C4C3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path></svg>
            </div>
            <h3 className="font-bold text-lg text-[#1A2421] mb-3">Infinite Knowledge Graph</h3>
            <p className="text-[#647161] text-sm leading-relaxed">Watch regions and property details connect dynamically in beautiful concentric orbits as you search.</p>
          </div>
          <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-[#E5E7E1] shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 rounded-2xl bg-[#2C4C3B]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-[#2C4C3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
            </div>
            <h3 className="font-bold text-lg text-[#1A2421] mb-3">Live Big Data Pipeline</h3>
            <p className="text-[#647161] text-sm leading-relaxed">Connected to the MOLIT API, pulling fresh real estate transactions every night via Apache PySpark & ClickHouse.</p>
          </div>
        </div>
      </motion.div>

      {/* Centered Large Search Bar (Animated on scroll) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: false, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-3xl mx-auto mb-16 relative z-10"
      >
        <form onSubmit={handleSearch} className="flex items-center justify-between gap-3 rounded-full p-2 border border-[#E5E7E1] bg-white/80 backdrop-blur-2xl shadow-xl focus-within:ring-4 focus-within:ring-[#2C4C3B]/10 focus-within:border-[#2C4C3B]/40 transition-all duration-300 h-16">
          <input
            type="text"
            className="min-w-0 flex-1 bg-transparent px-6 text-lg font-medium focus:outline-none text-[#1A2421] placeholder:text-[#647161]/40"
            placeholder="e.g., Studio in Mapo-gu under 600k..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="inline-flex shrink-0 items-center justify-center rounded-full px-8 h-12 bg-[#2C4C3B] text-white shadow-md hover:shadow-lg hover:bg-[#1A2421] disabled:opacity-50 transition-all font-semibold tracking-wide"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" style={{animationDelay: '0.15s'}}></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" style={{animationDelay: '0.3s'}}></div>
              </div>
            ) : "Analyze"}
          </button>
        </form>
      </motion.div>

      {/* Graph and Report Grid (Animated on scroll) */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-50px" }}
        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 pb-20"
      >
        {/* Left Panel: Graph Canvas */}
        <div className="lg:col-span-8">
          <div className="bg-white/80 backdrop-blur-3xl border border-[#E5E7E1] rounded-[2.5rem] p-2 shadow-lg h-[650px] overflow-hidden relative group hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
            <div className="absolute top-6 left-8 z-10">
              <span className="inline-flex items-center px-5 py-2 rounded-full bg-white/95 backdrop-blur-md text-[#1A2421] text-sm font-bold border border-[#E5E7E1] shadow-md">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#2C4C3B] to-[#6B8E6B] mr-2 animate-pulse"></span>
                Knowledge Graph
              </span>
            </div>
            <div className="w-full h-full">
              {isLoading ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#647161]">
                  <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-4 border-dashed border-[#E5E7E1] rounded-full animate-[spin_4s_linear_infinite]"></div>
                    <div className="absolute inset-2 border-4 border-[#2C4C3B] rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <p className="animate-pulse tracking-wide font-medium text-lg">Mapping intelligence...</p>
                </div>
              ) : (
                <GraphViewer data={graphData} onNodeClick={setSelectedNode} />
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: AI Report */}
        <div className="lg:col-span-4">
          <div className="bg-white/80 backdrop-blur-3xl border border-[#E5E7E1] rounded-[2.5rem] p-8 shadow-lg h-[650px] flex flex-col relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
            <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-l from-[#6B8E6B] to-[#A4B494] opacity-70 group-hover:opacity-100 transition-opacity" />
            <h2 className="text-xl font-bold mb-8 text-[#1A2421] tracking-tight font-sans">AI Analysis</h2>
            
            {aiReport ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex-1 overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden">
                <div className="inline-flex items-center px-4 py-1.5 bg-gradient-to-r from-[#6B8E6B]/10 to-[#2C4C3B]/10 text-[#1A2421] rounded-full text-xs font-bold mb-6 border border-[#6B8E6B]/30 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#6B8E6B] mr-2 animate-pulse"></span>
                  Llama-3 Intelligence
                </div>
                <div className="space-y-6">
                  <div className="p-6 bg-white/95 border border-[#E5E7E1] rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-[0.95rem] text-[#2C3528] leading-[1.8] whitespace-pre-wrap font-medium">
                      {aiReport}
                    </p>
                  </div>
                  {selectedNode && selectedNode.group !== 'user' && (
                    <div className="p-6 border border-[#2C4C3B]/20 rounded-[1.5rem] bg-gradient-to-br from-[#2C4C3B]/5 to-transparent animate-in fade-in shadow-sm">
                      <p className="text-xs text-[#2C4C3B] font-bold mb-2 tracking-wider uppercase">Selected Node</p>
                      <p className="text-[1rem] font-bold text-[#1A2421]">{selectedNode.label.replace('\\n', ' ')}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-[80%] flex flex-col items-center justify-center text-center opacity-60">
                <p className="text-[#2C3528] text-[0.95rem] font-medium leading-relaxed tracking-tight">
                  AI will generate a comprehensive<br/>insight report here.
                </p>
              </div>
            )}
          </div>
        </div>

      </motion.div>

      {/* Map Viewer Section (Animated on scroll) */}
      {properties.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl mx-auto mb-20 relative z-10"
        >
          <div className="bg-white/80 backdrop-blur-3xl border border-[#E5E7E1] rounded-[2.5rem] p-4 shadow-lg h-[500px] overflow-hidden relative group hover:shadow-xl transition-all duration-500">
            <div className="absolute top-8 left-8 z-10">
              <span className="inline-flex items-center px-5 py-2 rounded-full bg-white/95 backdrop-blur-md text-[#1A2421] text-sm font-bold border border-[#E5E7E1] shadow-md">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#2C4C3B] to-[#6B8E6B] mr-2"></span>
                Property Map View
              </span>
            </div>
            <MapViewer 
              properties={properties} 
              onMarkerClick={(prop) => {
                setSelectedProperty(null); // 닫았다가 다시 열기 위한 트릭
                setTimeout(() => setSelectedProperty(prop), 50);
              }} 
            />
          </div>

          <AnimatePresence>
            {selectedProperty && (
              <PropertyDetailPanel 
                key={selectedProperty.id}
                property={selectedProperty}
                onClose={() => setSelectedProperty(null)}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}

    </div>
  );
}
