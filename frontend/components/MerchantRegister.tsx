"use client";
import { useState } from "react";
const CATEGORIES = ["Food & Drinks","Clothing","Electronics","Services","Groceries","Other"];
export default function MerchantRegister() {
  const [name,setName]=useState("");
  const [category,setCategory]=useState(CATEGORIES[0]);
  const [points,setPoints]=useState("10");
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
      <p className="font-semibold text-gray-800">Register your business</p>
      <div><label className="block text-xs font-medium text-gray-600 mb-1">Business name</label>
        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="e.g. Mama Amara's Kitchen" className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
      <div><label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
        <select value={category} onChange={(e)=>setCategory(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
          {CATEGORIES.map((cat)=><option key={cat}>{cat}</option>)}
        </select></div>
      <div><label className="block text-xs font-medium text-gray-600 mb-1">Points per cUSD spent</label>
        <input value={points} onChange={(e)=>setPoints(e.target.value)} type="number" min="1" max="100" className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        <p className="text-xs text-gray-400 mt-1">Customer earns {points} SokoPoints per 1 cUSD paid to you.</p></div>
    </div>
  );
}
