import React, { useState, useMemo } from "react";
import {
  TopSearchWithActionsLight,
  FeesOrSalaryCharts,
  ListHeader,
  AmountsTable,
  Pagination,
} from "./shared";

const FeesDetailsPage = () => {
  const [mode, setMode] = useState("today");
  const [search, setSearch] = useState("");

  const baseRows = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => ({
        id: i + 1,
        name: `Students Name ${i + 1}`,
        batch: "01",
        total: mode === "today" ? "5,000" : "50,000",
        paid: mode === "today" ? "3,000" : "30,000",
        pending: mode === "today" ? "2,000" : "20,000",
      })),
    [mode]
  );

  const filteredRows = useMemo(
    () =>
      baseRows.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase())
      ),
    [baseRows, search]
  );

  return (
    <div className="h-full bg-white text-black p-6 rounded-lg">
      <TopSearchWithActionsLight search={search} setSearch={setSearch} />

      <div className="flex items-center justify-between mb-2">
        <FeesOrSalaryCharts
          totalLabel="Total Fees Amount"
          paidLabel="Total Fees Paid"
          pendingLabel="Total Fees Pending"
          peopleLabel="Total Students"
        />
      </div>

      <div className="flex items-center justify-between mb-2">
        <ListHeader title="List of Collection" />
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => setMode("today")}
            className={
              "px-3 py-1 rounded-full border " +
              (mode === "today"
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-gray-700 border-gray-300")
            }
          >
            Today
          </button>
          <button
            onClick={() => setMode("month")}
            className={
              "px-3 py-1 rounded-full border " +
              (mode === "month"
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-gray-700 border-gray-300")
            }
          >
            This Month
          </button>
        </div>
      </div>

      <AmountsTable rows={filteredRows} firstColLabel="Students Name" />

      <Pagination />
    </div>
  );
};

export default FeesDetailsPage;
