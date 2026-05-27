import React, { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  Clock,
  ShoppingBag,
  ArrowRight,
  ArrowUpRight,
  Navigation,
  Flame,
  Star,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────
   DERENDINGER PIZZERIA — Hauptstrasse 58, 4552 Derendingen
   Warm mediterranes Lokanta-Design · türkischer Akzent (Nazar)
   ──────────────────────────────────────────────────────────── */

const ORDER_URL = "https://www.just-eat.ch/speisekarte/daerendinger-pizza";
const ADDRESS = "Hauptstrasse 58, 4552 Derendingen";
const MAPS_EMBED =
  "https://www.google.com/maps?q=Hauptstrasse%2058%2C%204552%20Derendingen&output=embed";
const MAPS_DIR =
  "https://www.google.com/maps/dir/?api=1&destination=Hauptstrasse+58,+4552+Derendingen";

/* Öffnungs-/Lieferzeiten in Minuten ab Mitternacht */
const HOURS = {
  0: [[630, 1365]], // So 10:30–22:45
  1: [[630, 810], [990, 1365]], // Mo
  2: [[630, 810], [990, 1365]],
  3: [[630, 810], [990, 1365]],
  4: [[630, 810], [990, 1365]],
  5: [[630, 810], [990, 1365]], // Fr
  6: [[630, 1365]], // Sa 10:30–22:45
};
const DAY_NAMES = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

const fmt = (m) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

function openStatus(now) {
  const min = now.getHours() * 60 + now.getMinutes();
  const day = now.getDay();
  const windows = HOURS[day] || [];
  for (const [a, b] of windows) {
    if (min >= a && min < b) return { open: true, text: `Jetzt geöffnet · bis ${fmt(b)} Uhr` };
  }
  // nächste Öffnung heute?
  for (const [a] of windows) {
    if (min < a) return { open: false, text: `Geschlossen · öffnet um ${fmt(a)} Uhr` };
  }
  // sonst nächster Tag mit Fenster
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const w = HOURS[d];
    if (w && w.length) {
      const label = i === 1 ? "morgen" : DAY_NAMES[d];
      return { open: false, text: `Geschlossen · öffnet ${label} um ${fmt(w[0][0])} Uhr` };
    }
  }
  return { open: false, text: "Geschlossen" };
}

