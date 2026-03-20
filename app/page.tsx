"use client";

import { useState, useMemo, useEffect, useRef } from "react";

interface Item {
  id: number;
  price: string;
  quantity: string;
}

let counter = 3;

const COMMON_UNITS = ["g", "kg", "mg", "ml", "L", "oz", "lb", "pcs", "servings"];

function LightbulbIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5C17.9 10.2 19 8.7 19 7a7 7 0 1 0-13.4 2.8C6.4 11.4 7 12.2 7 14" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </svg>
  );
}

function ChevronIcon({ up }: { up: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: up ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function formatPPU(ppu: number): string {
  if (ppu === 0) return "0.00";
  if (ppu < 0.001) return ppu.toFixed(5);
  if (ppu < 0.01) return ppu.toFixed(4);
  if (ppu < 1) return ppu.toFixed(3);
  return ppu.toFixed(2);
}

export default function Home() {
  const [tableExpanded, setTableExpanded] = useState(false);
  const [resultsHeight, setResultsHeight] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [focusItemId, setFocusItemId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsMobile(!mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(!e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  const [items, setItems] = useState<Item[]>([
    { id: 1, price: "", quantity: "" },
    { id: 2, price: "", quantity: "" },
  ]);

  const updateItem = (id: number, field: "price" | "quantity", value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => {
    const newId = counter++;
    setItems((prev) => [...prev, { id: newId, price: "", quantity: "" }]);
    setFocusItemId(newId);
  };

  const removeItem = (id: number) => {
    if (items.length <= 2) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const calculated = useMemo(() => {
    return items.map((item, index) => {
      const price = parseFloat(item.price);
      const qty = parseFloat(item.quantity);
      const ppu =
        !isNaN(price) && !isNaN(qty) && qty > 0 && price >= 0
          ? price / qty
          : null;
      return { ...item, ppu, label: `Item ${index + 1}` };
    });
  }, [items]);

  const validItems = calculated.filter((item) => item.ppu !== null);
  const sorted = [...validItems].sort((a, b) => a.ppu! - b.ppu!);
  const showResults = validItems.length >= 2;

  useEffect(() => {
    const el = resultsRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setResultsHeight(entries[0].borderBoxSize[0].blockSize);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [showResults]);

  const cardWidth = 264; // px, fixed card width
  const gap = 12; // gap-3 = 12px
  const itemsGridMaxWidth = items.length * cardWidth + (items.length - 1) * gap;

  return (
    <main className="min-h-screen py-10 md:py-16 px-4" style={{ backgroundColor: "var(--color-paper)", paddingBottom: isMobile ? resultsHeight + 24 : 64 }}>

      {/* Header — fixed width */}
      <div className="max-w-[560px] mx-auto mb-10">
        <h1
          className="text-[2.6rem] leading-none tracking-tight mb-2"
          style={{ fontFamily: "var(--font-fraunces), serif", color: "var(--color-ink)" }}
        >
          Grocery Price Calculator
        </h1>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Compare the true cost across items
        </p>
      </div>

      {/* Item cards — expands to fit items in one row */}
      <div
        className="mx-auto mb-3"
        style={{ maxWidth: `${itemsGridMaxWidth}px` }}
      >
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(auto-fill, ${cardWidth}px)`,
            justifyContent: "center",
          }}
        >
          {calculated.map((item, index) => (
            <div
              key={item.id}
              className="rounded-2xl p-5"
              style={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
              }}
            >
              {/* Card header */}
              <div className="flex items-center justify-between mb-5">
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.12em]"
                  style={{ color: "var(--color-muted)" }}
                >
                  Item {index + 1}
                </span>
                {items.length > 2 && (
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex items-center gap-1 text-xs transition-colors px-2 py-1 rounded-md"
                    style={{ color: "var(--color-faint)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#C0392B")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-faint)")}
                    aria-label="Remove item"
                  >
                    <TrashIcon />
                  </button>
                )}
              </div>

              {/* Price field */}
              <div className="mb-3">
                <label
                  className="block text-[11px] font-medium uppercase tracking-[0.08em] mb-1.5"
                  style={{ color: "var(--color-muted)" }}
                >
                  Price
                </label>
                <div
                  className="flex items-center rounded-xl overflow-hidden transition-all"
                  style={{ border: "1px solid var(--color-border)" }}
                  onFocusCapture={(e) =>
                    (e.currentTarget.style.borderColor = "var(--color-accent)")
                  }
                  onBlurCapture={(e) =>
                    (e.currentTarget.style.borderColor = "var(--color-border)")
                  }
                >
                  <span
                    className="px-3 text-sm select-none"
                    style={{
                      color: "var(--color-muted)",
                      backgroundColor: "var(--color-paper)",
                      borderRight: "1px solid var(--color-border)",
                      paddingTop: "10px",
                      paddingBottom: "10px",
                    }}
                  >
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    onWheel={(e) => e.currentTarget.blur()}
                    value={item.price}
                    onChange={(e) => updateItem(item.id, "price", e.target.value)}
                    placeholder="0.00"
                    ref={(el) => { if (el && item.id === focusItemId) { el.focus(); setFocusItemId(null); } }}
                    className="flex-1 px-3 py-[10px] text-base outline-none bg-white"
                    style={{
                      fontFamily: "var(--font-dm-mono), monospace",
                      color: "var(--color-ink)",
                    }}
                  />
                </div>
              </div>

              {/* Quantity field */}
              <div className="mb-5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <label
                    className="text-[11px] font-medium uppercase tracking-[0.08em]"
                    style={{ color: "var(--color-muted)" }}
                  >
                    Quantity
                  </label>
                  <div className="tooltip-wrap relative flex items-center">
                    <button
                      className="flex items-center justify-center transition-colors"
                      style={{ color: "var(--color-faint)" }}
                      aria-label="Common units hint"
                      tabIndex={-1}
                    >
                      <LightbulbIcon />
                    </button>
                    <div
                      className="tooltip-box absolute bottom-full left-1/2 mb-2 z-10 rounded-xl shadow-lg px-3 py-2.5 min-w-[160px]"
                      style={{
                        backgroundColor: "var(--color-ink)",
                        transform: "translateX(-50%)",
                      }}
                    >
                      <p
                        className="text-[10px] uppercase tracking-wider mb-2"
                        style={{ color: "var(--color-muted)" }}
                      >
                        Common units
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {COMMON_UNITS.map((u) => (
                          <span
                            key={u}
                            className="text-xs"
                            style={{ color: "#E8E6E0", fontFamily: "var(--font-dm-mono), monospace" }}
                          >
                            {u}
                          </span>
                        ))}
                      </div>
                      {/* Arrow */}
                      <div
                        className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                        style={{
                          borderLeft: "5px solid transparent",
                          borderRight: "5px solid transparent",
                          borderTop: "5px solid var(--color-ink)",
                        }}
                      />
                    </div>
                  </div>
                </div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  onWheel={(e) => e.currentTarget.blur()}
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl px-3 py-[10px] text-base outline-none transition-all"
                  style={{
                    fontFamily: "var(--font-dm-mono), monospace",
                    color: "var(--color-ink)",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-card)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
                />
              </div>

              {/* Price per unit result */}
              <div
                className="rounded-xl px-4 py-3"
                style={{ backgroundColor: "var(--color-paper)" }}
              >
                {item.ppu !== null ? (
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px]" style={{ color: "var(--color-muted)" }}>
                      per unit
                    </span>
                    <span
                      className="text-lg font-medium"
                      style={{
                        fontFamily: "var(--font-fraunces), serif",
                        color: "var(--color-accent)",
                      }}
                    >
                      ${formatPPU(item.ppu)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px]" style={{ color: "var(--color-muted)" }}>
                      per unit
                    </span>
                    <span
                      className="text-lg"
                      style={{
                        fontFamily: "var(--font-fraunces), serif",
                        color: "var(--color-faint)",
                      }}
                    >
                      —
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add item / Reset row — fixed width */}
      <div className="max-w-[560px] mx-auto flex items-center gap-3 mb-8">
        <button
          onClick={addItem}
          className="flex-1 py-3 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all"
          style={{
            border: "1.5px dashed var(--color-border)",
            color: "var(--color-muted)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--color-accent)";
            e.currentTarget.style.color = "var(--color-accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border)";
            e.currentTarget.style.color = "var(--color-muted)";
          }}
        >
          <PlusIcon />
          Add item
        </button>
        <button
          onClick={() => {
            counter = 3;
            setItems([
              { id: 1, price: "", quantity: "" },
              { id: 2, price: "", quantity: "" },
            ]);
          }}
          className="text-sm px-4 py-3 transition-colors"
          style={{ color: "var(--color-faint)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-muted)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-faint)")}
        >
          Reset
        </button>
      </div>

      {/* Results */}
      {showResults && (
      <div
        ref={resultsRef}
        className={isMobile ? "fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3" : "max-w-[560px] mx-auto mt-4"}
        style={isMobile ? { backgroundColor: "var(--color-paper)" } : {}}
      >
        <div className={isMobile ? "max-w-[560px] mx-auto" : ""}>
          <div
            key={sorted.map((i) => i.id).join("-")}
            className="result-reveal rounded-2xl p-5"
            style={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
              boxShadow: isMobile ? "0 -4px 24px rgba(0,0,0,0.06)" : "none",
            }}
          >
            <p
              className={`text-[10px] font-semibold uppercase tracking-[0.12em] mb-4 ${isMobile ? "hidden" : "block"}`}
              style={{ color: "var(--color-muted)" }}
            >
              Result
            </p>

            {sorted.length === 2 ? (
              /* Two-item comparison */
              <div>
                <p
                  className="text-2xl tracking-tight mb-1"
                  style={{
                    fontFamily: "var(--font-fraunces), serif",
                    color: "var(--color-ink)",
                  }}
                >
                  {Math.abs(sorted[0].ppu! - sorted[1].ppu!) < 1e-10 ? "It's a tie!" : `${sorted[0].label} is cheaper`}
                </p>
                {Math.abs(sorted[0].ppu! - sorted[1].ppu!) < 1e-10 ? (
                  <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                    Both items cost exactly the same per unit. Either one is a great pick!
                  </p>
                ) : (
                  <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                    {sorted[0].label} is{" "}
                    <span style={{ color: "var(--color-accent)", fontWeight: 600 }}>
                      {(
                        ((sorted[1].ppu! - sorted[0].ppu!) / sorted[1].ppu!) *
                        100
                      ).toFixed(1)}
                      % cheaper
                    </span>{" "}
                    than {sorted[1].label}
                  </p>
                )}
              </div>
            ) : (
              /* Multi-item ranked table — collapsible */
              <div>
                <button
                  onClick={() => setTableExpanded((v) => !v)}
                  className="w-full flex items-center justify-between"
                >
                  <p
                    className="text-2xl tracking-tight"
                    style={{ fontFamily: "var(--font-fraunces), serif", color: "var(--color-ink)" }}
                  >
                    {sorted[0].label} is cheapest
                  </p>
                  <span style={{ color: "var(--color-muted)" }}>
                    <ChevronIcon up={tableExpanded} />
                  </span>
                </button>
                {tableExpanded && (
                  <table className="w-full mt-4">
                    <thead>
                      <tr>
                        <th className="text-left pb-2.5 text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: "var(--color-muted)" }}>Rank</th>
                        <th className="text-left pb-2.5 text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: "var(--color-muted)" }}>Item</th>
                        <th className="text-right pb-2.5 text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: "var(--color-muted)" }}>Per unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((item, index) => (
                        <tr key={item.id} style={{ borderTop: "1px solid var(--color-border-light)" }}>
                          <td className="py-3 text-sm w-12" style={{ color: index === 0 ? "var(--color-accent)" : "var(--color-muted)" }}>#{index + 1}</td>
                          <td className="py-3 text-sm" style={{ color: "var(--color-ink)", fontWeight: index === 0 ? 500 : 400 }}>{item.label}</td>
                          <td className="py-3 text-sm text-right" style={{ fontFamily: "var(--font-dm-mono), monospace", color: index === 0 ? "var(--color-accent)" : "var(--color-ink)", fontWeight: index === 0 ? 500 : 400 }}>${formatPPU(item.ppu!)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      )}
    </main>
  );
}
