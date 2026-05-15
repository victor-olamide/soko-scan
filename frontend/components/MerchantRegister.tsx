"use client";
import { useState } from "react";
const CATEGORIES = ["Food & Drinks","Clothing","Electronics","Services","Groceries","Other"];
export default function MerchantRegister() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [points, setPoints] = useState("10");
  return <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4"><p className="font-semibold text-gray-800">Register your business</p></div>;
}
