/* Bondline version 37: deeper lessons, part 2 (introduction to organic, isomerism, alkanes, alkenes, arenes, halogen compounds).
   Format as in course-deep-1.js. */
(function(){
const D=window.BL_DEEP=window.BL_DEEP||{};
const {T,E,N,W,M}=window.BL_DEEP_H;

/* ---------- Introduction to organic chemistry ---------- */
D['pu-org']=[
 {h:'Naming organic compounds step by step',after:'Functional groups and names',html:`<ol><li><b>Find the main functional group.</b> It gives the suffix. If there are several, the one highest in priority is the suffix and the others become prefixes. Priority, highest first: carboxylic acid &gt; ester &gt; acyl chloride &gt; amide &gt; nitrile &gt; aldehyde &gt; ketone &gt; alcohol &gt; amine &gt; alkene &gt; alkane. Halogens and alkyl groups are always prefixes.</li>
 <li><b>Find the longest carbon chain that contains the main group.</b> It gives the stem: meth (1), eth (2), prop (3), but (4), pent (5), hex (6), hept (7), oct (8).</li>
 <li><b>Number the chain</b> from the end that gives the main group the lowest number, then the multiple bonds, then the substituents.</li>
 <li><b>Name the substituents</b> with their positions, in alphabetical order (ignoring di-, tri-, tetra-), with commas between numbers and hyphens between numbers and words.</li></ol>
 ${W('Name CH₃CH(OH)CH₂CH(CH₃)₂.',['Main group: –OH, so the suffix is -ol.','Longest chain containing the C–OH: 5 carbons, pentan-…-ol.','Numbering from the end nearer the OH puts it on C2 and the methyl on C4 (from the other end it would be C4 and C2).','Name: 4-methylpentan-2-ol.'])}
 ${W('Name CH₂=CHCH₂COOH.',['The acid outranks the alkene, so the suffix is -oic acid and C1 is the COOH carbon.','Four carbons, with the C=C between C3 and C4: but-3-enoic acid.'])}
 ${W('Name CH₃CHClCOCH₃.',['Ketone: suffix -one. Four carbons: butanone.','Number to give C=O the lowest number: C=O is C2, Cl is on C3.','Name: 3-chlorobutan-2-one.'])}
 ${M(['Choosing the longest straight line on the page instead of the longest chain, which may bend.','Numbering to give the substituents low numbers when the functional group should come first.','Listing substituents by position instead of alphabetically (ethyl before methyl).','Counting the carbon of –COOH, –CHO or –CN separately: it is part of the chain and is C1.'])}`},
 {h:'Finding formulas from combustion and composition data',after:'Formulas',html:`${W('A hydrocarbon contains 85.7% carbon by mass. Its M<sub>r</sub> is 56. Find its molecular formula.',['In 100 g: 85.7 g C and 14.3 g H.','Moles: C 85.7 ÷ 12.0 = 7.14; H 14.3 ÷ 1.0 = 14.3.','Ratio C : H = 7.14 : 14.3 = 1 : 2, so the empirical formula is CH₂ (mass 14).','56 ÷ 14 = 4, so the molecular formula is C₄H₈.'])}
 ${W('Complete combustion of 0.200 g of a compound containing only C, H and O gave 0.293 g CO₂ and 0.120 g H₂O. Find its empirical formula.',['Mass of C = 0.293 × 12/44 = 0.0800 g; mass of H = 0.120 × 2/18 = 0.0133 g.','Mass of O = 0.200 − 0.0800 − 0.0133 = 0.1067 g.','Moles: C 0.00667, H 0.0133, O 0.00667. Divide by 0.00667: 1 : 2 : 1.','Empirical formula CH₂O.'])}
 <p>For a gaseous hydrocarbon you can use volumes directly: in C<sub>x</sub>H<sub>y</sub> + (x + y/4)O₂ → xCO₂ + (y/2)H₂O, gas volumes are proportional to moles. If 10 cm³ of a hydrocarbon needs 50 cm³ of O₂ and makes 30 cm³ of CO₂, then x = 3 and x + y/4 = 5, so y = 8: propane, C₃H₈.</p>`},
 {h:'Types of reaction and curly arrows',after:'The language of mechanisms',html:`${T([['addition','two molecules join to make one','ethene + Br₂ → 1,2-dibromoethane'],['substitution','one atom or group is replaced by another','chloromethane + OH⁻ → methanol + Cl⁻'],['elimination','a small molecule is removed, forming a multiple bond','bromoethane → ethene + HBr'],['hydrolysis','a bond is broken by reaction with water','ester + water → acid + alcohol'],['condensation','two molecules join with loss of a small molecule such as water','acid + alcohol → ester + water'],['oxidation','gain of O, or loss of H (written [O])','ethanol + [O] → ethanal + H₂O'],['reduction','gain of H, or loss of O (written [H])','ethanal + 2[H] → ethanol']],['Type','What happens','Example'])}
 <p><b>Rules for curly arrows</b>, used in every mechanism:</p>
 <ul><li>A full curly arrow shows the movement of a <b>pair</b> of electrons; a half-headed (fish-hook) arrow shows one electron, as in radical reactions.</li>
 <li>The arrow <b>starts</b> where the electrons are: at a lone pair, or at the middle of a bond.</li>
 <li>It <b>ends</b> where the electrons go: at an atom (forming a lone pair or a new bond to it) or at the middle of a new bond.</li>
 <li>Show all charges and partial charges, and lone pairs on nucleophiles. An atom that receives a new bond may have to lose one, or the octet rule breaks.</li></ul>`},
 {h:'Homologous series and physical properties',after:'Formulas',html:`<p>A <b>homologous series</b> is a family of compounds with the same functional group and general formula, in which each member differs from the next by CH₂. Members have similar chemical properties and show a gradual trend in physical properties.</p>
 ${T([['methane','CH₄','−162'],['ethane','C₂H₆','−89'],['propane','C₃H₈','−42'],['butane','C₄H₁₀','−1'],['pentane','C₅H₁₂','36'],['hexane','C₆H₁₄','69']],['Alkane','Formula','Boiling point / °C'])}
 <p>Each extra CH₂ adds electrons and surface area, so London forces grow and the boiling point rises. The increase is largest at the start of the series, where one CH₂ is a bigger fraction of the molecule. <b>Saturated</b> compounds have only single C–C bonds; <b>unsaturated</b> compounds contain C=C or C≡C.</p>`}
];

/* ---------- Isomerism ---------- */
D['pu-iso']=[
 {h:'Finding all the isomers of a formula',after:'Structural isomers',html:`${W('Draw all the structural isomers of C₄H₉Br.',['Start with the skeletons of C₄: a straight chain (butane) and a branched one (2-methylpropane).','On butane, Br can go on an end carbon (1-bromobutane) or a middle one (2-bromobutane).','On 2-methylpropane, Br can go on a CH₃ (1-bromo-2-methylpropane) or on the central carbon (2-bromo-2-methylpropane).','Four structural isomers. 2-Bromobutane also has a chiral centre, so there are five isomers in total, counting stereoisomers.'])}
 ${W('How many alcohols have the formula C₄H₁₀O, and which ether isomers are there?',['Alcohols: butan-1-ol, butan-2-ol, 2-methylpropan-1-ol, 2-methylpropan-2-ol (four).','Ethers (functional group isomers): methoxypropane, 2-methoxypropane, ethoxyethane (three).'])}
 <p>To avoid drawing the same molecule twice, name each one: two drawings with the same name are the same compound. Remember that a chain can be drawn bent; CH₃CH₂CH₂CH₃ drawn in an L-shape is still butane.</p>
 ${T([['CₙH₂ₙ','alkene','cycloalkane'],['CₙH₂ₙO','aldehyde','ketone (and unsaturated alcohols)'],['CₙH₂ₙO₂','carboxylic acid','ester'],['CₙH₂ₙ₊₂O','alcohol','ether']],['General formula','Can be','or'])}`},
 {h:'Naming geometric isomers: the E/Z system',after:'Cis/trans isomers',html:`<p>Cis and trans work when each carbon of the C=C carries an H. When there are three or four different groups, use the <b>E/Z</b> system, based on the Cahn–Ingold–Prelog (CIP) priority rules:</p>
 <ol><li>On each carbon of the double bond, rank the two attached atoms by atomic number: higher atomic number = higher priority (Br &gt; Cl &gt; O &gt; N &gt; C &gt; H).</li>
 <li>If the atoms tie, move outwards along each group and compare the next atoms, until there is a difference.</li>
 <li>If the two higher-priority groups are on the same side: <b>Z</b> (from German <i>zusammen</i>, together). Opposite sides: <b>E</b> (<i>entgegen</i>, opposite).</li></ol>
 ${W('Name the isomer of 1-bromo-1-chloropropene, BrClC=CHCH₃, in which Br and CH₃ are on the same side.',['On C1: Br (35) beats Cl (17). On C2: CH₃ (C, 6) beats H (1).','The two higher-priority groups, Br and CH₃, are on the same side.','Name: (Z)-1-bromo-1-chloropropene.'])}
 <p>E/Z and cis/trans don’t always match: cis is about identical groups, E/Z about priorities. For but-2-ene they agree (cis = Z), but not in every molecule.</p>
 <p>Geometric isomers have different physical properties because their shapes differ. cis-Butenedioic acid (maleic acid) melts at 135 °C and forms an internal hydrogen bond; the trans isomer (fumaric acid) melts at 287 °C, packing better and hydrogen bonding between molecules.</p>`},
 {h:'More than one chiral centre',after:'Optical isomers',only:'ijnsp',html:`<p>A molecule with <i>n</i> chiral centres can have up to 2<sup><i>n</i></sup> stereoisomers. Stereoisomers that are not mirror images are <b>diastereomers</b>; unlike enantiomers, they have different physical properties.</p>
 <p>The maximum is not always reached. A <b>meso compound</b> has chiral centres but also an internal plane of symmetry, so it is superimposable on its mirror image and optically inactive. 2,3-Dibromobutane has two chiral centres but only three stereoisomers: a pair of enantiomers and one meso form. Tartaric acid is the classic example.</p>
 <p><b>Assigning R and S.</b> Rank the four groups on the chiral centre by CIP priority. Point the lowest-priority group (usually H) away from you, then trace 1 → 2 → 3. Clockwise is <i>R</i>; anticlockwise is <i>S</i>. The labels say nothing about the direction the molecule rotates light, which must be measured; that is shown separately as (+) or (−).</p>`},
 {h:'Measuring optical activity',after:'Optical isomers',html:`<p>Ordinary light vibrates in all planes. A polarising filter lets through light vibrating in one plane only: <b>plane-polarised light</b>. In a <b>polarimeter</b> this light passes through a solution of the sample, and a second filter is turned to find how far the plane has rotated.</p>
 <ul><li>One enantiomer rotates the plane clockwise (+, dextrorotatory) and the other anticlockwise by exactly the same angle (−, laevorotatory).</li>
 <li>A <b>racemic mixture</b> (racemate) has equal amounts of both, so the rotations cancel and it is optically inactive.</li>
 <li>The size of the rotation depends on concentration, path length, temperature and the wavelength of light used.</li></ul>
 <p>Reactions that go through a planar intermediate often give racemates. An SN1 reaction at a chiral centre forms a flat carbocation that the nucleophile can attack from either face, and nucleophilic addition of HCN to an aldehyde (other than methanal) attacks a flat C=O from either side. Both give equal amounts of the two enantiomers.</p>
 ${M(['Calling a molecule chiral because it contains a carbon with four bonds. The four groups must all be different, and a CH₂ or CH₃ is never a chiral centre.','Forgetting the implicit H when looking for chiral centres in skeletal formulas.','Saying a racemic mixture is "not chiral". Each molecule is chiral; the mixture is optically inactive.'])}`}
];

/* ---------- Alkanes ---------- */
D['pu-alkane']=[
 {h:'Why free-radical substitution gives mixtures',after:'Free-radical substitution',html:`<p>Free-radical substitution is hard to control. Two problems:</p>
 <ul><li><b>Further substitution.</b> Cl• can also remove H from the product, CH₃Cl, so CH₂Cl₂, CHCl₃ and CCl₄ form as well. Using excess methane makes the radical more likely to hit CH₄, so CH₃Cl is the main product. Excess chlorine pushes towards CCl₄.</li>
 <li><b>Different positions.</b> In propane, Cl• can remove H from an end carbon or the middle carbon, giving 1-chloropropane and 2-chloropropane.</li></ul>
 ${W('Write the propagation steps for the formation of 2-chloropropane from propane.',['CH₃CH₂CH₃ + Cl• → CH₃ĊHCH₃ + HCl (the radical is on the middle carbon)','CH₃ĊHCH₃ + Cl₂ → CH₃CHClCH₃ + Cl•'])}
 <p>Termination steps can make longer chains: two ethyl radicals in the ethane–chlorine reaction combine to give butane, which is good evidence for the radical mechanism. Bromine is less reactive and more selective than chlorine: it favours the H that gives the more stable radical (tertiary &gt; secondary &gt; primary).</p>
 ${M(['Drawing full curly arrows in radical mechanisms; use half-headed arrows or just equations with dots.','Writing H• in propagation. Cl• takes H to make HCl; H atoms are never free radicals in these steps.','Forgetting the UV light condition.'])}`},
 {h:'Catalytic converters and fuel chemistry',after:'Combustion and pollution',html:`<p>A catalytic converter has a ceramic honeycomb coated with platinum, palladium and rhodium, giving a large surface area. Gases adsorb onto the metal, react and desorb. Three reactions happen together:</p>
 ${E('2CO + 2NO → 2CO₂ + N₂')}
 ${E('2CO + O₂ → 2CO₂')}
 ${E('C₈H₁₈ + 12½O₂ → 8CO₂ + 9H₂O &nbsp;(unburnt fuel)')}
 <p>It reduces toxic emissions but does nothing about CO₂, a greenhouse gas. Other environmental problems: sulfur impurities in fuel give SO₂ (acid rain), which is why fuels are desulfurised.</p>
 ${T([['high energy density, easy to transport, cheap infrastructure','non-renewable; CO₂ emissions; pollutants CO, NOₓ, SO₂, particulates']],['Advantages of fossil fuels','Disadvantages'])}`},
 {h:'Physical properties of alkanes',after:'Why alkanes are unreactive',html:`<p>Alkanes are non-polar, held together only by London forces. So they are insoluble in water (they cannot hydrogen bond with it) but mix with each other and with other non-polar solvents. They are less dense than water, which is why oil floats.</p>
 <p>Up to C₄ they are gases at room temperature, C₅–C₁₇ are liquids, and larger ones are waxy solids. For isomers, branching lowers the boiling point: branched molecules are more compact, so less surface touches and the London forces are weaker.</p>
 <p><b>Cycloalkanes</b> (C<sub>n</sub>H<sub>2n</sub>) are isomers of alkenes. Cyclohexane is not flat: it adopts a <b>chair</b> conformation with bond angles of about 109.5°, so it is strain-free. Cyclopropane, forced to 60° angles, is strained and much more reactive.</p>`}
];

/* ---------- Alkenes ---------- */
D['pu-alkene']=[
 {h:'Markovnikov’s rule worked through',after:'The mechanism and Markovnikov’s rule',html:`${W('Predict the major product of 2-methylpropene with HBr, and explain it.',['H⁺ can add to either carbon of the C=C.','Adding to the CH₂ end gives (CH₃)₃C⁺, a tertiary carbocation; adding to the other end gives a primary one.','Three alkyl groups push electron density towards the positive carbon (positive inductive effect), so the tertiary carbocation is more stable and forms faster.','Br⁻ attacks it: the major product is 2-bromo-2-methylpropane. The minor product is 1-bromo-2-methylpropane.'])}
 <p><b>Hyperconjugation</b> also stabilises carbocations: electrons in neighbouring C–H σ bonds overlap with the empty p orbital on the positive carbon. More alkyl groups mean more of these interactions, which agrees with the order 3° &gt; 2° &gt; 1°.</p>
 <p><b>Hydration follows the same rule.</b> Propene with steam (H₃PO₄ catalyst) gives mainly propan-2-ol, via the more stable secondary carbocation.</p>
 ${M(['Drawing the arrow from H to the C=C. The arrow goes from the π bond (electrons) to the Hδ+ (where they go).','Forgetting the arrow from the H–Br bond to Br as it breaks.','Saying the major product forms because "H goes to the carbon with more H" without the carbocation explanation; most mark schemes want the carbocation stability.'])}`},
 {h:'Testing for C=C, and bromine water',after:'Why alkenes react with electrophiles',html:`<p>Shake the compound with <b>bromine water</b>: if it has a C=C, the orange colour disappears. Alkanes leave it orange (in the dark).</p>
 <p>In bromine <i>water</i>, the carbocation formed in the first step can be attacked by water as well as by Br⁻, and water is in huge excess. So the main product from ethene is actually 2-bromoethanol, BrCH₂CH₂OH, with some 1,2-dibromoethane. This also shows that the reaction goes in two steps through a positive intermediate.</p>
 <p>Similarly, if Cl⁻ ions are present when ethene reacts with bromine, some 1-bromo-2-chloroethane forms, but never 1,2-dichloroethane: the first atom added is always Br.</p>`},
 {h:'Hydrogenation and margarine',after:'Why alkenes react with electrophiles',html:`<p>Vegetable oils are esters of unsaturated fatty acids, with several cis C=C bonds that kink the chains so they cannot pack tightly; they are liquids. Reacting some of the C=C with hydrogen over a nickel catalyst at about 150 °C straightens the chains, raising the melting point and giving a spreadable solid, margarine.</p>
 <p>Partial hydrogenation can also isomerise some cis double bonds to trans. Trans fats raise "bad" cholesterol, so manufacturers now mostly use other methods, such as blending with naturally solid fats.</p>`},
 {h:'Working out structures from oxidation products',after:'Oxidation with manganate(VII)',only:'asjnp',html:`${W('An alkene C₆H₁₂ is heated with hot, concentrated acidified KMnO₄. The only organic product is propanone. Identify the alkene.',['Each fragment came from one end of the C=C. Propanone, (CH₃)₂C=O, comes from a (CH₃)₂C= end.','Only one product, so both ends are the same: (CH₃)₂C=C(CH₃)₂.','The alkene is 2,3-dimethylbut-2-ene.'])}
 ${W('An alkene gives ethanoic acid and carbon dioxide on hot oxidation. Identify it.',['CO₂ (and water) comes from a =CH₂ end.','Ethanoic acid, CH₃COOH, comes from a CH₃CH= end.','The alkene is CH₃CH=CH₂, propene.'])}`}
];

/* ---------- Arenes ---------- */
D['pu-arene']=[
 {h:'Thermochemical evidence for delocalisation',after:'The structure of benzene',html:`<p>Hydrogenating cyclohexene (one C=C) releases 120 kJ mol⁻¹. If benzene were cyclohexa-1,3,5-triene, with three separate C=C bonds, you would expect 3 × 120 = 360 kJ mol⁻¹. The measured value is only 208 kJ mol⁻¹.</p>
 ${E('stabilisation (delocalisation) energy ≈ 360 − 208 = 152 kJ mol⁻¹')}
 <p>Benzene is about 150 kJ mol⁻¹ more stable than the Kekulé structure, because its π electrons are spread over the whole ring. Two more pieces of evidence: all six C–C bonds are the same length (X-ray diffraction), and benzene does not decolourise bromine water or react readily with HBr, as an alkene would.</p>
 <p>This stability explains why benzene prefers <b>substitution</b> to addition: substitution keeps the delocalised ring intact in the product, while addition would destroy it.</p>`},
 {h:'Electrophilic substitution: the mechanism',after:'Electrophilic substitution',html:`<p><b>Making the electrophile.</b> Each reaction needs a strong electrophile, because the delocalised ring is less reactive than an alkene.</p>
 ${E('Nitration: HNO₃ + 2H₂SO₄ → NO₂⁺ + H₃O⁺ + 2HSO₄⁻')}
 ${E('Bromination: Br₂ + FeBr₃ → Br⁺ + FeBr₄⁻ (Br⁺ is really a polarised Br–Br–FeBr₃ complex)')}
 ${E('Friedel–Crafts acylation: CH₃COCl + AlCl₃ → CH₃CO⁺ + AlCl₄⁻')}
 <p><b>The two steps</b>, the same for every electrophile:</p>
 <ol><li>A curly arrow from the delocalised ring to the electrophile. A new C–E bond forms, and the ring is left with a positive charge spread over five carbons: an <b>intermediate</b> drawn as a horseshoe with a + inside, opening towards the sp³ carbon that now carries both H and E.</li>
 <li>A curly arrow from the C–H bond back into the ring. H⁺ is lost, and the full delocalised ring is restored.</li></ol>
 <p>The H⁺ regenerates the catalyst: H⁺ + FeBr₄⁻ → FeBr₃ + HBr, or H⁺ + AlCl₄⁻ → AlCl₃ + HCl.</p>
 ${M(['Drawing the horseshoe across the whole ring: it must leave out the carbon bonded to both H and E.','Starting the first arrow from a carbon atom instead of from the ring of electrons.','Forgetting to show how the electrophile is made, which usually earns marks.'])}`},
 {h:'Naming aromatic compounds',after:'The structure of benzene',html:`<p>Benzene with one substituent: the group is a prefix (chlorobenzene, nitrobenzene, methylbenzene) or the ring is named as a parent with a suffix (benzoic acid, phenol, phenylamine, benzaldehyde). When a benzene ring is a substituent on a chain, it is called <b>phenyl</b>, C₆H₅–.</p>
 <p>With two or more substituents, number the ring carbons to give the lowest numbers, with the carbon bearing the parent group as C1:</p>
 ${T([['3-nitrobenzoic acid','COOH on C1 (parent), NO₂ on C3'],['2,4,6-tribromophenol','OH on C1'],['4-methylphenylamine','NH₂ on C1, CH₃ on C4'],['1,4-dichlorobenzene','no parent group; numbers as low as possible']],['Name','Meaning'])}
 <p>The older names ortho (1,2-), meta (1,3-) and para (1,4-) are still common, especially in JEE and NEET questions.</p>`},
 {h:'Planning syntheses with directing effects',after:'Directing effects',only:'ajnsp',html:`${W('Make 3-nitrobromobenzene from benzene.',['Br directs to 2- and 4-; NO₂ directs to 3-. To get the 3-product, the group added first must be the 3-director.','Step 1: nitrate (conc. HNO₃, conc. H₂SO₄, below 55 °C) to give nitrobenzene.','Step 2: brominate (Br₂, FeBr₃) to give 3-bromonitrobenzene.'])}
 ${W('Make 4-bromonitrobenzene from benzene.',['Now brominate first: Br directs the nitro group to 2- and 4-.','Step 1: Br₂ with FeBr₃ gives bromobenzene. Step 2: nitrate; separate the 4-isomer from the 2-isomer.'])}
 <p><b>Why groups direct.</b> When the electrophile adds ortho or para to an –OH, –NH₂ or alkyl group, one resonance form of the intermediate puts the positive charge on the carbon carrying that group, which can stabilise it (by lone-pair donation or by the inductive effect). For an electron-withdrawing group such as –NO₂, ortho/para attack puts the positive charge next to the already positive N, which is very unfavourable, so meta attack wins.</p>`},
 {h:'Side-chain chemistry and other reactions',after:'Methylbenzene: ring or side chain?',html:`<ul><li><b>Hydrogenation:</b> with H₂ and a nickel or platinum catalyst at high temperature and pressure, benzene adds three H₂ to give cyclohexane. It needs much harsher conditions than an alkene, again showing the stability of the ring.</li>
 <li><b>Combustion:</b> arenes burn with a very smoky flame, because their high carbon-to-hydrogen ratio means a lot of unburnt carbon.</li>
 <li><b>Side-chain oxidation:</b> any alkyl group with at least one H on the carbon attached to the ring is oxidised to –COOH by hot KMnO₄. Ethylbenzene and propylbenzene both give benzoic acid. tert-Butylbenzene, with no H on that carbon, is not oxidised.</li></ul>`}
];

/* ---------- Halogen compounds ---------- */
D['pu-halo']=[
 {h:'The SN2 and SN1 mechanisms in detail',after:'SN2 and SN1',html:`<p><b>SN2</b> (substitution, nucleophilic, bimolecular): a curly arrow from the lone pair of OH⁻ to the δ+ carbon, and at the same time a curly arrow from the C–Br bond to Br. The nucleophile attacks from the side opposite the leaving group, through a <b>transition state</b> in which the carbon is partly bonded to both (drawn in square brackets with a negative charge). The other three groups flip over like an umbrella in the wind, so a chiral starting material gives the product with <b>inverted</b> configuration.</p>
 <p><b>SN1</b> (unimolecular): first, the C–Br bond breaks on its own (a curly arrow from the bond to Br), giving a planar carbocation and Br⁻. This is the slow, rate-determining step. Then the nucleophile attacks the carbocation. Because the carbocation is flat, attack from either face is equally likely, and a chiral starting material gives a <b>racemic</b> product.</p>
 ${T([['primary','SN2','the carbon is not crowded, and a primary carbocation would be very unstable'],['secondary','both','intermediate'],['tertiary','SN1','three alkyl groups block backside attack and stabilise the carbocation']],['Halogenoalkane','Main mechanism','Why'])}
 <p>Other factors: a stronger nucleophile favours SN2; a polar protic solvent such as water stabilises the carbocation and favours SN1; a better leaving group (I⁻ &gt; Br⁻ &gt; Cl⁻) speeds up both.</p>`},
 {h:'Substitution or elimination?',after:'Substitution and elimination',html:`<p>OH⁻ can act as a <b>nucleophile</b> (attacking carbon) or as a <b>base</b> (removing an H⁺ from the carbon next to the C–X). The conditions decide which wins:</p>
 ${T([['aqueous NaOH, warm','water; OH⁻ well solvated','substitution: alcohol'],['NaOH in ethanol, hot','ethanol; higher temperature','elimination: alkene'],['tertiary halogenoalkane','crowded carbon','more elimination']],['Conditions','Notes','Main product'])}
 <p>In elimination, the OH⁻ takes an H from the carbon next to the C–X, the electrons of that C–H bond form the C=C, and X⁻ leaves. When there is a choice, the more substituted alkene usually forms (Zaitsev’s rule): 2-bromobutane gives mostly but-2-ene (as cis and trans), with some but-1-ene.</p>
 ${W('Give all the organic products when 2-bromobutane is heated with ethanolic KOH.',['H can be removed from C1 or C3.','From C1: but-1-ene. From C3: but-2-ene, which exists as cis and trans isomers.','Three alkenes in total: but-1-ene, cis-but-2-ene and trans-but-2-ene.'])}`},
 {h:'Uses of halogen compounds, and the C–X bond',after:'Reactivity and the silver nitrate test',html:`<p>Halogenoalkanes are useful because the C–X bond is reactive enough to swap for other groups. They are key intermediates in synthesis: from one halogenoalkane you can reach alcohols, nitriles (one carbon longer), amines and alkenes.</p>
 ${T([['C–F','485','fluoropolymers (PTFE), CFC replacements, some drugs; very unreactive'],['C–Cl','340','PVC, solvents, pesticides'],['C–Br','280','flame retardants, synthesis'],['C–I','240','most reactive; used in synthesis and as iodine sources']],['Bond','Bond energy / kJ mol⁻¹','Uses and notes'])}
 <p>The strength of the C–F bond is why fluorinated compounds such as PFAS, the "forever chemicals", persist in the environment.</p>
 ${M(['Saying the C–I bond reacts fastest because it is the most polar. It is the least polar; it reacts fastest because it is the weakest.','Using aqueous KCN: KCN is used in ethanol, and the nitrile has one more carbon in its name.','Forgetting that ammonia must be in excess to avoid further substitution to secondary and tertiary amines.'])}`}
];
})();
