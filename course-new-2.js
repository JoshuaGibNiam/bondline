/* Bondline version 38: new notes units for physical chemistry, part 2 (equilibrium, acids and bases, kinetics, solutions). */
(function(){
const X=window.BL_COURSE_X=window.BL_COURSE_X||{pu:{},ic:{},units:[]};
const {T,E,N,W,M}=window.BL_DEEP_H;
const P=t=>String(t).replace(/<\/?sub>/g,'');
const U=u=>{u.qs=[];u.tools=u.tools||[];u.title=P(u.title);u.lede=P(u.lede);for(const k in u.syl)u.syl[k]=u.syl[k].map(P);u.sections.forEach(s=>s.h=P(s.h));u.prob.title=P(u.prob.title);X.units.push(u)};

/* ---------- Chemical equilibrium ---------- */
U({id:'pu-equil',title:'Chemical equilibrium',lede:'Dynamic equilibrium, Le Chatelier’s principle, K<sub>c</sub> and K<sub>p</sub>, and the conditions chosen for the Haber and Contact processes.',
 ref:{a:'AS 7.1',s:'Semester 2',i:'Reactivity 2.3',j:'Unit 6'},
 syl:{a:['7.1 Reversible reactions and dynamic equilibrium in a closed system','7.1 Le Chatelier’s principle: temperature, concentration, pressure, catalysts','7.1 K<sub>c</sub> and K<sub>p</sub>: expressions and calculations; mole fractions and partial pressures','7.1 Only temperature changes K','7.1 Haber and Contact process conditions'],
  s:['Dynamic equilibrium and the equilibrium constant','K<sub>c</sub> and K<sub>p</sub>','Le Chatelier’s principle and industrial processes'],
  i:['R2.3 Dynamic equilibrium','R2.3 The equilibrium constant K and its magnitude','R2.3 Le Chatelier’s principle','R2.3 (HL) Reaction quotient Q','R2.3 (HL) Calculating K and equilibrium amounts'],
  j:['Equilibria in physical processes; Henry’s law','Law of mass action; K<sub>p</sub>, K<sub>c</sub> and their relation','ΔG and equilibrium; Le Chatelier’s principle']},
 sections:[
 {h:'Dynamic equilibrium',html:`<p>In a <b>closed system</b>, a reversible reaction reaches <b>dynamic equilibrium</b> when the forward and reverse reactions happen at the same rate. Both reactions continue, but the concentrations of reactants and products stay constant. The same position is reached whether you start from the reactants or the products.</p>
 <p><b>Physical equilibria</b> work the same way: ice and water at 0 °C, a liquid and its vapour in a sealed container (giving a constant vapour pressure), or a saturated solution with undissolved solid. <b>Henry’s law</b> (JEE, NEET): the solubility of a gas in a liquid is proportional to its partial pressure above the liquid, which is why opening a fizzy drink releases bubbles.</p>`},
 {h:'Le Chatelier’s principle',html:`<p>If a change is made to a system at equilibrium, the position of equilibrium shifts to oppose the change.</p>
 ${T([['increase concentration of a reactant','shifts right, using it up','no'],['increase pressure (gases)','shifts towards fewer moles of gas','no'],['increase temperature','shifts in the endothermic direction','yes'],['add a catalyst','no shift; equilibrium reached faster','no']],['Change','Effect on position','Changes K?'])}
 ${W('For N₂O₄(g) ⇌ 2NO₂(g), ΔH = +58 kJ mol⁻¹ (colourless ⇌ brown). Predict the effect of heating, and of compressing the mixture.',['Heating: the forward reaction is endothermic, so equilibrium shifts right; the mixture turns darker brown and K increases.','Compressing: shifts to the side with fewer moles of gas (left). The colour first darkens (the gas is more concentrated), then partly fades as NO₂ is converted to N₂O₄.'])}`},
 {h:'Equilibrium constants',html:`<p>For aA + bB ⇌ cC + dD:</p>
 ${E('K<sub>c</sub> = [C]<sup>c</sup>[D]<sup>d</sup> ÷ [A]<sup>a</sup>[B]<sup>b</sup>')}
 <p>Square brackets are equilibrium concentrations in mol dm⁻³. In a heterogeneous equilibrium, solids (and pure liquids) are left out. The units of K<sub>c</sub> depend on the equation and must be worked out each time.</p>
 ${W('Ethanoic acid (1.00 mol) and ethanol (1.00 mol) are heated until equilibrium; 0.667 mol of ethyl ethanoate forms. Find K<sub>c</sub>.',['At equilibrium: acid 0.333, ethanol 0.333, ester 0.667, water 0.667 mol.','The volume cancels (equal numbers of moles on each side).','K<sub>c</sub> = (0.667 × 0.667) ÷ (0.333 × 0.333) = 4.0 (no units).'])}
 <p><b>K<sub>p</sub></b> uses partial pressures. The partial pressure of a gas = its mole fraction × total pressure, and the partial pressures add up to the total.</p>
 ${W('For N₂ + 3H₂ ⇌ 2NH₃, an equilibrium mixture at 20 MPa contains 0.25 mol NH₃, 0.25 mol N₂ and 0.50 mol H₂. Find K<sub>p</sub>.',['Total = 1.00 mol. Mole fractions: NH₃ 0.25, N₂ 0.25, H₂ 0.50.','Partial pressures: NH₃ 5 MPa, N₂ 5 MPa, H₂ 10 MPa.','K<sub>p</sub> = 5² ÷ (5 × 10³) = 25 ÷ 5000 = 5.0 × 10⁻³ MPa⁻².'])}
 <p>K<sub>p</sub> = K<sub>c</sub>(RT)<sup>Δn</sup> (JEE, NEET, STPM), where Δn is moles of gaseous products minus reactants. A large K (above about 10³) means the equilibrium lies far to the right; a small K (below about 10⁻³), far to the left.</p>
 <p><b>Reaction quotient</b> (IB HL, JEE): Q has the same form as K but uses current concentrations. If Q &lt; K the reaction goes forward; if Q &gt; K it goes in reverse.</p>`},
 {h:'Industrial equilibria',html:`${T([['Haber: N₂ + 3H₂ ⇌ 2NH₃, ΔH = −92 kJ mol⁻¹','about 450 °C, 200 atm, iron catalyst','a compromise: low temperature favours yield but is too slow; high pressure favours yield but is expensive and dangerous; unreacted gases are recycled'],['Contact: 2SO₂ + O₂ ⇌ 2SO₃, ΔH = −197 kJ mol⁻¹','about 450 °C, 1–2 atm, V₂O₅ catalyst','the yield is already over 95% at low pressure, so high pressure is not worth the cost; SO₃ is absorbed in concentrated H₂SO₄ to make oleum, then diluted']],['Process','Conditions','Reasoning'])}
 ${M(['Saying a catalyst increases the yield. It only gets to equilibrium faster.','Including solids in K expressions.','Saying increasing pressure changes K. Only temperature does.'])}`}],
 prob:{title:'Hydrogen iodide equilibrium',stem:'2.00 mol of HI is placed in a 1.00 dm³ flask and heated to 700 K. At equilibrium, 0.22 mol of H₂ is present. 2HI(g) ⇌ H₂(g) + I₂(g).',parts:[
  ['Find the equilibrium amounts of HI and I₂.','I₂ = 0.22 mol (forms with H₂). HI used = 2 × 0.22 = 0.44, so HI = 1.56 mol.'],
  ['Calculate K<sub>c</sub>.','K<sub>c</sub> = (0.22 × 0.22) ÷ 1.56² = 0.0484 ÷ 2.434 = 0.020 (no units).'],
  ['State and explain the effect of increasing the pressure on the position of equilibrium.','No effect: there are 2 moles of gas on each side.']]}
});

/* ---------- Acids, bases and ionic equilibria ---------- */
U({id:'pu-acidbase',title:'Acids, bases, buffers and solubility',lede:'Brønsted–Lowry acids, pH, K<sub>a</sub> and K<sub>w</sub>, titration curves and indicators, buffers, solubility products and partition.',
 ref:{a:'AS 7.2, A Level 25',s:'Semester 2',i:'Reactivity 3.1',j:'Unit 6'},
 syl:{a:['7.2 Brønsted–Lowry acids and bases; strong and weak; pH','7.2 Titration curves and indicators','25.1 Conjugate pairs; K<sub>a</sub>, pK<sub>a</sub>, K<sub>w</sub>; pH of strong and weak acids and strong bases','25.1 Buffers: how they work and pH calculations; HCO₃⁻ in blood','25.1 K<sub>sp</sub> and the common ion effect','25.2 Partition coefficients'],
  s:['Brønsted–Lowry and Lewis theories','pH, K<sub>a</sub>, K<sub>b</sub> and K<sub>w</sub>','Buffer solutions and titration curves','Solubility product and the common ion effect'],
  i:['R3.1 Brønsted–Lowry acids and bases; conjugate pairs; amphiprotic species','R3.1 pH, K<sub>w</sub>; strong and weak acids and bases; neutralisation','R3.1 (HL) pOH, K<sub>a</sub>, K<sub>b</sub>, pK<sub>a</sub>, pK<sub>b</sub>','R3.1 (HL) pH of salt solutions; buffers','R3.1 (HL) Indicators and pH curves','R3.4 (HL) Lewis acids and bases'],
  j:['Weak and strong electrolytes; acid–base concepts (Arrhenius, Brønsted–Lowry, Lewis)','Ionic product of water, pH scale, common ion effect','Hydrolysis of salts; solubility product; buffer solutions']},
 sections:[
 {h:'Theories of acids and bases',html:`${T([['Arrhenius','gives H⁺ in water','gives OH⁻ in water','HCl, NaOH'],['Brønsted–Lowry','proton (H⁺) donor','proton acceptor','NH₃ + H₂O ⇌ NH₄⁺ + OH⁻'],['Lewis','electron-pair acceptor','electron-pair donor','BF₃ + NH₃ → F₃B–NH₃']],['Theory','Acid','Base','Example'])}
 <p>A <b>conjugate acid–base pair</b> differs by one H⁺: in HCl + H₂O → H₃O⁺ + Cl⁻, HCl/Cl⁻ and H₃O⁺/H₂O are the pairs. Water is <b>amphiprotic</b>: it can donate or accept a proton.</p>
 <p>A <b>strong</b> acid is fully ionised in water (HCl, HNO₃, H₂SO₄ for the first proton); a <b>weak</b> acid only partly (CH₃COOH, HF, H₂CO₃). Strength is not the same as concentration.</p>`},
 {h:'pH and K<sub>w</sub>',html:`${E('pH = −log₁₀[H⁺] &nbsp;&nbsp;·&nbsp;&nbsp; K<sub>w</sub> = [H⁺][OH⁻] = 1.00 × 10⁻¹⁴ mol² dm⁻⁶ at 298 K')}
 ${W('Find the pH of 0.050 mol dm⁻³ Ba(OH)₂.',['[OH⁻] = 2 × 0.050 = 0.100 mol dm⁻³','[H⁺] = 1.00 × 10⁻¹⁴ ÷ 0.100 = 1.00 × 10⁻¹³','pH = 13.0'])}
 <p>K<sub>w</sub> increases with temperature (the ionisation of water is endothermic), so the pH of pure water falls below 7 when hot, though it stays neutral because [H⁺] = [OH⁻].</p>`},
 {h:'Weak acids: K<sub>a</sub> and pK<sub>a</sub>',html:`${E('K<sub>a</sub> = [H⁺][A⁻] ÷ [HA] &nbsp;&nbsp;·&nbsp;&nbsp; pK<sub>a</sub> = −log K<sub>a</sub>')}
 <p>For a weak acid alone, assume [H⁺] = [A⁻] and that [HA] is unchanged by the small amount that ionises: [H⁺] = √(K<sub>a</sub> × c).</p>
 ${W('Find the pH of 0.100 mol dm⁻³ propanoic acid, K<sub>a</sub> = 1.35 × 10⁻⁵.',['[H⁺] = √(1.35 × 10⁻⁵ × 0.100) = 1.16 × 10⁻³','pH = 2.94'])}
 ${W('A 0.0200 mol dm⁻³ solution of a weak acid has pH 3.10. Find K<sub>a</sub>.',['[H⁺] = 10⁻³·¹⁰ = 7.94 × 10⁻⁴','K<sub>a</sub> = (7.94 × 10⁻⁴)² ÷ 0.0200 = 3.15 × 10⁻⁵ mol dm⁻³'])}
 <p>For a weak base, K<sub>b</sub> = [BH⁺][OH⁻] ÷ [B], and K<sub>a</sub> × K<sub>b</sub> = K<sub>w</sub> for a conjugate pair. Salts of weak acids (CH₃COONa) give basic solutions; salts of weak bases (NH₄Cl) give acidic ones (salt hydrolysis).</p>`},
 {h:'Titration curves and indicators',html:`${T([['strong acid + strong base','about 7','3–11','methyl orange or phenolphthalein'],['weak acid + strong base','about 8–9','7–11','phenolphthalein'],['strong acid + weak base','about 5','3–7','methyl orange'],['weak acid + weak base','about 7','no sharp jump','none suitable']],['Titration','pH at equivalence','Vertical section','Indicator'])}
 <p>An indicator is itself a weak acid whose two forms (HIn and In⁻) have different colours. It changes colour over about ±1 of its pK<sub>a</sub>. Choose one whose range lies entirely within the vertical section of the curve. Methyl orange changes at pH 3.1–4.4; phenolphthalein at 8.3–10.</p>
 <p>For a weak acid titrated with a strong base, at the <b>half-equivalence point</b> [HA] = [A⁻], so pH = pK<sub>a</sub>: a simple way to measure K<sub>a</sub>.</p>`},
 {h:'Buffers',html:`<p>A <b>buffer</b> resists changes in pH when small amounts of acid or base are added. An acidic buffer is a weak acid with its conjugate base, for example ethanoic acid with sodium ethanoate.</p>
 <ul><li>Add H⁺: CH₃COO⁻ + H⁺ → CH₃COOH. The large reservoir of ethanoate removes it.</li><li>Add OH⁻: CH₃COOH + OH⁻ → CH₃COO⁻ + H₂O. The large reservoir of acid removes it.</li></ul>
 ${E('[H⁺] = K<sub>a</sub> × [HA] ÷ [A⁻] &nbsp;&nbsp;or&nbsp;&nbsp; pH = pK<sub>a</sub> + log([A⁻] ÷ [HA])')}
 ${W('Find the pH of a buffer made from 0.100 mol of CH₃COOH and 0.0500 mol of CH₃COONa in 1.00 dm³ (K<sub>a</sub> 1.74 × 10⁻⁵).',['[H⁺] = 1.74 × 10⁻⁵ × 0.100 ÷ 0.0500 = 3.48 × 10⁻⁵','pH = 4.46'])}
 <p><b>Blood</b> is buffered mainly by H₂CO₃/HCO₃⁻: H⁺ + HCO₃⁻ ⇌ H₂CO₃ ⇌ H₂O + CO₂. Excess acid is removed as CO₂ breathed out, keeping blood at about pH 7.4.</p>`},
 {h:'Solubility product and partition',html:`<p>For a sparingly soluble salt in equilibrium with its saturated solution, AgCl(s) ⇌ Ag⁺(aq) + Cl⁻(aq):</p>
 ${E('K<sub>sp</sub> = [Ag⁺][Cl⁻] &nbsp;&nbsp;·&nbsp;&nbsp; for PbI₂: K<sub>sp</sub> = [Pb²⁺][I⁻]²')}
 ${W('The solubility of CaF₂ is 2.15 × 10⁻⁴ mol dm⁻³. Find K<sub>sp</sub>.',['[Ca²⁺] = 2.15 × 10⁻⁴; [F⁻] = 4.30 × 10⁻⁴','K<sub>sp</sub> = 2.15 × 10⁻⁴ × (4.30 × 10⁻⁴)² = 3.98 × 10⁻¹¹ mol³ dm⁻⁹'])}
 <p>A precipitate forms when the ionic product exceeds K<sub>sp</sub>. The <b>common ion effect</b>: adding an ion already in the equilibrium (NaCl to saturated AgCl) shifts it left and lowers the solubility.</p>
 <p><b>Partition coefficient</b> (Cambridge): a solute shaken with two immiscible solvents distributes between them in a constant ratio: K<sub>pc</sub> = [X in solvent 1] ÷ [X in solvent 2]. A non-polar solute favours the non-polar solvent, so K<sub>pc</sub> for iodine between hexane and water is large.</p>
 ${M(['Taking pH = −log c for a weak acid.','Forgetting to double [OH⁻] for Ba(OH)₂ or Ca(OH)₂.','Forgetting to square the concentration of an ion with a coefficient of 2 in K<sub>sp</sub>.'])}`}],
 prob:{title:'An ethanoic acid titration',stem:'25.0 cm³ of 0.100 mol dm⁻³ ethanoic acid (K<sub>a</sub> = 1.74 × 10⁻⁵ mol dm⁻³) is titrated with 0.100 mol dm⁻³ NaOH.',parts:[
  ['Calculate the initial pH.','[H⁺] = √(1.74 × 10⁻⁵ × 0.100) = 1.32 × 10⁻³; pH = 2.88.'],
  ['Calculate the pH after 12.5 cm³ of NaOH has been added.','Half the acid is neutralised, so [HA] = [A⁻] and pH = pK<sub>a</sub> = 4.76.'],
  ['Choose a suitable indicator and explain your choice.','Phenolphthalein: the equivalence point is above 7 (about 8.7), because ethanoate is a weak base, and phenolphthalein changes colour at 8.3–10, within the steep part of the curve.']]}
});

/* ---------- Reaction kinetics ---------- */
U({id:'pu-kin',title:'Reaction kinetics',lede:'Rates, collision theory, the Boltzmann distribution, catalysts, rate equations and orders, half-lives, mechanisms and the Arrhenius equation.',
 ref:{a:'AS 8, A Level 26',s:'Semester 2',i:'Reactivity 2.2',j:'Unit 8'},
 syl:{a:['8.1 Rate; collision theory; effect of concentration and pressure','8.2 Activation energy; the Boltzmann distribution and temperature','8.3 Catalysts and their effect on the Boltzmann distribution','26.1 Rate equations, orders, rate constants, half-lives','26.1 Mechanisms and the rate-determining step','26.2 Homogeneous and heterogeneous catalysis'],
  s:['Rate of reaction and the rate equation','Order of reaction from experimental data; half-life','Collision theory, activation energy and the Arrhenius equation','Catalysis'],
  i:['R2.2 Rate of reaction and how it is measured','R2.2 Collision theory and the Maxwell–Boltzmann distribution','R2.2 Factors affecting rate; catalysts','R2.2 (HL) Mechanisms and the rate-determining step','R2.2 (HL) Rate equations, orders and k','R2.2 (HL) The Arrhenius equation'],
  j:['Rate of reaction (average and instantaneous); factors affecting rate','Elementary and complex reactions; order and molecularity; rate law and rate constant','Zero- and first-order reactions; half-lives','Arrhenius theory; activation energy; collision theory']},
 sections:[
 {h:'Rate and collision theory',html:`<p><b>Rate of reaction</b> is the change in concentration of a reactant or product per unit time (mol dm⁻³ s⁻¹). On a concentration–time graph, the rate at any moment is the gradient of the tangent; the initial rate is the tangent at t = 0.</p>
 <p>Particles react only when they collide with at least the <b>activation energy</b> and the right orientation. So rate increases with:</p>
 <ul><li><b>concentration or pressure</b>: more particles per unit volume, so more frequent collisions;</li><li><b>surface area</b> of solids: more particles exposed;</li><li><b>temperature</b>: faster particles, and a much larger fraction with enough energy;</li><li><b>a catalyst</b>: an alternative route with a lower activation energy.</li></ul>
 <p>Ways to follow a reaction: gas volume (syringe), mass loss (CO₂ escaping), colour (colorimeter), pH, conductivity, or by sampling and titrating.</p>`},
 {h:'The Boltzmann distribution',html:`<p>The Boltzmann (Maxwell–Boltzmann) distribution shows how many molecules have each energy. It starts at the origin (no molecule has zero energy), rises to a peak (the most probable energy), and tails off without touching the axis (there is no maximum energy). The area under the curve is the total number of molecules.</p>
 <ul><li>At a <b>higher temperature</b>, the peak moves to the right and is lower, the curve is flatter, and the area beyond E<sub>a</sub> is much larger. A 10 °C rise often roughly doubles the rate.</li>
 <li>A <b>catalyst</b> does not change the curve; it moves E<sub>a</sub> to the left, so a larger area lies beyond it.</li></ul>
 ${N('Explaining temperature effects','Say that more molecules have energy greater than or equal to the activation energy, so a greater proportion of collisions are successful. The increase in collision frequency is a much smaller effect.')}`},
 {h:'Rate equations and orders',html:`${E('rate = k[A]<sup>m</sup>[B]<sup>n</sup>')}
 <p>m and n are the <b>orders</b> with respect to A and B, found only by experiment (usually 0, 1 or 2). The overall order is m + n. k is the <b>rate constant</b>, which changes only with temperature.</p>
 ${T([['0','rate does not change with [A]','straight line sloping down','horizontal line','decreases as [A] falls'],['1','doubling [A] doubles the rate','exponential decay','straight line through origin','constant'],['2','doubling [A] quadruples the rate','steeper curve','upward curve (rate ∝ [A]²)','increases as [A] falls']],['Order','Initial rates','[A]–time graph','Rate–[A] graph','Half-life'])}
 ${W('Initial rates for A + B → C: [A] 0.10, [B] 0.10, rate 2.0 × 10⁻⁴; [A] 0.20, [B] 0.10, rate 8.0 × 10⁻⁴; [A] 0.10, [B] 0.20, rate 2.0 × 10⁻⁴ (mol dm⁻³ s⁻¹). Find the rate equation and k.',['Doubling [A] quadruples the rate: second order in A.','Doubling [B] leaves the rate unchanged: zero order in B.','rate = k[A]²; k = 2.0 × 10⁻⁴ ÷ 0.10² = 0.020 dm³ mol⁻¹ s⁻¹.'])}
 <p><b>First-order half-life:</b> constant, independent of concentration: t½ = 0.693 ÷ k (= ln 2 ÷ k). For JEE: integrated rate laws are [A] = [A]₀ − kt (zero order) and ln([A]₀/[A]) = kt (first order), so k = (2.303/t) log([A]₀/[A]).</p>`},
 {h:'Mechanisms',html:`<p>Most reactions happen in several steps. The slowest step is the <b>rate-determining step</b>; the species in the rate equation are those involved in it (and any steps before it).</p>
 ${W('2-Bromo-2-methylpropane hydrolyses with rate = k[(CH₃)₃CBr]. Suggest a mechanism.',['OH⁻ does not appear in the rate equation, so it is not in the rate-determining step.','Step 1 (slow): (CH₃)₃CBr → (CH₃)₃C⁺ + Br⁻','Step 2 (fast): (CH₃)₃C⁺ + OH⁻ → (CH₃)₃COH. This is the SN1 mechanism.'])}
 <p>An <b>intermediate</b> is formed in one step and used in a later one; a <b>catalyst</b> is used in one step and regenerated later. <b>Molecularity</b> (JEE) is the number of particles in an elementary step; for an elementary step it equals the order, but for an overall reaction the order is found only by experiment.</p>`},
 {h:'Catalysis and the Arrhenius equation',html:`<p><b>Heterogeneous</b> catalysts are in a different phase: reactants adsorb onto the surface, bonds weaken, products form and desorb (iron in the Haber process; Pt, Pd and Rh in catalytic converters). <b>Homogeneous</b> catalysts are in the same phase and work by forming an intermediate (Fe²⁺/Fe³⁺ in the reaction between I⁻ and S₂O₈²⁻; NO₂ in the oxidation of SO₂ to SO₃ in the atmosphere).</p>
 ${E('Fe catalysed: S₂O₈²⁻ + 2Fe²⁺ → 2SO₄²⁻ + 2Fe³⁺, then 2Fe³⁺ + 2I⁻ → 2Fe²⁺ + I₂')}
 <p>The direct reaction is slow because two negative ions repel; each catalysed step is between oppositely charged ions.</p>
 ${E('k = A e<sup>−E<sub>a</sub>/RT</sup> &nbsp;&nbsp;·&nbsp;&nbsp; ln k = ln A − E<sub>a</sub>/RT')}
 <p>A plot of ln k against 1/T gives a straight line of gradient −E<sub>a</sub>/R. From two temperatures: log(k₂/k₁) = (E<sub>a</sub>/2.303R)(1/T₁ − 1/T₂) (IB HL, JEE, NEET, STPM).</p>
 ${W('A rate constant doubles from 300 K to 310 K. Find E<sub>a</sub>.',['ln 2 = (E<sub>a</sub>/8.31)(1/300 − 1/310) = (E<sub>a</sub>/8.31)(1.075 × 10⁻⁴)','E<sub>a</sub> = 0.693 × 8.31 ÷ 1.075 × 10⁻⁴ = 53 600 J mol⁻¹ ≈ 54 kJ mol⁻¹'])}`}],
 prob:{title:'Decomposition of hydrogen peroxide',stem:'Hydrogen peroxide decomposes in a first-order reaction catalysed by iodide ions. Its concentration falls from 0.80 to 0.40 mol dm⁻³ in 6.0 minutes.',parts:[
  ['State the half-life, and the concentration after 18 minutes.','t½ = 6.0 min. 18 minutes is three half-lives: 0.80 → 0.40 → 0.20 → 0.10 mol dm⁻³.'],
  ['Calculate the rate constant in s⁻¹.','k = 0.693 ÷ (6.0 × 60) = 1.9 × 10⁻³ s⁻¹.'],
  ['Explain, using the Boltzmann distribution, why adding more iodide increases the rate.','I⁻ is a catalyst: it provides an alternative pathway with lower activation energy, so a greater proportion of molecules have E ≥ E<sub>a</sub>. More catalyst means more reaction sites, so a higher rate.']]}
});

/* ---------- Solutions and colligative properties ---------- */
U({id:'pu-solutions',title:'Solutions and colligative properties',lede:'Concentration terms, Raoult’s law, ideal and non-ideal solutions, and the four colligative properties used to find molar masses.',
 ref:{s:'Semester 2',j:'Unit 5'},
 syl:{s:['Raoult’s law and ideal solutions','Boiling point–composition diagrams; fractional distillation; azeotropes','Steam distillation'],
  j:['Concentration: molarity, molality, mole fraction, percentage','Vapour pressure of solutions and Raoult’s law','Ideal and non-ideal solutions; vapour pressure–composition plots','Colligative properties: lowering of vapour pressure, depression of freezing point, elevation of boiling point, osmotic pressure','Molar mass from colligative properties; abnormal molar mass and the van’t Hoff factor']},
 sections:[
 {h:'Raoult’s law',html:`<p>The partial vapour pressure of each component of an ideal solution equals its mole fraction times the vapour pressure of the pure component:</p>
 ${E('p<sub>A</sub> = x<sub>A</sub> p°<sub>A</sub> &nbsp;&nbsp;·&nbsp;&nbsp; p<sub>total</sub> = p<sub>A</sub> + p<sub>B</sub>')}
 <p>An <b>ideal solution</b> obeys Raoult’s law at all compositions: the A–B attractions are the same as A–A and B–B, so ΔH<sub>mix</sub> = 0 and ΔV<sub>mix</sub> = 0 (hexane and heptane; benzene and methylbenzene).</p>
 ${T([['positive deviation','A–B weaker than A–A, B–B','higher than Raoult predicts; ΔH<sub>mix</sub> &gt; 0','ethanol + water*, propanone + carbon disulfide; minimum-boiling azeotrope'],['negative deviation','A–B stronger','lower than predicted; ΔH<sub>mix</sub> &lt; 0','propanone + trichloromethane (hydrogen bonding); nitric acid + water; maximum-boiling azeotrope']],['Deviation','Attractions','Vapour pressure','Examples'])}
 <p>*Ethanol and water form an azeotrope at 95.6% ethanol (boiling at 78.2 °C), so fractional distillation cannot produce pure ethanol from the mixture.</p>`},
 {h:'Fractional and steam distillation',only:'s',html:`<p>On a boiling point–composition diagram, the vapour is always richer than the liquid in the more volatile component. In a fractionating column, repeated vaporisation and condensation enriches the vapour step by step, until pure low-boiling component distils over. With an azeotrope, the column delivers the azeotrope rather than a pure component.</p>
 <p><b>Steam distillation</b> separates a water-immiscible, steam-volatile compound (phenylamine, essential oils). Each immiscible liquid exerts its full vapour pressure, so the mixture boils when p°(water) + p°(compound) = atmospheric pressure, below 100 °C. This avoids heating the compound to its own high boiling point, where it might decompose.</p>`},
 {h:'Colligative properties',html:`<p>Colligative properties depend on the <b>number</b> of solute particles, not their identity. Adding a non-volatile solute:</p>
 ${T([['relative lowering of vapour pressure','(p° − p)/p° = x<sub>solute</sub>'],['elevation of boiling point','ΔT<sub>b</sub> = K<sub>b</sub> m'],['depression of freezing point','ΔT<sub>f</sub> = K<sub>f</sub> m'],['osmotic pressure','π = cRT']],['Property','Equation (m = molality, c = molarity)'])}
 <p>For water, K<sub>b</sub> = 0.52 K kg mol⁻¹ and K<sub>f</sub> = 1.86 K kg mol⁻¹. Osmotic pressure is the extra pressure that must be applied to a solution to stop solvent flowing into it through a semipermeable membrane. It is best for finding the molar masses of polymers and proteins, because even tiny concentrations give measurable pressures at room temperature. Solutions with the same osmotic pressure are <b>isotonic</b>; red blood cells swell in hypotonic solution and shrink in hypertonic solution. Applying more than the osmotic pressure drives water out of seawater: <b>reverse osmosis</b> desalination.</p>
 ${W('1.00 g of a non-electrolyte dissolved in 50.0 g of water lowers the freezing point by 0.40 K. Find its molar mass.',['m = ΔT<sub>f</sub> ÷ K<sub>f</sub> = 0.40 ÷ 1.86 = 0.215 mol kg⁻¹','moles = 0.215 × 0.0500 = 0.01075 mol','M = 1.00 ÷ 0.01075 = 93 g mol⁻¹'])}`},
 {h:'The van’t Hoff factor',html:`<p>Electrolytes give more particles than formula units, and some solutes associate. The <b>van’t Hoff factor</b>, i, is the ratio of the observed colligative effect to that expected for no dissociation:</p>
 ${E('ΔT<sub>f</sub> = i K<sub>f</sub> m')}
 <ul><li>Complete dissociation: NaCl, i = 2; CaCl₂, i = 3; K₄[Fe(CN)₆], i = 5.</li>
 <li>Partial dissociation (degree α into n ions): i = 1 + (n − 1)α.</li>
 <li>Association (ethanoic acid dimerises in benzene): i &lt; 1, about 0.5 for full dimerisation, so the measured molar mass is about double the true one.</li></ul>
 ${W('0.10 mol kg⁻¹ aqueous MgCl₂ freezes at −0.47 °C. Find i and the degree of dissociation.',['i = ΔT<sub>f</sub> ÷ (K<sub>f</sub> m) = 0.47 ÷ (1.86 × 0.10) = 2.53','MgCl₂ → 3 ions, so 2.53 = 1 + 2α; α = 0.76 (76%).'])}
 ${M(['Using molarity instead of molality in ΔT = Km.','Forgetting to convert grams of solvent to kilograms.','Forgetting the van’t Hoff factor for ionic solutes.'])}`}],
 prob:{title:'A protein by osmotic pressure',stem:'0.500 g of a protein is dissolved in water to make 100 cm³ of solution. Its osmotic pressure at 300 K is 0.350 kPa.',parts:[
  ['Calculate the concentration of the protein in mol m⁻³ (R = 8.31 J K⁻¹ mol⁻¹).','c = π ÷ RT = 350 ÷ (8.31 × 300) = 0.140 mol m⁻³ = 1.40 × 10⁻⁴ mol dm⁻³.'],
  ['Find the molar mass of the protein.','moles = 1.40 × 10⁻⁴ × 0.100 = 1.40 × 10⁻⁵ mol; M = 0.500 ÷ 1.40 × 10⁻⁵ = 35 700 g mol⁻¹.'],
  ['Explain why freezing point depression would be a poor method here.','ΔT<sub>f</sub> = 1.86 × (1.40 × 10⁻⁵ ÷ 0.100 kg) ≈ 2.6 × 10⁻⁴ K, far too small to measure accurately; osmotic pressure gives a readily measurable value.']]}
});
})();
