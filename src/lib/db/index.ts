import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";
import { EventItem, BlogPost, CourseSession, AdminUser, ProjectItem, BookingRequest, SocioItem, AnagraficaAssociazione, DocumentoIstituzionale } from "./types";
import { hashPassword } from "../auth";

const DB_URL = process.env.POSTGRES_URL || process.env.DATABASE_URL;

// Cartella fallback locale quando Postgres non è ancora configurato
const LOCAL_DATA_DIR = path.join(process.cwd(), "data", "content");
const TMP_DATA_DIR = path.join("/tmp", "vela-latina-data");

const MEMORY_CACHE: Record<string, any> = {};

function ensureDir(dir: string) {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch {}
}

function readLocalJson<T>(filename: string, defaultValue: T): T {
  if (MEMORY_CACHE[filename]) {
    return MEMORY_CACHE[filename] as T;
  }

  // 1. Prova da TMP se modificato in ambiente serverless
  const tmpPath = path.join(TMP_DATA_DIR, filename);
  if (fs.existsSync(tmpPath)) {
    try {
      const raw = fs.readFileSync(tmpPath, "utf-8");
      const parsed = JSON.parse(raw) as T;
      MEMORY_CACHE[filename] = parsed;
      return parsed;
    } catch {}
  }

  // 2. Prova dalla cartella locale di progetto
  const localPath = path.join(LOCAL_DATA_DIR, filename);
  if (fs.existsSync(localPath)) {
    try {
      const raw = fs.readFileSync(localPath, "utf-8");
      const parsed = JSON.parse(raw) as T;
      MEMORY_CACHE[filename] = parsed;
      return parsed;
    } catch {}
  }

  return defaultValue;
}

