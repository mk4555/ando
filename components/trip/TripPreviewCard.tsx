"use client";

import { useState, useEffect } from "react";
import { getDestinationImage } from "@/lib/destination-images";
import { formatTripDateRange } from "@/lib/date";

interface Props {
  destination: string;
  title: string;
  startDate: string;
  endDate: string;
  travelerCount: number;
}

export default function TripPreviewCard({
  destination,
  title,
  startDate,
  endDate,
  travelerCount,
}: Props) {
  const imageUrl = getDestinationImage(destination);
  const hasDestination = destination.trim().length > 0;
  const hasDates = !!(startDate && endDate);
  const dateLabel = hasDates
    ? formatTripDateRange(startDate, endDate)
    : "Add dates";
  const travelerLabel = `${travelerCount} ${travelerCount === 1 ? "traveler" : "travelers"}`;

  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    setImageLoading(true);
  }, [imageUrl]);

  return (
    <div
      className="relative overflow-hidden rounded-2xl shadow-[var(--shadow-lg)]"
      style={{ width: "clamp(280px, 30vw, 340px)", aspectRatio: "3 / 4" }}
    >
      {/* Top 60%: destination photo zone */}
      <div className="absolute inset-x-0 top-0" style={{ height: "60%" }}>
        {/* Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-subtle)]">
          {!hasDestination && (
            <svg
              className="h-10 w-10 text-[var(--text-3)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          )}
        </div>

        {hasDestination && (
          <img
            src={imageUrl}
            alt={destination}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              imageLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={() => setImageLoading(false)}
          />
        )}

        {/* Dark scrim — transparent top, strong bottom so text reads */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/70" />

        {/* Destination name — bottom-left of image zone */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="font-display text-[22px] font-semibold leading-tight text-white drop-shadow-sm">
            {hasDestination ? (
              destination
            ) : (
              <span className="italic text-white/30">Your destination</span>
            )}
          </p>
        </div>
      </div>

      {/* Bottom 40%: card body */}
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col justify-between bg-[var(--bg-card)] px-4 py-4"
        style={{ top: "60%" }}
      >
        <div className="space-y-2.5">
          {/* Date row */}
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 shrink-0 text-[var(--accent)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span
              className={`text-sm font-medium ${
                hasDates ? "text-[var(--text)]" : "text-[var(--text-3)]"
              }`}
            >
              {dateLabel}
            </span>
          </div>

          {/* Traveler row */}
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 shrink-0 text-[var(--accent)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-sm font-medium text-[var(--text)]">
              {travelerLabel}
            </span>
          </div>
        </div>

        <div>
          <div className="mb-3 border-t border-[var(--border)]" />
          <div className="flex items-center justify-between gap-2">
            <span className="shrink-0 rounded-full bg-[var(--accent-s)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
              AI Itinerary
            </span>
            {title && (
              <p className="min-w-0 truncate text-xs text-[var(--text-3)]">
                {title}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
