"use client";

import { motion } from 'framer-motion';
import { Property } from '@/lib/types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

interface PropertyDetailPanelProps {
  property: Property;
  onClose: () => void;
}

export default function PropertyDetailPanel({ property, onClose }: PropertyDetailPanelProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="mt-8 bg-[#FEFEFA] rounded-[2.5rem] border border-[#E5E7E1] shadow-[0_20px_40px_-15px_rgba(44,76,59,0.08)] overflow-hidden relative p-8 lg:p-12"
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 bg-[#FBFBF7] border border-[#E5E7E1] rounded-full flex items-center justify-center text-[#647161] hover:bg-[#E5E7E1] transition-colors z-20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex flex-col gap-10">
        
        {/* Header (Title, Address, Features) */}
        <div className="pr-12">
          <div className="flex flex-wrap gap-2 mb-4">
            {property.features.map((f, i) => (
              <span key={i} className="text-[12px] bg-[#A4B494]/10 text-[#5D7052] border border-[#A4B494]/30 px-3 py-1 rounded-full font-bold">
                #{f}
              </span>
            ))}
          </div>
          <h2 className="text-3xl font-bold text-[#1A2421] mb-2 font-heading">{property.name}</h2>
          <p className="text-[#647161] text-base flex items-center font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-[#D98A6C]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {property.address}
          </p>
        </div>

        {/* Price Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#FBFBF7] border border-[#E5E7E1] rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#D98A6C]/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
            <p className="text-sm text-[#647161] font-semibold mb-3">최근 실거래가</p>
            <div className="flex flex-col sm:flex-row sm:items-end gap-2 mb-4">
              <span className="text-3xl font-bold text-[#2C4C3B]">보증금 {property.deposit}만</span>
              <span className="text-xl font-bold text-[#D98A6C] sm:mb-[2px]">/ 월 {property.monthlyRent}만</span>
            </div>
            
            <div className="pt-3 border-t border-[#E5E7E1]/70 flex items-center justify-between">
              <span className="text-xs text-[#647161] font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-[#6B8E6B]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                지역 최근 1개월 평균
              </span>
              <span className="text-sm font-bold text-[#6B8E6B]">
                {property.trend && property.trend.length > 0 
                  ? (() => {
                      const lastPrice = property.trend[property.trend.length - 1].price;
                      return `${Math.floor(lastPrice / 10000) > 0 ? `${Math.floor(lastPrice / 10000)}억 ` : ''}${(lastPrice % 10000).toLocaleString()}만`;
                    })()
                  : (property.monthlyAverage || '데이터 없음')}
              </span>
            </div>

            {property.contractDate && (
              <p className="text-xs text-[#647161] mt-3 bg-white w-fit px-2 py-1 rounded-md border border-[#E5E7E1] font-medium opacity-80">
                계약 체결일: {property.contractDate}
              </p>
            )}
          </div>

          <div className="bg-[#FBFBF7] border border-[#E5E7E1] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
            <div>
              <p className="text-sm text-[#647161] font-semibold mb-1 flex items-center">
                해당 지역 주간 실거래 추이
                <span className="ml-2 text-[10px] bg-[#6B8E6B]/10 text-[#6B8E6B] px-2 py-0.5 rounded-full">최근 12주(3개월)</span>
              </p>
            </div>
            {property.trend && property.trend.length > 0 ? (
              <div className="h-20 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={property.trend}>
                    <XAxis dataKey="name" hide />
                    <YAxis domain={['dataMin - 1000', 'dataMax + 1000']} hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7E1', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', fontSize: '12px', fontWeight: 'bold' }}
                      labelStyle={{ color: '#647161', marginBottom: '4px' }}
                      formatter={(value: number) => [`${Math.floor(value / 10000)}억 ${(value % 10000).toLocaleString()}만`, '평균가']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#6B8E6B" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: "#6B8E6B", strokeWidth: 2, stroke: "#FEFEFA" }} 
                      activeDot={{ r: 6, fill: "#2C4C3B", stroke: "#FEFEFA" }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-20 w-full flex items-center justify-center text-sm text-[#647161]">시계열 데이터를 수집 중입니다.</div>
            )}
          </div>
        </div>

        {/* Surroundings */}
        <div>
          <h3 className="text-xl font-bold text-[#1A2421] mb-5 font-heading flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-[#A4B494]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            주변 생활 인프라
          </h3>
          
          {property.surroundings && property.surroundings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {property.surroundings.map((surround, idx) => (
                <div key={idx} className="bg-white border border-[#E5E7E1] rounded-2xl p-5 shadow-sm flex flex-col hover:border-[#6B8E6B]/40 transition-colors">
                  <span className="text-xs font-bold text-[#A4B494] bg-[#FBFBF7] px-2.5 py-1 rounded w-fit mb-3">
                    {surround.type}
                  </span>
                  <span className="font-bold text-[#2C4C3B] text-lg mb-2">{surround.name}</span>
                  <span className="text-sm text-[#647161] font-medium flex items-center mt-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    {surround.distance}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#647161] bg-[#FBFBF7] p-5 rounded-2xl border border-[#E5E7E1]">
              주변 인프라 정보를 불러올 수 없습니다.
            </p>
          )}
        </div>

      </div>
    </motion.div>
  );
}
