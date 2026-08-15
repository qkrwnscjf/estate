import { RegionSummary, TrendPoint, Property } from './types';

export function mapToGraphData(
  userQuery: string, 
  regionName: string, 
  summary: RegionSummary, 
  trend: TrendPoint[],
  properties: Property[] = []
) {
  const nodes = [];
  const links = [];
  
  const regionId = `region_${regionName}`;
  // 1. Region Node (매칭된 지역) - 기본 서울 노드에서 파생
  nodes.push({ id: regionId, label: regionName, group: 'region', val: 15 });
  links.push({ source: 'seoul', target: regionId });

  // 3. Info Nodes (세부 지표)
  const priceId = `price_${regionName}`;
  nodes.push({ id: priceId, label: `평균 ${summary.currentPrice}`, group: 'info', val: 10 });
  links.push({ source: regionId, target: priceId });

  const changeId = `change_${regionName}`;
  nodes.push({ id: changeId, label: `변동률 ${summary.momChange}`, group: 'info', val: 10 });
  links.push({ source: regionId, target: changeId });

  const txnId = `txn_${regionName}`;
  nodes.push({ id: txnId, label: `최근 거래량 ${summary.txn}`, group: 'info', val: 10 });
  links.push({ source: regionId, target: txnId });

  // 4. Trend Info (가장 최근 시세 데이터가 있다면)
  if (trend && trend.length > 0) {
    const lastTrend = trend[trend.length - 1];
    const trendId = `trend_${regionName}`;
    nodes.push({ id: trendId, label: `${lastTrend.name} 시세 반영됨`, group: 'info', val: 10 });
    links.push({ source: regionId, target: trendId });
  }

  // 5. Property Nodes (실제 매물)
  properties.forEach((prop, idx) => {
    // DB의 고유 id를 사용하거나 없으면 region과 index를 조합하여 고유하게 만듦
    const propId = prop.id ? `prop_${prop.id}` : `prop_${regionName}_${idx}`;
    nodes.push({ 
      id: propId, 
      label: `${prop.name}\n(월 ${prop.monthlyRent}만)`, 
      group: 'property', 
      val: 12 
    });
    links.push({ source: regionId, target: propId });
  });

  return { nodes, links };
}
