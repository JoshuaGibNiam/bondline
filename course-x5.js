/* Bondline version 31: extra IChO course questions and olympiad-style problems. See course-x1.js for the format. */
(function(){
const X=window.BL_COURSE_X=window.BL_COURSE_X||{pu:{},ic:{},units:[]};
const Q=(prompt,opts,why)=>({prompt,opts,why});

X.ic.u1={qs:[
 Q('How many electrons does the nitrogen atom of pyridine contribute to the aromatic π system?',['1','2','0','3'],'Its lone pair sits in an sp² orbital in the plane of the ring; only one p electron joins the π system.'),
 Q('Which compound has the largest dipole moment?',['Pyridine','Benzene','Furan','Pyrrole'],'Pyridine about 2.2 D, pyrrole about 1.8 D (pointing the other way), furan about 0.7 D, benzene 0.'),
 Q('What is the hybridisation of the oxygen atom in furan?',['sp²','sp³','sp','sp³d'],'One lone pair is in a p orbital and part of the aromatic sextet.'),
 Q('Which ion is aromatic?',['Cyclopropenyl cation','Cyclopentadienyl cation','Cyclopropenyl anion','Cycloheptatrienyl anion'],'The cyclopropenyl cation has 2 π electrons (4n + 2, n = 0). The others have 4 or 8.'),
 Q('Which carbon–carbon bond is the longest?',['C–C in ethane','C–C in benzene','C=C in ethene','C≡C in ethyne'],'Bond order 1 (154 pm) > 1.5 (140 pm) > 2 (134 pm) > 3 (120 pm).'),
 Q('Why is the C2–C3 bond in buta-1,3-diene shorter than a typical C–C single bond?',['Conjugation gives partial π overlap, and the σ bond is between sp² carbons','It is a double bond','Hydrogen bonding pulls the atoms together','Steric strain'],'Both effects shorten it to about 147 pm.'),
 Q('How many sp³ carbon atoms are there in cyclohexene?',['4','2','6','0'],'The two alkene carbons are sp²; the other four are sp³.')],
xp:[]};

X.ic.u2={qs:[
 Q('How many stereoisomers does 1,2-dimethylcyclohexane have?',['3','2','4','1'],'The cis isomer is meso; the trans isomer exists as a pair of enantiomers.'),
 Q('Which compound is chiral?',['trans-1,2-Dimethylcyclopropane','cis-1,2-Dimethylcyclopropane','1,1-Dimethylcyclopropane','Methylcyclopropane'],'The cis isomer has a mirror plane; the trans isomer does not.'),
 Q('How many constitutional isomers have the formula C₃H₈O?',['3','2','4','5'],'Propan-1-ol, propan-2-ol and methoxyethane.'),
 Q('Which compound can show atropisomerism?',['A 2,2′,6,6′-tetrasubstituted biphenyl','Biphenyl','Propadiene','Ethane'],'Bulky ortho groups stop rotation about the central bond, so the twisted forms can be isolated.'),
 Q('Is the allene CH₃CH=C=CHCH₃ chiral?',['Yes: the groups at the two ends lie in perpendicular planes','No: it has no stereocentre','No: allenes are always planar','Only at low temperature'],'It has a chiral axis rather than a chiral centre.'),
 Q('How many stereoisomers does hexa-2,4-diene have?',['3','4','2','6'],'(2E,4E), (2Z,4Z) and (2E,4Z), which is the same as (2Z,4E).'),
 Q('Two enantiomers have identical:',['Melting points','Biological activity','Rates of reaction with a chiral reagent','Signs of optical rotation'],'Only chiral surroundings can tell them apart.')],
xp:[]};

X.ic.u3={qs:[
 Q('Which is the strongest base?',['CH₃⁻','NH₂⁻','OH⁻','F⁻'],'Conjugate base of the weakest acid (CH₄, pKa about 50).'),
 Q('Which has the lowest pKa?',['H₂O','NH₃','CH₄','They are equal'],'O is the most electronegative, so OH⁻ is the most stable conjugate base.'),
 Q('Which halide is the best nucleophile in DMSO?',['F⁻','I⁻','Br⁻','Cl⁻'],'In a polar aprotic solvent, anions are not hydrogen bonded, so nucleophilicity follows basicity.'),
 Q('Which species is a Lewis acid but not a Brønsted–Lowry acid?',['AlCl₃','HCl','H₂O','NH₄⁺'],'It accepts an electron pair but has no proton to donate.'),
 Q('Which is the strongest acid?',['Phenol','Cyclohexanol','Ethanol','Water'],'Phenol (pKa about 10) is stabilised by delocalisation of the phenoxide charge.'),
 Q('Ethanoic acid has pKa 4.76. At pH 6.76, what is the ratio [CH₃COO⁻] : [CH₃COOH]?',['100 : 1','2 : 1','1 : 100','10 : 1'],'pH − pKa = 2, so the ratio is 10².'),
 Q('Which carbocation is the most stable?',['Tropylium, C₇H₇⁺','Benzyl, C₆H₅CH₂⁺','Isopropyl, (CH₃)₂CH⁺','Methyl, CH₃⁺'],'The tropylium ion is aromatic (6 π electrons) and can be isolated as a salt.')],
xp:[]};

X.ic.u4={qs:[
 Q('Which solvent most favours an SN2 reaction with an anionic nucleophile?',['DMSO','Water','Methanol','Ethanol'],'Polar aprotic solvents leave the anion unsolvated and reactive.'),
 Q('Why does 1-bromo-2,2-dimethylpropane (neopentyl bromide) react extremely slowly by SN2?',['The tert-butyl group blocks attack from the back','It is a tertiary halide','Br⁻ is a poor leaving group','It forms a stable carbocation'],'Although primary, it is very hindered next to the reacting carbon.'),
 Q('Which alkene is usually the major product of an E1 reaction?',['The more substituted (Zaitsev) alkene','The less substituted alkene','Only the Z alkene','An alkene with no rearrangement possible'],'E1 goes through a carbocation and gives the more stable alkene.'),
 Q('3-Methylbutan-2-ol reacts with HBr. Which rearrangement occurs?',['A hydride shift that gives a tertiary carbocation','A methyl shift that gives a primary carbocation','No rearrangement','A ring expansion'],'The main product is 2-bromo-2-methylbutane.'),
 Q('Which reacts fastest by SN2?',['CH₃I','(CH₃)₂CHI','(CH₃)₃CI','CH₃CH₂I'],'Least hindered carbon.'),
 Q('Why does the Finkelstein reaction (NaI in acetone) go to completion?',['NaCl and NaBr are insoluble in acetone and precipitate','I⁻ is a weak nucleophile','Acetone is a protic solvent','It goes by SN1'],'Removing a product pulls the equilibrium across (Le Châtelier).'),
 Q('(S)-3-Chloro-3-methylhexane undergoes solvolysis in water. What is the stereochemical outcome?',['Mostly racemised, with a slight excess of inversion','Complete inversion','Complete retention','No reaction'],'SN1 through a planar carbocation; ion pairing slightly shields the front face.')],
xp:[{fmt:'olymp',title:'Solvolysis of tert-butyl halides',stem:'2-Chloro-2-methylpropane, (CH₃)₃CCl, reacts slowly in 80% aqueous ethanol at 25 °C. Adding NaOH does not change the rate.',parts:[
 ['Write the rate law, and outline the mechanism with curly arrows.','rate = k[(CH₃)₃CCl] [1]. Slow ionisation to (CH₃)₃C⁺ and Cl⁻; fast attack of water (or ethanol) on the carbocation, then loss of H⁺ [1].',2],
 ['Give the structures of three organic products formed in this solvent mixture.','(CH₃)₃COH and (CH₃)₃COCH₂CH₃ from substitution [1]; CH₂=C(CH₃)₂ from E1 elimination [1].',2],
 ['Predict, with a reason, how the rate changes if the solvent is changed to 60% aqueous ethanol.','Faster [1]: a more polar, more protic solvent stabilises the carbocation and the charge-separated transition state leading to it [1].',2],
 ['Explain why (CH₃)₃CBr reacts faster than (CH₃)₃CCl under the same conditions.','The C–Br bond is weaker, and Br⁻ is a better (more stable, more polarisable) leaving group [1].',1],
 ['The reaction is repeated with (S)-3-chloro-3-methylhexane. Predict the stereochemistry of the alcohol product and explain.','Almost racemic [1]: the planar carbocation is attacked from both faces, with a small excess of inversion because the departing Cl⁻ partly blocks one face [1].',2]]}]};

X.ic.u5={qs:[
 Q('Which reagent converts an alkene into an epoxide?',['mCPBA','OsO₄','O₃','BH₃'],'A peroxyacid transfers an oxygen atom in one concerted step.'),
 Q('How does hydroboration–oxidation add H and OH across a C=C bond?',['Syn addition, with OH on the less substituted carbon','Anti addition, Markovnikov','Syn addition, Markovnikov','Anti addition, anti-Markovnikov'],'Boron adds to the less hindered carbon, then is replaced by OH with retention.'),
 Q('Which pair of functional groups is at the same oxidation level?',['An alkyne and a ketone','An alcohol and a ketone','An alkane and an alcohol','An aldehyde and a carboxylic acid'],'Hydration converts an alkyne into a ketone with no oxidation or reduction.'),
 Q('Which base is strong enough to deprotonate a terminal alkyne (pKa about 25) completely?',['NaNH₂','NaOH','NaHCO₃','H₂O'],'NH₃ has pKa about 38, so NH₂⁻ is a strong enough base.'),
 Q('Propene reacts with Br₂ in water. What is the main product?',['1-Bromopropan-2-ol','2-Bromopropan-1-ol','1,2-Dibromopropane only','Propan-2-ol'],'Water opens the bromonium ion at the more substituted carbon.'),
 Q('1,2-Dimethylcyclohexene is hydrogenated with H₂ and Pd/C. What forms?',['cis-1,2-Dimethylcyclohexane','trans-1,2-Dimethylcyclohexane','A racemic trans mixture','1,2-Dimethylbenzene'],'Both H atoms add to the same face on the metal surface.'),
 Q('How many moles of H₂ does one mole of hexa-1,3,5-triene take up with Pd/C?',['3','2','6','1'],'One mole of H₂ for each C=C bond.')],
xp:[]};

X.ic.u6={qs:[
 Q('Which substituent activates a benzene ring most strongly towards electrophiles?',['–NH₂','–CH₃','–Cl','–COCH₃'],'The N lone pair donates strongly into the ring by resonance.'),
 Q('Why does Friedel–Crafts acylation not give polysubstitution?',['The acyl group deactivates the ring','AlCl₃ is used up','Acylium ions are too stable','The product precipitates'],'After one acyl group goes on, the ring is less reactive than benzene.'),
 Q('Benzene reacts with 1-chlorobutane and AlCl₃. Why is the main product (1-methylpropyl)benzene?',['The primary carbocation (or complex) rearranges to a secondary one','Steric hindrance','Meta direction','A radical mechanism'],'A 1,2-hydride shift gives the more stable cation.'),
 Q('Nitrobenzene reacts with Br₂ and FeBr₃. What is the main product?',['1-Bromo-3-nitrobenzene','1-Bromo-2-nitrobenzene','1-Bromo-4-nitrobenzene','There is never any reaction'],'NO₂ is deactivating and 3-directing.'),
 Q('In which order should methylbenzene be treated to make 4-nitrobenzoic acid?',['Nitrate, then oxidise','Oxidise, then nitrate','Brominate, then nitrate','Nitrate twice'],'CH₃ directs to position 4; oxidising first would give a 3-directing COOH.'),
 Q('What is the arenium (Wheland) intermediate?',['A carbocation with the positive charge delocalised over three ring carbons','An anion','A radical','An aromatic ion'],'One ring carbon is sp³, so the ring is no longer aromatic.'),
 Q('Why can the sulfonation of benzene be reversed?',['Heating benzenesulfonic acid with dilute aqueous acid removes the SO₃H group','SO₃ is a gas','It is a radical reaction','The product is unstable at room temperature'],'This makes SO₃H useful as a temporary blocking group.')],
xp:[]};

X.ic.u7={qs:[
 Q('Which reagent reduces an ester to an aldehyde?',['DIBAL-H at −78 °C','LiAlH₄','NaBH₄','H₂ and Pd'],'At low temperature the tetrahedral intermediate survives until work-up.'),
 Q('What forms when an aldehyde reacts with a phosphonium ylide (the Wittig reaction)?',['An alkene','An alcohol','An ester','An epoxide'],'The C=O is replaced by C=C; Ph₃P=O is the by-product.'),
 Q('Cyclohexanone reacts with pyrrolidine (a secondary amine) and an acid catalyst. What forms?',['An enamine','An imine','An amide','An oxime'],'A secondary amine can’t form a neutral imine, so it loses H from the α-carbon instead.'),
 Q('What is the product of the Claisen condensation of ethyl ethanoate?',['Ethyl 3-oxobutanoate (ethyl acetoacetate)','Butanone','Ethyl butanoate','Ethanoic anhydride'],'An ester enolate attacks a second ester molecule.'),
 Q('What is a Michael addition?',['1,4-Addition of a nucleophile to an α,β-unsaturated carbonyl compound','1,2-Addition to a C=O group','Addition of H₂','An SN2 reaction'],'Soft nucleophiles such as enolates and cuprates add at the β-carbon.'),
 Q('Why is the α-hydrogen of a ketone acidic (pKa about 20)?',['The enolate is stabilised by resonance with the C=O group','The C–H bond is very weak','Carbon is very electronegative','Hydrogen bonding'],'The negative charge is shared with the oxygen atom.'),
 Q('What does a Robinson annulation combine?',['A Michael addition and an aldol condensation','Two Diels–Alder reactions','A Wittig and a Grignard reaction','Two Claisen condensations'],'It builds a new six-membered ring with a C=C conjugated to C=O.')],
xp:[{fmt:'olymp',title:'Identifying a ketone',stem:'Compound A, C₅H₁₀O, gives an orange precipitate with 2,4-DNPH and a yellow precipitate with I₂ and NaOH, but no silver mirror with Tollens’ reagent. Its ¹H NMR spectrum shows a doublet (6H), a septet (1H) and a singlet (3H).',parts:[
 ['Deduce the structure of A, explaining each piece of evidence.','2,4-DNPH: C=O present; no silver mirror: a ketone; iodoform: a CH₃CO– group [1]. Doublet 6H plus septet 1H: an isopropyl group; singlet 3H: CH₃ next to C=O. A is 3-methylbutan-2-one, CH₃COCH(CH₃)₂ [1].',2],
 ['A is reduced by NaBH₄ to B. Give the structure of B and state whether the product is optically active.','B is 3-methylbutan-2-ol, CH₃CH(OH)CH(CH₃)₂, which is chiral [1]. It forms as a racemic mixture, so it is not optically active [1].',2],
 ['Give the products of A with I₂ and NaOH.','CHI₃ (yellow precipitate) [1] and the 2-methylpropanoate ion, (CH₃)₂CHCOO⁻ [1].',2],
 ['A reacts with CH₃MgBr, then dilute acid. Give the product and state whether it is chiral.','2,3-Dimethylbutan-2-ol, (CH₃)₂C(OH)CH(CH₃)₂ [1]. Not chiral: the carbinol carbon carries two methyl groups [1].',2]]}]};

X.ic.u8={qs:[
 Q('What is the critical micelle concentration?',['The surfactant concentration above which micelles form','The concentration at which soap precipitates','The maximum solubility of a soap','The concentration at which foam disappears'],'Above it, extra surfactant goes into micelles rather than the surface.'),
 Q('Which is a cationic surfactant?',['Cetyltrimethylammonium bromide','Sodium dodecyl sulfate','Sodium stearate','Poly(ethylene glycol)'],'Its head group is a quaternary ammonium ion.'),
 Q('How is nylon-6 made?',['By ring-opening polymerisation of caprolactam','From hexanedioic acid and hexane-1,6-diamine','From ethane-1,2-diol','From styrene'],'One monomer with six carbons, hence nylon-6.'),
 Q('Which polymer forms by step-growth polymerisation?',['PET (a polyester)','Polystyrene','PVC','Poly(ethene)'],'Functional groups react in pairs, losing water.'),
 Q('In a step-growth polymerisation with exact stoichiometry, p = 0.99. What is the number-average degree of polymerisation?',['100','99','50','1000'],'Xn = 1/(1 − p) (the Carothers equation).'),
 Q('Why do synthetic sulfonate detergents work better than soaps in hard water?',['Their calcium salts are soluble','They are cationic','They are non-polar','They contain phosphate'],'Soaps form an insoluble calcium scum.'),
 Q('What is a copolymer with a regular –A–B–A–B– sequence called?',['An alternating copolymer','A block copolymer','A graft copolymer','A homopolymer'],'Block copolymers have long runs of each unit.')],
xp:[]};

X.ic.u9={qs:[
 Q('Lysine has pKa values of 2.18, 8.95 and 10.53. What is its isoelectric point?',['9.74','6.07','5.57','7.00'],'For a basic amino acid, average the two amino pKa values: (8.95 + 10.53)/2.'),
 Q('Which amino acid has an aromatic side chain?',['Phenylalanine','Leucine','Serine','Proline'],'A benzyl side chain.'),
 Q('Glucose and fructose are:',['Constitutional isomers','Enantiomers','Anomers','Epimers'],'Both C₆H₁₂O₆, but an aldose and a ketose.'),
 Q('α-D-Glucopyranose and β-D-glucopyranose are:',['Anomers','Enantiomers','Constitutional isomers','Conformers'],'They differ only at the anomeric carbon, C1.'),
 Q('What is mutarotation?',['The change in optical rotation as the α and β anomers interconvert in solution','The hydrolysis of sucrose','The oxidation of glucose','Racemisation'],'Both anomers reach the same equilibrium mixture through the open-chain form.'),
 Q('Which fat has the higher saponification value?',['One with shorter fatty acid chains','One with longer fatty acid chains','One with more double bonds, at the same chain length','One with more glycerol per gram'],'Shorter chains mean more ester groups (and more KOH used) per gram.'),
 Q('What does the iodine value of a fat measure?',['Its degree of unsaturation','Its chain length','Its free acid content','Its melting point'],'I₂ (or ICl) adds across C=C bonds.')],
xp:[]};

X.ic.u10={qs:[
 Q('Which is the weakest base?',['Pyrrole','Pyridine','Piperidine','Ammonia'],'Pyrrole’s nitrogen lone pair is part of the aromatic sextet.'),
 Q('Why is pyridine a weaker base than piperidine?',['Its lone pair is in an sp² orbital, with more s character','Its lone pair is part of the aromatic sextet','It is a smaller molecule','It forms hydrogen bonds'],'Electrons in an orbital with more s character are held closer to the nucleus.'),
 Q('Where does indole mainly react with electrophiles?',['C3','C2','N1','C5'],'Attack at C3 keeps the benzene ring intact in the intermediate.'),
 Q('Furan reacts with maleic anhydride in which type of reaction?',['A Diels–Alder reaction','An SNAr reaction','A Friedel–Crafts reaction','A Wittig reaction'],'Furan’s aromaticity is weak, so it can act as a diene.'),
 Q('An SNAr reaction is fastest when electron-withdrawing groups are:',['Ortho and para to the leaving group','Meta to the leaving group','Absent','On a different ring'],'They stabilise the negative charge of the Meisenheimer complex.'),
 Q('In an SNAr reaction, which aryl halide reacts fastest?',['The aryl fluoride','The aryl chloride','The aryl bromide','The aryl iodide'],'Addition is rate-determining, and F makes the carbon most δ+.'),
 Q('How many π electrons are in the aromatic system of imidazole?',['6','5','4','8'],'One N contributes a lone pair (2), the other one electron, plus four from the carbons.')],
xp:[]};

X.ic.u11={qs:[
 Q('A sample has an enantiomeric excess of 50%. What percentage is the major enantiomer?',['75%','50%','100%','25%'],'75 − 25 = 50.'),
 Q('Which reaction is stereospecific?',['SN2 at a stereocentre','SN1 at a tertiary centre','Radical bromination','Keto–enol tautomerism'],'Each enantiomer of the starting material gives a specific product (inversion).'),
 Q('Why do substituents on a cyclohexane ring prefer equatorial positions?',['To avoid 1,3-diaxial interactions','Equatorial bonds are shorter','Axial positions are planar','Hydrogen bonding'],'Axial groups clash with the axial hydrogens on the same side of the ring.'),
 Q('In the most stable chair of cis-1,3-dimethylcyclohexane, the methyl groups are:',['Both equatorial','Both axial','One axial and one equatorial','Eclipsed'],'For cis-1,3, both can be equatorial at once.'),
 Q('(E)-But-2-ene is dihydroxylated with OsO₄ (syn addition). What forms?',['Racemic butane-2,3-diol','meso-Butane-2,3-diol','Butane-1,2-diol','Butanone'],'Syn addition to the Z isomer gives the meso diol; to the E isomer, the racemate.'),
 Q('How do diastereomers differ?',['In physical properties such as melting point and solubility','In nothing measurable','Only in the sign of optical rotation','In molecular formula'],'Unlike enantiomers, they are not mirror images.'),
 Q('How does a kinetic resolution separate enantiomers?',['One enantiomer reacts faster with a chiral reagent or catalyst','They have different boiling points','One is more soluble in water','They have different masses'],'The faster-reacting enantiomer is converted, leaving the other behind.')],
xp:[]};

X.ic.u12={qs:[
 Q('Which compound gives only one signal in its ¹H NMR spectrum?',['Propanone','Ethanol','Propanal','Butanone'],'All six H atoms are equivalent.'),
 Q('A ¹H NMR spectrum shows a 6H doublet and a 1H septet. Which group is present?',['An isopropyl group','An ethyl group','A tert-butyl group','A propyl group'],'Two equivalent CH₃ groups next to one CH.'),
 Q('Where does the O–H proton of a carboxylic acid appear in a ¹H NMR spectrum?',['10–13 ppm, broad','About 0.9 ppm','2–3 ppm','5–6 ppm'],'Strongly deshielded and hydrogen bonded.'),
 Q('A sharp IR absorption near 2250 cm⁻¹ indicates:',['C≡N','C=O','O–H','N–H'],'Triple bonds absorb in the otherwise empty 2100–2260 cm⁻¹ region.'),
 Q('What does a McLafferty rearrangement need?',['A hydrogen on the γ-carbon relative to a C=O group','An aromatic ring','A halogen','An alcohol group'],'A six-membered transition state transfers the γ-H to oxygen.'),
 Q('How many signals are in the ¹³C NMR spectrum of benzoic acid?',['5','7','4','6'],'COOH, ipso, ortho (2C), meta (2C) and para.'),
 Q('By the nitrogen rule, a molecular ion at an even m/z (C, H, N, O compound) means:',['Zero or an even number of N atoms','An odd number of N atoms','A halogen is present','Sulfur is present'],'An odd number of N atoms gives an odd molecular mass.')],
xp:[{fmt:'olymp',title:'A structure from its spectra',stem:'Compound X, C₈H₈O₂, has a strong IR absorption at 1720 cm⁻¹ and none above 3100 cm⁻¹. Its ¹H NMR spectrum shows δ 3.9 (3H, singlet) and δ 7.4–8.0 (5H, multiplet). The mass spectrum has peaks at m/z 136, 105 and 77.',parts:[
 ['Calculate the number of double-bond equivalents (degree of unsaturation).','(2 × 8 + 2 − 8) ÷ 2 = 5 [1].',1],
 ['What do the IR data tell you?','C=O present (ester or ketone range) [1]; no O–H, so not a carboxylic acid [1].',2],
 ['Deduce the structure of X, using the NMR data.','A monosubstituted benzene ring (5H at 7.4–8.0) [1]; an OCH₃ singlet at 3.9, so X is methyl benzoate, C₆H₅COOCH₃ [1].',2],
 ['Identify the ions at m/z 105 and 77.','105: C₆H₅CO⁺, from loss of OCH₃ [1]; 77: C₆H₅⁺, from loss of CO [1].',2],
 ['An isomer of X is a carboxylic acid with a para-disubstituted ring. Identify it and describe how its ¹H NMR spectrum differs.','4-Methylbenzoic acid [1]: a broad 1H signal at 11–13 ppm, an aromatic pair of 2H doublets, and a CH₃ singlet near 2.4 ppm instead of 3.9 [1].',2]]}]};

X.ic.u13={qs:[
 Q('After which residues does chymotrypsin cleave peptide bonds?',['Aromatic residues: Phe, Tyr and Trp','Lys and Arg','Gly','Pro'],'Its specificity pocket is large and hydrophobic.'),
 Q('Which residue does Sanger’s reagent (1-fluoro-2,4-dinitrobenzene) label?',['The N-terminal amino acid','The C-terminal amino acid','Cysteine disulfides','Aromatic residues'],'The free α-NH₂ attacks the ring by SNAr.'),
 Q('How does a non-competitive inhibitor affect enzyme kinetics?',['It lowers Vmax without changing KM','It raises KM and leaves Vmax unchanged','It raises both KM and Vmax','It has no effect'],'It binds away from the active site, whether or not substrate is bound.'),
 Q('What is the x-intercept of a Lineweaver–Burk plot?',['−1/KM','1/Vmax','KM/Vmax','−Vmax'],'Set 1/v = 0 in 1/v = (KM/Vmax)(1/[S]) + 1/Vmax.'),
 Q('What holds a β-pleated sheet together?',['Hydrogen bonds between backbone C=O and N–H groups on neighbouring strands','Only disulfide bonds','Only ionic bonds','Only hydrophobic interactions'],'The strands can run parallel or antiparallel.'),
 Q('Why is the peptide bond planar?',['The N lone pair is delocalised into the C=O, giving the C–N bond partial double-bond character','The nitrogen is sp³','Steric hindrance','Hydrogen bonding'],'Rotation about C–N is restricted.'),
 Q('After which residue does cyanogen bromide cleave a peptide?',['Methionine','Cysteine','Lysine','Glycine'],'BrCN reacts with the thioether sulfur of Met.')],
xp:[]};

X.ic.u14={qs:[
 Q('How many stereoisomers does an open-chain aldopentose have?',['8','16','4','32'],'Three stereocentres: 2³.'),
 Q('Which sugar is the C4 epimer of D-glucose?',['D-Galactose','D-Mannose','D-Fructose','L-Glucose'],'D-Mannose is the C2 epimer.'),
 Q('Why is sucrose a non-reducing sugar?',['Both anomeric carbons are tied up in the glycosidic bond','It has no OH groups','It is a polysaccharide','It contains only fructose'],'Neither ring can open to give a free carbonyl group.'),
 Q('How many hydrogen bonds join an A–T base pair?',['2','3','1','4'],'G–C pairs have three.'),
 Q('Which atoms does a phosphodiester bond in DNA join?',['The 3′-O of one sugar to the 5′-phosphate of the next','Two bases','Two phosphate groups','C1′ of the sugar to the base'],'This gives the strand its 5′ → 3′ direction.'),
 Q('What does Chargaff’s rule state for double-stranded DNA?',['%A = %T and %G = %C','%A = %G','%A + %T is always 50%','All four bases are equal'],'A consequence of complementary base pairing.'),
 Q('Which pair of sugars gives the same osazone?',['Glucose and fructose','Glucose and galactose','Glucose and ribose','Fructose and galactose'],'Osazone formation destroys the stereochemistry at C1 and C2 only.')],
xp:[]};

X.ic.u15={qs:[
 Q('A polymer has Mn = 50 000 and Mw = 75 000. What is its dispersity?',['1.5','0.67','25 000','2.0'],'Đ = Mw/Mn.'),
 Q('What is the glass transition temperature, Tg?',['The temperature at which an amorphous polymer changes from glassy to rubbery','The melting point of the crystalline regions','The decomposition temperature','The boiling point'],'Above Tg, chain segments can move.'),
 Q('Which host molecule has a hydrophobic cavity and a hydrophilic outside?',['A cyclodextrin','Benzene','18-crown-6','Ethane'],'A ring of glucose units with OH groups on the rims.'),
 Q('What does a living polymerisation give?',['Low dispersity, with chain length set by the monomer-to-initiator ratio','High dispersity','Only cross-linked networks','Chains with no end groups'],'No termination, so all chains grow at the same rate.'),
 Q('In syndiotactic poly(propene), the methyl groups are:',['On alternating sides of the chain','All on one side','Placed at random','Absent'],'Isotactic is all one side; atactic is random.'),
 Q('Which crown ether best binds Li⁺?',['12-crown-4','18-crown-6','15-crown-5','24-crown-8'],'The smallest cavity matches the smallest ion.'),
 Q('What is a rotaxane?',['A ring threaded onto a dumbbell-shaped axle','Two interlocked rings','A branched polymer','A cyclic peptide'],'Bulky stoppers stop the ring from sliding off.')],
xp:[]};
})();
