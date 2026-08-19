"use client";

import React, { useState } from "react";
import { RequestsTable } from "./RequestsTable";
import { RequestDetails } from "./RequestDetails";

export const RequestsView: React.FC = () => {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-brand-primary border-b border-brand-primary/15 pb-3">
        Request History
      </h1>

      {selectedRequestId ? (
        <RequestDetails
          requestId={selectedRequestId}
          onBack={() => setSelectedRequestId(null)}
        />
      ) : (
        <RequestsTable onRowClick={(id) => setSelectedRequestId(id)} />
      )}
    </div>
  );
};

