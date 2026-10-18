import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  BarChart3, Landmark, Plus, X,
  ChevronLeft, ChevronRight, Check, Search, Trash2,
  Pencil, ArrowRight, Calendar, FileText, ChevronDown,
  LayoutGrid, DollarSign, Coins, Eye, EyeOff, Download, Upload, Palette,
  ArrowDownLeft, ArrowUpRight, Delete, MoreHorizontal, ChevronUp, GripHorizontal, User, LogOut, RefreshCw,
} from "lucide-react";
import {
  SquaresFour, Receipt as ReceiptIcon, ChartPie, Wallet as WalletIcon, Bank,
  InstagramLogo,
} from "@phosphor-icons/react";
import { createClient } from "@supabase/supabase-js";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";

/* ================================ palette ================================ */

/* Two palettes with identical keys, so every component reads the same token
   names regardless of mode. `primary` is the high-contrast button fill:
   near-white on dark, near-black on light. */
const PALETTES = {
  dark: {
    bgTop: "#1E2E38",
    bgBot: "#0B0E10",
    surface: "#1A2124",
    surface2: "#232B2E",
    surface3: "#2C3538",
    border: "#2E3739",
    text: "#F0F2F1",
    text2: "#9AA4A8",
    text3: "#6B7477",
    mint: "#4ECBA5",
    expense: "#F07A63",
    income: "#4ECBA5",
    mintSoft: "rgba(78,203,165,0.16)",
    expenseSoft: "rgba(240,122,99,0.16)",
    primary: "#EDEFEE",
    onPrimary: "#0E1214",
    selectedWash: "rgba(237,239,238,0.08)",
    barOn: "rgba(240,242,241,0.82)",
    barOff: "rgba(240,242,241,0.05)",
    overlay: "rgba(0,0,0,0.6)",
    sheetShadow: "0 -10px 40px rgba(0,0,0,0.6)",
    fabShadow: "0 8px 26px rgba(0,0,0,0.55)",
    navBg: "rgba(28,34,37,0.86)",
    navShadow: "0 8px 30px rgba(0,0,0,0.5)",
    gradFrom: "#3E7C8C",
    heroBg: "#4ECBA5",
    heroText: "#0E1214",
    heroMuted: "rgba(14,18,20,0.62)",
    heroLine: "rgba(14,18,20,0.16)",
    fabTop: "#FFFFFF",
    fabBottom: "#C7CCCA",
    fabSheen: "rgba(255,255,255,0.95)",
    fabInner: "rgba(0,0,0,0.14)",
    sheetTop: "#27343A",
    errBg: "#3A2420",
    errBorder: "#6B3D35",
    errText: "#F0A897",
  },
  light: {
    bgTop: "#DCE6EA",
    bgBot: "#F4F6F7",
    surface: "#FFFFFF",
    surface2: "#EDF0F2",
    surface3: "#DFE5E8",
    border: "#DDE3E6",
    text: "#101619",
    text2: "#4C575B",
    text3: "#788388",
    mint: "#0A7C5C",
    expense: "#C2452B",
    income: "#0A7C5C",
    mintSoft: "rgba(10,124,92,0.13)",
    expenseSoft: "rgba(194,69,43,0.13)",
    primary: "#141B1E",
    onPrimary: "#FFFFFF",
    selectedWash: "rgba(20,27,30,0.07)",
    barOn: "rgba(16,22,25,0.78)",
    barOff: "rgba(16,22,25,0.08)",
    overlay: "rgba(12,18,20,0.45)",
    sheetShadow: "0 -10px 40px rgba(20,30,35,0.22)",
    fabShadow: "0 8px 24px rgba(20,30,35,0.24)",
    navBg: "rgba(255,255,255,0.88)",
    navShadow: "0 8px 26px rgba(20,30,35,0.16)",
    gradFrom: "#3E8C9B",
    heroBg: "#A5E4CE",
    heroText: "#0B1A15",
    heroMuted: "rgba(11,26,21,0.60)",
    heroLine: "rgba(11,26,21,0.16)",
    fabTop: "#39444B",
    fabBottom: "#0B1114",
    fabSheen: "rgba(255,255,255,0.22)",
    fabInner: "rgba(0,0,0,0.35)",
    sheetTop: "#E4ECEF",
    errBg: "#FCE9E4",
    errBorder: "#E9BCB0",
    errText: "#9A3A24",
  },
};

const ThemeCtx = React.createContext(PALETTES.dark);
const useTheme = () => React.useContext(ThemeCtx);

const THEMES = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

function resolveTheme(pref) {
  if (pref === "light" || pref === "dark") return pref;
  try {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  } catch { return "dark"; }
}

const TILE_COLORS = [
  "#7C6CF0", "#4A9EFF", "#F4667C", "#F2C94C",
  "#F2994A", "#4ECBA5", "#6C7CF0", "#E27DDD",
];

const CURRENCIES = ["EUR", "USD", "BDT"];
const CURRENCY_SYMBOL = { EUR: "€", USD: "$", BDT: "৳" };

const ACCOUNT_TYPES = [
  { id: "cash", label: "Cash", emoji: "👛" },
  { id: "checking", label: "Checking", emoji: "🏦" },
  { id: "credit", label: "Credit card", emoji: "💳" },
  { id: "savings", label: "Savings", emoji: "🐖" },
];

const EMOJI_GUESS = {
  "restaurant, fast-food": "🍽️", food: "🍽️", groceries: "🛒", transport: "🚗",
  transportation: "🚗", shopping: "🛍️", "bills & utilities": "💡", utilities: "💡",
  entertainment: "🍿", health: "💊", rent: "🏠", housing: "🏠", travel: "✈️",
  clothes: "👕", "going out": "🍻", subscriptions: "🗒️", "balance correction": "⚖️",
  others: "📦", salary: "💰", investments: "📊", "freelance — fiverr": "💼",
  "freelance — direct client": "🧑‍💻", gift: "🎁", refund: "↩️", tips: "🪙",
  savings: "💵", "part-time": "💼",
};

const DEFAULT_EXPENSE = [
  ["Housing", "🏠"], ["Food", "🍽️"], ["Groceries", "🛒"], ["Utilities", "💡"],
  ["Transportation", "🚗"], ["Clothes", "👕"], ["Going out", "🍻"],
  ["Entertainment", "🍿"], ["Health", "💊"], ["Debt repayment", "🤝"], ["Money lent", "📤"], ["Balance correction", "⚖️"], ["Others", "📦"],
];
const DEFAULT_INCOME = [
  ["Salary", "💰"], ["Freelance — Fiverr", "💼"], ["Freelance — direct client", "🧑‍💻"],
  ["Investments", "📊"], ["Gift", "🎁"], ["Refund", "↩️"], ["Debt repayment", "🤝"], ["Money borrowed", "📥"], ["Balance correction", "⚖️"],
];

const APP_VERSION = "1.0.0";
const APP_AUTHOR = "Ahmed Ripon";
const APP_AUTHOR_IG = "rip.0n";
/* Shown in the privacy policy. Both app stores expect a contact email. */
const APP_CONTACT_EMAIL = "";

/* ---------------------------------- privacy policy ----------------------------------
   One source for the in-app page and the public privacy.html, so the two can
   never say different things. Keep it true to what the code actually does. */
const PRIVACY_UPDATED = "19 October 2026";

function privacySections() {
  const contact = APP_CONTACT_EMAIL
    ? `email ${APP_CONTACT_EMAIL} or message @${APP_AUTHOR_IG} on Instagram`
    : `message @${APP_AUTHOR_IG} on Instagram`;
  return [
    { h: "Who we are", p: [
      `Ledger is a personal finance app made by ${APP_AUTHOR}, an individual developer based in Italy, who is responsible for the data described here. To get in touch, ${contact}.`,
    ] },
    { h: "Using the app without an account", p: [
      "If you don't sign in, everything you enter stays in this browser on your device. Nothing is sent to us.",
    ] },
    { h: "What we store when you have an account", p: [
      "Your email address and password, used only to sign you in. Your password is handled by our sign-in provider and stored in a protected, scrambled form that nobody, including us, can read.",
      "Your ledger: account names and balances, records (amounts, dates, categories, notes and payees), budgets, repeating records, lending entries and your app settings.",
      "Lending entries include the names you type for people you lent to or borrowed from. Please only add what you need to track.",
    ] },
    { h: "Why we store it", p: [
      "Only to run the app for you: signing you in, saving your records and showing the same ledger on each device you sign in on. We rely on providing the service you asked for as the basis for this.",
    ] },
    { h: "What we don't do", p: [
      "No advertising, no selling or renting your data, no analytics or tracking tools, no access to your bank, contacts or location.",
    ] },
    { h: "Services we use", p: [
      "Supabase stores your account and synced ledger. Vercel hosts the app. Google Fonts supplies the typeface. Like any website, these services receive basic technical details such as your IP address when your device connects to them.",
      "Data travels over encrypted HTTPS connections. A copy is also kept in your browser so the app works quickly and offline.",
    ] },
    { h: "How long we keep it", p: [
      "Until you delete it. Deleting your account removes your account and all synced records straight away, and clears the copy on that device. Signing out removes the copy from that device once everything has synced.",
    ] },
    { h: "Your rights", p: [
      "You can see and correct your data in the app at any time, and download all of it with Settings → Export backup.",
      `You can delete your account and all its data in Settings → Account → Delete account. If you can't sign in, ${contact} from the email address on the account and we will delete it within 30 days.`,
      "If you live in the EU or UK you also have the right to object, to restrict how your data is used, and to complain to your data protection authority. In Italy that is the Garante per la protezione dei dati personali.",
    ] },
    { h: "Children", p: [
      "Ledger isn't meant for children under 16, and we don't knowingly hold their data.",
    ] },
    { h: "Changes", p: [
      "If this policy changes, the date below changes too. Important changes will be shown in the app.",
    ] },
  ];
}

const STORAGE_KEY = "finance-tracker-data";

/* ---------------------------------- cloud account ----------------------------------
   Keys live in the LEDGER SETTINGS block at the top of index.html, so they can
   be pasted in without touching the app code. The anon key is meant to be
   public: Row Level Security on the table keeps each person's data private.
   Never use the service_role key. With no keys the app stays on this device. */
const LEDGER_CONFIG = (typeof window !== "undefined" && window.LEDGER_CONFIG) || {};
const SUPABASE_URL = (LEDGER_CONFIG.supabaseUrl || "").trim();
const SUPABASE_ANON_KEY = (LEDGER_CONFIG.supabaseAnonKey || "").trim();
const CLOUD_TABLE = "ledger_data";
const CLOUD_CONFIGURED = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

/* createClient is absent when the library failed to download */
const supabase = CLOUD_CONFIGURED && typeof createClient === "function"
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

/* Each signed-in person gets their own on-device cache, so two accounts on
   one phone never see each other's records. */
const cacheKey = (userId) => (userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY);

const cloud = {
  async load(userId) {
    const { data, error } = await supabase
      .from(CLOUD_TABLE).select("data, updated_at").eq("user_id", userId).maybeSingle();
    if (error) throw error;
    return data; // null when this person has never saved
  },
  async save(userId, payload) {
    const updated_at = new Date().toISOString();
    const { error } = await supabase
      .from(CLOUD_TABLE).upsert({ user_id: userId, data: payload, updated_at }, { onConflict: "user_id" });
    if (error) throw error;
    return updated_at;
  },
};

/* Works in the Claude artifact runtime (window.storage) and on a normal web
   host (localStorage), so the same build runs in both places. */
const store = {
  async get(key) {
    if (typeof window !== "undefined" && window.storage) {
      const res = await window.storage.get(key, false);
      if (!res || res.value == null) throw new Error("not found: " + key);
      return res.value;
    }
    const value = window.localStorage.getItem(key);
    if (value === null) throw new Error("not found: " + key);
    return value;
  },
  async set(key, value) {
    if (typeof window !== "undefined" && window.storage) {
      return await window.storage.set(key, value, false);
    }
    window.localStorage.setItem(key, value);
    return true;
  },
  async remove(key) {
    if (typeof window !== "undefined" && window.storage && window.storage.delete) {
      return await window.storage.delete(key, false);
    }
    window.localStorage.removeItem(key);
    return true;
  },
};

const DEFAULT_SETTINGS = {
  theme: "system",
  fields: { note: true, payee: true, account: true, converter: true },
  displayCents: true,
  hideBalances: false,
  monthStartDay: 1,
};

const RANGES = [
  { id: "month", label: "Monthly", isMonth: true },
  { id: "7d", label: "7 days", days: 7 },
  { id: "30d", label: "30 days", days: 30 },
  { id: "12w", label: "12 weeks", days: 84 },
  { id: "6m", label: "6 months", days: 182 },
  { id: "1y", label: "1 year", days: 365 },
  { id: "all", label: "All time", days: null },
  { id: "custom", label: "Custom range", isCustom: true },
];

/* ================================ helpers ================================ */

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function mkCat(name, emoji, i) {
  return { id: uid(), name, emoji: emoji || EMOJI_GUESS[name.toLowerCase()] || "🏷️", color: TILE_COLORS[i % TILE_COLORS.length] };
}

function normalizeCats(list) {
  if (!Array.isArray(list)) return [];
  return list.map((c, i) => (typeof c === "string" ? mkCat(c, null, i) : { ...c, color: c.color || TILE_COLORS[i % TILE_COLORS.length], emoji: c.emoji || "🏷️" }));
}

function toBase(amount, currency, rates) { return amount / (rates[currency] || 1); }
function convert(amount, from, to, rates) { return toBase(amount, from, rates) * (rates[to] || 1); }

function fmtNumber(n, dec = 2) {
  const sign = n < 0 ? "-" : "";
  return sign + Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function fmtCompact(n) {
  const a = Math.abs(n);
  if (a >= 1000) return (n < 0 ? "-" : "") + Math.round(a).toLocaleString();
  return fmtNumber(n, a % 1 === 0 ? 0 : 2);
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
function fmtDateTimeLocal(iso) {
  const d = new Date(iso); const p = (x) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
function groupByDay(list) {
  const map = new Map();
  for (const t of list) {
    const k = new Date(t.date).toDateString();
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(t);
  }
  return Array.from(map.entries());
}

/* ---------------------------------- recurring ----------------------------------
   A repeating record is stored as a rule plus a template. Whenever the app
   opens, any occurrences that have fallen due since last time are written as
   normal transactions, so history stays plain and editable. */

const FREQS = [
  { id: "none", label: "Never" },
  { id: "daily", label: "Daily" },
  { id: "workday", label: "Every work day" },
  { id: "weekly", label: "Weekly" },
  { id: "biweekly", label: "Every 2 weeks" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
];

/* `anchorDay` keeps a monthly series pinned to its original day: the 31st
   becomes the 28th in February but returns to the 31st in March, instead of
   drifting earlier every month. */
function addMonthsClamped(date, months, anchorDay) {
  const d = new Date(date);
  const day = anchorDay || d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return d;
}

function nextOccurrence(date, freq, anchorDay) {
  const d = new Date(date);
  switch (freq) {
    case "daily": d.setDate(d.getDate() + 1); return d;
    case "workday": {
      do { d.setDate(d.getDate() + 1); } while (d.getDay() === 0 || d.getDay() === 6);
      return d;
    }
    case "weekly": d.setDate(d.getDate() + 7); return d;
    case "biweekly": d.setDate(d.getDate() + 14); return d;
    case "monthly": return addMonthsClamped(d, 1, anchorDay);
    case "yearly": return addMonthsClamped(d, 12, anchorDay);
    default: return null;
  }
}

/* Returns { transactions, rules, added } with everything due up to `now`. */
function materializeRecurring(rules, transactions, now = new Date()) {
  if (!Array.isArray(rules) || rules.length === 0) return { transactions, rules, added: 0 };
  const out = [...transactions];
  let added = 0;
  const nextRules = rules.map((rule) => {
    if (!rule.active || rule.freq === "none") return rule;
    let cursor = new Date(rule.lastGenerated || rule.startDate);
    const anchorDay = new Date(rule.startDate).getDate();
    const end = rule.endDate ? new Date(rule.endDate) : null;
    let guard = 0;
    while (guard++ < 500) {
      const next = nextOccurrence(cursor, rule.freq, anchorDay);
      if (!next || next > now) break;
      if (end && next > end) break;
      out.push({
        ...rule.template,
        id: uid(),
        seriesId: rule.id,
        date: next.toISOString(),
      });
      added++;
      cursor = next;
    }
    return { ...rule, lastGenerated: cursor.toISOString() };
  });
  return { transactions: out, rules: nextRules, added };
}

function describeRule(rule) {
  const f = FREQS.find((x) => x.id === rule.freq);
  return f ? f.label : rule.freq;
}

/* ---- debts ----
   A debt is money lent (receivable) or borrowed (payable). It is tracked
   separately from the ledger; payments optionally write a real transaction. */
function debtPaid(d) {
  return (d.payments || []).reduce((s, p) => s + p.amount, 0);
}
function debtRemaining(d) {
  return Math.max(0, Math.round((d.amount - debtPaid(d)) * 100) / 100);
}
function debtIsSettled(d) {
  return debtRemaining(d) <= 0;
}
/* Several loans to the same person collapse into one row; the individual
   entries stay intact underneath. */
function groupDebtsByPerson(debts, rates, base) {
  const map = new Map();
  for (const d of debts) {
    const key = d.kind + "|" + d.person.trim().toLowerCase();
    if (!map.has(key)) map.set(key, { key, person: d.person, kind: d.kind, entries: [] });
    map.get(key).entries.push(d);
  }
  return Array.from(map.values()).map((g) => {
    const entries = [...g.entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    const remainingBase = entries.reduce((s, d) => s + toBase(debtRemaining(d), d.currency, rates) * rates[base], 0);
    const totalBase = entries.reduce((s, d) => s + toBase(d.amount, d.currency, rates) * rates[base], 0);
    const currencies = Array.from(new Set(entries.map((d) => d.currency)));
    return {
      ...g, entries, remainingBase, totalBase, currencies,
      settled: entries.every(debtIsSettled),
      lastDate: entries[0].date,
    };
  }).sort((a, b) => b.remainingBase - a.remainingBase);
}

function debtTotals(debts, rates, base) {
  let receivable = 0, payable = 0;
  for (const d of debts) {
    if (debtIsSettled(d)) continue;
    const v = toBase(debtRemaining(d), d.currency, rates) * rates[base];
    if (d.kind === "receivable") receivable += v; else payable += v;
  }
  return { receivable, payable, net: receivable - payable };
}

function accountBalance(account, transactions) {
  let bal = account.opening;
  for (const t of transactions) {
    if (t.type === "expense" && t.accountId === account.id) bal -= t.amount;
    else if (t.type === "income" && t.accountId === account.id) bal += t.amount;
    else if (t.type === "transfer") {
      if (t.accountId === account.id) bal -= t.amount;
      if (t.toAccountId === account.id) bal += (t.toAmount ?? t.amount);
    }
  }
  return bal;
}
function signedForAccount(t, account) {
  if (t.type === "expense") return -t.amount;
  if (t.type === "income") return t.amount;
  if (t.accountId === account.id) return -t.amount;
  return t.toAmount ?? t.amount;
}
/* Accounts flagged `excluded` are tracked but left out of net worth — useful for
   money you watch but do not own, like a family member's account. */
/* Records on excluded accounts are left out of every aggregate — spending,
   income, budgets, charts — not just net worth. A transfer is only dropped when
   both sides are excluded, since money moving to or from your own accounts is
   still real movement for you. */
function countableTransactions(transactions, accounts) {
  const ex = new Set(accounts.filter((a) => a.excluded).map((a) => a.id));
  if (ex.size === 0) return transactions;
  return transactions.filter((t) =>
    t.type === "transfer"
      ? !(ex.has(t.accountId) && ex.has(t.toAccountId))
      : !ex.has(t.accountId));
}

function netWorthAt(accounts, transactions, rates, base, cutoffISO) {
  let total = 0;
  const tx = cutoffISO ? transactions.filter((t) => t.date <= cutoffISO) : transactions;
  for (const a of accounts) {
    if (a.excluded) continue;
    total += toBase(accountBalance(a, tx), a.currency, rates) * rates[base];
  }
  return total;
}
/* A "month" runs from startDay of the cursor's month to the day before startDay of the next. */
function monthWindow(monthCursor, startDay = 1) {
  const from = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), startDay, 0, 0, 0, 0);
  const to = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, startDay, 0, 0, 0, 0);
  return [from, to];
}

function filterByRange(transactions, range, monthCursor, startDay = 1, custom = null) {
  const preset = RANGES.find((r) => r.id === range) || RANGES[0];
  if (preset.isCustom) {
    if (!custom || !custom.from || !custom.to) return transactions;
    const from = new Date(custom.from); from.setHours(0, 0, 0, 0);
    const to = new Date(custom.to); to.setHours(23, 59, 59, 999);
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= from && d <= to;
    });
  }
  if (preset.isMonth) {
    const [from, to] = monthWindow(monthCursor, startDay);
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= from && d < to;
    });
  }
  if (!preset.days) return transactions;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - preset.days);
  return transactions.filter((t) => new Date(t.date) >= cutoff);
}

/* ================================ seed ================================ */

const seedAccounts = () => ([
  { id: uid(), name: "Intesa Sanpaolo", type: "checking", currency: "EUR", opening: 1307 },
  { id: uid(), name: "Islamic Bank Bangladesh", type: "checking", currency: "BDT", opening: 405110 },
  { id: uid(), name: "Sonali Bank Ltd", type: "savings", currency: "BDT", opening: 455000 },
  { id: uid(), name: "EXIM Bank", type: "checking", currency: "BDT", opening: 200 },
  { id: uid(), name: "Wise", type: "checking", currency: "EUR", opening: 0 },
  { id: uid(), name: "PayPal", type: "checking", currency: "EUR", opening: 0 },
  { id: uid(), name: "Payoneer", type: "checking", currency: "USD", opening: 439 },
  { id: uid(), name: "Fiverr", type: "checking", currency: "USD", opening: 0 },
  { id: uid(), name: "Cash", type: "cash", currency: "EUR", opening: 2000 },
]);

function seedTransactions(accounts) {
  const by = (n) => accounts.find((a) => a.name === n)?.id;
  const ago = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString(); };
  return [
    { id: uid(), type: "expense", accountId: by("Intesa Sanpaolo"), category: "Housing", amount: 1033, date: ago(0), note: "", payee: "" },
    { id: uid(), type: "expense", accountId: by("Intesa Sanpaolo"), category: "Groceries", amount: 110, date: ago(1), note: "", payee: "" },
    { id: uid(), type: "income", accountId: by("Payoneer"), category: "Freelance — Fiverr", amount: 250, date: ago(7), note: "Logo design project", payee: "" },
    { id: uid(), type: "transfer", accountId: by("Cash"), toAccountId: by("Intesa Sanpaolo"), amount: 1600, toAmount: 1600, date: ago(12), note: "", payee: "" },
    { id: uid(), type: "expense", accountId: by("Intesa Sanpaolo"), category: "Food", amount: 45, date: ago(3), note: "", payee: "" },
    { id: uid(), type: "expense", accountId: by("Cash"), category: "Going out", amount: 28, date: ago(5), note: "", payee: "" },
    { id: uid(), type: "income", accountId: by("Islamic Bank Bangladesh"), category: "Salary", amount: 150000, date: ago(28), note: "", payee: "" },
  ];
}

/* A clean slate: no accounts, no records. Categories and preferences survive,
   because re-typing those is not what "erase my data" means. */
const emptyData = (keepSettings) => ({
  baseCurrency: "EUR",
  rates: { EUR: 1, USD: 1.08, BDT: 145 },
  accounts: [],
  transactions: [],
  categories: {
    expense: DEFAULT_EXPENSE.map(([n, e], i) => mkCat(n, e, i)),
    income: DEFAULT_INCOME.map(([n, e], i) => mkCat(n, e, i + 3)),
  },
  budget: { total: 0, allocations: {} },
  debts: [],
  recurring: [],
  settings: { ...DEFAULT_SETTINGS, ...(keepSettings || {}) },
});

const defaultData = () => {
  const accounts = seedAccounts();
  return {
    baseCurrency: "EUR",
    rates: { EUR: 1, USD: 1.08, BDT: 145 },
    accounts,
    transactions: seedTransactions(accounts),
    categories: {
      expense: DEFAULT_EXPENSE.map(([n, e], i) => mkCat(n, e, i)),
      income: DEFAULT_INCOME.map(([n, e], i) => mkCat(n, e, i + 3)),
    },
    budget: { total: 0, allocations: {} },
    debts: [],
    recurring: [],
    settings: { ...DEFAULT_SETTINGS },
  };
};

/* ================================ primitives ================================ */

/* One tile style everywhere: flat filled square, no outline. `color` tints the
   fill so categories stay recognisable without a hard border. */
function Tile({ emoji, color, size = 38, radius = 11 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      background: color ? color + "24" : "transparent",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.5, lineHeight: 1,
    }}>{emoji}</div>
  );
}

function Chip({ active, onClick, children, style, onPointerDown }) {
  const C = useTheme();
  return (
    <button onClick={onClick} onPointerDown={onPointerDown} style={{
      flexShrink: 0, padding: "10px 18px", borderRadius: 999, cursor: "pointer",
      border: "none", fontSize: 13.5, fontWeight: 600,
      background: active ? C.primary : C.surface2,
      color: active ? C.onPrimary : C.text,
      fontFamily: "inherit", ...style,
    }}>{children}</button>
  );
}

function Pct({ children }) {
  const C = useTheme();
  return (
    <span style={{
      fontSize: 11.5, fontWeight: 600, color: C.text2, background: C.surface3,
      padding: "3px 8px", borderRadius: 8, fontVariantNumeric: "tabular-nums",
    }}>{children}</span>
  );
}

const SettingsCtx = React.createContext(DEFAULT_SETTINGS);
const useSettings = () => React.useContext(SettingsCtx);

/* Formats a number honouring "Display cents" and masks it when balances are hidden. */
function useAmountText() {
  const s = useSettings();
  return (value, { compact = true } = {}) => {
    if (s.hideBalances) return "••••";
    if (compact) return s.displayCents ? fmtCompact(value) : fmtNumber(Math.round(value), 0);
    return fmtNumber(value, s.displayCents ? 2 : 0);
  };
}

