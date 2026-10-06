export interface Boat {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  year: string;
  length: string;
  speed?: string;
  rig: string;
  shipyard: string;
  description: string;
  curiosity: string;
  roleToday: string;
  image: string;
  badge?: string;
}

export interface ProjectGoal {
  number: string;
  title: string;
  highlight: string;
  description: string;
  category: "Regata Internazionale" | "Cultura & Scienza" | "Inclusione" | "Rotte Storiche";
  badge?: string;
}

export interface TimelineItem {
  year: string;
  title: string;
  description: string;
  highlight?: boolean;
}

export const FLEET_DATA: Boat[] = [
  {
    id: "janara",
    name: "Janara",
    subtitle: "Ambasciatrice flegrea nel Mediterraneo",
    category: "Gozzo Tradizionale Flegreo",
    year: "Costruzione recente su linee storiche",
    length: "5,80 m f.t.",
    rig: "Vela latina tradizionale",
    shipyard: "Cantiere Scotti Belli & Antonio Pugliese",
    description:
      "Gozzo interamente concepito e realizzato nell'area flegrea dalla maestria dei maestri d'ascia locali e dal progettista Antonio Pugliese. Porta nel mondo l'eccellenza marinaresca montese con la caratteristica livrea a fasce bianche e nere, omaggio al gemellaggio con le navi scuola Amerigo Vespucci e Palinuro.",
    curiosity:
      "Vincitrice assoluta a Les Voiles Latines di Saint-Tropez nel 2024 e prima classificata alla Procida Cup 2025.",
    roleToday:
      "Ammiraglia sportiva dell'Associazione, designata per la cerimonia inaugurale dell'America's Cup a Napoli e per le regate internazionali.",
    image: "/images/janara-crew.jpeg",
    badge: "Campione Saint-Tropez 2024",
  },
  {
    id: "quandel",
    name: "Ludovico Quandel",
    subtitle: "La grande lancia a filucone partenopeo",
    category: "Lancia Storica d'Altura",
    year: "1968",
    length: "8,50 m f.t.",
    rig: "Armo a filucone e voga a 10 remi",
    shipyard: "Regi Cantieri di Castellammare di Stabia",
    description:
      "Intitolata a Ludovico Quandel — ufficiale borbonico, parlamentare e promotore dell'autonomia civica di Monte di Procida — questa maestosa lancia è l'unica superstite delle tre imbarcazioni gemelle realizzate nel 1968 per la nave scuola Amerigo Vespucci.",
    curiosity:
      "Donata all'Istituto Nautico Duca degli Abruzzi di Napoli e affidata all'Associazione, è oggi al centro di sperimentazioni idrodinamiche uniche in Europa.",
    roleToday:
      "Laboratorio navigante di archeologia sperimentale sul Lago di Miseno e protagonista programmata alla celebre Barcolana di Trieste.",
    image: "/images/hero-sailing.webp",
    badge: "Ex Amerigo Vespucci",
  },
  {
    id: "san-giuda-taddeo",
    name: "San Giuda Taddeo",
    subtitle: "Il primo varo e la rinascita",
    category: "Gozzo Partenopeo Tradizionale",
    year: "Fine anni '50",
    length: "4,87 m f.t.",
    speed: "6 nodi",
    rig: "Vela latina su antenna arcuata",
    shipyard: "Maestri d'Ascia di San Giovanni a Teduccio",
    description:
      "La rinascita dell'Associazione ha origine nel 2006, quando il maestro Antonio Pugliese recupera uno scafo storico destinato alla demolizione. Dopo due anni di minuzioso restauro strutturale (ordinate, murate e chiglia), il gozzo torna all'onda nel 2008 nelle acque dell'isolotto di San Martino.",
    curiosity:
      "Ha il timone scolpito in legno massello di pino a foggia di sirena bicaudata. Nel 2018 è stato scelto per le scene marine del film internazionale su Oscar Wilde 'The Happy Prince'.",
    roleToday:
      "Attualmente in gestione congiunta a Gaeta con Vogamare, il Museo della Navigazione e l'Istituto Nautico Caboto per percorsi didattici d'eccellenza.",
    image: "/images/fleet-sailing.webp",
    badge: "Film 'The Happy Prince'",
  },
  {
    id: "san-michele-arcangelo",
    name: "San Michele Arcangelo",
    subtitle: "Il sogno di ogni bambino & inclusione",
    category: "Gozzo Partenopeo Classico",
    year: "Anni '50",
    length: "5,10 m f.t.",
    rig: "Vela latina tradizionale",
    shipyard: "Cantieri Artigiani Napoletani",
    description:
      "Ripristinato con il supporto appassionato del capitano Domenico Scotto di Santolo. L'armamento velico è stato donato dai discendenti del capitano Luigi Scotto D'Antuono, mentre albero e bompresso provengono dai lasciti del nostromo Salvatore Coppola.",
    curiosity:
      "È la barca eletta per il programma Inclusione Mare: ha ospitato i corsi speciali di voga per bambini e ragazzi con bisogni speciali del Centro Serapide.",
    roleToday:
      "Nave-scuola per l'addestramento alla voga dei giovani aspiranti allievi marittimi e per iniziative di solidarietà sociale.",
    image: "/images/janara-regatta.jpeg",
    badge: "Progetto Inclusione Centro Serapide",
  },
  {
    id: "torpediniera-delle-antille",
    name: "Torpediniera delle Antille",
    subtitle: "Letteratura, cinema e formazione",
    category: "Gozzo Storico Morantiano",
    year: "Anni '50 (coevo al romanzo)",
    length: "5,00 m f.t.",
    rig: "Vela latina e voga tradizionale",
    shipyard: "Cantieri Flegrei",
    description:
      "Un tributo al capolavoro di Elsa Morante 'L'isola di Arturo'. Riportato in mare il 12 dicembre 2021 dopo un meticoloso restauro filologico, il gozzo reca sul pagliolo scene dipinte dagli artisti Antonio Assante di Cupillo e Rosanna De Cicco.",
    curiosity:
      "Esposta nel 2022 nei porti iconici di Marina Grande e Corricella come testimone d'onore per Procida Capitale Italiana della Cultura.",
    roleToday:
      "Impiegata per l'addestramento degli studenti dell'Istituto Nautico Caracciolo di Procida e nelle sessioni con la Capitaneria di Porto.",
    image: "/images/hero-sailing.webp",
    badge: "Procida Capitale Cultura 2022",
  },
];

