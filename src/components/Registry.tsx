"use client";
import { useEffect, useState, FormEvent } from "react";

type Item = {
  id: string;
  name: string;
  votes: number;
};

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
}

export default function Registry() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");

  // Load from URL (?data=...) or localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get("data");
    if (data) {
      try {
        const parsed = JSON.parse(decodeURIComponent(data));
        if (Array.isArray(parsed.items)) {
          setItems(parsed.items);
          localStorage.setItem("totsylist-registry", JSON.stringify(parsed.items));
          return;
        }
      } catch {}
    }
    const stored = localStorage.getItem("totsylist-registry");
    if (stored) setItems(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("totsylist-registry", JSON.stringify(items));
  }, [items]);

  function addItem(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setItems([{ id: uid(), name: name.trim(), votes: 0 }, ...items]);
    setName("");
  }

  function vote(id: string, delta: number) {
    setItems(prev => prev
      .map(it => it.id === id ? { ...it, votes: it.votes + delta } : it)
      .sort((a,b)=> b.votes - a.votes)
    );
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(it => it.id !== id));
  }

  function share() {
    const payload = { items };
    const encoded = encodeURIComponent(JSON.stringify(payload));
    const url = `${location.origin}${location.pathname}?data=${encoded}`;
    navigator.clipboard.writeText(url).then(() => alert("Share link copied!"));
  }

  return (
    <div className="mt-6">
      <form onSubmit={addItem} className="flex gap-2">
        <input
          value={name}
          onChange={(e)=>setName(e.target.value)}
          placeholder="Add item, e.g. convertible stroller"
          className="flex-1 rounded border px-3 py-2"
        />
        <button className="rounded bg-blue-600 px-4 py-2 text-white">Add</button>
      </form>

      <div className="mt-3 flex gap-2">
        <button onClick={share} className="rounded bg-green-500 px-3 py-1 text-white">Copy share link</button>
        <button
          onClick={() => { localStorage.removeItem("totsylist-registry"); setItems([]); }}
          className="rounded bg-red-100 px-3 py-1 text-red-700"
        >
          Clear
        </button>
      </div>

      <ul className="mt-4 space-y-2">
        {items.map(it => (
          <li key={it.id} className="flex items-center justify-between rounded border p-3">
            <div>
              <div className="font-medium">{it.name}</div>
              <div className="text-sm text-gray-500">Votes: {it.votes}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>vote(it.id,1)} className="rounded bg-gray-100 px-2 py-1">👍</button>
              <button onClick={()=>vote(it.id,-1)} className="rounded bg-gray-100 px-2 py-1">👎</button>
              <button onClick={()=>removeItem(it.id)} className="text-sm text-red-600">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}