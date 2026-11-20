/* Bondline version 38: new notes units for physical chemistry, part 1.
   Each unit is added to the shared unit pool (BL_COURSE_X.units) and placed at the end of the course tracks in app.js.
   These units have lessons and a worked exam-style problem but no quiz questions yet (qs is empty). */
(function(){
const X=window.BL_COURSE_X=window.BL_COURSE_X||{pu:{},ic:{},units:[]};
const {T,E,N,W,M}=window.BL_DEEP_H;
const P=t=>String(t).replace(/<\/?sub>/g,'');
const U=u=>{u.qs=[];u.tools=u.tools||[];u.title=P(u.title);u.lede=P(u.lede);for(const k in u.syl)u.syl[k]=u.syl[k].map(P);u.sections.forEach(s=>s.h=P(s.h));u.prob.title=P(u.prob.title);X.units.push(u)};

/* ---------- Moles and stoichiometry ---------- */
U({id:'pu-mole',title:'The mole and chemical calculations',lede:'Relative masses, the mole, formulas, equations, concentrations and gas volumes: the calculations every other topic depends on.',
 ref:{a:'AS 2',s:'Semester 1, topic 1',i:'Structure 1.4, Reactivity 2.1',j:'Unit 1'},
 syl:{a:['2.1 Relative masses on the carbon-12 scale','2.2 The mole and the Avogadro constant','2.3 Formulas, equations, ionic equations and state symbols','2.3 Empirical and molecular formulas; water of crystallisation','2.4 Reacting masses, yields, gas volumes, concentrations, limiting reagents'],
  s:['Relative masses and the mole','Empirical and molecular formulas','Stoichiometry of reactions in solution and of gases','Limiting reagents and percentage yield'],
  i:['S1.4 The mole, molar mass and the Avogadro constant','S1.4 Empirical and molecular formulas','S1.4 Molar concentration','S1.4 Avogadro’s law','R2.1 Reacting quantities, limiting reactants, yields and atom economy'],
  j:['Laws of chemical combination','Atomic and molecular masses; the mole concept; molar mass','Percentage composition; empirical and molecular formulas','Chemical equations and stoichiometry']},
 sections:[
 {h:'The mole',html:`<p>A <b>mole</b> is the amount of substance containing 6.022 140 76 × 10²³ particles (the Avogadro constant, <i>N</i><sub>A</sub>). The mass of one mole, in grams, is numerically equal to the relative atomic, molecular or formula mass: the <b>molar mass</b>, in g mol⁻¹.</p>
 ${E('n = m ÷ M &nbsp;&nbsp;·&nbsp;&nbsp; number of particles = n × N<sub>A</sub>')}
 ${W('How many oxygen atoms are in 4.40 g of carbon dioxide?',['n(CO₂) = 4.40 ÷ 44.0 = 0.100 mol','Each CO₂ has 2 O atoms: n(O) = 0.200 mol','Atoms = 0.200 × 6.022 × 10²³ = 1.20 × 10²³'])}
 <p><b>Laws of chemical combination</b> (JEE and NEET): mass is conserved in a reaction (Lavoisier); a compound always contains the same elements in the same proportions by mass (definite proportions, Proust); when two elements form more than one compound, the masses of one that combine with a fixed mass of the other are in a simple ratio (multiple proportions, Dalton: CO and CO₂ have oxygen in the ratio 1 : 2); gases react in simple volume ratios (Gay-Lussac); equal volumes of gases at the same temperature and pressure contain equal numbers of molecules (Avogadro).</p>`},
 {h:'Formulas and percentage composition',html:`${W('Find the percentage by mass of nitrogen in ammonium nitrate, NH₄NO₃.',['M = 14 + 4 + 14 + 48 = 80 g mol⁻¹','Mass of N = 28 g per mole','%N = 28 ÷ 80 × 100 = 35%'])}
 ${W('A hydrated salt, CuSO₄·<i>x</i>H₂O, loses 36.1% of its mass on heating to constant mass. Find <i>x</i>.',['Take 100 g: 36.1 g water, 63.9 g CuSO₄.','n(H₂O) = 36.1 ÷ 18.0 = 2.01; n(CuSO₄) = 63.9 ÷ 159.6 = 0.400.','x = 2.01 ÷ 0.400 = 5.0: CuSO₄·5H₂O.'])}
 <p><b>Water of crystallisation</b> is water held in a definite ratio within a crystal lattice. Heating to constant mass (until the mass stops changing) ensures all of it has been removed. A salt with it is <b>hydrated</b>; without it, <b>anhydrous</b>.</p>
 ${T([['nitrate','NO₃⁻'],['carbonate','CO₃²⁻'],['hydrogencarbonate','HCO₃⁻'],['sulfate','SO₄²⁻'],['phosphate','PO₄³⁻'],['hydroxide','OH⁻'],['ammonium','NH₄⁺']],['Ion','Formula'])}`},
 {h:'Reacting masses and limiting reagents',html:`<p>The method for any calculation from an equation: convert what you know to moles; use the mole ratio from the balanced equation; convert back to the quantity asked for.</p>
 ${W('2.00 g of magnesium reacts with 50.0 cm³ of 1.00 mol dm⁻³ HCl. Mg + 2HCl → MgCl₂ + H₂. Which is in excess, and what mass of MgCl₂ forms?',['n(Mg) = 2.00 ÷ 24.3 = 0.0823 mol; n(HCl) = 1.00 × 0.0500 = 0.0500 mol.','HCl needed for all the Mg: 2 × 0.0823 = 0.165 mol. Only 0.0500 is present, so HCl is limiting and Mg is in excess.','n(MgCl₂) = 0.0500 ÷ 2 = 0.0250 mol; mass = 0.0250 × 95.3 = 2.38 g.'])}
 ${E('percentage yield = actual yield ÷ theoretical yield × 100')}
 ${E('atom economy = M<sub>r</sub> of desired product ÷ sum of M<sub>r</sub> of all reactants × 100')}
 <p>Atom economy measures how much of the starting material ends up in the product, even with a 100% yield. Addition reactions have 100% atom economy; substitutions and eliminations always waste some atoms as by-products. It is a key idea in green chemistry.</p>`},
 {h:'Solutions and gas volumes',html:`${E('c = n ÷ V &nbsp;(mol dm⁻³, with V in dm³; 1 dm³ = 1000 cm³)')}
 ${W('25.0 cm³ of sodium hydroxide is neutralised by 21.6 cm³ of 0.100 mol dm⁻³ sulfuric acid. Find [NaOH].',['n(H₂SO₄) = 0.100 × 0.0216 = 2.16 × 10⁻³ mol','2NaOH + H₂SO₄ → Na₂SO₄ + 2H₂O, so n(NaOH) = 4.32 × 10⁻³ mol','c = 4.32 × 10⁻³ ÷ 0.0250 = 0.173 mol dm⁻³'])}
 <p><b>Gas volumes.</b> One mole of any gas occupies the same volume at the same temperature and pressure: 24.0 dm³ at room temperature and pressure (about 20 °C, 1 atm), and 22.7 dm³ at STP as defined by IUPAC (273 K, 100 kPa) or 22.4 dm³ at 273 K and 101.3 kPa. For other conditions use pV = nRT.</p>
 ${W('What volume of oxygen, measured at room temperature and pressure, is needed to burn 0.50 mol of propane? C₃H₈ + 5O₂ → 3CO₂ + 4H₂O',['n(O₂) = 5 × 0.50 = 2.5 mol','V = 2.5 × 24.0 = 60 dm³'])}
 <p>Other concentration units (JEE, NEET, STPM): mass percentage; mole fraction (x = n of one component ÷ total n); molality (m = mol of solute per kg of solvent, which does not change with temperature, unlike molarity); and parts per million for very dilute solutions.</p>
 ${M(['Forgetting to convert cm³ to dm³ (divide by 1000).','Using the wrong mole ratio, or none, when the equation is not 1 : 1.','Rounding too early in multi-step calculations: keep extra figures until the end.'])}`}],
 prob:{title:'Back titration and percentage purity',stem:'A 1.50 g sample of impure calcium carbonate was dissolved in 50.0 cm³ of 1.00 mol dm⁻³ HCl (an excess). The excess acid needed 42.0 cm³ of 0.500 mol dm⁻³ NaOH for neutralisation.',parts:[
  ['Calculate the moles of HCl added and the moles left over after reacting with the carbonate.','Added: 1.00 × 0.0500 = 0.0500 mol. Left over = n(NaOH) = 0.500 × 0.0420 = 0.0210 mol.'],
  ['Find the moles of CaCO₃ in the sample. (CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂)','HCl used by the carbonate = 0.0500 − 0.0210 = 0.0290 mol. n(CaCO₃) = 0.0290 ÷ 2 = 0.0145 mol.'],
  ['Calculate the percentage purity, and explain why a back titration is used here.','Mass = 0.0145 × 100.1 = 1.45 g; purity = 1.45 ÷ 1.50 × 100 = 96.7%. Calcium carbonate is insoluble, so it cannot be titrated directly; it is reacted with a known excess of acid and the leftover acid is titrated.']]}
});

/* ---------- States of matter ---------- */
U({id:'pu-states',title:'States of matter and gases',lede:'The kinetic model, the gas laws, real gases, and the structures of solids, from ionic lattices to giant covalent networks.',
 ref:{a:'AS 4',s:'Semester 2',i:'Structure 1.1, 1.5'},
 syl:{a:['4.1 Gas pressure from collisions; ideal gas assumptions','4.1 pV = nRT, including finding M<sub>r</sub>','4.2 Lattice structures: ionic, simple molecular, giant molecular, metallic','4.2 Predicting and deducing structure and bonding from properties'],
  s:['Kinetic theory and the ideal gas equation','Deviation of real gases from ideal behaviour','Liquids and vapour pressure','Solids: crystalline lattices','Phase diagrams of water and carbon dioxide'],
  i:['S1.1 Elements, compounds and mixtures; separation techniques','S1.1 Kinetic molecular theory and changes of state','S1.1 Kelvin temperature and average kinetic energy','S1.5 Ideal gas model and deviations','S1.5 Gas laws and pV = nRT']},
 sections:[
 {h:'The kinetic model and gas laws',html:`<p>Gas particles move randomly and quickly. Pressure is the force per unit area from their collisions with the walls. An <b>ideal gas</b> assumes the particles have no volume and no forces between them, and that collisions are perfectly elastic.</p>
 ${T([['Boyle','p ∝ 1/V','constant n and T'],['Charles','V ∝ T','constant n and p (T in kelvin)'],['Gay-Lussac','p ∝ T','constant n and V'],['Avogadro','V ∝ n','constant p and T']],['Law','Relationship','Conditions'])}
 ${E('pV = nRT &nbsp;&nbsp; (p in Pa, V in m³, T in K, R = 8.31 J K⁻¹ mol⁻¹)')}
 ${W('0.120 g of a volatile liquid vaporises to give 45.0 cm³ of gas at 100 °C and 101 kPa. Find its M<sub>r</sub>.',['V = 45.0 × 10⁻⁶ m³; p = 101 000 Pa; T = 373 K.','n = pV/RT = (101 000 × 45.0 × 10⁻⁶) ÷ (8.31 × 373) = 1.47 × 10⁻³ mol.','M = 0.120 ÷ 1.47 × 10⁻³ = 81.9 g mol⁻¹.'])}
 ${M(['Using °C instead of K.','Using cm³ or dm³ with R = 8.31: convert to m³ (1 cm³ = 10⁻⁶ m³; 1 dm³ = 10⁻³ m³).','Using kPa with R = 8.31: convert to Pa.'])}`},
 {h:'Real gases',html:`<p>Real gases behave most ideally at <b>high temperature</b> (particles move fast, so attractions matter less) and <b>low pressure</b> (particles are far apart, so their own volume is a tiny fraction of the container).</p>
 <p>They deviate at high pressure, because the molecules’ volume becomes significant, and at low temperature, because attractions pull them together, eventually making them condense. Polar molecules and those with many electrons deviate most. A plot of pV/nRT against pressure is 1 for an ideal gas; for real gases it dips below 1 at moderate pressure (attractions) and rises above 1 at high pressure (molecular volume).</p>
 <p>The <b>van der Waals equation</b> (STPM, JEE): (p + an²/V²)(V − nb) = nRT corrects for both effects: <i>a</i> for attractions and <i>b</i> for molecular volume.</p>`},
 {h:'Liquids, solids and changes of state',html:`<p>Temperature in kelvin is proportional to the average kinetic energy of the particles. During a change of state the temperature stays constant while energy is used to overcome forces between particles.</p>
 ${T([['melting','solid → liquid','endothermic'],['vaporisation','liquid → gas','endothermic'],['sublimation','solid → gas','endothermic'],['freezing','liquid → solid','exothermic'],['condensation','gas → liquid','exothermic'],['deposition','gas → solid','exothermic']],['Change','Direction','Energy'])}
 <p><b>Phase diagrams</b> (STPM): a plot of pressure against temperature shows which state is stable. The lines are where two phases coexist; the <b>triple point</b> is where all three coexist; above the <b>critical point</b> liquid and gas become indistinguishable. Water’s solid–liquid line slopes backwards (to the left), because ice is less dense than water, so pressure lowers its melting point. Carbon dioxide’s triple point is above 1 atm (5.1 atm), so at atmospheric pressure solid CO₂ sublimes.</p>`},
 {h:'Lattice structures',html:`${T([['giant ionic','NaCl, MgO','ions in a 3D lattice','high m.p.; conducts when molten or dissolved; brittle'],['simple molecular','I₂, ice, C₆₀','molecules held by intermolecular forces','low m.p.; does not conduct'],['giant molecular (covalent)','diamond, graphite, SiO₂','atoms joined by covalent bonds throughout','very high m.p.; graphite conducts, the others don’t'],['giant metallic','Cu','cations in delocalised electrons','conducts; malleable; mostly high m.p.']],['Lattice','Examples','Particles and bonding','Properties'])}
 <p><b>Diamond:</b> each C is bonded tetrahedrally to four others; very hard, does not conduct. <b>Graphite:</b> each C bonded to three in flat hexagonal layers; the fourth electron is delocalised, so it conducts along the layers; weak forces between layers let them slide. <b>Silicon dioxide:</b> each Si bonded to four O and each O to two Si, a tetrahedral network like diamond. <b>Ice:</b> each water molecule hydrogen bonded to four others in an open lattice, so it is less dense than liquid water. <b>C₆₀</b>: separate football-shaped molecules held by London forces, so it is a soft, low-melting, molecular solid.</p>
 ${W('Substance Q melts at 1610 °C, does not conduct as a solid or when molten, and is insoluble in water. Deduce its structure.',['A very high melting point rules out simple molecular.','No conductivity when molten rules out ionic and metallic.','Q is a giant covalent (giant molecular) structure, such as SiO₂.'])}`}],
 prob:{title:'A gas and a solid',stem:'Nitrogen dioxide, NO₂, exists in equilibrium with dinitrogen tetroxide, N₂O₄. At 300 K and 100 kPa, 1.00 g of the gas mixture occupies 380 cm³.',parts:[
  ['Calculate the average M<sub>r</sub> of the mixture.','n = pV/RT = (100 000 × 380 × 10⁻⁶) ÷ (8.31 × 300) = 0.01524 mol. M = 1.00 ÷ 0.01524 = 65.6.'],
  ['Explain why this value lies between the M<sub>r</sub> of NO₂ (46.0) and N₂O₄ (92.0).','The sample is a mixture of both, so its average molar mass is between them; 65.6 means a significant fraction is N₂O₄.'],
  ['Suggest why nitrogen dioxide deviates from ideal behaviour more than nitrogen does.','NO₂ is polar and has more electrons, so its intermolecular attractions are stronger; it also dimerises, so the number of particles is not constant.']]}
});

/* ---------- Energetics ---------- */
U({id:'pu-energy',title:'Enthalpy changes and Hess’s law',lede:'Exothermic and endothermic reactions, standard enthalpy changes, calorimetry, bond energies and energy cycles.',
 ref:{a:'AS 5',s:'Semester 2',i:'Reactivity 1.1–1.3',j:'Unit 4'},
 syl:{a:['5.1 Exothermic and endothermic; reaction pathway diagrams','5.1 Standard conditions; ΔH<sub>r</sub>, ΔH<sub>f</sub>, ΔH<sub>c</sub>, ΔH<sub>neut</sub>','5.1 Bond energies: breaking and making bonds','5.1 Calorimetry: q = mcΔT','5.2 Hess’s law and energy cycles'],
  s:['Enthalpy changes of reaction, formation, combustion, neutralisation','Hess’s law','Bond energies','Calorimetry'],
  i:['R1.1 Measuring enthalpy changes; calorimetry','R1.2 Bond enthalpies and Hess’s law','R1.2 (HL) Formation and combustion data','R1.3 Energy from fuels; combustion; fuel cells'],
  j:['System, surroundings, state functions, extensive and intensive properties','First law: work, heat, internal energy, enthalpy, heat capacity','Hess’s law and the enthalpy changes of different processes']},
 sections:[
 {h:'Enthalpy and its signs',html:`<p><b>Enthalpy change</b>, ΔH, is the heat energy transferred at constant pressure. In an <b>exothermic</b> reaction heat is released to the surroundings (ΔH negative; the surroundings warm up). In an <b>endothermic</b> reaction heat is absorbed (ΔH positive; the surroundings cool).</p>
 <p>On a <b>reaction pathway diagram</b>, products are lower than reactants for an exothermic reaction. The hump is the <b>activation energy</b>, E<sub>a</sub>, the minimum energy colliding particles need to react.</p>
 <p>Standard conditions (symbol ⦵): 298 K, 100 kPa (Cambridge uses 101 kPa), concentrations of 1 mol dm⁻³, and every substance in its standard state.</p>
 ${T([['reaction, ΔH<sub>r</sub>','for the molar amounts in the equation as written'],['formation, ΔH<sub>f</sub>','one mole of compound formed from its elements in their standard states; zero for an element'],['combustion, ΔH<sub>c</sub>','one mole of substance burned completely in oxygen; always negative'],['neutralisation, ΔH<sub>neut</sub>','one mole of water formed from acid and base; about −57 kJ mol⁻¹ for strong acid and strong base'],['atomisation, ΔH<sub>at</sub>','one mole of gaseous atoms formed from the element; always positive']],['Standard enthalpy change of','Definition'])}`},
 {h:'Calorimetry',html:`${E('q = mcΔT &nbsp;&nbsp;·&nbsp;&nbsp; ΔH = −q ÷ n')}
 ${W('Burning 0.600 g of ethanol heats 200 g of water from 20.0 °C to 39.5 °C. Find ΔH<sub>c</sub> of ethanol (c = 4.18 J g⁻¹ K⁻¹).',['q = 200 × 4.18 × 19.5 = 16 300 J = 16.3 kJ','n(ethanol) = 0.600 ÷ 46.0 = 0.0130 mol','ΔH<sub>c</sub> = −16.3 ÷ 0.0130 = −1250 kJ mol⁻¹. The data-book value is −1367: heat is lost to the surroundings and to the calorimeter, and combustion is incomplete.'])}
 <p>For reactions in solution, use the mass of the solution (assume 1 g per cm³) and the moles of the limiting reactant. Extrapolating a temperature–time graph back to the moment of mixing corrects for heat lost during the reaction.</p>`},
 {h:'Hess’s law',html:`<p><b>Hess’s law:</b> the enthalpy change of a reaction is independent of the route taken, provided the starting and finishing conditions are the same. So enthalpy changes that cannot be measured directly can be calculated from ones that can.</p>
 ${E('ΔH<sub>r</sub> = ΣΔH<sub>f</sub>(products) − ΣΔH<sub>f</sub>(reactants)')}
 ${E('ΔH<sub>r</sub> = ΣΔH<sub>c</sub>(reactants) − ΣΔH<sub>c</sub>(products)')}
 ${W('Find ΔH<sub>f</sub> of methane from ΔH<sub>c</sub>: C −394, H₂ −286, CH₄ −890 kJ mol⁻¹.',['Target: C + 2H₂ → CH₄.','ΔH<sub>f</sub> = ΣΔH<sub>c</sub>(reactants) − ΣΔH<sub>c</sub>(products) = [−394 + 2(−286)] − (−890)','= −966 + 890 = −76 kJ mol⁻¹ (data value −75).'])}
 ${W('Find ΔH for the thermal decomposition of CaCO₃, using the enthalpy changes with HCl: CaCO₃ + 2HCl, ΔH₁ = −15 kJ mol⁻¹; CaO + 2HCl, ΔH₂ = −195 kJ mol⁻¹.',['Cycle: CaCO₃ → CaO + CO₂ (target); both go to CaCl₂ + H₂O (+ CO₂) with HCl.','ΔH = ΔH₁ − ΔH₂ = −15 − (−195) = +180 kJ mol⁻¹.'])}`},
 {h:'Bond energies',html:`<p>Breaking bonds needs energy (endothermic); forming bonds releases energy (exothermic).</p>
 ${E('ΔH ≈ Σ(bond energies broken) − Σ(bond energies formed)')}
 ${W('Estimate ΔH for H₂ + Cl₂ → 2HCl (H–H 436, Cl–Cl 242, H–Cl 431 kJ mol⁻¹).',['Broken: 436 + 242 = 678','Formed: 2 × 431 = 862','ΔH = 678 − 862 = −184 kJ mol⁻¹'])}
 <p>Values from bond energies are approximate, because most tables give <b>average</b> bond energies, measured across many compounds, and they apply only to gases. An <b>exact</b> bond energy (such as H–H or H–Cl) is for one specific molecule.</p>`},
 {h:'Thermodynamics: the first law',only:'jn',html:`<p>A <b>system</b> is the part being studied; the <b>surroundings</b> are everything else. Open systems exchange matter and energy, closed systems energy only, isolated systems neither. <b>State functions</b> (U, H, S, G, p, V, T) depend only on the state, not the path; heat and work are path functions. <b>Extensive</b> properties depend on the amount (mass, V, U, H); <b>intensive</b> do not (T, p, density).</p>
 ${E('ΔU = q + w &nbsp;(first law; w = −p<sub>ext</sub>ΔV for expansion)')}
 ${E('ΔH = ΔU + Δn<sub>g</sub>RT')}
 <p>For an isothermal reversible expansion of an ideal gas, w = −2.303 nRT log(V₂/V₁) and ΔU = 0. Heat capacity C = q/ΔT; C<sub>p</sub> − C<sub>v</sub> = R for one mole of an ideal gas. A bomb calorimeter measures ΔU (constant volume); a coffee-cup calorimeter measures ΔH (constant pressure).</p>
 ${W('For C(graphite) + O₂(g) → CO₂(g), ΔU = −393.5 kJ mol⁻¹. Find ΔH.',['Δn<sub>g</sub> = 1 − 1 = 0, so ΔH = ΔU = −393.5 kJ mol⁻¹.','For C₃H₈ + 5O₂ → 3CO₂ + 4H₂O(l), Δn<sub>g</sub> = 3 − 6 = −3, so ΔH = ΔU − 3RT, about 7.4 kJ mol⁻¹ more negative.'])}`},
 {h:'Fuels',only:'i',html:`<p>Fuels release energy on combustion. <b>Specific energy</b> is the energy released per kilogram; <b>energy density</b> is per cubic metre. Hydrogen has the highest specific energy but a very low energy density as a gas.</p>
 ${T([['fossil fuels (coal, oil, gas)','high energy density; established technology','non-renewable; CO₂ and pollutants'],['biofuels (ethanol, biodiesel)','renewable; carbon released was recently absorbed by plants','land use; lower energy density'],['hydrogen (fuel cells)','only water as product','storage; most hydrogen still made from methane']],['Fuel','Advantages','Disadvantages'])}
 <p>A <b>fuel cell</b> converts chemical energy directly into electrical energy. In a hydrogen–oxygen fuel cell, H₂ is oxidised at the anode and O₂ reduced at the cathode; in acid electrolyte the half-equations are H₂ → 2H⁺ + 2e⁻ and O₂ + 4H⁺ + 4e⁻ → 2H₂O.</p>`}],
 prob:{title:'Enthalpy of neutralisation',stem:'50.0 cm³ of 2.00 mol dm⁻³ HCl at 21.0 °C is mixed with 50.0 cm³ of 2.00 mol dm⁻³ NaOH, also at 21.0 °C. The highest temperature reached is 34.4 °C.',parts:[
  ['Calculate the heat released. (Assume 1.00 g cm⁻³ and c = 4.18 J g⁻¹ K⁻¹.)','q = 100 × 4.18 × 13.4 = 5600 J = 5.60 kJ.'],
  ['Calculate ΔH<sub>neut</sub>.','n(H₂O) = 0.100 mol. ΔH = −5.60 ÷ 0.100 = −56.0 kJ mol⁻¹.'],
  ['Explain why ethanoic acid gives a less negative value.','Ethanoic acid is a weak acid. Some energy is used to ionise it fully during neutralisation, so less heat is released overall.']]}
});

/* ---------- Lattice energy, entropy and Gibbs energy ---------- */
U({id:'pu-lattice',title:'Lattice energy, entropy and Gibbs energy',lede:'Born–Haber cycles, hydration and solution enthalpies, entropy, and using Gibbs energy to decide whether a reaction is feasible.',
 ref:{a:'A Level 23',s:'Semester 2',i:'Reactivity 1.2 (HL), 1.4 (HL)',j:'Unit 4'},
 syl:{a:['23.1 Atomisation, lattice energy, electron affinity; Born–Haber cycles','23.1 Effect of ionic charge and radius on lattice energy','23.2 Hydration and solution enthalpies; their energy cycle','23.3 Entropy and predicting the sign of ΔS','23.4 ΔG = ΔH − TΔS and feasibility'],
  s:['Born–Haber cycle and lattice energy','Enthalpy changes of hydration and solution','Entropy and Gibbs free energy'],
  i:['R1.2 (HL) Born–Haber cycles','R1.4 (HL) Entropy','R1.4 (HL) Gibbs energy and spontaneity','R1.4 (HL) ΔG = −RT ln K'],
  j:['Second law: spontaneity and entropy','Gibbs energy change and the criterion for spontaneity','ΔG° and the equilibrium constant']},
 sections:[
 {h:'Lattice energy and the Born–Haber cycle',html:`<p><b>Lattice energy</b> (ΔH<sub>latt</sub>) is the enthalpy change when one mole of an ionic compound forms from its gaseous ions: Na⁺(g) + Cl⁻(g) → NaCl(s), ΔH = −787 kJ mol⁻¹. It is always exothermic, and its size measures the strength of the ionic bonding. (Some textbooks, including NCERT, define it the other way, as the energy to separate the lattice, which is positive: check which definition your syllabus uses.)</p>
 <p>It cannot be measured directly, so it is calculated with a <b>Born–Haber cycle</b>, a Hess cycle linking ΔH<sub>f</sub> to the steps of forming gaseous ions:</p>
 ${E('ΔH<sub>f</sub> = ΔH<sub>at</sub>(metal) + IE + ΔH<sub>at</sub>(non-metal) + EA + ΔH<sub>latt</sub>')}
 ${W('Calculate ΔH<sub>latt</sub> of NaCl. Data (kJ mol⁻¹): ΔH<sub>f</sub> −411; ΔH<sub>at</sub>(Na) +107; IE₁(Na) +496; ΔH<sub>at</sub>(Cl) +122; EA₁(Cl) −349.',['−411 = 107 + 496 + 122 − 349 + ΔH<sub>latt</sub>','−411 = 376 + ΔH<sub>latt</sub>','ΔH<sub>latt</sub> = −787 kJ mol⁻¹'])}
 <p>For MgCl₂, include IE₁ + IE₂ of Mg, and twice the atomisation and electron affinity of chlorine. For MgO, include both the first (exothermic) and second (endothermic) electron affinities of oxygen.</p>
 <p><b>Size of lattice energy:</b> more exothermic for higher ionic charges and smaller ions. MgO (−3791) &gt; NaF (−923) &gt; NaCl (−787) &gt; KCl (−711).</p>`},
 {h:'Dissolving: hydration and solution enthalpies',html:`<p>The <b>enthalpy change of hydration</b>, ΔH<sub>hyd</sub>, is the enthalpy change when one mole of gaseous ions dissolves in water to give an infinitely dilute solution. It is always exothermic, and more so for smaller, more highly charged ions (Mg²⁺ −1921, Na⁺ −406, K⁺ −322 kJ mol⁻¹).</p>
 <p>The <b>enthalpy change of solution</b>, ΔH<sub>sol</sub>, is for one mole of solid dissolving. They are linked by a cycle:</p>
 ${E('ΔH<sub>sol</sub> = −ΔH<sub>latt</sub> + ΣΔH<sub>hyd</sub>')}
 ${W('Find ΔH<sub>sol</sub> of NaCl: ΔH<sub>latt</sub> −787; ΔH<sub>hyd</sub> Na⁺ −406, Cl⁻ −378.',['ΔH<sub>sol</sub> = +787 + (−406 − 378) = +3 kJ mol⁻¹','Slightly endothermic, yet NaCl dissolves readily: entropy drives it.'])}`},
 {h:'Entropy',html:`<p><b>Entropy</b>, S, measures the number of ways the particles and their energy can be arranged: roughly, how spread out or disordered a system is. Units: J K⁻¹ mol⁻¹. Every substance above 0 K has positive entropy.</p>
 <ul><li>Gases have much higher entropy than liquids, and liquids higher than solids. So ΔS is positive for melting, boiling and sublimation.</li>
 <li>ΔS is positive when a reaction makes more moles of gas, when a solid dissolves, and when temperature rises.</li></ul>
 ${E('ΔS = ΣS(products) − ΣS(reactants)')}
 ${W('Find ΔS for N₂ + 3H₂ → 2NH₃. S (J K⁻¹ mol⁻¹): N₂ 192, H₂ 131, NH₃ 193.',['ΔS = 2(193) − [192 + 3(131)] = 386 − 585 = −199 J K⁻¹ mol⁻¹','Negative, as expected: 4 moles of gas become 2.'])}`},
 {h:'Gibbs energy and feasibility',html:`${E('ΔG = ΔH − TΔS &nbsp;(make ΔS kJ K⁻¹ mol⁻¹ before combining)')}
 <p>A reaction is <b>feasible</b> (spontaneous) when ΔG is negative. Feasible does not mean fast: the activation energy may be so high that nothing happens at room temperature.</p>
 ${T([['−','+','always negative','feasible at all temperatures'],['+','−','always positive','never feasible'],['−','−','negative at low T','feasible below T = ΔH/ΔS'],['+','+','negative at high T','feasible above T = ΔH/ΔS']],['ΔH','ΔS','ΔG','Feasibility'])}
 ${W('Above what temperature is CaCO₃ → CaO + CO₂ feasible? ΔH = +178 kJ mol⁻¹, ΔS = +161 J K⁻¹ mol⁻¹.',['Feasible when ΔG &lt; 0, i.e. T &gt; ΔH/ΔS.','T = 178 ÷ 0.161 = 1106 K (about 830 °C).'])}
 <p><b>ΔG and equilibrium</b> (IB HL, JEE, NEET): ΔG° = −RT ln K. A negative ΔG° gives K &gt; 1. At equilibrium ΔG = 0.</p>
 ${M(['Forgetting to convert ΔS from J to kJ, which makes TΔS 1000 times too big.','Using °C for T.','Saying a reaction with negative ΔG will happen quickly.'])}`}],
 prob:{title:'Magnesium oxide and its stability',stem:'Data (kJ mol⁻¹): ΔH<sub>f</sub>(MgO) −602; ΔH<sub>at</sub>(Mg) +148; IE₁ + IE₂(Mg) +2189; ΔH<sub>at</sub>(O) +249; EA₁(O) −141; EA₂(O) +798.',parts:[
  ['Calculate the lattice energy of MgO.','−602 = 148 + 2189 + 249 − 141 + 798 + ΔH<sub>latt</sub>; −602 = 3243 + ΔH<sub>latt</sub>; ΔH<sub>latt</sub> = −3845 kJ mol⁻¹.'],
  ['Explain why the second electron affinity of oxygen is endothermic.','The electron is added to O⁻, which is already negative, so energy is needed to overcome the repulsion.'],
  ['Explain why the lattice energy of MgO is much more exothermic than that of NaCl.','Mg²⁺ and O²⁻ carry double the charges of Na⁺ and Cl⁻, and are smaller, so the electrostatic attraction between them is much stronger.']]}
});

/* ---------- Redox ---------- */
U({id:'pu-redox',title:'Redox reactions and oxidation numbers',lede:'Oxidation numbers, oxidising and reducing agents, disproportionation and balancing redox equations.',
 ref:{a:'AS 6',s:'Semester 2',i:'Reactivity 3.2',j:'Unit 7'},
 syl:{a:['6.1 Calculating oxidation numbers','6.1 Balancing equations using changes in oxidation number','6.1 Oxidation, reduction and disproportionation','6.1 Oxidising and reducing agents; Roman numerals'],
  s:['Oxidation numbers and redox equations','Balancing half-equations'],
  i:['R3.2 Oxidation states and half-equations','R3.2 Activity series of metals','R3.2 Oxidation of alcohols and reduction of carbonyls'],
  j:['Oxidation and reduction; oxidation number','Balancing redox reactions']},
 sections:[
 {h:'Oxidation numbers',html:`<p><b>Oxidation</b> is loss of electrons or an increase in oxidation number; <b>reduction</b> is gain of electrons or a decrease in oxidation number ("OIL RIG"). Rules for assigning oxidation numbers:</p>
 <ol><li>An uncombined element is 0 (Na, O₂, S₈).</li><li>A simple ion has its charge (Na⁺ +1, Cl⁻ −1).</li><li>The oxidation numbers in a compound add up to 0; in an ion, to its charge.</li><li>F is always −1; O is −2 (except in peroxides, −1, and OF₂, +2); H is +1 (except in metal hydrides such as NaH, −1); group 1 metals +1, group 2 +2.</li></ol>
 ${W('Find the oxidation number of Cr in K₂Cr₂O₇ and of S in S₄O₆²⁻.',['K₂Cr₂O₇: 2(+1) + 2x + 7(−2) = 0, so x = +6.','S₄O₆²⁻: 4x + 6(−2) = −2, so x = +2.5. A fractional value is an average: two S atoms are +5 and two are 0.'])}
 <p>Names use Roman numerals for the oxidation number: iron(III) chloride, FeCl₃; potassium manganate(VII), KMnO₄; sodium chlorate(I), NaClO.</p>`},
 {h:'Balancing redox equations',html:`<p><b>Half-equation method</b> (acid solution): balance the atoms other than O and H; balance O by adding H₂O; balance H by adding H⁺; balance charge by adding electrons. Then multiply the half-equations so the electrons cancel, and add.</p>
 ${W('Balance Cr₂O₇²⁻ + Fe²⁺ → Cr³⁺ + Fe³⁺ (acid).',['Reduction: Cr₂O₇²⁻ + 14H⁺ + 6e⁻ → 2Cr³⁺ + 7H₂O','Oxidation: Fe²⁺ → Fe³⁺ + e⁻ (× 6)','Overall: Cr₂O₇²⁻ + 14H⁺ + 6Fe²⁺ → 2Cr³⁺ + 6Fe³⁺ + 7H₂O'])}
 <p><b>Oxidation number method:</b> find the total increase and decrease in oxidation number and choose coefficients to make them equal. In basic solution, balance as for acid, then add OH⁻ to both sides to turn H⁺ into water.</p>
 ${T([['MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O','purple → colourless'],['Cr₂O₇²⁻ + 14H⁺ + 6e⁻ → 2Cr³⁺ + 7H₂O','orange → green'],['H₂O₂ + 2H⁺ + 2e⁻ → 2H₂O','oxidising agent'],['C₂O₄²⁻ → 2CO₂ + 2e⁻','reducing agent (ethanedioate)'],['2S₂O₃²⁻ → S₄O₆²⁻ + 2e⁻','thiosulfate in iodine titrations'],['I₂ + 2e⁻ → 2I⁻','brown → colourless']],['Half-equation','Notes'])}`},
 {h:'Agents and disproportionation',html:`<p>An <b>oxidising agent</b> causes oxidation by taking electrons, and is itself reduced. A <b>reducing agent</b> gives electrons and is itself oxidised. In Zn + Cu²⁺ → Zn²⁺ + Cu, Cu²⁺ is the oxidising agent and Zn the reducing agent.</p>
 <p>In <b>disproportionation</b>, the same element is both oxidised and reduced. Chlorine in cold dilute alkali: Cl₂ + 2NaOH → NaCl + NaClO + H₂O (0 → −1 and +1). Copper(I) in water: 2Cu⁺ → Cu + Cu²⁺.</p>
 <p><b>Activity series</b> (IB): K &gt; Na &gt; Ca &gt; Mg &gt; Al &gt; Zn &gt; Fe &gt; Pb &gt; H &gt; Cu &gt; Ag &gt; Au. A metal displaces a less reactive metal from a solution of its ions, and metals above hydrogen displace H₂ from dilute acids.</p>
 ${M(['Saying the oxidising agent is oxidised. It is reduced.','Forgetting that H₂O₂ can act as both an oxidising and a reducing agent.','Leaving electrons in the final equation.'])}`}],
 prob:{title:'Iron tablets by redox titration',stem:'An iron tablet weighing 0.500 g was dissolved in dilute sulfuric acid. The Fe²⁺ solution needed 18.2 cm³ of 0.0200 mol dm⁻³ KMnO₄.',parts:[
  ['Write the ionic equation for the reaction.','MnO₄⁻ + 8H⁺ + 5Fe²⁺ → Mn²⁺ + 5Fe³⁺ + 4H₂O.'],
  ['Calculate the moles of Fe²⁺ in the tablet.','n(MnO₄⁻) = 0.0200 × 0.0182 = 3.64 × 10⁻⁴ mol. n(Fe²⁺) = 5 × 3.64 × 10⁻⁴ = 1.82 × 10⁻³ mol.'],
  ['Find the percentage of iron by mass in the tablet, and say how the end point is seen.','Mass Fe = 1.82 × 10⁻³ × 55.8 = 0.102 g; 20.3%. The end point is the first permanent pale pink colour from excess MnO₄⁻; no indicator is needed.']]}
});

/* ---------- Electrochemistry ---------- */
U({id:'pu-electro',title:'Electrochemistry',lede:'Electrode potentials, electrochemical cells, the Nernst equation, electrolysis and Faraday’s laws, batteries and fuel cells.',
 ref:{a:'A Level 24',s:'Semester 2',i:'Reactivity 3.2',j:'Unit 7'},
 syl:{a:['24.1 Electrolysis: products, F = Le, Q = It, masses and volumes','24.2 Standard electrode and cell potentials; the standard hydrogen electrode','24.2 Feasibility and redox equations from E°','24.2 Effect of concentration; the Nernst equation','24.2 ΔG° = −nE°F'],
  s:['Half-cells and standard electrode potentials','Electrochemical cells and cell notation','Electrolysis and Faraday’s laws','Nernst equation'],
  i:['R3.2 Primary (voltaic) and electrolytic cells','R3.2 Secondary cells','R3.2 (HL) Standard electrode potentials','R3.2 (HL) ΔG° = −nFE°','R3.2 (HL) Electrolysis of aqueous solutions; electroplating'],
  j:['Electrolytic and metallic conduction; conductance and molar conductivity','Kohlrausch’s law','Electrochemical cells; electrode potentials; EMF; Nernst equation','ΔG and EMF; dry cell, lead accumulator and fuel cells']},
 sections:[
 {h:'Electrode potentials',html:`<p>A metal dipped in a solution of its ions sets up an equilibrium, such as Zn²⁺(aq) + 2e⁻ ⇌ Zn(s). The potential difference this creates cannot be measured alone, only against a reference: the <b>standard hydrogen electrode</b> (H₂ at 100 kPa bubbling over platinum in 1 mol dm⁻³ H⁺ at 298 K), defined as 0.00 V.</p>
 <p>The <b>standard electrode potential</b>, E°, of a half-cell is its potential measured against the standard hydrogen electrode under standard conditions. Values are written as reductions:</p>
 ${T([['Li⁺ + e⁻ ⇌ Li','−3.04'],['Zn²⁺ + 2e⁻ ⇌ Zn','−0.76'],['Fe²⁺ + 2e⁻ ⇌ Fe','−0.44'],['2H⁺ + 2e⁻ ⇌ H₂','0.00'],['Cu²⁺ + 2e⁻ ⇌ Cu','+0.34'],['I₂ + 2e⁻ ⇌ 2I⁻','+0.54'],['Fe³⁺ + e⁻ ⇌ Fe²⁺','+0.77'],['Ag⁺ + e⁻ ⇌ Ag','+0.80'],['Cl₂ + 2e⁻ ⇌ 2Cl⁻','+1.36'],['MnO₄⁻ + 8H⁺ + 5e⁻ ⇌ Mn²⁺ + 4H₂O','+1.51'],['F₂ + 2e⁻ ⇌ 2F⁻','+2.87']],['Half-equation','E° / V'])}
 <p>The more positive E°, the more easily the left-hand species is reduced: it is a stronger oxidising agent. The more negative E°, the more easily the right-hand species is oxidised: a stronger reducing agent. For ions in solution with two oxidation states (Fe³⁺/Fe²⁺), the electrode is platinum.</p>`},
 {h:'Cells and feasibility',html:`${E('E°<sub>cell</sub> = E°(positive electrode, reduction) − E°(negative electrode, oxidation)')}
 ${W('Can acidified dichromate oxidise Fe²⁺ to Fe³⁺? E°: Cr₂O₇²⁻/Cr³⁺ +1.33 V; Fe³⁺/Fe²⁺ +0.77 V.',['Dichromate is reduced (higher E°), Fe²⁺ oxidised.','E°<sub>cell</sub> = 1.33 − 0.77 = +0.56 V. Positive, so the reaction is feasible.'])}
 <p>A positive E°<sub>cell</sub> shows a reaction is feasible under standard conditions, but, as with ΔG, it may still be too slow to observe. In the cell, electrons flow through the wire from the negative electrode (oxidation, the anode) to the positive electrode (reduction, the cathode); the salt bridge (filter paper soaked in KNO₃) completes the circuit with ions and does not react.</p>
 <p><b>Cell notation:</b> Zn(s) | Zn²⁺(aq) || Cu²⁺(aq) | Cu(s), with the oxidation on the left, the salt bridge as ||, and phase boundaries as |.</p>
 ${E('ΔG° = −nFE°<sub>cell</sub> &nbsp;(F = 96 500 C mol⁻¹)')}`},
 {h:'The Nernst equation',only:'asjn',html:`<p>Electrode potentials change with concentration. For a half-cell at 298 K:</p>
 ${E('E = E° + (0.059 ÷ z) log([oxidised form] ÷ [reduced form])')}
 ${W('Find E for Cu²⁺/Cu with [Cu²⁺] = 0.010 mol dm⁻³.',['E = 0.34 + (0.059 ÷ 2) log(0.010) = 0.34 + 0.0295 × (−2)','E = 0.34 − 0.059 = +0.28 V.'])}
 <p>Qualitatively (Le Chatelier): increasing the concentration of the oxidised form pushes the equilibrium towards reduction, making E more positive. A <b>concentration cell</b> uses the same half-cell at two concentrations: Cu | Cu²⁺(0.01) || Cu²⁺(1.0) | Cu has E = 0.059 V.</p>
 <p>For a whole cell (JEE, NEET): E<sub>cell</sub> = E°<sub>cell</sub> − (0.059/n) log Q, and at equilibrium E<sub>cell</sub> = 0, so log K = nE°/0.059.</p>`},
 {h:'Electrolysis and Faraday’s laws',html:`<p>In electrolysis, a direct current drives a non-spontaneous reaction. Cations go to the negative cathode and are reduced; anions go to the positive anode and are oxidised.</p>
 ${T([['molten NaCl','Na','Cl₂'],['concentrated NaCl(aq)','H₂','Cl₂'],['dilute NaCl(aq)','H₂','O₂ (mostly)'],['CuSO₄(aq), carbon electrodes','Cu','O₂'],['CuSO₄(aq), copper electrodes','Cu deposits','Cu dissolves (purification, electroplating)'],['dilute H₂SO₄','H₂','O₂']],['Electrolyte','At the cathode','At the anode'])}
 <p>In aqueous solution, the product at each electrode depends on E° values (the more easily reduced species is discharged at the cathode), on concentration (concentrated Cl⁻ gives Cl₂ rather than O₂), and on the electrode material.</p>
 ${E('Q = It &nbsp;&nbsp;·&nbsp;&nbsp; F = L × e = 96 500 C mol⁻¹')}
 ${W('What mass of copper is deposited by 0.500 A for 1 hour?',['Q = 0.500 × 3600 = 1800 C','n(e⁻) = 1800 ÷ 96 500 = 0.01865 mol','Cu²⁺ + 2e⁻ → Cu: n(Cu) = 0.00933 mol; mass = 0.00933 × 63.5 = 0.592 g'])}
 <p><b>Finding the Avogadro constant</b> (Cambridge): electrolyse copper sulfate with copper electrodes, measure the current, time and mass lost by the anode, then L = (charge passed ÷ moles of electrons) ÷ charge on one electron.</p>`},
 {h:'Conductance of solutions',only:'jns',html:`<p>The resistance of a solution is measured with a conductivity cell (AC, to avoid electrolysis). Conductance G = 1/R; conductivity κ = G × (l/A), where l/A is the cell constant; molar conductivity Λ<sub>m</sub> = κ ÷ c.</p>
 <ul><li><b>Strong electrolytes</b> (KCl): Λ<sub>m</sub> rises slowly as concentration falls, linearly with √c (Debye–Hückel–Onsager): Λ<sub>m</sub> = Λ°<sub>m</sub> − A√c.</li>
 <li><b>Weak electrolytes</b> (CH₃COOH): Λ<sub>m</sub> rises steeply at low concentration, because the degree of dissociation increases. Their limiting value cannot be found by extrapolation.</li></ul>
 <p><b>Kohlrausch’s law:</b> at infinite dilution, each ion contributes independently: Λ°<sub>m</sub> = ν₊λ°₊ + ν₋λ°₋. This lets you find Λ°<sub>m</sub> for a weak electrolyte from strong ones: Λ°(CH₃COOH) = Λ°(CH₃COONa) + Λ°(HCl) − Λ°(NaCl). Then the degree of dissociation α = Λ<sub>m</sub> ÷ Λ°<sub>m</sub>, and K<sub>a</sub> = cα² ÷ (1 − α).</p>`},
 {h:'Batteries and fuel cells',only:'ijns',html:`${T([['dry (Leclanché) cell','zinc case (anode); MnO₂ with carbon rod (cathode); NH₄Cl/ZnCl₂ paste','about 1.5 V; primary (not rechargeable)'],['lead–acid accumulator','Pb anode, PbO₂ cathode, H₂SO₄ electrolyte; both form PbSO₄ on discharge','about 2 V per cell; secondary (rechargeable)'],['lithium-ion','Li in graphite anode; metal oxide cathode','about 3.7 V; rechargeable; light'],['hydrogen–oxygen fuel cell','H₂ oxidised at anode, O₂ reduced at cathode','continuous supply of fuel; only water produced']],['Cell','Chemistry','Notes'])}
 <p>Rusting is an electrochemical process: at anodic areas Fe → Fe²⁺ + 2e⁻; at cathodic areas O₂ + 2H₂O + 4e⁻ → 4OH⁻. Galvanising (a zinc coating) protects iron sacrificially, because zinc is more easily oxidised.</p>`}],
 prob:{title:'A silver–copper cell',stem:'A cell is made from Ag⁺/Ag (E° = +0.80 V) and Cu²⁺/Cu (E° = +0.34 V) half-cells under standard conditions.',parts:[
  ['Calculate E°<sub>cell</sub> and write the overall equation.','E°<sub>cell</sub> = 0.80 − 0.34 = +0.46 V. 2Ag⁺ + Cu → 2Ag + Cu²⁺.'],
  ['State the direction of electron flow in the external circuit.','From the copper electrode (oxidation, negative) to the silver electrode (reduction, positive).'],
  ['Calculate ΔG° for the reaction and comment on its sign.','ΔG° = −nFE° = −2 × 96 500 × 0.46 = −88.8 kJ mol⁻¹. Negative, so the reaction is feasible.']]}
});
})();