/* ── Speisekarte ─────────────────────────────────────────── */
const MENU = [
  {
    id: "pizza",
    label: "Pizza",
    kind: "pizza",
    note: "Ø 32 cm  /  Ø 40 cm",
    items: [
      ["Margherita", "Tomatensauce, Mozzarella, Oregano", 14, 26],
      ["Cipolla", "Tomatensauce, Mozzarella, Zwiebeln", 15, 27],
      ["Funghi", "Tomatensauce, Mozzarella, Champignons", 15, 27],
      ["All'Aglio", "Tomatensauce, Mozzarella, Knoblauch, Peperoncini", 15, 27],
      ["Gorgonzola", "Tomatensauce, Mozzarella, Gorgonzola", 15, 27],
      ["Prosciutto", "Tomatensauce, Mozzarella, Schinken", 16, 28],
      ["Salami", "Tomatensauce, Mozzarella, Salami", 16, 28],
      ["Hot Salami", "Tomatensauce, Mozzarella, scharfe Salami", 16, 28],
      ["Sucuk", "Tomatensauce, Mozzarella, Knoblauchwurst, Ei", 16, 28],
      ["Hawaii", "Tomatensauce, Mozzarella, Schinken, Ananas", 16, 28],
      ["Napoli", "Tomatensauce, Mozzarella, Sardellen, Oliven, Kapern", 17, 29],
      ["Frutti di Mare", "Tomatensauce, Mozzarella, Meeresfrüchte, Knoblauch", 17, 29],
      ["Vegetaria", "Champignons, Peperoni, Spinat, Broccoli, Kräuterbutter", 17, 29],
      ["Tonno", "Tomatensauce, Mozzarella, Thon, Zwiebeln", 17, 29],
      ["Prosciutto & Funghi", "Tomatensauce, Mozzarella, Schinken, Champignons", 17, 29],
      ["Rustica", "Tomatensauce, Mozzarella, Speck, Zwiebeln, Oliven", 17, 29],
      ["Kebap", "Tomatensauce, Mozzarella, Kebapfleisch", 17, 29],
      ["Calzone", "Zugedeckt · Schinken, Champignons, Ei", 17, 29],
      ["Quattro Formaggi", "Tomatensauce, Mozzarella, 4 Käsesorten", 18, 30],
      ["Quattro Stagioni", "Schinken, Champignons, Artischocken, Peperoni", 18, 30],
      ["Diavolo", "Schinken, scharfe Salami, Pepperoncini, Oliven", 18, 30],
      ["Gyros", "Tomatensauce, Mozzarella, Kebapfleisch, Pommes", 18, 33],
      ["Pollo", "Tomatensauce, Mozzarella, Poulet", 18, 27],
      ["Mamma Mia", "Schinken, Salami, Champignons, Speck, Zwiebeln", 20, 33],
    ],
  },
  {
    id: "kebab",
    label: "Kebab & Döner",
    kind: "single",
    note: "Mit Salat, Zwiebeln, Tomaten & Sauce nach Wahl",
    items: [
      ["Kebab im Taschenbrot", "Salat, Zwiebeln, Tomaten, Sauce nach Wahl", 12],
      ["Kebab Cheese im Taschenbrot", "Mit Schmelzkäse & Zutaten nach Wahl", 13],
      ["Mega Kebap im Taschenbrot", "Die grosse Portion", 15],
      ["Dürüm", "Im Fladenbrot gerollt", 13],
      ["Mega Dürüm", "Extra grosse Füllung", 16],
      ["Dürüm Gyros", "Mit Pommes Frites", 14],
      ["Kebap Gyros", "Mit Pommes Frites", 13],
      ["Döner Box", "Mit Pommes Frites", 14],
      ["XXL Döner Box", "Die XXL-Variante", 15],
      ["Kebap Vegi", "Mit Feta", 10],
      ["Dürüm Vegi", "Mit Feta", 10],
      ["Falafel im Taschenbrot", "Hausgemachte Falafel", 11],
      ["Falafel Dürüm", "Im Fladenbrot", 12],
      ["Mega Falafel Dürüm", "Extra gross", 15],
      ["Falafel Box", "Mit Pommes Frites", 12],
    ],
  },
  {
    id: "pide",
    label: "Pide & Lahmacun",
    kind: "single",
    note: "Türkische Spezialität aus dem Ofen",
    items: [
      ["Lahmacun", "Dünner Teig mit würziger Hackfleischauflage", 15],
      ["Lahmacun mit Kebab", "Lahmacun gefüllt mit Kebapfleisch", 18],
      ["Pide Kebapfleisch", "Schiffchen-Pide mit Kebap", 17],
      ["Pide Hackfleisch & Ei", "Klassisch herzhaft", 16],
      ["Pide Sucuk", "Mit türkischer Knoblauchwurst", 16],
      ["Pide Sucuk & Ei", "Sucuk verfeinert mit Ei", 17],
      ["Pide Spinat", "Mit Spinat", 15],
      ["Pide Feta", "Mit Feta", 13],
    ],
  },
  {
    id: "pasta",
    label: "Pasta",
    kind: "single",
    items: [
      ["Spaghetti Bolognese", "Tomatensauce mit Rindshackfleisch", 16],
      ["Spaghetti Carbonara", "Speck & Ei", 16],
      ["Spaghetti Napoli", "Feine Tomatensauce", 15],
      ["Spaghetti Crevetten", "Rahmsauce mit Crevetten", 18],
      ["Penne Poulet", "Rahmsauce mit Poulet", 18],
      ["Penne Arrabiata", "Tomatensauce mit Pepperoncini", 16],
      ["Penne Napoli", "Feine Tomatensauce", 15],
    ],
  },
  {
    id: "burger",
    label: "Burger",
    kind: "single",
    note: "Mit Tomaten, Salat, Zwiebeln & Sauce nach Wahl",
    items: [
      ["Mega Cheeseburger", "Rindfleisch 2× 125 g, Käse", 14],
      ["Mega Burger", "Rindfleisch 2× 125 g", 13],
      ["Bacon Burger", "Mit knusprigem Speck", 13],
      ["Cheeseburger", "Mit Schmelzkäse", 11],
      ["Hamburger", "Rindfleisch 125 g", 10],
    ],
  },
  {
    id: "tacos",
    label: "Tacos",
    kind: "single",
    items: [
      ["Tacos Kebab & Poulet", "Doppelt belegt", 15],
      ["Tacos Kebab", "Mit Kebapfleisch", 13],
      ["Tacos Poulet", "Mit Poulet", 13],
    ],
  },
  {
    id: "snacks",
    label: "Snacks & Teller",
    kind: "single",
    items: [
      ["Kebapteller", "Pommes, gem. Salat, Reis, Sauce nach Wahl", 18],
      ["Cordon Bleu Pilze", "Raclettekäse, Steinpilze, Champignons", 25],
      ["Cordon Bleu Tessiner", "Rohschinken & Gorgonzola", 24],
      ["Cordon Bleu Classic", "Raclettekäse & Schinken", 23],
      ["Fischknusperli Teller", "9 Stück, Salat & Pommes", 20],
      ["Poulet Flügeli", "6 Stück, Pommes, Salat & Sauce", 19],
      ["Poulet Box", "Grillierte Pouletbrust & Pommes", 16],
      ["Pouletschnitzel Teller", "2 Stück, Pommes, Salat & Reis", 16],
      ["Fitnessteller Poulet", "Geschnetzeltes & gem. Salat", 16],
      ["Chicken Nuggets", "8 Stück, Pommes & Sauce", 15],
      ["Chicken Nuggets Box", "6 Stück, Pommes & Sauce", 11],
      ["Pepito", "Pouletbrust im Taschenbrot", 12],
      ["Pouletschnitzel im Taschenbrot", "Zutaten & Sauce nach Wahl", 10],
      ["Pommes Frites", "Grosse Portion", 7],
    ],
  },
  {
    id: "salate",
    label: "Salate",
    kind: "single",
    note: "Mit Salatsauce nach Wahl",
    items: [
      ["Hirten Salat", "Tomaten, Gurken, Feta, Zwiebeln, Oliven", 12],
      ["Caprese Salat", "Tomaten & Mozzarella", 12],
      ["Thon Salat", "Grüner Salat, Thon, Zwiebeln", 11],
      ["Gemischter Salat", "Bunt & frisch", 9],
      ["Grüner Salat", "Knackig grün", 7],
    ],
  },
  {
    id: "dessert",
    label: "Dessert",
    kind: "single",
    items: [
      ["Baklava", "4 Stück · türkisches Original", 7],
      ["Tiramisu", "Hausgemacht", 7],
    ],
  },
  {
    id: "drinks",
    label: "Getränke",
    kind: "drinks",
    items: [
      ["Coca-Cola", [["0.33l", 3], ["0.5l", 4], ["1.5l", 6]]],
      ["Coca-Cola Zero", [["0.33l", 3], ["0.5l", 4], ["1.5l", 6]]],
      ["Fanta Orange", [["0.33l", 3], ["0.5l", 4], ["1.5l", 6]]],
      ["Sprite", [["0.33l", 3], ["0.5l", 4], ["1.5l", 6]]],
      ["Ice Tea Lemon", [["0.33l", 3], ["0.5l", 4], ["1.5l", 6]]],
      ["Ice Tea Peach", [["0.33l", 3], ["0.5l", 4], ["1.5l", 6]]],
      ["Rivella Rot", [["0.5l", 4], ["1.5l", 6]]],
      ["Rivella Blau", [["0.5l", 4], ["1.5l", 6]]],
      ["Uludağ Grün", [["0.33l", 3], ["0.5l", 4]]],
      ["Uludağ Orange", [["0.33l", 3], ["0.5l", 4]]],
      ["Ayran", [["0.33l", 3]]],
      ["Apfelschorle", [["0.5l", 5]]],
      ["Schweppes Bitter Lemon", [["0.5l", 5]]],
      ["Red Bull", [["0.25l", 4]]],
      ["Feldschlösschen", [["0.5l", 5]]],
      ["Heineken", [["0.5l", 5]]],
      ["Corona", [["0.25l", 5]]],
      ["Desperados", [["0.25l", 5]]],
      ["Smirnoff Ice", [["0.25l", 5]]],
      ["Merlot · Rotwein", [["0.5l", 15]]],
      ["Fécy · Weisswein", [["0.5l", 15]]],
      ["Roséwein", [["0.5l", 15]]],
    ],
  },
];

