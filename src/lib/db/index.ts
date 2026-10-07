import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";
import { EventItem, BlogPost, CourseSession, AdminUser, ProjectItem } from "./types";
import { hashPassword } from "../auth";

const DB_URL = process.env.POSTGRES_URL || process.env.DATABASE_URL;

// Cartella fallback locale quando Postgres non è ancora configurato
const LOCAL_DATA_DIR = path.join(process.cwd(), "data", "content");

function ensureLocalDir() {
  if (!fs.existsSync(LOCAL_DATA_DIR)) {
    fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
  }
}

function readLocalJson<T>(filename: string, defaultValue: T): T {
  ensureLocalDir();
  const filePath = path.join(LOCAL_DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), "utf-8");
    return defaultValue;
  }
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

function writeLocalJson<T>(filename: string, data: T): void {
  ensureLocalDir();
  const filePath = path.join(LOCAL_DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

/* ==============================================================
   DATI INIZIALI PRECARICATI (SEED)
============================================================== */

const DEFAULT_EVENTS: EventItem[] = [
  {
    id: "evt-st-tropez-2024",
    title: "Les Voiles Latines de Saint-Tropez 2024",
    date: "Maggio 2024",
    location: "Saint-Tropez, Costa Azzurra (Francia)",
    category: "regata",
    badge: "1° Posto Assoluto",
    description:
      "Vittoria storica di Janara tra oltre 60 scafi tradizionali provenienti da tutto il Mediterraneo. La marineria montese sul gradino più alto del podio.",
    imageUrl: "/images/hero-sailing.webp",
    result: "1° Classificato Assoluto",
    articleSlug: "anima-di-legno-il-segreto-del-gozzo-flegreo",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "evt-procida-cup-2025",
    title: "Procida Cup 2025",
    date: "Giugno 2025",
    location: "Canale di Procida, Campi Flegrei",
    category: "regata",
    badge: "1° Posto Janara",
    description:
      "Trionfo di Janara nelle acque di casa: perfetta conduzione tattica nelle correnti e nei salti di brezza tra Monte di Procida e Vivara.",
    imageUrl: "/images/janara-regatta.jpeg",
    result: "1° Posto",
    articleSlug: "leggere-il-vento-di-maestro-nel-canale-di-procida",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "evt-barcolana-2026",
    title: "Barcolana 58 · Quandel sulla Linea di Partenza",
    date: "Ottobre 2026",
    location: "Golfo di Trieste",
    category: "manifestazione",
    badge: "Roadmap 2026",
    description:
      "La maestosa lancia in legno Quandel del 1968, ex Amerigo Vespucci, rappresenterà la vela tradizionale campana alla regata più affollata al mondo.",
    imageUrl: "/images/fleet-sailing.webp",
    result: "Iscrizione Ufficiale",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "evt-americas-cup-2027",
    title: "Cerimonia America's Cup Napoli 2027",
    date: "Primavera 2027",
    location: "Golfo di Napoli · Lungomare Caracciolo",
    category: "cultura",
    badge: "Orizzonti 2027",
    description:
      "Janara e la flotta storica montese sfileranno accanto ai foil moderni dell'America's Cup, celebrando la continuità tra la maestria d'ascia millenaria e la tecnologia d'avanguardia.",
    imageUrl: "/images/janara-crew.jpeg",
    result: "Presenza Ufficiale",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_BLOG_POSTS: BlogPost[] = [
  {
    id: "post-anima-legno",
    slug: "anima-di-legno-il-segreto-del-gozzo-flegreo",
    title: "L'anima di legno: i segreti costruttivi del gozzo flegreo",
    excerpt:
      "Come i maestri d'ascia montesi intagliavano le ordinate nel rovere e il fasciame nel pino, creando scafi capaci di domare il mare aperto.",
    content: `Nel porticciolo di Acquamorta, il profumo di resina e stoppa di canapa impregnata di pece calda è il profumo della nostra identità.

Il gozzo napoletano-flegreo non nasceva da un disegno al computer, ma dal "garbo", la dima curva in legno che il maestro d'ascia custodiva gelosamente e trasmetteva di padre in figlio. Ogni ordinata di rovere veniva scelta nel bosco seguendo la naturale curvatura del ramo, per garantire una fibra ininterrotta e una robustezza indistruttibile.

Oggi, l'Associazione Vela Latina Monte di Procida custodisce questi saperi orali e li tramanda quotidianamente: ogni restauro a bordo di Janara, San Michele Arcangelo o Quandel è una lezione viva di calafateria e carpenteria navale.`,
    coverImage: "/images/janara-crew.jpeg",
    author: "Antonio Pugliese",
    category: "Cultura & Maestranze",
    published: true,
    publishedAt: "2026-03-15T10:00:00Z",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "post-vento-di-maestro",
    slug: "leggere-il-vento-di-maestro-nel-canale-di-procida",
    title: "Leggere il vento di Maestro nel canale di Procida",
    excerpt:
      "Tra la scogliera di Monte di Procida e la punta di Vivara si genera un corridoio di brezze unico nel Mediterraneo. Ecco come governarlo all'antenna.",
    content: `La vela latina triangolare ha una particolarità unica: non ha boma inferiore orizzontale, ma un'antenna inclinata issata a mezza altezza sull'albero a calcese.

Questo armo arcaico, perfezionato nei secoli dai pescatori e dai mercanti del Mediterraneo, consente di stringere il vento in modo sorprendente se si sa interpretare il gradiente termico tra il canale e la terraferma.

Nel canale di Procida, il vento termico pomeridiano da Maestro si incanala tra le falesie vulcaniche: chi impara a virare coordinando carnao, osti e scotta a Monte di Procida, può governare qualsiasi mare del mondo.`,
    coverImage: "/images/janara-regatta.jpeg",
    author: "Direzione Tecnica Vela Latina",
    category: "Navigazione Tradizionale",
    published: true,
    publishedAt: "2026-04-02T09:30:00Z",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_COURSES: CourseSession[] = [
  {
    id: "course-voga-primavera-2026",
    courseKey: "voga",
    courseTitle: "Scuola di Voga Tradizionale Flegrea (In Piedi)",
    startDate: "2026-05-02",
    endDate: "2026-05-30",
    schedule: "Ogni Sabato mattina ore 09:30 – 12:30",
    totalSeats: 12,
    availableSeats: 4,
    status: "in-esaurimento",
    instructor: "Maestri Vogatori Montesi",
    notes: "Uscite a bordo di San Michele Arcangelo e Quandel al porticciolo di Acquamorta.",
    price: "Incluso con tesseramento socio",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "course-vela-estate-2026",
    courseKey: "vela",
    courseTitle: "Corso di Conduzione & Manovre a Vela Latina",
    startDate: "2026-06-06",
    endDate: "2026-06-27",
    schedule: "Sabato e Domenica ore 15:00 – 19:00",
    totalSeats: 10,
    availableSeats: 7,
    status: "aperte",
    instructor: "Equipaggio Janara",
    notes: "Teoria armo antenna, bordeggio nel canale di Procida e ormeggio tradizionale.",
    price: "Contributo formativo soci",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "course-rosa-2027",
    courseKey: "rosa",
    courseTitle: "Progetto ROSA · Selezioni Equipaggio Femminile 2027",
    startDate: "2026-05-16",
    schedule: "Weekend quindicinali",
    totalSeats: 16,
    availableSeats: 5,
    status: "aperte",
    instructor: "Staff Tecnico Nazionale",
    notes: "Preparazione atletica e manovre per Les Voiles Latines di Saint-Tropez 2027.",
    price: "Accesso con candidatura",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "course-inclusione-continuo",
    courseKey: "inclusione",
    courseTitle: "Inclusione Mare · Laboratorio Voga e Sensi (Centro Serapide)",
    startDate: "2026-05-10",
    schedule: "Giovedì e Sabato mattina su prenotazione",
    totalSeats: 20,
    availableSeats: 12,
    status: "aperte",
    instructor: "Educatori Specializzati & Timonieri",
    notes: "Attività gratuita e solidale per ragazzi con bisogni speciali.",
    price: "Gratuito (Progetto Sociale)",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: "proj-01-rosa",
    number: "01",
    title: "Progetto ROSA",
    highlight: "Saint-Tropez 2027",
    category: "Regata Internazionale",
    badge: "Equipaggio Femminile",
    partner: "Campi Flegrei · Rete Partner",
    status: "In Corso",
    description:
      "Formazione del primo equipaggio stabile interamente femminile dell'Associazione. Un percorso intensivo di voga, conduzione di vela latina, manovre d'altura e sicurezza marittima con traguardo fissato a Les Voiles Latines di Saint-Tropez 2027.",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj-02-americas-cup",
    number: "02",
    title: "America's Cup Napoli",
    highlight: "Cerimonia d'Apertura",
    category: "Regata Internazionale",
    badge: "Evento Mondiale",
    partner: "Golfo di Napoli",
    status: "In Programmazione",
    description:
      "Partecipazione ufficiale programmata con l'ammiraglia Janara alla cerimonia inaugurale dell'America's Cup nel Golfo di Napoli, portando le radici della vela tradizionale tra i colossi della vela moderna.",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj-03-barcolana",
    number: "03",
    title: "Barcolana di Trieste",
    highlight: "La Lancia Quandel al via",
    category: "Regata Internazionale",
    badge: "Golfo di Trieste",
    partner: "Società Velica di Barcola e Grignano",
    status: "In Programmazione",
    description:
      "La grande lancia Ludovico Quandel, ex Amerigo Vespucci, sarà schierata sulla linea di partenza del Golfo di Trieste per testimoniare la potenza dell'armo a filucone e della marineria flegrea.",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj-04-quandel-gaeta",
    number: "04",
    title: "Operazione Quandel",
    highlight: "Monte di Procida ↔ Gaeta",
    category: "Rotte Storiche",
    badge: "8ª Edizione",
    partner: "Marinerie Flegree & Pontine",
    status: "In Corso",
    description:
      "Traversata a vela latina in mare aperto che unisce Monte di Procida e Gaeta. Giunta all'8ª edizione, rinnova i secolari scambi commerciali, culturali e nautici tra le due storiche marinerie tirreniche.",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj-05-breccia-museo",
    number: "05",
    title: "Breccia Museo",
    highlight: "Itinerario dal Mare",
    category: "Cultura & Scienza",
    badge: "Vulcanologia & Mare",
    partner: "Campi Flegrei · Rete Culturale",
    status: "In Corso",
    description:
      "Percorso turistico e scientifico fruibile via mare lungo la costa di Monte di Procida, dedicato alla formazione vulcanica della Breccia Museo e alla geologia millenaria dei Campi Flegrei.",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj-06-quandel-lab",
    number: "06",
    title: "Quandel Lab & Ricerca",
    highlight: "Federico II & Suor Orsola",
    category: "Cultura & Scienza",
    badge: "Ricerca Scientifica",
    partner: "Università Federico II & Suor Orsola",
    status: "In Corso",
    description:
      "Sperimentazioni idrodinamiche, archeologia navale e rilievi costieri in collaborazione con l'Università degli Studi di Napoli Federico II, l'Università Suor Orsola Benincasa e il Museo Nazionale di Haifa.",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj-07-inclusione",
    number: "07",
    title: "Inclusione Mare",
    highlight: "Centro Serapide",
    category: "Inclusione",
    badge: "Impatto Sociale",
    partner: "Centro Serapide & Terzo Settore",
    status: "In Corso",
    description:
      "Il mare come spazio educativo e terapeutico per bambini e ragazzi con disabilità o bisogni speciali. Attraverso la voga assistita a bordo del San Michele Arcangelo, promuoviamo l'accessibilità reale e il benessere.",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj-08-stintino",
    number: "08",
    title: "Raduno Nazionale Stintino",
    highlight: "Meeting Vela Latina",
    category: "Regata Internazionale",
    badge: "Sardegna & Cilento",
    partner: "Comitato Vela Latina Stintino",
    status: "Completato",
    description:
      "Partecipazione ai raduni della vela latina a Stintino e al Trofeo Tre Torri di Marina di Pisciotta (dove l'equipaggio ha conquistato il prestigioso Trofeo Fair Play e podio di classe).",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/* ==============================================================
   INIZIALIZZAZIONE SCHEMA TABELLE POSTGRESQL (NEON / VERCEL)
============================================================== */

let dbInitPromise: Promise<void> | null = null;

export async function initDb(): Promise<void> {
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = (async () => {
    if (!DB_URL) {
      // Inizializza file locali di default
      readLocalJson<EventItem[]>("eventi.json", DEFAULT_EVENTS);
      readLocalJson<BlogPost[]>("blog.json", DEFAULT_BLOG_POSTS);
      readLocalJson<CourseSession[]>("corsi.json", DEFAULT_COURSES);
      readLocalJson<ProjectItem[]>("progetti.json", DEFAULT_PROJECTS);
      const users = readLocalJson<AdminUser[]>("users.json", []);
      if (users.length === 0) {
        const defaultAdmin: AdminUser = {
          id: "admin-root",
          email: "admin@velalatinamontediprocida.it",
          passwordHash: hashPassword(process.env.ADMIN_INIT_PASSWORD || "velalatina2026!"),
          name: "Amministratore Vela Latina",
          role: "superadmin",
          createdAt: new Date().toISOString(),
        };
        writeLocalJson<AdminUser[]>("users.json", [defaultAdmin]);
      }
      return;
    }

    try {
      const sql = neon(DB_URL);

      // Tabella Utenti Admin
      await sql`
        CREATE TABLE IF NOT EXISTS admin_users (
          id VARCHAR(64) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(32) NOT NULL DEFAULT 'admin',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      // Tabella Eventi & Palmarès
      await sql`
        CREATE TABLE IF NOT EXISTS eventi (
          id VARCHAR(64) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          date VARCHAR(100) NOT NULL,
          location VARCHAR(255) NOT NULL,
          category VARCHAR(64) NOT NULL DEFAULT 'regata',
          badge VARCHAR(100),
          description TEXT NOT NULL,
          image_url TEXT,
          result VARCHAR(100),
          article_slug VARCHAR(255),
          published BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      // Retrocompatibilità colonna article_slug su tabelle già esistenti
      try {
        await sql`ALTER TABLE eventi ADD COLUMN IF NOT EXISTS article_slug VARCHAR(255);`;
      } catch {
        // Ignora se la colonna esiste già
      }

      // Tabella Articoli Blog / News
      await sql`
        CREATE TABLE IF NOT EXISTS blog_posts (
          id VARCHAR(64) PRIMARY KEY,
          slug VARCHAR(255) UNIQUE NOT NULL,
          title VARCHAR(255) NOT NULL,
          excerpt TEXT NOT NULL,
          content TEXT NOT NULL,
          cover_image TEXT,
          author VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL DEFAULT 'Cultura & Mare',
          published BOOLEAN NOT NULL DEFAULT true,
          published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      // Tabella Calendario Corsi
      await sql`
        CREATE TABLE IF NOT EXISTS corsi_calendar (
          id VARCHAR(64) PRIMARY KEY,
          course_key VARCHAR(64) NOT NULL,
          course_title VARCHAR(255) NOT NULL,
          start_date VARCHAR(64) NOT NULL,
          end_date VARCHAR(64),
          schedule VARCHAR(255) NOT NULL,
          total_seats INT NOT NULL DEFAULT 10,
          available_seats INT NOT NULL DEFAULT 10,
          status VARCHAR(64) NOT NULL DEFAULT 'aperte',
          instructor VARCHAR(255) NOT NULL,
          notes TEXT,
          price VARCHAR(100),
          published BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      // Tabella Progetti Strategici & Cantieri
      await sql`
        CREATE TABLE IF NOT EXISTS progetti (
          id VARCHAR(64) PRIMARY KEY,
          number VARCHAR(32) NOT NULL,
          title VARCHAR(255) NOT NULL,
          highlight VARCHAR(255) NOT NULL,
          category VARCHAR(64) NOT NULL DEFAULT 'Regata Internazionale',
          badge VARCHAR(100),
          partner VARCHAR(255) DEFAULT 'Campi Flegrei · Rete Partner',
          status VARCHAR(64) NOT NULL DEFAULT 'In Corso',
          description TEXT NOT NULL,
          published BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      // Controlla se esiste admin iniziale
      const existingUsers = await sql`SELECT count(*) FROM admin_users;`;
      if (parseInt(existingUsers[0].count) === 0) {
        const adminId = "admin-root";
        const email = "admin@velalatinamontediprocida.it";
        const pwdHash = hashPassword(process.env.ADMIN_INIT_PASSWORD || "velalatina2026!");
        await sql`
          INSERT INTO admin_users (id, email, password_hash, name, role)
          VALUES (${adminId}, ${email}, ${pwdHash}, 'Amministratore Vela Latina', 'superadmin');
        `;
      }

      // Seed Eventi se vuota
      const existingEvents = await sql`SELECT count(*) FROM eventi;`;
      if (parseInt(existingEvents[0].count) === 0) {
        for (const evt of DEFAULT_EVENTS) {
          await sql`
            INSERT INTO eventi (id, title, date, location, category, badge, description, image_url, result, published)
            VALUES (${evt.id}, ${evt.title}, ${evt.date}, ${evt.location}, ${evt.category}, ${evt.badge || null}, ${evt.description}, ${evt.imageUrl || null}, ${evt.result || null}, ${evt.published});
          `;
        }
      }

      // Seed Blog se vuota
      const existingPosts = await sql`SELECT count(*) FROM blog_posts;`;
      if (parseInt(existingPosts[0].count) === 0) {
        for (const p of DEFAULT_BLOG_POSTS) {
          await sql`
            INSERT INTO blog_posts (id, slug, title, excerpt, content, cover_image, author, category, published, published_at)
            VALUES (${p.id}, ${p.slug}, ${p.title}, ${p.excerpt}, ${p.content}, ${p.coverImage || null}, ${p.author}, ${p.category}, ${p.published}, ${p.publishedAt});
          `;
        }
      }

      // Seed Corsi se vuota
      const existingCourses = await sql`SELECT count(*) FROM corsi_calendar;`;
      if (parseInt(existingCourses[0].count) === 0) {
        for (const c of DEFAULT_COURSES) {
          await sql`
            INSERT INTO corsi_calendar (id, course_key, course_title, start_date, end_date, schedule, total_seats, available_seats, status, instructor, notes, price, published)
            VALUES (${c.id}, ${c.courseKey}, ${c.courseTitle}, ${c.startDate}, ${c.endDate || null}, ${c.schedule}, ${c.totalSeats}, ${c.availableSeats}, ${c.status}, ${c.instructor}, ${c.notes || null}, ${c.price || null}, ${c.published});
          `;
        }
      }

      // Seed Progetti se vuota
      const existingProjects = await sql`SELECT count(*) FROM progetti;`;
      if (parseInt(existingProjects[0].count) === 0) {
        for (const pr of DEFAULT_PROJECTS) {
          await sql`
            INSERT INTO progetti (id, number, title, highlight, category, badge, partner, status, description, published)
            VALUES (${pr.id}, ${pr.number}, ${pr.title}, ${pr.highlight}, ${pr.category}, ${pr.badge || null}, ${pr.partner || null}, ${pr.status}, ${pr.description}, ${pr.published});
          `;
        }
      }
    } catch (err) {
      console.error("[initDb] Avviso: connessione database durante build/avvio:", err);
    }
  })();

  return dbInitPromise;
}

/* ==============================================================
   REPOSITORIES (EVENTI, BLOG, CORSI, AUTH)
============================================================== */

// --- EVENTI ---
export const EventsRepo = {
  async getAll(publishedOnly = false): Promise<EventItem[]> {
    if (!DB_URL) {
      const items = readLocalJson<EventItem[]>("eventi.json", DEFAULT_EVENTS);
      return publishedOnly ? items.filter((i) => i.published) : items;
    }
    try {
      const sql = neon(DB_URL);
      const rows = publishedOnly
        ? await sql`SELECT * FROM eventi WHERE published = true ORDER BY created_at DESC;`
        : await sql`SELECT * FROM eventi ORDER BY created_at DESC;`;

      return rows.map((r) => ({
        id: r.id,
        title: r.title,
        date: r.date,
        location: r.location,
        category: r.category,
        badge: r.badge || undefined,
        description: r.description,
        imageUrl: r.image_url || undefined,
        result: r.result || undefined,
        articleSlug: r.article_slug || undefined,
        published: Boolean(r.published),
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    } catch (err) {
      console.error("[EventsRepo.getAll] Errore DB Neon, uso fallback statico:", err);
      const items = DEFAULT_EVENTS;
      return publishedOnly ? items.filter((i) => i.published) : items;
    }
  },

  async getById(id: string): Promise<EventItem | null> {
    if (!DB_URL) {
      const items = readLocalJson<EventItem[]>("eventi.json", DEFAULT_EVENTS);
      return items.find((i) => i.id === id) || null;
    }
    const sql = neon(DB_URL);
    const rows = await sql`SELECT * FROM eventi WHERE id = ${id} LIMIT 1;`;
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      title: r.title,
      date: r.date,
      location: r.location,
      category: r.category,
      badge: r.badge || undefined,
      description: r.description,
      imageUrl: r.image_url || undefined,
      result: r.result || undefined,
      articleSlug: r.article_slug || undefined,
      published: Boolean(r.published),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  },

  async save(event: Omit<EventItem, "createdAt" | "updatedAt">): Promise<EventItem> {
    const now = new Date().toISOString();
    if (!DB_URL) {
      const items = readLocalJson<EventItem[]>("eventi.json", DEFAULT_EVENTS);
      const existingIdx = items.findIndex((i) => i.id === event.id);
      let saved: EventItem;
      if (existingIdx >= 0) {
        saved = { ...items[existingIdx], ...event, updatedAt: now };
        items[existingIdx] = saved;
      } else {
        saved = { ...event, createdAt: now, updatedAt: now };
        items.unshift(saved);
      }
      writeLocalJson<EventItem[]>("eventi.json", items);
      return saved;
    }
    const sql = neon(DB_URL);
    await sql`
      INSERT INTO eventi (id, title, date, location, category, badge, description, image_url, result, article_slug, published, updated_at)
      VALUES (${event.id}, ${event.title}, ${event.date}, ${event.location}, ${event.category}, ${event.badge || null}, ${event.description}, ${event.imageUrl || null}, ${event.result || null}, ${event.articleSlug || null}, ${event.published}, ${now})
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        date = EXCLUDED.date,
        location = EXCLUDED.location,
        category = EXCLUDED.category,
        badge = EXCLUDED.badge,
        description = EXCLUDED.description,
        image_url = EXCLUDED.image_url,
        result = EXCLUDED.result,
        article_slug = EXCLUDED.article_slug,
        published = EXCLUDED.published,
        updated_at = EXCLUDED.updated_at;
    `;
    return (await this.getById(event.id))!;
  },

  async delete(id: string): Promise<boolean> {
    if (!DB_URL) {
      const items = readLocalJson<EventItem[]>("eventi.json", DEFAULT_EVENTS);
      const filtered = items.filter((i) => i.id !== id);
      writeLocalJson<EventItem[]>("eventi.json", filtered);
      return true;
    }
    const sql = neon(DB_URL);
    await sql`DELETE FROM eventi WHERE id = ${id};`;
    return true;
  },
};

// --- BLOG ---
export const BlogRepo = {
  async getAll(publishedOnly = false): Promise<BlogPost[]> {
    if (!DB_URL) {
      const items = readLocalJson<BlogPost[]>("blog.json", DEFAULT_BLOG_POSTS);
      return publishedOnly ? items.filter((i) => i.published) : items;
    }
    try {
      const sql = neon(DB_URL);
      const rows = publishedOnly
        ? await sql`SELECT * FROM blog_posts WHERE published = true ORDER BY published_at DESC;`
        : await sql`SELECT * FROM blog_posts ORDER BY created_at DESC;`;

      return rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        excerpt: r.excerpt,
        content: r.content,
        coverImage: r.cover_image || undefined,
        author: r.author,
        category: r.category,
        published: Boolean(r.published),
        publishedAt: r.published_at,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    } catch (err) {
      console.error("[BlogRepo.getAll] Errore DB Neon, uso fallback statico:", err);
      const items = DEFAULT_BLOG_POSTS;
      return publishedOnly ? items.filter((i) => i.published) : items;
    }
  },

  async getBySlug(slug: string): Promise<BlogPost | null> {
    if (!DB_URL) {
      const items = readLocalJson<BlogPost[]>("blog.json", DEFAULT_BLOG_POSTS);
      return items.find((i) => i.slug === slug) || null;
    }
    const sql = neon(DB_URL);
    const rows = await sql`SELECT * FROM blog_posts WHERE slug = ${slug} LIMIT 1;`;
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      content: r.content,
      coverImage: r.cover_image || undefined,
      author: r.author,
      category: r.category,
      published: Boolean(r.published),
      publishedAt: r.published_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  },

  async save(post: Omit<BlogPost, "createdAt" | "updatedAt">): Promise<BlogPost> {
    const now = new Date().toISOString();
    if (!DB_URL) {
      const items = readLocalJson<BlogPost[]>("blog.json", DEFAULT_BLOG_POSTS);
      const existingIdx = items.findIndex((i) => i.id === post.id);
      let saved: BlogPost;
      if (existingIdx >= 0) {
        saved = { ...items[existingIdx], ...post, updatedAt: now };
        items[existingIdx] = saved;
      } else {
        saved = { ...post, createdAt: now, updatedAt: now };
        items.unshift(saved);
      }
      writeLocalJson<BlogPost[]>("blog.json", items);
      return saved;
    }
    const sql = neon(DB_URL);
    await sql`
      INSERT INTO blog_posts (id, slug, title, excerpt, content, cover_image, author, category, published, published_at, updated_at)
      VALUES (${post.id}, ${post.slug}, ${post.title}, ${post.excerpt}, ${post.content}, ${post.coverImage || null}, ${post.author}, ${post.category}, ${post.published}, ${post.publishedAt || now}, ${now})
      ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        title = EXCLUDED.title,
        excerpt = EXCLUDED.excerpt,
        content = EXCLUDED.content,
        cover_image = EXCLUDED.cover_image,
        author = EXCLUDED.author,
        category = EXCLUDED.category,
        published = EXCLUDED.published,
        published_at = EXCLUDED.published_at,
        updated_at = EXCLUDED.updated_at;
    `;
    return (await this.getBySlug(post.slug))!;
  },

  async delete(id: string): Promise<boolean> {
    if (!DB_URL) {
      const items = readLocalJson<BlogPost[]>("blog.json", DEFAULT_BLOG_POSTS);
      writeLocalJson<BlogPost[]>("blog.json", items.filter((i) => i.id !== id));
      return true;
    }
    const sql = neon(DB_URL);
    await sql`DELETE FROM blog_posts WHERE id = ${id};`;
    return true;
  },
};

// --- CORSI CALENDAR ---
export const CoursesRepo = {
  async getAll(publishedOnly = false): Promise<CourseSession[]> {
    if (!DB_URL) {
      const items = readLocalJson<CourseSession[]>("corsi.json", DEFAULT_COURSES);
      return publishedOnly ? items.filter((i) => i.published) : items;
    }
    try {
      const sql = neon(DB_URL);
      const rows = publishedOnly
        ? await sql`SELECT * FROM corsi_calendar WHERE published = true ORDER BY start_date ASC;`
        : await sql`SELECT * FROM corsi_calendar ORDER BY start_date ASC;`;

      return rows.map((r) => ({
        id: r.id,
        courseKey: r.course_key,
        courseTitle: r.course_title,
        startDate: r.start_date,
        endDate: r.end_date || undefined,
        schedule: r.schedule,
        totalSeats: r.total_seats,
        availableSeats: r.available_seats,
        status: r.status,
        instructor: r.instructor,
        notes: r.notes || undefined,
        price: r.price || undefined,
        published: Boolean(r.published),
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    } catch (err) {
      console.error("[CoursesRepo.getAll] Errore DB Neon, uso fallback statico:", err);
      const items = DEFAULT_COURSES;
      return publishedOnly ? items.filter((i) => i.published) : items;
    }
  },

  async save(session: Omit<CourseSession, "createdAt" | "updatedAt">): Promise<CourseSession> {
    const now = new Date().toISOString();
    if (!DB_URL) {
      const items = readLocalJson<CourseSession[]>("corsi.json", DEFAULT_COURSES);
      const existingIdx = items.findIndex((i) => i.id === session.id);
      let saved: CourseSession;
      if (existingIdx >= 0) {
        saved = { ...items[existingIdx], ...session, updatedAt: now };
        items[existingIdx] = saved;
      } else {
        saved = { ...session, createdAt: now, updatedAt: now };
        items.push(saved);
      }
      writeLocalJson<CourseSession[]>("corsi.json", items);
      return saved;
    }
    const sql = neon(DB_URL);
    await sql`
      INSERT INTO corsi_calendar (id, course_key, course_title, start_date, end_date, schedule, total_seats, available_seats, status, instructor, notes, price, published, updated_at)
      VALUES (${session.id}, ${session.courseKey}, ${session.courseTitle}, ${session.startDate}, ${session.endDate || null}, ${session.schedule}, ${session.totalSeats}, ${session.availableSeats}, ${session.status}, ${session.instructor}, ${session.notes || null}, ${session.price || null}, ${session.published}, ${now})
      ON CONFLICT (id) DO UPDATE SET
        course_key = EXCLUDED.course_key,
        course_title = EXCLUDED.course_title,
        start_date = EXCLUDED.start_date,
        end_date = EXCLUDED.end_date,
        schedule = EXCLUDED.schedule,
        total_seats = EXCLUDED.total_seats,
        available_seats = EXCLUDED.available_seats,
        status = EXCLUDED.status,
        instructor = EXCLUDED.instructor,
        notes = EXCLUDED.notes,
        price = EXCLUDED.price,
        published = EXCLUDED.published,
        updated_at = EXCLUDED.updated_at;
    `;
    const all = await this.getAll();
    return all.find((c) => c.id === session.id)!;
  },

  async delete(id: string): Promise<boolean> {
    if (!DB_URL) {
      const items = readLocalJson<CourseSession[]>("corsi.json", DEFAULT_COURSES);
      writeLocalJson<CourseSession[]>("corsi.json", items.filter((i) => i.id !== id));
      return true;
    }
    const sql = neon(DB_URL);
    await sql`DELETE FROM corsi_calendar WHERE id = ${id};`;
    return true;
  },
};

// --- AUTH / UTENTI ---
export const UsersRepo = {
  async findByEmail(email: string): Promise<AdminUser | null> {
    if (!DB_URL) {
      const users = readLocalJson<AdminUser[]>("users.json", []);
      return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
    }
    const sql = neon(DB_URL);
    const rows = await sql`SELECT * FROM admin_users WHERE LOWER(email) = LOWER(${email}) LIMIT 1;`;
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      email: r.email,
      passwordHash: r.password_hash,
      name: r.name,
      role: r.role,
      createdAt: r.created_at,
    };
  },

  async updatePassword(email: string, newHash: string): Promise<boolean> {
    if (!DB_URL) {
      const users = readLocalJson<AdminUser[]>("users.json", []);
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) return false;
      user.passwordHash = newHash;
      writeLocalJson<AdminUser[]>("users.json", users);
      return true;
    }
    const sql = neon(DB_URL);
    await sql`UPDATE admin_users SET password_hash = ${newHash} WHERE LOWER(email) = LOWER(${email});`;
    return true;
  },
};

// --- PROGETTI STRATEGICI ---
export const ProjectsRepo = {
  async getAll(publishedOnly = false): Promise<ProjectItem[]> {
    if (!DB_URL) {
      const items = readLocalJson<ProjectItem[]>("progetti.json", DEFAULT_PROJECTS);
      const filtered = publishedOnly ? items.filter((i) => i.published) : items;
      return filtered.sort((a, b) => a.number.localeCompare(b.number));
    }
    try {
      const sql = neon(DB_URL);
      const rows = publishedOnly
        ? await sql`SELECT * FROM progetti WHERE published = true ORDER BY number ASC;`
        : await sql`SELECT * FROM progetti ORDER BY number ASC;`;

      return rows.map((r) => ({
        id: r.id,
        number: r.number,
        title: r.title,
        highlight: r.highlight,
        category: r.category as ProjectItem["category"],
        badge: r.badge || undefined,
        partner: r.partner || undefined,
        status: (r.status || "In Corso") as ProjectItem["status"],
        description: r.description,
        published: Boolean(r.published),
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    } catch (err) {
      console.error("[ProjectsRepo.getAll] Errore DB Neon, uso fallback statico:", err);
      const items = DEFAULT_PROJECTS;
      const filtered = publishedOnly ? items.filter((i) => i.published) : items;
      return filtered.sort((a, b) => a.number.localeCompare(b.number));
    }
  },

  async getById(id: string): Promise<ProjectItem | null> {
    if (!DB_URL) {
      const items = readLocalJson<ProjectItem[]>("progetti.json", DEFAULT_PROJECTS);
      return items.find((i) => i.id === id) || null;
    }
    const sql = neon(DB_URL);
    const rows = await sql`SELECT * FROM progetti WHERE id = ${id} LIMIT 1;`;
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      number: r.number,
      title: r.title,
      highlight: r.highlight,
      category: r.category as ProjectItem["category"],
      badge: r.badge || undefined,
      partner: r.partner || undefined,
      status: (r.status || "In Corso") as ProjectItem["status"],
      description: r.description,
      published: Boolean(r.published),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  },

  async save(project: Omit<ProjectItem, "createdAt" | "updatedAt">): Promise<ProjectItem> {
    const now = new Date().toISOString();
    if (!DB_URL) {
      const items = readLocalJson<ProjectItem[]>("progetti.json", DEFAULT_PROJECTS);
      const existingIdx = items.findIndex((i) => i.id === project.id);
      let saved: ProjectItem;
      if (existingIdx >= 0) {
        saved = { ...items[existingIdx], ...project, updatedAt: now };
        items[existingIdx] = saved;
      } else {
        saved = { ...project, createdAt: now, updatedAt: now };
        items.push(saved);
      }
      writeLocalJson<ProjectItem[]>("progetti.json", items);
      return saved;
    }
    const sql = neon(DB_URL);
    await sql`
      INSERT INTO progetti (id, number, title, highlight, category, badge, partner, status, description, published, updated_at)
      VALUES (${project.id}, ${project.number}, ${project.title}, ${project.highlight}, ${project.category}, ${project.badge || null}, ${project.partner || null}, ${project.status}, ${project.description}, ${project.published}, ${now})
      ON CONFLICT (id) DO UPDATE SET
        number = EXCLUDED.number,
        title = EXCLUDED.title,
        highlight = EXCLUDED.highlight,
        category = EXCLUDED.category,
        badge = EXCLUDED.badge,
        partner = EXCLUDED.partner,
        status = EXCLUDED.status,
        description = EXCLUDED.description,
        published = EXCLUDED.published,
        updated_at = EXCLUDED.updated_at;
    `;
    const found = await this.getById(project.id);
    return found!;
  },

  async delete(id: string): Promise<boolean> {
    if (!DB_URL) {
      const items = readLocalJson<ProjectItem[]>("progetti.json", DEFAULT_PROJECTS);
      const filtered = items.filter((i) => i.id !== id);
      writeLocalJson<ProjectItem[]>("progetti.json", filtered);
      return true;
    }
    const sql = neon(DB_URL);
    await sql`DELETE FROM progetti WHERE id = ${id};`;
    return true;
  },
};

