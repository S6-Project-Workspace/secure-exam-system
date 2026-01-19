import React from "react";

export default function FeatureCard({ icon, title, children }) {
  return (
    <div className="bg-white rounded-lg shadow p-8 min-h-[180px] flex flex-col">
      <div className="text-blue-700 text-5xl mb-4 font-extrabold">{icon}</div>
      <h3 className="font-semibold text-2xl mb-3">{title}</h3>
      <p className="text-gray-700 text-base mt-auto leading-relaxed">{children}</p>
    </div>
  );
}
