import { createContext, useContext, useState, type ReactNode } from 'react';

type Lang = 'de' | 'en';

const translations: Record<Lang, Record<string, string>> = {
  de: {
    // Nav
    'nav.dashboard': 'Übersicht',
    'nav.system': 'Anlagengröße',
    'nav.supply': 'Versorgungsmodell',
    'nav.battery': 'Batterie',
    'nav.financial': 'Finanzen',
    'nav.nextSteps': 'Nächste Schritte',

    // Dashboard
    'dashboard.title': 'Solar für unser Haus',
    'dashboard.subtitle': 'Hobrechtstraße 28, 12047 Berlin-Neukölln',
    'dashboard.description': 'Interaktiver Rechner für die PV-Anlage unserer WEG. Alle Zahlen sind Schätzungen — professionelle Angebote einholen vor Beschluss.',
    'dashboard.annualSavings': 'Jährliche Einsparung',
    'dashboard.payback': 'Amortisation',
    'dashboard.profit25y': '25-Jahres-Gewinn',
    'dashboard.monthlyPerApt': 'Monatl. pro Wohnung',
    'dashboard.cashFlowPositive': 'Cashflow-positiv ab Monat eins. Die Kreditrückzahlung wird durch Energieeinsparungen gedeckt.',
    'dashboard.cashFlowNegative': 'Kreditrate übersteigt die Einsparungen im ersten Jahr. Anlagengröße, Förderungen oder Laufzeit anpassen.',
    'dashboard.netMonthly': 'Netto monatlich pro Wohnung',
    'dashboard.currentConfig': 'Aktuelle Konfiguration',
    'dashboard.lifetimeProfit': 'Ihr Gewinn über 25 Jahre',
    'dashboard.lifetimeNote': 'pro Wohnung, nach allen Kosten & Kreditraten',
    'dashboard.perMonthLabel': 'Netto Cashflow ab Monat eins',

    // Presets
    'preset.title': 'Schnellstart-Szenarien',
    'preset.conservative': 'Konservativ',
    'preset.conservativeNote': 'Kleine Anlage, KfW-Kredit',
    'preset.recommended': 'Empfohlen',
    'preset.recommendedNote': '39 kWp, §42b, KfW',
    'preset.maxSavings': 'Max. Rendite',
    'preset.maxSavingsNote': 'Mit Batterie, Sonderumlage',
    'preset.zeroRisk': 'Null-Risiko',
    'preset.zeroRiskNote': 'Contracting, kein Eigenkapital',

    // Compare / pin
    'compare.pin': 'Szenario merken',
    'compare.pinned': 'Gemerkt',
    'compare.title': 'Szenario-Vergleich',
    'compare.empty': 'Klicken Sie "Szenario merken" um hier Varianten zu vergleichen.',
    'compare.clear': 'Alle löschen',
    'compare.remove': 'Entfernen',
    'compare.shareLink': 'Link teilen',
    'compare.copied': 'Kopiert!',
    'compare.current': 'Aktuell',
    'compare.size': 'Größe',
    'compare.battery': 'Batterie',
    'compare.financing': 'Finanzierung',
    'compare.monthly': 'Netto/Monat',
    'compare.profit25': '25-J. Gewinn',
    'compare.payback': 'Amortisation',

    // System
    'system.title': 'Anlagengröße & Kosten',
    'system.slider': 'Anlagengröße',
    'system.subsidy': 'SolarPLUS-Förderung einrechnen',
    'system.subsidyNote': '45–65% der förderfähigen Kosten (IBB Berlin)',
    'system.roofArea': 'Dachfläche',
    'system.panels': 'Module',
    'system.output': 'Jahresertrag',
    'system.grossCost': 'Bruttokosten',
    'system.netCost': 'Nach Förderung',
    'system.costPerKwp': 'Kosten pro kWp',
    'system.perApartment': 'Pro Wohnung (Ø)',

    // Supply model
    'supply.title': 'Versorgungsmodell',
    'supply.volleinspeisung': 'Volleinspeisung',
    'supply.volleinspeisungDesc': 'Gesamter Strom wird ins Netz eingespeist. Einfachste Variante, aber niedrigste Rendite.',
    'supply.par42b': '§42b Gebäudeversorgung',
    'supply.par42bDesc': 'Strom wird direkt im Gebäude verbraucht über eine Kundenanlage. Höchste Einsparung, keine Netzentgelte.',
    'supply.par42c': '§42c Energy Sharing',
    'supply.par42cDesc': 'Strom wird über das öffentliche Netz geteilt. Ab Juni 2026 verfügbar. Netzentgelte fallen an.',
    'supply.annualRevenue': 'Jahreserlös',
    'supply.annualSavings': 'Jährliche Nettoeinsparung',
    'supply.recommended': 'Empfohlen',
    'supply.availableNow': 'Jetzt verfügbar',
    'supply.fromJune2026': 'Ab Juni 2026',
    'supply.comparison': 'Modellvergleich',
    'supply.needsKundenanlage': 'Kundenanlage nötig (+€5–10k)',
    'supply.noKundenanlage': 'Keine Kundenanlage nötig',
    'supply.smartMeters': 'Smart Meters erforderlich',
    'supply.noSmartMeters': 'Keine Smart Meters nötig',
    'supply.noNetzentgelte': 'Keine Netzentgelte',
    'supply.netzentgelte': 'Netzentgelte (~14 ct/kWh)',

    // Battery
    'battery.title': 'Batteriespeicher',
    'battery.slider': 'Batteriegröße',
    'battery.selfConsumption': 'Eigenverbrauch',
    'battery.cost': 'Batteriekosten',
    'battery.costAfterSubsidy': 'Nach Förderung',
    'battery.additionalSavings': 'Zusätzliche Einsparung/Jahr',
    'battery.adjustedPayback': 'Amortisation (mit Batterie)',
    'battery.notRelevant': 'Batterie ist bei Volleinspeisung nicht relevant — der gesamte Strom geht ins Netz.',
    'battery.recommendation': 'Batteriepreise sinken weiter. Ein Nachrüsten in 2–3 Jahren kann wirtschaftlicher sein.',
    'battery.noBattery': 'Ohne Batterie',

    // Financial
    'financial.title': 'Finanzielle Details',
    'financial.financing': 'Finanzierung',
    'financial.sonderumlage': 'Sonderumlage (einmalig)',
    'financial.kfw': 'KfW-Kredit',
    'financial.apartmentMEA': 'MEA-Anteil Ihrer Wohnung',
    'financial.meaNote': 'Durchschnitt: 300 MEA (3,9%)',
    'financial.interestRate': 'KfW-Zinssatz',
    'financial.loanTerm': 'Kreditlaufzeit',
    'financial.priceIncrease': 'Strompreisanstieg/Jahr',
    'financial.oneTimeCost': 'Einmalkosten',
    'financial.monthlyPayment': 'Kreditrate/Monat',
    'financial.monthlySavings': 'Einsparung/Monat',
    'financial.netMonthly': 'Netto/Monat',
    'financial.payback': 'Amortisation',
    'financial.profit25y': '25-Jahres-Gewinn',
    'financial.profit25yPerApt': '25-Jahres-Gewinn pro Wohnung',
    'financial.assumptions': 'Annahmen',
    'financial.assumptionsText': 'Berliner Solarertrag: 950 kWh/kWp/Jahr · 0% MwSt. (seit 2023) · Einspeisevergütung 20 Jahre fest · Wechselrichter-Tausch Jahr 15 (~€4.000) · Konservative Förderschätzungen',
    'financial.projection': '25-Jahres-Projektion',

    // Next Steps
    'nextSteps.title': 'Nächste Schritte',
    'nextSteps.step1.title': 'Eigentümerversammlung',
    'nextSteps.step1.desc': 'Thema auf die Tagesordnung setzen, Mandat für Angebote einholen.',
    'nextSteps.step2.title': 'SolarPLUS L beantragen',
    'nextSteps.step2.desc': 'Förderantrag bei der IBB stellen — vor Angebotseinholung.',
    'nextSteps.step3.title': 'Statiker beauftragen',
    'nextSteps.step3.desc': 'Dachlastreserve prüfen lassen (besonders bei Berliner Dach).',
    'nextSteps.step4.title': 'Energieberater konsultieren',
    'nextSteps.step4.desc': 'Gebäude bewerten und Versorgungsmodell empfehlen lassen.',
    'nextSteps.step5.title': 'Installateure anfragen',
    'nextSteps.step5.desc': '2–3 Angebote einholen, inkl. 30 & 39 kWp Varianten mit Kundenanlage.',
    'nextSteps.step6.title': 'KfW 270 beantragen',
    'nextSteps.step6.desc': 'Antrag vor Vertragsunterschrift stellen!',
    'nextSteps.step7.title': 'WEG-Beschluss',
    'nextSteps.step7.desc': 'Finales Angebot zur Abstimmung vorlegen.',
    'nextSteps.step8.title': 'Installation',
    'nextSteps.step8.desc': 'Typischer Zeitrahmen: 2–4 Monate.',

    'nextSteps.contacts': 'Kontakte & Beratung',
    'nextSteps.solarZentrum': 'SolarZentrum Berlin — Kostenlose 60-Min. Beratung für WEGs',
    'nextSteps.solarZentrumAddress': 'Stralauer Platz 34, 10243 Berlin · Mo–Fr ohne Termin',
    'nextSteps.installers': 'Empfohlene Installateure',
    'nextSteps.installer1': 'Berliner Stadtwerke — 500+ Anlagen, Full-Service',
    'nextSteps.installer2': 'Sonnenkonzept GmbH — WEG-Spezialist',
    'nextSteps.installer3': 'Solarbauer Berlin — 23 Jahre Erfahrung',
    'nextSteps.installer4': 'metergrid — Mieterstrom/Gebäudeversorgung',
    'nextSteps.installer5': 'SOLARIMO — MFH-Spezialist, Contracting möglich',
    'nextSteps.installer6': 'Pionierkraft — §42b Spezialist',

    // Dachbegrünung
    'green.title': 'Dachbegrünung',
    'green.toggle': 'Dachbegrünung (Solargründach)',
    'green.note': 'Extensives Gründach unter PV-Modulen. Verbessert Effizienz +2,5%, verlängert Dachmembran-Lebensdauer. GründachPLUS-Förderung deckt ~50%.',
    'green.cost': 'Dachbegrünung Kosten',
    'green.efficiency': 'Effizienz-Bonus',

    // Roof renovation
    'roof.title': 'Dachsanierung',
    'roof.combined': 'Kombiniertes Projekt (Dach + PV)',
    'roof.combinedNote': 'Dach muss ohnehin saniert werden (Dachcheck Feb. 2026). Kombination spart ~€5.000 für Gerüst und Planung.',
    'roof.separate': 'Getrennte Projekte',
    'roof.savings': 'Gerüst-Einsparung',

    // Contracting
    'financial.contracting': 'Contracting (Betreiber)',
    'financial.contractingNote': 'Externer Betreiber übernimmt Investition & Betrieb. Kein Eigenkapital nötig, aber ~70% der Einsparungen gehen an den Betreiber.',
    'financial.contractingSavings': 'WEG-Anteil (30%)',

    // Units
    'unit.kwp': 'kWp',
    'unit.kwh': 'kWh',
    'unit.kwhYear': 'kWh/Jahr',
    'unit.years': 'Jahre',
    'unit.perMonth': '/Monat',
    'unit.sqm': 'm²',
    'unit.pieces': 'Stück',
  },
  en: {
    // Nav
    'nav.dashboard': 'Overview',
    'nav.system': 'System Size',
    'nav.supply': 'Supply Model',
    'nav.battery': 'Battery',
    'nav.financial': 'Financials',
    'nav.nextSteps': 'Next Steps',

    // Dashboard
    'dashboard.title': 'Solar for our Building',
    'dashboard.subtitle': 'Hobrechtstraße 28, 12047 Berlin-Neukölln',
    'dashboard.description': 'Interactive calculator for our WEG solar PV system. All figures are estimates — get professional quotes before committing.',
    'dashboard.annualSavings': 'Annual Savings',
    'dashboard.payback': 'Payback Period',
    'dashboard.profit25y': '25-Year Profit',
    'dashboard.monthlyPerApt': 'Monthly per Apartment',
    'dashboard.cashFlowPositive': 'Cash-flow positive from month one. Loan repayment is covered by energy savings.',
    'dashboard.cashFlowNegative': 'Loan payment exceeds year-1 savings. Adjust system size, subsidies, or loan term.',
    'dashboard.netMonthly': 'Net Monthly per Apartment',
    'dashboard.currentConfig': 'Current Configuration',
    'dashboard.lifetimeProfit': 'Your 25-year profit',
    'dashboard.lifetimeNote': 'per apartment, after all costs & loan payments',
    'dashboard.perMonthLabel': 'Net cash flow from month one',

    // Presets
    'preset.title': 'Quick-start scenarios',
    'preset.conservative': 'Conservative',
    'preset.conservativeNote': 'Small system, KfW loan',
    'preset.recommended': 'Recommended',
    'preset.recommendedNote': '39 kWp, §42b, KfW',
    'preset.maxSavings': 'Max returns',
    'preset.maxSavingsNote': 'With battery, one-time levy',
    'preset.zeroRisk': 'Zero risk',
    'preset.zeroRiskNote': 'Contracting, no upfront cost',

    // Compare / pin
    'compare.pin': 'Pin scenario',
    'compare.pinned': 'Pinned',
    'compare.title': 'Scenario comparison',
    'compare.empty': 'Click "Pin scenario" to compare variants here.',
    'compare.clear': 'Clear all',
    'compare.remove': 'Remove',
    'compare.shareLink': 'Share link',
    'compare.copied': 'Copied!',
    'compare.current': 'Current',
    'compare.size': 'Size',
    'compare.battery': 'Battery',
    'compare.financing': 'Financing',
    'compare.monthly': 'Net/month',
    'compare.profit25': '25y profit',
    'compare.payback': 'Payback',

    // System
    'system.title': 'System Size & Costs',
    'system.slider': 'System Size',
    'system.subsidy': 'Include SolarPLUS subsidy',
    'system.subsidyNote': '45–65% of eligible costs (IBB Berlin)',
    'system.roofArea': 'Roof Area',
    'system.panels': 'Panels',
    'system.output': 'Annual Output',
    'system.grossCost': 'Gross Cost',
    'system.netCost': 'After Subsidy',
    'system.costPerKwp': 'Cost per kWp',
    'system.perApartment': 'Per Apartment (avg)',

    // Supply model
    'supply.title': 'Supply Model',
    'supply.volleinspeisung': 'Full Feed-in',
    'supply.volleinspeisungDesc': 'All electricity is fed into the grid. Simplest option but lowest returns.',
    'supply.par42b': '§42b Building Supply',
    'supply.par42bDesc': 'Electricity is consumed directly in the building via a Kundenanlage. Highest savings, no grid fees.',
    'supply.par42c': '§42c Energy Sharing',
    'supply.par42cDesc': 'Electricity is shared via the public grid. Available from June 2026. Grid fees apply.',
    'supply.annualRevenue': 'Annual Revenue',
    'supply.annualSavings': 'Annual Net Savings',
    'supply.recommended': 'Recommended',
    'supply.availableNow': 'Available Now',
    'supply.fromJune2026': 'From June 2026',
    'supply.comparison': 'Model Comparison',
    'supply.needsKundenanlage': 'Needs Kundenanlage (+€5–10k)',
    'supply.noKundenanlage': 'No Kundenanlage needed',
    'supply.smartMeters': 'Smart meters required',
    'supply.noSmartMeters': 'No smart meters needed',
    'supply.noNetzentgelte': 'No grid fees',
    'supply.netzentgelte': 'Grid fees (~14 ct/kWh)',

    // Battery
    'battery.title': 'Battery Storage',
    'battery.slider': 'Battery Size',
    'battery.selfConsumption': 'Self-Consumption',
    'battery.cost': 'Battery Cost',
    'battery.costAfterSubsidy': 'After Subsidy',
    'battery.additionalSavings': 'Additional Savings/Year',
    'battery.adjustedPayback': 'Payback (with Battery)',
    'battery.notRelevant': 'Battery is not relevant with full feed-in — all electricity goes to the grid.',
    'battery.recommendation': 'Battery prices continue to fall. Retrofitting in 2–3 years may be more economical.',
    'battery.noBattery': 'Without Battery',

    // Financial
    'financial.title': 'Financial Details',
    'financial.financing': 'Financing',
    'financial.sonderumlage': 'One-time Levy',
    'financial.kfw': 'KfW Loan',
    'financial.apartmentMEA': 'Your Apartment MEA Share',
    'financial.meaNote': 'Average: 300 MEA (3.9%)',
    'financial.interestRate': 'KfW Interest Rate',
    'financial.loanTerm': 'Loan Term',
    'financial.priceIncrease': 'Electricity Price Increase/Year',
    'financial.oneTimeCost': 'One-time Cost',
    'financial.monthlyPayment': 'Loan Payment/Month',
    'financial.monthlySavings': 'Savings/Month',
    'financial.netMonthly': 'Net/Month',
    'financial.payback': 'Payback Period',
    'financial.profit25y': '25-Year Profit',
    'financial.profit25yPerApt': '25-Year Profit per Apartment',
    'financial.assumptions': 'Assumptions',
    'financial.assumptionsText': 'Berlin solar yield: 950 kWh/kWp/yr · 0% VAT (since 2023) · Feed-in tariff fixed 20yr · Inverter replacement year 15 (~€4,000) · Conservative subsidy estimates',
    'financial.projection': '25-Year Projection',

    // Next Steps
    'nextSteps.title': 'Next Steps',
    'nextSteps.step1.title': 'Owners\' Meeting',
    'nextSteps.step1.desc': 'Put on agenda, get mandate for quotes.',
    'nextSteps.step2.title': 'Apply for SolarPLUS L',
    'nextSteps.step2.desc': 'Submit funding application to IBB — before getting quotes.',
    'nextSteps.step3.title': 'Structural Engineer',
    'nextSteps.step3.desc': 'Assess roof load capacity (especially for Berliner Dach).',
    'nextSteps.step4.title': 'Energy Consultant',
    'nextSteps.step4.desc': 'Assess building and recommend supply model.',
    'nextSteps.step5.title': 'Get Installer Quotes',
    'nextSteps.step5.desc': 'Get 2–3 quotes including 30 & 39 kWp options with Kundenanlage.',
    'nextSteps.step6.title': 'Apply for KfW 270',
    'nextSteps.step6.desc': 'Must apply before signing the installation contract!',
    'nextSteps.step7.title': 'WEG Resolution',
    'nextSteps.step7.desc': 'Present final proposal for formal vote.',
    'nextSteps.step8.title': 'Installation',
    'nextSteps.step8.desc': 'Typical timeline: 2–4 months.',

    'nextSteps.contacts': 'Contacts & Consultation',
    'nextSteps.solarZentrum': 'SolarZentrum Berlin — Free 60-min consultation for WEGs',
    'nextSteps.solarZentrumAddress': 'Stralauer Platz 34, 10243 Berlin · Mon–Fri, walk-in',
    'nextSteps.installers': 'Recommended Installers',
    'nextSteps.installer1': 'Berliner Stadtwerke — 500+ installations, full-service',
    'nextSteps.installer2': 'Sonnenkonzept GmbH — WEG specialist',
    'nextSteps.installer3': 'Solarbauer Berlin — 23 years in Berlin',
    'nextSteps.installer4': 'metergrid — Mieterstrom/building supply specialist',
    'nextSteps.installer5': 'SOLARIMO — Multi-family specialist, contracting available',
    'nextSteps.installer6': 'Pionierkraft — §42b specialist',

    // Dachbegrünung
    'green.title': 'Green Roof',
    'green.toggle': 'Green Roof (Solargründach)',
    'green.note': 'Extensive green roof under PV modules. Improves efficiency +2.5%, extends roof membrane life. GründachPLUS subsidy covers ~50%.',
    'green.cost': 'Green Roof Cost',
    'green.efficiency': 'Efficiency Bonus',

    // Roof renovation
    'roof.title': 'Roof Renovation',
    'roof.combined': 'Combined Project (Roof + PV)',
    'roof.combinedNote': 'Roof needs renovation regardless (Dachcheck Feb 2026). Combining saves ~€5,000 on scaffolding and planning.',
    'roof.separate': 'Separate Projects',
    'roof.savings': 'Scaffolding Savings',

    // Contracting
    'financial.contracting': 'Contracting (External Operator)',
    'financial.contractingNote': 'External operator handles investment & operations. Zero upfront cost, but ~70% of savings go to the operator.',
    'financial.contractingSavings': 'WEG share (30%)',

    // Units
    'unit.kwp': 'kWp',
    'unit.kwh': 'kWh',
    'unit.kwhYear': 'kWh/year',
    'unit.years': 'years',
    'unit.perMonth': '/month',
    'unit.sqm': 'm²',
    'unit.pieces': 'panels',
  },
};

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'de',
  setLang: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('de');

  const t = (key: string): string => {
    return translations[lang][key] ?? key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export function formatEuro(value: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('de-DE', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'percent', maximumFractionDigits: 0 }).format(value);
}