export const STRATEGIC_PROJECTS: ProjectGoal[] = [
  {
    number: "01",
    title: "Progetto ROSA",
    highlight: "Saint-Tropez 2027",
    category: "Regata Internazionale",
    description:
      "Formazione del primo equipaggio stabile interamente femminile dell'Associazione. Un percorso intensivo di voga, conduzione di vela latina, manovre d'altura e sicurezza marittima con traguardo fissato a Les Voiles Latines di Saint-Tropez 2027.",
    badge: "Equipaggio Femminile",
  },
  {
    number: "02",
    title: "America's Cup Napoli",
    highlight: "Cerimonia d'Apertura",
    category: "Regata Internazionale",
    description:
      "Partecipazione ufficiale programmata con l'ammiraglia Janara alla cerimonia inaugurale dell'America's Cup nel Golfo di Napoli, portando le radici della vela tradizionale tra i colossi della vela moderna.",
    badge: "Evento Mondiale",
  },
  {
    number: "03",
    title: "Barcolana di Trieste",
    highlight: "La Lancia Quandel al via",
    category: "Regata Internazionale",
    description:
      "La grande lancia Ludovico Quandel, ex Amerigo Vespucci, sarà schierata sulla linea di partenza del Golfo di Trieste per testimoniare la potenza dell'armo a filucone e della marineria flegrea.",
    badge: "Golfo di Trieste",
  },
  {
    number: "04",
    title: "Operazione Quandel",
    highlight: "Monte di Procida ↔ Gaeta",
    category: "Rotte Storiche",
    description:
      "Traversata a vela latina in mare aperto che unisce Monte di Procida e Gaeta. Giunta all'8ª edizione, rinnova i secolari scambi commerciali, culturali e nautici tra le due storiche marinerie tirreniche.",
    badge: "8ª Edizione",
  },
  {
    number: "05",
    title: "Breccia Museo",
    highlight: "Itinerario dal Mare",
    category: "Cultura & Scienza",
    description:
      "Percorso turistico e scientifico fruibile via mare lungo la costa di Monte di Procida, dedicato alla formazione vulcanica della Breccia Museo e alla geologia millenaria dei Campi Flegrei.",
    badge: "Vulcanologia & Mare",
  },
  {
    number: "06",
    title: "Quandel Lab & Ricerca",
    highlight: "Federico II & Suor Orsola",
    category: "Cultura & Scienza",
    description:
      "Sperimentazioni idrodinamiche, archeologia navale e rilievi costieri in collaborazione con l'Università degli Studi di Napoli Federico II, l'Università Suor Orsola Benincasa e il Museo Nazionale di Haifa.",
    badge: "Ricerca Scientifica",
  },
  {
    number: "07",
    title: "Inclusione Mare",
    highlight: "Centro Serapide",
    category: "Inclusione",
    description:
      "Il mare come spazio educativo e terapeutico per bambini e ragazzi con disabilità o bisogni speciali. Attraverso la voga assistita a bordo del San Michele Arcangelo, promuoviamo l'accessibilità reale e il benessere.",
    badge: "Impatto Sociale",
  },
  {
    number: "08",
    title: "Raduno Nazionale Stintino",
    highlight: "Meeting Vela Latina",
    category: "Regata Internazionale",
    description:
      "Partecipazione ai raduni della vela latina a Stintino e al Trofeo Tre Torri di Marina di Pisciotta (dove l'equipaggio ha conquistato il prestigioso Trofeo Fair Play e podio di classe).",
    badge: "Sardegna & Cilento",
  },
];

