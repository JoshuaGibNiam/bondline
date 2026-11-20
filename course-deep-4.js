/* Bondline version 37: deeper lessons, part 4 (amino acids, polymers, synthesis, spectroscopy, purification, biomolecules, named reactions).
   Format as in course-deep-1.js. */
(function(){
const D=window.BL_DEEP=window.BL_DEEP||{};
const {T,E,N,W,M}=window.BL_DEEP_H;

/* ---------- Amino acids and proteins ---------- */
D['pu-amino']=[
 {h:'Amino acids at different pH',after:'Zwitterions and the isoelectric point',html:`${T([['low pH (acid)','⁺H₃N–CHR–COOH','+1','towards the cathode (−)'],['isoelectric point','⁺H₃N–CHR–COO⁻','0','does not move'],['high pH (alkali)','H₂N–CHR–COO⁻','−1','towards the anode (+)']],['Solution','Form of the amino acid','Overall charge','In electrophoresis moves'])}
 <p>Amino acids are <b>amphoteric</b>: the –COO⁻ group accepts H⁺ in acid, and the –NH₃⁺ group donates H⁺ in alkali. That makes amino acid solutions act as buffers. Side chains with extra acidic or basic groups shift the isoelectric point: aspartic acid (side chain –CH₂COOH) has pI about 2.8, lysine (side chain –(CH₂)₄NH₂) about 9.7.</p>
 ${W('A mixture of glycine (pI 6.0), lysine (pI 9.7) and aspartic acid (pI 2.8) undergoes electrophoresis in a buffer at pH 6.0. Predict where each ends up.',['At pH 6.0 glycine is at its pI: no charge, stays near the start.','Lysine: pH below its pI, so it is protonated, positive, and moves to the cathode.','Aspartic acid: pH above its pI, so it is negative and moves to the anode.'])}
 <p>The distance moved also depends on size: small ions with a high charge travel furthest. Colourless amino acids are located afterwards by spraying with ninhydrin, which turns them purple.</p>`},
 {h:'Hydrolysis of peptides and protein structure',after:'Peptides and proteins',html:`<p>Peptide bonds are amides, so they are hydrolysed by heating under reflux with 6 mol dm⁻³ HCl for several hours (or by enzymes called proteases). The products are the individual amino acids (as their ammonium salts in acid), which can then be separated and identified by chromatography or electrophoresis.</p>
 ${T([['primary','the sequence of amino acids','covalent peptide bonds'],['secondary','α-helix and β-pleated sheet','hydrogen bonds between C=O and N–H of the backbone'],['tertiary','overall 3D folding of the chain','interactions between side chains: hydrogen bonds, ionic bonds, disulfide bridges (–S–S–), hydrophobic interactions'],['quaternary','several chains together (haemoglobin has four)','the same kinds of interaction as tertiary']],['Level','What it describes','Held by'])}
 <p>Heat, extreme pH or heavy-metal ions disrupt the weaker interactions and the protein unfolds: it is <b>denatured</b>. Cooking an egg denatures its albumin. The primary structure survives, but the shape and function are lost. Enzymes depend on a precisely shaped active site, which is why they work only within narrow ranges of temperature and pH.</p>`}
];

/* ---------- Polymers ---------- */
D['pu-poly']=[
 {h:'Deducing repeat units and monomers',after:'Addition polymers',html:`${W('Draw the repeat unit of poly(propene).',['Propene is CH₂=CHCH₃. The C=C opens and each carbon bonds to a neighbouring monomer.','Repeat unit: –CH₂–CH(CH₃)–, with the CH₃ as a side group, not in the main chain.'])}
 ${W('A section of an addition polymer is –CH₂–CHCl–CH₂–CHCl–CH₂–CHCl–. Name the monomer.',['Every two carbons of the backbone came from one C=C.','The repeat unit is –CH₂–CHCl–, so the monomer is CH₂=CHCl, chloroethene: the polymer is PVC.'])}
 ${W('A polymer has the repeat unit –CO(CH₂)₄CO–NH(CH₂)₆NH–. Identify the monomers and the type of polymerisation.',['The –CO–NH– link is an amide: a polyamide, made by condensation polymerisation.','Split each amide link and add –OH to the C=O and –H to the N–H: hexanedioic acid HOOC(CH₂)₄COOH and hexane-1,6-diamine H₂N(CH₂)₆NH₂.','This is nylon-6,6. Using the dioyl chloride ClOC(CH₂)₄COCl instead releases HCl rather than water.'])}
 ${M(['Writing the repeat unit of an addition polymer with a C=C still in it.','Putting side groups (CH₃, Cl, C₆H₅) into the main chain.','Forgetting the continuation bonds at each end of a repeat unit.'])}`},
 {h:'Polyesters, polyamides and proteins compared',after:'Condensation polymers',html:`${T([['Terylene (PET)','ethane-1,2-diol + benzene-1,4-dicarboxylic acid','ester','bottles, clothing fibres'],['nylon-6,6','hexane-1,6-diamine + hexanedioic acid','amide','ropes, clothing'],['Kevlar','benzene-1,4-diamine + benzene-1,4-dicarbonyl chloride','amide','body armour, tyres'],['proteins','α-amino acids','amide (peptide)','enzymes, structure'],['poly(lactic acid)','2-hydroxypropanoic acid (lactic acid)','ester','biodegradable packing, stitches']],['Polymer','Monomer(s)','Link','Uses'])}
 <p>Kevlar is exceptionally strong because its chains are rigid and straight (the benzene rings are joined at the 1,4-positions), so they line up in sheets held by many hydrogen bonds between the amide groups.</p>
 <p>Polyesters and polyamides contain polar C=O groups that water and enzymes can attack, so unlike poly(alkene)s they can be <b>hydrolysed</b>: by acid or alkali in the lab, and slowly in the environment. That makes them biodegradable, though often very slowly.</p>`},
 {h:'Plastics and the environment',after:'Disposal and degradable polymers',html:`<ul><li><b>Photodegradable</b> polymers contain C=O groups that absorb UV light and break the chain. They must be exposed to sunlight, so they don’t degrade when buried in landfill.</li>
 <li><b>Recycling</b> saves resources but needs plastics sorted by type; resin identification codes 1–7 (1 PET, 2 HDPE, 3 PVC, 4 LDPE, 5 PP, 6 PS, 7 other) help.</li>
 <li><b>Incineration</b> recovers energy but releases CO₂, and burning PVC releases HCl, which must be removed by scrubbing the waste gases with a base.</li>
 <li><b>Bioplastics</b> such as poly(lactic acid) are made from renewable starch and can be composted industrially.</li></ul>
 <p>Atom economy differs: addition polymerisation has 100% atom economy (everything ends up in the polymer); condensation polymerisation loses a small molecule at every link.</p>`}
];

/* ---------- Organic synthesis ---------- */
D['pu-synth']=[
 {h:'Worked syntheses',after:'Planning a route',html:`${W('Make 2-hydroxypropanoic acid (lactic acid) from ethanol.',['Target: CH₃CH(OH)COOH, three carbons. Ethanol has two, so one carbon must be added: use HCN.','Step 1: oxidise ethanol to ethanal (acidified K₂Cr₂O₇, distil).','Step 2: HCN with KCN, warm: ethanal → 2-hydroxypropanenitrile, CH₃CH(OH)CN.','Step 3: hydrolyse the nitrile with dilute HCl under reflux → CH₃CH(OH)COOH.','The product is racemic, because CN⁻ attacked the planar C=O from both sides equally.'])}
 ${W('Make ethyl ethanoate using ethanol as the only organic starting material.',['You need both ethanoic acid and ethanol.','Oxidise part of the ethanol fully: excess acidified K₂Cr₂O₇, reflux → ethanoic acid.','Heat ethanoic acid with more ethanol and a little concentrated H₂SO₄ under reflux → ethyl ethanoate.'])}
 ${W('Make N-phenylethanamide (an amide) from benzene.',['Nitrate benzene (conc. HNO₃, conc. H₂SO₄, below 55 °C) → nitrobenzene.','Reduce (Sn, conc. HCl, reflux; then NaOH) → phenylamine.','React with ethanoyl chloride at room temperature → C₆H₅NHCOCH₃ + HCl.'])}`},
 {h:'Analysing a given route',after:'Worked syntheses',only:'a',html:`<p>Questions often give you a route and ask about it. For each step, be ready to state:</p>
 <ul><li>the <b>type of reaction</b>: addition, substitution, elimination, oxidation, reduction, hydrolysis or condensation, and for mechanisms, the attacking species (nucleophilic, electrophilic, free-radical);</li>
 <li>the <b>reagents and conditions</b>, including the solvent (aqueous or ethanolic NaOH) and temperature;</li>
 <li>any <b>by-products</b>, such as HCl from acyl chlorides, water from esterification, NaBr from substitution;</li>
 <li>whether a <b>chiral centre</b> is formed and whether the product will be racemic.</li></ul>
 ${N('Yield over several steps','Yields multiply. Three steps of 80%, 70% and 90% give 0.8 × 0.7 × 0.9 = 50% overall. Shorter routes are almost always better.')}`},
 {h:'Identifying functional groups from reactions',after:'Worked syntheses',html:`${T([['fizzes with Na','–OH (alcohol, phenol, acid)'],['fizzes with Na₂CO₃ or NaHCO₃','–COOH'],['decolourises bromine water','C=C (or phenol, with white precipitate)'],['orange precipitate with 2,4-DNPH','C=O in an aldehyde or ketone'],['silver mirror (Tollens’) or red precipitate (Fehling’s)','–CHO'],['orange to green with acidified K₂Cr₂O₇','primary or secondary alcohol, or aldehyde'],['yellow precipitate with alkaline I₂','CH₃CO– or CH₃CH(OH)–'],['steamy fumes with PCl₅','–OH'],['precipitate with AgNO₃(aq) in ethanol, warm','halogenoalkane (white Cl, cream Br, yellow I)'],['violet colour with neutral FeCl₃','phenol']],['Observation','Shows'])}`}
];

/* ---------- Analysis and spectroscopy ---------- */
D['pu-spec']=[
 {h:'Using the M+1 and M+2 peaks',after:'Mass spectrometry',html:`<p>About 1.1% of carbon atoms are carbon-13. A molecule with <i>n</i> carbons is <i>n</i> × 1.1% likely to contain one, so the small M+1 peak, one unit to the right of M⁺, tells you the number of carbons:</p>
 ${E('number of carbon atoms = (height of M+1 ÷ height of M⁺) × (100 ÷ 1.1)')}
 ${W('M⁺ is at m/z 72 (height 45.0) and M+1 at 73 (height 2.0). How many carbons, and what could the compound be?',['n = (2.0 ÷ 45.0) × (100 ÷ 1.1) = 4.0, so four carbons.','4 C account for 48 of the 72. A C₄H₈O formula (48 + 8 + 16 = 72) fits: for example butanone or butanal.'])}
 <p>The M+2 peak shows chlorine or bromine: a compound with one Cl has M and M+2 in the ratio 3 : 1; one Br, about 1 : 1. Two Cl atoms give M, M+2 and M+4 in the ratio 9 : 6 : 1.</p>`},
 {h:'Reading a ¹H NMR spectrum in full',after:'Proton (¹H) NMR',html:`<p>Four pieces of information, in this order:</p>
 <ol><li><b>Number of peaks:</b> the number of different proton environments.</li>
 <li><b>Chemical shift:</b> what each environment is next to.</li>
 <li><b>Integration</b> (peak area or the integration trace): the relative number of H in each environment.</li>
 <li><b>Splitting</b> (the n + 1 rule): a peak is split into n + 1 lines by n equivalent H on the neighbouring carbon(s). Doublet = 1 neighbour, triplet = 2, quartet = 3.</li></ol>
 ${W('C₃H₆O₂ shows three peaks: δ 1.1 (3H, triplet), δ 2.3 (2H, quartet), δ 11.7 (1H, singlet). Identify it.',['δ 11.7, 1H, singlet: a carboxylic acid –COOH.','A 3H triplet and 2H quartet together: an ethyl group, CH₃CH₂–.','δ 2.3 for the CH₂ fits CH₂ next to C=O.','The compound is propanoic acid, CH₃CH₂COOH.'])}
 <p><b>Practical details.</b> Tetramethylsilane (TMS, Si(CH₃)₄) is the reference, set at δ = 0: it gives one strong peak, is inert and volatile, and absorbs upfield of almost everything. Samples are dissolved in solvents without ¹H, such as CDCl₃, so the solvent gives no peak. Shaking the sample with D₂O replaces O–H and N–H protons with deuterium, so their peaks disappear: a quick way to identify them. O–H and N–H protons usually appear as singlets, because they exchange too fast to split or be split.</p>`},
 {h:'Gas chromatography and Rf values',after:'Chromatography',html:`<p><b>Thin-layer chromatography (TLC):</b> the R<sub>f</sub> value compares how far a spot travels with how far the solvent travels:</p>
 ${E('R<sub>f</sub> = distance moved by the spot ÷ distance moved by the solvent front')}
 <p>Both distances are measured from the baseline, which must be drawn in pencil and above the solvent level. A compound that interacts strongly with the polar stationary phase (silica or alumina) moves slowly and has a low R<sub>f</sub>; one that is more soluble in the mobile phase moves further. Colourless spots are shown with UV light or iodine vapour.</p>
 <p><b>Gas–liquid chromatography (GLC):</b> the mobile phase is an unreactive gas (nitrogen or helium) and the stationary phase a high-boiling liquid on a solid support inside a long column. Each component has a characteristic <b>retention time</b>. The area under each peak is proportional to the amount, so the percentage composition is each area divided by the total area. GLC is used to measure alcohol in blood and to detect drugs; combined with mass spectrometry (GC–MS), each separated peak can be identified.</p>`},
 {h:'Putting it all together',html:`${W('Compound X, C₄H₈O₂, has an IR peak at 1740 cm⁻¹ and none at 2500–3500 cm⁻¹. Its ¹H NMR spectrum shows δ 1.3 (3H, triplet), δ 2.0 (3H, singlet), δ 4.1 (2H, quartet). Identify X.',['1740 cm⁻¹ with no O–H: an ester.','δ 2.0, 3H singlet: a CH₃ next to C=O with no neighbouring H, so CH₃CO–.','δ 4.1 2H quartet and δ 1.3 3H triplet: CH₂CH₃, with the CH₂ next to O (high shift).','X is ethyl ethanoate, CH₃COOCH₂CH₃.'])}
 ${M(['Counting the H on the same carbon as neighbours in the n + 1 rule. Only H on adjacent carbons split a signal.','Reading integration as absolute numbers. It gives ratios; scale to the molecular formula.','Forgetting that broad O–H in a carboxylic acid (2500–3300 cm⁻¹) overlaps the C–H region.'])}`}
];

/* ---------- Purification (JEE, NEET) ---------- */
D['pu-purify']=[
 {h:'Worked estimation problems',after:'Estimating the elements',html:`${W('0.246 g of an organic compound gave 0.198 g CO₂ and 0.1014 g H₂O on combustion. Find %C and %H.',['%C = (12 × 0.198 × 100) ÷ (44 × 0.246) = 21.95%','%H = (2 × 0.1014 × 100) ÷ (18 × 0.246) = 4.58%'])}
 ${W('In Kjeldahl’s method, 0.5 g of a compound gave ammonia that neutralised 10 mL of 1 M H₂SO₄. Find %N.',['Moles of H₂SO₄ = 0.010 × 1 = 0.010, which neutralise 0.020 mol NH₃.','Mass of N = 0.020 × 14 = 0.28 g.','%N = 0.28 ÷ 0.5 × 100 = 56%. (Shortcut: %N = 1.4 × N × V ÷ m, using normality N = 2 for 1 M H₂SO₄: 1.4 × 2 × 10 ÷ 0.5 = 56.)'])}
 ${W('0.3 g of an organic compound gave 0.5 g of AgBr in the Carius method. Find %Br.',['M(AgBr) = 188; mass of Br = 0.5 × 80 ÷ 188 = 0.2128 g.','%Br = 0.2128 ÷ 0.3 × 100 = 70.9%.'])}
 ${N('When Kjeldahl fails','Kjeldahl’s method does not work for nitro and azo compounds or for nitrogen in a ring (pyridine), because that nitrogen is not converted to ammonium sulfate. Use the Dumas method for those.')}`},
 {h:'Choosing a distillation method',after:'Separating and purifying',html:`${T([['simple distillation','liquids with very different boiling points, or a liquid from a non-volatile impurity','chloroform (334 K) from aniline (457 K)'],['fractional distillation','liquids with close boiling points; a fractionating column gives many vaporisation–condensation cycles','crude oil fractions; acetone and methanol'],['distillation under reduced pressure','liquids that decompose at or below their normal boiling point; lowering the pressure lowers the boiling point','glycerol from spent lye in soap making'],['steam distillation','steam-volatile, water-immiscible compounds; the mixture boils when the sum of vapour pressures equals atmospheric, below 100 °C','aniline, essential oils, 2-nitrophenol from 4-nitrophenol']],['Method','Use when','Example'])}
 <p><b>Differential extraction</b> moves a compound from water into an immiscible organic solvent in a separating funnel. Several extractions with small volumes recover more than one extraction with the same total volume.</p>`}
];

/* ---------- Biomolecules (JEE, NEET) ---------- */
D['pu-bio']=[
 {h:'Glucose: reactions to remember',after:'The structure of glucose',html:`${T([['HI, heat','n-hexane','six carbons in a straight chain'],['NH₂OH','oxime','a C=O group'],['HCN','cyanohydrin','a C=O group'],['bromine water','gluconic acid','the C=O is an aldehyde (mild oxidant)'],['acetic anhydride','glucose pentaacetate','five –OH groups'],['nitric acid','saccharic acid (glucaric acid)','a primary –OH as well as the –CHO']],['Reagent','Product','Shows'])}
 <p><b>Facts open-chain glucose cannot explain:</b> it does not give a 2,4-DNP derivative or Schiff’s test, does not form the hydrogensulfite addition product with NaHSO₃, and its pentaacetate does not react with NH₂OH. Glucose also exists as two crystalline forms, α and β, which slowly interconvert in solution (mutarotation). All of this shows that it exists mainly as a six-membered ring (a pyranose), in which C1 is the anomeric carbon.</p>
 <p>Sucrose (glucose + fructose, joined C1 of α-glucose to C2 of β-fructose) is a <b>non-reducing</b> sugar, because both anomeric carbons are used in the link. Maltose and lactose are reducing sugars. Hydrolysis of sucrose turns its rotation from dextro (+) to laevo (−): the product mixture is called invert sugar.</p>`},
 {h:'Enzymes and denaturation',after:'Proteins and enzymes',html:`<p>Enzymes are biological catalysts, almost all proteins. They are highly specific because the substrate must fit the shape of the active site, and they work at body temperature and near-neutral pH. They lower the activation energy, often by millions of times in rate.</p>
 <p>Proteins lose their biological activity when heat or a change in pH disrupts their secondary and tertiary structure: denaturation. The primary structure (the sequence) is unchanged. Boiling an egg (coagulating albumin) and curdling milk (from lactic acid made by bacteria) are everyday examples.</p>
 ${T([['globular','chains fold into compact spheres','soluble in water','insulin, albumins, enzymes'],['fibrous','chains run in parallel, held by hydrogen and disulfide bonds','insoluble in water','keratin (hair, wool), myosin (muscle)']],['Type','Shape','Solubility','Examples'])}`}
];

/* ---------- Named reactions (JEE, NEET) ---------- */
D['pu-named']=[
 {h:'How to learn named reactions',html:`<p>There are dozens of named reactions in NCERT, and JEE and NEET test them as "identify the product" or "match the reagent" questions. Some ways to make them stick:</p>
 <ul><li><b>Group by what they make,</b> as this unit does: C–C bonds, halides, alcohols and ethers, carbonyls, acids and nitrogen compounds.</li>
 <li><b>Learn the change in carbon count.</b> Wurtz doubles the chain; decarboxylation and Hofmann bromamide remove one carbon; Kolbe–Schmitt and Reimer–Tiemann add one to the ring.</li>
 <li><b>Pair the opposites:</b> Clemmensen (Zn–Hg, HCl: acidic) and Wolff–Kishner (NH₂NH₂, KOH: basic) both reduce C=O to CH₂; choose the one the rest of the molecule survives.</li>
 <li><b>Know the key intermediates:</b> dichlorocarbene (:CCl₂) in Reimer–Tiemann and the carbylamine test; the enolate in aldol; hydride transfer in Cannizzaro; the diazonium ion in Sandmeyer, Gattermann and coupling.</li></ul>
 ${T([['Hofmann bromamide','RCONH₂ → RNH₂','loses one C'],['Decarboxylation (soda lime)','RCOONa → RH','loses one C'],['Wurtz','2RX → R–R','doubles'],['Kolbe electrolysis','2RCOONa → R–R','2 × (n − 1)'],['Reimer–Tiemann','phenol → salicylaldehyde','adds one C (CHO)'],['Kolbe–Schmitt','phenol → salicylic acid','adds one C (COOH)'],['Gabriel phthalimide','RX → RNH₂','same carbons; only 1° amines']],['Reaction','Change','Carbon count'])}`}
];
})();
