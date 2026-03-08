"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FieldError, FieldLabel, FormInput } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import DestinationAutocomplete from "./DestinationAutocomplete";
import TripPreviewCard from "./TripPreviewCard";

function todayLocalStr() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

interface FormErrors {
  destination?: string;
  start_date?: string;
  end_date?: string;
  traveler_count?: string;
  form?: string;
}

export default function TripForm() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelerCount, setTravelerCount] = useState(1);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const today = todayLocalStr();

  function validate(): FormErrors {
    const errs: FormErrors = {};

    if (!destination.trim()) errs.destination = "Destination is required";

    if (!startDate) {
      errs.start_date = "Start date is required";
    } else if (startDate < today) {
      errs.start_date = "Start date cannot be in the past";
    }

    if (!endDate) {
      errs.end_date = "End date is required";
    } else if (startDate && endDate < startDate) {
      errs.end_date = "End date must be on or after start date";
    } else if (startDate && endDate) {
      const diffDays = Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      if (diffDays > 13) errs.end_date = "Trip must be 14 days or shorter";
    }

    if (travelerCount < 1) errs.traveler_count = "At least 1 traveler required";

    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setSubmitting(true);

    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destination: destination.trim(),
        country_code: countryCode || null,
        title: title.trim() || null,
        start_date: startDate,
        end_date: endDate,
        traveler_count: travelerCount,
        budget_total: null,
        currency: "USD",
        visibility: "private",
        flights: {},
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setErrors({
        form: data.error ?? "Something went wrong. Please try again.",
      });
      setSubmitting(false);
      return;
    }

    const { trip } = await res.json();
    router.push(`/trips/${trip.id}`);
  }

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* Left: form column */}
      <div className="flex-1 overflow-y-auto px-8 py-10 md:w-1/2 md:flex-none">
        <div className="mx-auto max-w-md">
          <div className="mb-8">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--text)]">
              Plan a new trip
            </h1>
            <p className="mt-1 text-sm text-[var(--text-2)]">
              Add flights, stays, and more after you create it.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <FieldLabel required>Destination</FieldLabel>
              <DestinationAutocomplete
                value={destination}
                onChange={(val, cc) => {
                  setDestination(val);
                  setCountryCode(cc);
                }}
                error={errors.destination}
              />
              <FieldError message={errors.destination} />
            </div>

            <div>
              <FieldLabel optionalHint="optional">Trip name</FieldLabel>
              <FormInput
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cherry Blossom Trip"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Start date</FieldLabel>
                <FormInput
                  type="date"
                  value={startDate}
                  min={today}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (endDate && endDate < e.target.value) setEndDate("");
                  }}
                />
                <FieldError message={errors.start_date} />
              </div>
              <div>
                <FieldLabel required>End date</FieldLabel>
                <FormInput
                  type="date"
                  value={endDate}
                  min={startDate || today}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <FieldError message={errors.end_date} />
              </div>
            </div>

            <div>
              <FieldLabel required>Travelers</FieldLabel>
              <FormInput
                type="number"
                min={1}
                max={20}
                value={travelerCount}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v)) setTravelerCount(Math.max(1, Math.min(20, v)));
                }}
                className="w-28"
              />
              <FieldError message={errors.traveler_count} />
            </div>

            {errors.form && (
              <p className="text-sm text-[var(--error)]">{errors.form}</p>
            )}

            <Button
              type="submit"
              disabled={submitting}
              size="lg"
              className="w-full"
            >
              {submitting ? "Creating trip..." : "Create trip →"}
            </Button>
          </form>
        </div>
      </div>

      {/* Right: live preview column — desktop only */}
      <div
        className="hidden bg-[var(--bg-subtle)] md:flex md:w-1/2 md:flex-none md:items-start md:justify-center md:pt-10"
      >
        <TripPreviewCard
          destination={destination}
          title={title}
          startDate={startDate}
          endDate={endDate}
          travelerCount={travelerCount}
        />
      </div>
    </div>
  );
}
