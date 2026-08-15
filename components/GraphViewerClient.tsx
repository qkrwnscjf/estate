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
    if (node.x === undefined || node.y === undefined || !globalScale) return;

    const label = node.label || "";
    const fontSize = 12 / globalScale;
    const lines = label.split('\n');
    
    let coreColor = '#A85448';
    let orbitColor = 'rgba(168, 84, 72, 0.4)';
    let orbitColorOuter = 'rgba(168, 84, 72, 0.15)';
    
    if (node.group === 'user') { 
      coreColor = '#5D7052'; orbitColor = 'rgba(93, 112, 82, 0.5)'; orbitColorOuter = 'rgba(93, 112, 82, 0.2)'; 
    } else if (node.group === 'region') { 
      coreColor = '#C18C5D'; orbitColor = 'rgba(193, 140, 93, 0.5)'; orbitColorOuter = 'rgba(193, 140, 93, 0.2)'; 
    } else if (node.group === 'property') { 
      coreColor = '#D98A6C'; orbitColor = 'rgba(217, 138, 108, 0.5)'; orbitColorOuter = 'rgba(217, 138, 108, 0.2)'; 
    }
    
    const r = 3 / globalScale; // 중심핵(Core)
    const orbit1 = 7 / globalScale; // 안쪽 궤도
    const orbit2 = 12 / globalScale; // 바깥쪽 궤도

    // 1. 바깥쪽 궤도 그리기 (Outer Orbit)
    ctx.beginPath();
    ctx.arc(node.x, node.y, orbit2, 0, 2 * Math.PI, false);
    ctx.lineWidth = 0.5 / globalScale;
    ctx.strokeStyle = orbitColorOuter;
    ctx.stroke();

    // 2. 안쪽 궤도 그리기 (Inner Orbit)
    ctx.beginPath();
    ctx.arc(node.x, node.y, orbit1, 0, 2 * Math.PI, false);
    ctx.lineWidth = 1.2 / globalScale;
    ctx.strokeStyle = orbitColor;
    ctx.stroke();

    // 3. 중심핵 그리기 (Core Dot)
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
    ctx.fillStyle = coreColor;
    ctx.fill();

    // 4. 텍스트 설정
    ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    let maxWidth = 0;
    lines.forEach((line: string) => {
      const w = ctx.measureText(line).width;
      if (w > maxWidth) maxWidth = w;
    });
    
    const textHeight = lines.length * (fontSize * 1.3);
    const paddingX = 4 / globalScale;
    const paddingY = 2 / globalScale;
    // 궤도 바깥에 텍스트 배치
    const textY = node.y + orbit2 + (4 / globalScale); 
    
    // 5. 텍스트 가독성을 위한 아주 옅은 반투명 배경창
    ctx.fillStyle = 'rgba(253, 252, 248, 0.7)';
    ctx.fillRect(
      node.x - maxWidth/2 - paddingX, 
      textY - paddingY, 
      maxWidth + paddingX*2, 
      textHeight + paddingY*2
    );

    // 6. 텍스트 렌더링
    ctx.fillStyle = '#4A4A40'; 
    lines.forEach((line: string, i: number) => {
      ctx.fillText(line, node.x, textY + (i * fontSize * 1.3));
    });
    
    // Hover/Click 영역 계산 캐싱
    node.__pointerBox = { 
      w: Math.max(maxWidth + paddingX*2, orbit2*2), 
      h: textHeight + paddingY*2 + orbit2 + (4/globalScale) + orbit2, 
      y: node.y - orbit2
    };
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
        nodePointerAreaPaint={(node: any, color, ctx) => {
          ctx.fillStyle = color;
          const pBox = node.__pointerBox;
          if (pBox) {
            ctx.fillRect(node.x - pBox.w/2, pBox.y, pBox.w, pBox.h);
          } else {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false);
            ctx.fill();
          }
        }}
        linkColor={() => '#E5E7E1'}
        linkWidth={2}
        backgroundColor="transparent"
      />
    </div>
  );
}