const HIGHLIGHTS = [
  { t: "Holzofen-Pizza", s: "24 Sorten, knusprig gebacken", p: "ab 14.–", icon: Flame },
  { t: "Döner & Dürüm", s: "Frisch vom Spiess", p: "ab 10.–", icon: ShoppingBag },
  { t: "Pide & Lahmacun", s: "Türkische Spezialität", p: "ab 13.–", icon: Star },
  { t: "Baklava & Tiramisu", s: "Süsses Finale", p: "7.–", icon: Star },
];

/* ── Nazar-Auge (türkisches Glückssymbol) als Markenglyph ── */
function Nazar({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="19" fill="#1B6CA8" />
      <circle cx="20" cy="20" r="13.5" fill="#f4f7fb" />
      <circle cx="20" cy="20" r="8.5" fill="#2C97DE" />
      <circle cx="20" cy="20" r="4" fill="#10243a" />
      <circle cx="18" cy="18" r="1.4" fill="#fff" opacity="0.85" />
    </svg>
  );
}

const price = (n) => Number(n).toFixed(2).replace(".", ".");

/* ── Header / Navigation ─────────────────────────────────── */
function Nav({ page, go, status }) {
  const links = [
    ["home", "Startseite"],
    ["menu", "Menü"],
    ["location", "Standort"],
  ];
  return (
    <header className="nav">
      <button className="brand" onClick={() => go("home")}>
        <Nazar />
        <span className="brand-text">
          Derendinger<em>Pizzeria</em>
        </span>
      </button>
      <nav className="nav-links">
        {links.map(([k, l]) => (
          <button
            key={k}
            className={"nav-link" + (page === k ? " is-active" : "")}
            onClick={() => go(k)}
          >
            {l}
          </button>
        ))}
      </nav>
      <a className="btn btn-sm" href={ORDER_URL} target="_blank" rel="noreferrer">
        <ShoppingBag size={16} /> Bestellen
      </a>
    </header>
  );
}