export const TIMELINE_DATA: TimelineItem[] = [
  {
    year: "2006",
    title: "L'inizio del sogno",
    description: "Antonio Pugliese individua e salva dalla demolizione lo scafo storico che rinascerà come San Giuda Taddeo.",
  },
  {
    year: "2008",
    title: "Nascita dell'Associazione e primo varo",
    description: "Fondazione ufficiale dell'Associazione Vela Latina Monte di Procida e commovente varo nelle acque dell'isolotto di San Martino.",
    highlight: true,
  },
  {
    year: "2012",
    title: "Regate storiche",
    description: "San Giuda Taddeo prende parte al Circuito delle Sirene e alla Regata Storica delle Repubbliche Marinare.",
  },
  {
    year: "2013",
    title: "Debutto a Saint-Tropez",
    description: "Il gozzo Janara fa il suo ingresso sulla scena internazionale a Les Voiles Latines di Saint-Tropez in Costa Azzurra.",
  },
  {
    year: "2018",
    title: "Il cinema d'autore",
    description: "San Giuda Taddeo compare sul grande schermo nelle scenografie del film 'The Happy Prince - L'ultimo ritratto di Oscar Wilde'.",
  },
  {
    year: "2020",
    title: "Riconoscimento Patrimonio Immateriale",
    description: "La Regione Campania (D.D. n. 239) riconosce i saperi della marineria flegrea del gozzo a vela latina e a remi come Patrimonio Culturale Immateriale.",
    highlight: true,
  },
  {
    year: "2021",
    title: "Varo della Torpediniera delle Antille",
    description: "Il 12 dicembre torna in mare il gozzo morantiano con il pagliolo dipinto a mano dagli artisti locali.",
  },
  {
    year: "2022",
    title: "Procida Capitale della Cultura",
    description: "La flotta e la Torpediniera delle Antille sono ormeggiate in mostra d'onore nei porti di Marina Grande e Marina Corricella.",
  },
  {
    year: "2024",
    title: "Trionfo Assoluto a Saint-Tropez",
    description: "Janara vince la classifica assoluta a Les Voiles Latines di Saint-Tropez, consacrando Monte di Procida ai vertici del Mediterraneo.",
    highlight: true,
  },
  {
    year: "2025",
    title: "Vittoria alla Procida Cup",
    description: "Janara trionfa alla Procida Cup e partecipa al prestigioso Palio di Taranto.",
  },
  {
    year: "2026",
    title: "8ª Operazione Quandel & Trofeo Tre Torri",
    description: "Premio Fair Play e podio al Trofeo Tre Torri di Marina di Pisciotta. Presenza costante alla Festa del Porto d'Ischia.",
  },
  {
    year: "2027",
    title: "La grande rotta futura",
    description: "Cerimonia d'apertura dell'America's Cup a Napoli con Janara, Barcolana di Trieste con Quandel e Progetto ROSA a Saint-Tropez.",
    highlight: true,
  },
];

export const PARTNERS_DATA = [
  { name: "Regione Campania", role: "Riconoscimento Patrimonio Immateriale" },
  { name: "Comune di Monte di Procida", role: "Sede Istituzionale" },
  { name: "Comune di Procida", role: "Collaborazione Territoriale" },
  { name: "Comune di Bacoli", role: "Ambito Flegreo" },
  { name: "Comune di Ischia & Forio", role: "Feste del Porto e Sant'Anna" },
  { name: "Marina Militare Italiana", role: "Collaborazione Storica e Navale" },
  { name: "Università Federico II di Napoli", role: "Ricerca Idrodinamica Quandel Lab" },
  { name: "Università Suor Orsola Benincasa", role: "Archeologia Navale & Territorio" },
  { name: "Museo Nazionale di Haifa", role: "Ricerca Storica Mediterranea" },
  { name: "Museo del Mare di Gaeta", role: "Didattica & Gestione Scafi" },
  { name: "Istituto Nautico F. Caracciolo", role: "Addestramento Allievi" },
  { name: "Centro Serapide", role: "Inclusione Sociale & Bisogni Speciali" },
  { name: "Lega Navale Italiana", role: "Sezioni Ischia e Gaeta" },
  { name: "Associazione Vivara APS", role: "Tutela Ambientale e Piccole Isole" },
];
