"use client";

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="px-3 py-1 border rounded">Imprimer</button>
  );
}