/* ── Startseite ──────────────────────────────────────────── */
function Home({ go, status }) {
  return (
    <main className="page">
      <section className="hero">
        <div className="hero-grain" />
        <div className="hero-inner">
          <p className="eyebrow reveal" style={{ animationDelay: "0.05s" }}>
            <span className="dot" /> Hoş geldiniz · Willkommen in Derendingen
          </p>
          <h1 className="display reveal" style={{ animationDelay: "0.15s" }}>
            Holzofen-Pizza,
            <br />
            saftiger <span className="hl">Döner</span> &amp;
            <br />
            echte türkische <span className="hl-blue">Pide</span>.
          </h1>
          <p className="lede reveal" style={{ animationDelay: "0.28s" }}>
            Italienisch-türkische Küche im Herzen von Derendingen. Frisch
            zubereitet, grosszügig belegt und schnell zu dir geliefert.
          </p>
          <div className="hero-cta reveal" style={{ animationDelay: "0.4s" }}>
            <button className="btn" onClick={() => go("menu")}>
              Menü ansehen <ArrowRight size={18} />
            </button>
            <a className="btn btn-ghost" href={ORDER_URL} target="_blank" rel="noreferrer">
              Online bestellen <ArrowUpRight size={18} />
            </a>
          </div>
          <div
            className={"status-pill reveal " + (status.open ? "is-open" : "is-closed")}
            style={{ animationDelay: "0.52s" }}
          >
            <span className="status-dot" />
            <Clock size={15} /> {status.text}
          </div>
        </div>
        <div className="hero-plate reveal-scale" style={{ animationDelay: "0.3s" }}>
          <div className="plate">
            <div className="plate-ring" />
            <span className="plate-emoji">🍕</span>
          </div>
          <div className="plate-tag">Margherita · ab 14.–</div>
        </div>
      </section>

      <section className="strip">
        {["Täglich frisch", "Hausgemachte Saucen", "Schnelle Lieferung", "Mit Liebe gemacht"].map(
          (t, i) => (
            <span key={i} className="strip-item">
              {t}
            </span>
          )
        )}
      </section>

      <section className="highlights">
        <div className="sec-head">
          <h2 className="sec-title">Unsere Lieblinge</h2>
          <p className="sec-sub">Eine kleine Auswahl aus der Küche.</p>
        </div>
        <div className="cards">
          {HIGHLIGHTS.map((h, i) => {
            const Icon = h.icon;
            return (
              <button key={i} className="card" onClick={() => go("menu")}>
                <span className="card-icon">
                  <Icon size={22} />
                </span>
                <h3 className="card-t">{h.t}</h3>
                <p className="card-s">{h.s}</p>
                <span className="card-p">{h.p}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="band">
        <div className="band-inner">
          <Nazar size={44} />
          <h2 className="band-title">
            Lust auf etwas Feines? <span>Die ganze Karte wartet.</span>
          </h2>
          <p className="band-sub">
            Von der klassischen Margherita bis zum Mega Dürüm — über 80 Gerichte
            zur Auswahl.
          </p>
          <button className="btn btn-light" onClick={() => go("menu")}>
            Zur Speisekarte <ArrowRight size={18} />
          </button>
        </div>
      </section>

      <Footer go={go} />
    </main>
  );
}

/* ── Menü ────────────────────────────────────────────────── */
function Menu({ go }) {
  const [active, setActive] = useState("pizza");

  const scrollTo = (id) => {
    setActive(id);
    const el = document.getElementById("cat-" + id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 130;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <main className="page">
      <section className="menu-head">
        <p className="eyebrow">
          <span className="dot" /> Afiyet olsun · Guten Appetit
        </p>
        <h1 className="display sm">Speisekarte</h1>
        <p className="lede center">
          Alle Preise in CHF, inkl. Pfand. Online bestellen über Just&nbsp;Eat.
        </p>
      </section>

      <div className="cat-bar">
        <div className="cat-bar-inner">
          {MENU.map((c) => (
            <button
              key={c.id}
              className={"chip" + (active === c.id ? " is-active" : "")}
              onClick={() => scrollTo(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <section className="menu-body">
        {MENU.map((cat) => (
          <div key={cat.id} id={"cat-" + cat.id} className="cat">
            <div className="cat-head">
              <h2 className="cat-title">{cat.label}</h2>
              {cat.note && <span className="cat-note">{cat.note}</span>}
            </div>

            {cat.kind === "drinks" ? (
              <div className="drinks-grid">
                {cat.items.map(([name, sizes], i) => (
                  <div key={i} className="drink">
                    <span className="drink-name">{name}</span>
                    <span className="drink-prices">
                      {sizes.map(([s, p], j) => (
                        <span key={j} className="drink-price">
                          <em>{s}</em> {price(p)}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="dishes">
                {cat.items.map((it, i) => {
                  const [name, desc] = it;
                  return (
                    <li key={i} className="dish">
                      <div className="dish-main">
                        <span className="dish-name">{name}</span>
                        <span className="leader" />
                        {cat.kind === "pizza" ? (
                          <span className="dish-price dual">
                            <span>{price(it[2])}</span>
                            <span className="slash">/</span>
                            <span>{price(it[3])}</span>
                          </span>
                        ) : (
                          <span className="dish-price">{price(it[2])}</span>
                        )}
                      </div>
                      {desc && <p className="dish-desc">{desc}</p>}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}

        <div className="order-cta">
          <p>Hunger bekommen?</p>
          <a className="btn" href={ORDER_URL} target="_blank" rel="noreferrer">
            Jetzt online bestellen <ArrowUpRight size={18} />
          </a>
        </div>
      </section>

      <Footer go={go} />
    </main>
  );
}

/* ── Standort / Maps ─────────────────────────────────────── */
function Location({ go, status }) {
  const today = new Date().getDay();
  const rows = [
    { d: "Mo – Fr", t: "10:30 – 13:30  ·  16:30 – 22:45", days: [1, 2, 3, 4, 5] },
    { d: "Sa – So", t: "10:30 – 22:45", days: [0, 6] },
  ];
  return (
    <main className="page">
      <section className="loc-head">
        <p className="eyebrow">
          <span className="dot" /> Komm vorbei
        </p>
        <h1 className="display sm">Standort &amp; Zeiten</h1>
      </section>

      <section className="loc-grid">
        <div className="map-wrap">
          <iframe
            title="Karte Derendinger Pizzeria"
            src={MAPS_EMBED}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="loc-info">
          <div className="info-block">
            <span className="info-ico">
              <MapPin size={20} />
            </span>
            <div>
              <h3>Adresse</h3>
              <p>
                Derendinger Pizzeria
                <br />
                Hauptstrasse 58
                <br />
                4552 Derendingen
              </p>
              <a className="link" href={MAPS_DIR} target="_blank" rel="noreferrer">
                <Navigation size={15} /> Route planen
              </a>
            </div>
          </div>

          <div className="info-block">
            <span className="info-ico">
              <Clock size={20} />
            </span>
            <div className="full">
              <h3>
                Liefer- &amp; Öffnungszeiten
                <span className={"mini-pill " + (status.open ? "is-open" : "is-closed")}>
                  {status.open ? "offen" : "zu"}
                </span>
              </h3>
              <table className="hours">
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className={r.days.includes(today) ? "is-today" : ""}>
                      <td className="hd">{r.d}</td>
                      <td className="ht">{r.t}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="hours-note">{status.text}</p>
            </div>
          </div>

          <a className="btn full-w" href={ORDER_URL} target="_blank" rel="noreferrer">
            <ShoppingBag size={18} /> Online bestellen
          </a>
        </div>
      </section>

      <Footer go={go} />
    </main>
  );
}

/* ── Footer ──────────────────────────────────────────────── */
function Footer({ go }) {
  return (
    <footer className="footer">
      <div className="foot-grid">
        <div>
          <div className="foot-brand">
            <Nazar size={26} />
            <span>Derendinger Pizzeria</span>
          </div>
          <p className="foot-p">
            Italienisch-türkische Küche · Hauptstrasse 58, 4552 Derendingen
          </p>
        </div>
        <div className="foot-nav">
          <button onClick={() => go("home")}>Startseite</button>
          <button onClick={() => go("menu")}>Menü</button>
          <button onClick={() => go("location")}>Standort</button>
          <a href={ORDER_URL} target="_blank" rel="noreferrer">
            Bestellen
          </a>
        </div>
      </div>
      <div className="foot-bar">
        <span>© {new Date().getFullYear()} Derendinger Pizzeria</span>
        <span>Afiyet olsun · Guten Appetit</span>
      </div>
    </footer>
  );
}

/* ── App ─────────────────────────────────────────────────── */
export default function App() {
  const [page, setPage] = useState("home");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const status = useMemo(() => openStatus(now), [now]);

  const go = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="root">
      <style>{CSS}</style>
      <Nav page={page} go={go} status={status} />
      {page === "home" && <Home go={go} status={status} />}
      {page === "menu" && <Menu go={go} />}
      {page === "location" && <Location go={go} status={status} />}
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..900&family=Hanken+Grotesk:wght@400;500;600;700&display=swap');

.root *{box-sizing:border-box;margin:0;padding:0;}
.root{
  --paper:#F6EDDA;
  --paper-2:#EFE2C6;
  --ink:#241910;
  --ink-soft:#6b5a45;
  --tomato:#C53A22;
  --tomato-dk:#9c2a16;
  --saffron:#E1A23A;
  --olive:#5e6a36;
  --nazar:#1B6CA8;
  --line:rgba(36,25,16,.16);
  font-family:'Hanken Grotesk',system-ui,sans-serif;
  color:var(--ink);
  background:var(--paper);
  background-image:radial-gradient(120% 80% at 80% -10%, #FBF4E3 0%, var(--paper) 45%, var(--paper-2) 120%);
  min-height:100vh;
  line-height:1.55;
  -webkit-font-smoothing:antialiased;
}
.root::before{
  content:"";position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.05;mix-blend-mode:multiply;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.page{position:relative;z-index:1;}

.btn{
  display:inline-flex;align-items:center;gap:.5rem;cursor:pointer;border:none;
  background:var(--tomato);color:#fff;font-family:inherit;font-weight:700;font-size:1rem;
  padding:.85rem 1.4rem;border-radius:999px;text-decoration:none;
  box-shadow:0 8px 22px -10px rgba(156,42,22,.8);transition:transform .18s ease, background .18s ease, box-shadow .18s ease;
}
.btn:hover{background:var(--tomato-dk);transform:translateY(-2px);box-shadow:0 14px 28px -12px rgba(156,42,22,.85);}
.btn-sm{padding:.55rem 1rem;font-size:.9rem;}
.btn-ghost{background:transparent;color:var(--ink);border:1.5px solid var(--ink);box-shadow:none;}
.btn-ghost:hover{background:var(--ink);color:var(--paper);transform:translateY(-2px);}
.btn-light{background:var(--paper);color:var(--tomato-dk);}
.btn-light:hover{background:#fff;}
.full-w{width:100%;justify-content:center;}

/* NAV */
.nav{
  position:sticky;top:0;z-index:50;display:flex;align-items:center;gap:1rem;
  padding:.85rem clamp(1rem,4vw,2.6rem);
  background:rgba(246,237,218,.82);backdrop-filter:blur(12px);
  border-bottom:1px solid var(--line);
}
.brand{display:flex;align-items:center;gap:.6rem;background:none;border:none;cursor:pointer;}
.brand-text{font-family:'Fraunces',serif;font-weight:800;font-size:1.25rem;letter-spacing:-.01em;color:var(--ink);line-height:1;}
.brand-text em{font-style:italic;color:var(--tomato);font-weight:600;display:block;font-size:.78rem;letter-spacing:.16em;text-transform:uppercase;margin-top:2px;}
.nav-links{display:flex;gap:.25rem;margin-left:auto;}
.nav-link{
  background:none;border:none;cursor:pointer;font-family:inherit;font-weight:600;font-size:.98rem;color:var(--ink-soft);
  padding:.45rem .85rem;border-radius:999px;position:relative;transition:color .15s;
}
.nav-link:hover{color:var(--ink);}
.nav-link.is-active{color:var(--tomato);}
.nav-link.is-active::after{content:"";position:absolute;left:.85rem;right:.85rem;bottom:.15rem;height:2px;background:var(--tomato);border-radius:2px;}
.nav .btn{margin-left:.5rem;}
@media(max-width:560px){
  .brand-text{font-size:1.05rem;}
  .nav-link{padding:.4rem .55rem;font-size:.88rem;}
  .nav .btn span,.nav .btn{font-size:.82rem;}
}

/* HERO */
.hero{
  position:relative;display:grid;grid-template-columns:1.25fr .75fr;gap:2rem;align-items:center;
  padding:clamp(2.5rem,6vw,5.5rem) clamp(1.2rem,5vw,4rem) clamp(2rem,4vw,3.5rem);
  max-width:1180px;margin:0 auto;
}
.eyebrow{display:inline-flex;align-items:center;gap:.55rem;font-weight:700;font-size:.82rem;letter-spacing:.14em;text-transform:uppercase;color:var(--olive);}
.eyebrow .dot{width:7px;height:7px;border-radius:50%;background:var(--saffron);box-shadow:0 0 0 4px rgba(225,162,58,.25);}
.display{
  font-family:'Fraunces',serif;font-weight:900;letter-spacing:-.02em;line-height:.98;
  font-size:clamp(2.6rem,6.4vw,5rem);margin:1rem 0 1.1rem;color:var(--ink);
  font-variation-settings:'opsz' 144,'SOFT' 0,'WONK' 1;
}
.display.sm{font-size:clamp(2.4rem,5.5vw,4rem);text-align:center;margin:.6rem 0 .4rem;}
.hl{color:var(--tomato);font-style:italic;}
.hl-blue{color:var(--nazar);font-style:italic;}
.lede{font-size:clamp(1.02rem,1.5vw,1.18rem);color:var(--ink-soft);max-width:36ch;font-weight:500;}
.lede.center{max-width:46ch;margin:.6rem auto 0;text-align:center;}
.hero-cta{display:flex;flex-wrap:wrap;gap:.8rem;margin-top:1.8rem;}
.status-pill{
  display:inline-flex;align-items:center;gap:.5rem;margin-top:1.4rem;
  padding:.5rem .9rem;border-radius:999px;font-weight:600;font-size:.92rem;border:1px solid var(--line);background:rgba(255,255,255,.45);
}
.status-pill.is-open{color:var(--olive);}
.status-pill.is-closed{color:var(--tomato-dk);}
.status-dot{width:9px;height:9px;border-radius:50%;}
.is-open .status-dot{background:#4e8a2a;box-shadow:0 0 0 4px rgba(94,138,42,.22);}
.is-closed .status-dot{background:var(--tomato);box-shadow:0 0 0 4px rgba(197,58,34,.2);}

.hero-plate{position:relative;display:flex;flex-direction:column;align-items:center;justify-self:center;}
.plate{
  position:relative;width:clamp(190px,26vw,300px);aspect-ratio:1;border-radius:50%;
  background:radial-gradient(circle at 38% 32%, #fff 0%, #f3e7cd 55%, #e7d5ac 100%);
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 30px 60px -24px rgba(60,38,18,.5), inset 0 0 0 14px rgba(255,255,255,.6), inset 0 0 0 16px rgba(36,25,16,.06);
  animation:float 6s ease-in-out infinite;
}
.plate-ring{position:absolute;inset:26px;border-radius:50%;border:2px dashed rgba(197,58,34,.35);}
.plate-emoji{font-size:clamp(4rem,9vw,7rem);filter:drop-shadow(0 8px 10px rgba(0,0,0,.18));}
.plate-tag{
  margin-top:-1.1rem;background:var(--ink);color:var(--paper);font-weight:700;font-size:.85rem;
  padding:.5rem 1rem;border-radius:999px;transform:rotate(-3deg);box-shadow:0 10px 20px -10px rgba(0,0,0,.5);
}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
@media(max-width:820px){
  .hero{grid-template-columns:1fr;text-align:center;}
  .lede{margin-inline:auto;}
  .eyebrow{justify-content:center;}
  .hero-cta{justify-content:center;}
  .hero-plate{order:-1;margin-bottom:.5rem;}
}

/* STRIP */
.strip{
  display:flex;flex-wrap:wrap;justify-content:center;gap:.5rem 2.2rem;
  background:var(--ink);color:var(--paper);padding:.9rem 1.5rem;
  font-family:'Fraunces',serif;font-style:italic;font-size:1.02rem;
}
.strip-item{display:inline-flex;align-items:center;}
.strip-item::before{content:"✦";color:var(--saffron);margin-right:.6rem;font-style:normal;}

/* HIGHLIGHTS */
.highlights{max-width:1180px;margin:0 auto;padding:clamp(2.5rem,5vw,4.5rem) clamp(1.2rem,5vw,4rem);}
.sec-head{margin-bottom:2rem;}
.sec-title{font-family:'Fraunces',serif;font-weight:800;font-size:clamp(1.8rem,3.5vw,2.6rem);letter-spacing:-.01em;}
.sec-sub{color:var(--ink-soft);font-weight:500;}
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;}
.card{
  text-align:left;cursor:pointer;border:1px solid var(--line);background:rgba(255,255,255,.4);
  border-radius:20px;padding:1.4rem 1.3rem;transition:transform .2s ease, box-shadow .2s ease, background .2s;
  display:flex;flex-direction:column;gap:.3rem;font-family:inherit;
}
.card:hover{transform:translateY(-5px);background:#fff;box-shadow:0 22px 40px -24px rgba(60,38,18,.45);}
.card-icon{width:44px;height:44px;border-radius:13px;display:grid;place-items:center;background:var(--tomato);color:#fff;margin-bottom:.6rem;}
.card-t{font-family:'Fraunces',serif;font-weight:700;font-size:1.18rem;color:var(--ink);}
.card-s{color:var(--ink-soft);font-size:.92rem;}
.card-p{margin-top:.4rem;font-weight:800;color:var(--tomato);letter-spacing:.01em;}
@media(max-width:880px){.cards{grid-template-columns:repeat(2,1fr);}}
@media(max-width:480px){.cards{grid-template-columns:1fr;}}

/* BAND */
.band{background:linear-gradient(135deg,var(--tomato),var(--tomato-dk));color:#fff;text-align:center;}
.band-inner{max-width:720px;margin:0 auto;padding:clamp(3rem,6vw,5rem) 1.5rem;display:flex;flex-direction:column;align-items:center;gap:.7rem;}
.band-title{font-family:'Fraunces',serif;font-weight:800;font-size:clamp(1.8rem,4vw,2.8rem);line-height:1.05;}
.band-title span{display:block;color:#ffe6b8;font-style:italic;font-weight:600;}
.band-sub{color:rgba(255,255,255,.85);max-width:44ch;}
.band .btn-light{margin-top:1rem;}

/* MENU */
.menu-head,.loc-head{text-align:center;padding:clamp(2.4rem,5vw,3.6rem) 1.5rem 1rem;}
.menu-head .eyebrow,.loc-head .eyebrow{justify-content:center;display:inline-flex;}
.cat-bar{position:sticky;top:62px;z-index:30;background:rgba(246,237,218,.9);backdrop-filter:blur(10px);border-bottom:1px solid var(--line);}
.cat-bar-inner{display:flex;gap:.45rem;overflow-x:auto;padding:.7rem clamp(1rem,4vw,2.6rem);max-width:1180px;margin:0 auto;scrollbar-width:none;}
.cat-bar-inner::-webkit-scrollbar{display:none;}
.chip{
  white-space:nowrap;cursor:pointer;font-family:inherit;font-weight:600;font-size:.92rem;
  border:1px solid var(--line);background:rgba(255,255,255,.5);color:var(--ink-soft);
  padding:.45rem .95rem;border-radius:999px;transition:all .15s;
}
.chip:hover{color:var(--ink);border-color:var(--ink);}
.chip.is-active{background:var(--ink);color:var(--paper);border-color:var(--ink);}
.menu-body{max-width:880px;margin:0 auto;padding:2rem clamp(1.2rem,5vw,2rem) 1rem;}
.cat{margin-bottom:3rem;scroll-margin-top:130px;}
.cat-head{display:flex;align-items:baseline;gap:1rem;margin-bottom:1.3rem;padding-bottom:.7rem;border-bottom:2px solid var(--ink);}
.cat-title{font-family:'Fraunces',serif;font-weight:800;font-size:clamp(1.6rem,3.5vw,2.2rem);letter-spacing:-.01em;}
.cat-note{margin-left:auto;font-size:.85rem;color:var(--ink-soft);font-weight:600;text-align:right;}
.dishes{list-style:none;display:flex;flex-direction:column;gap:1.05rem;}
.dish-main{display:flex;align-items:baseline;gap:.5rem;}
.dish-name{font-family:'Fraunces',serif;font-weight:600;font-size:1.12rem;color:var(--ink);}
.leader{flex:1;border-bottom:2px dotted var(--line);transform:translateY(-3px);min-width:1.5rem;}
.dish-price{font-weight:800;color:var(--tomato);font-size:1.05rem;white-space:nowrap;}
.dish-price.dual{display:inline-flex;gap:.35rem;align-items:baseline;}
.dish-price .slash{color:var(--line);font-weight:600;}
.dish-desc{color:var(--ink-soft);font-size:.92rem;margin-top:.15rem;max-width:52ch;}

.drinks-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:.7rem 2rem;}
.drink{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;padding-bottom:.55rem;border-bottom:1px dotted var(--line);}
.drink-name{font-weight:600;font-family:'Fraunces',serif;font-size:1.02rem;}
.drink-prices{display:flex;gap:.7rem;flex-shrink:0;}
.drink-price{font-weight:700;color:var(--tomato);font-size:.95rem;white-space:nowrap;}
.drink-price em{color:var(--ink-soft);font-style:normal;font-weight:600;font-size:.78rem;margin-right:.15rem;}
@media(max-width:620px){.drinks-grid{grid-template-columns:1fr;}}

.order-cta{text-align:center;padding:2.5rem 1rem 1rem;display:flex;flex-direction:column;align-items:center;gap:.9rem;}
.order-cta p{font-family:'Fraunces',serif;font-style:italic;font-size:1.4rem;}

/* LOCATION */
.loc-grid{max-width:1100px;margin:0 auto;padding:1rem clamp(1.2rem,5vw,2rem) 1rem;display:grid;grid-template-columns:1.15fr .85fr;gap:1.6rem;align-items:start;}
.map-wrap{border-radius:22px;overflow:hidden;border:1px solid var(--line);box-shadow:0 24px 50px -28px rgba(60,38,18,.5);height:460px;background:#ddd;}
.map-wrap iframe{width:100%;height:100%;border:0;display:block;}
.loc-info{display:flex;flex-direction:column;gap:1.1rem;}
.info-block{display:flex;gap:.9rem;background:rgba(255,255,255,.45);border:1px solid var(--line);border-radius:18px;padding:1.2rem;}
.info-ico{flex-shrink:0;width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:var(--ink);color:var(--paper);}
.info-block h3{font-family:'Fraunces',serif;font-size:1.15rem;margin-bottom:.3rem;display:flex;align-items:center;gap:.6rem;}
.info-block p{color:var(--ink-soft);font-weight:500;}
.info-block .full{flex:1;}
.link{display:inline-flex;align-items:center;gap:.35rem;margin-top:.6rem;color:var(--tomato);font-weight:700;text-decoration:none;font-size:.95rem;}
.link:hover{text-decoration:underline;}
.mini-pill{font-family:'Hanken Grotesk';font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;padding:.15rem .5rem;border-radius:999px;}
.mini-pill.is-open{background:rgba(94,138,42,.18);color:var(--olive);}
.mini-pill.is-closed{background:rgba(197,58,34,.15);color:var(--tomato-dk);}
.hours{width:100%;border-collapse:collapse;margin-top:.5rem;}
.hours td{padding:.45rem 0;border-bottom:1px dotted var(--line);font-weight:600;}
.hours .hd{color:var(--ink);width:32%;}
.hours .ht{color:var(--ink-soft);text-align:right;}
.hours tr.is-today .hd,.hours tr.is-today .ht{color:var(--tomato);}
.hours-note{margin-top:.7rem;font-weight:700;font-size:.92rem;color:var(--ink);}
@media(max-width:820px){.loc-grid{grid-template-columns:1fr;}.map-wrap{height:340px;}}

/* FOOTER */
.footer{position:relative;z-index:1;background:var(--ink);color:var(--paper);margin-top:2rem;}
.foot-grid{max-width:1100px;margin:0 auto;padding:2.6rem clamp(1.2rem,5vw,2rem) 1.5rem;display:flex;justify-content:space-between;gap:1.5rem;flex-wrap:wrap;}
.foot-brand{display:flex;align-items:center;gap:.6rem;font-family:'Fraunces',serif;font-weight:800;font-size:1.3rem;}
.foot-p{color:rgba(246,237,218,.6);margin-top:.5rem;font-weight:500;}
.foot-nav{display:flex;flex-wrap:wrap;gap:1.2rem;align-items:center;}
.foot-nav button,.foot-nav a{background:none;border:none;cursor:pointer;color:var(--paper);font-family:inherit;font-weight:600;font-size:1rem;text-decoration:none;opacity:.8;transition:opacity .15s,color .15s;}
.foot-nav button:hover,.foot-nav a:hover{opacity:1;color:var(--saffron);}
.foot-bar{border-top:1px solid rgba(246,237,218,.15);padding:1rem clamp(1.2rem,5vw,2rem);display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;font-size:.85rem;color:rgba(246,237,218,.55);max-width:1100px;margin:0 auto;}
.foot-bar span:last-child{font-family:'Fraunces',serif;font-style:italic;color:var(--saffron);}

/* REVEAL ANIM */
.reveal{opacity:0;transform:translateY(18px);animation:rise .7s cubic-bezier(.2,.7,.2,1) forwards;}
.reveal-scale{opacity:0;transform:scale(.92);animation:pop .8s cubic-bezier(.2,.7,.2,1) forwards;}
@keyframes rise{to{opacity:1;transform:translateY(0);}}
@keyframes pop{to{opacity:1;transform:scale(1);}}
@media(prefers-reduced-motion:reduce){.reveal,.reveal-scale,.plate{animation:none;opacity:1;transform:none;}}
`;
