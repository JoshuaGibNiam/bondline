/* Bondline version 31: extra course questions, part 2 (introductory organic chemistry to phenol). See course-x1.js for the format. */
(function(){
const X=window.BL_COURSE_X=window.BL_COURSE_X||{pu:{},ic:{},units:[]};
const Q=(prompt,opts,why,only)=>only?{prompt,opts,why,only}:{prompt,opts,why};

X.pu['pu-org']={qs:[
 Q('What is the general formula of the alkanes?',['CₙH₂ₙ₊₂','CₙH₂ₙ','CₙH₂ₙ₋₂','CₙH₂ₙ₊₁'],'Each carbon has two H atoms plus one extra at each end of the chain.'),
 Q('Which functional group is present in CH₃CH₂CHO?',['Aldehyde','Ketone','Alcohol','Carboxylic acid'],'–CHO at the end of the chain is an aldehyde: propanal.'),
 Q('A hydrocarbon contains 85.7% carbon by mass. What is its empirical formula?',['CH₂','CH₃','CH','C₂H₃'],'C 85.7 ÷ 12 = 7.14; H 14.3 ÷ 1 = 14.3. Ratio 1 : 2.'),
 Q('Which species is an electrophile?',['NO₂⁺','NH₃','OH⁻','H₂O'],'An electrophile accepts a pair of electrons. NO₂⁺ is positive and electron-poor.'),
 Q('What type of reaction is CH₄ + Cl₂ → CH₃Cl + HCl?',['Substitution','Addition','Elimination','Condensation'],'A hydrogen atom is replaced by a chlorine atom.'),
 Q('What is the IUPAC name of CH₃CH₂CH(CH₃)CH₃?',['2-Methylbutane','3-Methylbutane','Pentane','2-Ethylpropane'],'The longest chain has four carbons; number from the end nearer the branch.'),
 Q('Which is a tertiary alcohol?',['2-Methylpropan-2-ol','Propan-2-ol','Butan-1-ol','2-Methylpropan-1-ol'],'The C bearing the OH is bonded to three other carbons.'),
 Q('What is the name of CH₂=CHCH₂CH₃?',['But-1-ene','But-2-ene','Butene-1','Propene'],'Four carbons with the double bond starting at C1.'),
 Q('What happens in heterolytic fission of a covalent bond?',['Both bonding electrons go to one atom, forming two ions','Each atom keeps one bonding electron','Two free radicals form','The bond is broken by light only'],'The more electronegative atom usually takes both electrons.'),
 Q('Which describes a homologous series?',['Same general formula and functional group; successive members differ by CH₂','Same molecular formula but different structures','Compounds with the same boiling point','Compounds made from the same monomer'],'For example, the alcohols CH₃OH, C₂H₅OH, C₃H₇OH…'),
 Q('How many carbon atoms are there in 2,2-dimethylbutane?',['6','4','5','8'],'A four-carbon chain plus two methyl groups.'),
 Q('Which equation shows an addition reaction?',['CH₂=CH₂ + H₂O → CH₃CH₂OH','C₂H₅Br + OH⁻ → C₂H₅OH + Br⁻','C₂H₅OH → C₂H₄ + H₂O','CH₃COOH + C₂H₅OH → CH₃COOC₂H₅ + H₂O'],'Two molecules join to make a single product.'),
 Q('Which group has the strongest +I (electron-donating inductive) effect?',['(CH₃)₃C–','CH₃–','C₂H₅–','H–'],'More alkyl groups give a stronger +I effect.','jn'),
 Q('Which free radical is the most stable?',['(CH₃)₃C•','CH₃•','CH₃CH₂•','(CH₃)₂CH•'],'Tertiary radicals are stabilised by hyperconjugation and the +I effect of three alkyl groups.','jn')],
xp:[
 {only:'asi',fmt:'struct',title:'Finding a molecular formula',stem:'Compound A contains 54.5% carbon, 9.1% hydrogen and 36.4% oxygen by mass. Its relative molecular mass is 88.',parts:[
  ['Calculate the empirical formula of A.','C 54.5 ÷ 12 = 4.54; H 9.1 ÷ 1 = 9.1; O 36.4 ÷ 16 = 2.28 [1]. Ratio 2 : 4 : 1, so C₂H₄O [1].',2],
  ['Deduce the molecular formula of A.','C₂H₄O has Mᵣ 44, and 88 ÷ 44 = 2, so C₄H₈O₂ [1].',1],
  ['A gives off CO₂ with sodium carbonate. Draw and name the two carboxylic acids with this molecular formula.','CH₃CH₂CH₂COOH, butanoic acid [1]; (CH₃)₂CHCOOH, 2-methylpropanoic acid [1].',2],
  ['Draw and name an ester that is a functional group isomer of A.','For example CH₃COOCH₂CH₃, ethyl ethanoate (or CH₃CH₂COOCH₃, methyl propanoate) [1].',1]]},
 {only:'j',fmt:'nvt',title:'Basic organic chemistry: integer answers',stem:'Give each answer as an integer.',parts:[
  ['The number of structural isomers of C₄H₁₀O that are alcohols.','Butan-1-ol, butan-2-ol, 2-methylpropan-1-ol and 2-methylpropan-2-ol: 4.',4],
  ['The number of α-hydrogens available for hyperconjugation in the isopropyl cation, (CH₃)₂CH⁺.','Two CH₃ groups: 6.',4],
  ['The degree of unsaturation (double-bond equivalents) of C₆H₆.','(2 × 6 + 2 − 6) ÷ 2 = 4.',4]]}]};

X.pu['pu-iso']={qs:[
 Q('How many structural isomers have the formula C₅H₁₂?',['3','2','4','5'],'Pentane, 2-methylbutane and 2,2-dimethylpropane.'),
 Q('Which compound is optically active?',['2-Chlorobutane','1-Chlorobutane','2-Chloropropane','2-Chloro-2-methylpropane'],'C2 of 2-chlorobutane carries H, Cl, CH₃ and C₂H₅: four different groups.'),
 Q('How many stereoisomers does but-2-ene have?',['2','1','3','4'],'The E and Z isomers.'),
 Q('Which compound shows E/Z isomerism?',['1,2-Dichloroethene','1,1-Dichloroethene','Propene','Chloroethene'],'Each carbon of the C=C carries two different groups (H and Cl).'),
 Q('What type of isomers are butan-1-ol and butan-2-ol?',['Positional isomers','Chain isomers','Functional group isomers','Stereoisomers'],'Same chain and functional group, different position of the OH.'),
 Q('What type of isomers are butane and 2-methylpropane?',['Chain isomers','Positional isomers','Functional group isomers','Optical isomers'],'Same formula, different arrangement of the carbon chain.'),
 Q('What is a chiral carbon atom?',['A carbon attached to four different groups','A carbon in a C=C bond','A carbon with three identical groups','A carbon with a lone pair'],'Its mirror image cannot be superimposed on it.'),
 Q('How many chiral centres does 2,3-dichlorobutane have?',['2','1','0','3'],'C2 and C3 each carry H, Cl, CH₃ and CHClCH₃.'),
 Q('How many stereoisomers does 2,3-dichlorobutane have?',['3','4','2','1'],'Two chiral centres would give four, but one form has a mirror plane: a pair of enantiomers plus a meso compound.','ijn'),
 Q('Which compound shows both E/Z isomerism and optical isomerism?',['CH₃CH=CHCH(Cl)CH₃','CH₂=CHCH(Cl)CH₃','CH₃CH=C(CH₃)₂','CH₃CH₂CH=CH₂'],'It has a C=C with two different groups on each carbon, and a chiral C bearing Cl.'),
 Q('What is the relationship between (Z)-but-2-ene and (E)-but-2-ene?',['Stereoisomers (geometric isomers)','Structural isomers','Enantiomers','The same compound'],'Same structural formula, different arrangement in space.'),
 Q('How many alkenes (including stereoisomers) have the formula C₄H₈?',['4','3','5','6'],'But-1-ene, (E)-but-2-ene, (Z)-but-2-ene and 2-methylpropene.'),
 Q('A molecule with n different chiral centres and no internal symmetry has how many optical isomers?',['2ⁿ','n²','2n','n'],'Each centre can be R or S independently.','jn'),
 Q('Which pair are metamers?',['Diethyl ether and methyl propyl ether','Butan-1-ol and butan-2-ol','Ethanol and methoxymethane','Propanal and propanone'],'Metamers have different alkyl groups on either side of the same functional group.','jn')],
xp:[
 {only:'asi',fmt:'struct',title:'Isomers of C₄H₈',stem:'Several compounds have the molecular formula C₄H₈.',parts:[
  ['Draw and name the three structural isomers of C₄H₈ that are alkenes.','But-1-ene CH₂=CHCH₂CH₃ [1]; but-2-ene CH₃CH=CHCH₃ [1]; 2-methylpropene CH₂=C(CH₃)₂ [1].',3],
  ['Explain why but-2-ene has two stereoisomers but but-1-ene does not.','Rotation about the C=C is restricted by the π bond [1]. Each carbon of the C=C in but-2-ene carries two different groups (H and CH₃); in but-1-ene one carbon has two H atoms [1].',2],
  ['Draw the E and Z isomers of but-2-ene and label them.','Z: both CH₃ groups on the same side of the double bond [1]; E: the CH₃ groups on opposite sides [1].',2],
  ['Name a cyclic isomer of C₄H₈.','Cyclobutane (or methylcyclopropane) [1].',1]]},
 {only:'s',fmt:'essay',title:'Optical isomerism',stem:'2-Hydroxypropanoic acid (lactic acid), CH₃CH(OH)COOH, exists as two optical isomers.',parts:[
  ['Explain what is meant by optical isomerism, using lactic acid as an example. Draw three-dimensional structures of the two isomers.','The molecule has a chiral carbon bonded to four different groups: H, CH₃, OH and COOH [1]. The isomers are non-superimposable mirror images [1]. Correct 3D (wedge and dash) drawings [1] shown as mirror images [1].',4],
  ['How can the two isomers be distinguished? What is a racemic mixture?','They rotate plane-polarised light by the same angle in opposite directions [1]. A racemic mixture contains equal amounts of the two, so it has no overall effect on plane-polarised light [1]. Otherwise their physical and chemical properties are the same, except towards other chiral molecules [1].',3],
  ['Lactic acid made by adding HCN to ethanal and hydrolysing the product is optically inactive. Explain.','The C=O group is planar (trigonal) [1]. CN⁻ attacks from either side with equal probability [1], so equal amounts of the two enantiomers form: a racemic mixture [1].',3]]}]};

X.pu['pu-alkane']={qs:[
 Q('What is the general formula of the cycloalkanes?',['CₙH₂ₙ','CₙH₂ₙ₊₂','CₙH₂ₙ₋₂','CₙHₙ'],'Closing the ring removes two hydrogens compared with the open-chain alkane.'),
 Q('What are the products of the complete combustion of propane?',['CO₂ and H₂O','CO and H₂O','C and H₂O','CO₂ and H₂'],'C₃H₈ + 5O₂ → 3CO₂ + 4H₂O'),
 Q('How many moles of O₂ are needed to burn one mole of butane completely?',['6.5','4','5','13'],'C₄H₁₀ + 6½O₂ → 4CO₂ + 5H₂O'),
 Q('Which equation is the initiation step when methane reacts with chlorine?',['Cl₂ → 2Cl•','CH₄ + Cl• → CH₃• + HCl','CH₃• + Cl₂ → CH₃Cl + Cl•','2Cl• → Cl₂'],'UV light breaks the Cl–Cl bond homolytically.'),
 Q('Why do branched alkanes boil at lower temperatures than their straight-chain isomers?',['Less surface contact between molecules, so weaker London forces','They have fewer electrons','They are more polar','Their covalent bonds are weaker'],'Branched molecules are more compact and can’t pack as closely.'),
 Q('What is the mechanism of the reaction between methane and chlorine?',['Free-radical substitution','Electrophilic addition','Nucleophilic substitution','Electrophilic substitution'],'Radicals carry a chain reaction that replaces H with Cl.'),
 Q('Which product of incomplete combustion is a black solid?',['Carbon (soot)','Carbon monoxide','Carbon dioxide','Water'],'With very little oxygen, some carbon is not oxidised at all.'),
 Q('What is the main purpose of cracking?',['To turn long-chain alkanes into more useful shorter alkanes and alkenes','To remove sulfur from fuels','To make alkanes from alkenes','To separate crude oil into fractions'],'Short-chain fuels and alkenes (for polymers) are in higher demand.'),
 Q('Which gas formed when fossil fuels burn is a main cause of acid rain?',['SO₂','CO','CH₄','N₂'],'Sulfur impurities burn to SO₂, which forms sulfuric acid in the air.'),
 Q('How many structural isomers of C₃H₇Cl can form when propane is chlorinated?',['2','1','3','4'],'1-Chloropropane and 2-chloropropane.'),
 Q('Why does a mixture of products form when ethane reacts with excess chlorine?',['Cl• radicals go on to substitute further H atoms in the chloroethane','Ethane decomposes into methane','Chlorine adds across C–C bonds','The reaction is reversible'],'Dichloro-, trichloro- and more highly substituted products form.'),
 Q('Which metals are the catalysts in a car’s catalytic converter?',['Platinum and rhodium (with palladium)','Iron','Nickel','Vanadium(V) oxide'],'They catalyse the oxidation of CO and hydrocarbons and the reduction of NO.'),
 Q('How many monochloro structural isomers form when 2-methylbutane is chlorinated?',['4','3','5','6'],'There are four different kinds of hydrogen atom.','jn'),
 Q('Which has the highest boiling point?',['n-Pentane','Isopentane (2-methylbutane)','Neopentane (2,2-dimethylpropane)','n-Butane'],'Same Mᵣ for the three pentanes; the straight chain has the most surface contact.','jn')],
xp:[
 {only:'asi',fmt:'struct',title:'Chlorination of methane',stem:'Methane reacts with chlorine to form chloromethane and other products.',parts:[
  ['State the condition needed.','Ultraviolet light (or sunlight) [1].',1],
  ['Write equations for the initiation step, two propagation steps and one termination step.','Cl₂ → 2Cl• [1]. CH₄ + Cl• → CH₃• + HCl [1]. CH₃• + Cl₂ → CH₃Cl + Cl• [1]. For example CH₃• + Cl• → CH₃Cl, or 2CH₃• → C₂H₆ [1].',4],
  ['Explain why the product is a mixture of chloromethanes, and how the yield of CH₃Cl can be increased.','Cl• also removes H from CH₃Cl, giving CH₂Cl₂, CHCl₃ and CCl₄ [1]. Use an excess of methane [1].',2],
  ['Ethane is found in small amounts among the products. Explain.','Two methyl radicals combine in a termination step [1].',1]]},
 {only:'j',fmt:'nvt',title:'Alkanes: integer answers',stem:'Give each answer as an integer.',parts:[
  ['The number of monochlorinated structural isomers formed from 2-methylbutane.','4',4],
  ['The number of moles of O₂ needed to burn 2 mol of propane completely.','C₃H₈ + 5O₂, so 10.',4],
  ['The number of different alkanes formed when a mixture of CH₃Br and C₂H₅Br undergoes the Wurtz reaction.','Ethane, propane and butane: 3.',4]]}]};

X.pu['pu-alkene']={qs:[
 Q('Which reagent is used to test for a C=C bond?',['Bromine water, which is decolourised','Acidified K₂Cr₂O₇','Tollens’ reagent','Sodium carbonate'],'Bromine adds across the C=C, and the orange colour disappears.'),
 Q('What is the major product when HCl adds to 2-methylpropene?',['2-Chloro-2-methylpropane','1-Chloro-2-methylpropane','2-Chlorobutane','1-Chlorobutane'],'The reaction goes through the more stable tertiary carbocation.'),
 Q('Which conditions are used to hydrogenate an alkene?',['H₂ with a nickel catalyst at about 150 °C','Fe catalyst at 450 °C','Concentrated H₂SO₄','UV light'],'Used to harden vegetable oils into margarine.'),
 Q('What is the main organic product when ethene reacts with bromine water?',['2-Bromoethan-1-ol (with some 1,2-dibromoethane)','Only 1,2-dibromoethane','Bromoethane','Ethane-1,2-diol'],'Water is present in large excess and attacks the intermediate.'),
 Q('What type of polymerisation do alkenes undergo?',['Addition','Condensation','Step-growth with loss of water','Hydrolysis'],'The C=C bonds open and join, with no small molecule lost.'),
 Q('Which carbocation forms on the way to the major product when HBr adds to propene?',['CH₃CH⁺CH₃','CH₃CH₂CH₂⁺','⁺CH₂CH=CH₂','(CH₃)₃C⁺'],'The secondary carbocation is more stable than the primary one.'),
 Q('Hot, concentrated, acidified KMnO₄ oxidises 2-methylpropene to propanone and:',['Carbon dioxide (and water)','Methanal','Ethanoic acid','Methanoic acid'],'A =CH₂ end of a double bond is oxidised all the way to CO₂.'),
 Q('Hot, concentrated KMnO₄ turns an alkene into propanone and ethanoic acid. Which alkene was it?',['2-Methylbut-2-ene','2-Methylbut-1-ene','Pent-2-ene','3-Methylbut-1-ene'],'(CH₃)₂C=CHCH₃: the (CH₃)₂C= end gives propanone, the =CHCH₃ end gives ethanoic acid.'),
 Q('What role does the C=C bond play in electrophilic addition?',['It donates a pair of electrons to the electrophile','It accepts electrons from a nucleophile','It breaks homolytically','It is not involved'],'The π electrons attack the δ+ end of the electrophile.'),
 Q('What is the repeat unit of poly(ethene)?',['–CH₂–CH₂–','–CH=CH–','–CH₂–','–CH₂–CH₂–O–'],'The double bond opens up to link the monomers.'),
 Q('Why does ethene take part in addition rather than substitution reactions?',['The weak π bond breaks easily, and two new σ bonds form','Ethene has no hydrogen atoms','C=C is weaker than C–C','Substitution needs UV light'],'Breaking a π bond and forming two σ bonds is energetically favourable.'),
 Q('What does Markovnikov’s rule state for the addition of HX to an unsymmetrical alkene?',['H adds to the carbon that already has more hydrogen atoms','X adds to the carbon that has more hydrogen atoms','The least substituted alkene forms','Radicals add to the less substituted end'],'Equivalent to going through the more stable carbocation.'),
 Q('Ozonolysis of but-2-ene, followed by Zn and water, gives:',['Ethanal only','Propanal and methanal','Ethanoic acid','Propanone'],'The C=C splits into two identical CH₃CHO fragments.','jn'),
 Q('Which alkene is the most stable?',['2,3-Dimethylbut-2-ene','But-1-ene','Propene','Ethene'],'The more alkyl groups on the C=C, the more hyperconjugation and the lower its heat of hydrogenation.','jn')],
xp:[
 {only:'asi',fmt:'struct',title:'Electrophilic addition to propene',stem:'Propene reacts with hydrogen bromide at room temperature.',parts:[
  ['Name the mechanism.','Electrophilic addition [1].',1],
  ['Draw the mechanism for the formation of the major product. Show curly arrows, dipoles and the intermediate.','Hδ+–Brδ− dipole, with a curly arrow from the C=C to H and from the H–Br bond to Br [1]. Secondary carbocation CH₃CH⁺CH₃ and Br⁻ [1]. Curly arrow from a lone pair on Br⁻ to C⁺ [1]. Product 2-bromopropane [1].',4],
  ['Explain why 2-bromopropane is the major product.','It forms via a secondary carbocation, which is more stable than the primary carbocation [1], because the two alkyl groups donate electron density (positive inductive effect) [1].',2],
  ['Draw the repeat unit of poly(propene) and suggest one problem with its disposal.','–CH₂–CH(CH₃)– [1]. It is not biodegradable (strong, non-polar bonds), and burning it releases CO₂ (or toxic gases if the burning is incomplete) [1].',2]]},
 {only:'s',fmt:'essay',title:'Reactions of but-1-ene',stem:'But-1-ene is a typical alkene.',parts:[
  ['Describe the reactions of but-1-ene with (i) H₂, (ii) HBr, (iii) cold, dilute, acidified KMnO₄ and (iv) hot, concentrated, acidified KMnO₄. Give the conditions and name the organic products.','(i) Butane; Ni catalyst, about 150 °C [2]. (ii) 2-Bromobutane (major) at room temperature [2]. (iii) Butane-1,2-diol; purple to colourless [2]. (iv) Propanoic acid and CO₂ (and water) [2].',8],
  ['Explain how oxidation with hot, concentrated KMnO₄ can be used to locate the double bond in an unknown alkene.','The C=C bond is broken and each end becomes C=O: a =CH₂ end gives CO₂, a =CHR end gives RCOOH and a =CR₂ end gives a ketone [2]. Identifying the products shows where the double bond was [1].',3]]}]};

X.pu['pu-arene']={qs:[
 Q('Which describes the shape of a benzene molecule?',['A planar hexagon with all C–C bonds the same length','A ring of alternating long and short bonds','A chair-shaped ring','A non-planar ring'],'The delocalised π system makes every C–C bond intermediate between single and double.'),
 Q('What is the C–C–C bond angle in benzene?',['120°','109.5°','90°','180°'],'Each carbon is sp² hybridised and trigonal planar.'),
 Q('Which catalyst is used to brominate benzene?',['FeBr₃ (or iron filings)','UV light','Nickel','Concentrated H₂SO₄'],'FeBr₃ polarises Br₂ to form the electrophile.'),
 Q('What type of mechanism does benzene undergo with electrophiles?',['Electrophilic substitution','Electrophilic addition','Nucleophilic substitution','Free-radical addition'],'Substitution keeps the delocalised ring intact.'),
 Q('Below what temperature is benzene nitrated to give mainly nitrobenzene?',['55 °C','0 °C','100 °C','200 °C'],'At higher temperatures, more than one nitro group is added.'),
 Q('Which equation shows the formation of the nitronium ion?',['HNO₃ + 2H₂SO₄ → NO₂⁺ + H₃O⁺ + 2HSO₄⁻','HNO₃ → NO₂⁺ + OH⁻','HNO₃ + H₂O → NO₃⁻ + H₃O⁺','H₂SO₄ → SO₃ + H₂O'],'Sulfuric acid is the stronger acid and protonates nitric acid, which loses water.'),
 Q('Methylbenzene reacts with Cl₂ in the presence of AlCl₃, in the dark. What are the main products?',['2-Chloromethylbenzene and 4-chloromethylbenzene','(Chloromethyl)benzene','3-Chloromethylbenzene','Methylcyclohexane'],'With a halogen carrier, substitution happens on the ring; CH₃ directs to positions 2 and 4.'),
 Q('Which substituent directs an incoming electrophile to the 3-position (meta)?',['–NO₂','–OH','–CH₃','–NH₂'],'Electron-withdrawing groups such as NO₂, COOH and CHO are 3-directing.'),
 Q('Why is methylbenzene nitrated faster than benzene?',['The methyl group donates electron density, making the ring more attractive to electrophiles','The methyl group is 3-directing','Methylbenzene has more π electrons','It reacts by a radical mechanism'],'An electron-rich ring reacts faster with electrophiles.'),
 Q('What is the main product of benzene with chloroethane and AlCl₃?',['Ethylbenzene','Chlorobenzene','Phenylethanone','Ethylcyclohexane'],'Friedel–Crafts alkylation.'),
 Q('What forms when benzene is heated with hydrogen over a nickel catalyst at about 200 °C?',['Cyclohexane','Cyclohexene','Hexane','Methylcyclopentane'],'Addition of three moles of H₂ destroys the aromatic ring.'),
 Q('How many isomers of dichlorobenzene are there?',['3','2','4','6'],'1,2-, 1,3- and 1,4-dichlorobenzene.'),
 Q('Which compound is not aromatic?',['Cyclooctatetraene','Benzene','Pyridine','Thiophene'],'It has 8 π electrons, so it doesn’t obey the 4n + 2 rule, and the ring is not planar.','jn'),
 Q('Which compound reacts fastest in electrophilic substitution?',['Anisole (methoxybenzene)','Benzene','Nitrobenzene','Chlorobenzene'],'The OCH₃ group donates electrons into the ring by resonance.','jn')],
xp:[
 {only:'asi',fmt:'struct',title:'Nitration of benzene',stem:'Benzene is converted into nitrobenzene, which is used to make dyes.',parts:[
  ['State the reagents and conditions.','Concentrated nitric acid and concentrated sulfuric acid [1]; below 55 °C (about 50 °C) [1].',2],
  ['Write an equation to show how the electrophile forms.','HNO₃ + 2H₂SO₄ → NO₂⁺ + H₃O⁺ + 2HSO₄⁻ (or HNO₃ + H₂SO₄ → NO₂⁺ + HSO₄⁻ + H₂O) [1].',1],
  ['Draw the mechanism of the reaction.','Curly arrow from the delocalised ring to the N of NO₂⁺ [1]. Intermediate with a partial (horseshoe) ring and a positive charge, with H and NO₂ on the same carbon [1]. Curly arrow from the C–H bond back into the ring, with loss of H⁺ [1].',3],
  ['Explain why benzene reacts by substitution rather than addition.','The delocalised π electrons give benzene extra stability [1]. Substitution keeps the delocalised ring; addition would destroy it [1].',2]]},
 {only:'j',fmt:'nvt',title:'Arenes: integer answers',stem:'Give each answer as an integer.',parts:[
  ['The number of π electrons in benzene.','6',4],
  ['The number of structural isomers of trichlorobenzene.','1,2,3-, 1,2,4- and 1,3,5-: 3.',4],
  ['The number of sp² carbon atoms in methylbenzene.','The six ring carbons: 6.',4]]}]};

X.pu['pu-halo']={qs:[
 Q('Which compound is a tertiary halogenoalkane?',['2-Bromo-2-methylpropane','1-Bromobutane','2-Bromobutane','1-Bromo-2-methylpropane'],'The C–Br carbon is bonded to three other carbons.'),
 Q('Which conditions convert 1-bromopropane into propylamine?',['Excess ammonia in ethanol, heated in a sealed tube','Dilute HCl','NaOH in water','KCN in ethanol'],'Excess NH₃ reduces further substitution of the amine.'),
 Q('Which carbon–halogen bond is the weakest?',['C–I','C–Br','C–Cl','C–F'],'Bond enthalpy falls as the halogen atom gets larger.'),
 Q('Why are iodoalkanes hydrolysed faster than chloroalkanes?',['The C–I bond is weaker, so it breaks more easily','The C–I bond is more polar','I⁻ is a better nucleophile','Iodine is more electronegative than chlorine'],'Bond strength matters more than bond polarity here.'),
 Q('What is the nucleophile when a halogenoalkane is hydrolysed by aqueous NaOH?',['OH⁻','Na⁺','H₂O only','Br⁻'],'The hydroxide ion attacks the δ+ carbon.'),
 Q('Which describes the transition state in an SN2 reaction?',['The nucleophile and leaving group are both partly bonded to the carbon','A carbocation','A free radical','A carbanion'],'Bond making and breaking happen at the same time, in one step.'),
 Q('What forms when 2-bromobutane is heated with KOH in ethanol?',['A mixture of but-1-ene and but-2-ene','Butan-2-ol only','Butane','2-Ethoxybutane only'],'Elimination can remove an H from either neighbouring carbon.'),
 Q('What is the rate equation for the reaction of bromoethane with OH⁻ ions?',['rate = k[C₂H₅Br][OH⁻]','rate = k[C₂H₅Br]','rate = k[OH⁻]','rate = k[C₂H₅Br]²'],'A primary halogenoalkane reacts by SN2, a one-step reaction involving both species.'),
 Q('What forms when bromoethane is heated with KCN in ethanol?',['Propanenitrile','Ethanenitrile','Ethylamine','Ethanol'],'CN⁻ replaces Br, adding one carbon: CH₃CH₂CN.'),
 Q('Which procedure identifies the halogen in a halogenoalkane?',['Warm with NaOH(aq), acidify with dilute HNO₃, then add AgNO₃(aq)','Add AgNO₃(aq) to the halogenoalkane and look for a precipitate straight away','Add bromine water','Add Fehling’s solution'],'Hydrolysis releases the halide ion; acid removes OH⁻, which would precipitate Ag₂O.'),
 Q('What colour is the precipitate formed in the silver nitrate test for an iodoalkane?',['Yellow','White','Cream','Brown'],'AgI is yellow, AgBr cream and AgCl white.'),
 Q('What does SN1 stand for?',['Unimolecular nucleophilic substitution, through a carbocation','Bimolecular nucleophilic substitution in one step','Free-radical substitution','Elimination through a carbanion'],'Only the halogenoalkane is involved in the slow, rate-determining step.'),
 Q('Which compound reacts fastest by SN1?',['Benzyl chloride, C₆H₅CH₂Cl','Chlorobenzene','1-Chloropropane','Chloromethane'],'The benzyl carbocation is stabilised by resonance with the ring.','jn'),
 Q('Chlorobenzene reacts with Cl₂ and FeCl₃. What are the main products?',['1,2- and 1,4-dichlorobenzene','1,3-Dichlorobenzene','Hexachlorocyclohexane','Benzyl chloride'],'Cl is deactivating but directs to positions 2 and 4.','jn')],
xp:[
 {only:'asi',fmt:'struct',title:'Rates of hydrolysis',stem:'Equal amounts of 1-chlorobutane, 1-bromobutane and 1-iodobutane are warmed in separate tubes with aqueous silver nitrate in ethanol.',parts:[
  ['State what is seen in each tube, and the order in which the precipitates appear.','Iodo: yellow; bromo: cream; chloro: white [1]. The iodo compound gives a precipitate first and the chloro compound last [1].',2],
  ['Explain this order.','The C–I bond is the weakest (lowest bond enthalpy), so it breaks fastest [1]; bond strength matters more than bond polarity [1].',2],
  ['Draw the mechanism for the reaction of 1-bromobutane with OH⁻ ions.','δ+ on C and δ− on Br, with a curly arrow from a lone pair on OH⁻ to the δ+ carbon [1]. Curly arrow from the C–Br bond to Br [1]. Products butan-1-ol and Br⁻ (transition state shown or implied) [1].',3],
  ['Name this mechanism, and explain why 2-bromo-2-methylpropane reacts by a different mechanism.','SN2 [1]. In the tertiary compound, the methyl groups block attack from the back, and the tertiary carbocation is stabilised by three alkyl groups, so it reacts by SN1 [1].',2]]},
 {only:'j',fmt:'nvt',title:'Halogenoalkanes: integer answers',stem:'Give each answer as an integer.',parts:[
  ['The number of structural isomers with the formula C₄H₉Cl.','1-chlorobutane, 2-chlorobutane, 1-chloro-2-methylpropane and 2-chloro-2-methylpropane: 4.',4],
  ['How many of the isomers in (a) are chiral?','Only 2-chlorobutane: 1.',4],
  ['The number of moles of AgCl precipitated when 1 mol of CH₂ClCH₂Cl is fully hydrolysed and treated with excess AgNO₃.','2',4]]}]};

X.pu['pu-oh']={qs:[
 Q('What forms when ethanol reacts with sodium?',['Sodium ethoxide and hydrogen','Sodium hydroxide and ethane','Ethene and water','Sodium ethanoate'],'2C₂H₅OH + 2Na → 2C₂H₅ONa + H₂'),
 Q('What forms when ethanol is warmed with ethanoic acid and a few drops of concentrated H₂SO₄?',['Ethyl ethanoate','Methyl ethanoate','Ethanal','Ethoxyethane'],'An esterification; the acid is a catalyst.'),
 Q('What forms when ethanol is heated under reflux with excess acidified K₂Cr₂O₇?',['Ethanoic acid','Ethanal','Ethene','Ethyl ethanoate'],'Under reflux, the aldehyde stays in the flask and is oxidised further.'),
 Q('Which is a secondary alcohol?',['Butan-2-ol','Butan-1-ol','2-Methylpropan-2-ol','Methanol'],'The C bearing the OH is bonded to two other carbons.'),
 Q('Which reagents convert ethanol into bromoethane?',['KBr and concentrated H₂SO₄','Br₂ in UV light','Bromine water','NaBr(aq) on its own'],'The two react to give HBr in the flask.'),
 Q('Why do alcohols have higher boiling points than alkanes of similar Mᵣ?',['Hydrogen bonds form between their OH groups','They have more electrons','They contain ionic bonds','Their molecules are planar'],'Extra energy is needed to break the hydrogen bonds.'),
 Q('What forms when butan-2-ol is dehydrated?',['A mixture of but-1-ene, (E)-but-2-ene and (Z)-but-2-ene','But-1-ene only','But-2-ene only','Butane'],'Water can be lost with an H from either neighbouring carbon.'),
 Q('What is the role of concentrated H₂SO₄ when ethanol is dehydrated?',['A catalyst and dehydrating agent','An oxidising agent','A reducing agent','A nucleophile'],'It protonates the OH, which then leaves as water.'),
 Q('Which alcohol is the most soluble in water?',['Methanol','Butan-1-ol','Pentan-1-ol','Hexan-1-ol'],'The longer the hydrocarbon chain, the less soluble the alcohol.'),
 Q('Propan-1-ol is oxidised and the product is distilled off as it forms. The product gives a silver mirror with Tollens’ reagent. What is it?',['Propanal','Propanone','Propanoic acid','Propan-2-ol'],'Distilling it off stops the aldehyde from being oxidised further.'),
 Q('How many alcohols have the formula C₄H₁₀O?',['4','3','2','7'],'Butan-1-ol, butan-2-ol, 2-methylpropan-1-ol and 2-methylpropan-2-ol.'),
 Q('What forms when ethanol reacts with ethanoyl chloride?',['Ethyl ethanoate','Ethanoic acid','Ethanamide','Chloroethane'],'A fast, irreversible way to make an ester; HCl is also formed.'),
 Q('Which alcohol reacts fastest with HBr?',['2-Methylpropan-2-ol','Butan-1-ol','Butan-2-ol','Methanol'],'Tertiary alcohols react by SN1 through a stable tertiary carbocation.','jn'),
 Q('In the Victor Meyer test, what colour does a secondary alcohol give?',['Blue','Red','Colourless','Green'],'Primary: red; secondary: blue; tertiary: colourless.','jn')],
xp:[
 {only:'asi',fmt:'struct',title:'Identifying three alcohols',stem:'Alcohols A, B and C are isomers of C₄H₁₀O. A is oxidised by acidified K₂Cr₂O₇ to a ketone. B is oxidised to a carboxylic acid. C is not oxidised.',parts:[
  ['Give the structures of A, B and C.','A: butan-2-ol, CH₃CH(OH)CH₂CH₃ [1]. B: butan-1-ol or 2-methylpropan-1-ol [1]. C: 2-methylpropan-2-ol, (CH₃)₃COH [1].',3],
  ['State the colour change of the dichromate when A is oxidised.','Orange to green [1].',1],
  ['Describe how the oxidation of B can be stopped at the aldehyde.','Use excess alcohol (limited oxidising agent) [1] and distil the aldehyde off as it forms [1].',2],
  ['A gives a yellow precipitate with alkaline aqueous iodine. Explain why, and name the precipitate.','A contains the CH₃CH(OH)– group [1]. The precipitate is tri-iodomethane (iodoform), CHI₃ [1].',2]]},
 {only:'s',fmt:'essay',title:'Alcohols: classification and reactions',stem:'The alcohols with formula C₃H₈O are propan-1-ol and propan-2-ol.',parts:[
  ['Explain what is meant by primary and secondary alcohols, using these two examples. Describe how acidified potassium dichromate(VI) can be used to tell them apart, with equations using [O].','Propan-1-ol is primary: the carbon bearing OH is bonded to one other carbon; propan-2-ol is secondary: bonded to two [2]. CH₃CH₂CH₂OH + [O] → CH₃CH₂CHO + H₂O, then + [O] → CH₃CH₂COOH [2]. CH₃CH(OH)CH₃ + [O] → CH₃COCH₃ + H₂O [1]. Test the distilled product: the aldehyde gives a silver mirror (Tollens’) or a brick-red precipitate (Fehling’s); the ketone does not [2].',7],
  ['Describe how propan-2-ol can be converted into propene. Name the type of reaction and give an equation.','Heat with excess concentrated H₂SO₄ (about 170 °C), or pass the vapour over hot Al₂O₃ [1]. Elimination (dehydration) [1]. CH₃CH(OH)CH₃ → CH₃CH=CH₂ + H₂O [1].',3]]}]};

X.pu['pu-phenol']={qs:[
 Q('What forms when phenol reacts with sodium?',['Sodium phenoxide and hydrogen','Sodium benzoate','Benzene and NaOH','There is no reaction'],'2C₆H₅OH + 2Na → 2C₆H₅ONa + H₂'),
 Q('Why is phenol more acidic than ethanol?',['The negative charge on the phenoxide ion is delocalised into the ring','Phenol has more hydrogen atoms','The ethoxide ion is stabilised by its ethyl group','Phenol forms hydrogen bonds'],'Spreading the charge stabilises the anion, so phenol gives up H⁺ more easily.'),
 Q('How many moles of Br₂ react with one mole of phenol in bromine water?',['3','1','2','6'],'2,4,6-Tribromophenol forms, with 3HBr.'),
 Q('What forms when phenol reacts with ethanoyl chloride?',['Phenyl ethanoate','Ethyl benzoate','Benzoic acid','Phenylethanone'],'An ester forms, with HCl.'),
 Q('Why are phenyl esters made from acyl chlorides rather than carboxylic acids?',['Phenol is a poor nucleophile and reacts too slowly with carboxylic acids','Phenol is too acidic','Carboxylic acids oxidise phenol','The acid would nitrate the ring'],'The O lone pair is delocalised into the ring, so it is less available.'),
 Q('At which ring positions does the OH group of phenol direct electrophiles?',['2, 4 and 6','3 and 5','4 only','1 only'],'OH is a strongly activating, 2,4-directing group.'),
 Q('What forms when phenol reacts with concentrated nitric acid?',['2,4,6-Trinitrophenol','4-Nitrophenol only','Nitrobenzene','Benzoic acid'],'The highly activated ring is nitrated three times.'),
 Q('Which statement about phenol is correct?',['It is a weak acid with a pKa of about 10','It is a strong acid','It is a weak base','It is neutral'],'Weaker than carboxylic acids (pKa about 4–5) but stronger than alcohols (about 16).'),
 Q('Which reagent distinguishes phenol from phenylmethanol, C₆H₅CH₂OH?',['Bromine water','Sodium','Ethanoyl chloride','Water'],'Only phenol gives a white precipitate. Both react with Na and with ethanoyl chloride.'),
 Q('What forms when benzenediazonium chloride is added to phenol in alkaline solution?',['A yellow-orange azo dye','A white precipitate of tribromophenol','Nitrogen gas only','Chlorobenzene'],'Coupling at the 4-position gives 4-hydroxyazobenzene.'),
 Q('Phenol is heated with CHCl₃ and NaOH (the Reimer–Tiemann reaction). What is the main product?',['2-Hydroxybenzaldehyde (salicylaldehyde)','Benzaldehyde','4-Chlorophenol','Benzoic acid'],'Dichlorocarbene attacks the activated ring, mainly at the 2-position.','jn'),
 Q('Which is the weakest acid?',['4-Methoxyphenol','Phenol','4-Nitrophenol','4-Chlorophenol'],'OCH₃ donates electrons into the ring and destabilises the phenoxide ion.','jn')],
xp:[
 {only:'asi',fmt:'struct',title:'The acidity and reactions of phenol',stem:'Phenol, C₆H₅OH, has some properties that alcohols do not share.',parts:[
  ['Write an equation for the reaction of phenol with aqueous sodium hydroxide.','C₆H₅OH + NaOH → C₆H₅O⁻Na⁺ + H₂O [1].',1],
  ['Explain why phenol is a stronger acid than ethanol.','A lone pair on the O of the phenoxide ion is delocalised into the ring [1], spreading the negative charge and stabilising the ion [1]. In the ethoxide ion the charge stays on O, and the ethyl group pushes electron density towards it [1].',3],
  ['Describe what is seen when bromine water is added to phenol. Give the equation, and explain why benzene needs a catalyst to react with bromine but phenol does not.','The orange colour disappears and a white precipitate forms [1]. C₆H₅OH + 3Br₂ → C₆H₂Br₃OH + 3HBr [1]. A lone pair on O is delocalised into the ring, increasing its electron density, so the ring can polarise Br₂ [1].',3]]},
 {only:'j',fmt:'nvt',title:'Phenols: integer answers',stem:'Give each answer as an integer.',parts:[
  ['The number of moles of Br₂ that react with one mole of phenol in bromine water.','3',4],
  ['The number of isomeric methylphenols (cresols).','2-, 3- and 4-methylphenol: 3.',4],
  ['The number of moles of NaOH that react with one mole of 2-hydroxybenzoic acid.','Both the –COOH and the phenolic –OH react: 2.',4]]}]};
})();
