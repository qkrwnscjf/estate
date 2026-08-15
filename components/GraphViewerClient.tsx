import React, { useCallback, useRef, useState, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function GraphViewerClient({ data, onNodeClick }: { data: any, onNodeClick?: (node: any) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        setDimensions({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeClick = useCallback((node: any) => {
    if (onNodeClick) onNodeClick(node);
  }, [onNodeClick]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.label || '';
    const fontSize = 14 / globalScale;
    ctx.font = `bold ${fontSize}px "Nunito", sans-serif`;
    const textWidth = ctx.measureText(label).width;
    const padding = fontSize * 1.5;
    const bgWidth = textWidth + padding * 2;
    const bgHeight = fontSize * 2.5;

    let bgColor = '#2C4C3B'; // default
    let textColor = '#FFFFFF';
    
    if (node.group === 'user') {
      bgColor = '#1A2421';
    } else if (node.group === 'region') {
      bgColor = '#6B8E6B';
    } else if (node.group === 'info') {
      bgColor = '#D98A6C';
    } else if (node.group === 'property') {
      bgColor = '#A4B494';
      textColor = '#1A2421';
    }

    ctx.fillStyle = bgColor;
    ctx.beginPath();
    // Fallback for older browsers if roundRect isn't supported, though nextjs apps usually run on modern browsers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((ctx as any).roundRect) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ctx as any).roundRect(node.x - bgWidth / 2, node.y - bgHeight / 2, bgWidth, bgHeight, [bgHeight / 2]);
    } else {
      ctx.rect(node.x - bgWidth / 2, node.y - bgHeight / 2, bgWidth, bgHeight);
    }
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = textColor;
    ctx.fillText(label, node.x, node.y);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px]">
      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={data}
        nodeLabel={() => ''}
        nodeCanvasObject={paintNode}
        onNodeClick={handleNodeClick}
        linkColor={() => '#E5E7E1'}
        linkWidth={2}
        backgroundColor="transparent"
      />
    </div>
  );
}
