import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { I18nProvider, useI18n, formatEuro, formatNumber, formatPercent } from '@/lib/i18n';
import { computeAll, type SupplyModel, type AppState } from '@/lib/data';

function sliderVal(v: number | readonly number[]): number {
  return Array.isArray(v) ? v[0] : v as number;
}

// === Default + presets ===
const DEFAULT_STATE: AppState = {
  systemKWp: 39,
  supplyModel: 'par42b',
  batteryKWh: 0,
  includeSubsidy: true,
  financingMethod: 'kfw',
  apartmentMEA: 300,
  kfwRate: 3.3,
  loanYears: 10,
  priceIncrease: 3,
};

const PRESETS: Record<string, AppState> = {
  conservative: { ...DEFAULT_STATE, systemKWp: 30, batteryKWh: 0, financingMethod: 'kfw' },
  recommended: { ...DEFAULT_STATE },
  maxSavings: { ...DEFAULT_STATE, systemKWp: 39, batteryKWh: 20, financingMethod: 'sonderumlage' },
  zeroRisk: { ...DEFAULT_STATE, systemKWp: 39, batteryKWh: 0, financingMethod: 'contracting' },
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-4 pb-2 border-b">
      {children}
    </div>
  );
}

function ResultRow({ label, value, accent, large, sub }: {
  label: string; value: string; accent?: boolean; large?: boolean; sub?: string;
}) {
  return (
    <div className={`flex justify-between items-baseline ${large ? 'py-1' : ''}`}>
      <div>
        <span className={`text-muted-foreground ${large ? 'text-sm' : 'text-xs'}`}>{label}</span>
        {sub && <span className="text-[10px] text-muted-foreground ml-1">({sub})</span>}
      </div>
      <span className={`font-mono font-medium ${large ? 'text-xl' : 'text-base'} ${accent ? 'text-green-700' : ''}`}>
        {value}
      </span>
    </div>
  );
}