function Money({ value, currency, size = 16, weight = 700, color, dec }) {
  const C = useTheme();
  const text = useAmountText();
  const s = useSettings();
  const c = color || (value < 0 ? C.expense : C.text);
  const sym = CURRENCY_SYMBOL[currency] || "";
  return (
    <span style={{ fontSize: size, fontWeight: weight, color: c, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
      {!s.hideBalances && <span style={{ opacity: 0.55, marginRight: 1 }}>{sym}</span>}
      {text(value, { compact: dec === undefined })}
    </span>
  );
}

/* Large headline figure used at the top of each screen. */
function BigAmount({ value, currency, size = 34, color }) {
  const C = useTheme();
  const fg = color || C.text;
  const text = useAmountText();
  const s = useSettings();
  return (
    <span style={{ fontSize: size, fontWeight: 700, color: fg, letterSpacing: "-0.02em" }}>
      {!s.hideBalances && <span style={{ opacity: 0.5 }}>{CURRENCY_SYMBOL[currency]}</span>}
      {text(value)}
    </span>
  );
}

function EmptyState({ text }) {
  const C = useTheme();
  return <div style={{ textAlign: "center", color: C.text3, fontSize: 13.5, padding: "48px 0" }}>{text}</div>;
}

/* Style builders — each takes the active palette so they re-theme with the app. */
const sheetCardStyle = (C) => ({ background: C.surface, borderRadius: 18, border: `1px solid ${C.border}` });
const inputStyle = (C) => ({
  width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 12,
  border: `1px solid ${C.border}`, fontSize: 16, fontFamily: "inherit",
  background: C.surface2, color: C.text, outline: "none",
});
const selectStyle = (C) => ({ ...inputStyle(C), appearance: "none" });
const roundBtn = (C) => ({
  width: 40, height: 40, borderRadius: 999, border: `1px solid ${C.border}`,
  background: C.surface2, display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", color: C.text, flexShrink: 0,
});
const whiteBtn = (C) => ({
  width: "100%", padding: "17px 0", borderRadius: 999, border: "none", cursor: "pointer",
  background: C.primary, color: C.onPrimary, fontWeight: 700, fontSize: 15, fontFamily: "inherit",
});

/* Horizontal swipe to step months. Ignores mostly-vertical drags so it does not
   fight page scrolling, and only acts when a monthly period is in view. */
function SwipeMonths({ enabled = true, onPrev, onNext, children, style }) {
  const start = React.useRef(null);

  const onStart = (e) => {
    const t = e.touches ? e.touches[0] : e;
    start.current = { x: t.clientX, y: t.clientY };
  };
  const onEnd = (e) => {
    if (!enabled || !start.current) return;
    const t = e.changedTouches ? e.changedTouches[0] : e;
    const dx = t.clientX - start.current.x;
    const dy = t.clientY - start.current.y;
    start.current = null;
    /* 40px is a comfortable flick; the ratio keeps vertical scrolling free */
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    if (dx < 0) onNext(); else onPrev();
  };

  return (
    <div
      onTouchStart={onStart}
      onTouchEnd={onEnd}
      onPointerDown={(e) => { if (e.pointerType === "mouse") onStart(e); }}
      onPointerUp={(e) => { if (e.pointerType === "mouse") onEnd(e); }}
      style={{ touchAction: "pan-y", userSelect: "none", ...style }}>
      {children}
    </div>
  );
}

/* ---- month navigator ---- */
function MonthNav({ cursor, setCursor }) {
  const C = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
      <button onClick={() => setCursor((c) => { const d = new Date(c); d.setMonth(d.getMonth() - 1); return d; })}
        style={{ ...roundBtn(C), width: 30, height: 30, border: "none", background: "transparent", color: C.text2 }}>
        <ChevronLeft size={17} />
      </button>
      <span style={{ fontSize: 13.5, color: C.text2, fontWeight: 500, minWidth: 118, textAlign: "center" }}>
        {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
      </span>
      <button onClick={() => setCursor((c) => { const d = new Date(c); d.setMonth(d.getMonth() + 1); return d; })}
        style={{ ...roundBtn(C), width: 30, height: 30, border: "none", background: "transparent", color: C.text2 }}>
        <ChevronRight size={17} />
      </button>
    </div>
  );
}

/* ---- ghost bar chart behind the header ---- */
function GhostBars({ transactions, monthCursor, accCur, rates, base, barType = "expense" }) {
  const C = useTheme();
  const days = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0).getDate();
  const totals = useMemo(() => {
    const arr = new Array(days).fill(0);
    for (const t of transactions) {
      if (t.type !== barType) continue;
      const d = new Date(t.date);
      if (d.getFullYear() !== monthCursor.getFullYear() || d.getMonth() !== monthCursor.getMonth()) continue;
      arr[d.getDate() - 1] += toBase(t.amount, accCur(t.accountId), rates) * rates[base];
    }
    return arr;
  }, [transactions, monthCursor, rates, base, days, barType]);

  const max = Math.max(...totals, 1);

  return (
    <div style={{ position: "relative", height: 150, display: "flex", alignItems: "flex-end", gap: 2, padding: "0 2px" }}>
      {totals.map((v, i) => (
        <div key={i} style={{
          flex: 1, borderRadius: 999, minHeight: 26,
          height: `${Math.max(18, (v / max) * 100)}%`,
          background: v > 0 ? C.barOn : C.barOff,
        }} />
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: -22, display: "flex", justifyContent: "space-between", fontSize: 11.5, color: C.text3 }}>
        <span>1</span><span>8</span><span>16</span><span>23</span><span>{days}</span>
      </div>
    </div>
  );
}

/* ================================ keypad ================================ */

function pressKey(value, k) {
  if (k === "back") return value.length <= 1 ? "0" : value.slice(0, -1);
  if (k === ".") return value.includes(".") ? value : value + ".";
  if (value === "0") return k;
  const dec = value.split(".")[1];
  if (dec && dec.length >= 2) return value;
  if (value.replace(".", "").length >= 9) return value;
  return value + k;
}

function Keypad({ value, onChange, onSubmit, submitDisabled }) {
  const C = useTheme();
  const keyStyle = {
    padding: "18px 0", borderRadius: 16, border: "none", cursor: "pointer",
    background: C.surface2, color: C.text, fontSize: 21, fontWeight: 500,
    fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center",
    userSelect: "none", WebkitTapHighlightColor: "transparent",
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
      {["1", "2", "3", "4", "5", "6", "7", "8", "9", "."].map((k) => (
        <button key={k} type="button" onClick={() => onChange(pressKey(value, k))} style={keyStyle}>{k}</button>
      ))}
      <button type="button" onClick={() => onChange(pressKey(value, "0"))} style={keyStyle}>0</button>
      <button type="button" onClick={onSubmit} disabled={submitDisabled}
        style={{ ...keyStyle, background: submitDisabled ? C.surface3 : C.primary, color: submitDisabled ? C.text3 : C.onPrimary, cursor: submitDisabled ? "not-allowed" : "pointer" }}>
        <ArrowRight size={26} />
      </button>
    </div>
  );
}

function AmountReadout({ value, currency, color, onBack }) {
  const C = useTheme();
  const empty = !value || value === "0";
  return (
    /* amount is centred on the page; the delete key sits at the right edge so it
       never shifts the number off-centre */
    /* fixed height: some currency glyphs (৳) have taller line boxes than others
       ($, €), which would otherwise push everything below them down */
    <div style={{
      position: "relative", width: "100%", height: 90, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0, maxWidth: "72%", height: 52 }}>
        <span style={{
          fontSize: 26, fontWeight: 600, color: C.text3,
          minWidth: 26, textAlign: "right", flexShrink: 0,
          lineHeight: "52px", height: 52, display: "block",
        }}>{CURRENCY_SYMBOL[currency] || ""}</span>
        <span style={{
          fontSize: 46, fontWeight: 700, letterSpacing: "-0.02em", color,
          fontVariantNumeric: "tabular-nums",
          lineHeight: "52px", height: 52, display: "block",
          overflow: "hidden", textOverflow: "ellipsis",
        }}>{value}</span>
      </div>
      {/* backspace glyph reads as "delete a digit"; a bare X reads as "close" */}
      <button
        type="button"
        onClick={onBack}
        disabled={empty}
        aria-label="Delete last digit"
        title="Delete last digit"
        style={{
          position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
          width: 46, height: 38, borderRadius: 11, flexShrink: 0,
          border: `1px solid ${empty ? "transparent" : C.border}`,
          background: empty ? "transparent" : C.surface2,
          color: empty ? C.text3 : C.text,
          opacity: empty ? 0.35 : 1,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: empty ? "default" : "pointer",
        }}>
        <Delete size={19} />
      </button>
    </div>
  );
}

/* ================================ full-screen shell ================================ */

/* Edge-to-edge page used for record entry: the amount gets the whole middle,
   the keypad stays pinned to the bottom. */
function FullScreen({ open, onClose, title, right, children, z = 60 }) {
  const C = useTheme();
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: z, display: "flex", flexDirection: "column",
      background: `linear-gradient(180deg, ${C.sheetTop} 0%, ${C.bgBot} 42%, ${C.bgBot} 100%)`,
      color: C.text,
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 10, padding: "14px 16px 6px", flexShrink: 0,
      }}>
        <button onClick={onClose} style={roundBtn(C)} aria-label="Close"><X size={18} /></button>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>{right}</div>
      </div>
      <div style={{
        flex: 1, minHeight: 0, display: "flex", flexDirection: "column",
        padding: "0 16px 18px", maxWidth: 560, width: "100%", margin: "0 auto",
      }}>{children}</div>
    </div>
  );
}

/* ================================ sheet shell ================================ */

function Sheet({ open, onClose, title, right, children, z = 60 }) {
  const C = useTheme();
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: z, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: C.overlay }} />
      <div style={{
        position: "relative", width: "100%", maxWidth: 480, maxHeight: "88vh", overflowY: "auto",
        background: `linear-gradient(180deg, ${C.sheetTop} 0%, ${C.surface} 38%, ${C.surface} 100%)`,
        borderRadius: "24px 24px 0 0", boxShadow: C.sheetShadow,
      }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 2px" }}>
          <div style={{ width: 42, height: 4, borderRadius: 999, background: C.surface3 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px 4px" }}>
          <button onClick={onClose} style={roundBtn(C)}><X size={18} /></button>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{title}</div>
          <div style={{ minWidth: 40, display: "flex", justifyContent: "flex-end" }}>{right}</div>
        </div>
        <div style={{ padding: "12px 16px 28px" }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  const C = useTheme();
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, color: C.text2, marginBottom: 7, fontWeight: 500 }}>{label}</div>
      {children}
    </div>
  );
}

/* ================================ category picker ================================ */

function HexNut({ size = 19 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill="currentColor"
        d="M12 1.7c.5 0 1 .13 1.44.39l6.5 3.75c.89.51 1.44 1.46 1.44 2.49v7.34c0 1.03-.55 1.98-1.44 2.49l-6.5 3.75c-.89.51-1.99.51-2.88 0l-6.5-3.75a2.88 2.88 0 0 1-1.44-2.49V8.33c0-1.03.55-1.98 1.44-2.49l6.5-3.75c.44-.26.94-.39 1.44-.39Zm0 6.9a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Z"
      />
    </svg>
  );
}

function ConfirmSheet({ open, onClose, title, message, confirmLabel, danger, onConfirm }) {
  const C = useTheme();
  return (
    <Sheet open={open} onClose={onClose} title={title} z={80}>
      <p style={{ fontSize: 14.5, color: C.text2, lineHeight: 1.55, margin: "0 4px 20px", textAlign: "center" }}>{message}</p>
      <button onClick={() => { onConfirm(); onClose(); }} style={{
        ...whiteBtn(C), marginBottom: 10,
        background: danger ? C.expense : C.primary,
        color: danger ? "#fff" : C.onPrimary,
      }}>{confirmLabel}</button>
      <button onClick={onClose} style={{ ...whiteBtn(C), background: C.surface2, color: C.text }}>Cancel</button>
    </Sheet>
  );
}

/* Drag-to-reorder list. Uses pointer events (works for touch and mouse) and
   only the handle starts a drag, so the row itself stays tappable. */
