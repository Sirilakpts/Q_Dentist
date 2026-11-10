'use client';

import React from 'react';
import Link from 'next/link';
import { DentalService } from '@/types/booking';
import { Badge } from '@/components/ui/Badge';
import {
  Clock,
  Check,
  Sparkles,
  Calendar,
  Smile,
  ShieldCheck,
  Activity,
  ArrowRight
} from 'lucide-react';

interface ServiceCardProps {
  service: DentalService;
  isSelected?: boolean;
  onSelect?: (service: DentalService) => void;
  showSelectButton?: boolean;
  actionHref?: string;
  actionLabel?: string;
  showPreparation?: boolean;
}

function getServiceIcon(id: string) {
  switch (id) {
    case 'checkup':
      return <Smile className="w-6 h-6 text-[#063466]" />;
    case 'scaling':
      return <Sparkles className="w-6 h-6 text-[#063466]" />;
    case 'filling':
      return <ShieldCheck className="w-6 h-6 text-[#063466]" />;
    case 'extraction':
      return <Activity className="w-6 h-6 text-[#063466]" />;
    default:
      return <Calendar className="w-6 h-6 text-[#063466]" />;
  }
}

export function ServiceCard({
  service,
  isSelected = false,
  onSelect,
  showSelectButton = true,
  actionHref,
  actionLabel,
  showPreparation = false,
}: ServiceCardProps) {
  // If actionHref is provided (e.g. Home Page Compact Card), the ENTIRE card is clickable
  if (actionHref) {
    return (
      <Link
        href={actionHref}
        className="group relative h-full rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 text-left flex flex-col justify-between transition-all duration-200 hover:border-[#063466] hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#063466] focus-visible:ring-offset-2"
        aria-label={`จองคิวบริการ ${service.name}`}
      >
        <div className="space-y-3">
          {/* Header Row: Icon in Soft Mint & Category Tag */}
          <div className="flex items-center justify-between gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#E9F4F1] border border-[#C8E5DD] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
              {getServiceIcon(service.id)}
            </div>
            {service.badge ? (
              <Badge variant="warning" className="bg-amber-50 text-amber-900 border-amber-200 font-semibold text-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#D5A423] shrink-0" />
                {service.badge}
              </Badge>
            ) : (
              <span className="text-xs font-semibold text-[#063466] bg-[#063466]/10 px-2.5 py-0.5 rounded-full">
                {service.category}
              </span>
            )}
          </div>

          {/* Service Title */}
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#063466] transition-colors leading-snug">
            {service.name}
          </h3>

          {/* Short Concise Description */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
            {service.description}
          </p>
        </div>

        {/* Bottom Bar: Duration & Interactive Prompt (No redundant button) */}
        <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm">
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
            <Clock className="w-4 h-4 text-[#D5A423] shrink-0" />
            <span>ประมาณ {service.durationMinutes} นาที</span>
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-[#063466] group-hover:translate-x-1 transition-transform duration-200">
            <span>{actionLabel || 'จองคิวบริการนี้'}</span>
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </Link>
    );
  }

  // Selectable Card variant (Used in Booking Wizard)
  return (
    <div
      onClick={() => onSelect && onSelect(service)}
      className={`h-full rounded-2xl border bg-white p-5 sm:p-6 text-left flex flex-col justify-between transition-colors ${
        onSelect ? 'cursor-pointer hover:border-[#063466]/50' : 'border-slate-200'
      } ${
        isSelected
          ? 'border-[#063466] ring-2 ring-[#063466]/20 bg-slate-50'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="space-y-3">
        {/* Header row: Icon, Category & Service Name */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E9F4F1] border border-[#C8E5DD] flex items-center justify-center shrink-0 mt-0.5">
              {getServiceIcon(service.id)}
            </div>
            <div>
              <span className="inline-block text-xs font-semibold text-[#063466] bg-[#063466]/10 px-2.5 py-0.5 rounded-md mb-1">
                {service.category}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {service.name}
              </h3>
            </div>
          </div>
          {isSelected && (
            <div className="w-6 h-6 rounded-full bg-[#063466] text-[#D5A423] flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
          )}
        </div>

        {/* Short & Clear Description */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {service.description}
        </p>

        {/* Duration Indicator */}
        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-700 pt-2 border-t border-slate-100">
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
            <Clock className="w-4 h-4 text-[#D5A423] shrink-0 icon-interactive icon-rotate-subtle" />
            ระยะเวลาบริการ: ประมาณ {service.durationMinutes} นาที
          </span>
          {service.badge && (
            <Badge variant="warning" className="gap-1 bg-amber-50 text-amber-900 border-amber-200 font-medium text-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#D5A423] shrink-0 icon-interactive icon-scale" />
              {service.badge}
            </Badge>
          )}
        </div>

        {/* Preparation guideline: Only rendered in Booking Wizard */}
        {showPreparation && service.preparation && service.preparation.length > 0 && (
          <div className="bg-slate-50 rounded-xl p-3.5 text-slate-700 border border-slate-200/80 space-y-1">
            <span className="font-bold text-slate-900 block text-xs sm:text-sm">
              การเตรียมตัวก่อนรับบริการ:
            </span>
            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {service.preparation.map((prep, idx) => (
                <li key={idx}>{prep}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Select button for wizard */}
      {showSelectButton && onSelect && (
        <div className="pt-4 mt-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(service);
            }}
            className={`group w-full min-h-[48px] px-4 rounded-xl text-sm sm:text-base font-semibold transition-colors flex items-center justify-center gap-2 ${
              isSelected
                ? 'bg-[#063466] text-[#D5A423]'
                : 'bg-[#063466] hover:bg-[#042345] text-white'
            }`}
          >
            {isSelected ? (
              <>
                <Check className="w-5 h-5 stroke-[3] icon-interactive icon-scale" />
                <span>เลือกบริการนี้แล้ว ✓</span>
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5 shrink-0 text-[#D5A423] icon-interactive icon-tilt" />
                <span>เลือกบริการนี้</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
