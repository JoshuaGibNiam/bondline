/* Bondline version 31: extra course questions, part 3 (carbonyls to named reactions). See course-x1.js for the format. */
(function(){
const X=window.BL_COURSE_X=window.BL_COURSE_X||{pu:{},ic:{},units:[]};
const Q=(prompt,opts,why,only)=>only?{prompt,opts,why,only}:{prompt,opts,why};
const SR=['Both statements are true, and II correctly explains I','Both statements are true, but II does not explain I','Statement I is true but statement II is false','Statement I is false but statement II is true'];

X.pu['pu-carbonyl']={qs:[
 Q('Which reagent distinguishes an aldehyde from a ketone?',['Tollens’ reagent','2,4-DNPH','NaBH₄','HCN'],'Only aldehydes are oxidised and give a silver mirror. 2,4-DNPH reacts with both.'),
 Q('What forms when propanone is reduced with NaBH₄?',['Propan-2-ol','Propan-1-ol','Propanal','Propane'],'Ketones are reduced to secondary alcohols.'),
 Q('Which compound gives an orange precipitate with 2,4-DNPH but no silver mirror with Tollens’ reagent?',['Butanone','Butanal','Butan-2-ol','Butanoic acid'],'A ketone: it has a C=O but cannot be oxidised easily.'),
 Q('Which species acts as the nucleophile when NaBH₄ reduces a carbonyl compound?',['The hydride ion, H⁻','H⁺','BH₃','Na⁺'],'H⁻ attacks the δ+ carbonyl carbon.'),
 Q('What is the mechanism of the reaction between NaBH₄ and an aldehyde?',['Nucleophilic addition','Electrophilic addition','Nucleophilic substitution','Free-radical substitution'],'H⁻ adds to the carbon, then the alkoxide is protonated.'),
 Q('What is the product of ethanal with HCN?',['2-Hydroxypropanenitrile','Propanenitrile','Ethanenitrile','2-Hydroxyethanenitrile'],'CH₃CH(OH)CN: one carbon is added.'),
 Q('Which compound does not give a positive tri-iodomethane (iodoform) test?',['Pentan-3-one','Ethanal','Propanone','Butanone'],'The test needs a CH₃CO– group (or CH₃CH(OH)–). Pentan-3-one is CH₃CH₂COCH₂CH₃.'),
 Q('What colour change is seen when an aldehyde is warmed with acidified K₂Cr₂O₇?',['Orange to green','Purple to colourless','Blue to brick red','Colourless to silver'],'Cr₂O₇²⁻ (orange) is reduced to Cr³⁺ (green).'),
 Q('Ethanal is warmed with Tollens’ reagent. What is the organic product?',['The ethanoate ion (ethanoic acid after acidifying)','Ethanol','Ethene','Silver ethanoate'],'The aldehyde is oxidised while Ag⁺ is reduced to silver.'),
 Q('Why are aldehydes generally more reactive than ketones towards nucleophiles?',['Their carbonyl carbon has fewer electron-donating alkyl groups and is less crowded','Aldehydes are more polar overall','Ketones have no C=O bond','The aldehyde carbon has a lone pair'],'Alkyl groups reduce the δ+ charge and block the approach of the nucleophile.'),
 Q('Why is the carbon of a C=O group attacked by nucleophiles?',['Oxygen is more electronegative, so the carbon is δ+','The carbon has a lone pair','The C=O bond is non-polar','The carbon carries a negative charge'],'The polar C=O bond makes carbon electron-poor.'),
 Q('Which aldehyde does not give a red precipitate with Fehling’s solution?',['Benzaldehyde','Ethanal','Propanal','Methanal'],'Aromatic aldehydes don’t reduce Fehling’s solution, though they give a silver mirror.','jn'),
 Q('Which compound does not undergo aldol condensation?',['Methanal','Ethanal','Propanone','Propanal'],'Aldol reactions need an α-hydrogen; methanal has none.','jn'),
 Q('What reagents are used in the Clemmensen reduction?',['Zinc amalgam and concentrated HCl','NaBH₄','LiAlH₄','H₂ with Pd on BaSO₄'],'It reduces C=O to CH₂ in acidic conditions.','jn')],
xp:[
 {only:'asi',fmt:'struct',title:'Propanal and hydrogen cyanide',stem:'Propanal, CH₃CH₂CHO, reacts with HCN in the presence of a little KCN.',parts:[
  ['Give the name and structure of the organic product.','2-Hydroxybutanenitrile, CH₃CH₂CH(OH)CN [1].',1],
  ['Draw the mechanism.','δ+ on C and δ− on O of C=O; curly arrow from the lone pair on the carbon of CN⁻ to the carbonyl carbon, and from the C=O π bond to O [1]. Alkoxide intermediate [1]. Curly arrow from O⁻ to the H of HCN and from the H–C bond to C, re-forming CN⁻ [1].',3],
  ['The product is a racemic mixture. Explain why.','The carbonyl group is planar [1], so CN⁻ attacks from either side with equal probability, giving equal amounts of the two enantiomers [1].',2],
  ['Describe a test to distinguish propanal from propanone. Give the observations.','Warm with Tollens’ reagent: a silver mirror with propanal, no change with propanone [2]. (Or Fehling’s: brick-red precipitate with propanal, stays blue with propanone.)',2]]},
 {only:'s',fmt:'essay',title:'Telling carbonyl compounds and alcohols apart',stem:'Ethanal, propanone and ethanol are three colourless liquids.',parts:[
  ['Describe chemical tests that could identify each liquid. Give the observations.','2,4-DNPH: orange precipitate with ethanal and propanone, none with ethanol [2]. Tollens’ or Fehling’s reagent: silver mirror or brick-red precipitate with ethanal only [2]. Acidified K₂Cr₂O₇: orange to green with ethanal and ethanol, no change with propanone [2]. Note that all three give a yellow precipitate in the iodoform test, so it cannot separate them [1]. Correct equation, e.g. CH₃CHO + [O] → CH₃COOH [1].',8],
  ['Explain why the C=O group undergoes nucleophilic addition, whereas the C=C group undergoes electrophilic addition.','C=O is polar, so the δ+ carbon attracts nucleophiles [1]. C=C is non-polar, and its electron-rich π bond attracts electrophiles [1].',2]]}]};

X.pu['pu-acid']={qs:[
 Q('What forms when ethanoic acid reacts with magnesium?',['Magnesium ethanoate and hydrogen','Magnesium oxide and ethanol','Ethanal','There is no reaction'],'Like other acids: metal + acid → salt + hydrogen.'),
 Q('The pH of 0.10 mol dm⁻³ ethanoic acid (Ka = 1.8 × 10⁻⁵ mol dm⁻³) is closest to:',['3','1','5','7'],'[H⁺] = √(Ka × c) = √(1.8 × 10⁻⁶) = 1.3 × 10⁻³, so pH ≈ 2.9.'),
 Q('What are the by-products when SOCl₂ reacts with a carboxylic acid?',['SO₂ and HCl','POCl₃ and HCl','Water','H₃PO₃'],'Both are gases, which makes the acyl chloride easy to purify.'),
 Q('What forms when butanoic acid is heated with ethanol and a little concentrated H₂SO₄?',['Ethyl butanoate','Butyl ethanoate','Butanal','Ethoxyethane'],'The alcohol part comes first in an ester’s name.'),
 Q('Why do carboxylic acids have high boiling points for their Mᵣ?',['Pairs of molecules form hydrogen-bonded dimers','They are ionic','Only London forces act','Their molecules are planar'],'Each dimer is held by two hydrogen bonds.'),
 Q('Which compound fizzes with sodium hydrogencarbonate?',['Propanoic acid','Propan-1-ol','Phenol','Propanal'],'Carboxylic acids are strong enough to release CO₂. Phenol is not.'),
 Q('Which is the weakest acid?',['Propanoic acid','Ethanoic acid','Methanoic acid','Chloroethanoic acid'],'The longer alkyl group pushes more electron density towards the carboxylate (pKa 4.87).'),
 Q('Ethanoic acid is reduced with LiAlH₄ in dry ether. What forms?',['Ethanol','Ethanal','Ethane','Ethene'],'Carboxylic acids are reduced all the way to primary alcohols. NaBH₄ is too weak.'),
 Q('How is benzoic acid made from methylbenzene?',['Heat with alkaline KMnO₄, then acidify','React with CO₂','React with NaOH','Reduce with NaBH₄'],'The side chain is oxidised to –COOH.'),
 Q('What forms when propanenitrile is heated under reflux with NaOH(aq)?',['Sodium propanoate and ammonia','Propanoic acid and NH₄⁺','Propanamide only','Propylamine'],'Alkaline hydrolysis gives the salt; acidify to get the acid.'),
 Q('Why is ethanoic acid described as a weak acid?',['It is only partly ionised in water','It has only one acidic H atom','It is insoluble in water','It is a strong electrolyte'],'Most molecules stay as CH₃COOH in solution.'),
 Q('How many moles of NaOH react with one mole of ethanedioic acid, HOOC–COOH?',['2','1','4','0.5'],'It has two –COOH groups.'),
 Q('Propanoic acid reacts with Br₂ and red phosphorus (the HVZ reaction). What forms?',['2-Bromopropanoic acid','3-Bromopropanoic acid','Propanoyl bromide only','Bromoethane'],'Bromine goes onto the α-carbon.','jn'),
 Q('Which acid has the highest pKa (is the weakest)?',['Ethanoic acid','Methanoic acid','Benzoic acid','Chloroethanoic acid'],'pKa: ethanoic 4.76, benzoic 4.20, methanoic 3.75, chloroethanoic 2.86.','jn')],
xp:[
 {only:'asi',fmt:'struct',title:'Strengths of chlorinated acids',stem:'pKa values: ethanoic acid 4.76, chloroethanoic acid 2.86, dichloroethanoic acid 1.29.',parts:[
  ['Write an equation for the dissociation of ethanoic acid in water.','CH₃COOH + H₂O ⇌ CH₃COO⁻ + H₃O⁺ [1].',1],
  ['Explain the trend in acid strength.','Cl is electronegative and withdraws electron density [1], which spreads out and stabilises the negative charge on the carboxylate ion [1]. More Cl atoms give a bigger effect, so the acid is stronger [1].',3],
  ['Calculate the pH of 0.10 mol dm⁻³ ethanoic acid (Ka = 1.74 × 10⁻⁵ mol dm⁻³).','[H⁺] = √(1.74 × 10⁻⁵ × 0.10) = 1.32 × 10⁻³ mol dm⁻³ [1]; pH = 2.88 [1].',2],
  ['Give a test that distinguishes ethanoic acid from ethanol.','Add sodium carbonate (or NaHCO₃): fizzing with the acid only, and the gas turns limewater milky [1].',1]]},
 {only:'j',fmt:'nvt',title:'Carboxylic acids: integer answers',stem:'Give each answer as an integer.',parts:[
  ['The number of moles of CO₂ released when 1 mol of ethanedioic acid reacts with excess NaHCO₃.','2',4],
  ['An acid has pKa = 4. The pH of a buffer containing equal concentrations of the acid and its sodium salt is:','pH = pKa + log([A⁻]/[HA]) = 4.',4],
  ['The number of carboxylic acids with the formula C₅H₁₀O₂.','Pentanoic, 2-methylbutanoic, 3-methylbutanoic and 2,2-dimethylpropanoic acid: 4.',4]]}]};

X.pu['pu-deriv']={qs:[
 Q('What forms when ethanoyl chloride reacts with ammonia?',['Ethanamide and ammonium chloride','Ethylamine','Ethanoic acid','Ethanenitrile'],'CH₃COCl + 2NH₃ → CH₃CONH₂ + NH₄Cl'),
 Q('Which compound reacts most readily with nucleophiles?',['Ethanoyl chloride','Ethyl ethanoate','Ethanamide','Ethanoic acid'],'Cl⁻ is an excellent leaving group, and the carbonyl carbon is very δ+.'),
 Q('What forms when methyl propanoate is hydrolysed with dilute acid?',['Propanoic acid and methanol','Methanoic acid and propan-1-ol','Propan-1-ol and methanol','Propanoate ions and methanol'],'The ester splits back into its acid and alcohol.'),
 Q('What is the name of CH₃COOCH₂CH₂CH₃?',['Propyl ethanoate','Ethyl propanoate','Methyl butanoate','Butyl methanoate'],'Alcohol part (propyl) first, then the acid part (ethanoate).'),
 Q('How are soaps made?',['By alkaline hydrolysis of fats and oils','By acid hydrolysis of proteins','By esterifying glycerol','By hydrogenating oils'],'Saponification gives the sodium salts of fatty acids.'),
 Q('What forms when a triglyceride is boiled with NaOH(aq)?',['Propane-1,2,3-triol (glycerol) and sodium salts of fatty acids','Glycerol and fatty acids','Ethanol and sodium ethanoate','Fatty acids only'],'Each of the three ester links is hydrolysed.'),
 Q('Ethanoic anhydride reacts with ethanol to give ethyl ethanoate and:',['Ethanoic acid','HCl','Water','Ethanal'],'The other half of the anhydride leaves as ethanoic acid.'),
 Q('Why is ethanoic anhydride, rather than ethanoyl chloride, used to make aspirin industrially?',['It is cheaper, less corrosive and reacts less violently, with no HCl given off','It reacts faster','It gives a different product','It is a gas'],'Safer to handle on a large scale.'),
 Q('What forms when N-methylethanamide is heated with dilute acid?',['Ethanoic acid and methylammonium ions','Ethanamide and methanol','Ethylamine and methanoic acid','Methanoic acid and ethylamine'],'The amide bond is hydrolysed; in acid the amine is protonated.'),
 Q('Why do esters boil at lower temperatures than carboxylic acids of similar Mᵣ?',['Ester molecules cannot hydrogen bond to each other','Esters have fewer electrons','Esters are ionic','Esters are non-polar'],'Esters have no O–H group.'),
 Q('What smell is typical of small esters?',['Fruity','Vinegar','Fishy','Almond'],'They are used in food flavourings and perfumes.'),
 Q('What forms when ethanoyl chloride reacts with phenylamine?',['N-Phenylethanamide','Phenyl ethanoate','Ethylbenzene','Aminobenzoic acid'],'The amine’s lone pair attacks the acyl chloride: a secondary amide forms.'),
 Q('Which order of reactivity towards nucleophiles is correct?',['Acyl chloride > anhydride > ester > amide','Amide > ester > anhydride > acyl chloride','Ester > acyl chloride > amide > anhydride','They are all equally reactive'],'Reactivity follows how good the leaving group is.','jn'),
 Q('Ethyl ethanoate reacts with excess CH₃MgBr, then dilute acid. What is the main organic product?',['2-Methylpropan-2-ol (with ethanol)','Propan-2-ol','Butan-2-ol','Ethanol only'],'Two methyl groups add to the carbonyl carbon, giving a tertiary alcohol.','jn')],
xp:[
 {only:'asi',fmt:'struct',title:'Hydrolysis of acid derivatives',stem:'Ethanoyl chloride, ethyl ethanoate and ethanamide are all derivatives of ethanoic acid.',parts:[
  ['Describe what is seen when ethanoyl chloride is added to water, and write an equation.','A vigorous reaction with steamy white fumes of HCl [1]. CH₃COCl + H₂O → CH₃COOH + HCl [1].',2],
  ['Explain why ethanoyl chloride is hydrolysed much more readily than chloroethane.','The carbonyl carbon is bonded to both O and Cl, so it is very δ+ [1]. The nucleophile can attack the planar C=O (addition, then elimination), so no attack from the back is needed [1].',2],
  ['Ethyl ethanoate is heated under reflux with NaOH(aq). Write an equation and explain why the reaction goes to completion.','CH₃COOC₂H₅ + NaOH → CH₃COONa + C₂H₅OH [1]. The carboxylate ion is not attacked by the alcohol, so the reverse reaction cannot happen [1].',2],
  ['Name the gas given off when ethanamide is boiled with NaOH(aq), and give a test for it.','Ammonia [1]; it turns damp red litmus paper blue [1].',2]]},
 {only:'s',fmt:'essay',title:'Making and breaking esters',stem:'Ethyl ethanoate is a common solvent.',parts:[
  ['Describe two ways of making ethyl ethanoate in the laboratory. Give conditions and equations, and compare the two methods.','Ethanoic acid and ethanol, with a few drops of concentrated H₂SO₄ as catalyst, heated under reflux [1]; CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O [1]; reversible, so the yield is limited [1]. Ethanoyl chloride and ethanol at room temperature [1]; CH₃COCl + C₂H₅OH → CH₃COOC₂H₅ + HCl [1]; fast and not reversible, so the yield is high, but corrosive HCl fumes form [1].',6],
  ['Describe the acid and alkaline hydrolysis of ethyl ethanoate. Explain which is better if you want to recover all the ethanol.','Acid: heat under reflux with dilute H₂SO₄; an equilibrium, so incomplete [2]. Alkaline: heat under reflux with NaOH(aq); goes to completion, giving sodium ethanoate and ethanol, so alkaline hydrolysis is better (acidify afterwards to get the acid) [2].',4]]}]};

X.pu['pu-amine']={qs:[
 Q('Which compound is a primary amine?',['Ethylamine, CH₃CH₂NH₂','Dimethylamine, (CH₃)₂NH','Trimethylamine, (CH₃)₃N','Ethanamide, CH₃CONH₂'],'One alkyl group on the nitrogen.'),
 Q('Why are amines bases?',['The lone pair on nitrogen can accept a proton','They contain OH groups','They release OH⁻ ions by dissociating','The N–H bond is weak'],'RNH₂ + H₂O ⇌ RNH₃⁺ + OH⁻'),
 Q('What forms when ethylamine reacts with hydrochloric acid?',['Ethylammonium chloride','Chloroethane and ammonia','Ethanamide','Nitrogen gas'],'An acid–base reaction gives a salt.'),
 Q('Why is ethylamine a stronger base than ammonia?',['The ethyl group donates electron density to the nitrogen','Ethylamine has more hydrogen atoms','Ethylamine is more soluble','Ammonia has no lone pair'],'The lone pair is more available to accept a proton.'),
 Q('What is used to couple with a diazonium salt to make an azo dye?',['Phenol (or another activated arene) in alkaline solution','Benzene','Ethanol','Hydrochloric acid'],'The diazonium ion is a weak electrophile and needs an electron-rich ring.'),
 Q('Which is the structure of the benzenediazonium ion?',['C₆H₅–N⁺≡N','C₆H₅–N=N–C₆H₅','C₆H₅–NH₃⁺','C₆H₅–NO₂'],'N≡N with a positive charge on the nitrogen attached to the ring.'),
 Q('Which conditions convert phenylamine into a diazonium salt?',['NaNO₂ and HCl, below 10 °C','Sn and HCl','NaOH and heat','Concentrated H₂SO₄ at 170 °C'],'Nitrous acid is made in the flask from NaNO₂ and HCl.'),
 Q('Propanenitrile is reduced with H₂ and a nickel catalyst. What forms?',['Propylamine','Ethylamine','Propanamide','Propanoic acid'],'CH₃CH₂CN + 2H₂ → CH₃CH₂CH₂NH₂'),
 Q('Which is the weakest base?',['Phenylamine','Methylamine','Ammonia','Dimethylamine'],'The lone pair is delocalised into the benzene ring.'),
 Q('What is seen when ethylamine is added to aqueous copper(II) sulfate, a little at a time and then in excess?',['A pale blue precipitate, then a deep blue solution','A white precipitate','No change','A red-brown precipitate'],'Like ammonia: Cu(OH)₂ forms, then a deep blue complex.'),
 Q('Why are small amines soluble in water?',['They form hydrogen bonds with water molecules','They are ionic','Only London forces act','They are non-polar'],'The N–H groups and the N lone pair can both hydrogen bond.'),
 Q('Which compound is a secondary amine?',['(CH₃)₂NH','CH₃NH₂','(CH₃)₃N','(CH₃)₄N⁺'],'Two alkyl groups on the nitrogen.'),
 Q('Which compound gives an offensive smell when warmed with CHCl₃ and alcoholic KOH (the carbylamine test)?',['Aniline','N-Methylaniline','N,N-Dimethylaniline','Ethanamide'],'Only primary amines form isocyanides.','jn'),
 Q('In the gas phase, which is the strongest base?',['Trimethylamine','Dimethylamine','Methylamine','Ammonia'],'Without water to solvate the ions, the +I effect of three methyl groups wins.','jn')],
xp:[
 {only:'asi',fmt:'struct',title:'From benzene to an azo dye',stem:'Azo dyes can be made from benzene in several steps.',parts:[
  ['Give the reagents and conditions for converting benzene into nitrobenzene, and nitrobenzene into phenylamine.','Concentrated HNO₃ and concentrated H₂SO₄, below 55 °C [1]. Tin and concentrated HCl, heated under reflux, then NaOH(aq) [1].',2],
  ['Phenylamine is converted into benzenediazonium chloride. Give the reagents and explain the temperature used.','NaNO₂ and HCl (to make HNO₂) [1], below 10 °C because the diazonium ion decomposes (to phenol and N₂) at higher temperatures [1].',2],
  ['Draw the azo dye formed with phenol in alkaline solution, and explain why it is coloured.','HO–C₆H₄–N=N–C₆H₅, joined at the 4-position of the phenol [1]. The extended delocalised system across the N=N and both rings absorbs light in the visible region [1].',2],
  ['Explain why phenylamine is a weaker base than ammonia.','The lone pair on N is delocalised into the benzene ring [1], so it is less available to accept a proton [1].',2]]},
 {only:'j',fmt:'nvt',title:'Amines: integer answers',stem:'Give each answer as an integer.',parts:[
  ['The number of amines with the formula C₃H₉N.','Propylamine, isopropylamine, N-methylethylamine and trimethylamine: 4.',4],
  ['How many of those are primary amines?','2',4],
  ['The number of moles of CH₃I needed to convert 1 mol of methylamine into a quaternary ammonium salt.','Three more methyl groups are added: 3.',4]]}]};

X.pu['pu-amino']={qs:[
 Q('Which is the general structure of an α-amino acid?',['H₂N–CHR–COOH','H₂N–CH₂–CH₂–COOH','HOOC–CHR–OH','H₂N–R–NH₂'],'The amino group is on the carbon next to the carboxyl group.'),
 Q('In which form is glycine mainly present at pH 12?',['H₂N–CH₂–COO⁻','⁺H₃N–CH₂–COOH','⁺H₃N–CH₂–COO⁻','H₂N–CH₂–COOH'],'In strong alkali, the –NH₃⁺ group loses its proton.'),
 Q('How many peptide bonds are there in a tripeptide?',['2','3','1','4'],'n amino acids are joined by n − 1 peptide bonds.'),
 Q('Which bonds are broken when a protein is heated with 6 mol dm⁻³ HCl?',['Peptide bonds','Only hydrogen bonds','Only disulfide bonds','C–C bonds'],'Acid hydrolysis releases the individual amino acids.'),
 Q('Which technique separates amino acids by their charge at a set pH?',['Electrophoresis','Distillation','Recrystallisation','Mass spectrometry'],'Positive ions move to the cathode and negative ions to the anode.'),
 Q('What is the secondary structure of a protein?',['Regular folding, such as α-helices and β-pleated sheets, held by hydrogen bonds','The sequence of amino acids','The overall 3D shape','How several polypeptide chains fit together'],'Hydrogen bonds between C=O and N–H groups of the backbone.'),
 Q('Which interaction helps hold tertiary structure but plays no part in secondary structure?',['Disulfide bridges between side chains','Peptide bonds','Hydrogen bonds between backbone C=O and N–H groups','Covalent bonds in the backbone'],'Tertiary structure depends on interactions between R groups.'),
 Q('How many different tripeptides can be made from three different amino acids, each used once?',['6','3','9','27'],'3 × 2 × 1 = 6 orders.'),
 Q('Which amino acid’s side chain can form disulfide bridges?',['Cysteine','Glycine','Serine','Alanine'],'Its –SH groups can be oxidised to –S–S–.'),
 Q('Which amino acid has a non-polar side chain?',['Alanine, –CH₃','Serine, –CH₂OH','Aspartic acid, –CH₂COOH','Lysine, –(CH₂)₄NH₂'],'A methyl group can only form London forces.'),
 Q('Why does a denatured enzyme stop working?',['The shape of its active site has changed','Its peptide bonds have been hydrolysed','It has lost its amino acids','It has become a different protein'],'The substrate no longer fits the active site.')],
xp:[
 {only:'asi',fmt:'struct',title:'Alanine and its peptides',stem:'Alanine is 2-aminopropanoic acid, CH₃CH(NH₂)COOH.',parts:[
  ['Draw the zwitterion of alanine and explain why alanine has a high melting point.','⁺H₃N–CH(CH₃)–COO⁻ [1]. Strong ionic attractions act between the zwitterions [1].',2],
  ['Draw the form of alanine present in solution at pH 1 and at pH 13.','pH 1: ⁺H₃N–CH(CH₃)–COOH [1]. pH 13: H₂N–CH(CH₃)–COO⁻ [1].',2],
  ['Draw the two dipeptides that can form from one alanine and one glycine.','Ala-Gly: H₂N–CH(CH₃)–CO–NH–CH₂–COOH [1]. Gly-Ala: H₂N–CH₂–CO–NH–CH(CH₃)–COOH [1].',2],
  ['Explain why alanine is optically active but glycine is not.','Alanine’s α-carbon carries four different groups (H, CH₃, NH₂ and COOH) [1]. Glycine’s α-carbon carries two hydrogen atoms [1].',2]]}]};

X.pu['pu-poly']={qs:[
 Q('What is the monomer of poly(tetrafluoroethene), PTFE?',['F₂C=CF₂','CHF=CHF','CF₃–CF₃','CH₂=CHF'],'Tetrafluoroethene: an alkene with four F atoms.'),
 Q('Which describes condensation polymerisation?',['Monomers join with the loss of a small molecule, such as water','Monomers with C=C bonds join with nothing lost','A polymer breaks down into monomers','Polymer chains are cross-linked by sulfur'],'Each new link releases a small molecule.'),
 Q('Which monomers make nylon-6,6?',['Hexane-1,6-diamine and hexanedioic acid','Ethene and propene','Ethane-1,2-diol and benzene-1,4-dicarboxylic acid','Caprolactam alone'],'Each monomer has six carbon atoms.'),
 Q('Which polymer can be broken down by hydrolysis?',['A polyester','Poly(ethene)','Poly(propene)','PVC'],'Ester links can be hydrolysed by acids or alkalis.'),
 Q('Which linkage joins the monomers in a polyamide?',['–CONH–','–COO–','–O–','–C=C–'],'An amide (peptide) link.'),
 Q('What is the repeat unit of poly(chloroethene)?',['–CH₂–CHCl–','–CHCl–CHCl–','–CH₂–CH₂Cl–','–CCl₂–CH₂–'],'The monomer is CH₂=CHCl.'),
 Q('Which monomer forms poly(lactic acid), a biodegradable polymer?',['2-Hydroxypropanoic acid','Propene','Ethane-1,2-diol','Glycine'],'Each molecule has both an –OH and a –COOH group.'),
 Q('Why is poly(lactic acid) biodegradable?',['Its ester links can be hydrolysed','It contains C=C bonds','It is ionic','It dissolves in water immediately'],'Hydrolysis breaks the chain into small molecules that microbes can use.'),
 Q('Which monomer can form a condensation polymer on its own?',['6-Aminohexanoic acid','Hexane-1,6-diamine','Ethene','Benzene-1,4-dicarboxylic acid'],'It has an amine group at one end and a carboxylic acid group at the other.'),
 Q('How can you tell an addition polymer from its structure?',['Its main chain contains only carbon atoms','It contains ester or amide links','It has an OH group at each end','Its chain contains nitrogen atoms'],'The C=C bonds of the monomers became C–C bonds in the chain.'),
 Q('Which is a natural polymer?',['Cellulose','Nylon-6,6','Bakelite','PVC'],'A polymer of β-glucose made by plants.','jn'),
 Q('Buna-S is a copolymer of buta-1,3-diene and:',['Styrene','Acrylonitrile','Chloroprene','Ethene'],'S stands for styrene. Buna-N uses acrylonitrile.','jn')],
xp:[
 {only:'asi',fmt:'struct',title:'Addition and condensation polymers',stem:'Propenenitrile, CH₂=CHCN, is used to make acrylic fibres. PET is made from ethane-1,2-diol and benzene-1,4-dicarboxylic acid.',parts:[
  ['Draw the repeat unit of poly(propenenitrile) and name the type of polymerisation.','–CH₂–CH(CN)– [1]. Addition polymerisation [1].',2],
  ['Draw the repeat unit of PET, and name the linkage and the small molecule formed.','–O–CH₂CH₂–O–CO–C₆H₄–CO– [1]. Ester linkage [1]. Water [1].',3],
  ['Explain why PET can be broken down by hydrolysis but poly(propenenitrile) cannot.','The ester links in PET are polar and can be attacked by water or OH⁻ [1]. Poly(propenenitrile) has a backbone of strong, non-polar C–C bonds [1].',2],
  ['Suggest a single monomer that could form a polyamide on its own.','An amino acid, for example 6-aminohexanoic acid [1].',1]]}]};

X.pu['pu-synth']={qs:[
 Q('Which route converts ethene into ethanoic acid?',['Steam with an H₃PO₄ catalyst, then acidified K₂Cr₂O₇ under reflux','HBr, then KCN','H₂ and Ni, then Cl₂ in UV light','Br₂, then NaOH(aq)'],'Ethene → ethanol → ethanoic acid.'),
 Q('Which reagents convert propan-1-ol into 1-bromopropane?',['NaBr and concentrated H₂SO₄','Bromine water','Fe and Br₂','Br₂ in UV light'],'HBr is generated in the flask.'),
 Q('Which method converts propene into propan-2-ol?',['Steam with an H₃PO₄ catalyst (or concentrated H₂SO₄, then water)','NaBH₄','KCN','H₂ and Ni'],'Hydration follows Markovnikov’s rule.'),
 Q('Which reagent converts a nitrile into a primary amine?',['LiAlH₄ (or H₂ and Ni)','NaBH₄','Dilute acid','KMnO₄'],'Reduction of C≡N to CH₂NH₂.'),
 Q('How can bromoethane be converted into ethylamine?',['Excess ammonia in ethanol, heated in a sealed tube','KCN, then LiAlH₄','NaOH(aq)','Br₂ in UV light'],'KCN then LiAlH₄ would give propylamine: one carbon too many.'),
 Q('Which two-step route makes 2-hydroxy-2-methylpropanenitrile from propan-2-ol?',['Oxidise to propanone, then add HCN with KCN','Dehydrate, then add HCN','React with KCN, then oxidise','Brominate, then add KCN'],'Propanone + HCN → (CH₃)₂C(OH)CN'),
 Q('Which functional group is not oxidised by acidified K₂Cr₂O₇?',['Ketone','Primary alcohol','Secondary alcohol','Aldehyde'],'Ketones resist mild oxidation.'),
 Q('In what order are the steps for converting benzene into phenylamine?',['Nitration, then reduction with Sn and HCl','Reduction, then nitration','Bromination, then ammonia','Alkylation, then oxidation'],'Benzene → nitrobenzene → phenylamine.'),
 Q('Which reagent converts CH₃CH₂COOH into CH₃CH₂CH₂OH?',['LiAlH₄ in dry ether','NaBH₄','H₂ and Ni at room temperature','K₂Cr₂O₇'],'Only LiAlH₄ is strong enough to reduce a carboxylic acid.'),
 Q('Which reaction shortens a carbon chain by one carbon?',['The iodoform reaction of a methyl ketone','Adding KCN','Adding a Grignard reagent','Esterification'],'RCOCH₃ → RCOO⁻ + CHI₃')],
xp:[
 {only:'asi',fmt:'struct',title:'Planning a synthesis of lactic acid',stem:'2-Hydroxypropanoic acid (lactic acid), CH₃CH(OH)COOH, can be made from ethanol in three steps.',parts:[
  ['Step 1: give the reagents and conditions, and name the intermediate.','Acidified K₂Cr₂O₇, warm, distilling the product off as it forms [1]; ethanal [1].',2],
  ['Step 2: give the reagents, and name the intermediate.','HCN with a little KCN (or KCN and dilute H₂SO₄) [1]; 2-hydroxypropanenitrile [1].',2],
  ['Step 3: give the reagents and conditions.','Heat under reflux with dilute HCl or H₂SO₄ [1], which hydrolyses the nitrile to the acid [1].',2],
  ['State whether the lactic acid made by this route is optically active. Explain.','No: CN⁻ attacks the planar C=O from both sides equally, giving a racemic mixture [1].',1]]},
 {only:'s',fmt:'essay',title:'Synthetic routes from propene',stem:'Propene is a useful starting material.',parts:[
  ['Show how propene can be converted into propanone in two steps. Give reagents, conditions and intermediates.','Steam with H₃PO₄ catalyst (about 300 °C, 60 atm), or concentrated H₂SO₄ then water [1], giving propan-2-ol as the major product [1]. Heat with acidified K₂Cr₂O₇ to give propanone [1].',3],
  ['Show how propene can be converted into 2-methylpropanoic acid in three steps.','HBr at room temperature gives 2-bromopropane [1]. KCN in ethanol, heated under reflux, gives 2-methylpropanenitrile [1]. Heat under reflux with dilute acid to hydrolyse it to 2-methylpropanoic acid [1]. Each step correctly named [1].',4],
  ['Give the reagent and conditions to convert propene directly into propane-1,2-diol.','Cold, dilute, acidified (or alkaline) KMnO₄ [1]; purple to colourless [1].',2]]}]};

X.pu['pu-spec']={qs:[
 Q('Which IR absorption range shows a C=O bond?',['1680–1750 cm⁻¹','2500–3000 cm⁻¹ (broad)','3200–3600 cm⁻¹','1000–1300 cm⁻¹'],'A strong, sharp peak: usually the most obvious in the spectrum.'),
 Q('How many peaks are in the ¹H NMR spectrum of ethanol?',['3','2','1','6'],'CH₃, CH₂ and OH.'),
 Q('What splitting does the CH₃ of the ethyl group in ethyl ethanoate show?',['A triplet','A quartet','A singlet','A doublet'],'It has two neighbouring H atoms on the CH₂: n + 1 = 3.'),
 Q('What is the M⁺ peak in a mass spectrum?',['The molecular ion: the molecule with one electron removed','The most abundant fragment','The peak due to ¹³C','The peak at m/z 15'],'Its m/z gives the Mᵣ of the compound.'),
 Q('A mass spectrum has a large peak at m/z 43. Which ion could cause it?',['CH₃CO⁺ (or C₃H₇⁺)','CH₃⁺','C₂H₅⁺','CHO⁺'],'Both CH₃CO⁺ and C₃H₇⁺ have a mass of 43.'),
 Q('How many peaks are in the ¹³C NMR spectrum of butanone?',['4','3','2','5'],'All four carbons are in different environments.'),
 Q('How many peaks are in the ¹³C NMR spectrum of 2-methylpropan-2-ol?',['2','4','3','1'],'Three equivalent CH₃ carbons and the central carbon.'),
 Q('A ¹H NMR spectrum has a singlet at δ 2.1 for 3H. Which group is this most likely to be?',['A CH₃ next to a C=O group','A CH₃ next to a CH₂ group','An O–H','An aldehyde H'],'No neighbouring H gives a singlet; the C=O shifts it to about 2.1.'),
 Q('What does the n + 1 rule state?',['A proton with n equivalent neighbouring H atoms gives a peak split into n + 1 lines','There are n + 1 peaks for n carbons','The integration is n + 1','The chemical shift goes up by n + 1'],'Neighbouring means on the adjacent carbon atom.'),
 Q('Which solvent is used for ¹H NMR spectra?',['CDCl₃','CHCl₃','H₂O','Hexane'],'Deuterated solvents give no peaks in a ¹H spectrum.'),
 Q('What does the ratio of the areas under the peaks in a ¹H NMR spectrum show?',['The relative numbers of hydrogen atoms in each environment','The number of neighbouring hydrogen atoms','The molecular mass','The bond strengths'],'The integration trace gives the ratio.'),
 Q('Why are amino acids sprayed with ninhydrin after paper chromatography?',['They are colourless, and ninhydrin makes the spots visible','To make them move faster','To dissolve them','To measure their mass'],'Ninhydrin gives purple spots with amino acids.')],
xp:[
 {only:'asi',fmt:'struct',title:'Identifying an unknown ester',stem:'Compound X, C₄H₈O₂, has a strong IR absorption at 1740 cm⁻¹ and no broad absorption above 2500 cm⁻¹. Its ¹H NMR spectrum shows: δ 1.3 (3H, triplet), δ 2.0 (3H, singlet), δ 4.1 (2H, quartet).',parts:[
  ['What does the IR spectrum tell you about X?','It contains C=O [1] but no O–H, so it is not a carboxylic acid [1].',2],
  ['Explain the splitting of the peaks at δ 1.3 and δ 4.1.','δ 1.3 is a CH₃ next to a CH₂: 2 + 1 = 3, a triplet [1]. δ 4.1 is a CH₂ next to a CH₃: 3 + 1 = 4, a quartet [1].',2],
  ['Identify X. Explain your answer, using the peaks at δ 2.0 and δ 4.1.','Ethyl ethanoate, CH₃COOCH₂CH₃ [1]. δ 2.0 is a CH₃ next to C=O with no neighbouring H (singlet) [1]. δ 4.1 is a CH₂ attached to O, which shifts it downfield [1].',3],
  ['Suggest the m/z values of two peaks you would expect in its mass spectrum, and identify the ions.','Any two: 88, M⁺; 43, CH₃CO⁺; 29, C₂H₅⁺; 45, OC₂H₅⁺ [2].',2]]},
 {only:'i',fmt:'data',title:'Checking purity by chromatography',stem:'A student made aspirin and checked it by thin-layer chromatography. The solvent front travelled 8.0 cm. Pure aspirin gave one spot at 4.8 cm. The student’s product gave spots at 4.8 cm and 2.0 cm.',parts:[
  ['Calculate the Rf value of aspirin.','4.8 ÷ 8.0 = 0.60 [1].',1],
  ['What does the second spot show about the product?','It contains an impurity, for example unreacted salicylic acid [1].',1],
  ['Explain why the starting line must be drawn in pencil and above the level of the solvent.','Ink would dissolve and move up the plate [1]; if the spots were below the solvent, they would dissolve into it instead of moving up the plate [1].',2],
  ['Suggest how the product could be purified, and how the student could confirm that it is pure.','Recrystallise: dissolve in the minimum of hot solvent, cool, filter and dry [1]. Repeat the TLC (one spot) or measure the melting point (sharp, and matching the literature value) [1].',2]]}]};

X.pu['pu-purify']={qs:[
 Q('Which method separates two immiscible liquids?',['A separating funnel','Fractional distillation','Sublimation','Crystallisation'],'The two layers are run off one at a time.'),
 Q('Which substance can be purified by sublimation?',['Naphthalene','Sodium chloride','Glucose','Sucrose'],'It passes straight from solid to vapour on heating.'),
 Q('How is glycerol purified?',['Distillation under reduced pressure','Steam distillation','Simple distillation at 1 atm','Sublimation'],'It decomposes at its normal boiling point, so the pressure is lowered.'),
 Q('Which method separates the components of crude oil?',['Fractional distillation','Steam distillation','Sublimation','Chromatography'],'The fractions have close, overlapping boiling points.'),
 Q('In the Dumas method, the nitrogen in the compound ends up as:',['N₂ gas, whose volume is measured','NH₃, which is titrated','NaCN','NO₂'],'The compound is heated with CuO and the N₂ collected over KOH.'),
 Q('In the Carius method, halogens are weighed as:',['Silver halides','Sodium halides','The halogen element','Hydrogen halides'],'The compound is heated with fuming HNO₃ and AgNO₃.'),
 Q('In Lassaigne’s test, what colour does sodium nitroprusside give with sulfur?',['Violet','Blood red','Prussian blue','White'],'S²⁻ forms a violet complex with nitroprusside.'),
 Q('In the Carius method, 0.20 g of a compound gave 0.188 g of AgBr. What is the percentage of bromine? (Ag = 108, Br = 80)',['40%','80%','20%','50%'],'Mass of Br = 0.188 × 80/188 = 0.080 g; 0.080/0.20 = 40%.'),
 Q('Which technique uses a stationary phase and a mobile phase?',['Chromatography','Distillation','Crystallisation','Sublimation'],'Components separate because they distribute differently between the two phases.'),
 Q('Why is the Kjeldahl method not used for pyridine?',['Its ring nitrogen is not converted into ammonium sulfate','Pyridine is volatile','It contains sulfur','It is a base'],'Nitrogen in rings, nitro groups and azo groups is not converted.'),
 Q('Statement I: Aniline can be purified by steam distillation. Statement II: Aniline is volatile in steam and does not mix with water.',SR,'Both are true, and II is the reason steam distillation works.')],
xp:[
 {only:'j',fmt:'nvt',title:'Quantitative analysis: integer answers',stem:'Give each answer as an integer.',parts:[
  ['In a Kjeldahl estimation, 0.50 g of a compound gave ammonia that neutralised 10 cm³ of 1.0 mol dm⁻³ H₂SO₄. What is the percentage of nitrogen?','0.010 mol H₂SO₄ neutralises 0.020 mol NH₃, which contains 0.28 g N; 0.28 ÷ 0.50 = 56%.',4],
  ['0.30 g of a compound gave 0.27 g of water on combustion. What is the percentage of hydrogen?','Mass of H = 0.27 × 2/18 = 0.030 g; 0.030 ÷ 0.30 = 10%.',4]]}]};

X.pu['pu-bio']={qs:[
 Q('What type of sugar is glucose?',['An aldohexose','A ketohexose','An aldopentose','A ketopentose'],'Six carbons with an aldehyde group.'),
 Q('What type of sugar is fructose?',['A ketohexose','An aldohexose','A disaccharide','An aldopentose'],'Six carbons with a ketone group at C2.'),
 Q('What does sucrose give when it is hydrolysed?',['Glucose and fructose','Glucose and galactose','Two glucose units','Fructose and galactose'],'The products are called invert sugar.'),
 Q('What is maltose made of?',['Two α-D-glucose units joined by an α(1→4) link','Glucose and fructose','Glucose and galactose','Two β-glucose units'],'It forms when starch is broken down.'),
 Q('Which carbohydrate is the storage form in animals?',['Glycogen','Starch','Cellulose','Sucrose'],'It is highly branched and stored in the liver and muscles.'),
 Q('Which vitamin is fat-soluble?',['Vitamin A','Vitamin C','Vitamin B₁','Vitamin B₆'],'Vitamins A, D, E and K are fat-soluble.'),
 Q('Which sugar is found in DNA?',['2-Deoxyribose','Ribose','Glucose','Fructose'],'It lacks the OH on C2 that ribose has.'),
 Q('What does a nucleotide consist of?',['A base, a pentose sugar and a phosphate group','A base and a sugar only','An amino acid and a phosphate','Glucose and a base'],'A nucleoside is the base and sugar without the phosphate.'),
 Q('Which is an essential amino acid?',['Lysine','Glycine','Alanine','Serine'],'Essential amino acids must come from the diet.'),
 Q('What kind of molecule is insulin?',['A peptide (protein) hormone','A steroid','A carbohydrate','A vitamin'],'It is made of two polypeptide chains joined by disulfide bridges.'),
 Q('What does glucose form with bromine water?',['Gluconic acid','Saccharic acid','Hexane','Sorbitol'],'Only the –CHO group is oxidised.'),
 Q('Statement I: Starch is a polymer of α-glucose. Statement II: Cellulose is a polymer of β-glucose. Which is correct?',['Both statements are true','Only statement I is true','Only statement II is true','Both statements are false'],'This difference in linkage is why humans can digest starch but not cellulose.'),
 Q('Deficiency of which vitamin causes rickets?',['Vitamin D','Vitamin C','Vitamin B₁','Vitamin A'],'Vitamin D is needed to absorb calcium.')],
xp:[
 {only:'j',fmt:'nvt',title:'Biomolecules: integer answers',stem:'Give each answer as an integer.',parts:[
  ['The number of chiral carbon atoms in open-chain D-glucose.','C2, C3, C4 and C5: 4.',4],
  ['The number of –OH groups in glucose, as shown by forming a pentaacetate.','5',4],
  ['The number of chiral carbon atoms in β-D-glucopyranose (the ring form).','C1 becomes chiral as well: 5.',4]]}]};

X.pu['pu-named']={qs:[
 Q('What is used in the Rosenmund reduction?',['H₂ with Pd on BaSO₄','LiAlH₄','Zinc amalgam and HCl','NaBH₄'],'The poisoned catalyst stops the aldehyde being reduced further.'),
 Q('Which reagents convert a diazonium salt into chlorobenzene in the Sandmeyer reaction?',['CuCl and HCl','Cu powder and HCl','KI','H₃PO₂'],'Cu powder and HCl is the Gattermann reaction.'),
 Q('What does the Hell–Volhard–Zelinsky reaction need?',['Br₂ (or Cl₂) and red phosphorus','NaOH and Br₂','CHCl₃ and KOH','Zinc amalgam and HCl'],'It halogenates the α-carbon of a carboxylic acid.'),
 Q('Ethanal undergoes aldol condensation, and the product is heated. What forms?',['But-2-enal','Butanal','3-Hydroxybutanoic acid','Butan-2-one'],'3-Hydroxybutanal loses water to give CH₃CH=CHCHO.'),
 Q('Which reaction makes an ether from an alkoxide and an alkyl halide?',['Williamson synthesis','Wurtz reaction','Kolbe reaction','Etard reaction'],'An SN2 reaction: works best with a primary alkyl halide.'),
 Q('In the Hofmann bromamide degradation, the amine formed has:',['One carbon fewer than the amide','The same number of carbon atoms','One carbon more','Two carbons fewer'],'The C=O carbon is lost as carbonate.'),
 Q('Which reaction converts benzene into acetophenone?',['Friedel–Crafts acylation','Friedel–Crafts alkylation','Gattermann–Koch reaction','Reimer–Tiemann reaction'],'CH₃COCl with anhydrous AlCl₃.'),
 Q('What does the Gattermann–Koch reaction make from benzene?',['Benzaldehyde, using CO and HCl with AlCl₃ and CuCl','Benzoic acid','Phenol','Chlorobenzene'],'A formyl group is added to the ring.'),
 Q('Which reaction joins an aryl halide and an alkyl halide using sodium in dry ether?',['Wurtz–Fittig reaction','Wurtz reaction','Fittig reaction','Ullmann reaction'],'For example, bromobenzene + bromomethane → methylbenzene.'),
 Q('What forms when benzenediazonium chloride is warmed with KI?',['Iodobenzene','Phenol','Benzene','4-Iodophenol'],'No copper catalyst is needed for iodide.'),
 Q('Statement I: Benzaldehyde undergoes the Cannizzaro reaction but not the aldol reaction. Statement II: Benzaldehyde has no α-hydrogen.',SR,'Without an α-H, no enolate can form, so concentrated alkali gives the Cannizzaro reaction instead.')],
xp:[
 {only:'j',fmt:'nvt',title:'Named reactions: integer answers',stem:'Give each answer as an integer.',parts:[
  ['The number of carbon atoms in the amine formed when hexanamide undergoes Hofmann bromamide degradation.','5',4],
  ['How many of these form a new C–C bond: Wurtz reaction, Kolbe electrolysis, Friedel–Crafts alkylation, Cannizzaro reaction, Rosenmund reduction, aldol reaction?','Wurtz, Kolbe, Friedel–Crafts alkylation and aldol: 4.',4],
  ['The number of moles of NaOH used per mole of amide in the Hofmann degradation (RCONH₂ + Br₂ + 4NaOH → RNH₂ + Na₂CO₃ + 2NaBr + 2H₂O).','4',4]]}]};
})();
