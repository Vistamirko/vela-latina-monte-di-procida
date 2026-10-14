export interface EventItem {
  id: string;
  title: string;
  date: string;
  location: string;
  category: "regata" | "manifestazione" | "raduno" | "cultura";
  badge?: string;
  description: string;
  imageUrl?: string;
  result?: string;
  articleSlug?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: string;
  category: string;
  published: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseSession {
  id: string;
  courseKey: "voga" | "vela" | "rosa" | "inclusione";
  courseTitle: string;
  imageUrl?: string;
  startDate: string;
  endDate?: string;
  schedule: string;
  totalSeats: number;
  availableSeats: number;
  status: "aperte" | "in-esaurimento" | "sold-out" | "concluso";
  instructor: string;
  notes?: string;
  price?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: "superadmin" | "admin" | "editor";
  createdAt: string;
}

export interface ProjectReferente {
  nome: string;
  ruolo: string;
  telefono: string;
  email: string;
  note?: string;
}

export interface ProjectAnagrafica {
  codiceProgetto: string;
  referente: ProjectReferente;
  entePromotore?: string;
  partnerIstituzionali?: string[];
  sedeOperativa?: string;
  budgetStimato?: string;
  statoAvanzamento?: number;
  obiettiviChiave?: string[];
}

export interface ProjectItem {
  id: string;
  slug: string;
  number: string;
  title: string;
  highlight: string;
  description: string;
  content?: string;
  imageUrl?: string;
  location?: string;
  timeline?: string;
  category: "Regata Internazionale" | "Cultura & Scienza" | "Inclusione" | "Rotte Storiche";
  badge?: string;
  partner?: string;
  status: "In Corso" | "In Programmazione" | "Completato";
  published: boolean;
  createdAt: string;
  updatedAt: string;
  // Anagrafica & Referente di Progetto
  anagrafica?: ProjectAnagrafica;
  referente?: ProjectReferente;
}

export interface SocioItem {
  id: string;
  anno: number;
  progressivo?: number;
  nome: string;
  dataLuogoNascita?: string;
  codiceFiscale?: string;
  numeroTessera?: string | number;
  quotaContanti?: string | number;
  quotaBonifico?: string | number;
  socioOnorario?: boolean;
  tipologia?: string;
  email?: string;
  telefono?: string;
  dataIscrizione: string;
  metodoPagamento?: "bonifico" | "contanti" | "onorario" | "altro";
  importoPagato?: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingRequest {
  id: string;
  type: "corso" | "tesseramento";
  name: string;
  email: string;
  phone?: string;
  itemTitle: string;
  experience?: string;
  message?: string;
  dataLuogoNascita?: string;
  codiceFiscale?: string;
  status: "nuova" | "in_attesa_pagamento" | "contattato" | "iscritto" | "archiviata";
  createdAt: string;
  updatedAt: string;
}

export interface DocumentoIstituzionale {
  id: string;
  titolo: string;
  categoria: "presidente" | "runts" | "fiscale_bancario" | "dossier" | "altro";
  descrizione: string;
  fileName: string;
  fileUrl: string;
  formato: string;
  dimensione?: string;
  dataAggiornamento: string;
  riservato: boolean;
}

export interface AnagraficaAssociazione {
  // Dati Ente
  ragioneSociale: string;
  formaGiuridica: string;
  acronimo: string;
  codiceFiscale: string;
  partitaIva?: string;
  codiceDestinatarioSdi: string;
  pec: string;
  email: string;
  emailSecondaria?: string;
  telefono: string;
  telefonoSecondario?: string;
  sitoWeb: string;
  annoFondazione: number;

  // Sede Legale & Operativa
  indirizzo: string;
  comune: string;
  cap: string;
  provincia: string;
  approdoNautico: string;
  coordinateGeografiche: string;

  // RUNTS & Riconoscimenti Ufficiali
  runts: {
    statoIscrizione: "Iscritta" | "In Aggiornamento";
    numeroRepertorio: string;
    sezione: string;
    dataIscrizione: string;
    enteCompetente: string;
    decretoRegionaleCampania: string;
    patrimonioImmaterialeDettaglio: string;
    registroNazionaleAttivita: string;
    affiliazione: string;
    polizzaAssicurativa: string;
    compagniaAssicurativa: string;
    scadenzaPolizza: string;
  };

  // Dati Bancari & Donazioni
  banca: {
    istituto: string;
    filiale: string;
    iban: string;
    bicSwift: string;
    intestatario: string;
    causaleIscrizione: string;
    causaleDonazione: string;
  };

  // Presidente e Rappresentante Legale
  presidente: {
    nomeCompleto: string;
    ruolo: string;
    codiceFiscale: string;
    dataNascita: string;
    luogoNascita: string;
    cittadinanza: string;
    residenza: string;
    telefono: string;
    email: string;
    qualificaProfessionale: string;
    dataNomina: string;
    scadenzaMandato: string;
    documentoIdentita: {
      tipo: string;
      numero: string;
      rilasciatoDa: string;
      dataRilascio: string;
      dataScadenza: string;
    };
  };

  // Consiglio Direttivo
  consiglioDirettivo: Array<{
    id: string;
    ruolo: string;
    nome: string;
    telefono?: string;
    email?: string;
    note?: string;
  }>;

  // Archivio Documenti
  documenti: DocumentoIstituzionale[];

  updatedAt: string;
}

/* ==============================================================
   NUOVI MODULI GESTIONALI (DA EXCEL GESTIONE ASSOCIAZIONE)
============================================================== */

export interface BarcaItem {
  id: string;
  nome: string;
  tipologia: string;
  foto?: string;
  owner?: string;
  responsabili?: string;
  ormeggio: string;
  stato: "Operativa" | "In restauro" | "In manutenzione" | "Disarmata";
  assicurazione?: string;
  documenti?: string;
  dotazioni?: string;
  linkCartella?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ManutenzioneItem {
  id: string;
  barcaAttrezzatura: string;
  tipo: "Ordinaria" | "Straordinaria" | "Revisione" | "Miglioria";
  intervento: string;
  owner: string;
  priorita: "Critica" | "Alta" | "Media" | "Bassa";
  stato: "Da fare" | "In corso" | "Pianificata" | "Completata" | "Annullata";
  dataPrevista?: string;
  dataCompletamento?: string;
  costo?: number | string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttivitaPortfolioItem {
  id: string;
  area: string;
  tipoAttivita: string;
  titolo: string;
  owner: string;
  dataInizio?: string;
  scadenza?: string;
  stato: "Da fare" | "In corso" | "Pianificata" | "Completata" | "Proposta";
  priorita: "Critica" | "Alta" | "Media" | "Bassa";
  ricorrenza?: string;
  avanzamento: number;
  descrizione?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskOperativoItem {
  id: string;
  progettoId: string;
  attivita: string;
  checklist: string[];
  categoria: string;
  owner: string;
  collaboratori?: string;
  dataInizio?: string;
  scadenza?: string;
  stato: "Da fare" | "In corso" | "Pianificata" | "Proposta" | "Completata";
  priorita: "Critica" | "Alta" | "Media" | "Bassa";
  avanzamento: number;
  costoPrevisto?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventarioItem {
  id: string;
  oggetto: string;
  categoria: string;
  quantita: number | string;
  unita: string;
  posizione: string;
  responsabile: string;
  stato: "In uso" | "Da acquistare" | "Da revisionare" | "Dismesso";
  dataAcquisto?: string;
  costo?: string;
  qrCodeLink?: string;
  fotoLink?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AcquistoItem {
  id: string;
  oggetto: string;
  categoria: string;
  quantita: number | string;
  priorita: "Alta" | "Media" | "Bassa";
  stato: "Da valutare" | "Da acquistare" | "Ordinato" | "Ricevuto" | "Annullato";
  richiedente?: string;
  fornitore?: string;
  preventivo?: string;
  costoPrevisto?: string;
  costoEffettivo?: string;
  dataPrevista?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountDigitaleItem {
  id: string;
  servizio: string;
  emailUsername: string;
  owner: string;
  amministratori: string[];
  emailRecupero?: string;
  telefonoRecupero?: string;
  statoRevisione: string;
  note?: string;
}

export interface GruppoWhatsAppItem {
  id: string;
  icona: string;
  nome: string;
  funzione: string;
  link: string;
  amministratori: string[];
}

export interface FundraisingItem {
  id: string;
  progetto: string;
  categoria: string;
  descrizione: string;
  responsabile: string;
  stato: "Pianificato" | "In corso" | "Da fare" | "Idea" | "Completato";
  priorita: "Alta" | "Media" | "Bassa";
  periodo: string;
  obiettivoEuro: number;
  raccoltoEuro: number;
  scadenza?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}


export interface CruscottoKPI {
  totaleProgetti: number;
  attivitaAperte: number;
  manutenzioniTotali: number;
  manutenzioniDaFare: number;
  eventiProgrammati: number;
  acquistiDaFare: number;
  inventarioTotale: number;
  accountDaVerificare: number;
  prioritaImmediate: Array<{
    id: string;
    titolo: string;
    area: string;
    owner: string;
    stato: string;
    priorita: string;
  }>;
}



