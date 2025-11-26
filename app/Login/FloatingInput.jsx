"use client";

export default function FloatingInput({ label, type, name }) {
  return (
    <div className="relative">
      <input
        type={type}
        name={name}
        id={name}
        required
        className="peer w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 pt-5 pb-2 text-white focus:outline-none focus:ring-2 focus:ring-neutral-600 placeholder-transparent"
        placeholder={label}
      />
      <label
        htmlFor={name}
        className="absolute left-4 top-3.5 text-neutral-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-neutral-500 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-300 peer-valid:top-1 peer-valid:text-xs peer-valid:text-gray-300"
      >
        {label}
      </label>
    </div>
  );
}