function writeLocalJson<T>(filename: string, data: T): void {
  MEMORY_CACHE[filename] = data;

  // Prova a scrivere in LOCAL_DATA_DIR (sviluppo locale)
  try {
    ensureDir(LOCAL_DATA_DIR);
    const filePath = path.join(LOCAL_DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return;
  } catch {
    // In ambienti serverless (es. Vercel) con filesystem read-only, salva in /tmp
    try {
      ensureDir(TMP_DATA_DIR);
      const tmpPath = path.join(TMP_DATA_DIR, filename);
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.warn("Impossibile salvare su disco locale/tmp:", err);
    }
  }
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
    slug: "progetto-rosa-saint-tropez-2027",
    number: "01",
    title: "Progetto ROSA",
    highlight: "Saint-Tropez 2027 · Equipaggio Femminile",
    category: "Regata Internazionale",
    badge: "Equipaggio Femminile",
    partner: "Campi Flegrei · Rete Partner",
    status: "In Corso",
    timeline: "2026 – 2027",
    location: "Acquamorta & Saint-Tropez (Francia)",
    imageUrl: "/images/janara-crew.jpeg",
    description:
      "Formazione del primo equipaggio stabile interamente femminile dell'Associazione. Un percorso intensivo di voga, conduzione di vela latina, manovre d'altura e sicurezza marittima con traguardo fissato a Les Voiles Latines di Saint-Tropez 2027.",
    content: `Il Progetto ROSA rappresenta una delle sfide sportive, umane e culturali più ambiziose intraprese dall'Associazione Vela Latina Monte di Procida. Nato dalla volontà di superare secoli di tradizioni marinare a prevalenza maschile, il cantiere mira a formare il primo equipaggio stabile interamente femminile capace di condurre in sicurezza e con ambizioni di vertice un gozzo a vela latina in mare aperto.

### Il Percorso Tecnico e Atletico
La conduzione di una barca armata a vela latina richiede forza, sincronismo e profonda sensibilità marina. A differenza delle moderne imbarcazioni provviste di verricelli e boma orizzontali, la vela triangolare si governa con l'antenna inclinata sull'albero a calcese, manovrando carnao, osti e scotta a forza di braccia. Il programma del Progetto ROSA include:
- Addestramento alla voga tradizionale in piedi sul gozzo a remi nel porto di Acquamorta, per sviluppare stabilità del baricentro, potenza dorsale e sincronismo di voga.
- Manovre complesse di bordo: issata e ammainata dell'antenna, virata di bordo con passaggio dell'antenna da un lato all'altro dell'albero (imbroglio e cambio mura).
- Navigazione tattica e lettura delle brezze termiche nel Canale di Procida e tra le secche dei Campi Flegrei.
- Sicurezza marittima, nodi tradizionali, primo soccorso e carteggio nautico cartografico.

### L'Obiettivo: Les Voiles Latines di Saint-Tropez 2027
Il traguardo fissato per l'equipaggio è la partecipazione ufficiale a Les Voiles Latines di Saint-Tropez nel maggio 2027, la più prestigiosa rassegna del Mediterraneo. L'equipaggio femminile montese gareggerà a bordo dell'ammiraglia Janara, già vincitrice assoluta dell'edizione 2024, portando in Costa Azzurra il valore della determinazione e della marineria campana.

### Impatto Comunitario e Borse di Studio
Il progetto non si esaurisce nell'agonismo: l'Associazione ha istituito borse formative per giovani ragazze del territorio flegreo e dell'area metropolitana di Napoli, garantendo l'accesso gratuito ai corsi di vela e voga, sostenuto da sponsor etici e dalla rete dei partner territoriali.`,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj-02-americas-cup",
    slug: "americas-cup-napoli-2027",
    number: "02",
    title: "America's Cup Napoli",
    highlight: "Cerimonia d'Apertura · Janara e la Tradizione Flegrea",
    category: "Regata Internazionale",
    badge: "Evento Mondiale",
    partner: "Golfo di Napoli · Regione Campania",
    status: "In Programmazione",
    timeline: "Primavera 2027",
    location: "Golfo di Napoli · Lungomare Caracciolo",
    imageUrl: "/images/janara-regatta.jpeg",
    description:
      "Partecipazione ufficiale programmata con l'ammiraglia Janara alla cerimonia inaugurale dell'America's Cup nel Golfo di Napoli, portando le radici della vela tradizionale tra i colossi della vela moderna.",
    content: `La presenza della vela latina montese nel contesto dell'America's Cup a Napoli rappresenta un ponte simbolico e visivo tra le radici millenarie della marineria mediterranea e l'apice della tecnologia velica contemporanea.

### Il Dialogo tra Legno e Carbonio
Mentre gli AC75 solcano le acque del Golfo volando su foil in fibra di carbonio a oltre 50 nodi di velocità, l'ammiraglia Janara e la flotta storica montese sfileranno con le loro vele triangolari bianche e le carene in legno massello intagliate a mano dai maestri d'ascia di Monte di Procida. È il tributo che la modernità deve alle origini: senza la vela triangolare che permise ai navigatori flegrei e mediterranei di risalire il vento, l'evoluzione della nautica mondiale non sarebbe mai esistita.

### La Parata d'Onore sul Lungomare Caracciolo
In accordo con le istituzioni regionali e il comitato organizzatore, l'Associazione curerà una parata speciale lungo il litorale tra Castel dell'Ovo, Mergellina e Posillipo. L'equipaggio di Janara effettuerà manovre tradizionali a ridosso della costa, offrendo a migliaia di appassionati e delegazioni internazionali una cartolina vivente del Patrimonio Culturale Immateriale della Campania (D.D. n. 239/2020).

### Workshop e Mostra del Mare Aperto
Durante le giornate di regata, presso il Villaggio dell'America's Cup verrà allestito uno spazio divulgativo dedicato alla carpenteria navale campana, con dimostrazioni pratiche di calafateria, nodi storici e modelli in scala del gozzo flegreo.`,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj-03-barcolana",
    slug: "barcolana-lancia-quandel-trieste",
    number: "03",
    title: "Barcolana di Trieste",
    highlight: "La Lancia Quandel al via nel Golfo di Trieste",
    category: "Regata Internazionale",
    badge: "Golfo di Trieste",
    partner: "Società Velica di Barcola e Grignano",
    status: "In Programmazione",
    timeline: "Ottobre 2026",
    location: "Golfo di Trieste",
    imageUrl: "/images/fleet-sailing.webp",
    description:
      "La grande lancia Ludovico Quandel, ex Amerigo Vespucci, sarà schierata sulla linea di partenza del Golfo di Trieste per testimoniare la potenza dell'armo a filucone e della marineria flegrea.",
    content: `La Barcolana di Trieste è la regata con il maggior numero di imbarcazioni iscritte al mondo: oltre 2.000 vele che trasformano il golfo giuliano in una distesa bianca spettacolare. Nel 2026, l'Associazione Vela Latina Monte di Procida porterà sulla linea di partenza la sua barca più imponente: la lancia storica Ludovico Quandel.

### La Lancia Ludovico Quandel del 1968
Lunga oltre 8,5 metri e costruita originariamente nei cantieri dell'Arsenale della Marina Militare per l'addestramento della nave scuola Amerigo Vespucci, la lancia Quandel è stata salvata e armata con una monumentale vela a filucone dall'Associazione. Una barca pesante, potente e marina, concepita sia per la navigazione a vela sia per dieci remi al banco.

### La Sfida nelle Acque dell'Alto Adriatico
Partecipare alla Barcolana richiede una complessa operazione logistica di trasporto stradale eccezionale da Monte di Procida a Trieste e un meticoloso piano di allestimento sul molo Audace. In mare, l'equipaggio montese affronterà le imprevedibili condizioni del Golfo di Trieste, preparandosi sia alle brezze leggere sia ai colpi di Bora, dimostrando la tenuta marina e l'efficacia dell'armo tradizionale di fronte a una platea velica internazionale.

### Fratellanza tra Tirreno e Adriatico
L'iniziativa consolida i legami storici e culturali con i circoli dell'Alto Adriatico, celebrando la marineria d'epoca come bene comune della nazione.`,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj-04-quandel-gaeta",
    slug: "operazione-quandel-monte-di-procida-gaeta",
    number: "04",
    title: "Operazione Quandel",
    highlight: "Monte di Procida ↔ Gaeta · 8ª Edizione",
    category: "Rotte Storiche",
    badge: "8ª Edizione",
    partner: "Marinerie Flegree & Pontine",
    status: "In Corso",
    timeline: "Settembre 2026",
    location: "Tirreno Centrale · Canale di Procida & Golfo di Gaeta",
    imageUrl: "/images/hero-sailing.webp",
    description:
      "Traversata a vela latina in mare aperto che unisce Monte di Procida e Gaeta. Giunta all'8ª edizione, rinnova i secolari scambi commerciali, culturali e nautici tra le due storiche marinerie tirreniche.",
    content: `L'Operazione Quandel è la tradizionale traversata d'altura a vela latina che unisce annualmente il porticciolo di Acquamorta a Monte di Procida con la città marinara di Gaeta. Giunta alla sua ottava edizione, la navigazione rinnova una rotta commerciale e culturale attiva da oltre tre secoli tra le due comunità tirreniche.

### 42 Miglia di Mare Aperto Senza Motore
La rotta attraversa l'intero Golfo di Gaeta e la costa domiziana per una distanza di oltre 42 miglia nautiche. L'equipaggio naviga rigorosamente senza ausilio del motore entrobordo: la barca risponde solo alle manovre delle scotte, alle virate all'antenna e alla saggezza dei marinai nel leggere i cambi di vento tra terra e mare aperto. In caso di bonaccia improvvisa, si armano i lunghi remi di faggio per mantenere l'avanzamento a colpi di voga cadenzata.

### Il Legame Storico con la Famiglia Quandel
L'operazione è intitolata alla memoria di Ludovico Quandel, nobile ufficiale borbonico, parlamentare e figura legata sia alla storia militare di Gaeta sia alle terre di Monte di Procida. La traversata diventa così un atto di rievocazione storiografica viva, in cui la barca in legno diventa archivio galleggiante.

### Gemellaggio e Cerimonia a Gaeta Medievale
All'arrivo nelle acque della base nautica di Gaeta, la flotta viene accolta dalle autorità locali, dalle marinerie pontine e dagli appassionati di nautica d'epoca, suggellando una festa dell'amicizia marittima con scambi enogastronomici flegrei e pontini.`,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj-05-breccia-museo",
    slug: "breccia-museo-itinerario-vulcanico",
    number: "05",
    title: "Breccia Museo",
    highlight: "Itinerario dal Mare · Geologia & Falesie di Tufo",
    category: "Cultura & Scienza",
    badge: "Vulcanologia & Mare",
    partner: "Campi Flegrei · Rete Culturale & Parco Regionale",
    status: "In Corso",
    timeline: "Itinerario Permanente",
    location: "Falesia di Monte di Procida & Acquamorta",
    imageUrl: "/images/museo/museo-2.jpeg",
    description:
      "Percorso turistico e scientifico fruibile via mare lungo la costa di Monte di Procida, dedicato alla formazione vulcanica della Breccia Museo e alla geologia millenaria dei Campi Flegrei.",
    content: `La costa di Monte di Procida è uno dei siti vulcanologici e geomorfologici più importanti e spettacolari d'Europa. La cosiddetta 'Breccia Museo' è una straordinaria formazione rocciosa a falesia, generata dal deposito vulcanico dell'Ignimbrite Campana circa 39.000 anni fa, che racchiude al suo interno blocchi di tufo, lave e pomici provenienti da tutte le formazioni geologiche precedenti dei Campi Flegrei.

### La Prospettiva Esclusiva dalla Barca a Vela
La grandiosità di questa parete rocciosa a picco sul mare non è apprezzabile da terra: solo scivolando sull'acqua silenziosamente, senza il rumore e i gas di scarico di un motore a scoppio, è possibile contemplare la policromia degli strati tufacei, le colate piroclastiche e gli anfratti naturali intagliati dal moto ondoso millenario.

### Un Progetto di Turismo Scientifico ed Eco-Sostenibile
In sinergia con vulcanologi, geologi e guide ambientali della Campania, l'Associazione ha strutturato un percorso tematico via mare accessibile a studenti, ricercatori universitari e viaggiatori consapevoli. A bordo dei gozzi storici, i partecipanti imparano contemporaneamente i rudimenti della vela latina e la storia dell'evoluzione tettonica del Mediterraneo.

### Monitoraggio e Tutela della Costa
Durante le uscite scientifiche, gli equipaggi eseguono rilievi fotografici periodici dello stato della falesia per monitorare i fenomeni di erosione costiera e l'impatto del moto ondoso, collaborando attivamente con gli enti di tutela del paesaggio flegreo.`,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj-06-quandel-lab",
    slug: "quandel-lab-archeologia-navale-ricerca",
    number: "06",
    title: "Quandel Lab & Ricerca",
    highlight: "Federico II & Suor Orsola · Studi Idrodinamici",
    category: "Cultura & Scienza",
    badge: "Ricerca Scientifica",
    partner: "Università Federico II & Suor Orsola Benincasa",
    status: "In Corso",
    timeline: "2025 – 2028",
    location: "Laboratori Accademici & Cantiere di Acquamorta",
    imageUrl: "/images/museo/museo-1.jpeg",
    description:
      "Sperimentazioni idrodinamiche, archeologia navale e rilievi costieri in collaborazione con l'Università degli Studi di Napoli Federico II, l'Università Suor Orsola Benincasa e il Museo Nazionale di Haifa.",
    content: `Il Quandel Lab è il polo di ricerca scientifica e archeologia navale istituito dall'Associazione Vela Latina Monte di Procida in stretta collaborazione con l'Università degli Studi di Napoli Federico II (Dipartimento di Ingegneria Industriale e Navale), l'Università Suor Orsola Benincasa e il Museo Nazionale Marittimo di Haifa.

### Scansioni Laser 3D e Digital Twin delle Carene
Gli scafi tradizionali in legno flegrei sono stati costruiti per secoli senza piani cartacei formali, affidandosi esclusivamente al 'garbo' (la dima ricurva) e all'occhio esperto del maestro d'ascia. Attraverso rilievi fotogrammetrici ad altissima risoluzione e scansioni laser 3D, il progetto sta digitalizzando le carene di Janara, San Giuda Taddeo, San Michele Arcangelo e Ludovico Quandel, creando i loro 'gemelli digitali' per preservarne le linee d'acqua per i secoli futuri.

### Simulazioni Idrodinamiche CFD
I ricercatori universitari applicano la fluidodinamica computazionale (CFD) per analizzare la resistenza all'avanzamento, l'angolo di scarroccio e la portanza aerodinamica dell'armo a vela latina rispetto alle moderne vele bermudiane. I risultati confermano l'eccezionale efficienza energetica del profilo alare triangolare nelle andature portanti e di bolina larga con brezze costiere.

### Archivio Orale e Formazione delle Nuove Maestranze
Il laboratorio raccoglie inoltre testimonianze video, interviste orali e glossari dialettali marinari dei vecchi maestri d'ascia e calafati montesi, organizzando tirocini formativi per giovani studenti di architettura navale e beni culturali.`,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj-07-inclusione",
    slug: "inclusione-mare-centro-serapide",
    number: "07",
    title: "Inclusione Mare",
    highlight: "Centro Serapide · Voga e Terapia del Mare",
    category: "Inclusione",
    badge: "Impatto Sociale",
    partner: "Centro Serapide & Terzo Settore",
    status: "In Corso",
    timeline: "Iniziativa Permanente",
    location: "Banchina di Acquamorta & Canale di Procida",
    imageUrl: "/images/museo/museo-3.jpeg",
    description:
      "Il mare come spazio educativo e terapeutico per bambini e ragazzi con disabilità o bisogni speciali. Attraverso la voga assistita a bordo del San Michele Arcangelo, promuoviamo l'accessibilità reale e il benessere.",
    content: `Il mare è uno straordinario maestro di uguaglianza: a bordo di una barca a remi e a vela, le differenze svaniscono per lasciare spazio alla collaborazione, alla fiducia reciproca e alla gioia della condivisione. 'Inclusione Mare' è il progetto a forte impatto sociale sviluppato dall'Associazione Vela Latina Monte di Procida in collaborazione stabile con il Centro Serapide e le associazioni del Terzo Settore flegreo.

### La Terapia del Mare e del Ritmo
Il progetto offre percorsi continui di voga tradizionale e uscite in mare dedicate a bambini, adolescenti e adulti con disturbi dello spettro autistico, disabilità cognitive e motorie. A bordo della lancia San Michele Arcangelo, appositamente attrezzata per garantire la massima stabilità e sicurezza, i ragazzi impugnano i remi insieme agli istruttori: il ritmo cadenzato della remata stimola la concentrazione, favorisce la regolazione sensoriale e rafforza l'autostima personale.

### Un'Esperienza Multi-Sensoriale Unica
Il contatto diretto con l'acqua salmastra, il suono del vento tra le sartie di canapa, il profumo del legno stagionato e la luce naturale del Canale di Procida offrono stimoli terapeutici profondi, documentati dai neuropsicomotricisti del Centro Serapide che accompagnano costantemente i gruppi durante le uscite.

### Attività Totalmente Gratuita per le Famiglie
Fedele ai propri principi fondativi, l'Associazione garantisce la totale gratuità di tutte le sessioni di Inclusione Mare. Il progetto è finanziato attraverso donazioni private, quote solidali dei soci e il supporto di aziende etiche del territorio campano.`,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj-08-stintino",
    slug: "raduno-nazionale-stintino-pisciotta",
    number: "08",
    title: "Raduno Nazionale Stintino",
    highlight: "Meeting Vela Latina · Sardegna & Cilento",
    category: "Regata Internazionale",
    badge: "Sardegna & Cilento",
    partner: "Comitato Vela Latina Stintino & Circoli Velici",
    status: "Completato",
    timeline: "Edizioni Storiche & Prossimi Raduni",
    location: "Stintino (Sardegna) & Marina di Pisciotta (Cilento)",
    imageUrl: "/images/janara-regatta.jpeg",
    description:
      "Partecipazione ai raduni della vela latina a Stintino e al Trofeo Tre Torri di Marina di Pisciotta (dove l'equipaggio ha conquistato il prestigioso Trofeo Fair Play e podio di classe).",
    content: `I raduni nazionali della vela latina rappresentano i momenti cardine in cui armatori, marinai e maestri d'ascia di tutta Italia si ritrovano per confrontarsi sul piano sportivo e celebrare l'identità marinara comune. Monte di Procida è da anni protagonista attiva e stimata nei due principali teatri storici del Tirreno: Stintino in Sardegna e Marina di Pisciotta nel Cilento.

### Il Legame con Stintino, Capitale della Vela Latina
Nel mare limpido delle Pelose e dell'Asinara, la flotta flegrea si confronta con le 'lance stintinesi' e i 'gozzi carlofortini'. La partecipazione ai meeting sardi ha permesso di affinare le regolazioni dell'antenna e di condividere le tecniche di taglio e cucitura delle vele in cotone d'Egitto, creando legami indissolubili tra marinai campani e sardi.

### Il Trofeo Fair Play a Marina di Pisciotta
Nel corso delle edizioni del celebre 'Trofeo Tre Torri' nelle acque del Parco Nazionale del Cilento, l'equipaggio di Monte di Procida ha ottenuto non solo piazzamenti sul podio di categoria, ma soprattutto il prestigioso 'Trofeo Fair Play'. Questo riconoscimento speciale premia l'etica della marineria: la disponibilità ad assistere imbarcazioni in difficoltà, la lealtà sul campo di regata e la generosità nel trasmettere le manovre ai più giovani.

### Una Tradizione Viva che Guarda al Futuro
I raduni nazionali non sono sfilate statiche, ma vere competizioni ad armi pari dove la vela latina dimostra la propria vitalità. L'Associazione continua a programmare le proprie trasferte per portare il vessillo di Monte di Procida nei porti storici d'Italia.`,
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
      
      // Sincronizza progetti con dati ricchi e slug
      const existingProjects = readLocalJson<ProjectItem[]>("progetti.json", DEFAULT_PROJECTS);
      const mergedProjects = DEFAULT_PROJECTS.map((def) => {
        const found = existingProjects.find((e) => e.id === def.id);
        if (!found) return def;
        return {
          ...def,
          ...found,
          slug: found.slug || def.slug,
          content: found.content || def.content,
          imageUrl: found.imageUrl || def.imageUrl,
          location: found.location || def.location,
          timeline: found.timeline || def.timeline,
          anagrafica: found.anagrafica || def.anagrafica,
          referente: found.referente || def.referente,
        };
      });
      writeLocalJson<ProjectItem[]>("progetti.json", mergedProjects);

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
          slug VARCHAR(255) UNIQUE,
          number VARCHAR(32) NOT NULL,
          title VARCHAR(255) NOT NULL,
          highlight VARCHAR(255) NOT NULL,
          category VARCHAR(64) NOT NULL DEFAULT 'Regata Internazionale',
          badge VARCHAR(100),
          partner VARCHAR(255) DEFAULT 'Campi Flegrei · Rete Partner',
          status VARCHAR(64) NOT NULL DEFAULT 'In Corso',
          description TEXT NOT NULL,
          content TEXT,
          image_url TEXT,
          location VARCHAR(255),
          timeline VARCHAR(100),
          published BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      // Retrocompatibilità colonne progetti su tabelle già esistenti
      try {
        await sql`ALTER TABLE progetti ADD COLUMN IF NOT EXISTS slug VARCHAR(255);`;
        await sql`ALTER TABLE progetti ADD COLUMN IF NOT EXISTS content TEXT;`;
        await sql`ALTER TABLE progetti ADD COLUMN IF NOT EXISTS image_url TEXT;`;
        await sql`ALTER TABLE progetti ADD COLUMN IF NOT EXISTS location VARCHAR(255);`;
        await sql`ALTER TABLE progetti ADD COLUMN IF NOT EXISTS timeline VARCHAR(100);`;
        await sql`ALTER TABLE progetti ADD COLUMN IF NOT EXISTS anagrafica JSONB;`;
        await sql`ALTER TABLE progetti ADD COLUMN IF NOT EXISTS referente JSONB;`;
      } catch {
        // Ignora se le colonne esistono già
      }

      // Tabella Iscrizioni e Richieste di Partecipazione
      await sql`
        CREATE TABLE IF NOT EXISTS iscrizioni_richieste (
          id VARCHAR(64) PRIMARY KEY,
          type VARCHAR(32) NOT NULL DEFAULT 'corso',
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(64),
          item_title VARCHAR(255) NOT NULL,
          experience VARCHAR(100),
          message TEXT,
          data_luogo_nascita VARCHAR(255),
          codice_fiscale VARCHAR(64),
          status VARCHAR(32) NOT NULL DEFAULT 'nuova',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      try {
        await sql`ALTER TABLE iscrizioni_richieste ADD COLUMN IF NOT EXISTS data_luogo_nascita VARCHAR(255);`;
        await sql`ALTER TABLE iscrizioni_richieste ADD COLUMN IF NOT EXISTS codice_fiscale VARCHAR(64);`;
      } catch {}

      // Tabella Soci / Libro Soci Ufficiale
      await sql`
        CREATE TABLE IF NOT EXISTS soci (
          id VARCHAR(64) PRIMARY KEY,
          anno INT NOT NULL,
          progressivo INT,
          nome VARCHAR(255) NOT NULL,
          data_luogo_nascita VARCHAR(255),
          codice_fiscale VARCHAR(64),
          numero_tessera VARCHAR(64),
          quota_contanti VARCHAR(32),
          quota_bonifico VARCHAR(32),
          socio_onorario BOOLEAN DEFAULT false,
          tipologia VARCHAR(100),
          email VARCHAR(255),
          telefono VARCHAR(64),
          data_iscrizione VARCHAR(64),
          metodo_pagamento VARCHAR(32),
          importo_pagato NUMERIC(10, 2),
          note TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      // Seed Soci da file seed locale se tabella vuota
      try {
        const existingSoci = await sql`SELECT count(*) FROM soci;`;
        if (parseInt(existingSoci[0].count) === 0) {
          const seedSoci = readLocalJson<SocioItem[]>("soci.json", []);
          for (const s of seedSoci) {
            await sql`
              INSERT INTO soci (id, anno, progressivo, nome, data_luogo_nascita, codice_fiscale, numero_tessera, quota_contanti, quota_bonifico, socio_onorario, tipologia, email, telefono, data_iscrizione, metodo_pagamento, note, created_at, updated_at)
              VALUES (${s.id}, ${s.anno}, ${s.progressivo || null}, ${s.nome}, ${s.dataLuogoNascita || null}, ${s.codiceFiscale || null}, ${s.numeroTessera ? String(s.numeroTessera) : null}, ${s.quotaContanti ? String(s.quotaContanti) : null}, ${s.quotaBonifico ? String(s.quotaBonifico) : null}, ${Boolean(s.socioOnorario)}, ${s.tipologia || 'Socio Ordinario'}, ${s.email || null}, ${s.telefono || null}, ${s.dataIscrizione || null}, ${s.metodoPagamento || null}, ${s.note || null}, ${s.createdAt || new Date().toISOString()}, ${s.updatedAt || new Date().toISOString()})
              ON CONFLICT (id) DO NOTHING;
            `;
          }
        }
      } catch (errSoci) {
        console.warn("[initDb] Avviso seed soci:", errSoci);
      }

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

      // Seed / Sincronizzazione Progetti con slug e contenuti completi
      for (const pr of DEFAULT_PROJECTS) {
        await sql`
          INSERT INTO progetti (id, slug, number, title, highlight, category, badge, partner, status, description, content, image_url, location, timeline, published)
          VALUES (${pr.id}, ${pr.slug}, ${pr.number}, ${pr.title}, ${pr.highlight}, ${pr.category}, ${pr.badge || null}, ${pr.partner || null}, ${pr.status}, ${pr.description}, ${pr.content || null}, ${pr.imageUrl || null}, ${pr.location || null}, ${pr.timeline || null}, ${pr.published})
          ON CONFLICT (id) DO UPDATE SET
            slug = COALESCE(progetti.slug, EXCLUDED.slug),
            content = COALESCE(progetti.content, EXCLUDED.content),
            image_url = COALESCE(progetti.image_url, EXCLUDED.image_url),
            location = COALESCE(progetti.location, EXCLUDED.location),
            timeline = COALESCE(progetti.timeline, EXCLUDED.timeline);
        `;
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
        slug: r.slug || r.id,
        number: r.number,
        title: r.title,
        highlight: r.highlight,
        category: r.category as ProjectItem["category"],
        badge: r.badge || undefined,
        partner: r.partner || undefined,
        status: (r.status || "In Corso") as ProjectItem["status"],
        description: r.description,
        content: r.content || undefined,
        imageUrl: r.image_url || undefined,
        location: r.location || undefined,
        timeline: r.timeline || undefined,
        published: Boolean(r.published),
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        anagrafica: r.anagrafica || undefined,
        referente: r.referente || undefined,
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
      slug: r.slug || r.id,
      number: r.number,
      title: r.title,
      highlight: r.highlight,
      category: r.category as ProjectItem["category"],
      badge: r.badge || undefined,
      partner: r.partner || undefined,
      status: (r.status || "In Corso") as ProjectItem["status"],
      description: r.description,
      content: r.content || undefined,
      imageUrl: r.image_url || undefined,
      location: r.location || undefined,
      timeline: r.timeline || undefined,
      published: Boolean(r.published),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      anagrafica: r.anagrafica || undefined,
      referente: r.referente || undefined,
    };
  },

  async getBySlug(slug: string): Promise<ProjectItem | null> {
    if (!DB_URL) {
      const items = readLocalJson<ProjectItem[]>("progetti.json", DEFAULT_PROJECTS);
      return items.find((i) => i.slug === slug || i.id === slug) || null;
    }
    try {
      const sql = neon(DB_URL);
      const rows = await sql`SELECT * FROM progetti WHERE slug = ${slug} OR id = ${slug} LIMIT 1;`;
      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        slug: r.slug || r.id,
        number: r.number,
        title: r.title,
        highlight: r.highlight,
        category: r.category as ProjectItem["category"],
        badge: r.badge || undefined,
        partner: r.partner || undefined,
        status: (r.status || "In Corso") as ProjectItem["status"],
        description: r.description,
        content: r.content || undefined,
        imageUrl: r.image_url || undefined,
        location: r.location || undefined,
        timeline: r.timeline || undefined,
        published: Boolean(r.published),
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        anagrafica: r.anagrafica || undefined,
        referente: r.referente || undefined,
      };
    } catch (err) {
      console.error("[ProjectsRepo.getBySlug] Errore DB Neon, uso fallback statico:", err);
      return DEFAULT_PROJECTS.find((i) => i.slug === slug || i.id === slug) || null;
    }
  },

  async save(project: Omit<ProjectItem, "createdAt" | "updatedAt">): Promise<ProjectItem> {
    const now = new Date().toISOString();
    const slug =
      project.slug ||
      project.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    if (!DB_URL) {
      const items = readLocalJson<ProjectItem[]>("progetti.json", DEFAULT_PROJECTS);
      const existingIdx = items.findIndex((i) => i.id === project.id);
      let saved: ProjectItem;
      if (existingIdx >= 0) {
        saved = { ...items[existingIdx], ...project, slug, updatedAt: now };
        items[existingIdx] = saved;
      } else {
        saved = { ...project, slug, createdAt: now, updatedAt: now };
        items.push(saved);
      }
      writeLocalJson<ProjectItem[]>("progetti.json", items);
      return saved;
    }
    const sql = neon(DB_URL);
    await sql`
      INSERT INTO progetti (id, slug, number, title, highlight, category, badge, partner, status, description, content, image_url, location, timeline, published, anagrafica, referente, updated_at)
      VALUES (${project.id}, ${slug}, ${project.number}, ${project.title}, ${project.highlight}, ${project.category}, ${project.badge || null}, ${project.partner || null}, ${project.status}, ${project.description}, ${project.content || null}, ${project.imageUrl || null}, ${project.location || null}, ${project.timeline || null}, ${project.published}, ${project.anagrafica ? JSON.stringify(project.anagrafica) : null}, ${project.referente ? JSON.stringify(project.referente) : null}, ${now})
      ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        number = EXCLUDED.number,
        title = EXCLUDED.title,
        highlight = EXCLUDED.highlight,
        category = EXCLUDED.category,
        badge = EXCLUDED.badge,
        partner = EXCLUDED.partner,
        status = EXCLUDED.status,
        description = EXCLUDED.description,
        content = EXCLUDED.content,
        image_url = EXCLUDED.image_url,
        location = EXCLUDED.location,
        timeline = EXCLUDED.timeline,
        published = EXCLUDED.published,
        anagrafica = EXCLUDED.anagrafica,
        referente = EXCLUDED.referente,
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

/* ==============================================================
   REPOSITORY: ISCRIZIONI & PRENOTAZIONI
============================================================== */
export const BookingsRepo = {
  async getAll(): Promise<BookingRequest[]> {
    if (!DB_URL) {
      const items = readLocalJson<BookingRequest[]>("richieste.json", []);
      return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    const sql = neon(DB_URL);
    const rows = await sql`
      SELECT id, type, name, email, phone, item_title, experience, message, data_luogo_nascita, codice_fiscale, status, created_at, updated_at
      FROM iscrizioni_richieste
      ORDER BY created_at DESC;
    `;
    return rows.map((r: any) => ({
      id: r.id,
      type: r.type as "corso" | "tesseramento",
      name: r.name,
      email: r.email,
      phone: r.phone || undefined,
      itemTitle: r.item_title,
      experience: r.experience || undefined,
      message: r.message || undefined,
      dataLuogoNascita: r.data_luogo_nascita || undefined,
      codiceFiscale: r.codice_fiscale || undefined,
      status: r.status as BookingRequest["status"],
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
    }));
  },

  async getById(id: string): Promise<BookingRequest | null> {
    const all = await this.getAll();
    return all.find((b) => b.id === id) || null;
  },

  async create(data: Omit<BookingRequest, "id" | "createdAt" | "updatedAt">): Promise<BookingRequest> {
    const id = `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const item: BookingRequest = {
      ...data,
      id,
      status: data.status || "nuova",
      createdAt: now,
      updatedAt: now,
    };

    if (!DB_URL) {
      const items = readLocalJson<BookingRequest[]>("richieste.json", []);
      items.unshift(item);
      writeLocalJson<BookingRequest[]>("richieste.json", items);
      return item;
    }

    const sql = neon(DB_URL);
    await sql`
      INSERT INTO iscrizioni_richieste (id, type, name, email, phone, item_title, experience, message, data_luogo_nascita, codice_fiscale, status, created_at, updated_at)
      VALUES (${id}, ${item.type}, ${item.name}, ${item.email}, ${item.phone || null}, ${item.itemTitle}, ${item.experience || null}, ${item.message || null}, ${item.dataLuogoNascita || null}, ${item.codiceFiscale || null}, ${item.status}, ${now}, ${now});
    `;
    return item;
  },

  async updateStatus(id: string, status: BookingRequest["status"]): Promise<BookingRequest | null> {
    const now = new Date().toISOString();
    if (!DB_URL) {
      const items = readLocalJson<BookingRequest[]>("richieste.json", []);
      const idx = items.findIndex((i) => i.id === id);
      if (idx === -1) return null;
      items[idx].status = status;
      items[idx].updatedAt = now;
      writeLocalJson<BookingRequest[]>("richieste.json", items);
      return items[idx];
    }
    const sql = neon(DB_URL);
    await sql`
      UPDATE iscrizioni_richieste
      SET status = ${status}, updated_at = ${now}
      WHERE id = ${id};
    `;
    return this.getById(id);
  },

  async delete(id: string): Promise<boolean> {
    if (!DB_URL) {
      const items = readLocalJson<BookingRequest[]>("richieste.json", []);
      const filtered = items.filter((i) => i.id !== id);
      writeLocalJson<BookingRequest[]>("richieste.json", filtered);
      return true;
    }
    const sql = neon(DB_URL);
    await sql`DELETE FROM iscrizioni_richieste WHERE id = ${id};`;
    return true;
  },
};