function Calculator() {
  const { lang, setLang, t } = useI18n();

  const [systemKWp, setSystemKWp] = useState(DEFAULT_STATE.systemKWp);
  const [supplyModel, setSupplyModel] = useState<SupplyModel>(DEFAULT_STATE.supplyModel);
  const [batteryKWh, setBatteryKWh] = useState(DEFAULT_STATE.batteryKWh);
  const [includeSubsidy, setIncludeSubsidy] = useState(DEFAULT_STATE.includeSubsidy);
  const [financingMethod, setFinancingMethod] = useState<AppState['financingMethod']>(DEFAULT_STATE.financingMethod);
  const [apartmentMEA, setApartmentMEA] = useState(DEFAULT_STATE.apartmentMEA);
  const [kfwRate, setKfwRate] = useState(DEFAULT_STATE.kfwRate);
  const [loanYears, setLoanYears] = useState(DEFAULT_STATE.loanYears);
  const [priceIncrease, setPriceIncrease] = useState(DEFAULT_STATE.priceIncrease);

  const computed = useMemo(() => computeAll({
    systemKWp, supplyModel, batteryKWh, includeSubsidy,
    financingMethod, apartmentMEA, kfwRate, loanYears, priceIncrease,
  }), [systemKWp, supplyModel, batteryKWh, includeSubsidy, financingMethod, apartmentMEA, kfwRate, loanYears, priceIncrease]);

  const isKfw = financingMethod === 'kfw';
  const isContracting = financingMethod === 'contracting';
  const positive = computed.netMonthlyCashFlow >= 0 || isContracting;
  const isVolleinspeisung = supplyModel === 'volleinspeisung';

  const supplyLabels: Record<SupplyModel, string> = {
    volleinspeisung: t('supply.volleinspeisung'),
    par42b: t('supply.par42b'),
    par42c: t('supply.par42c'),
  };

  // === Hero metric: 25-year profit per apartment ===
  const profit25yrPerApt = Math.round(computed.profit25yr * computed.meaShare);

  // === Presets ===
  const applyPreset = (key: keyof typeof PRESETS) => {
    const s = PRESETS[key];
    setSystemKWp(s.systemKWp);
    setSupplyModel(s.supplyModel);
    setBatteryKWh(s.batteryKWh);
    setIncludeSubsidy(s.includeSubsidy);
    setFinancingMethod(s.financingMethod);
    setApartmentMEA(s.apartmentMEA);
    setKfwRate(s.kfwRate);
    setLoanYears(s.loanYears);
    setPriceIncrease(s.priceIncrease);
  };

  // Detect active preset (rough match: key non-financing fields + financing method)
  const activePreset = (() => {
    for (const [key, p] of Object.entries(PRESETS)) {
      if (
        p.systemKWp === systemKWp &&
        p.supplyModel === supplyModel &&
        p.batteryKWh === batteryKWh &&
        p.includeSubsidy === includeSubsidy &&
        p.financingMethod === financingMethod
      ) return key;
    }
    return null;
  })();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-1">
              WEG Solar + Batterie
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
              {t('dashboard.title')}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t('dashboard.subtitle')}
            </p>
            <p className="text-xs text-muted-foreground mt-2 max-w-lg">
              {t('dashboard.description')}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLang(lang === 'de' ? 'en' : 'de')}
            className="font-mono text-xs shrink-0"
          >
            {lang === 'de' ? 'EN' : 'DE'}
          </Button>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 items-start">

          {/* ========== LEFT: CONTROLS ========== */}
          <div className="space-y-6">

            {/* Presets */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">
                {t('preset.title')}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(['conservative', 'recommended', 'maxSavings', 'zeroRisk'] as const).map((key) => {
                  const isActive = activePreset === key;
                  return (
                    <button
                      key={key}
                      onClick={() => applyPreset(key)}
                      className={`text-left rounded-lg border px-2.5 py-2 transition-colors ${isActive ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
                    >
                      <div className="text-xs font-medium">{t(`preset.${key}`)}</div>
                      <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">{t(`preset.${key}Note`)}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* System size */}
            <Card>
              <CardContent className="pt-6">
                <SectionLabel>{t('system.title')}</SectionLabel>

                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <Label className="text-sm">{t('system.slider')}</Label>
                      <span className="font-mono text-base font-medium">{systemKWp} kWp</span>
                    </div>
                    <Slider min={30} max={45} step={1} value={[systemKWp]} onValueChange={(v) => setSystemKWp(sliderVal(v))} />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>30 kWp</span><span>39 kWp</span><span>45 kWp</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch checked={includeSubsidy} onCheckedChange={setIncludeSubsidy} />
                    <div>
                      <Label className="text-sm">{t('system.subsidy')}</Label>
                      <p className="text-[10px] text-muted-foreground">{t('system.subsidyNote')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supply model */}
            <Card>
              <CardContent className="pt-6">
                <SectionLabel>{t('supply.title')}</SectionLabel>
                <RadioGroup value={supplyModel} onValueChange={(v) => setSupplyModel(v as SupplyModel)} className="space-y-3">
                  {(['volleinspeisung', 'par42b', 'par42c'] as SupplyModel[]).map((model) => (
                    <label key={model} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${model === supplyModel ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                      <RadioGroupItem value={model} className="mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{supplyLabels[model]}</span>
                          {model === 'par42b' && <Badge variant="default" className="text-[9px] px-1.5 py-0">{t('supply.recommended')}</Badge>}
                          {model === 'par42c' && <Badge variant="outline" className="text-[9px] px-1.5 py-0">{t('supply.fromJune2026')}</Badge>}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{t(`supply.${model}Desc`)}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Battery */}
            <Card>
              <CardContent className="pt-6">
                <SectionLabel>{t('battery.title')}</SectionLabel>
                <div className="flex justify-between items-baseline mb-2">
                  <Label className="text-sm">{t('battery.slider')}</Label>
                  <span className="font-mono text-base font-medium">{batteryKWh} kWh</span>
                </div>
                <Slider
                  min={0} max={40} step={1}
                  value={[batteryKWh]}
                  onValueChange={(v) => setBatteryKWh(sliderVal(v))}
                  disabled={isVolleinspeisung}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>{t('battery.noBattery')}</span><span>20 kWh</span><span>40 kWh</span>
                </div>
                {isVolleinspeisung && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 rounded p-2 mt-3">{t('battery.notRelevant')}</p>
                )}
              </CardContent>
            </Card>

            {/* Financing */}
            <Card>
              <CardContent className="pt-6">
                <SectionLabel>{t('financial.financing')}</SectionLabel>
                <div className="space-y-5">
                  <RadioGroup value={financingMethod} onValueChange={(v) => setFinancingMethod(v as AppState['financingMethod'])} className="space-y-2">
                    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${financingMethod === 'kfw' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                      <RadioGroupItem value="kfw" className="mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">{t('financial.kfw')}</span>
                        <p className="text-[10px] text-muted-foreground">{lang === 'de' ? 'Kein Eigenkapital nötig, ~€17/Monat' : 'No upfront cash, ~€17/month'}</p>
                      </div>
                    </label>
                    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${financingMethod === 'sonderumlage' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                      <RadioGroupItem value="sonderumlage" className="mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">{t('financial.sonderumlage')}</span>
                        <p className="text-[10px] text-muted-foreground">{lang === 'de' ? 'Einmalzahlung, höhere Langzeitrendite' : 'One-time payment, higher long-term return'}</p>
                      </div>
                    </label>
                    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${financingMethod === 'contracting' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                      <RadioGroupItem value="contracting" className="mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">{t('financial.contracting')}</span>
                        <p className="text-[10px] text-muted-foreground">{t('financial.contractingNote')}</p>
                      </div>
                    </label>
                  </RadioGroup>

                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <Label className="text-sm">{t('financial.apartmentMEA')}</Label>
                      <span className="font-mono text-sm font-medium">{apartmentMEA} MEA ({formatNumber(apartmentMEA / 7791.53 * 100, 1)}%)</span>
                    </div>
                    <Slider min={100} max={600} step={10} value={[apartmentMEA]} onValueChange={(v) => setApartmentMEA(sliderVal(v))} />
                    <p className="text-[10px] text-muted-foreground mt-1">{t('financial.meaNote')}</p>
                  </div>

                  {isKfw && (
                    <>
                      <div>
                        <div className="flex justify-between items-baseline mb-2">
                          <Label className="text-sm">{t('financial.interestRate')}</Label>
                          <span className="font-mono text-sm font-medium">{formatNumber(kfwRate, 1)}%</span>
                        </div>
                        <Slider min={2} max={6} step={0.1} value={[kfwRate]} onValueChange={(v) => setKfwRate(sliderVal(v))} />
                      </div>
                      <div>
                        <div className="flex justify-between items-baseline mb-2">
                          <Label className="text-sm">{t('financial.loanTerm')}</Label>
                          <span className="font-mono text-sm font-medium">{loanYears} {t('unit.years')}</span>
                        </div>
                        <Slider min={5} max={20} step={1} value={[loanYears]} onValueChange={(v) => setLoanYears(sliderVal(v))} />
                      </div>
                    </>
                  )}

                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <Label className="text-sm">{t('financial.priceIncrease')}</Label>
                      <span className="font-mono text-sm font-medium">{formatNumber(priceIncrease, 1)}%</span>
                    </div>
                    <Slider min={0} max={8} step={0.5} value={[priceIncrease]} onValueChange={(v) => setPriceIncrease(sliderVal(v))} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ========== RIGHT: RESULTS ========== */}
          <div className="space-y-6 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:px-2 lg:py-2 lg:-mx-2 lg:-my-2">

            {/* HERO: 25-year profit per apartment */}
            <Card className={profit25yrPerApt > 0 ? 'border-green-300 bg-gradient-to-br from-green-50 to-green-100/50' : 'border-red-200 bg-red-50'}>
              <CardContent className="pt-6 pb-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-1">
                  {t('dashboard.lifetimeProfit')}
                </p>
                <p className={`text-5xl font-mono font-medium ${profit25yrPerApt > 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {profit25yrPerApt > 0 ? '+' : ''}{formatEuro(profit25yrPerApt)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('dashboard.lifetimeNote')}
                </p>
                <Separator className="my-4" />
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      {t('dashboard.perMonthLabel')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {positive ? t('dashboard.cashFlowPositive') : t('dashboard.cashFlowNegative')}
                    </p>
                  </div>
                  <p className={`text-2xl font-mono font-medium shrink-0 ml-3 ${positive ? 'text-green-700' : 'text-red-700'}`}>
                    {positive ? '+' : ''}{formatEuro(computed.netMonthlyCashFlow)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* System output */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <SectionLabel>{t('system.title')}</SectionLabel>
                <ResultRow label={t('system.roofArea')} value={`~${computed.system.roofArea} ${t('unit.sqm')}`} />
                <ResultRow label={t('system.panels')} value={`${computed.system.panels} ${t('unit.pieces')}`} />
                <ResultRow label={t('system.output')} value={`${formatNumber(computed.system.annualOutput)} ${t('unit.kwhYear')}`} accent large />
                {!isVolleinspeisung && (
                  <ResultRow label={t('battery.selfConsumption')} value={formatPercent(computed.selfConsumption)} accent />
                )}
              </CardContent>
            </Card>

            {/* Costs */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <SectionLabel>{lang === 'de' ? 'Kosten' : 'Costs'}</SectionLabel>
                {isContracting ? (
                  <p className="text-sm text-muted-foreground">{t('financial.contractingNote')}</p>
                ) : (
                  <>
                    <ResultRow label={t('system.grossCost')} value={formatEuro(computed.system.totalCost)} />
                    {includeSubsidy && (
                      <ResultRow label={t('system.netCost')} value={formatEuro(computed.displayCost)} accent />
                    )}
                    {batteryKWh > 0 && (
                      <ResultRow label={t('battery.costAfterSubsidy')} value={formatEuro(computed.batteryCost)} />
                    )}
                    <ResultRow label={t('system.costPerKwp')} value={formatEuro(computed.system.costPerKWp)} />
                    <Separator />
                    <ResultRow label={t('system.perApartment')} value={formatEuro(computed.perApartmentCost)} large accent />
                  </>
                )}
              </CardContent>
            </Card>

            {/* Revenue & Savings */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <SectionLabel>{t('supply.annualRevenue')}</SectionLabel>
                {isContracting ? (
                  <>
                    <ResultRow label={t('supply.annualRevenue')} value={formatEuro(computed.annualRevenue)} sub={lang === 'de' ? 'gesamt' : 'total'} />
                    <ResultRow label={t('financial.contractingSavings')} value={formatEuro(computed.contractingAnnualSavings)} accent large />
                  </>
                ) : (
                  <>
                    <ResultRow label={t('supply.annualRevenue')} value={formatEuro(computed.annualRevenue)} />
                    <ResultRow label={lang === 'de' ? 'Betriebskosten/Jahr' : 'Operating costs/yr'} value={`-${formatEuro(computed.annualOpex)}`} />
                    <Separator />
                    <ResultRow label={t('dashboard.annualSavings')} value={formatEuro(computed.annualNetSavings)} large accent />
                  </>
                )}
              </CardContent>
            </Card>

            {/* Per apartment monthly */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <SectionLabel>{t('dashboard.monthlyPerApt')}</SectionLabel>
                {isContracting ? (
                  <ResultRow label={t('financial.monthlySavings')} value={formatEuro(computed.perApartmentMonthlySavings)} accent large />
                ) : (
                  <>
                    {isKfw ? (
                      <ResultRow label={t('financial.monthlyPayment')} value={formatEuro(computed.monthlyLoanPayment)} />
                    ) : (
                      <ResultRow label={t('financial.oneTimeCost')} value={formatEuro(computed.perApartmentCost)} />
                    )}
                    <ResultRow label={t('financial.monthlySavings')} value={formatEuro(computed.perApartmentMonthlySavings)} accent />
                    {isKfw && (
                      <>
                        <Separator />
                        <div className={`rounded-lg p-3 ${positive ? 'bg-green-100' : 'bg-red-100'}`}>
                          <ResultRow
                            label={t('financial.netMonthly')}
                            value={`${positive ? '+' : ''}${formatEuro(computed.netMonthlyCashFlow)}`}
                            large
                            accent={positive}
                          />
                        </div>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Long-term */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <SectionLabel>{lang === 'de' ? 'Langfristig' : 'Long-term'}</SectionLabel>
                <ResultRow label={t('financial.payback')} value={isContracting ? '—' : `${formatNumber(computed.paybackYears, 1)} ${t('unit.years')}`} large accent={computed.paybackYears <= 10} />
                <ResultRow label={t('financial.profit25y')} value={formatEuro(computed.profit25yr)} large accent={computed.profit25yr > 0} />
                <ResultRow label={t('financial.profit25yPerApt')} value={formatEuro(profit25yrPerApt)} accent />
              </CardContent>
            </Card>

            {/* Supply model comparison */}
            <Card>
              <CardContent className="pt-6">
                <SectionLabel>{t('supply.comparison')}</SectionLabel>
                <div className="grid grid-cols-3 gap-3">
                  {computed.supplyModelComparison.map((m) => {
                    const isActive = m.model === supplyModel;
                    return (
                      <div key={m.model} className={`rounded-lg border p-3 text-center ${isActive ? 'border-primary bg-primary/5' : 'border-border'}`}>
                        <p className="text-[10px] text-muted-foreground mb-1">{supplyLabels[m.model]}</p>
                        <p className={`font-mono text-base font-medium ${isActive ? 'text-green-700' : ''}`}>{formatEuro(m.netSavings)}</p>
                        <p className="text-[10px] text-muted-foreground">{t('unit.perMonth').replace('/', '/') + 'yr'}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 25yr projection bars */}
            <Card>
              <CardContent className="pt-6">
                <SectionLabel>{t('financial.projection')}</SectionLabel>
                <div className="space-y-1.5">
                  {computed.projection25yr.filter((_, i) => i % 5 === 4 || i === 0).map((row) => {
                    const maxAbs = Math.max(...computed.projection25yr.map(r => Math.abs(r.cumulative)));
                    const barWidth = Math.abs(row.cumulative) / maxAbs * 100;
                    const isPos = row.cumulative >= 0;
                    return (
                      <div key={row.year} className="flex items-center gap-2">
                        <span className="text-[10px] font-mono w-6 text-right text-muted-foreground">{row.year}</span>
                        <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                          <div
                            className={`h-full rounded transition-all ${isPos ? 'bg-green-500' : 'bg-red-400'}`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span className={`text-[10px] font-mono w-16 text-right ${isPos ? 'text-green-700' : 'text-red-600'}`}>
                          {formatEuro(row.cumulative)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Assumptions */}
            <Card className="bg-muted/30">
              <CardContent className="pt-5 pb-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-1.5">
                  {t('financial.assumptions')}
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t('financial.assumptionsText')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <Calculator />
    </I18nProvider>
  );
}
