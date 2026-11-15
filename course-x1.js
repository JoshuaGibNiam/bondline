/* Bondline version 31: extra course questions, part 1 (atoms, orbitals, ionisation energy, bonding, shapes, intermolecular forces).
   Loaded before app.js, which appends these to the end of each unit, so existing question ids never change.
   A question's first option is the right answer (options are shuffled when shown).
   only: which courses see an item (a = A Level, s = STPM, p = AP, i = IB, j = JEE, n = NEET). No only = every course.
   xp: exam-style written questions. fmt picks the label for each course: struct, essay, data, nvt (JEE numerical value), frq-long, frq-short, olymp.
   Each part is [question, mark-scheme answer, marks]. */
(function(){
const X=window.BL_COURSE_X=window.BL_COURSE_X||{pu:{},ic:{},units:[]};
const Q=(prompt,opts,why,only)=>only?{prompt,opts,why,only}:{prompt,opts,why};

X.pu['pu-atom']={qs:[
 Q('Relative atomic mass is measured relative to:',['One-twelfth of the mass of a carbon-12 atom','The mass of a hydrogen atom','One-sixteenth of the mass of an oxygen-16 atom','The mass of a proton'],'The carbon-12 scale: one atom of ¹²C has a mass of exactly 12 units.'),
 Q('Which ion has the same number of electrons as an argon atom?',['K⁺','Na⁺','Ne','Cl'],'K has 19 electrons, so K⁺ has 18, the same as Ar. A Cl atom has only 17.'),
 Q('A particle has 12 protons, 12 neutrons and 10 electrons. What is it?',['²⁴Mg²⁺','²⁴Mg','²²Ne','²⁴Na⁺'],'12 protons makes it magnesium; mass number 12 + 12 = 24; two fewer electrons than protons gives a 2+ charge.'),
 Q('Which pair are isotopes?',['³⁵Cl and ³⁷Cl','O₂ and O₃','⁴⁰Ar and ⁴⁰Ca','H₂O and D₂O'],'Isotopes are atoms of the same element with different numbers of neutrons. O₂ and O₃ are allotropes; ⁴⁰Ar and ⁴⁰Ca are different elements.'),
 Q('Copper is 69.2% ⁶³Cu and 30.8% ⁶⁵Cu. What is its relative atomic mass?',['63.6','64.0','63.4','64.4'],'(63 × 69.2 + 65 × 30.8) ÷ 100 = 63.6'),
 Q('Gallium (Aᵣ = 69.7) consists of ⁶⁹Ga and ⁷¹Ga. What percentage is ⁶⁹Ga?',['65%','35%','50%','70%'],'69x + 71(1 − x) = 69.7, so 2x = 1.3 and x = 0.65.'),
 Q('Beams of ¹H⁺ and ²H⁺ ions with the same speed pass through an electric field. Compared with ¹H⁺, the deflection of ²H⁺ is:',['Half as large, in the same direction','Twice as large, in the same direction','The same','Half as large, in the opposite direction'],'Deflection is proportional to charge ÷ mass. Both are +1, but ²H⁺ has twice the mass.'),
 Q('Which ion has the smallest radius?',['Al³⁺','Mg²⁺','Na⁺','F⁻'],'All four have 10 electrons. Al³⁺ has the most protons (13), so it pulls the electrons in most tightly.'),
 Q('Why is a Cl⁻ ion larger than a Cl atom?',['The extra electron increases repulsion between the electrons, with no extra nuclear charge','Cl⁻ has more protons','Cl⁻ has an extra electron shell','The nucleus of Cl⁻ is smaller'],'Same 17 protons, 18 electrons instead of 17: more repulsion, so the electron cloud expands.'),
 Q('How many protons, neutrons and electrons are in one ⁵⁶Fe³⁺ ion?',['26, 30, 23','26, 30, 26','23, 30, 26','26, 56, 23'],'Fe has 26 protons; 56 − 26 = 30 neutrons; a 3+ ion has 26 − 3 = 23 electrons.'),
 Q('In the mass spectrum of an element, what does the height of each peak show?',['The relative abundance of that isotope','The mass of that isotope','The charge on the ion','The number of neutrons in the isotope'],'The position on the m/e axis gives the mass; the height gives how common that isotope is.'),
 Q('Chlorine is 75% ³⁵Cl and 25% ³⁷Cl. Ignoring other isotopes of hydrogen, what is the ratio of the peak heights for H³⁵Cl⁺ (m/e 36) and H³⁷Cl⁺ (m/e 38)?',['3 : 1','1 : 1','9 : 1','1 : 3'],'Each HCl molecule contains one Cl atom, so the ratio is simply 75 : 25.'),
 Q('Which species is isoelectronic with N³⁻, O²⁻ and F⁻?',['Na⁺','K⁺','Cl⁻','S²⁻'],'All have 10 electrons (the neon configuration). K⁺, Cl⁻ and S²⁻ have 18.'),
 Q('Which pair are isobars?',['⁴⁰Ar and ⁴⁰Ca','¹²C and ¹³C','³⁵Cl and ³⁷Cl','O₂ and O₃'],'Isobars have the same mass number but different atomic numbers.','jn')],
xp:[
 {only:'asip',fmt:'struct',title:'Isotopes of chlorine and bromine',stem:'Chlorine has two stable isotopes, ³⁵Cl and ³⁷Cl. The relative atomic mass of chlorine is 35.5.',parts:[
  ['State how atoms of the two isotopes differ, in terms of sub-atomic particles, and explain why they have the same chemical properties.','³⁷Cl has two more neutrons (20) than ³⁵Cl (18) [1]. Both have 17 protons and 17 electrons in the same configuration, and chemical reactions involve electrons [1].',2],
  ['Calculate the percentage abundance of ³⁵Cl.','35x + 37(100 − x) = 3550 [1], so 2x = 150 and x = 75% [1].',2],
  ['The mass spectrum of Cl₂ has peaks at m/e 70, 72 and 74. Use your answer to (b) to show why their heights are in the ratio 9 : 6 : 1.','P(³⁵Cl) = 0.75 and P(³⁷Cl) = 0.25 [1]. ³⁵Cl³⁵Cl = 0.75² = 0.5625; ³⁵Cl³⁷Cl = 2 × 0.75 × 0.25 = 0.375 (it can form two ways round); ³⁷Cl³⁷Cl = 0.25² = 0.0625 [1]. 0.5625 : 0.375 : 0.0625 = 9 : 6 : 1 [1].',3],
  ['Bromine is 50.7% ⁷⁹Br and 49.3% ⁸¹Br. Calculate its relative atomic mass to one decimal place.','(79 × 50.7 + 81 × 49.3) ÷ 100 = 79.986 = 80.0 [1].',1]]},
 {only:'j',fmt:'nvt',title:'Atomic structure: integer answers',stem:'Give each answer as an integer.',parts:[
  ['The number of neutrons in one ⁵⁶Fe³⁺ ion.','30 (56 − 26; the charge does not change the nucleus).',4],
  ['The total number of electrons in one SO₄²⁻ ion.','16 + 4 × 8 + 2 = 50.',4],
  ['An element is 20% of mass 10 and 80% of mass 11. Ten times its average atomic mass is:','Average = 10.8, so the answer is 108.',4],
  ['The total number of electrons in one NH₄⁺ ion.','7 + 4 − 1 = 10.',4]]}]};

X.pu['pu-orb']={qs:[
 Q('What is the electronic configuration of a chromium atom (Z = 24)?',['[Ar] 3d⁵ 4s¹','[Ar] 3d⁴ 4s²','[Ar] 3d⁶','[Ar] 4s² 4p⁴'],'A half-filled 3d sub-shell is more stable, so one 4s electron moves into 3d.'),
 Q('What is the electronic configuration of a copper atom (Z = 29)?',['[Ar] 3d¹⁰ 4s¹','[Ar] 3d⁹ 4s²','[Ar] 3d¹⁰ 4p¹','[Ar] 3d⁸ 4s² 4p¹'],'A full 3d¹⁰ sub-shell is more stable than 3d⁹ 4s².'),
 Q('Which electrons are lost first when iron forms Fe²⁺?',['The two 4s electrons','Two 3d electrons','One 4s and one 3d electron','Two 3p electrons'],'Once 3d is occupied, the 4s electrons are the outermost and highest in energy, so they are removed first: Fe²⁺ is [Ar] 3d⁶.'),
 Q('How many unpaired electrons are in a Mn²⁺ ion (Mn: Z = 25)?',['5','3','7','2'],'Mn²⁺ is [Ar] 3d⁵: one electron in each of the five 3d orbitals.'),
 Q('Which occupied sub-shell has the highest energy in a potassium atom?',['4s','3d','3p','4p'],'K is [Ar] 4s¹. The 3d and 4p sub-shells are empty.'),
 Q('Which element has the configuration 1s² 2s² 2p⁶ 3s² 3p³?',['Phosphorus','Nitrogen','Sulfur','Arsenic'],'2 + 2 + 6 + 2 + 3 = 15 electrons: phosphorus.'),
 Q('Which ion has the configuration 1s² 2s² 2p⁶?',['Na⁺','K⁺','Cl⁻','Li⁺'],'Na⁺ has 10 electrons. K⁺ and Cl⁻ have 18; Li⁺ has 2.'),
 Q('What is the maximum number of electrons in a 4f sub-shell?',['14','10','7','18'],'Seven f orbitals, each holding two electrons.'),
 Q('Which statement describes an s orbital?',['It is spherical and holds up to two electrons of opposite spin','It is dumbbell-shaped and holds up to six electrons','It is spherical and holds up to eight electrons','It has a nodal plane through the nucleus'],'Every orbital holds at most two electrons. s orbitals are spherical.'),
 Q('Which species has the same electronic configuration as argon?',['S²⁻','Cl','Na⁺','Ca'],'S has 16 electrons; S²⁻ has 18. Ca is [Ar] 4s².'),
 Q('How many electrons with l = 1 are there in a sulfur atom?',['10','4','6','16'],'l = 1 means p electrons: 2p⁶ + 3p⁴ = 10.','jn'),
 Q('How many angular nodes does a d orbital have?',['2','1','0','3'],'The number of angular nodes equals l, and l = 2 for d.','jn'),
 Q('Which orbital has n = 4 and l = 2?',['4d','4p','4f','2d'],'l = 0, 1, 2, 3 correspond to s, p, d, f.','jn'),
 Q('Which statement is the Pauli exclusion principle?',['No two electrons in an atom can have the same set of four quantum numbers','Electrons fill the lowest-energy orbitals first','Electrons occupy degenerate orbitals singly before pairing','Position and momentum cannot both be known exactly'],'So each orbital holds at most two electrons, with opposite spins. The others are the aufbau principle, Hund’s rule and the uncertainty principle.','jn')],
xp:[
 {only:'asip',fmt:'struct',title:'Electrons in period 4',stem:'This question is about the electronic configurations of the first-row transition elements and their ions.',parts:[
  ['Write the full electronic configuration of a vanadium atom, V (Z = 23).','1s² 2s² 2p⁶ 3s² 3p⁶ 3d³ 4s² [1].',1],
  ['Write the electronic configuration of V³⁺ and state the number of unpaired electrons.','1s² 2s² 2p⁶ 3s² 3p⁶ 3d² [1]. Two unpaired electrons, in separate 3d orbitals with parallel spins [1].',2],
  ['Explain why chromium is [Ar] 3d⁵ 4s¹ rather than [Ar] 3d⁴ 4s².','The 3d and 4s sub-shells are very close in energy [1]; with one electron in each 3d orbital, there is less repulsion between paired electrons, so 3d⁵ 4s¹ is more stable [1].',2],
  ['Sketch the shape of a 2p orbital. State how many 2p orbitals there are and how they are arranged.','A dumbbell with two lobes either side of the nucleus [1]. Three: 2pₓ, 2p_y and 2p_z, at right angles to each other [1].',2]]},
 {only:'j',fmt:'nvt',title:'Orbitals and quantum numbers: integer answers',stem:'Give each answer as an integer.',parts:[
  ['The number of unpaired electrons in Fe³⁺ (Fe: Z = 26).','Fe³⁺ is [Ar] 3d⁵, so 5.',4],
  ['The total number of orbitals in the shell with n = 4.','n² = 16.',4],
  ['The maximum number of spectral lines when electrons in a sample of hydrogen atoms fall from n = 4 to n = 1.','n(n − 1)/2 = 4 × 3 ÷ 2 = 6.',4],
  ['The number of radial nodes in a 4s orbital.','n − l − 1 = 4 − 0 − 1 = 3.',4]]}]};

X.pu['pu-ie']={qs:[
 Q('Which equation represents the second ionisation energy of magnesium?',['Mg⁺(g) → Mg²⁺(g) + e⁻','Mg(g) → Mg²⁺(g) + 2e⁻','Mg(s) → Mg⁺(g) + e⁻','Mg⁺(aq) → Mg²⁺(aq) + e⁻'],'Each ionisation energy removes one electron from a gaseous ion or atom.'),
 Q('The first four ionisation energies of an element are 738, 1451, 7733 and 10 541 kJ mol⁻¹. Which group is it in?',['2','1','3','14'],'The big jump comes after the second electron, so there are two outer electrons.'),
 Q('Which element has the lowest first ionisation energy?',['Caesium','Lithium','Sodium','Helium'],'Down group 1 the outer electron is further away and more shielded.'),
 Q('Why is the first ionisation energy of oxygen lower than that of nitrogen?',['In oxygen, two electrons share a 2p orbital and repel each other','Oxygen has fewer protons','Oxygen’s outer electron is in a higher shell','Nitrogen has a full 2p sub-shell'],'N is 2p³ (one electron per orbital); O is 2p⁴, with one paired orbital.'),
 Q('Why does first ionisation energy generally increase across period 3?',['Nuclear charge increases while shielding stays about the same','Atomic radius increases','A new shell is added for each element','The outer electrons are further from the nucleus'],'Electrons are added to the same shell, so the extra protons pull them in more tightly.'),
 Q('Which factor does not affect the first ionisation energy of an atom?',['The number of neutrons in the nucleus','The nuclear charge','The distance of the outer electron from the nucleus','Shielding by inner electrons'],'Neutrons have no charge, so isotopes have the same ionisation energies.'),
 Q('Which period 3 element has a higher first ionisation energy than both of its neighbours?',['Phosphorus','Silicon','Sulfur','Aluminium'],'P (half-filled 3p) is higher than Si and S. Al is lower than Mg; S is lower than P.'),
 Q('An element has successive ionisation energies of 496, 4562, 6910 and 9543 kJ mol⁻¹. Which group is it in?',['1','2','3','17'],'The jump comes after the first electron: one outer electron.'),
 Q('Which element has the largest second ionisation energy?',['Sodium','Magnesium','Aluminium','Silicon'],'For sodium, the second electron comes from the full 2p sub-shell, close to the nucleus with little shielding.'),
 Q('A graph of log(ionisation energy) against the number of electrons removed for potassium shows how many large jumps?',['3','4','2','19'],'K is 2, 8, 8, 1. There is a jump each time a new, inner shell is started: after electrons 1, 9 and 17.'),
 Q('Why does helium have the highest first ionisation energy of any element?',['Its electrons are in the first shell, close to the nucleus, with no shielding','It has the most protons','It has a full outer shell of eight electrons','Its electrons are paired in a p orbital'],'Two protons pull on 1s electrons with no inner electrons to shield them.'),
 Q('Between which pair does first ionisation energy decrease from the first element to the second?',['Mg → Al','Al → Si','Si → P','Na → Mg'],'Al’s outer electron is in 3p, which is higher in energy than 3s.'),
 Q('Which is the most electronegative element?',['Fluorine','Oxygen','Chlorine','Nitrogen'],'Fluorine has a value of 4.0 on the Pauling scale: small atom, high effective nuclear charge.','jn'),
 Q('Which order of first ionisation enthalpy is correct?',['B < C < O < N','B < C < N < O','C < B < N < O','O < N < C < B'],'B 801, C 1086, O 1314, N 1402 kJ mol⁻¹: oxygen dips below nitrogen.','jn')],
xp:[
 {only:'asip',fmt:'struct',title:'First ionisation energies across period 3',stem:'First ionisation energies (kJ mol⁻¹): Na 496, Mg 738, Al 578, Si 787, P 1012, S 1000, Cl 1251, Ar 1521.',parts:[
  ['Define the first ionisation energy of an element.','The energy needed to remove one electron from each atom in one mole of gaseous atoms [1], to form one mole of gaseous 1+ ions [1].',2],
  ['Explain the general increase across the period.','Nuclear charge increases [1]; electrons are added to the same shell, so shielding is similar and the atoms get smaller, so the outer electron is held more strongly [1].',2],
  ['Explain why aluminium has a lower first ionisation energy than magnesium.','Al’s outer electron is in a 3p orbital, which is higher in energy than 3s [1], and is partly shielded by the 3s electrons [1].',2],
  ['Explain why sulfur has a lower first ionisation energy than phosphorus.','In S, the electron removed is from a 3p orbital that holds two electrons [1]; repulsion between the paired electrons makes it easier to remove [1].',2],
  ['Predict how the first ionisation energy of potassium compares with that of sodium, and explain.','Lower [1]: the outer electron is in the 4s orbital, further from the nucleus and more shielded.',1]]},
 {only:'j',fmt:'nvt',title:'Ionisation energy: integer answers',stem:'Give each answer as an integer.',parts:[
  ['Element X has successive ionisation energies of 800, 2427, 3660, 25 026 and 32 827 kJ mol⁻¹. How many valence electrons does X have?','The jump comes after the third electron, so 3 (X is boron).',4],
  ['How many period 2 elements have a higher first ionisation energy than oxygen?','N, F and Ne: 3.',4],
  ['How many unpaired electrons are in a gaseous nitrogen atom?','2p³, one in each orbital: 3.',4]]}]};

X.pu['pu-bond']={qs:[
 Q('How many lone pairs of electrons are there in a CO₂ molecule?',['4','2','0','6'],'O=C=O: each oxygen has two lone pairs and carbon has none.'),
 Q('Which compound contains both ionic and covalent bonds?',['NaOH','NaCl','H₂O','MgO'],'Na⁺ and OH⁻ are held by ionic bonds; O and H within OH⁻ share a covalent bond.'),
 Q('In Al₂Cl₆, how are the two AlCl₃ units joined?',['By coordinate bonds from Cl lone pairs to Al atoms','By ionic bonds','By hydrogen bonds','By metallic bonding'],'Al in AlCl₃ has only six outer electrons, so it accepts a lone pair from a Cl on the other unit.'),
 Q('Why does magnesium have a higher melting point than sodium?',['Mg²⁺ ions are smaller and more highly charged, and each atom gives two electrons to the delocalised sea','Mg has more electron shells','Mg forms covalent bonds','Mg is less dense'],'Stronger attraction between the cations and the delocalised electrons.'),
 Q('Which describes the bonding in sodium chloride?',['Electrostatic attraction between oppositely charged ions in a giant lattice','Shared pairs of electrons','Delocalised electrons around positive ions','Hydrogen bonds between molecules'],'NaCl is a giant ionic lattice of Na⁺ and Cl⁻ ions.'),
 Q('Which molecule contains a triple bond?',['N₂','O₂','Cl₂','CO₂'],'N≡N. O₂ has a double bond, Cl₂ a single bond, and CO₂ two double bonds.'),
 Q('Which ion is the most polarising?',['Al³⁺','Na⁺','Mg²⁺','K⁺'],'Polarising power rises with charge density: Al³⁺ is small with a 3+ charge.'),
 Q('Which property is typical of an ionic compound?',['It conducts electricity when molten but not when solid','It conducts electricity when solid','It has a low melting point','It never dissolves in water'],'The ions are fixed in the solid lattice but free to move when molten or dissolved.'),
 Q('How many electrons are shared between the two atoms in an O₂ molecule?',['4','2','6','8'],'O=O is a double bond: two shared pairs.'),
 Q('Which is the most electronegative element in period 3?',['Chlorine','Sodium','Sulfur','Phosphorus'],'Electronegativity increases across a period as nuclear charge rises.'),
 Q('Why does graphite conduct electricity?',['Each carbon uses three electrons in bonds; the fourth is delocalised across its layer','Its layers are held together by ionic bonds','It contains free ions','Each carbon forms four covalent bonds'],'The delocalised electrons can move along the layers.'),
 Q('In which molecule does the central atom have fewer than eight outer electrons?',['BeCl₂','CH₄','NH₃','H₂O'],'Be forms two bonds and has only four outer electrons.'),
 Q('What is the formal charge on nitrogen in NH₄⁺?',['+1','0','−1','+2'],'Valence electrons 5 − non-bonding 0 − ½ × bonding 8 = +1.','pijn'),
 Q('Which compound has the largest lattice energy?',['MgO','NaCl','KCl','CaO'],'Highest charges (2+, 2−) and the smallest ions.','jn')],
xp:[
 {only:'asip',fmt:'struct',title:'Bonding and melting points',stem:'Magnesium oxide, MgO, and silicon dioxide, SiO₂, both have very high melting points, but chlorine, Cl₂, is a gas at room temperature.',parts:[
  ['Draw a dot-and-cross diagram for magnesium oxide, showing outer electrons only.','Mg²⁺ with no outer electrons, in brackets with a 2+ charge [1]; O²⁻ with eight outer electrons (six dots and two crosses), in brackets with a 2− charge [1].',2],
  ['Explain, in terms of structure and bonding, why MgO has a high melting point.','A giant ionic lattice [1]; strong electrostatic attractions between Mg²⁺ and O²⁻ ions act in all directions and need a lot of energy to overcome [1].',2],
  ['Explain why SiO₂ has a high melting point but does not conduct electricity when molten.','Giant covalent structure: many strong Si–O covalent bonds must be broken [1]. It has no ions or delocalised electrons that can move [1].',2],
  ['State the type of bonding within a Cl₂ molecule and explain why chlorine is a gas at room temperature.','A covalent bond (a shared pair of electrons) [1]; only weak London forces act between the molecules [1].',2]]},
 {only:'j',fmt:'nvt',title:'Chemical bonding: integer answers',stem:'Give each answer as an integer.',parts:[
  ['The number of lone pairs on the central xenon atom in XeF₄.','Xe has 8 outer electrons; 4 are used in bonds, leaving 2 lone pairs.',4],
  ['The total number of σ bonds in a benzene molecule, C₆H₆.','6 C–C + 6 C–H = 12.',4],
  ['The number of electrons around the central sulfur atom in SF₆.','Six bonding pairs: 12.',4],
  ['The number of coordinate bonds in [Cu(NH₃)₄]²⁺.','Each NH₃ donates one lone pair: 4.',4]]}]};

X.pu['pu-shape']={qs:[
 Q('What is the shape of SF₄?',['See-saw','Tetrahedral','Square planar','Trigonal pyramidal'],'Four bonding pairs and one lone pair; the lone pair sits in an equatorial position.'),
 Q('What is the bond angle in a water molecule?',['104.5°','109.5°','107°','120°'],'Two lone pairs squeeze the tetrahedral angle down by about 5°.'),
 Q('What is the shape of XeF₄?',['Square planar','Tetrahedral','See-saw','Octahedral'],'Four bonding pairs and two lone pairs, with the lone pairs opposite each other.'),
 Q('What is the shape of the NH₄⁺ ion?',['Tetrahedral','Trigonal pyramidal','Square planar','Trigonal planar'],'Four bonding pairs and no lone pairs.'),
 Q('What is the H–N–H bond angle in ammonia?',['107°','109.5°','104.5°','120°'],'One lone pair reduces the tetrahedral angle by about 2.5°.'),
 Q('Which molecule is linear?',['BeCl₂','H₂O','SO₂','O₃'],'Two bonding pairs and no lone pairs on Be. The others are bent.'),
 Q('What is the shape of the carbonate ion, CO₃²⁻?',['Trigonal planar','Trigonal pyramidal','Tetrahedral','T-shaped'],'Three areas of electron density around C, and no lone pair.'),
 Q('What is the hybridisation of carbon in methane?',['sp³','sp²','sp','sp³d'],'Four σ bonds pointing to the corners of a tetrahedron.'),
 Q('Which molecule is polar?',['CHCl₃','CCl₄','BF₃','CO₂'],'In CHCl₃ the bond dipoles don’t cancel. The other three are symmetrical.'),
 Q('Why is the bond angle in water smaller than in methane?',['Lone pairs repel more strongly than bonding pairs','Oxygen is more electronegative than carbon','Water has fewer bonds','Hydrogen bonding pulls the H atoms together'],'Lone pair–lone pair repulsion > lone pair–bond pair > bond pair–bond pair.'),
 Q('What is the shape of SF₆?',['Octahedral','Hexagonal planar','Trigonal bipyramidal','Square pyramidal'],'Six bonding pairs, all angles 90°.'),
 Q('What is the shape of BrF₅?',['Square pyramidal','Trigonal bipyramidal','Octahedral','See-saw'],'Five bonding pairs and one lone pair.'),
 Q('What is the hybridisation of sulfur in SF₆?',['sp³d²','sp³d','sp³','dsp²'],'Six hybrid orbitals point to the corners of an octahedron.','jn'),
 Q('Which molecule has a zero dipole moment?',['BF₃','NH₃','H₂O','SO₂'],'Trigonal planar BF₃ is symmetrical, so the B–F dipoles cancel.','jn')],
xp:[
 {only:'asip',fmt:'struct',title:'Shapes of molecules',stem:'VSEPR theory predicts the shape of a molecule from the number of electron pairs around its central atom.',parts:[
  ['State the number of bonding pairs and lone pairs around phosphorus in PCl₃, and name its shape.','3 bonding pairs and 1 lone pair [1]; trigonal pyramidal [1].',2],
  ['Suggest the Cl–P–Cl bond angle in PCl₃ and explain why it is less than 109.5°.','About 107° (accept 100–108°) [1]. The lone pair repels more strongly than the bonding pairs, pushing the bonds closer together [1].',2],
  ['PCl₅ is trigonal bipyramidal. State the two different bond angles in the molecule.','90° and 120° [1].',1],
  ['Explain why CO₂ is non-polar even though each C=O bond is polar.','The molecule is linear (symmetrical) [1], so the two equal bond dipoles point in opposite directions and cancel [1].',2],
  ['Describe the bonding in ethene in terms of orbital overlap.','Each carbon is sp² hybridised [1]. σ bonds form by end-on overlap of sp² orbitals with each other and with hydrogen 1s orbitals [1]. The π bond forms by sideways overlap of the unhybridised p orbitals, above and below the plane of the molecule [1].',3]]},
 {only:'j',fmt:'nvt',title:'Shapes and hybridisation: integer answers',stem:'Give each answer as an integer.',parts:[
  ['The number of lone pairs on the central chlorine atom in ClF₃.','Cl has 7 outer electrons; 3 are used in bonds, leaving 4 electrons, so 2 lone pairs.',4],
  ['The number of 90° F–S–F bond angles in SF₆.','Each of the six F atoms is at 90° to four others: 6 × 4 ÷ 2 = 12.',4],
  ['The number of π bonds in HC≡C–CH=CH₂.','Two in the triple bond and one in the double bond: 3.',4]]}]};

X.pu['pu-imf']={qs:[
 Q('Which hydrogen halide has the highest boiling point?',['HF','HCl','HBr','HI'],'HF forms hydrogen bonds. The others rely on dipole–dipole and London forces.'),
 Q('Why does HI have a higher boiling point than HCl?',['HI has more electrons, so its London forces are stronger','HI is more polar','HI forms hydrogen bonds','The H–I bond is stronger'],'HCl is more polar, but the much larger electron cloud of HI gives stronger London forces.'),
 Q('Which intermolecular forces act between propanone molecules?',['Permanent dipole–dipole forces and London forces','Hydrogen bonds only','London forces only','Ionic bonds'],'The C=O bond is polar, but there is no H on O, so no hydrogen bonds between propanone molecules.'),
 Q('Which compound is the most soluble in water?',['Ethanol','Hexane','Chloroethane','Ethyl ethanoate'],'Ethanol forms hydrogen bonds with water.'),
 Q('Which describes a hydrogen bond?',['Attraction between a δ+ H bonded to N, O or F and a lone pair on another N, O or F','A covalent bond to a hydrogen atom','Attraction between any H atom and any other atom','The bond in an H₂ molecule'],'It needs a very polar H–N, H–O or H–F bond and a small, electronegative atom with a lone pair.'),
 Q('In ice, how many hydrogen bonds does each water molecule form?',['4','2','1','3'],'Two through its H atoms and two through its lone pairs, arranged tetrahedrally.'),
 Q('Which has the strongest London forces between its molecules?',['I₂','Br₂','Cl₂','F₂'],'I₂ has the most electrons. It is a solid at room temperature.'),
 Q('Why does pentane boil at a higher temperature than propane?',['It has more electrons and a larger surface area of contact','It is polar','It forms hydrogen bonds','It has stronger covalent bonds'],'Stronger London forces between the longer molecules.'),
 Q('Which compound cannot form hydrogen bonds between its own molecules?',['CH₃OCH₃','CH₃OH','NH₃','HF'],'In an ether, all the hydrogens are bonded to carbon.'),
 Q('Why is ammonia very soluble in water?',['It forms hydrogen bonds with water molecules','It is non-polar','It is ionic','It has strong London forces'],'NH₃ both donates and accepts hydrogen bonds with water.'),
 Q('Which explains the high surface tension of water?',['Strong hydrogen bonding between the molecules','London forces only','The strength of its covalent O–H bonds','Its low density'],'Molecules at the surface are pulled inwards by hydrogen bonds.'),
 Q('Which substance forms a simple molecular solid?',['Iodine','Diamond','Sodium chloride','Silicon dioxide'],'I₂ molecules are held in the solid only by London forces.'),
 Q('Which liquid has the highest vapour pressure at 25 °C?',['Diethyl ether','Water','Ethanol','Propan-1-ol'],'Weakest intermolecular forces (no hydrogen bonding between ether molecules), so the most molecules escape.','pi'),
 Q('Which solid is a network covalent solid?',['Diamond','Iodine','Ice','Copper'],'Every atom is covalently bonded into one giant structure.','pi')],
xp:[
 {only:'asip',fmt:'struct',title:'Boiling points of small molecules',stem:'Boiling points: ethane −89 °C, fluoromethane −78 °C, propane −42 °C, methanol 65 °C.',parts:[
  ['Name the strongest type of intermolecular force between molecules of (i) methanol and (ii) fluoromethane.','(i) Hydrogen bonds [1]. (ii) Permanent dipole–permanent dipole forces: there is no H bonded to F [1].',2],
  ['Draw a diagram to show a hydrogen bond between two methanol molecules. Include partial charges and the lone pair involved.','δ+ on H and δ− on O of an O–H group [1]; a dashed line from that H to a lone pair on the O of the other molecule, with O–H···O close to 180° [1].',2],
  ['Explain why propane has a higher boiling point than ethane.','Propane has more electrons [1], so stronger London (instantaneous dipole–induced dipole) forces that need more energy to overcome [1].',2],
  ['Methanol mixes with water in all proportions, but propane is almost insoluble. Explain.','Methanol forms hydrogen bonds with water molecules [1]. Propane cannot, and the weak forces it would form with water could not make up for breaking hydrogen bonds between water molecules [1].',2]]},
 {only:'j',fmt:'nvt',title:'Intermolecular forces: integer answers',stem:'Give each answer as an integer.',parts:[
  ['In ice, each water molecule is hydrogen bonded to how many others?','4',4],
  ['How many of these form hydrogen bonds between their own molecules: CH₃OH, CH₃OCH₃, NH₃, CH₄, HF, CH₃F, HCOOH?','CH₃OH, NH₃, HF and HCOOH: 4.',4]]}]};
})();