/* ==============================================================
   REPOSITORY: LIBRO SOCI / REGISTRO ISCRITTI
============================================================== */
export const SociRepo = {
  async getAll(anno?: number): Promise<SocioItem[]> {
    if (!DB_URL) {
      const items = readLocalJson<SocioItem[]>("soci.json", []);
      const filtered = anno ? items.filter((s) => s.anno === anno) : items;
      return filtered.sort((a, b) => {
        if (b.anno !== a.anno) return b.anno - a.anno;
        return (a.progressivo || 9999) - (b.progressivo || 9999);
      });
    }
    try {
      const sql = neon(DB_URL);
      const rows = anno
        ? await sql`SELECT * FROM soci WHERE anno = ${anno} ORDER BY progressivo ASC NULLS LAST, created_at ASC;`
        : await sql`SELECT * FROM soci ORDER BY anno DESC, progressivo ASC NULLS LAST, created_at ASC;`;

      return rows.map((r: any) => ({
        id: r.id,
        anno: Number(r.anno),
        progressivo: r.progressivo ? Number(r.progressivo) : undefined,
        nome: r.nome,
        dataLuogoNascita: r.data_luogo_nascita || undefined,
        codiceFiscale: r.codice_fiscale || undefined,
        numeroTessera: r.numero_tessera || undefined,
        quotaContanti: r.quota_contanti || undefined,
        quotaBonifico: r.quota_bonifico || undefined,
        socioOnorario: Boolean(r.socio_onorario),
        tipologia: r.tipologia || "Socio Ordinario",
        email: r.email || undefined,
        telefono: r.telefono || undefined,
        dataIscrizione: r.data_iscrizione || "",
        metodoPagamento: r.metodo_pagamento || undefined,
        importoPagato: r.importo_pagato ? Number(r.importo_pagato) : undefined,
        note: r.note || undefined,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
      }));
    } catch (err) {
      console.error("[SociRepo.getAll] Errore DB Neon, uso fallback:", err);
      const items = readLocalJson<SocioItem[]>("soci.json", []);
      const filtered = anno ? items.filter((s) => s.anno === anno) : items;
      return filtered.sort((a, b) => {
        if (b.anno !== a.anno) return b.anno - a.anno;
        return (a.progressivo || 9999) - (b.progressivo || 9999);
      });
    }
  },

  async getById(id: string): Promise<SocioItem | null> {
    const all = await this.getAll();
    return all.find((s) => s.id === id) || null;
  },

  async getNextTessera(anno: number): Promise<{ nextProgressivo: number; nextTessera: number }> {
    const list = await this.getAll(anno);
    let maxProgressivo = 0;
    let maxTessera = 0;
    for (const item of list) {
      if (item.progressivo && item.progressivo > maxProgressivo) {
        maxProgressivo = item.progressivo;
      }
      if (item.numeroTessera) {
        const num = parseInt(String(item.numeroTessera), 10);
        if (!isNaN(num) && num > maxTessera) {
          maxTessera = num;
        }
      }
    }

    // Se per l'anno in corso non ci sono ancora tessere, cerca il massimo storico complessivo
    if (maxTessera === 0) {
      const all = await this.getAll();
      for (const item of all) {
        if (item.numeroTessera) {
          const num = parseInt(String(item.numeroTessera), 10);
          if (!isNaN(num) && num > maxTessera) {
            maxTessera = num;
          }
        }
      }
    }

    return {
      nextProgressivo: maxProgressivo + 1,
      nextTessera: maxTessera > 0 ? maxTessera + 1 : maxProgressivo + 1,
    };
  },

  async save(socio: Omit<SocioItem, "id" | "createdAt" | "updatedAt"> & { id?: string; createdAt?: string }): Promise<SocioItem> {
    const now = new Date().toISOString();
    const id = socio.id || `socio-${socio.anno}-${Date.now()}`;
    const createdAt = socio.createdAt || now;

    if (!DB_URL) {
      const items = readLocalJson<SocioItem[]>("soci.json", []);
      const idx = items.findIndex((s) => s.id === id);
      let saved: SocioItem;
      if (idx >= 0) {
        saved = { ...items[idx], ...socio, id, updatedAt: now };
        items[idx] = saved;
      } else {
        saved = { ...socio, id, createdAt, updatedAt: now };
        items.push(saved);
      }
      writeLocalJson<SocioItem[]>("soci.json", items);
      return saved;
    }

    const sql = neon(DB_URL);
    await sql`
      INSERT INTO soci (id, anno, progressivo, nome, data_luogo_nascita, codice_fiscale, numero_tessera, quota_contanti, quota_bonifico, socio_onorario, tipologia, email, telefono, data_iscrizione, metodo_pagamento, importo_pagato, note, created_at, updated_at)
      VALUES (${id}, ${socio.anno}, ${socio.progressivo || null}, ${socio.nome}, ${socio.dataLuogoNascita || null}, ${socio.codiceFiscale || null}, ${socio.numeroTessera ? String(socio.numeroTessera) : null}, ${socio.quotaContanti ? String(socio.quotaContanti) : null}, ${socio.quotaBonifico ? String(socio.quotaBonifico) : null}, ${Boolean(socio.socioOnorario)}, ${socio.tipologia || 'Socio Ordinario'}, ${socio.email || null}, ${socio.telefono || null}, ${socio.dataIscrizione || null}, ${socio.metodoPagamento || null}, ${socio.importoPagato || null}, ${socio.note || null}, ${createdAt}, ${now})
      ON CONFLICT (id) DO UPDATE SET
        anno = EXCLUDED.anno,
        progressivo = EXCLUDED.progressivo,
        nome = EXCLUDED.nome,
        data_luogo_nascita = EXCLUDED.data_luogo_nascita,
        codice_fiscale = EXCLUDED.codice_fiscale,
        numero_tessera = EXCLUDED.numero_tessera,
        quota_contanti = EXCLUDED.quota_contanti,
        quota_bonifico = EXCLUDED.quota_bonifico,
        socio_onorario = EXCLUDED.socio_onorario,
        tipologia = EXCLUDED.tipologia,
        email = EXCLUDED.email,
        telefono = EXCLUDED.telefono,
        data_iscrizione = EXCLUDED.data_iscrizione,
        metodo_pagamento = EXCLUDED.metodo_pagamento,
        importo_pagato = EXCLUDED.importo_pagato,
        note = EXCLUDED.note,
        updated_at = EXCLUDED.updated_at;
    `;
    const found = await this.getById(id);
    return found!;
  },

  async delete(id: string): Promise<boolean> {
    if (!DB_URL) {
      const items = readLocalJson<SocioItem[]>("soci.json", []);
      writeLocalJson<SocioItem[]>("soci.json", items.filter((s) => s.id !== id));
      return true;
    }
    const sql = neon(DB_URL);
    await sql`DELETE FROM soci WHERE id = ${id};`;
    return true;
  },
};