function ReorderList({ items, onReorder, renderRow, keyOf }) {
  const C = useTheme();
  const [drag, setDrag] = useState(null); // { from, to, dy }
  const rowsRef = React.useRef([]);
  const startRef = React.useRef(null);

  const beginDrag = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    const h = rowsRef.current[index]?.offsetHeight || 56;
    startRef.current = { y: e.clientY, index, h };
    setDrag({ from: index, to: index, dy: 0 });
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  };

  const moveDrag = (e) => {
    if (!startRef.current) return;
    const { y, index, h } = startRef.current;
    const dy = e.clientY - y;
    const shift = Math.round(dy / h);
    const to = Math.max(0, Math.min(items.length - 1, index + shift));
    setDrag({ from: index, to, dy });
  };

  const endDrag = () => {
    if (startRef.current && drag && drag.from !== drag.to) {
      const next = [...items];
      const [moved] = next.splice(drag.from, 1);
      next.splice(drag.to, 0, moved);
      onReorder(next);
    }
    startRef.current = null;
    setDrag(null);
  };

  /* rows slide out of the way as the dragged one passes over them */
  const offsetFor = (i) => {
    if (!drag) return 0;
    const h = startRef.current?.h || 56;
    if (i === drag.from) return drag.dy;
    if (drag.from < drag.to && i > drag.from && i <= drag.to) return -h;
    if (drag.from > drag.to && i < drag.from && i >= drag.to) return h;
    return 0;
  };

  return (
    <div style={{ ...sheetCardStyle(C), padding: 0, overflow: "hidden", position: "relative" }}>
      {items.map((item, i) => {
        const isDragging = drag && drag.from === i;
        return (
          <div
            key={keyOf(item)}
            ref={(el) => { rowsRef.current[i] = el; }}
            style={{
              display: "flex", alignItems: "center", gap: 11, padding: "10px 12px",
              borderTop: i === 0 ? "none" : `1px solid ${C.border}`,
              transform: `translateY(${offsetFor(i)}px)`,
              transition: isDragging ? "none" : "transform .16s ease",
              position: "relative",
              zIndex: isDragging ? 2 : 1,
              background: isDragging ? C.surface2 : "transparent",
              boxShadow: isDragging ? C.navShadow : "none",
              touchAction: drag ? "none" : "auto",
            }}>
            <div style={{ flex: 1, minWidth: 0 }}>{renderRow(item, i)}</div>
            <div
              onPointerDown={(e) => beginDrag(e, i)}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              role="button"
              aria-label="Drag to reorder"
              style={{
                width: 38, height: 38, flexShrink: 0, cursor: "grab", touchAction: "none",
                display: "flex", alignItems: "center", justifyContent: "center", color: C.text3,
              }}>
              <GripHorizontal size={18} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---- generic option picker + dropdown chip ---- */

/* One shape for account options wherever they are offered. */
function accountEmoji(a) {
  if (a && a.emoji) return a.emoji;
  const t = ACCOUNT_TYPES.find((x) => x.id === (a && a.type)) || ACCOUNT_TYPES[1];
  return t.emoji;
}

function accountOption(a, C) {
  const t = ACCOUNT_TYPES.find((x) => x.id === a.type) || ACCOUNT_TYPES[1];
  return { id: a.id, label: a.name, sub: `${t.label} · ${a.currency}`, tile: { emoji: accountEmoji(a), color: C.mint } };
}

const TX_TYPES = [
  { id: "all", label: "All types", iconId: "all" },
  { id: "expense", label: "Expenses", iconId: "expense" },
  { id: "income", label: "Income", iconId: "income" },
  { id: "transfer", label: "Transfers", iconId: "transfer" },
];

/* built at render time so the icons pick up the active theme */
function rangeLabel(range, customRange) {
  if (range === "custom") {
    return customRange && customRange.from && customRange.to
      ? `${fmtDate(customRange.from)} – ${fmtDate(customRange.to)}`
      : "Custom range";
  }
  return (RANGES.find((r) => r.id === range) || RANGES[0]).label;
}

function optionIcon(id) {
  switch (id) {
    case "all": return <LayoutGrid size={16} />;
    case "expense": return <ArrowUpRight size={17} />;
    case "income": return <ArrowDownLeft size={17} />;
    case "transfer": return <RefreshCw size={15} />;
    case "period": return <Calendar size={16} />;
    case "date": return <Calendar size={16} />;
    case "amount": return <Coins size={16} />;
    case "name": return <FileText size={15} />;
    case "theme": return <Palette size={16} />;
    default: return null;
  }
}

const SORTS = [
  { id: "date-desc", label: "Date, new first", badge: "Default" },
  { id: "date-asc", label: "Date, old first" },
  { id: "amount-desc", label: "Amount, high to low" },
  { id: "amount-asc", label: "Amount, low to high" },
  { id: "name", label: "Name" },
];

/* Sorts in the display currency so mixed-currency rows compare fairly. */
function sortTransactions(list, sort, { accCur, rates, base, nameOf }) {
  const val = (t) => Math.abs(toBase(t.amount, accCur(t.accountId), rates) * rates[base]);
  const out = [...list];
  switch (sort) {
    case "date-asc": return out.sort((a, b) => new Date(a.date) - new Date(b.date));
    case "amount-desc": return out.sort((a, b) => val(b) - val(a));
    case "amount-asc": return out.sort((a, b) => val(a) - val(b));
    case "name": return out.sort((a, b) => nameOf(a).localeCompare(nameOf(b)) || new Date(b.date) - new Date(a.date));
    default: return out.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
}

/* Picker rows are separate rounded cards with a leading tile, matching the
   settings rows and lists elsewhere rather than looking like a system list. */
function OptionSheet({ open, onClose, title, subtitle, options, value, onPick }) {
  const C = useTheme();
  return (
    <Sheet open={open} onClose={onClose} title={title} z={70}>
      {subtitle && (
        <div style={{ fontSize: 13.5, color: C.text3, textAlign: "center", margin: "-4px 0 16px" }}>{subtitle}</div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {options.map((o) => {
          const on = value === o.id;
          const accent = (o.tile && o.tile.color) || C.mint;
          return (
            <div key={o.id} onClick={() => { onPick(o.id); onClose(); }} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "11px 13px",
              borderRadius: 16, cursor: "pointer",
              background: on ? accent + "1F" : C.surface2,
              border: `1.5px solid ${on ? accent : "transparent"}`,
            }}>
              {o.tile
                ? <Tile emoji={o.tile.emoji} color={o.tile.color} size={34} radius={10} />
                : o.icon
                  ? <div style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                      background: on ? accent + "24" : C.surface3,
                      color: on ? accent : C.text2,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{o.icon}</div>
                  : null}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14.5, fontWeight: 600,
                  color: on ? accent : C.text,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{o.label}</div>
                {o.sub && (
                  <div style={{ fontSize: 11.5, color: C.text3, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.sub}</div>
                )}
              </div>
              {o.badge && (
                <span style={{
                  fontSize: 12, color: C.text3, background: on ? C.surface2 : C.surface3,
                  padding: "3px 10px", borderRadius: 999, flexShrink: 0,
                }}>{o.badge}</span>
              )}
              {/* a filled dot reads faster than a tick at the end of a row */}
              <span style={{
                width: 20, height: 20, borderRadius: 999, flexShrink: 0,
                border: `2px solid ${on ? accent : C.surface3}`,
                background: on ? accent : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {on && <Check size={12} color={C.surface} strokeWidth={3.5} />}
              </span>
            </div>
          );
        })}
      </div>
    </Sheet>
  );
}

function PickerChip({ label, onClick, active }) {
  const C = useTheme();
  return (
    <button onClick={onClick} style={{
      flexShrink: 0, display: "flex", alignItems: "center", gap: 5,
      padding: "10px 14px", borderRadius: 999, border: "none", cursor: "pointer",
      fontSize: 13.5, fontWeight: 600, fontFamily: "inherit", maxWidth: 150,
      background: active ? C.primary : C.surface2, color: active ? C.onPrimary : C.text,
    }}>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      <ChevronDown size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
    </button>
  );
}

/* Category picker: two columns so the whole set is visible without scrolling,
   and the tiles stay big enough to hit accurately. */
function CategorySheet({ open, onClose, categories, value, onPick }) {
  const C = useTheme();
  return (
    <Sheet open={open} onClose={onClose} title="Category" z={70}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
        {categories.map((c) => {
          const on = value === c.name;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => { onPick(c.name); onClose(); }}
              style={{
                display: "flex", alignItems: "center", gap: 10, minWidth: 0,
                padding: "10px 11px", borderRadius: 14, cursor: "pointer", textAlign: "left",
                fontFamily: "inherit",
                border: `1.5px solid ${on ? c.color : "transparent"}`,
                background: on ? c.color + "1F" : C.surface2,
              }}>
              <Tile emoji={c.emoji} color={c.color} size={32} radius={10} />
              <span style={{
                flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600,
                color: on ? c.color : C.text,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{c.name}</span>
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

function MenuPopover({ open, onClose, items }) {
  const C = useTheme();
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 75 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0 }} />
      <div style={{
        position: "absolute", top: 62, right: 16, minWidth: 210,
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
        boxShadow: C.sheetShadow, overflow: "hidden",
      }}>
        {items.map((it, i) => (
          <div key={it.label} onClick={() => { onClose(); it.action(); }} style={{
            display: "flex", alignItems: "center", gap: 11, padding: "13px 14px", cursor: "pointer",
            borderTop: i === 0 ? "none" : `1px solid ${C.border}`,
            color: it.danger ? C.expense : C.text, fontSize: 14.5, fontWeight: 500,
          }}>
            {it.icon}
            <span>{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Horizontal strip of categories with a trailing button for the full grid. */
function CategoryStrip({ categories, value, onPick, onOpenAll }) {
  const C = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", flex: 1, minWidth: 0, paddingBottom: 2 }}>
        {categories.map((c) => {
          const on = value === c.name;
          return (
            <button key={c.id} type="button" onClick={() => onPick(c.name)} style={{
              flexShrink: 0, display: "flex", alignItems: "center", gap: 7,
              padding: "9px 13px", borderRadius: 999, cursor: "pointer",
              fontSize: 13.5, fontWeight: 600, fontFamily: "inherit",
              border: `1px solid ${on ? c.color : "transparent"}`,
              background: on ? c.color + "1F" : C.surface2,
              color: on ? c.color : C.text2,
            }}>
              <span style={{ fontSize: 14.5, lineHeight: 1 }}>{c.emoji}</span>
              {c.name}
            </button>
          );
        })}
      </div>
      <button type="button" onClick={onOpenAll} aria-label="All categories"
        style={{ ...roundBtn(C), width: 38, height: 38 }}>
        <LayoutGrid size={16} />
      </button>
    </div>
  );
}

/* Repeat rule chooser, opened from the record screen. */
function RepeatSheet({ open, onClose, freq, setFreq, endDate, setEndDate }) {
  const C = useTheme();
  const [dateOpen, setDateOpen] = useState(false);
  return (
    <>
      <Sheet open={open} onClose={onClose} title="Repeat" z={72}>
        <div style={{ ...sheetCardStyle(C), padding: 0, overflow: "hidden", marginBottom: 16 }}>
          {FREQS.map((f, i) => (
            <div key={f.id} onClick={() => setFreq(f.id)}
              style={{ display: "flex", alignItems: "center", padding: "13px 14px", cursor: "pointer",
                borderTop: i === 0 ? "none" : `1px solid ${C.border}` }}>
              <span style={{ flex: 1, fontSize: 15, color: C.text, fontWeight: 500 }}>{f.label}</span>
              {freq === f.id && <Check size={18} color={C.mint} />}
            </div>
          ))}
        </div>

        {freq !== "none" && (
          <>
            <div style={{ ...sheetCardStyle(C), padding: 0, overflow: "hidden", marginBottom: 16 }}>
              <Row icon={<Calendar size={16} />} label="End date" last
                value={endDate ? fmtDate(endDate) : "None"}
                onClick={() => setDateOpen(true)} />
            </div>
            {endDate && (
              <button onClick={() => setEndDate(null)}
                style={{ ...whiteBtn(C), background: C.surface2, color: C.text, marginBottom: 12 }}>
                Clear end date
              </button>
            )}
            <div style={{ fontSize: 12, color: C.text3, lineHeight: 1.5, marginBottom: 12 }}>
              The first record is saved now. Each following one is added automatically when it
              falls due, the next time you open the app.
            </div>
          </>
        )}

        <button onClick={onClose} style={whiteBtn(C)}>Done</button>
      </Sheet>

      <DateSheet
        open={dateOpen}
        onClose={() => setDateOpen(false)}
        z={76}
        value={fmtDateTimeLocal(endDate || new Date().toISOString())}
        onChange={(v) => setEndDate(new Date(v).toISOString())} />
    </>
  );
}

/* From / to picker for the custom period. */
function CustomRangeSheet({ open, onClose, custom, onChange }) {
  const C = useTheme();
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [which, setWhich] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const now = new Date();
    const monthAgo = new Date(); monthAgo.setMonth(monthAgo.getMonth() - 1);
    setFrom(custom?.from || monthAgo.toISOString());
    setTo(custom?.to || now.toISOString());
    setWhich(null); setError("");
  }, [open, custom]);

  const apply = () => {
    if (new Date(from) > new Date(to)) { setError("The start date is after the end date."); return; }
    onChange({ from, to });
    onClose();
  };

  const days = from && to
    ? Math.max(1, Math.round((new Date(to) - new Date(from)) / 86400000) + 1)
    : 0;

  return (
    <>
      <Sheet open={open} onClose={onClose} title="Custom range" z={72}>
        <div style={{ ...sheetCardStyle(C), padding: 0, overflow: "hidden", marginBottom: 14 }}>
          <Row icon={<Calendar size={16} />} label="From"
            value={from ? fmtDate(from) : "—"} onClick={() => setWhich("from")} />
          <Row icon={<Calendar size={16} />} label="To" last
            value={to ? fmtDate(to) : "—"} onClick={() => setWhich("to")} />
        </div>

        <div style={{ fontSize: 12.5, color: C.text3, textAlign: "center", marginBottom: 16 }}>
          {days} {days === 1 ? "day" : "days"}
        </div>

        {error && <div style={{ color: C.expense, fontSize: 13, marginBottom: 12, textAlign: "center" }}>{error}</div>}

        <button onClick={apply} style={whiteBtn(C)}>Apply</button>
      </Sheet>

      <DateSheet
        open={which === "from"} onClose={() => setWhich(null)} z={76}
        value={fmtDateTimeLocal(from || new Date().toISOString())}
        onChange={(v) => { setFrom(new Date(v).toISOString()); setError(""); }} />
      <DateSheet
        open={which === "to"} onClose={() => setWhich(null)} z={76}
        value={fmtDateTimeLocal(to || new Date().toISOString())}
        onChange={(v) => { setTo(new Date(v).toISOString()); setError(""); }} />
    </>
  );
}

/* ---- date ---- */

function DateSheet({ open, onClose, value, onChange, z = 70 }) {
  const C = useTheme();
  const selected = new Date(value);
  const [viewMonth, setViewMonth] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));

  useEffect(() => {
    if (open) setViewMonth(new Date(new Date(value).getFullYear(), new Date(value).getMonth(), 1));
  }, [open]);

  const today = new Date();
  const yest = new Date(); yest.setDate(yest.getDate() - 1);
  const sameDay = (a, b) => a.toDateString() === b.toDateString();

  /* keep the time of day, only move the date */
  const pickDate = (day) => {
    const next = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day,
      selected.getHours(), selected.getMinutes(), 0, 0);
    onChange(fmtDateTimeLocal(next.toISOString()));
  };
  const jump = (offset) => {
    const base = new Date();
    base.setDate(base.getDate() + offset);
    base.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    onChange(fmtDateTimeLocal(base.toISOString()));
    setViewMonth(new Date(base.getFullYear(), base.getMonth(), 1));
  };

  const year = viewMonth.getFullYear(), month = viewMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  /* JS weeks start Sunday; shift so Monday is first */
  const leading = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells = [...Array(leading).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const shiftMonth = (n) => setViewMonth(new Date(year, month + n, 1));

  const timeValue = `${String(selected.getHours()).padStart(2, "0")}:${String(selected.getMinutes()).padStart(2, "0")}`;
  const setTime = (v) => {
    const [h, mi] = v.split(":").map(Number);
    const next = new Date(selected);
    next.setHours(h || 0, mi || 0, 0, 0);
    onChange(fmtDateTimeLocal(next.toISOString()));
  };

  return (
    <Sheet open={open} onClose={onClose} title="Date" z={z}>
      <div style={{ display: "flex", gap: 9, marginBottom: 18 }}>
        <Chip active={sameDay(selected, today)} onClick={() => jump(0)} style={{ flex: 1 }}>Today</Chip>
        <Chip active={sameDay(selected, yest)} onClick={() => jump(-1)} style={{ flex: 1 }}>Yesterday</Chip>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>
          {viewMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => shiftMonth(-1)} style={{ ...roundBtn(C), width: 36, height: 36 }} aria-label="Previous month"><ChevronLeft size={18} /></button>
          <button onClick={() => shiftMonth(1)} style={{ ...roundBtn(C), width: 36, height: 36 }} aria-label="Next month"><ChevronRight size={18} /></button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: 12, color: C.text3, padding: "4px 0" }}>{d}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {cells.map((day, i) => {
          if (day === null) return <div key={"e" + i} />;
          const thisDate = new Date(year, month, day);
          const isSel = sameDay(thisDate, selected);
          const isToday = sameDay(thisDate, today);
          const future = thisDate > today && !isToday;
          return (
            <button key={day} type="button" onClick={() => pickDate(day)} style={{
              aspectRatio: "1", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
              fontSize: 14.5, fontWeight: isSel ? 700 : 500,
              border: isToday && !isSel ? `1px solid ${C.text3}` : "1px solid transparent",
              background: isSel ? C.primary : "transparent",
              color: isSel ? C.onPrimary : future ? C.text3 : C.text,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{day}</button>
          );
        })}
      </div>

      <div style={{ marginTop: 18 }}>
        <Field label="Time">
          <input
            type="time"
            value={timeValue}
            onChange={(e) => setTime(e.target.value)}
            style={{
              ...inputStyle(C),
              height: 48, lineHeight: "22px", appearance: "none", WebkitAppearance: "none",
              minWidth: 0, maxWidth: "100%", textAlign: "left",
            }} />
        </Field>
      </div>

      <button onClick={onClose} style={{ ...whiteBtn(C), marginTop: 4 }}>Done</button>
    </Sheet>
  );
}

function PersonPickSheet({ open, onClose, value, onChange, people = [], kind }) {
  const C = useTheme();
  const typed = (value || "").trim().toLowerCase();
  const suggestions = people
    .filter((p) => p.toLowerCase() !== typed)
    .filter((p) => !typed || p.toLowerCase().includes(typed))
    .slice(0, 6);

  return (
    <Sheet open={open} onClose={onClose} title="Who is this with?" z={70}>
      <Field label={kind === "receivable" ? "Who did you lend it to?" : "Who did you borrow it from?"}>
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="e.g. Rahim"
          autoComplete="off" onKeyDown={(e) => e.key === "Enter" && onClose()}
          style={{ ...inputStyle(C), minWidth: 0 }} />
      </Field>
      {people.length > 0 && (
        <div style={{ fontSize: 12, color: C.text3, marginBottom: 10, padding: "0 2px" }}>
          Tap a name you have used before so it joins the same person:
        </div>
      )}
      {suggestions.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {suggestions.map((p) => (
            <button key={p} type="button" onClick={() => { onChange(p); onClose(); }} style={{
              padding: "8px 13px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
              border: `1px solid ${C.border}`, background: C.surface2, color: C.text2,
              fontSize: 13, fontWeight: 600, maxWidth: "100%",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{p}</button>
          ))}
        </div>
      )}
      <button onClick={onClose} style={whiteBtn(C)}>Done</button>
    </Sheet>
  );
}

/* Three currencies as one segmented pill — three separate chips pushed the
   row onto a second line. */
function CurrencyToggle({ value, onChange }) {
  const C = useTheme();
  return (
    <div style={{
      display: "inline-flex", background: C.surface2, borderRadius: 999,
      padding: 3, gap: 2, flexShrink: 0, height: 36, alignItems: "center",
    }}>
      {CURRENCIES.map((c) => (
        <button
          key={c}
          type="button"
          /* keep focus put: blurring closes the keyboard and the layout jumps */
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => onChange(c)}
          style={{
            padding: "0 11px", height: 30, borderRadius: 999, border: "none", cursor: "pointer",
            fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, letterSpacing: "0.01em",
            background: value === c ? C.primary : "transparent",
            color: value === c ? C.onPrimary : C.text2,
          }}>{c}</button>
      ))}
    </div>
  );
}

/* The lending controls, shared by the + screen's Lend tab and the Lending
   page's new-entry screen so the two cannot drift apart. */
function LendingFields({
  lendKind, setLendKind, person, onOpenPerson,
  moveMoney, setMoveMoney, showMoveMoney = true,
  accountId, setAccountId, accounts,
  currency, amount,
}) {
  const C = useTheme();
  const sym = CURRENCY_SYMBOL[currency] || "";
  return (
    <div style={{ flexShrink: 0, marginBottom: 14 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {[["receivable", "I lent money"], ["payable", "I borrowed money"]].map(([id, label]) => (
          <Chip key={id} active={lendKind === id} onClick={() => setLendKind(id)}
            style={{ padding: "9px 14px", fontSize: 12.5 }}>{label}</Chip>
        ))}
        <Chip active={!!person} onClick={onOpenPerson}
          style={{ padding: "9px 14px", fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}>
          <User size={13} />
          {person || "Add name"}
        </Chip>
      </div>

      {showMoveMoney && (
        <div style={{ ...sheetCardStyle(C), padding: 14, marginTop: 12 }}>
          <div onClick={() => setMoveMoney(!moveMoney)}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, cursor: "pointer" }}>
            <span style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>
              {lendKind === "receivable" ? "Also take it out of an account" : "Also add it to an account"}
            </span>
            <Toggle on={moveMoney} onChange={setMoveMoney} />
          </div>
          <div style={{ fontSize: 12, color: C.text3, marginTop: 6, lineHeight: 1.45 }}>
            {moveMoney
              ? "A record will be added so the account balance stays right."
              : "Leave off if you already logged this movement yourself."}
          </div>
          {moveMoney && accounts && setAccountId && (
            <div style={{ marginTop: 12 }} onClick={(e) => e.stopPropagation()}>
              <select value={accountId} onChange={(e) => setAccountId(e.target.value)} style={selectStyle(C)}>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name} · {a.currency}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      <div style={{ fontSize: 12.5, color: C.text3, lineHeight: 1.5, marginTop: 10, padding: "0 2px" }}>
        {lendKind === "receivable"
          ? `${person || "They"} will owe you ${sym}${fmtNumber(amount)}.`
          : `You will owe ${person || "them"} ${sym}${fmtNumber(amount)}.`}
      </div>
    </div>
  );
}

/* ---- note & payee ---- */

function NoteSheet({ open, onClose, note, setNote, payee, setPayee, showPayee }) {
  const C = useTheme();
  return (
    <Sheet open={open} onClose={onClose} title="Note" z={70}>
      {showPayee && (
        <Field label="Payee">
          <input value={payee} onChange={(e) => setPayee(e.target.value)} placeholder="Who was this with?" style={inputStyle(C)} />
        </Field>
      )}
      <Field label="Note">
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="What was it for?"
          onKeyDown={(e) => e.key === "Enter" && onClose()} style={inputStyle(C)} />
      </Field>
      <button onClick={onClose} style={{ ...whiteBtn(C), marginTop: 8 }}>Done</button>
    </Sheet>
  );
}

/* ---- account ---- */

function RecordSheet({ open, onClose, onSave, onSaveLending, onDelete, accounts, rates, categories, initial, defaultAccountId, onFieldsChange, people = [] }) {
  const C = useTheme();
  const fields = { ...DEFAULT_SETTINGS.fields, ...(useSettings().fields || {}) };
  const [type, setType] = useState("expense");
  const [accountId, setAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("0");
  const [toAmount, setToAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(fmtDateTimeLocal(new Date().toISOString()));
  const [note, setNote] = useState("");
  const [payee, setPayee] = useState("");
  const [sub, setSub] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [lendKind, setLendKind] = useState("receivable");
  const [person, setPerson] = useState("");
  const [moveMoney, setMoveMoney] = useState(true);
  const [lendCurrency, setLendCurrency] = useState("EUR");
  const [repeatFreq, setRepeatFreq] = useState("none");
  const [repeatEnd, setRepeatEnd] = useState(null);

  const catList = type === "income" ? categories.income : categories.expense;

  useEffect(() => {
    if (!open) return;
    setSub(null);
    if (initial) {
      setType(initial.type);
      setAccountId(initial.accountId || accounts[0]?.id || "");
      setToAccountId(initial.toAccountId || "");
      setAmount(String(initial.amount ?? "0"));
      setToAmount(String(initial.toAmount ?? ""));
      setCategory(initial.category || "");
      setDate(fmtDateTimeLocal(initial.date));
      setNote(initial.note || ""); setPayee(initial.payee || "");
    } else {
      const start = defaultAccountId || accounts[0]?.id || "";
      setType("expense"); setAccountId(start);
      setToAccountId(accounts.find((a) => a.id !== start)?.id || "");
      setAmount("0"); setToAmount("");
      setCategory(categories.expense[0]?.name || "");
      setDate(fmtDateTimeLocal(new Date().toISOString()));
      setNote(""); setPayee("");
    }
    setRepeatFreq("none");
    setRepeatEnd(null);
    setConfirmDelete(false);
    setLendKind("receivable");
    setPerson("");
    setMoveMoney(true);
    setLendCurrency((accounts.find((a) => a.id === (defaultAccountId || accounts[0]?.id)) || {}).currency || "EUR");
  }, [open, initial, accounts, defaultAccountId]);

  const account = accounts.find((a) => a.id === accountId);
  const toAccount = accounts.find((a) => a.id === toAccountId);

  /* picking a lending currency selects an account that holds it */
  useEffect(() => {
    if (type !== "lending") return;
    const match = accounts.find((a) => a.currency === lendCurrency);
    if (match && match.id !== accountId) setAccountId(match.id);
  }, [lendCurrency, type, accounts]);

  useEffect(() => {
    if (type === "transfer" && account && toAccount && amount !== "0") {
      const v = parseFloat(amount) || 0;
      setToAmount(account.currency !== toAccount.currency
        ? convert(v, account.currency, toAccount.currency, rates).toFixed(2)
        : amount);
    }
  }, [amount, accountId, toAccountId, type]);

  if (!open) return null;

  const numeric = parseFloat(amount) || 0;
  const canSave = accountId && numeric > 0
    && (type !== "transfer" || (toAccountId && toAccountId !== accountId))
    && (type !== "lending" || !!person.trim());

  const d = new Date(date);
  const today = new Date();
  const yest = new Date(); yest.setDate(yest.getDate() - 1);
  const isToday = d.toDateString() === today.toDateString();
  const dateLabel = isToday ? "Today" : d.toDateString() === yest.toDateString() ? "Yesterday" : fmtDate(date);

  const handleSave = () => {
    if (!canSave) return;
    if (type === "lending") {
      /* a loan is its own object; the account movement is optional */
      onSaveLending({
        id: uid(), kind: lendKind, person: person.trim(),
        amount: numeric, currency: lendCurrency,
        date: new Date(date).toISOString(), note, payments: [],
      }, moveMoney ? accountId : null);
      onClose();
      return;
    }
    onSave({
      id: initial?.id || uid(), type, accountId,
      toAccountId: type === "transfer" ? toAccountId : undefined,
      amount: numeric,
      toAmount: type === "transfer" ? parseFloat(toAmount || amount) : undefined,
      category: type === "transfer" ? undefined : category,
      date: new Date(date).toISOString(), note, payee,
    }, !initial && repeatFreq !== "none" ? { freq: repeatFreq, endDate: repeatEnd } : null);
    onClose();
  };

  const amtColor = type === "income" ? C.income
    : type === "lending" ? (lendKind === "receivable" ? C.income : C.expense)
    : C.text;

  const menuItems = [
    { label: "Activity fields", icon: <FileText size={16} />, action: () => setSub("fields") },
    { label: "Reset amount", icon: <Delete size={16} />, action: () => setAmount("0") },
    ...(initial ? [{ label: "Delete record", icon: <Trash2 size={16} />, danger: true,
        action: () => setConfirmDelete(true) }] : []),
  ];

  return (
    <>
      <FullScreen
        open={open}
        onClose={onClose}
        title={initial ? "Edit record" : "New record"}
        right={
          <>
            {initial && (
              <button onClick={() => setConfirmDelete(true)}
                style={{ ...roundBtn(C), color: C.expense }} aria-label="Delete record">
                <Trash2 size={17} />
              </button>
            )}
            {!initial && (
              <button onClick={() => setSub("repeat")} aria-label="Repeat"
                style={{ ...roundBtn(C), color: repeatFreq === "none" ? C.text : C.mint,
                  borderColor: repeatFreq === "none" ? C.border : C.mint }}>
                <RefreshCw size={17} />
              </button>
            )}
            <button onClick={() => setMenuOpen(true)} style={roundBtn(C)} aria-label="More options">
              <MoreHorizontal size={18} />
            </button>
          </>
        }>

        <div style={{ display: "flex", background: C.surface2, borderRadius: 999, padding: 4, marginBottom: 4, flexShrink: 0 }}>
          {(initial ? ["expense", "income", "transfer"] : ["expense", "income", "transfer", "lending"]).map((t) => (
            <button key={t} onClick={() => {
              setType(t);
              if (t === "expense" || t === "income") setCategory(((t === "income" ? categories.income : categories.expense)[0] || {}).name || "");
            }} style={{
              flex: 1, padding: "10px 0", borderRadius: 999, border: "none", cursor: "pointer",
              fontWeight: 600, fontSize: 12.5, textTransform: "capitalize", fontFamily: "inherit",
              background: type === t ? C.primary : "transparent",
              color: type === t ? C.onPrimary : C.text2,
            }}>{t === "lending" ? "Lend" : t}</button>
          ))}
        </div>

        <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", overflowY: "auto" }}>
          <AmountReadout value={amount} currency={type === "lending" ? lendCurrency : account?.currency} color={amtColor}
            onBack={() => setAmount((v) => pressKey(v, "back"))} />
        </div>

        <div style={{ display: "flex", flexWrap: "nowrap", gap: 8, paddingBottom: 12, flexShrink: 0, overflowX: "auto", alignItems: "center" }}>
          <Chip active={!isToday} onClick={() => setSub("date")} style={{ padding: "9px 14px", fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}>
            <Calendar size={14} />
            {dateLabel}
          </Chip>
          {(fields.note || fields.payee) && (
            <Chip active={!!(note || payee)} onClick={() => setSub("note")} style={{ padding: "9px 14px", fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}>
              <FileText size={14} />
              {note || payee || "Add note"}
            </Chip>
          )}
          {repeatFreq !== "none" && (
            <Chip active onClick={() => setSub("repeat")}
              style={{ padding: "9px 14px", fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}>
              <RefreshCw size={13} />
              {(FREQS.find((f) => f.id === repeatFreq) || {}).label}
            </Chip>
          )}
          {fields.account && type !== "lending" && (
            <Chip onClick={() => setSub("account")} style={{ padding: "9px 14px", fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}>
              <Landmark size={14} />
              {account?.name || "Account"}
            </Chip>
          )}
          {type === "lending" && (
            <CurrencyToggle value={lendCurrency} onChange={setLendCurrency} />
          )}
          {type === "transfer" && (
            <Chip onClick={() => setSub("toAccount")} style={{ padding: "9px 14px", fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}>
              <ArrowRight size={14} />
              {toAccount?.name || "To account"}
            </Chip>
          )}
        </div>

        {(type === "expense" || type === "income") && (
          <div style={{ flexShrink: 0 }}>
            <CategoryStrip categories={catList} value={category}
              onPick={setCategory} onOpenAll={() => setSub("category")} />
          </div>
        )}

        {type === "lending" && (
          <LendingFields
            lendKind={lendKind} setLendKind={setLendKind}
            person={person} onOpenPerson={() => setSub("person")}
            moveMoney={moveMoney} setMoveMoney={setMoveMoney}
            accountId={accountId} setAccountId={setAccountId} accounts={accounts}
            currency={lendCurrency} amount={numeric} />
        )}

        {fields.converter && type === "transfer" && account && toAccount && account.currency !== toAccount.currency && (
          <div style={{ ...sheetCardStyle(C), padding: 14, marginBottom: 14, flexShrink: 0 }}>
            <Field label={`Received amount in ${toAccount.currency}`}>
              <input value={toAmount} onChange={(e) => setToAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                inputMode="decimal" style={inputStyle(C)} />
            </Field>
            <div style={{ fontSize: 12.5, color: C.text3 }}>
              Converted at your saved rate — edit it if the bank used a different one.
            </div>
          </div>
        )}

        <div style={{ flexShrink: 0 }}>
          <Keypad value={amount} onChange={setAmount} onSubmit={handleSave} submitDisabled={!canSave} />
        </div>
      </FullScreen>

      <MenuPopover open={menuOpen} onClose={() => setMenuOpen(false)} items={menuItems} />

      <ActivityFieldsSheet open={sub === "fields"} onClose={() => setSub(null)}
        fields={fields} onChange={onFieldsChange} />

      {/* money records are not deleted on a single tap */}
      <ConfirmSheet
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete record"
        message={initial
          ? `Permanently delete this ${initial.type} of ${fmtNumber(initial.amount)}${initial.category ? " in " + initial.category : ""}? This cannot be undone.`
          : ""}
        confirmLabel="Delete record"
        danger
        onConfirm={() => { onDelete(initial.id); onClose(); }} />

      <PersonPickSheet open={sub === "person"} onClose={() => setSub(null)}
        value={person} onChange={setPerson} people={people} kind={lendKind} />

      <RepeatSheet open={sub === "repeat"} onClose={() => setSub(null)}
        freq={repeatFreq} setFreq={setRepeatFreq}
        endDate={repeatEnd} setEndDate={setRepeatEnd} />

      <CategorySheet open={sub === "category"} onClose={() => setSub(null)}
        categories={catList} value={category} onPick={setCategory} />
      <DateSheet open={sub === "date"} onClose={() => setSub(null)} value={date} onChange={setDate} />
      <NoteSheet open={sub === "note"} onClose={() => setSub(null)}
        note={note} setNote={setNote} payee={payee} setPayee={setPayee} showPayee={fields.payee && type !== "transfer"} />
      <OptionSheet open={sub === "account"} onClose={() => setSub(null)} title="Account"
        options={accounts.map((a) => accountOption(a, C))} value={accountId} onPick={setAccountId} />
      <OptionSheet open={sub === "toAccount"} onClose={() => setSub(null)} title="To account"
        options={accounts.filter((a) => a.id !== accountId).map((a) => accountOption(a, C))}
        value={toAccountId} onPick={setToAccountId} />
    </>
  );
}

/* ================================ balance adjust ================================ */

function BalanceAdjustSheet({ open, onClose, account, currentBalance, onAdjustByRecord, onChangeInitialBalance }) {
  const C = useTheme();
  const [sign, setSign] = useState("positive");
  const [value, setValue] = useState("0");
  const [mode, setMode] = useState("record");

  useEffect(() => {
    if (!open) return;
    setSign(currentBalance < 0 ? "negative" : "positive");
    setValue(String(Math.abs(currentBalance).toFixed(2)));
    setMode("record");
  }, [open, currentBalance]);

  if (!open || !account) return null;

  const target = (sign === "negative" ? -1 : 1) * (parseFloat(value) || 0);
  const delta = Math.round((target - currentBalance) * 100) / 100;

  const apply = () => {
    if (delta !== 0) {
      if (mode === "record") onAdjustByRecord(delta);
      else onChangeInitialBalance(account.opening + delta);
    }
    onClose();
  };

  const Option = ({ id, title, desc }) => (
    <div onClick={() => setMode(id)} style={{ padding: 14, cursor: "pointer", borderTop: id === "record" ? "none" : `1px solid ${C.border}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 14.5, fontWeight: 600, color: C.text }}>{title}</span>
        {mode === id && <Check size={18} color={C.mint} />}
      </div>
      <div style={{ fontSize: 12, color: C.text3, marginTop: 6, lineHeight: 1.45 }}>{desc}</div>
    </div>
  );

  return (
    <FullScreen open={open} onClose={onClose} title="Balance" z={65}>
      <div style={{ display: "flex", background: C.surface2, borderRadius: 999, padding: 4, marginBottom: 4, flexShrink: 0 }}>
        {["positive", "negative"].map((s) => (
          <button key={s} onClick={() => setSign(s)} style={{
            flex: 1, padding: "10px 0", borderRadius: 999, border: "none", cursor: "pointer",
            fontWeight: 600, fontSize: 13, textTransform: "capitalize", fontFamily: "inherit",
            background: sign === s ? C.primary : "transparent", color: sign === s ? C.onPrimary : C.text2,
          }}>{s}</button>
        ))}
      </div>

      <div style={{ flexShrink: 0 }}>
        <AmountReadout value={value} currency={account.currency}
          color={target < 0 ? C.expense : C.income} onBack={() => setValue((v) => pressKey(v, "back"))} />
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        <div style={{ fontSize: 12, color: C.text3, margin: "0 2px 10px" }}>Choose how to adjust your balance</div>
        <div style={{ ...sheetCardStyle(C), padding: 0, overflow: "hidden", marginBottom: 16 }}>
          <Option id="record" title="Adjust by record" desc="Creates a correction record for the difference. Use this if you forgot to track a few expenses." />
          <Option id="initial" title="Change initial balance" desc="Changes the account's opening balance directly, with no new record. Use this if you haven't tracked at all." />
        </div>
      </div>

      <div style={{ flexShrink: 0, paddingTop: 8 }}>
        <Keypad value={value} onChange={setValue} onSubmit={apply} />
      </div>
    </FullScreen>
  );
}

/* ================================ account form ================================ */

function AccountFormSheet({ open, onClose, onSubmit, onDelete, initial }) {
  const C = useTheme();
  const [form, setForm] = useState({ name: "", type: "checking", currency: "EUR", opening: "", emoji: "", excluded: false });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (initial) setForm({ name: initial.name, type: initial.type, currency: initial.currency, opening: String(initial.opening), emoji: initial.emoji || "", excluded: !!initial.excluded });
    else setForm({ name: "", type: "checking", currency: "EUR", opening: "", emoji: "", excluded: false });
    setError("");
  }, [open, initial]);

  const submit = () => {
    if (!form.name.trim()) { setError("Give the account a name."); return; }
    onSubmit({
      name: form.name.trim(), type: form.type, currency: form.currency,
      opening: parseFloat(form.opening) || 0,
      emoji: form.emoji.trim() || accountEmoji({ type: form.type }),
      excluded: form.excluded,
    });
  };

  return (
    <Sheet open={open} onClose={onClose} title={initial ? "Edit account" : "New account"}
      right={initial ? <button onClick={() => onDelete(initial.id)} style={{ ...roundBtn(C), color: C.expense }}><Trash2 size={17} /></button> : null}>
      <Field label="Account type">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {ACCOUNT_TYPES.map((t) => {
            const active = form.type === t.id;
            return (
              <button key={t.id} onClick={() => setForm((f) => ({
                ...f, type: t.id,
                emoji: !f.emoji || f.emoji === accountEmoji({ type: f.type }) ? t.emoji : f.emoji,
              }))} style={{
                display: "flex", alignItems: "center", gap: 10, padding: 13, borderRadius: 14, cursor: "pointer",
                border: active ? `1.5px solid ${C.primary}` : `1px solid ${C.border}`,
                background: active ? C.selectedWash : C.surface2,
                color: C.text, fontFamily: "inherit", textAlign: "left",
              }}>
                <span style={{ fontSize: 16 }}>{t.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </Field>
      <Field label="Icon & name">
        <div style={{ display: "flex", gap: 8 }}>
          <input value={form.emoji} onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
            placeholder={accountEmoji({ type: form.type })}
            style={{ ...inputStyle(C), width: 66, textAlign: "center", flexShrink: 0, fontSize: 20 }} />
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Revolut" style={{ ...inputStyle(C), flex: 1 }} />
        </div>
      </Field>
      <Field label="Currency">
        <select value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} style={selectStyle(C)}>
          {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Opening balance">
        <input value={form.opening} onChange={(e) => setForm((f) => ({ ...f, opening: e.target.value.replace(/[^0-9.-]/g, "") }))} placeholder="0.00" inputMode="decimal" style={inputStyle(C)} />
      </Field>
      <div style={{ ...sheetCardStyle(C), padding: 14, marginBottom: 14 }}>
        <div onClick={() => setForm((f) => ({ ...f, excluded: !f.excluded }))}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, cursor: "pointer" }}>
          <span style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>Exclude from net worth</span>
          <Toggle on={form.excluded} onChange={(v) => setForm((f) => ({ ...f, excluded: v }))} />
        </div>
        <div style={{ fontSize: 12, color: C.text3, marginTop: 6, lineHeight: 1.45 }}>
          Keep tracking this account, but leave it out of your totals — for money you watch but do not own.
        </div>
      </div>

      {error && <div style={{ color: C.expense, fontSize: 12, marginBottom: 10 }}>{error}</div>}
      <button onClick={submit} style={whiteBtn(C)}>{initial ? "Save changes" : "Add account"}</button>
    </Sheet>
  );
}

/* ================================ transaction row ================================ */

function TxRow({ t, catByName, accountName, accountCur, onClick, forAccount, otherName, showDate }) {
  const C = useTheme();
  const cat = t.type === "transfer" ? null : catByName(t.category);
  const amt = forAccount ? signedForAccount(t, forAccount) : (t.type === "expense" ? -t.amount : t.amount);
  const title = t.type === "transfer"
    ? (forAccount ? (t.accountId === forAccount.id ? `To ${otherName(t)}` : `From ${otherName(t)}`) : `${accountName(t.accountId)} → ${accountName(t.toAccountId)}`)
    : (t.category || "Uncategorized");
  const sub = t.type === "transfer" ? "Transfer" : accountName(t.accountId);

  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 14px", cursor: "pointer" }}>
      {cat ? <Tile emoji={cat.emoji} color={cat.color} size={38} />
        : <Tile emoji="🔄" color={C.text2} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
        <div style={{ fontSize: 12, color: C.text3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {sub}{t.note ? " · " + t.note : ""}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <Money value={amt} currency={accountCur(t.accountId)} size={15.5}
          color={amt < 0 ? C.text : C.income} dec={2} />
        <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>
          {showDate
            ? new Date(t.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })
            : new Date(t.date).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

function RecurringSheet({ open, onClose, rules, accounts, categories, onStop }) {
  const C = useTheme();
  const catOf = (n) => [...categories.expense, ...categories.income].find((c) => c.name === n)
    || { emoji: "🔄", color: C.text3 };
  const accName = (id) => accounts.find((a) => a.id === id)?.name || "—";
  const accCur = (id) => accounts.find((a) => a.id === id)?.currency || "";
  const live = (rules || []).filter((r) => r.active);

  return (
    <Sheet open={open} onClose={onClose} title="Repeating records" z={68}>
      {live.length === 0 ? (
        <EmptyState text="Nothing repeats yet" />
      ) : (
        <>
          <p style={{ fontSize: 13, color: C.text3, textAlign: "center", margin: "-4px 0 16px", lineHeight: 1.5 }}>
            New records are added automatically when each one falls due.
          </p>
          <div style={{ ...sheetCardStyle(C), padding: 0, overflow: "hidden" }}>
            {live.map((r, i) => {
              const t = r.template || {};
              const cat = catOf(t.category);
              return (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", borderTop: i === 0 ? "none" : `1px solid ${C.border}` }}>
                  <Tile emoji={cat.emoji} color={cat.color} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.category || t.note || "Transfer"}
                    </div>
                    <div style={{ fontSize: 12, color: C.text3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {describeRule(r)} · {accName(t.accountId)}
                      {r.endDate ? ` · until ${fmtDate(r.endDate)}` : ""}
                    </div>
                  </div>
                  <Money value={t.amount || 0} currency={accCur(t.accountId)} size={14} color={C.text} dec={2} />
                  <button onClick={() => onStop(r.id)} aria-label="Stop repeating"
                    style={{ ...roundBtn(C), width: 30, height: 30, color: C.text3, marginLeft: 4 }}>
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 12, color: C.text3, lineHeight: 1.5, marginTop: 14 }}>
            Stopping a repeat leaves the records already created untouched.
          </div>
        </>
      )}
    </Sheet>
  );
}

/* Bring any saved ledger — old local copy, cloud row, imported file — up to
   the current shape. Returns how many repeating records were caught up. */
function hydrateLedger(p) {
  /* a backup or synced copy missing these would crash every balance */
  if (!p.baseCurrency) p.baseCurrency = "EUR";
  p.rates = { EUR: 1, USD: 1.08, BDT: 145, ...(p.rates || {}) };
  p.categories = {
    expense: normalizeCats(p.categories?.expense),
    income: normalizeCats(p.categories?.income),
  };
  if (!p.categories.expense.length) p.categories.expense = DEFAULT_EXPENSE.map(([n, e], i) => mkCat(n, e, i));
  if (!p.categories.income.length) p.categories.income = DEFAULT_INCOME.map(([n, e], i) => mkCat(n, e, i + 3));
  if (!p.budget) p.budget = { total: 0, allocations: {} };
  if (!Array.isArray(p.debts)) p.debts = [];
  if (!Array.isArray(p.recurring)) p.recurring = [];
  if (!Array.isArray(p.accounts)) p.accounts = [];
  if (!Array.isArray(p.transactions)) p.transactions = [];
  p.settings = { ...DEFAULT_SETTINGS, ...(p.settings || {}) };
  /* app lock was removed; drop any saved lock settings */
  delete p.settings.lock;
  /* write any repeats that fell due while the app was closed */
  const caught = materializeRecurring(p.recurring, p.transactions);
  if (caught.added > 0) {
    p.transactions = caught.transactions;
    p.recurring = caught.rules;
  }
  return caught.added;
}

/* Decide where this session's ledger comes from. Pure so it can be tested:
   `loadRow` and `readLocal` are injected.
   Returns { p, fromCloud, cloudReachable, updatedAt } or { blocked: true }. */
async function resolveLedger({ cloudEnabled, userId, loadRow, readLocal, legacyKey, userKey }) {
  let p = null, fromCloud = false, cloudReachable = true, updatedAt = null;
  if (cloudEnabled) {
    try {
      const row = await loadRow(userId);
      if (row && row.data) { p = row.data; fromCloud = true; updatedAt = row.updated_at; }
    } catch { cloudReachable = false; }
  }
  if (!p) p = await readLocal(userKey);
  /* first sign-in on a device that already has records: bring them along */
  if (!p && cloudEnabled && cloudReachable) p = await readLocal(legacyKey);
  /* no server and no copy here: starting empty would overwrite the real
     ledger on the next save, so refuse */
  if (!p && cloudEnabled && !cloudReachable) return { blocked: true };
  return { p, fromCloud, cloudReachable, updatedAt };
}

/* ================================ privacy & account deletion ================================ */

function PrivacyPolicyBody() {
  const C = useTheme();
  return (
    <div style={{ paddingBottom: 30 }}>
      <div style={{ fontSize: 12.5, color: C.text3, marginBottom: 18 }}>Last updated {PRIVACY_UPDATED}</div>
      {privacySections().map((sec) => (
        <div key={sec.h} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 7 }}>{sec.h}</div>
          {sec.p.map((para, i) => (
            <p key={i} style={{ fontSize: 14, lineHeight: 1.6, color: C.text2, margin: "0 0 9px" }}>{para}</p>
          ))}
        </div>
      ))}
    </div>
  );
}

function PrivacySheet({ open, onClose, z = 90 }) {
  return (
    <FullScreen open={open} onClose={onClose} title="Privacy policy" z={z}>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingTop: 10 }}>
        <PrivacyPolicyBody />
      </div>
    </FullScreen>
  );
}

function DeleteAccountSheet({ open, onClose, email, onExport, onDelete }) {
  const C = useTheme();
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (open) { setTyped(""); setError(""); setBusy(false); } }, [open]);

  const ready = typed.trim().toUpperCase() === "DELETE" && !busy;

  const go = async () => {
    if (!ready) return;
    setBusy(true); setError("");
    try {
      await onDelete();
    } catch (e) {
      const m = ((e && e.message) || "").toLowerCase();
      setError(m.includes("delete_my_account") || m.includes("function")
        ? "Account deletion isn't set up on the server yet. Run the updated supabase-setup.sql in Supabase, then try again."
        : friendlyAuthError(e));
      setBusy(false);
    }
  };

  return (
    <FullScreen open={open} onClose={busy ? () => {} : onClose} title="Delete account" z={80}>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingTop: 10 }}>
        <div style={{ ...sheetCardStyle(C), padding: 16, borderColor: C.expense, marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.expense, marginBottom: 8 }}>{"This can't be undone"}</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.55, color: C.text2 }}>
            Your account <b style={{ color: C.text }}>{email}</b> and every record synced to it are deleted
            permanently: accounts, records, budgets, repeating records and lending. The copy on this device
            is removed too.
          </div>
        </div>

        <button onClick={onExport} disabled={busy}
          style={{ ...whiteBtn(C), background: C.surface2, color: C.text, marginBottom: 20,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Download size={16} /> Download a backup first
        </button>

        <Field label="Type DELETE to confirm">
          <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="DELETE"
            autoCapitalize="characters" autoComplete="off" autoCorrect="off" spellCheck={false}
            onKeyDown={(e) => e.key === "Enter" && go()}
            style={{ ...inputStyle(C), minWidth: 0 }} />
        </Field>

        {error && <div role="alert" style={{ fontSize: 13, color: C.expense, margin: "0 2px 14px", lineHeight: 1.45 }}>{error}</div>}

        <button onClick={go} disabled={!ready} style={{
          ...whiteBtn(C), background: ready ? C.expense : C.surface2,
          color: ready ? "#fff" : C.text3, cursor: ready ? "pointer" : "default",
        }}>{busy ? "Deleting…" : "Delete my account"}</button>
      </div>
    </FullScreen>
  );
}

/* ================================ sign in ================================ */

/* Supabase's raw messages are written for developers; say it plainly. */
function friendlyAuthError(err) {
  const m = ((err && err.message) || "").toLowerCase();
  if (m.includes("invalid login")) return "That email and password don't match.";
  if (m.includes("email not confirmed")) return "Confirm your email first — the link is in your inbox.";
  if (m.includes("already registered") || m.includes("already been registered")) return "There's already an account with this email. Sign in instead.";
  if (m.includes("password") && m.includes("6")) return "Use at least 6 characters for the password.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many tries. Wait a minute and try again.";
  if (m.includes("fetch") || m.includes("network")) return "Can't reach the server. Check your connection.";
  return (err && err.message) || "Something went wrong. Try again.";
}

function authCss(C, mode) {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    :root { color-scheme: ${mode}; }
    * { box-sizing: border-box; -webkit-text-size-adjust: 100%; }
    html, body { background: ${C.bgBot}; margin: 0; }
    input { font-size: 16px; font-family: inherit; }
    input:focus { border-color: ${C.text3} !important; }
    input::placeholder { color: ${C.text3}; }
    button { font-family: inherit; }
  `;
}

/* Shared frame for the sign-in, new-password and error screens. */
function AuthFrame({ mode, title, subtitle, children }) {
  const C = useTheme();
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "32px 20px",
      background: `linear-gradient(180deg, ${C.sheetTop} 0%, ${C.bgBot} 45%, ${C.bgBot} 100%)`,
      color: C.text, fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
    }}>
      <style>{authCss(C, mode)}</style>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{
          width: 58, height: 58, borderRadius: 18, margin: "0 auto 18px",
          background: C.heroBg, color: C.heroText,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}><HexNut size={24} /></div>
        <div style={{ textAlign: "center", fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>{title}</div>
        {subtitle && (
          <div style={{ textAlign: "center", fontSize: 14, color: C.text2, marginTop: 7, lineHeight: 1.5 }}>{subtitle}</div>
        )}
        <div style={{ marginTop: 26 }}>{children}</div>
      </div>
    </div>
  );
}

function PasswordInput({ value, onChange, placeholder, autoComplete, onEnter }) {
  const C = useTheme();
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"} value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onEnter && onEnter()}
        placeholder={placeholder} autoComplete={autoComplete}
        style={{ ...inputStyle(C), paddingRight: 48, minWidth: 0 }} />
      <button type="button" onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        style={{
          position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
          width: 36, height: 36, border: "none", background: "transparent", cursor: "pointer",
          color: C.text3, display: "flex", alignItems: "center", justifyContent: "center",
        }}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button>
    </div>
  );
}

function AuthScreen({ mode, notice }) {
  const C = useTheme();
  const [view, setView] = useState("signin"); // signin | signup | reset
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState(notice || "");
  const [showPolicy, setShowPolicy] = useState(false);
  useEffect(() => { if (notice) setInfo(notice); }, [notice]);

  const go = (v) => { setView(v); setError(""); setInfo(""); };
  const emailOk = /^\S+@\S+\.\S+$/.test(email.trim());

  const submit = async () => {
    if (busy) return;
    setError(""); setInfo("");
    if (!emailOk) { setError("Enter a valid email address."); return; }
    if (view !== "reset" && password.length < 6) { setError("Use at least 6 characters for the password."); return; }
    setBusy(true);
    try {
      if (view === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        /* onAuthStateChange in App takes it from here */
      } else if (view === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: { emailRedirectTo: window.location.origin + window.location.pathname },
        });
        if (error) throw error;
        if (!data.session) {
          setInfo("Check your inbox and tap the link to confirm your account, then sign in here.");
          setView("signin"); setPassword("");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin + window.location.pathname,
        });
        if (error) throw error;
        setInfo("If that email has an account, a reset link is on its way.");
      }
    } catch (e) { setError(friendlyAuthError(e)); }
    finally { setBusy(false); }
  };

  const titles = {
    signin: ["Welcome back", "Sign in to see your accounts on any device."],
    signup: ["Create your account", "Your records sync across your phone and computer."],
    reset: ["Reset your password", "We'll email you a link to choose a new one."],
  };
  const button = { signin: "Sign in", signup: "Create account", reset: "Send reset link" }[view];
  const link = { background: "none", border: "none", cursor: "pointer", color: C.mint, fontSize: 14, fontWeight: 600, padding: 4 };

  return (
    <AuthFrame mode={mode} title={titles[view][0]} subtitle={titles[view][1]}>
      {view !== "reset" && (
        <div style={{ display: "flex", background: C.surface2, borderRadius: 999, padding: 4, marginBottom: 18 }}>
          {[["signin", "Sign in"], ["signup", "Create account"]].map(([id, label]) => (
            <button key={id} onClick={() => go(id)} style={{
              flex: 1, padding: "10px 0", borderRadius: 999, border: "none", cursor: "pointer",
              fontWeight: 600, fontSize: 13.5,
              background: view === id ? C.primary : "transparent",
              color: view === id ? C.onPrimary : C.text2,
            }}>{label}</button>
          ))}
        </div>
      )}

      <Field label="Email">
        <input type="email" inputMode="email" autoComplete="email" autoCapitalize="none"
          value={email} onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="you@example.com" style={{ ...inputStyle(C), minWidth: 0 }} />
      </Field>

      {view !== "reset" && (
        <Field label="Password">
          <PasswordInput value={password} onChange={setPassword} onEnter={submit}
            placeholder={view === "signup" ? "At least 6 characters" : "Your password"}
            autoComplete={view === "signup" ? "new-password" : "current-password"} />
        </Field>
      )}

      {error && <div role="alert" style={{ fontSize: 13, color: C.expense, margin: "2px 2px 14px", lineHeight: 1.45 }}>{error}</div>}
      {info && <div style={{ fontSize: 13, color: C.mint, margin: "2px 2px 14px", lineHeight: 1.45 }}>{info}</div>}

      <button onClick={submit} disabled={busy}
        style={{ ...whiteBtn(C), opacity: busy ? 0.6 : 1, cursor: busy ? "default" : "pointer" }}>
        {busy ? "Please wait…" : button}
      </button>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        {view === "signin" && <button style={link} onClick={() => go("reset")}>Forgot password?</button>}
        {view === "reset" && <button style={link} onClick={() => go("signin")}>Back to sign in</button>}
      </div>
      <div style={{ textAlign: "center", marginTop: 22, fontSize: 12.5, color: C.text3, lineHeight: 1.5 }}>
        {view === "signup" ? "By creating an account you agree to the " : ""}
        <button onClick={() => setShowPolicy(true)} style={{ ...link, fontSize: 12.5, color: C.text2, padding: 0, textDecoration: "underline" }}>
          {view === "signup" ? "privacy policy" : "Privacy policy"}
        </button>
        {view === "signup" ? "." : ""}
      </div>
      <PrivacySheet open={showPolicy} onClose={() => setShowPolicy(false)} />
    </AuthFrame>
  );
}

/* Shown after following a password-reset email link. */
function NewPasswordScreen({ mode, onDone }) {
  const C = useTheme();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setError("");
    if (pw.length < 6) { setError("Use at least 6 characters for the password."); return; }
    if (pw !== pw2) { setError("The two passwords don't match."); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;
      onDone();
    } catch (e) { setError(friendlyAuthError(e)); }
    finally { setBusy(false); }
  };

  return (
    <AuthFrame mode={mode} title="Choose a new password" subtitle="You'll use it to sign in from now on.">
      <Field label="New password">
        <PasswordInput value={pw} onChange={setPw} placeholder="At least 6 characters" autoComplete="new-password" />
      </Field>
      <Field label="Repeat it">
        <PasswordInput value={pw2} onChange={setPw2} onEnter={save} placeholder="Same password again" autoComplete="new-password" />
      </Field>
      {error && <div role="alert" style={{ fontSize: 13, color: C.expense, margin: "2px 2px 14px" }}>{error}</div>}
      <button onClick={save} disabled={busy} style={{ ...whiteBtn(C), opacity: busy ? 0.6 : 1 }}>
        {busy ? "Saving…" : "Save password"}
      </button>
    </AuthFrame>
  );
}

/* When the server can't be reached and there's no copy on this device, we
   must not start an empty ledger — saving it would wipe the real one. */
function CloudErrorScreen({ mode, onRetry, onSignOut,
  title = "Can't load your records",
  subtitle = "The server didn't respond. Your data is safe — nothing has been changed." }) {
  const C = useTheme();
  return (
    <AuthFrame mode={mode} title={title} subtitle={subtitle}>
      <button onClick={onRetry} style={whiteBtn(C)}>Try again</button>
      {onSignOut && <div style={{ textAlign: "center", marginTop: 16 }}>
        <button onClick={onSignOut} style={{ background: "none", border: "none", cursor: "pointer", color: C.text3, fontSize: 14, fontWeight: 600 }}>
          Sign out
        </button>
      </div>}
    </AuthFrame>
  );
}

/* ================================ Home ================================ */

function Home({ accounts, transactions, categories, budget, debts, rates, base, onOpenSettings, onToggleHide, onGoto, onOpenRecord }) {
  const C = useTheme();
  const settings = useSettings();
  const text = useAmountText();
  const { monthStartDay } = settings;

  const accCur = (id) => accounts.find((a) => a.id === id)?.currency || base;
  const conv = (t) => toBase(t.amount, accCur(t.accountId), rates) * rates[base];

  const netWorth = netWorthAt(accounts, transactions, rates, base);
  /* Home always reports the month you are actually in. Browsing history on
     another tab must not quietly rewrite a card headed "THIS MONTH". */
  const thisMonth = useMemo(() => new Date(), []);
  const counted = useMemo(() => countableTransactions(transactions, accounts), [transactions, accounts]);
  const monthTx = useMemo(
    () => filterByRange(counted, "month", thisMonth, monthStartDay),
    [counted, thisMonth, monthStartDay]);

  const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + conv(t), 0);
  const spent = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + conv(t), 0);
  const net = income - spent;

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning." : hour < 18 ? "Good afternoon." : "Good evening.";
  const dateLine = now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }).toUpperCase();

  const accName = (id) => accounts.find((a) => a.id === id)?.name || "—";
  const catByName = (n) => [...categories.expense, ...categories.income].find((c) => c.name === n) || { emoji: "🏷️", color: C.text3 };
  const totals = debtTotals(debts || [], rates, base);
  const recent = useMemo(
    () => [...counted].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
    [counted]);

  const limit = budget.total || 0;
  const remaining = limit - spent;
  const pct = limit ? Math.min(100, (spent / limit) * 100) : 0;
  const over = remaining < 0;
  const monthLabel = thisMonth.toLocaleDateString(undefined, { month: "long" });

  const sym = CURRENCY_SYMBOL[base] || "";
  const money = (v, signed) => settings.hideBalances
    ? "••••"
    : (signed && v > 0 ? "+" : "") + (v < 0 ? "-" : "") + sym + text(Math.abs(v), { compact: false });

  return (
    <div style={{ paddingTop: 6 }}>
      {/* greeting */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 22 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: C.mint, letterSpacing: "0.12em", marginBottom: 8 }}>{dateLine}</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: C.text, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{greeting}</div>
          <div style={{ fontSize: 14.5, color: C.text2, marginTop: 6 }}>Here is your money at a glance.</div>
        </div>
        <button onClick={onOpenSettings} aria-label="Settings" style={{
          width: 46, height: 46, borderRadius: 14, border: "none", cursor: "pointer", flexShrink: 0,
          background: C.heroBg, color: C.heroText,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}><HexNut size={20} /></button>
      </div>

      {/* total balance */}
      <div style={{ background: C.heroBg, borderRadius: 22, padding: "20px 20px 18px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: C.heroMuted, letterSpacing: "0.1em" }}>TOTAL BALANCE</span>
          <button onClick={onToggleHide} aria-label={settings.hideBalances ? "Show balances" : "Hide balances"}
            style={{ background: "none", border: "none", cursor: "pointer", color: C.heroText, opacity: 0.75, padding: 0, display: "flex" }}>
            {settings.hideBalances ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, color: C.heroText, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          {money(netWorth)}
        </div>
        <div style={{ height: 1, background: C.heroLine, margin: "18px 0 14px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: C.heroMuted, letterSpacing: "0.08em", marginBottom: 5 }}>THIS MONTH</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.heroText }}>{money(net, true)}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: C.heroMuted, letterSpacing: "0.08em", marginBottom: 5 }}>ACCOUNTS</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.heroText }}>{accounts.length}</div>
          </div>
        </div>
      </div>

      {/* income / spent */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 26 }}>
        {[
          { label: "Income", value: income, signed: true, color: C.mint, Icon: ArrowDownLeft },
          { label: "Spent", value: spent, signed: false, color: C.expense, Icon: ArrowUpRight },
        ].map(({ label, value, signed, color, Icon }) => (
          <div key={label} onClick={() => onGoto("activity")} style={{ ...sheetCardStyle(C), padding: 16, cursor: "pointer" }}>
            <Icon size={20} color={color} strokeWidth={2.4} />
            <div style={{ fontSize: 13.5, color: C.text2, margin: "16px 0 6px" }}>{label}</div>
            <div style={{ fontSize: 19, fontWeight: 800, color: C.text, letterSpacing: "-0.01em" }}>{money(value, signed)}</div>
          </div>
        ))}
      </div>

      {/* budget */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12, gap: 10 }}>
        <span style={{ fontSize: 19, fontWeight: 800, color: C.text, letterSpacing: "-0.01em" }}>{monthLabel} budget</span>
        {limit > 0 && <span style={{ fontSize: 13.5, color: C.text3 }}>{money(limit)} limit</span>}
      </div>

      {limit > 0 ? (
        <div onClick={() => onGoto("budget")} style={{ ...sheetCardStyle(C), padding: 18, cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: over ? C.expense : C.text }}>
              {money(Math.abs(remaining))} {over ? "over" : "remaining"}
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: over ? C.expense : C.mint }}>{Math.round(pct)}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: C.surface3, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: over ? C.expense : C.mint }} />
          </div>
        </div>
      ) : (
        <div onClick={() => onGoto("budget")} style={{ ...sheetCardStyle(C), padding: 18, cursor: "pointer" }}>
          <div style={{ fontSize: 14.5, color: C.text2, lineHeight: 1.5 }}>
            No budget set for {monthLabel}. Tap to set a monthly spending limit.
          </div>
        </div>
      )}

      {(totals.receivable > 0 || totals.payable > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
          <div onClick={() => onGoto("debts")} style={{ ...sheetCardStyle(C), padding: 16, cursor: "pointer" }}>
            <div style={{ fontSize: 12.5, color: C.text3, marginBottom: 6 }}>To collect</div>
            <Money value={totals.receivable} currency={base} size={17} color={C.income} />
          </div>
          <div onClick={() => onGoto("debts")} style={{ ...sheetCardStyle(C), padding: 16, cursor: "pointer" }}>
            <div style={{ fontSize: 12.5, color: C.text3, marginBottom: 6 }}>To repay</div>
            <Money value={totals.payable} currency={base} size={17} color={C.expense} />
          </div>
        </div>
      )}

      <div onClick={() => onGoto("debts")} style={{
        ...sheetCardStyle(C), padding: "15px 16px", marginTop: 14, cursor: "pointer",
        display: "flex", alignItems: "center", gap: 13,
      }}>
        <Tile emoji="🤝" color={C.mint} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Lending</div>
          <div style={{ fontSize: 12.5, color: C.text3 }}>Money you lent out or borrowed</div>
        </div>
        <ChevronRight size={17} color={C.text3} />
      </div>

      <div onClick={() => onGoto("analytics")} style={{
        ...sheetCardStyle(C), padding: "15px 16px", marginTop: 14, cursor: "pointer",
        display: "flex", alignItems: "center", gap: 13,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11, background: C.surface3, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center", color: C.text2,
        }}><BarChart3 size={17} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Analytics</div>
          <div style={{ fontSize: 12.5, color: C.text3 }}>Net worth trend, cash flow</div>
        </div>
        <ChevronRight size={17} color={C.text3} />
      </div>

      {recent.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "26px 0 12px", gap: 10 }}>
            <span style={{ fontSize: 19, fontWeight: 800, color: C.text, letterSpacing: "-0.01em" }}>Recent activity</span>
            <button onClick={() => onGoto("activity")} style={{
              background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
              fontSize: 13.5, fontWeight: 600, color: C.mint, padding: 0,
            }}>See all</button>
          </div>
          <div style={{ ...sheetCardStyle(C), padding: 0, overflow: "hidden" }}>
            {recent.map((t, i) => (
              <div key={t.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${C.border}` }}>
                <TxRow t={t} catByName={catByName} accountName={accName} accountCur={accCur}
                  onClick={() => onOpenRecord(t)} showDate />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ================================ Debts ================================ */

function DebtFormSheet({ open, onClose, onSubmit, onDelete, initial, prefill, accounts, base, people = [] }) {
  const C = useTheme();
  const [kind, setKind] = useState("receivable");
  const [person, setPerson] = useState("");
  const [amount, setAmount] = useState("0");
  const [currency, setCurrency] = useState(base);
  const [date, setDate] = useState(fmtDateTimeLocal(new Date().toISOString()));
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [dateOpen, setDateOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [personOpen, setPersonOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [alsoRecord, setAlsoRecord] = useState(false);
  const [accountId, setAccountId] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    if (initial) {
      setKind(initial.kind); setPerson(initial.person);
      setAmount(String(initial.amount)); setCurrency(initial.currency);
      setDate(fmtDateTimeLocal(initial.date)); setNote(initial.note || "");
    } else if (prefill) {
      /* adding another loan for someone already in the list */
      setKind(prefill.kind); setPerson(prefill.person); setAmount("0");
      setCurrency(prefill.currencies[0] || base);
      setDate(fmtDateTimeLocal(new Date().toISOString())); setNote("");
    } else {
      setKind("receivable"); setPerson(""); setAmount("0");
      setCurrency(base); setDate(fmtDateTimeLocal(new Date().toISOString())); setNote("");
    }
    setAlsoRecord(false);
    setDateOpen(false);
  }, [open, initial, prefill, base]);

  /* default to an account in the same currency */
  useEffect(() => {
    const match = accounts.find((a) => a.currency === currency);
    setAccountId(match ? match.id : accounts[0]?.id || "");
  }, [currency, accounts, open]);

  if (!open) return null;

  const numeric = parseFloat(amount) || 0;
  const paid = initial ? debtPaid(initial) : 0;

  /* names already in the list, so the same person is not typed twice */
  const typed = person.trim().toLowerCase();
  const suggestions = people
    .filter((p) => p.toLowerCase() !== typed)
    .filter((p) => !typed || p.toLowerCase().includes(typed))
    .slice(0, 6);

  /* identical box for every chip in the row */

  const d0 = new Date(date);
  const today0 = new Date();
  const yest0 = new Date(); yest0.setDate(yest0.getDate() - 1);
  const isToday = d0.toDateString() === today0.toDateString();
  const dateLabel = isToday ? "Today"
    : d0.toDateString() === yest0.toDateString() ? "Yesterday" : fmtDate(date);

  const submit = () => {
    if (!person.trim()) { setError(kind === "receivable" ? "Add who you lent it to." : "Add who you borrowed it from."); return; }
    if (numeric <= 0) { setError("Enter an amount above zero."); return; }
    if (numeric < paid) { setError(fmtNumber(paid) + " has already been paid back, so the total cannot be lower."); return; }
    onSubmit({
      id: initial?.id || uid(), kind, person: person.trim(), amount: numeric,
      currency, date: new Date(date).toISOString(), note,
      payments: initial?.payments || [],
    }, !initial && alsoRecord ? accountId : null);
    onClose();
  };

  return (
    <FullScreen open={open} onClose={onClose} title={initial ? "Edit entry" : "New entry"} z={66}
      right={initial ? <button onClick={() => setConfirmDelete(true)} style={{ ...roundBtn(C), color: C.expense }}><Trash2 size={17} /></button> : null}>
      <ConfirmSheet
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete entry"
        message={initial ? `Delete this entry with ${initial.person}, including its repayment history? This cannot be undone.` : ""}
        confirmLabel="Delete entry"
        danger
        onConfirm={() => onDelete(initial.id)} />

      <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", overflowY: "auto" }}>
        <AmountReadout value={amount} currency={currency}
          color={kind === "receivable" ? C.income : C.expense}
          onBack={() => setAmount((v) => pressKey(v, "back"))} />
      </div>

      <div style={{ display: "flex", flexWrap: "nowrap", gap: 8, paddingBottom: 12, flexShrink: 0, overflowX: "auto", alignItems: "center" }}>
        <Chip active={!isToday} onClick={() => setDateOpen(true)}
          style={{ padding: "9px 14px", fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}>
          <Calendar size={14} />{dateLabel}
        </Chip>
        <Chip active={!!note} onClick={() => setNoteOpen(true)}
          style={{ padding: "9px 14px", fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}>
          <FileText size={14} />{note || "Add note"}
        </Chip>
        <CurrencyToggle value={currency} onChange={setCurrency} />
      </div>

      <LendingFields
        lendKind={kind} setLendKind={setKind}
        person={person} onOpenPerson={() => setPersonOpen(true)}
        moveMoney={alsoRecord} setMoveMoney={setAlsoRecord}
        showMoveMoney={!initial}
        accountId={accountId} setAccountId={setAccountId} accounts={accounts}
        currency={currency} amount={numeric} />

      {error && <div style={{ color: C.expense, fontSize: 13, marginBottom: 10, flexShrink: 0 }}>{error}</div>}

      <div style={{ flexShrink: 0, paddingTop: 4 }}>
        <Keypad value={amount} onChange={setAmount} onSubmit={submit} submitDisabled={numeric <= 0} />
      </div>

      <DateSheet open={dateOpen} onClose={() => setDateOpen(false)} value={date} onChange={setDate} z={74} />
      <NoteSheet open={noteOpen} onClose={() => setNoteOpen(false)}
        note={note} setNote={setNote} payee="" setPayee={() => {}} showPayee={false} />
      <PersonPickSheet open={personOpen} onClose={() => setPersonOpen(false)}
        value={person} onChange={setPerson} people={people} kind={kind} />
    </FullScreen>
  );
}

function DebtDetailSheet({ open, onClose, debt, accounts, onAddPayment, onEdit, onDelete }) {
  const C = useTheme();
  const [amount, setAmount] = useState("0");
  const [alsoRecord, setAlsoRecord] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [accountId, setAccountId] = useState("");

  useEffect(() => {
    if (!open || !debt) return;
    setAmount(String(debtRemaining(debt)));
    setAlsoRecord(false);
    const match = accounts.find((a) => a.currency === debt.currency);
    setAccountId(match ? match.id : accounts[0]?.id || "");
  }, [open, debt, accounts]);

  if (!open || !debt) return null;

  const remaining = debtRemaining(debt);
  const paid = debtPaid(debt);
  const pct = debt.amount ? Math.min(100, (paid / debt.amount) * 100) : 0;
  const numeric = parseFloat(amount) || 0;
  const receivable = debt.kind === "receivable";

  return (
    <FullScreen open={open} onClose={onClose} title={debt.person} z={67}
      right={<button onClick={() => onEdit(debt)} style={roundBtn(C)}><Pencil size={16} /></button>}>

      {/* scrolling band: summary, history and options */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
      <div style={{ ...sheetCardStyle(C), padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 12.5, color: C.text3, marginBottom: 6 }}>
          {receivable ? "Left to collect" : "Left to repay"}
        </div>
        <Money value={remaining} currency={debt.currency} size={26}
          color={remaining === 0 ? C.text3 : receivable ? C.income : C.expense} dec={2} />
        <div style={{ height: 7, borderRadius: 999, background: C.surface3, overflow: "hidden", margin: "14px 0 8px" }}>
          <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: receivable ? C.income : C.expense }} />
        </div>
        <div style={{ fontSize: 12.5, color: C.text3 }}>
          {fmtNumber(paid)} of {fmtNumber(debt.amount)} {debt.currency} {receivable ? "collected" : "repaid"} · since {fmtDate(debt.date)}
        </div>
        {debt.note && <div style={{ fontSize: 13, color: C.text2, marginTop: 8 }}>{debt.note}</div>}
      </div>

      {(debt.payments || []).length > 0 && (
        <>
          <div style={{ fontSize: 12.5, color: C.text3, margin: "0 4px 8px" }}>{receivable ? "Payments received" : "Payments made"}</div>
          <div style={{ ...sheetCardStyle(C), padding: 0, overflow: "hidden", marginBottom: 16 }}>
            {debt.payments.map((p, i) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderTop: i === 0 ? "none" : `1px solid ${C.border}` }}>
                <span style={{ fontSize: 13.5, color: C.text2 }}>{fmtDate(p.date)}</span>
                <Money value={p.amount} currency={debt.currency} size={14} color={C.text} dec={2} />
              </div>
            ))}
          </div>
        </>
      )}

      {remaining > 0 && (
        <div style={{ ...sheetCardStyle(C), padding: 14, marginBottom: 12 }}>
          {/* only the label row toggles; the select must not bubble up to it */}
          <div onClick={() => setAlsoRecord((v) => !v)}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, cursor: "pointer" }}>
            <span style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>
              Also add it to an account balance
            </span>
            <Toggle on={alsoRecord} onChange={setAlsoRecord} />
          </div>
          <div style={{ fontSize: 12, color: C.text3, marginTop: 6, lineHeight: 1.45 }}>
            {alsoRecord
              ? "A record will be added so the account balance stays right."
              : "Leave off if you already logged this payment yourself."}
          </div>
          {alsoRecord && (
            <div style={{ marginTop: 12 }} onClick={(e) => e.stopPropagation()}>
              <select value={accountId} onChange={(e) => setAccountId(e.target.value)} style={selectStyle(C)}>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name} · {a.currency}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      {remaining <= 0 && (
        <div style={{ textAlign: "center", color: C.mint, fontSize: 14.5, fontWeight: 600, padding: "8px 0 16px" }}>
          {receivable ? "Fully paid back to you" : "Fully paid off"}
        </div>
      )}

      <button onClick={() => setConfirmDelete(true)} style={{ ...whiteBtn(C), background: C.surface2, color: C.expense, marginTop: 4, marginBottom: 8 }}>
        Delete this entry
      </button>
      <ConfirmSheet
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete entry"
        message={`Delete this entry with ${debt.person}, including its repayment history? This cannot be undone.`}
        confirmLabel="Delete entry"
        danger
        onConfirm={() => onDelete(debt.id)} />
      </div>

      {remaining > 0 && (
        <div style={{ flexShrink: 0, paddingTop: 8 }}>
          <div style={{ fontSize: 12.5, color: C.text3, margin: "0 4px 2px", textAlign: "center" }}>
            {receivable ? "Record money you got back" : "Record money you paid back"}
          </div>
          <AmountReadout value={amount} currency={debt.currency} color={C.text}
            onBack={() => setAmount((v) => pressKey(v, "back"))} />
          <Keypad value={amount} onChange={setAmount}
            submitDisabled={numeric <= 0}
            onSubmit={() => {
              onAddPayment(debt.id, numeric, alsoRecord ? accountId : null);
              onClose();
            }} />
        </div>
      )}
    </FullScreen>
  );
}

function PersonSheet({ open, onClose, group, base, onOpenEntry, onAddAnother }) {
  const C = useTheme();
  if (!open || !group) return null;
  const receivable = group.kind === "receivable";
  return (
    <FullScreen open={open} onClose={onClose} title={group.person} z={64}
      right={<button onClick={onAddAnother} style={roundBtn(C)} aria-label="Add another"><Plus size={18} /></button>}>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        <div style={{ ...sheetCardStyle(C), padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: C.text3, marginBottom: 6 }}>
            {receivable ? "Left to collect in total" : "Left to repay in total"}
          </div>
          <Money value={group.remainingBase} currency={base} size={26}
            color={group.settled ? C.text3 : receivable ? C.income : C.expense} dec={2} />
          <div style={{ fontSize: 12, color: C.text3, marginTop: 8 }}>
            Across {group.entries.length} {group.entries.length === 1 ? "entry" : "entries"}
            {group.currencies.length > 1 ? " · " + group.currencies.join(", ") : ""}
          </div>
        </div>

        <div style={{ fontSize: 12, color: C.text3, margin: "0 4px 8px" }}>
          {receivable ? "Each time they took money" : "Each time you borrowed"}
        </div>
        <div style={{ ...sheetCardStyle(C), padding: 0, overflow: "hidden" }}>
          {group.entries.map((d, i) => {
            const remaining = debtRemaining(d);
            const paid = debtPaid(d);
            const pct = d.amount ? Math.min(100, (paid / d.amount) * 100) : 0;
            return (
              <div key={d.id} onClick={() => onOpenEntry(d.id)}
                style={{ padding: "13px 14px", cursor: "pointer", borderTop: i === 0 ? "none" : `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: C.text }}>{fmtDate(d.date)}</div>
                    <div style={{ fontSize: 12, color: C.text3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {fmtNumber(d.amount)} {d.currency}
                      {debtIsSettled(d) ? " · settled" : paid > 0 ? ` · ${fmtNumber(paid)} back` : ""}
                      {d.note ? " · " + d.note : ""}
                    </div>
                  </div>
                  <Money value={remaining} currency={d.currency} size={14.5}
                    color={debtIsSettled(d) ? C.text3 : receivable ? C.income : C.expense} dec={2} />
                  <ChevronRight size={16} color={C.text3} />
                </div>
                {paid > 0 && !debtIsSettled(d) && (
                  <div style={{ height: 4, borderRadius: 999, background: C.surface3, overflow: "hidden", marginTop: 10 }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: receivable ? C.income : C.expense }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </FullScreen>
  );
}

function Debts({ debts, accounts, rates, base, onBack, onAdd, onEdit, onDelete, onAddPayment }) {
  const C = useTheme();
  const [tab, setTab] = useState("receivable");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null);
  const [person, setPerson] = useState(null);
  const [prefillPerson, setPrefillPerson] = useState(null);

  const totals = debtTotals(debts, rates, base);
  const groups = groupDebtsByPerson(debts, rates, base);
  const people = useMemo(() => {
    const seen = new Map();
    for (const d of [...debts].sort((a, b) => new Date(b.date) - new Date(a.date))) {
      const k = d.person.trim().toLowerCase();
      if (k && !seen.has(k)) seen.set(k, d.person.trim());
    }
    return Array.from(seen.values());
  }, [debts]);
  const list = tab === "settled"
    ? groups.filter((g) => g.settled)
    : groups.filter((g) => !g.settled && g.kind === tab);

  const detailDebt = detail ? debts.find((d) => d.id === detail) : null;
  const personGroup = person ? groups.find((g) => g.key === person) : null;

  /* the cards double as tab switches, and show which one is active */
  const Card = ({ label, value, color, tabId }) => {
    const on = tab === tabId;
    return (
      <div onClick={() => setTab(tabId)} style={{
        ...sheetCardStyle(C), padding: 16, cursor: "pointer",
        background: on ? color + "1F" : C.surface,
        borderColor: on ? color : C.border,
      }}>
        <div style={{ fontSize: 12, color: on ? color : C.text3, marginBottom: 7, fontWeight: on ? 600 : 400 }}>{label}</div>
        <Money value={value} currency={base} size={20} color={color} />
      </div>
    );
  };

  return (
    <div style={{ paddingTop: 4 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button onClick={onBack} style={roundBtn(C)} aria-label="Back"><ChevronLeft size={19} /></button>
        <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>Lending</div>
        <button onClick={() => { setEditing(null); setPrefillPerson(null); setFormOpen(true); }} style={roundBtn(C)} aria-label="New entry"><Plus size={19} /></button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
        <Card label="To collect" value={totals.receivable} color={C.income} tabId="receivable" />
        <Card label="To repay" value={totals.payable} color={C.expense} tabId="payable" />
      </div>

      <div style={{ display: "flex", gap: 9, overflowX: "auto", paddingBottom: 16 }}>
        <Chip active={tab === "receivable"} onClick={() => setTab("receivable")}>To collect</Chip>
        <Chip active={tab === "payable"} onClick={() => setTab("payable")}>To repay</Chip>
        <Chip active={tab === "settled"} onClick={() => setTab("settled")}>Settled</Chip>
      </div>

      {list.length === 0 ? (
        <EmptyState text={
          tab === "settled" ? "Nothing fully paid back yet"
            : tab === "receivable" ? "No one owes you money right now"
            : "You do not owe anyone right now"
        } />
      ) : (
        <div style={{ ...sheetCardStyle(C), padding: 0, overflow: "hidden" }}>
          {list.map((g, i) => {
            const receivable = g.kind === "receivable";
            const paidPct = g.totalBase ? Math.min(100, ((g.totalBase - g.remainingBase) / g.totalBase) * 100) : 0;
            const many = g.entries.length > 1;
            return (
              <div key={g.key} onClick={() => setPerson(g.key)}
                style={{ padding: "13px 14px", cursor: "pointer", borderTop: i === 0 ? "none" : `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Tile emoji={receivable ? "📤" : "📥"} color={receivable ? C.income : C.expense} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.person}</div>
                    <div style={{ fontSize: 12, color: C.text3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {many ? `${g.entries.length} times · latest ${fmtDate(g.lastDate)}` : `${receivable ? "Lent" : "Borrowed"} ${fmtDate(g.lastDate)}`}
                    </div>
                  </div>
                  <Money value={g.remainingBase} currency={base} size={14.5}
                    color={g.settled ? C.text3 : receivable ? C.income : C.expense} dec={2} />
                  <ChevronRight size={16} color={C.text3} />
                </div>
                {paidPct > 0 && !g.settled && (
                  <div style={{ height: 4, borderRadius: 999, background: C.surface3, overflow: "hidden", marginTop: 10 }}>
                    <div style={{ width: `${paidPct}%`, height: "100%", background: receivable ? C.income : C.expense }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <PersonSheet open={!!personGroup} onClose={() => setPerson(null)} group={personGroup} base={base}
        onOpenEntry={(id) => setDetail(id)}
        onAddAnother={() => { setEditing(null); setPrefillPerson(personGroup); setFormOpen(true); }} />

      <DebtFormSheet open={formOpen} onClose={() => setFormOpen(false)} initial={editing}
        prefill={prefillPerson} accounts={accounts} base={base} people={people}
        onSubmit={(d, acctId) => (editing ? onEdit(d) : onAdd(d, acctId))}
        onDelete={(id) => { onDelete(id); setFormOpen(false); setDetail(null); }} />

      <DebtDetailSheet open={!!detailDebt} onClose={() => setDetail(null)} debt={detailDebt}
        accounts={accounts} onAddPayment={onAddPayment}
        onEdit={(d) => { setDetail(null); setEditing(d); setFormOpen(true); }}
        onDelete={(id) => { onDelete(id); setDetail(null); }} />
    </div>
  );
}

/* ================================ Activity ================================ */

function Activity({ accounts, transactions, categories, rates, base, range, setRange, monthCursor, setMonthCursor, customRange, setCustomRange, onOpenEdit }) {
  const C = useTheme();
  const { monthStartDay } = useSettings();
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [kind, setKind] = useState("all");
  const [accFilter, setAccFilter] = useState(null);
  const [picker, setPicker] = useState(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [sort, setSort] = useState("date-desc");

  const accCur = (id) => accounts.find((a) => a.id === id)?.currency || base;
  const accName = (id) => accounts.find((a) => a.id === id)?.name || "—";
  const catByName = (n) => [...categories.expense, ...categories.income].find((c) => c.name === n) || { emoji: "🏷️", color: C.text3 };
  const nameOf = (t) => t.type === "transfer"
    ? `${accName(t.accountId)} → ${accName(t.toAccountId)}`
    : (t.category || "Uncategorized");

  /* filtering to a specific account shows that account in full, even if excluded */
  const source = useMemo(
    () => (accFilter ? transactions : countableTransactions(transactions, accounts)),
    [transactions, accounts, accFilter]);
  const inRange = useMemo(() => filterByRange(source, range, monthCursor, monthStartDay, customRange), [source, range, monthCursor, monthStartDay, customRange]);

  const filtered = useMemo(() => inRange
    .filter((t) => kind === "all" ? true : t.type === kind)
    .filter((t) => !accFilter || t.accountId === accFilter || t.toAccountId === accFilter)
    .filter((t) => {
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (t.category || "").toLowerCase().includes(s) || (t.note || "").toLowerCase().includes(s) || (t.payee || "").toLowerCase().includes(s);
    })
    , [inRange, kind, accFilter, search]);

  const sorted = useMemo(
    () => sortTransactions(filtered, sort, { accCur, rates, base, nameOf }),
    [filtered, sort, rates, base]);

  /* Day headers only make sense while the list is in date order. */
  const dateOrdered = sort === "date-desc" || sort === "date-asc";

  /* Headline reflects the selected type: money spent, money in, or the net of both. */
  const { total, totalLabel } = useMemo(() => {
    const sum = (type) => filtered
      .filter((t) => t.type === type)
      .reduce((s, t) => s + toBase(t.amount, accCur(t.accountId), rates) * rates[base], 0);
    const out = sum("expense");
    const inc = sum("income");
    if (kind === "expense") return { total: out, totalLabel: "Spent" };
    if (kind === "income") return { total: inc, totalLabel: "Received" };
    if (kind === "transfer") {
      const moved = filtered.filter((t) => t.type === "transfer")
        .reduce((s, t) => s + toBase(t.amount, accCur(t.accountId), rates) * rates[base], 0);
      return { total: moved, totalLabel: "Moved" };
    }
    return { total: inc - out, totalLabel: "Net" };
  }, [filtered, kind, rates, base]);

  const grouped = groupByDay(sorted);

  return (
    <div>
      {/* the whole header is the swipe target, not just the bars */}
      <SwipeMonths
        enabled={range === "month"}
        onPrev={() => setMonthCursor((c) => { const d = new Date(c); d.setMonth(d.getMonth() - 1); return d; })}
        onNext={() => setMonthCursor((c) => { const d = new Date(c); d.setMonth(d.getMonth() + 1); return d; })}>
        <div style={{ textAlign: "center", paddingTop: 4 }}>
          {range === "month" ? (
            <MonthNav cursor={monthCursor} setCursor={setMonthCursor} />
          ) : (
            <div onClick={() => range === "custom" && setCustomOpen(true)}
              style={{ fontSize: 13, color: C.text2, fontWeight: 500, minHeight: 30, display: "flex",
                alignItems: "center", justifyContent: "center",
                cursor: range === "custom" ? "pointer" : "default" }}>
              {range === "custom" ? rangeLabel(range, customRange) : `Last ${rangeLabel(range, customRange)}`}
            </div>
          )}
          <div style={{ marginTop: 2 }}><BigAmount value={total} currency={base} size={35} /></div>
          <div style={{ fontSize: 12.5, color: C.text3, marginTop: 2 }}>{totalLabel}</div>
        </div>

        <div style={{ margin: "16px 0 34px" }}>
          <GhostBars transactions={transactions} monthCursor={monthCursor} accCur={accCur}
            rates={rates} base={base} barType={kind === "income" ? "income" : "expense"} />
        </div>
      </SwipeMonths>

      {/* one row: search toggle + three dropdowns */}
      <div style={{ display: "flex", gap: 9, overflowX: "auto", paddingBottom: 16 }}>
        <Chip onClick={() => setShowSearch((v) => !v)} active={showSearch} style={{ padding: "10px 13px" }}><Search size={16} /></Chip>
        <PickerChip active={kind !== "all"} onClick={() => setPicker("type")}
          label={(TX_TYPES.find((t) => t.id === kind) || TX_TYPES[0]).label} />
        <PickerChip active={range !== "month"} onClick={() => setPicker("range")}
          label={rangeLabel(range, customRange)} />
        <PickerChip active={!!accFilter} onClick={() => setPicker("account")}
          label={accFilter ? accName(accFilter) : "All accounts"} />
        <PickerChip active={sort !== "date-desc"} onClick={() => setPicker("sort")}
          label={(SORTS.find((x) => x.id === sort) || SORTS[0]).label} />
      </div>

      {showSearch && (
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search category, note, payee…" style={{ ...inputStyle(C), marginBottom: 16 }} />
      )}

      {accFilter && accounts.find((a) => a.id === accFilter)?.excluded && (
        <div style={{
          background: C.surface2, border: `1px solid ${C.border}`, color: C.text2,
          padding: "10px 14px", borderRadius: 12, fontSize: 12.5, marginBottom: 16, lineHeight: 1.45,
        }}>
          This account is excluded from your totals, so these records are not in your
          spending, income or budget figures.
        </div>
      )}

      <OptionSheet open={picker === "type"} onClose={() => setPicker(null)} title="Show"
        options={TX_TYPES.map((t) => ({ ...t, icon: optionIcon(t.iconId) }))} value={kind} onPick={setKind} />
      <OptionSheet open={picker === "range"} onClose={() => setPicker(null)} title="Period"
        options={RANGES.map((r) => ({ id: r.id, label: r.label, icon: optionIcon("period") }))}
        value={range}
        onPick={(id) => { setRange(id); if (id === "custom") setCustomOpen(true); }} />
      <CustomRangeSheet open={customOpen} onClose={() => setCustomOpen(false)}
        custom={customRange} onChange={setCustomRange} />
      <OptionSheet open={picker === "account"} onClose={() => setPicker(null)} title="Account"
        options={[{ id: "__all", label: "All accounts" }, ...accounts.map((a) => accountOption(a, C))]}
        value={accFilter || "__all"} onPick={(id) => setAccFilter(id === "__all" ? null : id)} />
      <OptionSheet open={picker === "sort"} onClose={() => setPicker(null)} title="Sort by"
        subtitle="Applies to the list below"
        options={SORTS.map((o) => ({
          ...o,
          icon: optionIcon(o.id.startsWith("date") ? "date" : o.id.startsWith("amount") ? "amount" : "name"),
        }))} value={sort} onPick={setSort} />

      {sorted.length === 0 && <EmptyState text="No transaction found" />}

      {dateOrdered ? grouped.map(([day, items]) => (
        <div key={day} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: C.text3, fontWeight: 500, marginBottom: 8, padding: "0 2px" }}>{fmtDate(items[0].date)}</div>
          <div style={{ ...sheetCardStyle(C), padding: 0, overflow: "hidden" }}>
            {items.map((t, i) => (
              <div key={t.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${C.border}` }}>
                <TxRow t={t} catByName={catByName} accountName={accName} accountCur={accCur} onClick={() => onOpenEdit(t)} />
              </div>
            ))}
          </div>
        </div>
      )) : (sorted.length > 0 && (
        <div style={{ ...sheetCardStyle(C), padding: 0, overflow: "hidden", marginBottom: 16 }}>
          {sorted.map((t, i) => (
            <div key={t.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${C.border}` }}>
              <TxRow t={t} catByName={catByName} accountName={accName} accountCur={accCur}
                onClick={() => onOpenEdit(t)} showDate />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* Tapping a category in Summary opens the records behind that number. */
function CategoryRecordsSheet({ open, onClose, category, records, accounts, base, rates, onOpenRecord, periodLabel }) {
  const C = useTheme();
  if (!open || !category) return null;

  const accName = (id) => accounts.find((a) => a.id === id)?.name || "—";
  const accCur = (id) => accounts.find((a) => a.id === id)?.currency || base;
  const total = records.reduce((s, t) => s + toBase(t.amount, accCur(t.accountId), rates) * rates[base], 0);
  const grouped = groupByDay([...records].sort((a, b) => new Date(b.date) - new Date(a.date)));

  return (
    <Sheet open={open} onClose={onClose} title={category.name} z={70}>
      <div style={{ ...sheetCardStyle(C), padding: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 13 }}>
        <Tile emoji={category.emoji} color={category.color} size={44} radius={13} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Money value={total} currency={base} size={21} color={C.text} />
          <div style={{ fontSize: 12, color: C.text3, marginTop: 3 }}>
            {records.length} {records.length === 1 ? "record" : "records"} · {periodLabel}
          </div>
        </div>
      </div>

      {grouped.map(([day, items]) => (
        <div key={day} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: C.text3, marginBottom: 8, padding: "0 2px" }}>{fmtDate(items[0].date)}</div>
          <div style={{ ...sheetCardStyle(C), padding: 0, overflow: "hidden" }}>
            {items.map((t, i) => (
              <div key={t.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${C.border}` }}>
                <TxRow t={t} catByName={() => category} accountName={accName} accountCur={accCur}
                  onClick={() => { onClose(); onOpenRecord(t); }} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </Sheet>
  );
}

/* ================================ Summary (donut) ================================ */

function Summary({ accounts, transactions, categories, rates, base, range, setRange, monthCursor, setMonthCursor, customRange, setCustomRange, onOpenRecord }) {
  const C = useTheme();
  const { monthStartDay } = useSettings();
  const [kind, setKind] = useState("expense");
  const [picker, setPicker] = useState(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [drill, setDrill] = useState(null);
  const accCur = (id) => accounts.find((a) => a.id === id)?.currency || base;
  const catList = kind === "income" ? categories.income : categories.expense;
  const catByName = (n) => catList.find((c) => c.name === n) || { emoji: "🏷️", color: C.text3, name: n };

  const counted = useMemo(() => countableTransactions(transactions, accounts), [transactions, accounts]);
  const inRange = useMemo(() => filterByRange(counted, range, monthCursor, monthStartDay, customRange), [counted, range, monthCursor, monthStartDay, customRange]);

  const rows = useMemo(() => {
    const map = new Map();
    for (const t of inRange.filter((t) => t.type === kind)) {
      const key = t.category || "Others";
      const v = toBase(t.amount, accCur(t.accountId), rates) * rates[base];
      const cur = map.get(key) || { value: 0, count: 0 };
      map.set(key, { value: cur.value + v, count: cur.count + 1 });
    }
    return Array.from(map.entries())
      .map(([name, d]) => ({ name, ...d, ...catByName(name) }))
      .sort((a, b) => b.value - a.value);
  }, [inRange, kind, rates, base, categories]);

  const total = rows.reduce((s, r) => s + r.value, 0);

  return (
    <div>
      <SwipeMonths
        enabled={range === "month"}
        onPrev={() => setMonthCursor((c) => { const d = new Date(c); d.setMonth(d.getMonth() - 1); return d; })}
        onNext={() => setMonthCursor((c) => { const d = new Date(c); d.setMonth(d.getMonth() + 1); return d; })}
        style={{ position: "relative", height: 300, marginBottom: 8 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={rows.length ? rows : [{ name: "none", value: 1, color: C.surface3 }]}
              dataKey="value" innerRadius="76%" outerRadius="92%" startAngle={90} endAngle={-270}
              paddingAngle={rows.length > 1 ? 3 : 0} stroke="none" cornerRadius={6}>
              {(rows.length ? rows : [{ color: C.surface3 }]).map((r, i) => <Cell key={i} fill={r.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          {range === "month" ? (
            <div style={{ pointerEvents: "auto" }}><MonthNav cursor={monthCursor} setCursor={setMonthCursor} /></div>
          ) : (
            /* stepping months means nothing for a rolling window like "12 weeks" */
            <div onClick={() => range === "custom" && setCustomOpen(true)}
              style={{ fontSize: 13, color: C.text2, fontWeight: 500, minHeight: 30, display: "flex", alignItems: "center", cursor: range === "custom" ? "pointer" : "default", textAlign: "center", padding: "0 30px" }}>
              {range === "custom" ? rangeLabel(range, customRange) : `Last ${rangeLabel(range, customRange)}`}
            </div>
          )}
          <BigAmount value={total} currency={base} size={32} />
        </div>
      </SwipeMonths>

      <div style={{ display: "flex", gap: 9, overflowX: "auto", paddingBottom: 18 }}>
        <PickerChip onClick={() => setPicker("kind")} label={kind === "income" ? "Income" : "Expenses"} />
        <PickerChip active={range !== "month"} onClick={() => setPicker("range")}
          label={rangeLabel(range, customRange)} />
      </div>

      <CategoryRecordsSheet
        open={!!drill}
        onClose={() => setDrill(null)}
        category={drill ? catByName(drill) : null}
        records={inRange.filter((t) => t.type === kind && (t.category || "Others") === drill)}
        accounts={accounts} base={base} rates={rates}
        onOpenRecord={onOpenRecord}
        periodLabel={range === "month"
          ? monthCursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })
          : rangeLabel(range, customRange)} />

      <OptionSheet open={picker === "kind"} onClose={() => setPicker(null)} title="Show"
        options={[
          { id: "expense", label: "Expenses", icon: optionIcon("expense") },
          { id: "income", label: "Income", icon: optionIcon("income") },
        ]}
        value={kind} onPick={setKind} />
      <OptionSheet open={picker === "range"} onClose={() => setPicker(null)} title="Period"
        options={RANGES.map((r) => ({ id: r.id, label: r.label, icon: optionIcon("period") }))}
        value={range}
        onPick={(id) => { setRange(id); if (id === "custom") setCustomOpen(true); }} />
      <CustomRangeSheet open={customOpen} onClose={() => setCustomOpen(false)}
        custom={customRange} onChange={setCustomRange} />

      {rows.length === 0 ? <EmptyState text="No transaction found" /> : (
        <div style={{ ...sheetCardStyle(C), padding: 0, overflow: "hidden" }}>
          {rows.map((r, i) => (
            <div key={r.name} onClick={() => setDrill(r.name)}
              style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 14px", cursor: "pointer", borderTop: i === 0 ? "none" : `1px solid ${C.border}` }}>
              <Tile emoji={r.emoji} color={r.color} size={38} />
              <span style={{ flex: 1, fontSize: 14.5, color: C.text, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
              <span style={{ fontSize: 11.5, color: C.text3, background: C.surface3, borderRadius: 8, padding: "2px 7px", marginRight: 2 }}>{r.count}</span>
              <Money value={r.value} currency={base} size={15.5} color={C.text} />
              <div style={{ marginLeft: 8 }}><Pct>{total ? ((r.value / total) * 100).toFixed(2) : "0.00"}%</Pct></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================ Budget ================================ */

function Ring({ pct, size = 240, stroke = 18, color, track, children }) {
  const C = useTheme();
  const fg = color || C.primary;
  const bg = track || C.surface3;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, pct));
  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={fg} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - clamped)} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}

function BudgetTotalSheet({ open, onClose, base, initial, onDone }) {
  const C = useTheme();
  const [value, setValue] = useState("0");
  useEffect(() => { if (open) setValue(String(initial || 0)); }, [open, initial]);
  return (
    <FullScreen open={open} onClose={onClose} title="Total spending budget" z={65}>
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <AmountReadout value={value} currency={base} color={C.text} onBack={() => setValue((v) => pressKey(v, "back"))} />
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <span style={{ ...roundBtn(C), width: "auto", padding: "9px 16px", borderRadius: 999, gap: 8, fontSize: 13, color: C.text2 }}>
          <Calendar size={15} /> Monthly on the 1st
        </span>
      </div>
      </div>
      <div style={{ flexShrink: 0 }}>
        <Keypad value={value} onChange={setValue} onSubmit={() => { onDone(parseFloat(value) || 0); onClose(); }}
          submitDisabled={!(parseFloat(value) > 0)} />
      </div>
    </FullScreen>
  );
}

function AllocateSheet({ open, onClose, base, total, categories, allocations, onConfirm }) {
  const C = useTheme();
  const [draft, setDraft] = useState({});
  const [editing, setEditing] = useState(null);
  const [entry, setEntry] = useState("0");

  useEffect(() => { if (open) { setDraft({ ...allocations }); setEditing(null); } }, [open, allocations]);

  const allocated = Object.values(draft).reduce((s, v) => s + (v || 0), 0);
  const left = total - allocated;
  const pctSet = total ? (allocated / total) * 100 : 0;

  return (
    <Sheet open={open} onClose={onClose} title="Allocate your budget" z={66}>
      <div style={{ ...sheetCardStyle(C), background: C.surface2, padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>{pctSet.toFixed(0)}% set</span>
          <span style={{ fontSize: 14, color: C.text }}>
            <Money value={allocated} currency={base} size={15} color={C.text} /> <span style={{ color: C.text3 }}>/</span> <Money value={total} currency={base} size={15} color={C.text3} />
          </span>
        </div>
        <div style={{ height: 5, borderRadius: 999, background: C.surface3, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ width: `${Math.min(100, pctSet)}%`, height: "100%", background: left < 0 ? C.expense : C.primary, borderRadius: 999 }} />
        </div>
        <div style={{ fontSize: 13.5, color: left < 0 ? C.expense : C.text }}>
          <Money value={Math.abs(left)} currency={base} size={14.5} color={left < 0 ? C.expense : C.text} />
          <span style={{ color: C.text3 }}> {left < 0 ? "over budget" : "left to allocate"}</span>
        </div>
      </div>

      <div style={{ ...sheetCardStyle(C), padding: 0, overflow: "hidden", marginBottom: 16 }}>
        {categories.map((c, i) => {
          const v = draft[c.name] || 0;
          const p = total ? (v / total) * 100 : 0;
          const isEditing = editing === c.name;
          return (
            <div key={c.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${C.border}` }}>
              <div onClick={() => { setEditing(isEditing ? null : c.name); setEntry(String(v || 0)); }}
                style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 14px", cursor: "pointer" }}>
                <Tile emoji={c.emoji} color={c.color} size={38} />
                <span style={{ flex: 1, fontSize: 14.5, color: C.text, fontWeight: 500 }}>{c.name}</span>
                <Money value={v} currency={base} size={15} color={v ? C.text : C.text3} />
                <div style={{ marginLeft: 8 }}><Pct>{p.toFixed(0)}%</Pct></div>
              </div>
              {isEditing && (
                <div style={{ padding: "0 14px 16px" }}>
                  <AmountReadout value={entry} currency={base} color={C.text} onBack={() => setEntry((x) => pressKey(x, "back"))} />
                  <Keypad value={entry} onChange={setEntry}
                    onSubmit={() => { setDraft((d) => ({ ...d, [c.name]: parseFloat(entry) || 0 })); setEditing(null); }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button onClick={() => { onConfirm(draft); onClose(); }} style={whiteBtn(C)}>Confirm</button>
    </Sheet>
  );
}

function Budget({ budget, categories, transactions, accounts, rates, base, monthCursor, setMonthCursor, onSetTotal, onSetAllocations }) {
  const C = useTheme();
  const { monthStartDay } = useSettings();
  const [totalOpen, setTotalOpen] = useState(false);
  const [allocOpen, setAllocOpen] = useState(false);

  const accCur = (id) => accounts.find((a) => a.id === id)?.currency || base;
  const monthTx = useMemo(
    () => filterByRange(countableTransactions(transactions, accounts), "month", monthCursor, monthStartDay)
      .filter((t) => t.type === "expense"),
    [transactions, accounts, monthCursor, monthStartDay]);

  const spentByCat = useMemo(() => {
    const map = {};
    for (const t of monthTx) {
      const k = t.category || "Others";
      map[k] = (map[k] || 0) + toBase(t.amount, accCur(t.accountId), rates) * rates[base];
    }
    return map;
  }, [monthTx, rates, base]);

  const spent = Object.values(spentByCat).reduce((s, v) => s + v, 0);
  const total = budget.total || 0;
  const left = total - spent;
  const allocatedCats = categories.expense.filter((c) => (budget.allocations || {})[c.name] > 0);

  if (!total) {
    return (
      <>
        <div style={{ textAlign: "center", padding: "40px 8px" }}>
          <Ring pct={0.72} size={200} stroke={16} color={C.mint} track={C.surface2}>
            <span style={{ fontSize: 27 }}>🎯</span>
          </Ring>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: "34px 0 12px", letterSpacing: "-0.02em" }}>Budgeting</h2>
          <p style={{ fontSize: 15, color: C.text2, lineHeight: 1.5, margin: "0 auto 30px", maxWidth: 320 }}>
            Set limits on how much you want to spend in each category.
          </p>
          <button onClick={() => setTotalOpen(true)} style={{ ...whiteBtn(C), background: `linear-gradient(90deg, ${C.gradFrom}, ${C.mint})`, color: C.onPrimary }}>
            Create budget
          </button>
        </div>
        <BudgetTotalSheet open={totalOpen} onClose={() => setTotalOpen(false)} base={base} initial={0}
          onDone={(v) => { onSetTotal(v); setAllocOpen(true); }} />
        <AllocateSheet open={allocOpen} onClose={() => setAllocOpen(false)} base={base} total={budget.total || 0}
          categories={categories.expense} allocations={budget.allocations || {}} onConfirm={onSetAllocations} />
      </>
    );
  }

  return (
    <>
      <div style={{ paddingTop: 6 }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
          <button onClick={() => setTotalOpen(true)} style={roundBtn(C)}><Pencil size={16} /></button>
        </div>

        <Ring pct={total ? spent / total : 0} size={240} stroke={18} color={left < 0 ? C.expense : C.primary}>
          <MonthNav cursor={monthCursor} setCursor={setMonthCursor} />
          <div style={{ fontSize: 12.5, color: C.text3, marginTop: 2 }}>Left this month</div>
          <div style={{ marginTop: 2 }}><BigAmount value={left} currency={base} size={29} /></div>
          <div style={{ fontSize: 13, color: left < 0 ? C.expense : C.mint, marginTop: 4 }}>
            {fmtCompact(spent)} / {fmtCompact(total)}
          </div>
        </Ring>

        <button onClick={() => setAllocOpen(true)} style={{ ...whiteBtn(C), background: C.surface2, color: C.text, margin: "28px 0 18px" }}>
          Allocate by category
        </button>

        {allocatedCats.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {allocatedCats.map((c) => {
              const limit = budget.allocations[c.name];
              const used = spentByCat[c.name] || 0;
              const rem = limit - used;
              return (
                <div key={c.id} style={{ ...sheetCardStyle(C), padding: 16, textAlign: "center" }}>
                  <Ring pct={limit ? used / limit : 0} size={78} stroke={7} color={rem < 0 ? C.expense : c.color} track={C.surface3}>
                    <span style={{ fontSize: 19 }}>{c.emoji}</span>
                  </Ring>
                  <div style={{ marginTop: 12 }}><BigAmount value={rem} currency={base} size={14} color={rem < 0 ? C.expense : C.text} /></div>
                  <div style={{ fontSize: 11.5, color: C.text3, marginTop: 2 }}>{c.name} {rem < 0 ? "over" : "left"}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BudgetTotalSheet open={totalOpen} onClose={() => setTotalOpen(false)} base={base} initial={total} onDone={onSetTotal} />
      <AllocateSheet open={allocOpen} onClose={() => setAllocOpen(false)} base={base} total={total}
        categories={categories.expense} allocations={budget.allocations || {}} onConfirm={onSetAllocations} />
    </>
  );
}

/* ================================ Analytics ================================ */

function Analytics({ accounts, transactions, categories, budget, rates, base, range, setRange, monthCursor, setMonthCursor, customRange, setCustomRange, onBack }) {
  const C = useTheme();
  const { monthStartDay } = useSettings();
  const [picker, setPicker] = useState(null);
  const [customOpen, setCustomOpen] = useState(false);
  const accCur = (id) => accounts.find((a) => a.id === id)?.currency || base;
  const counted = useMemo(() => countableTransactions(transactions, accounts), [transactions, accounts]);
  const inRange = useMemo(() => filterByRange(counted, range, monthCursor, monthStartDay, customRange), [counted, range, monthCursor, monthStartDay, customRange]);

  const spending = inRange.filter((t) => t.type === "expense").reduce((s, t) => s + toBase(t.amount, accCur(t.accountId), rates) * rates[base], 0);
  const income = inRange.filter((t) => t.type === "income").reduce((s, t) => s + toBase(t.amount, accCur(t.accountId), rates) * rates[base], 0);
  const netWorth = netWorthAt(accounts, transactions, rates, base);

  const series = useMemo(() => {
    const pts = [];
    for (let i = 30; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(23, 59, 59, 999);
      pts.push({ label: d.toLocaleDateString(undefined, { day: "numeric", month: "short" }), value: netWorthAt(accounts, transactions, rates, base, d.toISOString()) });
    }
    return pts;
  }, [accounts, transactions, rates, base]);

  const Stat = ({ label, value, color }) => (
    <div style={{ ...sheetCardStyle(C), padding: 16 }}>
      <div style={{ fontSize: 12, color: C.text3, marginBottom: 7 }}>{label}</div>
      <Money value={value} currency={base} size={21} color={color} />
    </div>
  );

  return (
    <div style={{ paddingTop: 4 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <button onClick={onBack} style={roundBtn(C)} aria-label="Back"><ChevronLeft size={19} /></button>
        <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>Analytics</div>
        <div style={{ width: 40 }} />
      </div>

      <MonthNav cursor={monthCursor} setCursor={setMonthCursor} />

      <div style={{ display: "flex", gap: 9, justifyContent: "center", padding: "14px 0 18px" }}>
        <PickerChip active={range !== "month"} onClick={() => setPicker("range")}
          label={rangeLabel(range, customRange)} />
      </div>

      <OptionSheet open={picker === "range"} onClose={() => setPicker(null)} title="Period"
        options={RANGES.map((r) => ({ id: r.id, label: r.label, icon: optionIcon("period") }))}
        value={range}
        onPick={(id) => { setRange(id); if (id === "custom") setCustomOpen(true); }} />
      <CustomRangeSheet open={customOpen} onClose={() => setCustomOpen(false)}
        custom={customRange} onChange={setCustomRange} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
        <Stat label="Net worth" value={netWorth} color={C.text} />
        <Stat label="Cash flow" value={income - spending} color={income - spending >= 0 ? C.income : C.expense} />
        <Stat label="Spending" value={spending} color={C.expense} />
        <Stat label="Income" value={income} color={C.income} />
      </div>

      <div style={{ ...sheetCardStyle(C), padding: "16px 8px 8px 0" }}>
        <div style={{ fontSize: 12, color: C.text3, marginBottom: 10, paddingLeft: 16 }}>Net worth · last 30 days</div>
        <div style={{ height: 190 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 6, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.mint} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={C.mint} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: C.text3 }} axisLine={false} tickLine={false} interval={7} />
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip formatter={(v) => [CURRENCY_SYMBOL[base] + fmtNumber(v), "Net worth"]}
                contentStyle={{ borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 11.5 }}
                labelStyle={{ color: C.text3 }} itemStyle={{ color: C.text }} />
              <Area type="monotone" dataKey="value" stroke={C.mint} strokeWidth={2.5} fill="url(#nwGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Insights
        accounts={accounts} transactions={transactions}
        categories={categories} budget={budget}
        rates={rates} base={base} monthCursor={monthCursor} />
    </div>
  );
}

/* ================================ Insights ================================ */

/* Month-level analysis shown under the net-worth chart. Everything is
   converted to the base currency and excluded accounts are left out, so the
   figures agree with the rest of the app. */
function Insights({ accounts, transactions, categories, budget, rates, base, monthCursor }) {
  const C = useTheme();
  const { monthStartDay } = useSettings();

  const data = useMemo(() => {
    const accCur = (id) => accounts.find((a) => a.id === id)?.currency || base;
    const conv = (t) => toBase(t.amount, accCur(t.accountId), rates) * rates[base];
    const counted = countableTransactions(transactions, accounts);
    const within = (t, a, b) => { const d = new Date(t.date); return d >= a && d < b; };
    const sum = (list, type) => list.filter((t) => t.type === type).reduce((n, t) => n + conv(t), 0);

    const [from, to] = monthWindow(monthCursor, monthStartDay);
    const prevCursor = new Date(monthCursor); prevCursor.setMonth(prevCursor.getMonth() - 1);
    const [pFrom, pTo] = monthWindow(prevCursor, monthStartDay);

    const monthTx = counted.filter((t) => within(t, from, to));
    const prevTx = counted.filter((t) => within(t, pFrom, pTo));

    const spend = sum(monthTx, "expense");
    const income = sum(monthTx, "income");
    const prevSpend = sum(prevTx, "expense");
    const prevIncome = sum(prevTx, "income");

    const now = new Date();
    const isCurrent = now >= from && now < to;
    const totalDays = Math.max(1, Math.round((to - from) / 86400000));
    const elapsed = isCurrent
      ? Math.max(1, Math.min(totalDays, Math.ceil((now - from) / 86400000)))
      : totalDays;
    const monthProgress = Math.min(100, (elapsed / totalDays) * 100);
    const perDay = spend / elapsed;

    /* six months ending at the selected one */
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const c = new Date(monthCursor); c.setMonth(c.getMonth() - i);
      const [a, b] = monthWindow(c, monthStartDay);
      const tx = counted.filter((t) => within(t, a, b));
      months.push({
        label: a.toLocaleDateString(undefined, { month: "short" }),
        spending: Math.round(sum(tx, "expense")),
        income: Math.round(sum(tx, "income")),
      });
    }
    const sixAvg = months.reduce((n, m) => n + m.spending, 0) / 6;

    /* expense categories this month, with last month for comparison */
    const byCat = new Map();
    for (const t of monthTx.filter((t) => t.type === "expense")) {
      const k = t.category || "Others";
      byCat.set(k, (byCat.get(k) || 0) + conv(t));
    }
    const prevByCat = new Map();
    for (const t of prevTx.filter((t) => t.type === "expense")) {
      const k = t.category || "Others";
      prevByCat.set(k, (prevByCat.get(k) || 0) + conv(t));
    }
    const allCats = [...categories.expense, ...categories.income];
    const topCats = Array.from(byCat.entries())
      .map(([name, value]) => {
        const meta = allCats.find((c) => c.name === name) || { emoji: "🏷️", color: C.text3 };
        const was = prevByCat.get(name) || 0;
        return {
          name, value, emoji: meta.emoji, color: meta.color,
          share: spend > 0 ? (value / spend) * 100 : 0,
          change: was > 0 ? ((value - was) / was) * 100 : null,
          allocation: (budget && budget.allocations && budget.allocations[name]) || 0,
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const expenses = monthTx.filter((t) => t.type === "expense");
    let biggest = null;
    for (const t of expenses) {
      const v = conv(t);
      if (!biggest || v > biggest.value) {
        const meta = allCats.find((c) => c.name === t.category) || { emoji: "🏷️", color: C.text3 };
        biggest = { value: v, tx: t, emoji: meta.emoji, color: meta.color };
      }
    }

    return {
      from, to, spend, income, prevSpend, prevIncome,
      isCurrent, totalDays, elapsed, monthProgress, perDay,
      projected: perDay * totalDays, sixAvg, months, topCats, biggest,
      empty: monthTx.length === 0,
    };
  }, [accounts, transactions, categories, budget, rates, base, monthCursor, monthStartDay, C]);

  const pct = (cur, prev) => (prev > 0 ? ((cur - prev) / prev) * 100 : null);
  const sym = CURRENCY_SYMBOL[base] || "";

  /* spending up is bad, income up is good */
  const Delta = ({ value, goodWhenUp }) => {
    if (value === null) return <span style={{ fontSize: 11.5, color: C.text3 }}>no data last month</span>;
    const up = value >= 0;
    const good = up === goodWhenUp;
    const Icon = up ? ArrowUpRight : ArrowDownLeft;
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11.5, fontWeight: 600, color: good ? C.income : C.expense }}>
        <Icon size={13} />{Math.abs(value).toFixed(0)}%
      </span>
    );
  };

  const budgetTotal = (budget && budget.total) || 0;
  const overBudget = budgetTotal > 0 && data.projected > budgetTotal;
  const usedPct = budgetTotal > 0 ? Math.min(999, (data.spend / budgetTotal) * 100) : 0;

  const Label = ({ children }) => (
    <div style={{ fontSize: 12, color: C.text3, marginBottom: 7 }}>{children}</div>
  );

  /* headings on the full-width cards carry more weight than the small stat
     labels, so the sections read as sections */
  const SectionTitle = ({ children, style }) => (
    <div style={{ fontSize: 14.5, fontWeight: 700, color: C.text, marginBottom: 12, letterSpacing: "-0.01em", ...style }}>
      {children}
    </div>
  );

  return (
    <div style={{ marginTop: 26 }}>
      <div style={{ marginBottom: 14, padding: "0 2px" }}>
        <div style={{ fontSize: 19, fontWeight: 800, color: C.text, letterSpacing: "-0.01em" }}>Insights</div>
        <div style={{ fontSize: 12, color: C.text3, marginTop: 3 }}>
          {fmtDate(data.from)} – {fmtDate(new Date(data.to.getTime() - 86400000))}
        </div>
      </div>

      {data.empty ? (
        <div style={{ ...sheetCardStyle(C), padding: 18 }}>
          <div style={{ fontSize: 13.5, color: C.text2, lineHeight: 1.5 }}>
            No records in this month yet. Add a few and this fills in.
          </div>
        </div>
      ) : (
        <>
          <div style={{ ...sheetCardStyle(C), padding: 16, marginBottom: 12 }}>
            <SectionTitle>Compared with last month</SectionTitle>
            <div style={{ display: "flex", gap: 14 }}>
              {[
                { label: "Spending", value: data.spend, prev: data.prevSpend, goodWhenUp: false, color: C.expense },
                { label: "Income", value: data.income, prev: data.prevIncome, goodWhenUp: true, color: C.income },
              ].map((r) => (
                <div key={r.label} style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11.5, color: C.text3, marginBottom: 4 }}>{r.label}</div>
                  <Money value={r.value} currency={base} size={17} color={r.color} />
                  <div style={{ marginTop: 5 }}>
                    <Delta value={pct(r.value, r.prev)} goodWhenUp={r.goodWhenUp} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={{ ...sheetCardStyle(C), padding: 16 }}>
              <Label>Average per day</Label>
              <Money value={data.perDay} currency={base} size={17} color={C.text} />
              <div style={{ fontSize: 11.5, color: C.text3, marginTop: 5 }}>
                over {data.elapsed} {data.elapsed === 1 ? "day" : "days"}
              </div>
            </div>
            <div style={{ ...sheetCardStyle(C), padding: 16 }}>
              <Label>{data.isCurrent ? "Projected month" : "6-month average"}</Label>
              <Money
                value={data.isCurrent ? data.projected : data.sixAvg}
                currency={base} size={17}
                color={data.isCurrent && overBudget ? C.expense : C.text} />
              <div style={{ fontSize: 11.5, color: C.text3, marginTop: 5 }}>
                {data.isCurrent
                  ? (overBudget ? "over your budget" : `at ${sym}${fmtCompact(data.perDay)}/day`)
                  : "spending per month"}
              </div>
            </div>
          </div>

          {budgetTotal > 0 && (
            <div style={{ ...sheetCardStyle(C), padding: 16, marginBottom: 12 }}>
              <SectionTitle>Budget</SectionTitle>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
                <Money value={data.spend} currency={base} size={17} color={usedPct > 100 ? C.expense : C.text} />
                <span style={{ fontSize: 12.5, color: C.text3 }}>of {sym}{fmtCompact(budgetTotal)}</span>
              </div>
              <div style={{ position: "relative", height: 8, borderRadius: 999, background: C.surface3, overflow: "visible" }}>
                <div style={{
                  width: `${Math.min(100, usedPct)}%`, height: "100%", borderRadius: 999,
                  background: usedPct > 100 ? C.expense : C.mint,
                }} />
                {/* where we are in the month, so pace is visible at a glance */}
                <div style={{
                  position: "absolute", top: -3, bottom: -3, left: `${data.monthProgress}%`,
                  width: 2, borderRadius: 999, background: C.text2,
                }} />
              </div>
              <div style={{ fontSize: 11.5, color: C.text3, marginTop: 9 }}>
                {usedPct.toFixed(0)}% used with {data.monthProgress.toFixed(0)}% of the month gone
              </div>
            </div>
          )}

          <div style={{ ...sheetCardStyle(C), padding: "16px 8px 8px 0", marginBottom: 12 }}>
            <SectionTitle style={{ marginBottom: 10, paddingLeft: 16 }}>Last 6 months</SectionTitle>
            <div style={{ height: 170 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.months} margin={{ top: 6, right: 10, bottom: 0, left: 0 }} barGap={3}>
                  <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: C.text3 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: C.surface3, opacity: 0.4 }}
                    formatter={(v, n) => [sym + fmtNumber(v, 0), n === "income" ? "Income" : "Spending"]}
                    contentStyle={{ borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 11.5 }}
                    labelStyle={{ color: C.text3 }} itemStyle={{ color: C.text }} />
                  <Bar dataKey="income" fill={C.income} radius={[3, 3, 0, 0]} maxBarSize={14} />
                  <Bar dataKey="spending" fill={C.expense} radius={[3, 3, 0, 0]} maxBarSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {data.topCats.length > 0 && (
            <div style={{ ...sheetCardStyle(C), padding: 0, overflow: "hidden", marginBottom: 12 }}>
              <SectionTitle style={{ marginBottom: 0, padding: "16px 14px 10px" }}>Top categories</SectionTitle>
              {data.topCats.map((c, i) => (
                <div key={c.name} style={{ padding: "11px 14px", borderTop: i === 0 ? "none" : `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Tile emoji={c.emoji} color={c.color} size={34} radius={10} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
                      <div style={{ fontSize: 11.5, color: C.text3, display: "flex", alignItems: "center", gap: 7, marginTop: 2 }}>
                        {c.share.toFixed(0)}% of spending
                        {c.change === null
                          ? <span style={{ color: C.mint, fontWeight: 600 }}>new</span>
                          : <Delta value={c.change} goodWhenUp={false} />}
                      </div>
                    </div>
                    <Money value={c.value} currency={base} size={14} color={C.text} />
                  </div>
                  {c.allocation > 0 && (
                    <div style={{ marginTop: 9 }}>
                      <div style={{ height: 4, borderRadius: 999, background: C.surface3, overflow: "hidden" }}>
                        <div style={{
                          width: `${Math.min(100, (c.value / c.allocation) * 100)}%`, height: "100%",
                          background: c.value > c.allocation ? C.expense : c.color,
                        }} />
                      </div>
                      <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>
                        {sym}{fmtCompact(c.value)} of {sym}{fmtCompact(c.allocation)} allocated
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {data.biggest && (
            <div style={{ ...sheetCardStyle(C), padding: 16 }}>
              <SectionTitle>Biggest expense</SectionTitle>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Tile emoji={data.biggest.emoji} color={data.biggest.color} size={38} radius={11} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {data.biggest.tx.category || "Uncategorized"}
                  </div>
                  <div style={{ fontSize: 11.5, color: C.text3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {data.biggest.tx.payee || data.biggest.tx.note || "No note"} · {fmtDate(data.biggest.tx.date)}
                  </div>
                </div>
                <Money value={data.biggest.value} currency={base} size={16} color={C.expense} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ================================ Accounts ================================ */

function AccountsView({ accounts, transactions, rates, base, onOpenDetail, onAddNew }) {
  const C = useTheme();
  const netWorth = netWorthAt(accounts, transactions, rates, base);
  const balances = accounts.map((a) => ({ a, bal: accountBalance(a, transactions) }));
  const active = balances.filter(({ bal }) => Math.round(bal * 100) !== 0);
  const empty = balances.filter(({ bal }) => Math.round(bal * 100) === 0);
  const [showEmpty, setShowEmpty] = useState(false);

  /* group by currency, biggest holding first */
  const groups = useMemo(() => {
    const map = new Map();
    for (const row of active) {
      if (!map.has(row.a.currency)) map.set(row.a.currency, []);
      map.get(row.a.currency).push(row);
    }
    return Array.from(map.entries())
      .map(([currency, rows]) => ({
        currency,
        rows,
        subtotal: rows.reduce((s, r) => s + r.bal, 0),
        counted: rows.reduce((s, r) => s + (r.a.excluded ? 0 : r.bal), 0),
        hasExcluded: rows.some((r) => r.a.excluded),
      }))
      ;  /* group order follows the order accounts are arranged in */
  }, [active, rates]);

  const Row = ({ a, bal, muted }) => {
    const t = ACCOUNT_TYPES.find((x) => x.id === a.type) || ACCOUNT_TYPES[1];
    return (
      <div onClick={() => onOpenDetail(a.id)}
        style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 14px", cursor: "pointer", opacity: muted ? 0.55 : 1 }}>
        <Tile emoji={accountEmoji(a)} color={muted ? C.text3 : C.mint} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
          <div style={{ fontSize: 12, color: C.text3, display: "flex", alignItems: "center", gap: 6 }}>
            {t.label}
            {a.excluded && (
              <span style={{ background: C.surface3, color: C.text3, borderRadius: 6, padding: "1px 6px", fontSize: 11 }}>
                not counted
              </span>
            )}
          </div>
        </div>
        <Money value={bal} currency={a.currency} size={14.5} color={bal < 0 ? C.expense : C.text} />
      </div>
    );
  };

  return (
    <div style={{ paddingTop: 10 }}>
      <div style={{ textAlign: "center", marginBottom: 26 }}>
        <div style={{ fontSize: 13, color: C.text3, marginBottom: 4 }}>Net worth</div>
        <BigAmount value={netWorth} currency={base} size={34} />
      </div>

      {groups.map((g) => (
        <div key={g.currency} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "0 4px 8px", gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text2, letterSpacing: "0.04em" }}>{g.currency}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Money value={g.subtotal} currency={g.currency} size={13} color={C.text3} />
              {g.hasExcluded && <span style={{ fontSize: 11, color: C.text3 }}>incl. not counted</span>}
            </span>
          </div>
          <div style={{ ...sheetCardStyle(C), padding: 0, overflow: "hidden" }}>
            {g.rows.map(({ a, bal }, i) => (
              <div key={a.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${C.border}` }}>
                <Row a={a} bal={bal} muted={a.excluded} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {empty.length > 0 && (
        <>
          <button onClick={() => setShowEmpty((v) => !v)} style={{
            display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer",
            color: C.text3, fontSize: 13, fontWeight: 500, padding: "6px 2px", marginBottom: 6, fontFamily: "inherit",
          }}>
            <ChevronRight size={15} style={{ transform: showEmpty ? "rotate(90deg)" : "none", transition: "transform .15s" }} />
            {empty.length} account{empty.length > 1 ? "s" : ""} with no balance
          </button>
          {showEmpty && (
            <div style={{ ...sheetCardStyle(C), padding: 0, overflow: "hidden", marginBottom: 14 }}>
              {empty.map(({ a, bal }, i) => (
                <div key={a.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${C.border}` }}><Row a={a} bal={bal} muted /></div>
              ))}
            </div>
          )}
        </>
      )}

      <button onClick={onAddNew} style={{ ...whiteBtn(C), background: C.surface2, color: C.text }}>Add account</button>
    </div>
  );
}

function AccountDetail({ account, accounts, transactions, categories, onBack, onEdit, onOpenEditRecord, onOpenBalanceAdjust }) {
  const C = useTheme();
  const history = useMemo(() => {
    const pts = [];
    for (let i = 30; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(23, 59, 59, 999);
      pts.push({ label: d.toLocaleDateString(undefined, { day: "numeric", month: "short" }), value: accountBalance(account, transactions.filter((t) => t.date <= d.toISOString())) });
    }
    return pts;
  }, [account, transactions]);

  const current = accountBalance(account, transactions);
  const start = history[0]?.value ?? current;
  const pct = start !== 0 ? ((current - start) / Math.abs(start)) * 100 : 0;

  const accName = (id) => accounts.find((a) => a.id === id)?.name || "—";
  const accCur = () => account.currency;
  const catByName = (n) => [...categories.expense, ...categories.income].find((c) => c.name === n) || { emoji: "🏷️", color: C.text3 };
  const otherName = (t) => (t.accountId === account.id ? accName(t.toAccountId) : accName(t.accountId));

  const tx = transactions.filter((t) => t.accountId === account.id || t.toAccountId === account.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const grouped = groupByDay(tx);

  return (
    <div style={{ paddingTop: 4 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <button onClick={onBack} style={roundBtn(C)}><ChevronLeft size={19} /></button>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", padding: "0 10px" }}>{account.name}</div>
        <button onClick={() => onEdit(account)} style={{ ...roundBtn(C), width: "auto", padding: "0 16px", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>Edit</button>
      </div>

      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <div style={{ fontSize: 12.5, color: C.text3, marginBottom: 4 }}>Last 30 days</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <BigAmount value={current} currency={account.currency} size={30} color={current < 0 ? C.expense : C.text} />
          <button onClick={onOpenBalanceAdjust} style={{ ...roundBtn(C), width: 32, height: 32 }}><Pencil size={14} /></button>
        </div>
        {start !== 0 && (
          <span style={{
            display: "inline-block", marginTop: 8, fontSize: 12, fontWeight: 600,
            color: pct >= 0 ? C.mint : C.expense, background: pct >= 0 ? C.mintSoft : C.expenseSoft,
            padding: "4px 11px", borderRadius: 999,
          }}>{pct >= 0 ? "↑" : "↓"} {Math.abs(pct).toFixed(0)}%</span>
        )}
      </div>

      <div style={{ height: 170, margin: "10px -8px 24px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 8, right: 10, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="acctGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.mint} stopOpacity={0.32} />
                <stop offset="100%" stopColor={C.mint} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: C.text3 }} axisLine={false} tickLine={false} interval={7} />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip formatter={(v) => [CURRENCY_SYMBOL[account.currency] + fmtNumber(v), "Balance"]}
              contentStyle={{ borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 11.5 }}
              labelStyle={{ color: C.text3 }} itemStyle={{ color: C.text }} />
            <Area type="monotone" dataKey="value" stroke={C.mint} strokeWidth={2.5} fill="url(#acctGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {grouped.length === 0 && <EmptyState text="No records for this account yet" />}
      {grouped.map(([day, items]) => (
        <div key={day} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: C.text3, marginBottom: 8, padding: "0 2px" }}>{fmtDate(items[0].date)}</div>
          <div style={{ ...sheetCardStyle(C), padding: 0, overflow: "hidden" }}>
            {items.map((t, i) => (
              <div key={t.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${C.border}` }}>
                <TxRow t={t} catByName={catByName} accountName={accName} accountCur={accCur}
                  onClick={() => onOpenEditRecord(t)} forAccount={account} otherName={otherName} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================================ Settings ================================ */

function Row({ icon, label, value, onClick, right, last }) {
  const C = useTheme();
  return (
    <div>
      <div onClick={onClick} style={{
        display: "flex", alignItems: "center", gap: 13, padding: "13px 14px",
        cursor: onClick ? "pointer" : "default",
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11, background: C.surface3, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center", color: C.text2,
        }}>{icon}</div>
        <span style={{ flex: 1, fontSize: 15, color: C.text, fontWeight: 500 }}>{label}</span>
        {value !== undefined && <span style={{ fontSize: 14, color: C.text3 }}>{value}</span>}
        {right !== undefined ? right : (onClick && <ChevronRight size={17} color={C.text3} />)}
      </div>
      {!last && <div style={{ height: 1, background: C.border, marginLeft: 65 }} />}
    </div>
  );
}

function Group({ title, children }) {
  const C = useTheme();
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 12, color: C.text3, margin: "0 4px 8px", fontWeight: 500 }}>{title}</div>
      <div style={{ ...sheetCardStyle(C), padding: 0, overflow: "hidden" }}>{children}</div>
    </div>
  );
}

function Toggle({ on, onChange }) {
  const C = useTheme();
  return (
    <button onClick={(e) => { e.stopPropagation(); onChange(!on); }} role="switch" aria-checked={on} style={{
      width: 48, height: 29, borderRadius: 999, border: "none", cursor: "pointer", padding: 3,
      background: on ? C.mint : C.surface3, display: "flex", justifyContent: on ? "flex-end" : "flex-start",
      alignItems: "center", transition: "background .18s", flexShrink: 0,
    }}>
      <span style={{ width: 23, height: 23, borderRadius: 999, background: on ? "#fff" : C.surface, display: "block", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </button>
  );
}

/* Edit one category: name, emoji and colour, with delete. */
function CategoryEditSheet({ open, onClose, category, onSave, onDelete, isNew }) {
  const C = useTheme();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [color, setColor] = useState(TILE_COLORS[0]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(category?.name || "");
    setEmoji(category?.emoji || "🏷️");
    setColor(category?.color || TILE_COLORS[0]);
    setError("");
  }, [open, category]);

  if (!open) return null;

  const save = () => {
    if (!name.trim()) { setError("Give the category a name."); return; }
    onSave({ ...(category || {}), id: category?.id || uid(), name: name.trim(), emoji: emoji.trim() || "🏷️", color });
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title={isNew ? "New category" : "Edit category"} z={72}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
        <Tile emoji={emoji || "🏷️"} color={color} size={64} radius={18} />
      </div>

      <Field label="Icon & name">
        <div style={{ display: "flex", gap: 8 }}>
          <input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="🏷️"
            style={{ ...inputStyle(C), width: 66, textAlign: "center", flexShrink: 0, fontSize: 20 }} />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Groceries"
            onKeyDown={(e) => e.key === "Enter" && save()}
            style={{ ...inputStyle(C), flex: 1, minWidth: 0 }} />
        </div>
      </Field>

      <Field label="Colour">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {TILE_COLORS.map((c) => (
            <button key={c} type="button" onClick={() => setColor(c)} aria-label={`Colour ${c}`}
              style={{
                width: 38, height: 38, borderRadius: 999, cursor: "pointer", background: c,
                border: color === c ? `3px solid ${C.text}` : "3px solid transparent",
              }} />
          ))}
        </div>
      </Field>

      {error && <div style={{ color: C.expense, fontSize: 12, marginBottom: 10 }}>{error}</div>}

      <div style={{ display: "flex", gap: 10 }}>
        {!isNew && (
          <button onClick={() => setConfirmDelete(true)}
            style={{ ...whiteBtn(C), flex: 1, background: C.surface2, color: C.expense }}>Delete</button>
        )}
        <button onClick={save} style={{ ...whiteBtn(C), flex: 1 }}>Save</button>
      </div>

      <ConfirmSheet
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete category"
        message={`Remove "${name}"? Existing records keep this category name but lose its icon and colour.`}
        confirmLabel="Delete category"
        danger
        onConfirm={() => { onDelete(category.id); onClose(); }} />
    </Sheet>
  );
}

/* Account manager: same drag-to-reorder and tap-to-edit as categories. */
function AccountsManagerSheet({ open, onClose, accounts, onReorder, onEdit, onNew }) {
  const C = useTheme();
  return (
    <FullScreen open={open} onClose={onClose} title="Accounts" z={68}>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: 104 }}>
        <ReorderList
          items={accounts}
          keyOf={(a) => a.id}
          onReorder={onReorder}
          renderRow={(a) => {
            const t = ACCOUNT_TYPES.find((x) => x.id === a.type) || ACCOUNT_TYPES[1];
            return (
              <div onClick={() => onEdit(a)} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "2px 0" }}>
                <Tile emoji={accountEmoji(a)} color={a.excluded ? C.text3 : C.mint} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: C.text3 }}>
                    {t.label} · {a.currency}{a.excluded ? " · not counted" : ""}
                  </div>
                </div>
              </div>
            );
          }} />
        {accounts.length === 0 && <EmptyState text="No accounts yet" />}
      </div>

      {/* the reorder rows carry z-index 1-2, so this must sit above them or the
          list swallows taps meant for the button */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 10,
        paddingBottom: 22, paddingTop: 26,
        display: "flex", justifyContent: "center", pointerEvents: "none",
        background: `linear-gradient(180deg, transparent 0%, ${C.bgBot} 38%, ${C.bgBot} 100%)`,
      }}>
        <button onClick={onNew} style={{
          pointerEvents: "auto", padding: "15px 30px", borderRadius: 999, border: "none", cursor: "pointer",
          background: C.primary, color: C.onPrimary, fontWeight: 700, fontSize: 15, fontFamily: "inherit",
          boxShadow: C.fabShadow,
        }}>New account</button>
      </div>
    </FullScreen>
  );
}

/* Full-page category manager: drag to reorder, tap to edit. */
function CategoriesSheet({ open, onClose, categories, onChange }) {
  const C = useTheme();
  const [tab, setTab] = useState("expense");
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);

  const items = categories[tab] || [];

  const saveOne = (cat) => {
    const exists = items.some((c) => c.id === cat.id);
    onChange({ ...categories, [tab]: exists ? items.map((c) => (c.id === cat.id ? cat : c)) : [...items, cat] });
  };
  const deleteOne = (id) => onChange({ ...categories, [tab]: items.filter((c) => c.id !== id) });

  return (
    <FullScreen open={open} onClose={onClose} title="Categories" z={68}>
      <div style={{ display: "flex", background: C.surface2, borderRadius: 999, padding: 4, marginBottom: 16, flexShrink: 0 }}>
        {["expense", "income"].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "10px 0", borderRadius: 999, border: "none", cursor: "pointer",
            fontWeight: 600, fontSize: 13.5, textTransform: "capitalize", fontFamily: "inherit",
            background: tab === t ? C.primary : "transparent",
            color: tab === t ? C.onPrimary : C.text2,
          }}>{t}</button>
        ))}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: 104 }}>
        <ReorderList
          items={items}
          keyOf={(c) => c.id}
          onReorder={(next) => onChange({ ...categories, [tab]: next })}
          renderRow={(c) => (
            <div onClick={() => { setIsNew(false); setEditing(c); }}
              style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "2px 0" }}>
              <Tile emoji={c.emoji} color={c.color} />
              <span style={{ flex: 1, minWidth: 0, fontSize: 14.5, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
            </div>
          )} />
        {items.length === 0 && <EmptyState text="No categories yet" />}
      </div>

      {/* the reorder rows carry z-index 1-2, so this must sit above them or the
          list swallows taps meant for the button */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 10,
        paddingBottom: 22, paddingTop: 26,
        display: "flex", justifyContent: "center", pointerEvents: "none",
        background: `linear-gradient(180deg, transparent 0%, ${C.bgBot} 38%, ${C.bgBot} 100%)`,
      }}>
        <button onClick={() => { setIsNew(true); setEditing(null); }} style={{
          pointerEvents: "auto", padding: "15px 30px", borderRadius: 999, border: "none", cursor: "pointer",
          background: C.primary, color: C.onPrimary, fontWeight: 700, fontSize: 15, fontFamily: "inherit",
          boxShadow: C.fabShadow,
        }}>New category</button>
      </div>

      <CategoryEditSheet
        open={!!editing || isNew}
        onClose={() => { setEditing(null); setIsNew(false); }}
        category={editing} isNew={isNew}
        onSave={saveOne} onDelete={deleteOne} />
    </FullScreen>
  );
}

function CurrencySheet({ open, onClose, rates, base, onRatesChange, onBaseChange }) {
  const C = useTheme();
  return (
    <Sheet open={open} onClose={onClose} title="Currency" z={68}>
      <Field label="Main currency">
        <select value={base} onChange={(e) => onBaseChange(e.target.value)} style={selectStyle(C)}>
          {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <div style={{ fontSize: 13, color: C.text3, margin: "16px 4px 8px" }}>Exchange rates</div>
      <div style={{ ...sheetCardStyle(C), padding: 14 }}>
        {CURRENCIES.filter((c) => c !== base).map((c) => (
          <Field key={c} label={`1 ${base} = ? ${c}`}>
            <input type="number" value={rates[c]}
              onChange={(e) => onRatesChange({ ...rates, [c]: parseFloat(e.target.value) || 0 })} style={inputStyle(C)} />
          </Field>
        ))}
      </div>
    </Sheet>
  );
}

function ActivityFieldsSheet({ open, onClose, fields, onChange }) {
  const C = useTheme();
  const f = { ...DEFAULT_SETTINGS.fields, ...(fields || {}) };
  const rows = [
    { id: "note", label: "Note", icon: <FileText size={16} />, hint: "Free-text note on each record" },
    { id: "payee", label: "Payee", icon: <Landmark size={16} />, hint: "Who the record was with" },
    { id: "account", label: "Accounts", icon: <Landmark size={16} />, hint: "Pick the account from the record screen" },
    { id: "converter", label: "Currency converter", icon: <DollarSign size={16} />, hint: "Edit the received amount on cross-currency transfers" },
  ];
  return (
    <Sheet open={open} onClose={onClose} title="Activity fields" z={68}>
      <p style={{ fontSize: 13.5, color: C.text3, textAlign: "center", margin: "-4px 0 16px", lineHeight: 1.5 }}>
        Choose which fields appear on the new-record screen.
      </p>
      <div style={{ ...sheetCardStyle(C), padding: 0, overflow: "hidden" }}>
        {rows.map((r, i) => (
          <Row key={r.id} icon={r.icon} label={r.label} last={i === rows.length - 1}
            right={<Toggle on={!!f[r.id]} onChange={(v) => onChange({ ...f, [r.id]: v })} />} />
        ))}
      </div>
    </Sheet>
  );
}

function MonthStartSheet({ open, onClose, value, onChange }) {
  const C = useTheme();
  const ord = (n) => n + (["th", "st", "nd", "rd"][(n % 100 - 20) % 10] || ["th", "st", "nd", "rd"][n % 100] || "th");
  return (
    <Sheet open={open} onClose={onClose} title="Month start day" z={68}>
      <p style={{ fontSize: 14, color: C.text3, margin: "0 4px 14px", lineHeight: 1.5 }}>
        Pick the day your budget month begins. Useful if you get paid mid-month.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
        {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
          <button key={d} onClick={() => { onChange(d); onClose(); }} style={{
            padding: "12px 0", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 14,
            fontWeight: d === value ? 700 : 500,
            background: d === value ? C.primary : C.surface2, color: d === value ? C.onPrimary : C.text,
          }}>{d}</button>
        ))}
      </div>
      <div style={{ fontSize: 13.5, color: C.text3, textAlign: "center", marginTop: 16 }}>
        Currently starting on the {ord(value)}
      </div>
    </Sheet>
  );
}

/* ---- data helpers ---- */

function downloadFile(name, text, mime) {
  try {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch { return false; }
}

function toCSV(data) {
  const acc = (id) => data.accounts.find((a) => a.id === id)?.name || "";
  const head = ["Date", "Type", "Amount", "Currency", "Category", "Account", "To account", "Payee", "Note"];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = [...data.transactions]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((t) => [
      new Date(t.date).toISOString(),
      t.type,
      t.amount,
      data.accounts.find((a) => a.id === t.accountId)?.currency || "",
      t.category || "",
      acc(t.accountId),
      t.toAccountId ? acc(t.toAccountId) : "",
      t.payee || "",
      t.note || "",
    ].map(esc).join(","));
  return [head.map(esc).join(","), ...rows].join("\n");
}

function SettingsSheet({
  open, onClose, categories, onCategoriesChange, rates, base, onRatesChange, onBaseChange,
  settings, onSettingsChange, data, onImport, onErase,
  accounts, onAccountsReorder, onEditAccount, onNewAccount, onStopRecurring,
  accountEmail, onSignOut, syncProblem, onDeleteUserAccount,
}) {
  const C = useTheme();
  const [sub, setSub] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [notice, setNotice] = useState("");
  const set = (patch) => onSettingsChange({ ...settings, ...patch });
  const ord = (n) => n + (["th", "st", "nd", "rd"][(n % 100 - 20) % 10] || ["th", "st", "nd", "rd"][n % 100] || "th");

  const pickImport = () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "application/json,.json";
    input.onchange = () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result));
          if (!parsed.accounts || !parsed.transactions) throw new Error("shape");
          setConfirm({
            title: "Import backup",
            message: `This replaces everything currently in the app with ${parsed.accounts.length} account(s) and ${parsed.transactions.length} record(s) from the file.`,
            confirmLabel: "Replace my data",
            danger: true,
            action: () => onImport(parsed),
          });
        } catch {
          setNotice("That file isn't a valid backup. Pick a JSON file exported from this app.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <>
      <Sheet open={open} onClose={onClose} title="Settings" z={64}>
        {accountEmail && (
          <Group title="Account">
            <Row icon={<User size={16} />} label={accountEmail}
              value={syncProblem ? "Not synced" : "Synced"} />
            <Row icon={<LogOut size={16} />} label="Sign out"
              onClick={() => setConfirm(syncProblem
                ? {
                    /* unsynced edits only exist on this phone; signing out now
                       and back in later would load the older cloud copy */
                    title: "Changes not synced yet",
                    message: "Some of your latest changes haven't reached your account yet. If you sign out now they may be lost. Connect to the internet and wait for it to say Synced first.",
                    confirmLabel: "Sign out anyway",
                    danger: true,
                    action: onSignOut,
                  }
                : {
                    title: "Sign out?",
                    message: `Your records stay safe in your account. Sign in again with ${accountEmail} to see them.`,
                    confirmLabel: "Sign out",
                    danger: false,
                    action: onSignOut,
                  })} />
            <Row icon={<Trash2 size={16} />} last onClick={() => setSub("deleteUser")}
              label={<span style={{ color: C.expense }}>Delete account</span>} />
          </Group>
        )}

        <Group title="General">
          <Row icon={<LayoutGrid size={16} />} label="Categories" onClick={() => setSub("categories")} />
          <Row icon={<Landmark size={16} />} label="Accounts" value={String(accounts.length)} onClick={() => setSub("accounts")} />
          <Row icon={<DollarSign size={16} />} label="Currency" value={base} onClick={() => setSub("currency")} last />
        </Group>

        <Group title="Preferences">
          <Row icon={<Palette size={16} />} label="Appearance"
            value={(THEMES.find((t) => t.id === (settings.theme || "system")) || THEMES[0]).label}
            onClick={() => setSub("theme")} />
          <Row icon={<RefreshCw size={16} />} label="Repeating records"
            value={String(((data.recurring) || []).filter((r) => r.active).length)}
            onClick={() => setSub("recurring")} />
          <Row icon={<FileText size={16} />} label="Activity fields" onClick={() => setSub("fields")} />
          <Row icon={<Calendar size={16} />} label="Month start day" value={ord(settings.monthStartDay)} onClick={() => setSub("monthstart")} />
          <Row icon={<Coins size={16} />} label="Display cents" last
            right={<Toggle on={settings.displayCents} onChange={(v) => set({ displayCents: v })} />} />
        </Group>

        <Group title="Privacy">
          <Row icon={<EyeOff size={16} />} label="Hide balances"
            right={<Toggle on={settings.hideBalances} onChange={(v) => set({ hideBalances: v })} />} />
          <Row icon={<FileText size={16} />} label="Privacy policy" last onClick={() => setSub("privacy")} />
        </Group>

        <Group title="Data">
          <Row icon={<FileText size={16} />} label="Export as CSV"
            onClick={() => { if (!downloadFile("transactions.csv", toCSV(data), "text/csv")) setNotice("Export failed — your browser blocked the download."); }} />
          <Row icon={<Download size={16} />} label="Export backup"
            onClick={() => { if (!downloadFile("finance-backup.json", JSON.stringify(data, null, 2), "application/json")) setNotice("Export failed — your browser blocked the download."); }} />
          <Row icon={<Upload size={16} />} label="Import backup" onClick={pickImport} />
          <Row icon={<Trash2 size={16} />} label="Erase all data" last
            onClick={() => setConfirm({
              title: "Erase all data",
              message: `This permanently deletes all ${data.accounts.length} account(s) and ${data.transactions.length} record(s). Your categories and preferences are kept. This cannot be undone.`,
              confirmLabel: "Erase everything",
              danger: true,
              action: onErase,
            })} />
        </Group>

        <Group title="Others">
          <Row
            icon={<InstagramLogo size={17} />}
            label="Follow creator on IG"
            last
            onClick={() => {
              try { window.open(`https://instagram.com/${APP_AUTHOR_IG}`, "_blank", "noopener,noreferrer"); }
              catch { setNotice("Could not open Instagram."); }
            }} />
        </Group>

        {/* restored: notice was being set but never rendered */}
        {notice && (
          <div onClick={() => setNotice("")} style={{
            background: C.errBg, border: `1px solid ${C.errBorder}`, color: C.errText,
            padding: "11px 14px", borderRadius: 12, fontSize: 13, marginBottom: 16, cursor: "pointer",
          }}>{notice}</div>
        )}

        <div style={{ textAlign: "center", paddingTop: 8 }}>
          <div style={{ fontSize: 13, color: C.text3 }}>
            {accountEmail ? "Synced to your account." : "Your data stays on this device."}
          </div>
          <div style={{ fontSize: 13, color: C.text3, marginTop: 14 }}>Version {APP_VERSION}</div>
          <div style={{ fontSize: 13.5, color: C.text2, marginTop: 6 }}>
            Made with <span style={{ color: C.expense }}>♥</span> by{" "}
            <a
              href={`https://instagram.com/${APP_AUTHOR_IG}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: C.mint, fontWeight: 600, textDecoration: "none" }}
            >{APP_AUTHOR}</a>
          </div>
        </div>
      </Sheet>

      <CategoriesSheet open={sub === "categories"} onClose={() => setSub(null)}
        categories={categories} onChange={onCategoriesChange} />
      <AccountsManagerSheet open={sub === "accounts"} onClose={() => setSub(null)}
        accounts={accounts} onReorder={onAccountsReorder}
        onEdit={(a) => { setSub(null); onEditAccount(a); }}
        onNew={() => { setSub(null); onNewAccount(); }} />
      <CurrencySheet open={sub === "currency"} onClose={() => setSub(null)}
        rates={rates} base={base} onRatesChange={onRatesChange} onBaseChange={onBaseChange} />
      <PrivacySheet open={sub === "privacy"} onClose={() => setSub(null)} z={70} />
      {accountEmail && (
        <DeleteAccountSheet open={sub === "deleteUser"} onClose={() => setSub(null)}
          email={accountEmail}
          onExport={() => { if (!downloadFile("finance-backup.json", JSON.stringify(data, null, 2), "application/json")) setNotice("Export failed — your browser blocked the download."); }}
          onDelete={onDeleteUserAccount} />
      )}
      <RecurringSheet open={sub === "recurring"} onClose={() => setSub(null)}
        rules={data.recurring || []} accounts={accounts} categories={categories}
        onStop={onStopRecurring} />
      <ActivityFieldsSheet open={sub === "fields"} onClose={() => setSub(null)}
        fields={settings.fields} onChange={(v) => set({ fields: v })} />
      <MonthStartSheet open={sub === "monthstart"} onClose={() => setSub(null)}
        value={settings.monthStartDay} onChange={(v) => set({ monthStartDay: v })} />
      <ConfirmSheet
        open={!!confirm} onClose={() => setConfirm(null)}
        title={confirm ? confirm.title : ""}
        message={confirm ? confirm.message : ""}
        confirmLabel={confirm ? confirm.confirmLabel : ""}
        danger={confirm ? confirm.danger : false}
        onConfirm={() => confirm && confirm.action()} />
      <OptionSheet open={sub === "theme"} onClose={() => setSub(null)} title="Appearance"
        subtitle="System follows your device setting"
        options={THEMES.map((t) => ({ ...t, icon: optionIcon("theme"), badge: t.id === "system" ? "Default" : undefined }))}
        value={settings.theme || "system"} onPick={(v) => set({ theme: v })} />
    </>
  );
}


/* ================================ App ================================ */

const NAV = [
  { id: "home", label: "Home", icon: SquaresFour },
  { id: "activity", label: "Activity", icon: ReceiptIcon },
  { id: "summary", label: "Summary", icon: ChartPie },
  { id: "budget", label: "Budget", icon: WalletIcon },
  { id: "accounts", label: "Accounts", icon: Bank },
];

/* Brings any saved data up to the current shape and writes repeats that fell
   due while the app was closed. Returns whether anything changed. */
function prepareData(p) {
  p.categories = {
    expense: normalizeCats(p.categories?.expense),
    income: normalizeCats(p.categories?.income),
  };
  if (!p.categories.expense.length) p.categories.expense = DEFAULT_EXPENSE.map(([n, e], i) => mkCat(n, e, i));
  if (!p.categories.income.length) p.categories.income = DEFAULT_INCOME.map(([n, e], i) => mkCat(n, e, i + 3));
  if (!Array.isArray(p.accounts)) p.accounts = [];
  if (!Array.isArray(p.transactions)) p.transactions = [];
  if (!p.budget) p.budget = { total: 0, allocations: {} };
  if (!Array.isArray(p.debts)) p.debts = [];
  if (!Array.isArray(p.recurring)) p.recurring = [];
  p.settings = { ...DEFAULT_SETTINGS, ...(p.settings || {}) };
  /* app lock was removed; drop any saved lock settings */
  delete p.settings.lock;
  let changed = false;
  const caught = materializeRecurring(p.recurring, p.transactions);
  if (caught.added > 0) {
    p.transactions = caught.transactions;
    p.recurring = caught.rules;
    changed = true;
  }
  return { data: p, changed };
}

function LedgerApp() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("home");
  const [range, setRange] = useState("month");
  const [monthCursor, setMonthCursor] = useState(new Date());
  const [customRange, setCustomRange] = useState(null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [presetAccountId, setPresetAccountId] = useState(null);
  const [accountFormOpen, setAccountFormOpen] = useState(false);
  const [accountFormEditing, setAccountFormEditing] = useState(null);
  const [detailAccountId, setDetailAccountId] = useState(null);
  const [balanceSheetOpen, setBalanceSheetOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [systemTheme, setSystemTheme] = useState(() => resolveTheme("system"));
  const [confirm, setConfirm] = useState(null);

  /* undefined while we check for a saved session, null when signed out */
  const [session, setSession] = useState(supabase ? undefined : null);
  const [recovering, setRecovering] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);
  const [authNotice, setAuthNotice] = useState("");
  const userId = session?.user?.id || null;
  const userIdRef = useRef(null);
  const saveTimer = useRef(null);
  const pending = useRef(null);
  const lastSynced = useRef(null);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    supabase.auth.getSession().then(({ data }) => { if (alive) setSession(data.session || null); });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
      setSession(s || null);
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  /* people already in the lending list, newest first — must sit above the
     loading guard so the hook order never changes between renders */
  const debtPeople = useMemo(() => {
    const list = (data && data.debts) || [];
    const seen = new Map();
    for (const d of [...list].sort((a, b) => new Date(b.date) - new Date(a.date))) {
      const k = (d.person || "").trim().toLowerCase();
      if (k && !seen.has(k)) seen.set(k, d.person.trim());
    }
    return Array.from(seen.values());
  }, [data]);

  /* Follow the OS while the preference is "system". */
  useEffect(() => {
    let mq;
    try { mq = window.matchMedia("(prefers-color-scheme: light)"); } catch { return; }
    const onChange = () => setSystemTheme(mq.matches ? "light" : "dark");
    onChange();
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else if (mq.removeListener) mq.removeListener(onChange);
    };
  }, []);

  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) { meta = document.createElement("meta"); meta.name = "viewport"; document.head.appendChild(meta); }
    meta.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no");
  }, []);

  useEffect(() => {
    /* cloud mode with nobody signed in: nothing to load yet */
    if (supabase && !userId) { setData(null); setLoading(false); return; }
    let cancelled = false;
    userIdRef.current = userId;
    setLoading(true); setLoadError(false);

    (async () => {
      const key = cacheKey(userId);
      const res = await resolveLedger({
        cloudEnabled: !!supabase, userId,
        loadRow: (id) => cloud.load(id),
        readLocal: async (k) => { try { return JSON.parse(await store.get(k)); } catch { return null; } },
        legacyKey: STORAGE_KEY, userKey: key,
      });
      if (res.blocked) {
        if (!cancelled) { setLoadError(true); setLoading(false); }
        return;
      }
      let { p, fromCloud, cloudReachable } = res;
      if (res.updatedAt) lastSynced.current = res.updatedAt;
      let caught = 0;
      if (!p) p = supabase ? emptyData() : defaultData();

      caught = hydrateLedger(p);
      if (cancelled) return;
      setData(p);
      setLoading(false);

      try { await store.set(key, JSON.stringify(p)); } catch {}
      /* push up when the cloud has nothing yet, or repeats were just added */
      if (supabase && cloudReachable && (!fromCloud || caught > 0)) {
        try { lastSynced.current = await cloud.save(userId, p); setSaveError(false); }
        catch { setSaveError(true); }
      }
    })();
    return () => { cancelled = true; };
  }, [userId, reloadTick]);

  const flushCloud = useCallback(async () => {
    clearTimeout(saveTimer.current);
    const uidNow = userIdRef.current;
    const next = pending.current;
    if (!supabase || !uidNow || !next) return;
    pending.current = null;
    try { lastSynced.current = await cloud.save(uidNow, next); setSaveError(false); }
    catch {
      pending.current = pending.current || next;
      setSaveError(true);
      /* keep trying quietly so the banner's promise holds */
      saveTimer.current = setTimeout(() => flushCloud(), 15000);
    }
  }, []);

  const persist = useCallback(async (next) => {
    try {
      const res = await store.set(cacheKey(userIdRef.current), JSON.stringify(next));
      if (!supabase) setSaveError(!res);
    } catch { if (!supabase) setSaveError(true); }
    if (supabase && userIdRef.current) {
      pending.current = next;
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(flushCloud, 700);
    }
  }, [flushCloud]);

  /* save straight away when the app is backgrounded, and pick up edits made
     on another device when it comes back */
  useEffect(() => {
    if (!supabase) return;
    const onVis = async () => {
      if (document.visibilityState === "hidden") { flushCloud(); return; }
      const uidNow = userIdRef.current;
      if (!uidNow || pending.current) return;
      try {
        const row = await cloud.load(uidNow);
        if (row && row.data && row.updated_at && row.updated_at !== lastSynced.current) {
          hydrateLedger(row.data);
          lastSynced.current = row.updated_at;
          setData(row.data);
          try { await store.set(cacheKey(uidNow), JSON.stringify(row.data)); } catch {}
        }
      } catch {}
    };
    const onOnline = () => { if (pending.current) flushCloud(); };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", flushCloud);
    window.addEventListener("online", onOnline);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", flushCloud);
      window.removeEventListener("online", onOnline);
    };
  }, [flushCloud]);

  const signOut = useCallback(async () => {
    const uidNow = userIdRef.current;
    await flushCloud();
    /* leave nothing behind on a shared phone — but only once it's all synced,
       otherwise this copy is the only place unsynced edits exist */
    if (!pending.current && uidNow) { try { await store.remove(cacheKey(uidNow)); } catch {} }
    try { await supabase.auth.signOut(); } catch {}
    setAuthNotice("");
    setData(null); setView("home"); setSettingsOpen(false);
  }, [flushCloud]);

  /* Permanently remove the account and its data. The server function deletes
     the sign-in record; the ledger row goes with it. */
  const deleteUserAccount = useCallback(async () => {
    const uidNow = userIdRef.current;
    /* stop any queued save first, or it could try to write the ledger back */
    clearTimeout(saveTimer.current);
    pending.current = null;
    const { error } = await supabase.rpc("delete_my_account");
    if (error) throw error;
    try { await store.remove(cacheKey(uidNow)); } catch {}
    try { await store.remove(STORAGE_KEY); } catch {}
    /* set the message before signing out, so the sign-in screen opens with it */
    setAuthNotice("Your account and all its records have been deleted.");
    try { await supabase.auth.signOut(); } catch {}
    setData(null); setView("home"); setSettingsOpen(false);
  }, []);

  const update = useCallback((updater) => {
    setData((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      persist(next);
      return next;
    });
  }, [persist]);

  /* ---- account gates: every hook is above this line ---- */
  if (CLOUD_CONFIGURED && !supabase) {
    const L = PALETTES[systemTheme];
    return (
      <ThemeCtx.Provider value={L}>
        <CloudErrorScreen mode={systemTheme}
          title="Can't reach the sign-in service"
          subtitle="Your records are safe. Check your connection, then try again."
          onRetry={() => window.location.reload()} />
      </ThemeCtx.Provider>
    );
  }
  if (supabase) {
    const L = PALETTES[systemTheme];
    const wrap = (node) => <ThemeCtx.Provider value={L}>{node}</ThemeCtx.Provider>;
    if (recovering && session) {
      return wrap(<NewPasswordScreen mode={systemTheme} onDone={() => setRecovering(false)} />);
    }
    if (session === null) return wrap(<AuthScreen mode={systemTheme} notice={authNotice} />);
    if (loadError) {
      return wrap(<CloudErrorScreen mode={systemTheme}
        onRetry={() => setReloadTick((t) => t + 1)} onSignOut={signOut} />);
    }
  }

  if (loading || !data) {
    const L = PALETTES[systemTheme];
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: L.bgBot, color: L.text3, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
        Loading…
      </div>
    );
  }

  const { accounts, transactions, rates, baseCurrency, categories, budget } = data;
  const debts = data.debts || [];
  const settings = data.settings || DEFAULT_SETTINGS;
  const mode = settings.theme === "system" || !settings.theme ? systemTheme : settings.theme;
  const C = PALETTES[mode];

  const saveRecord = (rec, repeat) => update((prev) => {
    const exists = prev.transactions.some((t) => t.id === rec.id);
    const transactions = exists
      ? prev.transactions.map((t) => (t.id === rec.id ? rec : t))
      : [...prev.transactions, rec];
    if (!repeat) return { ...prev, transactions };

    /* the saved record is occurrence one; the rule produces the rest */
    const ruleId = uid();
    const { seriesId, id, date, ...template } = rec;
    const rule = {
      id: ruleId,
      active: true,
      freq: repeat.freq,
      startDate: rec.date,
      endDate: repeat.endDate || null,
      lastGenerated: rec.date,
      template,
      createdAt: new Date().toISOString(),
    };
    return {
      ...prev,
      transactions: transactions.map((t) => (t.id === rec.id ? { ...t, seriesId: ruleId } : t)),
      recurring: [...(prev.recurring || []), rule],
    };
  });
  const deleteRecord = (id) => update((prev) => ({ ...prev, transactions: prev.transactions.filter((t) => t.id !== id) }));
  const addAccount = (acc) => update((prev) => ({ ...prev, accounts: [...prev.accounts, acc] }));
  const updateAccount = (id, patch) => update((prev) => ({ ...prev, accounts: prev.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)) }));
  const deleteAccount = (id) => update((prev) => ({ ...prev, accounts: prev.accounts.filter((a) => a.id !== id) }));

  /* Creating a loan can also move the money, so balances stay correct. */
  const addDebt = (d, accountId) => update((p) => {
    let nextTx = p.transactions;
    if (accountId) {
      const acc = p.accounts.find((a) => a.id === accountId);
      const amt = acc && acc.currency !== d.currency
        ? convert(d.amount, d.currency, acc.currency, p.rates)
        : d.amount;
      nextTx = [...p.transactions, {
        id: uid(),
        type: d.kind === "receivable" ? "expense" : "income",
        accountId,
        amount: Math.round(amt * 100) / 100,
        category: d.kind === "receivable" ? "Money lent" : "Money borrowed",
        date: d.date,
        note: `${d.kind === "receivable" ? "To" : "From"} ${d.person}`,
        payee: d.person,
      }];
    }
    return { ...p, debts: [...(p.debts || []), d], transactions: nextTx };
  });
  const editDebt = (d) => update((p) => ({ ...p, debts: (p.debts || []).map((x) => (x.id === d.id ? { ...x, ...d } : x)) }));
  const deleteDebt = (id) => update((p) => ({ ...p, debts: (p.debts || []).filter((x) => x.id !== id) }));

  /* A repayment always updates the debt; if an account is given it also writes a
     real transaction so balances stay correct. */
  const addDebtPayment = (debtId, amount, accountId) => update((p) => {
    const list = p.debts || [];
    const debt = list.find((d) => d.id === debtId);
    if (!debt) return p;
    const payment = { id: uid(), amount, date: new Date().toISOString() };
    const nextDebts = list.map((d) => (d.id === debtId ? { ...d, payments: [...(d.payments || []), payment] } : d));
    let nextTx = p.transactions;
    if (accountId) {
      const acc = p.accounts.find((a) => a.id === accountId);
      const inAccountCurrency = acc && acc.currency !== debt.currency
        ? convert(amount, debt.currency, acc.currency, p.rates)
        : amount;
      nextTx = [...p.transactions, {
        id: uid(),
        type: debt.kind === "receivable" ? "income" : "expense",
        accountId,
        amount: Math.round(inAccountCurrency * 100) / 100,
        category: "Debt repayment",
        date: payment.date,
        note: `${debt.kind === "receivable" ? "From" : "To"} ${debt.person}`,
        payee: debt.person,
      }];
    }
    return { ...p, debts: nextDebts, transactions: nextTx };
  });

  /* while viewing an account, a new record should default to that account */
  const openAddRecord = () => {
    setEditing(null);
    setPresetAccountId(detailAccountId || null);
    setSheetOpen(true);
  };
  const openEditRecord = (t) => { setEditing(t); setPresetAccountId(null); setSheetOpen(true); };
  const openAddAccount = () => { setAccountFormEditing(null); setAccountFormOpen(true); };
  const openEditAccount = (acc) => { setAccountFormEditing(acc); setAccountFormOpen(true); };

  const tryDeleteAccount = (acc) => {
    if (!acc) return;
    const used = transactions.filter((t) => t.accountId === acc.id || t.toAccountId === acc.id).length;
    if (used > 0) {
      setConfirm({
        title: "Can't delete yet",
        message: `"${acc.name}" still has ${used} record(s) attached. Delete or move those first, then remove the account.`,
        confirmLabel: "OK",
        danger: false,
        action: () => {},
      });
      return;
    }
    setConfirm({
      title: "Delete account",
      message: `Permanently remove "${acc.name}"? This cannot be undone.`,
      confirmLabel: "Delete account",
      danger: true,
      action: () => {
        deleteAccount(acc.id);
        setAccountFormOpen(false);
        if (detailAccountId === acc.id) setDetailAccountId(null);
      },
    });
  };

  const detailAccount = detailAccountId ? accounts.find((a) => a.id === detailAccountId) : null;
  const detailBalance = detailAccount ? accountBalance(detailAccount, transactions) : 0;

  const rangeProps = { range, setRange, monthCursor, setMonthCursor, customRange, setCustomRange };

  return (
    <SettingsCtx.Provider value={settings}>
    <ThemeCtx.Provider value={C}>
    <div style={{
      minHeight: "100vh", maxWidth: "100vw", overflowX: "hidden", color: C.text,
      background: `linear-gradient(180deg, ${C.bgTop} 0%, ${C.bgBot} 46%, ${C.bgBot} 100%)`,
      fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        :root { color-scheme: ${mode}; }
        * { box-sizing: border-box; -webkit-text-size-adjust: 100%; }
        html, body { overflow-x: hidden; max-width: 100vw; background: ${C.bgBot}; margin: 0; }
        input, select, textarea { font-size: 16px; font-family: inherit; }
        input:focus, select:focus { border-color: ${C.text3} !important; }
        input::placeholder { color: ${C.text3}; }
        select option { background: ${C.surface}; color: ${C.text}; }
        button { font-family: inherit; }
        ::-webkit-scrollbar { height: 0; width: 0; }
      `}</style>

      <main style={{ maxWidth: 560, margin: "0 auto", padding: "14px 16px 150px", width: "100%" }}>
        {!detailAccount && view !== "home" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <button onClick={() => setSettingsOpen(true)} style={roundBtn(C)} aria-label="Settings"><HexNut size={19} /></button>
            <button
              onClick={() => update((p) => ({
                ...p,
                settings: { ...(p.settings || DEFAULT_SETTINGS), hideBalances: !(p.settings || DEFAULT_SETTINGS).hideBalances },
              }))}
              style={{ ...roundBtn(C), color: settings.hideBalances ? C.mint : C.text2 }}
              aria-label={settings.hideBalances ? "Show balances" : "Hide balances"}
              title={settings.hideBalances ? "Show balances" : "Hide balances"}
            >
              {settings.hideBalances ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        )}

        {saveError && (
          <div style={{ background: C.errBg, border: `1px solid ${C.errBorder}`, color: C.errText, padding: "10px 14px", borderRadius: 12, fontSize: 12.5, marginBottom: 14 }}>
            {supabase
              ? "Not synced yet — your changes are saved on this phone and will sync when you're back online."
              : "Couldn't save your last change — check your connection."}
          </div>
        )}

        {detailAccount ? (
          <AccountDetail account={detailAccount} accounts={accounts} transactions={transactions} categories={categories}
            onBack={() => setDetailAccountId(null)} onEdit={openEditAccount}
            onOpenEditRecord={openEditRecord} onOpenBalanceAdjust={() => setBalanceSheetOpen(true)} />
        ) : (
          <>
            {view === "home" && <Home
              accounts={accounts} transactions={transactions} categories={categories} budget={budget} debts={debts}
              rates={rates} base={baseCurrency}
              onOpenSettings={() => setSettingsOpen(true)}
              onToggleHide={() => update((p) => ({
                ...p,
                settings: { ...(p.settings || DEFAULT_SETTINGS), hideBalances: !(p.settings || DEFAULT_SETTINGS).hideBalances },
              }))}
              onGoto={setView} onOpenRecord={openEditRecord} />}
            {view === "activity" && <Activity accounts={accounts} transactions={transactions} categories={categories} rates={rates} base={baseCurrency} {...rangeProps} onOpenEdit={openEditRecord} />}
            {view === "summary" && <Summary accounts={accounts} transactions={transactions} categories={categories} rates={rates} base={baseCurrency} {...rangeProps} onOpenRecord={openEditRecord} />}
            {view === "budget" && <Budget budget={budget} categories={categories} transactions={transactions} accounts={accounts} rates={rates} base={baseCurrency}
              monthCursor={monthCursor} setMonthCursor={setMonthCursor}
              onSetTotal={(v) => update((p) => ({ ...p, budget: { ...p.budget, total: v } }))}
              onSetAllocations={(a) => update((p) => ({ ...p, budget: { ...p.budget, allocations: a } }))} />}
            {view === "debts" && <Debts
              debts={debts} accounts={accounts} rates={rates} base={baseCurrency}
              onBack={() => setView("home")} onAdd={addDebt} onEdit={editDebt}
              onDelete={deleteDebt} onAddPayment={addDebtPayment} />}
            {view === "analytics" && <Analytics accounts={accounts} transactions={transactions} categories={categories} budget={budget} rates={rates} base={baseCurrency} {...rangeProps} onBack={() => setView("home")} />}
            {view === "accounts" && <AccountsView accounts={accounts} transactions={transactions} rates={rates} base={baseCurrency} onOpenDetail={setDetailAccountId} onAddNew={openAddAccount} />}
          </>
        )}
      </main>

      {/* floating add button */}
      {/* soft vertical sheen: light top edge, slightly deeper base, thin inner rim */}
      <button onClick={openAddRecord} aria-label="Add record" style={{
        position: "fixed", bottom: 104, right: 20, width: 62, height: 62, borderRadius: 999,
        background: `linear-gradient(165deg, ${C.fabTop} 0%, ${C.primary} 52%, ${C.fabBottom} 100%)`,
        border: "none", display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", zIndex: 20, color: C.onPrimary,
        boxShadow: `${C.fabShadow}, inset 0 1.5px 0 ${C.fabSheen}, inset 0 -2px 6px ${C.fabInner}`,
      }}><Plus size={28} strokeWidth={2.6} /></button>

      {/* floating pill nav */}
      <div style={{ position: "fixed", bottom: 18, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 20, pointerEvents: "none" }}>
        <div style={{
          display: "flex", gap: 2, padding: 6, borderRadius: 999, pointerEvents: "auto",
          background: C.navBg, backdropFilter: "blur(14px)",
          border: `1px solid ${C.border}`, boxShadow: C.navShadow, maxWidth: "94vw",
        }}>
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = view === n.id && !detailAccount;
            return (
              <button key={n.id} onClick={() => { setView(n.id); setDetailAccountId(null); }} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                padding: "9px 12px", borderRadius: 999, border: "none", cursor: "pointer",
                background: active ? C.surface3 : "transparent",
                color: active ? C.text : C.text3, minWidth: 60,
              }}>
                {/* same glyph, same box — only the weight changes */}
                <Icon size={21} weight={active ? "fill" : "regular"} />
                <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{n.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <RecordSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onSave={saveRecord} onDelete={deleteRecord}
        accounts={accounts} rates={rates} categories={categories} initial={editing} defaultAccountId={presetAccountId}
        onFieldsChange={(v) => update((p) => ({ ...p, settings: { ...(p.settings || DEFAULT_SETTINGS), fields: v } }))}
        onSaveLending={addDebt}
        people={debtPeople} />
      <BalanceAdjustSheet open={balanceSheetOpen} onClose={() => setBalanceSheetOpen(false)} account={detailAccount}
        currentBalance={detailBalance}
        onAdjustByRecord={(delta) => detailAccount && saveRecord({
          id: uid(), type: delta > 0 ? "income" : "expense", accountId: detailAccount.id,
          amount: Math.abs(delta), category: "Balance correction", date: new Date().toISOString(),
          note: "Balance adjustment", payee: "",
        })}
        onChangeInitialBalance={(v) => detailAccount && updateAccount(detailAccount.id, { opening: v })} />
      <AccountFormSheet open={accountFormOpen} onClose={() => setAccountFormOpen(false)} initial={accountFormEditing}
        onDelete={(id) => tryDeleteAccount(accounts.find((a) => a.id === id))}
        onSubmit={(patch) => {
          if (accountFormEditing) updateAccount(accountFormEditing.id, patch);
          else addAccount({ id: uid(), ...patch });
          setAccountFormOpen(false);
        }} />
      <ConfirmSheet
        open={!!confirm} onClose={() => setConfirm(null)}
        title={confirm ? confirm.title : ""}
        message={confirm ? confirm.message : ""}
        confirmLabel={confirm ? confirm.confirmLabel : ""}
        danger={confirm ? confirm.danger : false}
        onConfirm={() => confirm && confirm.action()} />
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)}
        accountEmail={supabase && session ? session.user.email : null}
        onSignOut={signOut} syncProblem={saveError} onDeleteUserAccount={deleteUserAccount}
        categories={categories}
        onCategoriesChange={(c) => update((p) => ({ ...p, categories: c }))}
        rates={rates} base={baseCurrency}
        onRatesChange={(r) => update((p) => ({ ...p, rates: r }))}
        onBaseChange={(b) => update((p) => ({ ...p, baseCurrency: b }))}
        settings={settings}
        onSettingsChange={(sv) => update((p) => ({ ...p, settings: sv }))}
        data={data}
        onImport={(parsed) => {
          const next = {
            ...defaultData(), ...parsed,
            categories: {
              expense: normalizeCats(parsed.categories?.expense),
              income: normalizeCats(parsed.categories?.income),
            },
            budget: parsed.budget || { total: 0, allocations: {} },
            settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
          };
          update(next);
          setSettingsOpen(false);
        }}
        accounts={accounts}
        onAccountsReorder={(next) => update((p) => ({ ...p, accounts: next }))}
        onStopRecurring={(id) => update((p) => ({
          ...p, recurring: (p.recurring || []).map((r) => (r.id === id ? { ...r, active: false } : r)),
        }))}
        onEditAccount={openEditAccount}
        onNewAccount={openAddAccount}
        onErase={() => { update(emptyData(settings)); setSettingsOpen(false); setDetailAccountId(null); setView("activity"); }} />
    </div>
    </ThemeCtx.Provider>
    </SettingsCtx.Provider>
  );
}

/* Any crash while drawing used to leave a blank black page. Show what broke
   instead, with a way to copy it and to try again. */
const AppErrorBoundary = class extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) {
    this.setState({ stack: (info && info.componentStack) || "" });
  }
  render() {
    if (!this.state.error) return this.props.children;
    const msg = String((this.state.error && (this.state.error.stack || this.state.error.message)) || this.state.error);
    const where = (this.state.stack || "").trim().split("\n").slice(0, 4).join("\n");
    const text = msg + (where ? "\n\nIn:\n" + where : "");
    const box = { fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" };
    const btn = { padding: "12px 18px", borderRadius: 999, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer" };
    return (
      <div style={{ minHeight: "100vh", background: "#0B0E10", color: "#E8ECEB", padding: "48px 20px",
        fontFamily: "system-ui, -apple-system, sans-serif", boxSizing: "border-box" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Something went wrong</div>
          <div style={{ fontSize: 14, color: "#9AA3A6", marginTop: 6, lineHeight: 1.5 }}>
            Your records are safe. Send a screenshot of this to get it fixed.
          </div>
          <div style={{ ...box, marginTop: 18, padding: 14, borderRadius: 12, background: "#171C1F", color: "#F07A63" }}>{text}</div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button style={{ ...btn, background: "#E8ECEB", color: "#0B0E10" }} onClick={() => window.location.reload()}>Reload</button>
            <button style={{ ...btn, background: "#232A2E", color: "#E8ECEB" }}
              onClick={() => { try { navigator.clipboard.writeText(text); } catch {} }}>Copy error</button>
          </div>
        </div>
      </div>
    );
  }
};

export default function App() {
  return (
    <AppErrorBoundary>
      <LedgerApp />
    </AppErrorBoundary>
  );
}
