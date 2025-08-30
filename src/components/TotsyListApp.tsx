"use client";
import { useEffect, useMemo, useState, FormEvent } from "react";
import { suggestProducts, Product } from "../lib/suggest";

type Status = "None" | "Ordered" | "Purchased" | "Received";
type Picked = Product & { status: Status; selected?: boolean };

export default function TotsyListApp() {
  // -------- state
  const [location, setLocation] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [termsRaw, setTermsRaw] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [picks, setPicks] = useState<Picked[]>([]);
  const [coOwners, setCoOwners] = useState<string[]>([]);

  // -------- data
  const suggestions = useMemo(() => {
    const terms = termsRaw
      .split(/[,\n]/g)
      .map((s) => s.trim())
      .filter(Boolean);
    return suggestProducts({ location, dueDate, terms });
  }, [location, dueDate, termsRaw]);

  const top2 = suggestions.slice(0, 2);
  const more = suggestions.slice(2);

  // -------- effects
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const data = q.get("data");
    if (!data) return;
    try {
      const parsed = JSON.parse(decodeURIComponent(data));
      if (parsed?.picks) setPicks(parsed.picks);
      if (parsed?.coOwners) setCoOwners(parsed.coOwners);
      if (parsed?.location) setLocation(parsed.location);
      if (parsed?.dueDate) setDueDate(parsed.dueDate);
      if (parsed?.termsRaw) setTermsRaw(parsed.termsRaw);
    } catch {}
  }, []);

  // -------- actions
  function addPick(p: Product) {
    setPicks((prev) => (prev.some((x) => x.id === p.id) ? prev : [...prev, { ...p, status: "None" }]));
  }
  function setStatus(id: string, status: Status) {
    setPicks((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  }
  function removePick(id: string) {
    setPicks((prev) => prev.filter((p) => p.id !== id));
  }
  function toggleSelected(id: string) {
    setPicks((prev) => prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p)));
  }
  function addCoOwner(email: string) {
    const e = email.trim();
    if (!e) return;
    setCoOwners((prev) => (prev.includes(e) ? prev : [...prev, e]));
  }
  function share(mode: "voting" | "registry") {
    const payload =
      mode === "voting"
        ? { picks: picks.filter((p) => p.selected), coOwners, location, dueDate, termsRaw, mode }
        : { picks, coOwners, location, dueDate, termsRaw, mode };
    const url = `${window.location.origin}${window.location.pathname}?data=${encodeURIComponent(
      JSON.stringify(payload)
    )}`;
    navigator.clipboard.writeText(url);
    alert(`${mode === "voting" ? "Voting" : "Registry"} link copied!`);
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <header className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow">
        <h1 className="text-2xl font-semibold">TotsyList</h1>
        <p className="mt-1 text-blue-100">Location‑aware suggestions • Top picks • Voting • Registry • Statuses • Co‑owners</p>
      </header>

      {/* Inputs */}
      <section className="mt-6 rounded-xl bg-white p-5 shadow">
        <h2 className="text-lg font-semibold">Your details</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <LabeledInput label="Location" placeholder="Seattle, WA" value={location} onChange={setLocation} />
          <LabeledInput type="date" label="Due date" value={dueDate} onChange={setDueDate} />
          <LabeledInput
            label="Preferences"
            placeholder="lightweight, compact, under $400"
            value={termsRaw}
            onChange={setTermsRaw}
          />
        </div>
      </section>

      {/* Suggestions */}
      <section className="mt-6 rounded-xl bg-white p-5 shadow">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Suggested products</h2>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-sm font-medium text-blue-700 hover:underline"
          >
            {expanded ? "Hide more" : "Show more"}
          </button>
        </div>

        {/* Top 2 */}
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
              TOP 2
            </span>
            <span className="text-xs text-gray-500">Best matches for your inputs</span>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {top2.map((p) => (
              <ProductCard key={p.id} product={p} cta="Select" onSelect={() => addPick(p)} highlight />
            ))}
          </ul>
        </div>

        {/* More */}
        {expanded && (
          <>
            <div className="mt-6 h-px w-full bg-gray-100" />
            <h3 className="mt-6 text-sm font-medium text-gray-600">More options</h3>
            <ul className="mt-2 grid gap-3 sm:grid-cols-2">
              {more.map((p) => (
                <ProductCard key={p.id} product={p} cta="Select" onSelect={() => addPick(p)} />
              ))}
            </ul>
          </>
        )}
      </section>

      {/* Picks */}
      <section className="mt-6 rounded-xl bg-white p-5 shadow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Your list</h2>
          <div className="flex gap-2">
            <ActionButton variant="amber" onClick={() => share("voting")}>
              Send for voting
            </ActionButton>
            <ActionButton variant="green" onClick={() => share("registry")}>
              Translate to registry
            </ActionButton>
          </div>
        </div>

        {/* Co‑owners */}
        <div className="mt-4">
          <div className="text-sm text-gray-600">Co‑owners</div>
          <CoOwnerAdder onAdd={addCoOwner} />
          {coOwners.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {coOwners.map((e) => (
                <span
                  key={e}
                  className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                >
                  {e}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Items */}
        <ul className="mt-4 space-y-3">
          {picks.map((p) => (
            <li key={p.id} className="rounded-lg border p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-500">
                    {p.brand} • {p.category} • ${p.price}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-xs">
                    <input
                      type="checkbox"
                      checked={!!p.selected}
                      onChange={() => toggleSelected(p.id)}
                      className="mr-1 align-middle"
                    />
                    include in vote
                  </label>

                  <select
                    value={p.status}
                    onChange={(e) => setStatus(p.id, e.target.value as Status)}
                    className="rounded border px-2 py-1 text-xs"
                  >
                    <option>None</option>
                    <option>Ordered</option>
                    <option>Purchased</option>
                    <option>Received</option>
                  </select>

                  <button onClick={() => removePick(p.id)} className="text-xs font-medium text-red-600">
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
          {picks.length === 0 && (
            <li className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
              No items yet — choose from “Suggested products”.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}

/* ---------- small UI helpers (no libs) ---------- */

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring"
      />
    </label>
  );
}

function ProductCard({
  product,
  onSelect,
  cta = "Select",
  highlight = false,
}: {
  product: Product;
  onSelect: () => void;
  cta?: string;
  highlight?: boolean;
}) {
  return (
    <li
      className={`rounded-xl border p-4 transition ${
        highlight ? "border-blue-200 bg-blue-50/40" : "border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold">{product.name}</div>
          <div className="text-xs text-gray-500">
            {product.brand} • {product.category}
          </div>
          <div className="mt-1 text-xs text-gray-600">${product.price} • score {product.score}</div>
        </div>
        <button
          onClick={onSelect}
          className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
        >
          {cta}
        </button>
      </div>
    </li>
  );
}

function ActionButton({
  children,
  variant,
  onClick,
}: {
  children: React.ReactNode;
  variant: "amber" | "green";
  onClick: () => void;
}) {
  const base = "rounded-lg px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:opacity-90";
  const color = variant === "amber" ? "bg-amber-500" : "bg-green-600";
  return (
    <button onClick={onClick} className={`${base} ${color}`}>
      {children}
    </button>
  );
}

function CoOwnerAdder({ onAdd }: { onAdd: (email: string) => void }) {
  const [email, setEmail] = useState("");
  function submit(e: FormEvent) {
    e.preventDefault();
    onAdd(email);
    setEmail("");
  }
  return (
    <form onSubmit={submit} className="mt-2 flex gap-2">
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Add co‑owner by email"
        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring"
      />
      <button className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white">Add</button>
    </form>
  );
}