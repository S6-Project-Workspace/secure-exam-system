import React from "react";

export default function Hero({ onPrimaryClick }) {
  return (
    <section className="bg-gray-100 py-20">
      <div className="container mx-auto px-6 lg:px-24">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-10">
          <div className="w-full lg:w-7/12 text-center lg:text-left space-y-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-gray-900 anim-fade-up">
              Enterprise-Grade Secure
              <br />
              Online Examinations
            </h1>
            <div className="flex justify-center lg:justify-start gap-4 mt-4">
              <button
                onClick={onPrimaryClick}
                className="btn-primary-sm flex items-center gap-2 transform hover:-translate-y-0.5 transition"
              >
                Get Started
              </button>
            </div>
          </div>

          <div className="w-full lg:w-5/12 flex justify-center lg:justify-end">
            <div className="w-80 h-56 bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition duration-500 flex items-center justify-center">
              <svg
                viewBox="0 0 200 120"
                className="w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="200" height="120" rx="12" fill="#0f172a" opacity="0.06" />
                <g transform="translate(28,20)">
                  <rect x="0" y="18" width="144" height="72" rx="8" fill="#ffffff" />
                  <path d="M72 0c9 0 16 7 16 16v8H56v-8C56 7 63 0 72 0z" fill="#0b4b76" opacity="0.9" />
                  <rect x="32" y="44" width="80" height="6" rx="3" fill="#0b4b76" />
                  <rect x="32" y="56" width="48" height="6" rx="3" fill="#0b4b76" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