/* ==============================================================
   REPOSITORY: ANAGRAFICA & DOCUMENTI ISTITUZIONALI RUNTS
============================================================== */
export const AnagraficaRepo = {
  async get(): Promise<AnagraficaAssociazione> {
    return readLocalJson<AnagraficaAssociazione>("anagrafica.json", {} as AnagraficaAssociazione);
  },

  async save(data: Partial<AnagraficaAssociazione>): Promise<AnagraficaAssociazione> {
    const current = await this.get();
    const updated: AnagraficaAssociazione = {
      ...current,
      ...data,
      runts: { ...current.runts, ...(data.runts || {}) },
      banca: { ...current.banca, ...(data.banca || {}) },
      presidente: {
        ...current.presidente,
        ...(data.presidente || {}),
        documentoIdentita: {
          ...current.presidente?.documentoIdentita,
          ...(data.presidente?.documentoIdentita || {}),
        },
      },
      consiglioDirettivo: data.consiglioDirettivo || current.consiglioDirettivo || [],
      documenti: data.documenti || current.documenti || [],
      updatedAt: new Date().toISOString(),
    };
    writeLocalJson<AnagraficaAssociazione>("anagrafica.json", updated);
    return updated;
  },

  async addDocument(doc: DocumentoIstituzionale): Promise<AnagraficaAssociazione> {
    const current = await this.get();
    const existing = (current.documenti || []).filter((d) => d.id !== doc.id);
    const updatedDocs = [doc, ...existing];
    return this.save({ documenti: updatedDocs });
  },

  async deleteDocument(id: string): Promise<AnagraficaAssociazione> {
    const current = await this.get();
    const updatedDocs = (current.documenti || []).filter((d) => d.id !== id);
    return this.save({ documenti: updatedDocs });
  },
};


