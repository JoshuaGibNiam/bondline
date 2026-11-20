/* Bondline version 37: deeper lessons, part 3 (alcohols, phenol, carbonyls, carboxylic acids and derivatives, amines).
   Format as in course-deep-1.js. */
(function(){
const D=window.BL_DEEP=window.BL_DEEP||{};
const {T,E,N,W,M}=window.BL_DEEP_H;

/* ---------- Alcohols ---------- */
D['pu-oh']=[
 {h:'Reflux or distillation?',after:'Oxidation',html:`<p>The apparatus decides the product when a primary alcohol is oxidised.</p>
 <ul><li><b>Distillation</b>, with the oxidising agent added slowly and the mixture warmed: the aldehyde (ethanal boils at 21 °C, ethanol at 78 °C) evaporates as soon as it forms and is collected, so it escapes further oxidation. Use the alcohol in excess.</li>
 <li><b>Heating under reflux</b>, with a vertical condenser: vapours condense and drip back, so the aldehyde stays in the flask with excess oxidising agent and is oxidised all the way to the carboxylic acid. Reflux lets you heat a volatile mixture for a long time without losing it.</li></ul>
 ${E('Cr₂O₇²⁻ + 14H⁺ + 6e⁻ → 2Cr³⁺ + 7H₂O &nbsp;(orange → green)')}
 <p>Tertiary alcohols resist oxidation because the carbon carrying –OH has no hydrogen to lose; oxidation would mean breaking a C–C bond. So the dichromate stays orange, which is how the test distinguishes them.</p>`},
 {h:'Dehydration mechanism',after:'Reactions of alcohols',only:'asijn',html:`<p>Heating an alcohol with concentrated H₂SO₄ or H₃PO₄ (or passing the vapour over hot Al₂O₃) removes water to give an alkene. With acid catalysts the mechanism has three steps:</p>
 <ol><li>The O lone pair takes H⁺ from the acid: the –OH becomes –OH₂⁺, a much better leaving group.</li>
 <li>Water leaves, forming a carbocation (for secondary and tertiary alcohols).</li>
 <li>A neighbouring C–H bond breaks; its electrons form the C=C, and H⁺ is regenerated.</li></ol>
 <p>Ease of dehydration: tertiary &gt; secondary &gt; primary, following carbocation stability. When there is a choice, the more substituted alkene is the main product: butan-2-ol gives mostly but-2-ene (cis and trans) and some but-1-ene. Concentrated H₃PO₄ is often preferred, because concentrated H₂SO₄ is a strong oxidising agent and chars the alcohol, giving SO₂ and CO₂.</p>`},
 {h:'Alcohols as acids',after:'Reactions of alcohols',html:`<p>Alcohols are even weaker acids than water: ethanol (pK<sub>a</sub> about 16) compared with water (about 15.7). That is why sodium fizzes less vigorously in ethanol than in water. The ethyl group pushes electron density onto the oxygen of the ethoxide ion, CH₃CH₂O⁻, concentrating its negative charge and making it less stable than OH⁻.</p>
 ${T([['ethanol','16','no','no','no'],['water','15.7','yes (vigorous)','—','no'],['phenol','10','yes','yes','no'],['ethanoic acid','4.8','yes','yes','yes, fizzes (CO₂)']],['Compound','pK<sub>a</sub>','Reacts with Na','Reacts with NaOH(aq)','Reacts with Na₂CO₃'])}
 <p>The table is a handy way to tell these compounds apart by experiment: only the carboxylic acid fizzes with sodium carbonate or hydrogencarbonate.</p>`},
 {h:'Identifying an unknown alcohol',html:`${W('Compound A, C₄H₁₀O, fizzes with sodium. It turns acidified dichromate green, and the product, distilled off, gives an orange precipitate with 2,4-DNPH but no silver mirror with Tollens’ reagent. A gives a yellow precipitate with alkaline iodine. Identify A.',['Fizzes with Na and has formula C₄H₁₀O: an alcohol.','Oxidised, so primary or secondary. The product is a carbonyl (2,4-DNPH) but not an aldehyde (no Tollens’), so it is a ketone: A is secondary.','Yellow precipitate with alkaline iodine: A contains CH₃CH(OH)–.','A is butan-2-ol, CH₃CH(OH)CH₂CH₃.'])}
 ${M(['Writing "alcohols are oxidised to acids" without saying which alcohols and under which conditions.','Saying tertiary alcohols "cannot react". They do not oxidise, but they react with Na, HX and PCl₅, and dehydrate easily.','Forgetting that the colour change for dichromate is orange to green, and for manganate(VII) purple to colourless.'])}`}
];

/* ---------- Phenol ---------- */
D['pu-phenol']=[
 {h:'Why phenol is so much more reactive than benzene',after:'A very reactive ring',html:`<p>One lone pair on the oxygen is in a p orbital that overlaps with the ring’s π system, so it is partly delocalised into the ring. This raises the electron density of the ring, especially at C2, C4 and C6, making it much more attractive to electrophiles.</p>
 ${T([['bromination','Br₂ with FeBr₃ catalyst','bromine water, room temperature, no catalyst','2,4,6-tribromophenol'],['nitration','conc. HNO₃ + conc. H₂SO₄, 50 °C','dilute HNO₃, room temperature','2- and 4-nitrophenol']],['Reaction','Benzene needs','Phenol needs','Product from phenol'])}
 <p>The same delocalisation also explains phenol’s acidity and why its C–O bond is hard to break: unlike alcohols, phenol does not react with HBr or PCl₅ to replace the OH.</p>
 <p>The bromine water test is very sensitive: phenol at a few parts per million in water gives a white cloudiness, and the reaction is used to estimate phenol in waste water.</p>`},
 {h:'Comparing acid strengths',after:'Acidity',html:`${W('Put in order of increasing acidity: ethanol, 4-nitrophenol, phenol, 4-methylphenol.',['Ethanol is the weakest: no delocalisation of the charge on ethoxide.','Phenols: the phenoxide charge is delocalised into the ring.','An electron-donating CH₃ group puts electron density back into the ring, destabilising the anion: 4-methylphenol is weaker than phenol.','An electron-withdrawing NO₂ group at position 4 pulls charge further out, onto its own oxygens, stabilising the anion: 4-nitrophenol is stronger.','Order: ethanol &lt; 4-methylphenol &lt; phenol &lt; 4-nitrophenol.'])}
 <p>2,4,6-Trinitrophenol (picric acid) is so strengthened that its pK<sub>a</sub> is about 0.4, comparable to a strong acid.</p>`},
 {h:'Uses of phenols',html:`<p>Phenol was the first widely used antiseptic (Joseph Lister, 1867). Today phenols are used to make polycarbonates and epoxy resins (via bisphenol A), phenol–methanal resins such as Bakelite, nylon (via cyclohexanol), and drugs such as paracetamol and aspirin. Substituted phenols such as chloroxylenol (in Dettol) and TCP remain common antiseptics.</p>`}
];

/* ---------- Aldehydes and ketones ---------- */
D['pu-carbonyl']=[
 {h:'Polarity, physical properties and reactivity',after:'The carbonyl group',html:`<p>The C=O bond is strongly polar (Cδ+=Oδ−) because oxygen is much more electronegative than carbon. Unlike the C=C in alkenes, which attracts electrophiles, the carbonyl carbon is attacked by <b>nucleophiles</b>.</p>
 <ul><li><b>Boiling points:</b> carbonyls have permanent dipole–dipole forces but no O–H, so they cannot hydrogen bond with each other. Propanone (56 °C) boils above butane (−1 °C) but below propan-1-ol (97 °C).</li>
 <li><b>Solubility:</b> small aldehydes and ketones are soluble in water, because water can hydrogen bond to the lone pairs on the C=O oxygen. Propanone mixes with water in all proportions.</li>
 <li><b>Aldehydes are more reactive than ketones</b>, for two reasons: a ketone’s two alkyl groups push electron density towards the carbonyl carbon (making it less δ+), and they crowd it, blocking the nucleophile.</li></ul>`},
 {h:'Reduction by hydride: the mechanism',after:'Reduction and oxidation',only:'asijn',html:`<p>NaBH₄ and LiAlH₄ deliver a hydride ion, H⁻, which is a nucleophile. The mechanism is nucleophilic addition, like HCN:</p>
 <ol><li>H⁻ attacks the δ+ carbonyl carbon; the π bond breaks and its electrons move onto oxygen, giving an alkoxide ion.</li>
 <li>The alkoxide takes H⁺ from water (or dilute acid added afterwards), giving the alcohol.</li></ol>
 ${T([['NaBH₄','water or methanol, room temperature','mild: reduces aldehydes and ketones only','safe to handle'],['LiAlH₄','dry ether, then dilute acid','powerful: also reduces carboxylic acids, esters, amides and nitriles','reacts violently with water']],['Reagent','Conditions','Strength','Notes'])}
 <p>Neither reagent touches a C=C, because hydride is a nucleophile and the C=C is not electron-poor. So NaBH₄ reduces CH₂=CHCHO to CH₂=CHCH₂OH, while H₂ with a nickel catalyst would reduce both groups.</p>`},
 {h:'Carbonyl puzzles',after:'Tests',html:`${W('Compound B, C₃H₆O, gives an orange precipitate with 2,4-DNPH, does not react with Fehling’s solution, and gives a yellow precipitate with alkaline iodine. Identify B.',['2,4-DNPH positive: a carbonyl.','No reaction with Fehling’s: a ketone, not an aldehyde.','Yellow CHI₃: contains CH₃CO–.','B is propanone, CH₃COCH₃.'])}
 ${W('Compound C, C₃H₆O, gives a silver mirror with Tollens’ reagent. NaBH₄ reduces it to D. Name C and D.',['Silver mirror: an aldehyde. The only aldehyde C₃H₆O is propanal, CH₃CH₂CHO.','Reduction gives the primary alcohol D, propan-1-ol.'])}
 <p>The orange 2,4-DNPH precipitate can be purified by recrystallisation and its melting point measured. Every aldehyde and ketone gives a derivative with a characteristic melting point, so comparing with a data table identifies the original compound exactly.</p>
 ${M(['Saying Tollens’ reagent turns "silver". The test result is a silver mirror (or grey precipitate), because Ag⁺ is reduced to silver metal.','Thinking ketones give a positive iodoform test in general. Only methyl ketones (CH₃CO–) do.','Forgetting that the HCN addition product has one more carbon than the starting carbonyl.'])}`}
];

/* ---------- Carboxylic acids ---------- */
D['pu-acid']=[
 {h:'Why carboxylic acids are acidic',after:'Acid reactions',html:`<p>When a carboxylic acid loses H⁺, the negative charge on the carboxylate ion, RCOO⁻, is <b>delocalised</b> over both oxygen atoms. The two C–O bonds in ethanoate are the same length (127 pm), between a C–O single and a C=O double bond. Spreading the charge stabilises the ion, so the equilibrium RCOOH ⇌ RCOO⁻ + H⁺ lies further to the right than for alcohols or phenol.</p>
 ${T([['ethanoic acid, CH₃COOH','4.76','reference'],['chloroethanoic acid, ClCH₂COOH','2.86','Cl withdraws electron density, stabilising the anion'],['dichloroethanoic acid','1.29','two Cl atoms: stronger effect'],['trichloroethanoic acid','0.65','three Cl atoms'],['propanoic acid','4.87','extra CH₂ pushes electrons in: slightly weaker']],['Acid','pK<sub>a</sub>','Why'])}
 <p>Lower pK<sub>a</sub> means a stronger acid. The effect of a substituent falls off quickly with distance: 2-chlorobutanoic acid (pK<sub>a</sub> 2.86) is much stronger than 4-chlorobutanoic acid (4.52).</p>`},
 {h:'Physical properties of acids',after:'Making carboxylic acids',html:`<p>Carboxylic acids form two hydrogen bonds per pair of molecules, making <b>dimers</b> in the liquid and even in the vapour. So they boil higher than alcohols of similar mass: ethanoic acid (M<sub>r</sub> 60) boils at 118 °C, propan-1-ol (M<sub>r</sub> 60) at 97 °C. The first four acids mix with water completely; solubility falls as the chain grows. Short-chain acids have sharp smells: methanoic acid is in ant stings, butanoic acid smells of rancid butter.</p>`},
 {h:'Naming esters and acid derivatives',after:'Other reactions',html:`<p>An ester is named after the alcohol it came from (as an alkyl group) followed by the acid (ending -oate). Look at the structure: the part attached to the single-bonded O is the alkyl group; the part containing C=O is the acid.</p>
 ${T([['CH₃COOCH₂CH₃','ethanoic acid + ethanol','ethyl ethanoate'],['HCOOCH₃','methanoic acid + methanol','methyl methanoate'],['CH₃CH₂COOCH₃','propanoic acid + methanol','methyl propanoate'],['CH₃COOC₆H₅','ethanoic acid + phenol','phenyl ethanoate']],['Formula','Made from','Name'])}
 ${M(['Naming CH₃COOCH₂CH₃ as "ethanoyl ethyl" or "ethyl ethanoic". It is ethyl ethanoate.','Writing the ester formula with the parts reversed: in methyl ethanoate the CH₃ is on the O, CH₃COOCH₃.'])}`}
];

/* ---------- Acyl chlorides, esters and amides ---------- */
D['pu-deriv']=[
 {h:'The addition–elimination mechanism',after:'Acyl chlorides',html:`<p>Every reaction of an acyl chloride with a nucleophile (water, an alcohol, ammonia or an amine) follows the same two stages. Using water as the example:</p>
 <ol><li><b>Addition.</b> A lone pair on the O of water attacks the δ+ carbonyl carbon; the C=O π bond breaks and its electrons move onto the oxygen. The intermediate is tetrahedral, with O⁻ and a positively charged oxygen (–OH₂⁺).</li>
 <li><b>Elimination.</b> The O⁻ lone pair re-forms the C=O, and the C–Cl bond breaks, releasing Cl⁻. The Cl⁻ then takes H⁺ from the –OH₂⁺ group, giving HCl.</li></ol>
 <p>Acyl chlorides react far faster than chloroalkanes because the carbonyl carbon is attached to two electronegative atoms and is very δ+, and because the planar carbonyl is easy to approach. Chlorobenzene is slowest of all.</p>
 ${E('ease of hydrolysis: CH₃COCl (cold water, instantly) ≫ CH₃CH₂Cl (hot NaOH) ≫ C₆H₅Cl (no reaction)')}`},
 {h:'Ester hydrolysis and soaps',after:'Esters',html:`<p>Esters are hydrolysed by heating under reflux:</p>
 <ul><li>with <b>dilute acid</b>: reversible, so an equilibrium mixture forms. CH₃COOCH₂CH₃ + H₂O ⇌ CH₃COOH + CH₃CH₂OH.</li>
 <li>with <b>dilute alkali</b>: goes to completion, because the acid formed is turned into its carboxylate salt, which cannot react with the alcohol. CH₃COOCH₂CH₃ + NaOH → CH₃COONa + CH₃CH₂OH. To get the free acid, add a strong acid afterwards.</li></ul>
 <p>Fats and oils are esters of propane-1,2,3-triol (glycerol) with three long-chain fatty acids. Boiling them with NaOH gives glycerol and the sodium salts of the fatty acids: <b>soap</b>. The process is called saponification.</p>
 <p>Esters have fruity smells and are used in flavourings and perfumes (ethyl ethanoate smells of pear drops; pentyl ethanoate of bananas), and as solvents in nail-varnish remover and glues.</p>`},
 {h:'Ranking reactivity of carboxylic acid derivatives',only:'ijn',html:`${E('acyl chloride &gt; acid anhydride &gt; ester ≈ carboxylic acid &gt; amide')}
 <p>The better the leaving group (Cl⁻ is excellent, NH₂⁻ terrible) and the less the attached atom donates its lone pair into the C=O, the more reactive the derivative. Nitrogen donates its lone pair strongly into the C=O of an amide, so amides are the least reactive and most stable: that is why proteins, held together by amide (peptide) bonds, last in water.</p>`}
];

/* ---------- Amines ---------- */
D['pu-amine']=[
 {h:'Why amides are not basic',after:'Classes and basicity',only:'asjn',html:`<p>Ethanamide, CH₃CONH₂, contains an –NH₂ group but is almost neutral. The nitrogen lone pair is delocalised over the N–C=O group (the C–N bond has partial double-bond character), and the electronegative oxygen pulls electron density away from nitrogen. The lone pair is no longer available to accept a proton.</p>
 ${E('base strength: CH₃CH₂NH₂ &gt; NH₃ &gt; C₆H₅NH₂ &gt; CH₃CONH₂')}
 <p>Ethylamine is stronger than ammonia because the ethyl group pushes electron density onto N. Phenylamine is weaker because its lone pair is partly delocalised into the benzene ring. In an amide, delocalisation onto the C=O is even stronger.</p>`},
 {h:'Making phenylamine',after:'Making amines',html:`<p>Phenylamine is made from benzene in two stages:</p>
 <ol><li>Nitrate benzene: concentrated HNO₃ and H₂SO₄, below 55 °C, giving nitrobenzene.</li>
 <li>Reduce the nitro group with tin and concentrated hydrochloric acid, heated under reflux. In the acid, the product is the phenylammonium ion, C₆H₅NH₃⁺, so NaOH is added to release free phenylamine, which is then separated by steam distillation.</li></ol>
 ${E('C₆H₅NO₂ + 6[H] → C₆H₅NH₂ + 2H₂O')}`},
 {h:'Synthesis map: getting to nitrogen compounds',html:`${T([['halogenoalkane','excess NH₃, ethanol, sealed tube','primary amine (same carbons)'],['halogenoalkane','KCN, ethanol, reflux','nitrile (one more carbon)'],['nitrile','LiAlH₄ in dry ether, or H₂/Ni','primary amine (–CH₂NH₂)'],['nitrile','dilute HCl, reflux','carboxylic acid'],['amide','LiAlH₄ in dry ether','amine'],['acyl chloride','NH₃ or an amine, room temperature','amide'],['nitrobenzene','Sn, conc. HCl, then NaOH','phenylamine'],['phenylamine','NaNO₂ + HCl, below 10 °C','diazonium salt']],['From','Reagents','To'])}
 ${W('Make propylamine, CH₃CH₂CH₂NH₂, from bromoethane.',['The product has three carbons; bromoethane has two, so you need to add a carbon: use cyanide.','Step 1: bromoethane + KCN in ethanol, reflux → propanenitrile, CH₃CH₂CN.','Step 2: reduce with LiAlH₄ in dry ether (or H₂ with Ni) → propylamine.'])}
 ${M(['Keeping the diazonium solution warm: above about 10 °C it decomposes, releasing N₂ and giving phenol.','Forgetting to add NaOH after the tin and acid reduction: the product is the salt until the base is added.'])}`}
];
})();
