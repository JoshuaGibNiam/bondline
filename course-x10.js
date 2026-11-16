/* Bondline version 34: drawing questions for every course, plus extra questions for the JEE and NEET units
   (purification, biomolecules and named reactions). See course-x1.js for the multiple-choice format.
   Drawing questions (dq): the student draws with the same tools as "Add diagram" in notes, then checks.
   Lewis structures, tables and titration curves are marked automatically; graphs are self-marked against the model.
   D(prompt, model, why, start, only): model is diagram data (or a list of acceptable answers); start is what the editor opens with. */
(function(){
const X=window.BL_COURSE_X=window.BL_COURSE_X||{pu:{},ic:{},units:[]};
const add=(g,id,o)=>{const t=X[g][id]=X[g][id]||{};for(const k of['qs','dq','xp'])if(o[k])t[k]=(t[k]||[]).concat(o[k])};
const Q=(prompt,opts,why,only)=>only?{prompt,opts,why,only}:{prompt,opts,why};
const D=(prompt,model,why,start,only)=>{const o={draw:true,prompt,model,why};if(start)o.start=start;if(only)o.only=only;return o};
/* Lewis structure: atoms are [element, x, y, lone pairs, charge]; bonds are [atom, atom, order] */
const LS=(atoms,bonds,br)=>({k:'lewis',atoms:atoms.map(([el,x,y,lp,q],i)=>({id:'a'+i,el,x,y,lp:lp||0,e:0,q:q||0})),bonds:bonds.map(([a,b,o])=>({a:'a'+a,b:'a'+b,o:o||1})),br:br||'',dots:false});
const TI=o=>Object.assign({k:'titration',flask:'acid',acid:'strong',pka:[4.76],base:'strong',pkb:4.75,ca:.1,cb:.1,vf:25,vmax:0,ind:'none',marks:true,title:''},o);
const TI0=TI({ca:.05,cb:.05,vf:10});
const TB=(rows,head)=>({k:'table',cap:'',head:head!==false,rows});
const blankCols=(rows,cols)=>rows.map((r,i)=>i===0?r:r.map((c,j)=>cols.includes(j)?'':c));
const GR=(xl,yl,x1,y1,extra)=>Object.assign({k:'graph',title:'',x:{label:xl,min:0,max:x1},y:{label:yl,min:0,max:y1},grid:false,noTicks:true,series:[{id:'s1',name:'',mode:'smooth',fn:'',pts:[],c:0}],notes:[]},extra||{});
const tableQ=(prompt,rows,givenCols,why,only)=>D(prompt,TB(rows),why,TB(blankCols(rows,givenCols.length?rows[0].map((_,j)=>j).filter(j=>!givenCols.includes(j)):[])),only);

/* ---- Lewis structures ---- */
const H2O=LS([['O',280,140,2],['H',230,180],['H',330,180]],[[0,1],[0,2]]);
const NH3=LS([['N',280,130,1],['H',225,170],['H',280,190],['H',335,170]],[[0,1],[0,2],[0,3]]);
const CH4=LS([['C',280,150],['H',280,90],['H',220,150],['H',340,150],['H',280,210]],[[0,1],[0,2],[0,3],[0,4]]);
const CO2=LS([['O',220,150,2],['C',280,150],['O',340,150,2]],[[0,1,2],[1,2,2]]);
const HCN=LS([['H',220,150],['C',280,150],['N',340,150,1]],[[0,1],[1,2,3]]);
const N2=LS([['N',250,150,1],['N',310,150,1]],[[0,1,3]]);
const NH4=LS([['N',280,150,0,1],['H',280,90],['H',220,150],['H',340,150],['H',280,210]],[[0,1],[0,2],[0,3],[0,4]],'+');
const NH4b=LS([['N',280,150],['H',280,90],['H',220,150],['H',340,150],['H',280,210]],[[0,1],[0,2],[0,3],[0,4]],'+');
const H3O=LS([['O',280,140,1,1],['H',225,170],['H',280,195],['H',335,170]],[[0,1],[0,2],[0,3]],'+');
const H3Ob=LS([['O',280,140,1],['H',225,170],['H',280,195],['H',335,170]],[[0,1],[0,2],[0,3]],'+');
const OH=LS([['O',260,150,3,-1],['H',320,150]],[[0,1]],'-');const OHb=LS([['O',260,150,3],['H',320,150]],[[0,1]],'-');
const BF3=LS([['B',280,150],['F',280,90,3],['F',228,180,3],['F',332,180,3]],[[0,1],[0,2],[0,3]]);
const C2H4=LS([['C',250,150],['C',310,150],['H',220,110],['H',220,190],['H',340,110],['H',340,190]],[[0,1,2],[0,2],[0,3],[1,4],[1,5]]);
const C2H2=LS([['H',190,150],['C',250,150],['C',310,150],['H',370,150]],[[0,1],[1,2,3],[2,3]]);
const HCHO=LS([['C',280,160],['O',280,100,2],['H',230,190],['H',330,190]],[[0,1,2],[0,2],[0,3]]);
const CH3OH=LS([['C',250,150],['O',310,150,2],['H',350,180],['H',250,90],['H',190,150],['H',250,210]],[[0,1],[1,2],[0,3],[0,4],[0,5]]);
const HCl=LS([['H',250,150],['Cl',310,150,3]],[[0,1]]);
const F2=LS([['F',250,150,3],['F',310,150,3]],[[0,1]]);
const O2=LS([['O',250,150,2],['O',310,150,2]],[[0,1,2]]);
const CO=LS([['C',250,150,1,-1],['O',310,150,1,1]],[[0,1,3]]);
const CN=LS([['C',250,150,1,-1],['N',310,150,1]],[[0,1,3]],'-');const CNb=LS([['C',250,150,1],['N',310,150,1]],[[0,1,3]],'-');
const PCl3=LS([['P',280,130,1],['Cl',220,170,3],['Cl',280,200,3],['Cl',340,170,3]],[[0,1],[0,2],[0,3]]);
const H2S=LS([['S',280,140,2],['H',230,180],['H',330,180]],[[0,1],[0,2]]);
const CCl4=LS([['C',280,150],['Cl',280,90,3],['Cl',220,150,3],['Cl',340,150,3],['Cl',280,210,3]],[[0,1],[0,2],[0,3],[0,4]]);
const NO3=[LS([['N',280,150,0,1],['O',280,90,2],['O',225,185,3,-1],['O',335,185,3,-1]],[[0,1,2],[0,2],[0,3]],'-')];
const CO3=[LS([['C',280,150],['O',280,90,2],['O',225,185,3,-1],['O',335,185,3,-1]],[[0,1,2],[0,2],[0,3]],'2-')];
const O3=[LS([['O',220,170,3,-1],['O',280,140,1,1],['O',340,170,2]],[[0,1],[1,2,2]])];
const SO2=[LS([['S',280,140,1],['O',220,170,2],['O',340,170,2]],[[0,1,2],[0,2,2]]),LS([['S',280,140,1,1],['O',220,170,3,-1],['O',340,170,2]],[[0,1],[0,2,2]])];
const NH2=LS([['N',280,140,2,-1],['H',230,180],['H',330,180]],[[0,1],[0,2]],'-');const NH2b=LS([['N',280,140,2],['H',230,180],['H',330,180]],[[0,1],[0,2]],'-');
const CH3c=LS([['C',280,150,0,1],['H',280,90],['H',228,180],['H',332,180]],[[0,1],[0,2],[0,3]],'+');const CH3cb=LS([['C',280,150],['H',280,90],['H',228,180],['H',332,180]],[[0,1],[0,2],[0,3]],'+');
const CH3a=LS([['C',280,150,1,-1],['H',280,90],['H',228,180],['H',332,180]],[[0,1],[0,2],[0,3]],'-');const CH3ab=LS([['C',280,150,1],['H',280,90],['H',228,180],['H',332,180]],[[0,1],[0,2],[0,3]],'-');
const HCOOH=LS([['H',190,160],['C',250,160],['O',250,100,2],['O',310,160,2],['H',350,190]],[[0,1],[1,2,2],[1,3],[3,4]]);
const CH3NH2=LS([['C',250,150],['N',310,150,1],['H',340,110],['H',340,190],['H',250,90],['H',190,150],['H',250,210]],[[0,1],[1,2],[1,3],[0,4],[0,5],[0,6]]);
const HNO2=LS([['H',190,160],['O',250,160,2],['N',310,160,1],['O',370,160,2]],[[0,1],[1,2],[2,3,2]]);
const lew=(f,m,why,only)=>D(`Draw the Lewis structure of ${f}. Show every lone pair.`,m,why,null,only);
const lewI=(f,m,why,only)=>D(`Draw the Lewis structure of the ${f} ion. Show every lone pair, and put the ion in brackets with its charge (or show the formal charge on the atom that carries it).`,m,why,null,only);

add('pu','pu-bond',{dq:[
 lew('water, H_2O'.replace('H_2O','H₂O'),H2O,'Oxygen has 6 valence electrons: two make bonds to H and four stay as two lone pairs.'),
 lew('ammonia, NH₃',NH3,'Nitrogen has 5 valence electrons: three bonds to H and one lone pair.'),
 lew('carbon dioxide, CO₂',CO2,'Each O shares two pairs with C (two double bonds) and keeps two lone pairs. C has no lone pairs.'),
 lew('hydrogen cyanide, HCN',HCN,'C–H single bond, C≡N triple bond, and a lone pair on N. Every atom except H has an octet.'),
 lew('nitrogen, N₂',N2,'A triple bond and one lone pair on each N gives both atoms an octet.'),
 lewI('ammonium, NH₄⁺',[NH4,NH4b],'The fourth N–H bond is a dative bond from the nitrogen lone pair to H⁺, so N has no lone pair and carries the + charge.'),
 lewI('hydroxonium (oxonium), H₃O⁺',[H3O,H3Ob],'H⁺ bonds to one lone pair of water; one lone pair remains on O, which carries the + charge.'),
 lewI('hydroxide, OH⁻',[OH,OHb],'O has 6 + 1 = 7 electrons of its own, so after the O–H bond it keeps three lone pairs and the − charge.'),
 lew('hydrogen chloride, HCl',HCl,'One shared pair; chlorine keeps three lone pairs.'),
 lew('carbon monoxide, CO',[CO,LS([['C',250,150,1],['O',310,150,1]],[[0,1,3]])],'A triple bond (one of the pairs is dative from O) and a lone pair on each atom. Formal charges are C⁻ and O⁺, though you may leave them off.'),
 lewI('cyanide, CN⁻',[CN,CNb],'Isoelectronic with N₂: a triple bond and a lone pair on each atom. The negative charge sits on C.'),
 lew('oxygen, O₂',O2,'A double bond and two lone pairs on each O.')]});
add('pu','pu-shape',{dq:[
 lew('boron trifluoride, BF₃',BF3,'Boron has only 3 valence electrons, so it makes three bonds and has no lone pair: an incomplete octet (6 electrons). That is why BF₃ is trigonal planar and a Lewis acid.'),
 lew('methane, CH₄',CH4,'Four bonding pairs and no lone pairs around C: tetrahedral, 109.5°.'),
 lew('phosphorus trichloride, PCl₃',PCl3,'Three bonding pairs and one lone pair around P: trigonal pyramidal.'),
 lew('hydrogen sulfide, H₂S',H2S,'Like water: two bonding pairs and two lone pairs on S, so H₂S is bent.'),
 lew('tetrachloromethane, CCl₄',CCl4,'Four C–Cl bonds and three lone pairs on every Cl; tetrahedral and non-polar.'),
 D('Draw a Lewis structure of the nitrate ion, NO₃⁻ (one resonance form). Show formal charges.',NO3,'N makes one double and two single bonds, so it carries +1; each singly bonded O has three lone pairs and −1. Overall charge −1. The real ion is an average of three equivalent forms.'),
 D('Draw a Lewis structure of the carbonate ion, CO₃²⁻ (one resonance form). Show formal charges or the overall charge in brackets.',CO3.concat([LS([['C',280,150],['O',280,90,2],['O',225,185,3],['O',335,185,3]],[[0,1,2],[0,2],[0,3]],'2-')]),'One C=O and two C–O⁻. The three C–O bonds in the real ion are identical (bond order 1⅓).'),
 D('Draw a Lewis structure of ozone, O₃. Show formal charges.',O3.concat([LS([['O',220,170,2],['O',280,140,1,1],['O',340,170,3,-1]],[[0,1,2],[1,2]])]),'The central O has a double bond, a single bond and one lone pair (+1). The singly bonded O has three lone pairs (−1). That lone pair on the central O makes the molecule bent (about 117°).'),
 lew('sulfur dioxide, SO₂',SO2,'Either two S=O double bonds with one lone pair on S (an expanded octet), or one S=O and one S–O⁻ with S⁺. Both are accepted. One lone pair on S makes SO₂ bent.'),
 lewI('amide, NH₂⁻',[NH2,NH2b],'N has 5 + 1 = 6 non-bonding electrons after two N–H bonds: two lone pairs. Four electron domains, two of them lone pairs, so it is bent like water.'),
 lew('ethene, C₂H₄',C2H4,'C=C double bond; each C also bonds to two H. No lone pairs. Each C is trigonal planar.'),
 lew('ethyne, C₂H₂',C2H2,'C≡C triple bond with one H on each C: linear.')]});
add('pu','pu-org',{dq:[
 lew('methanal, HCHO',HCHO,'C=O double bond with two lone pairs on O; C also bonds to two H.'),
 lew('methanol, CH₃OH',CH3OH,'Four single bonds around C; O has two bonds (to C and H) and two lone pairs.'),
 lew('methanoic acid, HCOOH',HCOOH,'C bonds to H, to =O (two lone pairs) and to –OH (two lone pairs on that O).'),
 lew('methylamine, CH₃NH₂',CH3NH2,'Like ammonia with one H replaced by CH₃: three bonds and one lone pair on N. That lone pair makes amines bases and nucleophiles.'),
 lewI('methyl carbocation, CH₃⁺',[CH3c,CH3cb],'Only three bonds and no lone pair: carbon has 6 electrons, carries +1 and is trigonal planar.'),
 lewI('methyl carbanion, CH₃⁻',[CH3a,CH3ab],'Three bonds and one lone pair: carbon has an octet, carries −1 and is pyramidal.'),
 tableQ('Complete the table of functional groups.',[['Compound','Functional group'],['CH₃CH₂OH','alcohol|hydroxyl'],['CH₃CHO','aldehyde'],['CH₃COCH₃','ketone|carbonyl'],['CH₃COOH','carboxylic acid|carboxyl'],['CH₃CH₂NH₂','amine|primary amine'],['CH₃COOCH₃','ester']],[0],'Look at the atom attached to the carbon skeleton: –OH alcohol, –CHO aldehyde, C–CO–C ketone, –COOH carboxylic acid, –NH₂ amine, –COO– ester.')]});
add('pu','pu-atom',{dq:[
 tableQ('Complete the table for each particle.',[['Particle','Protons','Neutrons','Electrons'],['²³Na','11','12','11'],['²⁴Mg²⁺','12','12','10'],['³⁷Cl⁻','17','20','18'],['¹⁶O²⁻','8','8','10'],['²⁷Al³⁺','13','14','10']],[0],'Protons = atomic number; neutrons = mass number − protons; electrons = protons − charge.'),
 tableQ('Complete the table of subatomic particles.',[['Particle','Relative mass','Relative charge'],['Proton','1','+1|1'],['Neutron','1','0'],['Electron','1/1836|0.0005|0.00055|negligible','-1']],[0],'Protons and neutrons have almost the same mass; the electron is about 1/1836 of that. Charges +1, 0 and −1.'),
 tableQ('Complete the table for these isotopes of carbon and hydrogen.',[['Isotope','Protons','Neutrons'],['¹²C','6','6'],['¹³C','6','7'],['¹⁴C','6','8'],['²H','1','1'],['³H','1','2']],[0],'Isotopes share the proton number and differ only in neutrons.')]});
add('pu','pu-orb',{dq:[
 tableQ('Write the full electron configuration of each species.',[['Species','Electron configuration'],['N','1s2 2s2 2p3|1s^2 2s^2 2p^3|1s²2s²2p³'],['Na','1s2 2s2 2p6 3s1|1s²2s²2p⁶3s¹|1s^2 2s^2 2p^6 3s^1'],['Cl⁻','1s2 2s2 2p6 3s2 3p6|1s²2s²2p⁶3s²3p⁶|1s^2 2s^2 2p^6 3s^2 3p^6'],['Ca','1s2 2s2 2p6 3s2 3p6 4s2|1s²2s²2p⁶3s²3p⁶4s²|1s^2 2s^2 2p^6 3s^2 3p^6 4s^2']],[0],'Fill 1s, 2s, 2p, 3s, 3p, then 4s. Cl⁻ has 18 electrons, the same as argon.'),
 tableQ('Write the electron configurations using the noble-gas core.',[['Species','Configuration'],['Fe','[Ar] 3d6 4s2|[Ar]3d6 4s2|[Ar] 4s2 3d6|[Ar]4s2 3d6|[Ar] 3d⁶ 4s²|[Ar]3d⁶4s²'],['Fe²⁺','[Ar] 3d6|[Ar]3d6|[Ar] 3d⁶|[Ar]3d⁶'],['Cr','[Ar] 3d5 4s1|[Ar]3d5 4s1|[Ar] 4s1 3d5|[Ar]3d⁵4s¹|[Ar] 3d⁵ 4s¹'],['Cu','[Ar] 3d10 4s1|[Ar]3d10 4s1|[Ar] 4s1 3d10|[Ar]3d¹⁰4s¹|[Ar] 3d¹⁰ 4s¹']],[0],'Transition metals lose 4s electrons first. Cr and Cu take 3d⁵4s¹ and 3d¹⁰4s¹, because half-filled and full d subshells are extra stable.')]});
add('pu','pu-ie',{dq:[
 D('Plot log(ionisation energy) against electron number for the first 11 ionisations of sodium. Click to place a point for each one, then compare with the model.',
   GR('Electron removed','log(IE / kJ mol^{-1})',12,5.5,{noTicks:false,grid:true,y:{label:'log(IE / kJ mol^{-1})',min:2,max:5.5},series:[{id:'s1',name:'Na',mode:'points',fn:'',c:0,pts:[[1,2.7],[2,3.66],[3,3.84],[4,3.99],[5,4.12],[6,4.26],[7,4.38],[8,4.45],[9,4.55],[10,5.15],[11,5.24]]}]}),
   'A big jump between the 1st and 2nd (3s electron, then into the n = 2 shell), a steady rise through the 8 electrons of n = 2, then another big jump for the two 1s electrons. That 1, 8, 2 pattern shows the shells.',
   GR('Electron removed','log(IE / kJ mol^{-1})',12,5.5,{noTicks:false,grid:true,y:{label:'log(IE / kJ mol^{-1})',min:2,max:5.5},series:[{id:'s1',name:'Na',mode:'points',fn:'',c:0,pts:[]}]}))]});
add('pu','pu-acid',{dq:[
 D('Set up the curve for adding 0.100 mol dm⁻³ NaOH to 25.0 cm³ of 0.100 mol dm⁻³ ethanoic acid (pKₐ = 4.76).',TI({acid:'weak',pka:[4.76],ca:.1,cb:.1,vf:25}),'A weak acid with a strong base: starts near pH 3, buffers around pH = pKₐ at 12.5 cm³, and the equivalence point at 25.0 cm³ is above 7 (about 8.7) because ethanoate is a weak base. Phenolphthalein suits it.',TI0),
 D('Set up the curve for adding 0.100 mol dm⁻³ NaOH to 20.0 cm³ of 0.100 mol dm⁻³ hydrochloric acid.',TI({ca:.1,cb:.1,vf:20}),'Strong acid, strong base: starts at pH 1, stays flat, then jumps steeply from about 3 to 11 at 20.0 cm³, with pH 7 at equivalence.',TI0),
 tableQ('Choose a suitable indicator for each titration (phenolphthalein, methyl orange, or neither).',[['Titration','Indicator'],['HCl with NaOH','either|both|phenolphthalein or methyl orange|methyl orange or phenolphthalein|phenolphthalein|methyl orange'],['CH₃COOH with NaOH','phenolphthalein'],['HCl with NH₃','methyl orange'],['CH₃COOH with NH₃','neither|none']],[0],'The indicator must change colour inside the steep part. Strong–strong is steep from about 3 to 11, so both work. Weak acid–strong base is steep above 7 (phenolphthalein, 8.3–10). Strong acid–weak base is steep below 7 (methyl orange, 3.1–4.4). Weak–weak has no steep part, so no indicator gives a sharp end point.')]});
add('pu','pu-amine',{dq:[
 D('Set up the curve for adding 0.100 mol dm⁻³ hydrochloric acid to 25.0 cm³ of 0.100 mol dm⁻³ ammonia (pK_b = 4.75). Put the base in the flask.'.replace('pK_b','pK<sub>b</sub>'),TI({flask:'base',acid:'strong',base:'weak',pkb:4.75,ca:.1,cb:.1,vf:25}),'Starts near pH 11, buffers around pH 9.25 (pKₐ of NH₄⁺) and the equivalence point at 25.0 cm³ is below 7 (about 5.3), because NH₄⁺ is a weak acid. Methyl orange suits it.',TI0)]});
add('pu','pu-spec',{dq:[
 tableQ('Complete the table of ¹H NMR splitting for ethyl ethanoate, CH₃COOCH₂CH₃.',[['Proton environment','Splitting','Integration'],['CH₃–C=O','singlet','3'],['O–CH₂–','quartet','2'],['–CH₂–CH₃','triplet','3']],[0],'Use the n + 1 rule: count H on neighbouring carbons. The acetyl CH₃ has no neighbouring H, so it is a singlet. The CH₂ has 3 neighbours (quartet), and the end CH₃ has 2 (triplet).',['a','i'])]});

/* AP units */
add('pu','ap-acid',{dq:[
 D('Set up the curve for adding 0.100 M NaOH to 25.0 mL of 0.100 M ethanoic (acetic) acid, pKₐ 4.76.',TI({acid:'weak',pka:[4.76],ca:.1,cb:.1,vf:25}),'At the half-equivalence point (12.5 mL) pH = pKₐ = 4.76. The equivalence point is basic, near pH 8.7.',TI0),
 D('Set up the curve for adding 0.100 M NaOH to 20.0 mL of 0.100 M H₂C₂O₄, oxalic acid (pKₐ₁ = 1.25, pKₐ₂ = 4.27).',TI({acid:'weak',pka:[1.25,4.27],ca:.1,cb:.1,vf:20}),'A diprotic acid gives two equivalence points: 20.0 mL and 40.0 mL. Here the first is blurred because pKₐ₁ is so low; the second is clear and basic.',TI0),
 D('Set up the curve for adding 0.200 M HCl to 30.0 mL of 0.100 M NH₃ (pK<sub>b</sub> 4.75), with the base in the flask.',TI({flask:'base',acid:'strong',base:'weak',pkb:4.75,ca:.2,cb:.1,vf:30}),'Moles NH₃ = 3.00 mmol, so the equivalence point is at 3.00 ÷ 0.200 = 15.0 mL, and it is acidic (about 5.2).',TI0),
 D('Set up the curve for adding 0.150 M KOH to 40.0 mL of 0.075 M HNO₃.',TI({ca:.075,cb:.15,vf:40}),'Moles HNO₃ = 3.00 mmol, so 20.0 mL of KOH reaches the equivalence point at pH 7.',TI0)]});
add('pu','ap-eq',{dq:[
 tableQ('1.00 mol of N₂O₄ is placed in a 1.00 L flask. At equilibrium, 0.40 mol of NO₂ is present: N₂O₄ ⇌ 2NO₂. Complete the ICE table (in mol L⁻¹, use − for a decrease).',[['','[N₂O₄]','[NO₂]'],['Initial','1.00','0'],['Change','-0.20|−0.20|-0.2','+0.40|0.40|0.4|+0.4'],['Equilibrium','0.80|0.8','0.40|0.4']],[0],'2 NO₂ form per N₂O₄ used, so 0.40 mol NO₂ means 0.20 mol N₂O₄ reacted. K = 0.40² ÷ 0.80 = 0.20.'),
 tableQ('H₂ + I₂ ⇌ 2HI. 0.50 mol H₂ and 0.50 mol I₂ are mixed in 1.0 L; x mol of each reacts. Complete the ICE table in terms of x.',[['','[H₂]','[I₂]','[HI]'],['Initial','0.50','0.50','0'],['Change','-x|−x','-x|−x','+2x|2x'],['Equilibrium','0.50-x|0.50−x|0.5-x','0.50-x|0.50−x|0.5-x','2x']],[0],'The stoichiometry sets the changes: −x, −x, +2x.')]});
add('pu','ap-kin',{dq:[
 D('Sketch the energy profile for an exothermic one-step reaction. Click points to draw the curve; label it in your head: reactants, transition state, products.',GR('Progress of reaction','Energy',10,10,{series:[{id:'s1',name:'',mode:'smooth',fn:'',c:0,pts:[[0,6],[1.5,6],[3.5,8.6],[5,9.2],[6.5,8.6],[8.5,3],[10,3]]}],notes:[{x:.4,y:6.6,t:'Reactants'},{x:8.3,y:2.3,t:'Products'},{x:5.2,y:9.6,t:'E_a'}]}),'Products lie below reactants (ΔH < 0). One hump means one step; its height above the reactants is Eₐ.',GR('Progress of reaction','Energy',10,10)),
 D('Sketch the Maxwell–Boltzmann distribution for a gas at T₁, then add a second line for a higher temperature T₂.',GR('Kinetic energy','Number of molecules',10,1,{series:[{id:'s1',name:'T₁',mode:'line',fn:'2.2*x*exp(-x*x/3.2)/1.8',pts:[],c:0},{id:'s2',name:'T₂ > T₁',mode:'line',fn:'1.25*x*exp(-x*x/6.5)/1.25',pts:[],c:1}]}),'Both curves start at the origin and never touch the x-axis again. The hotter curve has a lower, broader peak shifted right, with the same area, and more molecules beyond Eₐ.',GR('Kinetic energy','Number of molecules',10,1,{series:[{id:'s1',name:'T₁',mode:'smooth',fn:'',pts:[],c:0},{id:'s2',name:'T₂',mode:'smooth',fn:'',pts:[],c:1}]})),
 D('Sketch [A] against time for a first-order reaction with a half-life of 20 s, starting at 1.0 M.',GR('Time / s','[A] / M',100,1,{noTicks:false,grid:true,series:[{id:'s1',name:'',mode:'line',fn:'exp(-0.03466*x)',pts:[],c:0}]}),'Exponential decay: 0.50 M at 20 s, 0.25 M at 40 s, 0.125 M at 60 s. Constant half-life is the mark of first order.',GR('Time / s','[A] / M',100,1,{noTicks:false,grid:true}))]});
add('pu','ap-thermo',{dq:[
 D('Sketch the energy profile of an endothermic reaction, and show a catalysed pathway as a second line.',GR('Progress of reaction','Energy',10,10,{series:[{id:'s1',name:'Uncatalysed',mode:'smooth',fn:'',c:0,pts:[[0,3],[1.5,3],[3.5,7.8],[5,9],[6.5,8.4],[8.5,6],[10,6]]},{id:'s2',name:'Catalysed',mode:'smooth',fn:'',c:1,pts:[[0,3],[1.5,3],[3.5,6.2],[5,6.8],[6.5,6.5],[8.5,6],[10,6]]}]}),'Products above reactants (ΔH > 0). The catalyst lowers the hump (Eₐ) but leaves the start and end levels, so ΔH, unchanged.',GR('Progress of reaction','Energy',10,10,{series:[{id:'s1',name:'Uncatalysed',mode:'smooth',fn:'',pts:[],c:0},{id:'s2',name:'Catalysed',mode:'smooth',fn:'',pts:[],c:1}]})),
 tableQ('Use the bond enthalpies to complete the table for CH₄ + 2O₂ → CO₂ + 2H₂O (C–H 413, O=O 498, C=O 799, O–H 463 kJ mol⁻¹).',[['','kJ mol⁻¹'],['Bonds broken','2648'],['Bonds made','3450'],['ΔH','-802|−802']],[0],'Broken: 4(413) + 2(498) = 2648. Made: 2(799) + 4(463) = 3450. ΔH = 2648 − 3450 = −802 kJ mol⁻¹.')]});
add('pu','ap-gas',{dq:[
 D('Sketch how the volume of a fixed amount of gas at constant pressure changes with temperature from 0 to 400 K.',GR('Temperature / K','Volume',400,10,{noTicks:false,series:[{id:'s1',name:'',mode:'line',fn:'x/40',pts:[],c:0}]}),'Charles’s law: V ∝ T in kelvin, a straight line through the origin.',GR('Temperature / K','Volume',400,10,{noTicks:false,series:[{id:'s1',name:'',mode:'line',fn:'',pts:[],c:0}]})),
 D('Sketch how pressure changes with volume for a fixed amount of gas at constant temperature.',GR('Volume','Pressure',10,10,{series:[{id:'s1',name:'',mode:'line',fn:'8/x',pts:[],c:0}]}),'Boyle’s law: P ∝ 1/V, a curve that falls steeply then levels off, never touching either axis.',GR('Volume','Pressure',10,10))]});

/* IChO */
add('ic','u3',{dq:[
 D('Set up the curve for adding 0.100 mol dm⁻³ NaOH to 20.0 cm³ of 0.100 mol dm⁻³ phenol (pKₐ = 10.0).',TI({acid:'weak',pka:[10],ca:.1,cb:.1,vf:20}),'With pKₐ = 10 the curve has almost no jump at 20.0 cm³: the acid is too weak to titrate accurately with an indicator in water.',TI0),
 lewI('nitronium, NO₂⁺',[LS([['O',220,150,2],['N',280,150,0,1],['O',340,150,2]],[[0,1,2],[1,2,2]],'+'),LS([['O',220,150,2],['N',280,150],['O',340,150,2]],[[0,1,2],[1,2,2]],'+')],'Isoelectronic with CO₂: two N=O double bonds, no lone pair on N (which carries +1), linear. It is the electrophile in nitration.')]});
add('ic','u9',{dq:[
 D('Glycine hydrochloride (pKₐ₁ = 2.34, pKₐ₂ = 9.60): set up the curve for adding 0.100 mol dm⁻³ NaOH to 20.0 cm³ of a 0.100 mol dm⁻³ solution.',TI({acid:'weak',pka:[2.34,9.6],ca:.1,cb:.1,vf:20}),'Two buffer regions at pH 2.34 and 9.60 and two equivalence points at 20.0 and 40.0 cm³. The first equivalence point (pH ≈ 6.0) is the isoelectric point, where glycine is all zwitterion.',TI0)]});
add('ic','u13',{dq:[
 D('Set up the curve for adding 0.100 mol dm⁻³ NaOH to 10.0 cm³ of 0.100 mol dm⁻³ fully protonated histidine (treat it as triprotic, pKₐ 1.8, 6.0, 9.2).',TI({acid:'weak',pka:[1.8,6,9.2],ca:.1,cb:.1,vf:10}),'Three acidic groups (α-COOH, imidazolium, α-NH₃⁺) give equivalence points at 10, 20 and 30 cm³. The imidazole pKₐ near 6 is why histidine buffers at physiological pH and acts in enzyme active sites.',TI0)]});
add('ic','u1',{dq:[
 lew('nitrous acid, HNO₂',HNO2,'H–O–N=O: O of the OH has two lone pairs, N has one lone pair and the terminal O has two.'),
 lew('methylamine, CH₃NH₂',CH3NH2,'Three single bonds and a lone pair on N; it is a base through that lone pair.')]});
add('ic','u12',{dq:[
 tableQ('Predict the ¹H NMR of propan-2-ol, (CH₃)₂CHOH (ignore coupling to OH).',[['Environment','Integration','Splitting'],['2 × CH₃','6','doublet'],['CH','1','septet|heptet|multiplet'],['OH','1','singlet|broad singlet']],[0],'The six CH₃ protons see one H (doublet). The CH sees six H, giving 7 lines. Fast exchange usually makes OH a broad singlet.')]});

/* ---- JEE and NEET: purification and analysis, biomolecules, named reactions ---- */
add('pu','pu-purify',{qs:[
 Q('Which method purifies a solid that is much more soluble in a hot solvent than in the cold solvent?',['Crystallisation','Sublimation','Steam distillation','Distillation under reduced pressure'],'Impurities stay in the cold mother liquor.'),
 Q('Which pair of liquids is best separated by fractional distillation?',['Two miscible liquids with boiling points 20 K apart','Two immiscible liquids','A liquid and a dissolved solid','Two liquids with boiling points 150 K apart'],'Close boiling points need a fractionating column.'),
 Q('Distillation under reduced pressure is used for liquids that:',['Decompose at or below their normal boiling point','Have very low boiling points','Are immiscible with water','Are gases'],'Lower pressure lowers the boiling point.'),
 Q('Steam distillation works for substances that are:',['Volatile in steam and immiscible with water','Soluble in water','Ionic','Non-volatile'],'The mixture boils when the vapour pressures add up to atmospheric pressure, below 373 K.'),
 Q('In differential extraction, an organic compound is shaken with an immiscible solvent in which it is:',['More soluble than in water','Less soluble than in water','Insoluble','Reactive'],'Several small extractions work better than one large one.'),
 Q('In column chromatography with alumina, the component that is most strongly adsorbed:',['Elutes last','Elutes first','Never moves','Moves with the solvent front'],'Weakly adsorbed components come out first.'),
 Q('Which reagent is used to visualise colourless amino acid spots on a TLC plate?',['Ninhydrin','Iodine always','Phenolphthalein','Litmus'],'Gives purple spots; iodine vapour or UV are used for many other compounds.'),
 Q('Which element is detected in Lassaigne’s test as a black precipitate with lead acetate?',['Sulfur, as PbS','Nitrogen','Chlorine','Phosphorus'],'Na₂S + Pb(CH₃COO)₂ → PbS.'),
 Q('In Lassaigne’s test, the sodium fusion converts nitrogen into:',['NaCN','NaNO₃','NH₃','N₂'],'Carbon and nitrogen combine with sodium.'),
 Q('A white precipitate soluble in ammonia in the halogen test shows:',['Chlorine','Bromine','Iodine','Sulfur'],'AgCl dissolves in NH₃(aq).'),
 Q('A yellow precipitate insoluble in ammonia shows:',['Iodine','Chlorine','Bromine','Nitrogen'],'AgI.'),
 Q('Phosphorus in an organic compound is detected by oxidising it to phosphate and adding:',['Ammonium molybdate, giving a yellow precipitate','Silver nitrate','Lead acetate','Iron(III) chloride'],'Ammonium phosphomolybdate.'),
 Q('In the estimation of carbon and hydrogen (Liebig), water is absorbed by:',['Anhydrous CaCl₂','KOH solution','Lime water','Silica'],'CO₂ is absorbed afterwards by KOH.'),
 Q('0.20 g of a compound gave 0.18 g of H₂O on combustion. What is the percentage of hydrogen?',['10%','18%','2%','20%'],'0.18 × 2/18 = 0.020 g of H; 0.020 ÷ 0.20.'),
 Q('In the Kjeldahl method, nitrogen is converted into:',['Ammonium sulfate, then ammonia that is titrated','N₂ gas','NaCN','Nitrate'],'Heated with concentrated H₂SO₄.'),
 Q('In a Kjeldahl estimation, the ammonia from 0.50 g of compound neutralises 10.0 cm³ of 1.0 mol dm⁻³ H₂SO₄. What is %N?',['56%','28%','14%','5.6%'],'20 mmol NH₃ = 0.28 g N.'),
 Q('In the Carius method for sulfur, sulfur is weighed as:',['BaSO₄','PbS','Ag₂S','SO₂'],'Oxidised by fuming HNO₃ and precipitated with Ba²⁺.'),
 Q('0.15 g of a compound gave 0.233 g of BaSO₄ (M = 233). What is %S?',['21.3%','10.7%','32%','15.5%'],'0.001 mol S = 0.032 g.'),
 Q('Oxygen in an organic compound is usually found by:',['Difference: 100% minus the other elements','Direct titration','Lassaigne’s test','Burning in nitrogen'],'There are direct methods, but difference is usual.'),
 Q('Why is sodium used in Lassaigne’s test?',['It converts covalently bonded elements into ionic sodium salts that can be tested','It is a catalyst','It removes water','It reduces halogens'],'Ionic CN⁻, S²⁻ and X⁻ can then be detected.'),
 Q('Why is the Lassaigne extract acidified with acetic acid before adding lead acetate?',['To avoid precipitating lead hydroxide','To speed up the reaction','To remove sulfur','To form PbS faster'],'The extract is alkaline.'),
 Q('Which technique separates a mixture of o-nitrophenol and p-nitrophenol?',['Steam distillation','Sublimation','Crystallisation','Simple filtration'],'Only the o-isomer is steam volatile (intramolecular H-bond).'),
 Q('Which substance can be purified by sublimation?',['Camphor','Sodium chloride','Glucose','Benzoic acid in water'],'It passes from solid to vapour directly.'),
 Q('In paper chromatography, the stationary phase is:',['Water held in the paper fibres','The paper only','The solvent','Air'],'This is partition chromatography.'),
 Q('An Rf value cannot be greater than:',['1','0.5','10','100'],'The spot can’t move further than the solvent.'),
 Q('An empirical formula is CH₂ and Mᵣ is 56. The molecular formula is:',['C₄H₈','C₂H₄','C₃H₆','C₅H₁₀'],'56 ÷ 14 = 4.'),
 Q('A compound contains 92.3% C and 7.7% H. Its empirical formula is:',['CH','CH₂','C₂H₃','CH₃'],'7.69 : 7.7 = 1 : 1 (for example benzene).'),
 Q('Which test distinguishes a carboxylic acid from a phenol?',['NaHCO₃: only the acid gives CO₂','NaOH: only the acid dissolves','FeCl₃: only the acid gives violet','Na: only the acid gives H₂'],'Phenols are too weak to react with hydrogencarbonate.'),
 Q('Which reagent distinguishes an aldehyde from a ketone in qualitative analysis?',['Tollens’ reagent','2,4-DNP','Sodium','Bromine water'],'Only aldehydes give a silver mirror.'),
 Q('In the Dumas method, 0.30 g of compound gave 50 cm³ of N₂ at STP. %N is about:',['20.8%','10.4%','41.6%','5.2%'],'50/22 400 × 28 = 0.0625 g.'),
 Q('Why is CuO used in the Dumas method?',['It oxidises the compound and converts nitrogen to N₂ (after reduction of oxides on hot Cu)','It absorbs CO₂','It is a drying agent','It removes sulfur'],'CO₂ is absorbed by KOH, leaving N₂ to measure.'),
 Q('Which method separates sugar from a mixture with naphthalene?',['Sublimation (naphthalene sublimes)','Steam distillation of sugar','Distillation','Filtration through water only'],'Naphthalene sublimes; sugar does not.'),
 Q('Chromatography gets its name from early separations of:',['Plant pigments','Amino acids','Alkanes','Metals'],'Tswett separated chlorophylls.')]});

add('pu','pu-bio',{qs:[
 Q('Which carbohydrate is a polysaccharide made of β-glucose?',['Cellulose','Starch','Glycogen','Sucrose'],'β-1,4 links give straight chains.'),
 Q('Why can humans not digest cellulose?',['We lack enzymes that break β-1,4-glycosidic links','It is insoluble','It is a protein','It contains nitrogen'],'Ruminants rely on gut microbes.'),
 Q('Glucose has how many chiral centres in its open-chain form?',['4','5','3','6'],'C2 to C5.'),
 Q('Anomers of glucose differ in configuration at:',['C1','C2','C4','C5'],'α and β forms of the ring.'),
 Q('Glucose reduces Fehling’s solution because:',['Its open-chain form contains an aldehyde group','It is a ketone','It contains nitrogen','It is a polymer'],'A reducing sugar.'),
 Q('Glucose reacts with hydroxylamine to form an oxime. This shows:',['It has a carbonyl group','It has a carboxyl group','It is aromatic','It has an amine'],'Carbonyls form oximes.'),
 Q('Glucose with acetic anhydride gives a pentaacetate. This shows:',['Five OH groups','Five carbons','Five chiral centres','Five carbonyls'],'Each OH is acetylated.'),
 Q('Oxidation of glucose with nitric acid gives:',['Saccharic (glucaric) acid','Gluconic acid','Sorbitol','Fructose'],'Both ends are oxidised to COOH.'),
 Q('Which glycosidic link is found in amylose?',['α-1,4','β-1,4','α-1,6 only','β-1,6'],'Amylopectin also has α-1,6 branches.'),
 Q('The pyranose ring of glucose has how many atoms in the ring?',['6 (five C and one O)','5','4','7'],'Like pyran.'),
 Q('Which is a disaccharide of glucose and galactose?',['Lactose','Maltose','Sucrose','Cellobiose'],'Milk sugar.'),
 Q('Sucrose is non-reducing because:',['Its glycosidic bond links the anomeric carbons of both glucose and fructose','It is too large','It has no OH groups','It contains nitrogen'],'No free hemiacetal group.'),
 Q('Invert sugar is:',['An equimolar mixture of glucose and fructose from hydrolysing sucrose','Pure fructose','Pure glucose','Lactose'],'The sign of optical rotation inverts on hydrolysis.'),
 Q('Proteins that act as biological catalysts are called:',['Enzymes','Hormones','Vitamins','Antibodies'],'Most enzymes are globular proteins.'),
 Q('Which level of protein structure is unaffected by denaturation?',['Primary','Secondary','Tertiary','Quaternary'],'Peptide bonds stay intact.'),
 Q('Fibrous proteins such as keratin are:',['Insoluble in water, with long parallel chains','Spherical and soluble','Enzymes','Hormones'],'Globular proteins are usually soluble.'),
 Q('Which is a globular protein?',['Insulin','Keratin','Myosin','Collagen'],'It folds into a compact shape.'),
 Q('Deficiency of vitamin B₁ (thiamine) causes:',['Beriberi','Scurvy','Rickets','Night blindness'],'Thiamine is water-soluble.'),
 Q('Deficiency of vitamin A causes:',['Night blindness (xerophthalmia)','Beriberi','Scurvy','Pernicious anaemia'],'Vitamin A is fat-soluble.'),
 Q('Deficiency of vitamin K causes:',['Slow blood clotting','Rickets','Scurvy','Beriberi'],'Needed for clotting factors.'),
 Q('Deficiency of vitamin B₁₂ causes:',['Pernicious anaemia','Rickets','Scurvy','Beriberi'],'Contains cobalt.'),
 Q('Which nitrogenous bases are purines?',['Adenine and guanine','Cytosine and thymine','Uracil and cytosine','Thymine and uracil'],'Two fused rings.'),
 Q('In DNA, adenine pairs with:',['Thymine through two hydrogen bonds','Cytosine through three','Guanine','Uracil'],'In RNA, adenine pairs with uracil.'),
 Q('The sugar in RNA is:',['Ribose','2-deoxyribose','Glucose','Fructose'],'It has an OH at C2.'),
 Q('Nucleotides are joined in nucleic acids by:',['Phosphodiester links between C3′ and C5′','Peptide bonds','Glycosidic bonds between bases','Hydrogen bonds'],'The sugar–phosphate backbone.'),
 Q('A nucleoside consists of:',['A base and a sugar','A base, a sugar and phosphate','A sugar and phosphate','Two bases'],'Adding phosphate gives a nucleotide.'),
 Q('Which hormone controls blood glucose and is made in the pancreas?',['Insulin','Thyroxine','Adrenaline','Oestrogen'],'Lowers blood glucose.'),
 Q('Thyroxine contains which element?',['Iodine','Iron','Cobalt','Sulfur'],'Made in the thyroid gland.'),
 Q('Which vitamin is also a hormone made in the skin under sunlight?',['Vitamin D','Vitamin C','Vitamin B₁','Vitamin E'],'Regulates calcium.'),
 Q('Zwitterions of amino acids explain their:',['High melting points and solubility in water','Low boiling points','Insolubility in water','Smell'],'Ionic character.'),
 Q('Which amino acid is not essential (the body can make it)?',['Glycine','Valine','Leucine','Lysine'],'Essential amino acids must come from food.')]});

add('pu','pu-named',{qs:[
 Q('The Kolbe electrolysis of sodium ethanoate gives:',['Ethane','Methane','Propane','Ethene'],'2CH₃COO⁻ → C₂H₆ + 2CO₂ + 2e⁻.'),
 Q('Kolbe’s reaction (phenoxide + CO₂ under pressure) gives:',['Salicylic acid','Benzoic acid','Phenyl ethanoate','Picric acid'],'Then acidify.'),
 Q('The Wurtz reaction joins two alkyl halides using:',['Sodium in dry ether','Zinc dust','Copper powder','AlCl₃'],'Gives a symmetrical alkane.'),
 Q('The Fittig reaction joins two aryl halides to give:',['A biaryl, such as biphenyl','An alkylbenzene','An ether','A ketone'],'Sodium in dry ether.'),
 Q('Which reaction converts an aldehyde with no α-hydrogen into an alcohol and a carboxylate salt?',['Cannizzaro reaction','Aldol condensation','Clemmensen reduction','Perkin reaction'],'Disproportionation in concentrated alkali.'),
 Q('Cross-Cannizzaro with methanal: methanal is always oxidised because:',['It is the most easily attacked by OH⁻','It is the largest','It has α-hydrogens','It is a ketone'],'The other aldehyde is reduced to its alcohol.'),
 Q('The Clemmensen reduction converts a ketone into:',['An alkane','An alcohol','An aldehyde','An alkene'],'Zn(Hg) and concentrated HCl.'),
 Q('The Wolff–Kishner reduction uses:',['Hydrazine, then KOH in ethylene glycol on heating','Zn(Hg) and HCl','H₂ and Pd/BaSO₄','LiAlH₄'],'Suitable for acid-sensitive compounds.'),
 Q('The Stephen reduction converts a nitrile into:',['An aldehyde (via SnCl₂/HCl then hydrolysis)','An amine','A carboxylic acid','A ketone'],'Through an imine salt.'),
 Q('The Etard reaction uses:',['Chromyl chloride, CrO₂Cl₂','KMnO₄','CrO₃ in acetic anhydride only','SeO₂'],'Oxidises a methyl group on an arene to CHO.'),
 Q('The Gattermann–Koch reaction uses:',['CO and HCl with anhydrous AlCl₃/CuCl','HCN and HCl','CHCl₃ and NaOH','CrO₂Cl₂'],'Formylation of benzene.'),
 Q('The Reimer–Tiemann reaction with CCl₄ instead of CHCl₃ gives:',['Salicylic acid','Salicylaldehyde','Phenol','Chlorobenzene'],'A –COOH group is introduced instead of –CHO.'),
 Q('The Sandmeyer reaction converts a diazonium salt into an aryl halide using:',['Cu(I) halides','Cu powder','Sodium','Zinc'],'CuCl/HCl or CuBr/HBr.'),
 Q('The Balz–Schiemann reaction makes:',['Fluorobenzene via the diazonium tetrafluoroborate','Iodobenzene','Benzonitrile','Phenol'],'Heat ArN₂⁺BF₄⁻.'),
 Q('Coupling of benzenediazonium chloride with aniline in mildly acidic solution gives:',['p-Aminoazobenzene (a yellow dye)','Phenol','Chlorobenzene','Benzene'],'Attack at the para position.'),
 Q('The carbylamine reaction produces:',['An isocyanide with an offensive smell','A nitrile','An amide','An alcohol'],'Test for primary amines.'),
 Q('Hinsberg’s reagent is:',['Benzenesulfonyl chloride','Benzoyl chloride','Acetic anhydride','Nitrous acid'],'Used to distinguish 1°, 2° and 3° amines.'),
 Q('The product of a primary amine with Hinsberg’s reagent is:',['Soluble in alkali','Insoluble in alkali','No reaction','A gas'],'The sulfonamide N–H is acidic.'),
 Q('A tertiary amine with Hinsberg’s reagent:',['Does not react','Gives a product soluble in alkali','Gives a product insoluble in alkali','Gives N₂'],'No N–H to substitute.'),
 Q('Williamson synthesis works best with:',['A primary alkyl halide and an alkoxide','A tertiary alkyl halide and an alkoxide','Two alcohols with acid','An aryl halide and an alkoxide'],'Tertiary halides undergo elimination instead.'),
 Q('Which ether cannot be made well by Williamson synthesis?',['Di-tert-butyl ether','Diethyl ether','Methyl tert-butyl ether (from CH₃Br and t-BuO⁻)','Ethyl methyl ether'],'Both halves would be tertiary.'),
 Q('The Friedel–Crafts reaction of benzene with CH₃COCl/AlCl₃ followed by Clemmensen reduction gives:',['Ethylbenzene','Methylbenzene','Propylbenzene','Acetophenone'],'C=O becomes CH₂.'),
 Q('The Swarts reaction makes alkyl fluorides by heating alkyl chlorides or bromides with:',['AgF, Hg₂F₂ or SbF₃','NaF in water','F₂ gas','HF only'],'Halogen exchange.'),
 Q('The Finkelstein reaction makes alkyl iodides using:',['NaI in dry acetone','KI in water','I₂ in UV','HI'],'NaCl or NaBr precipitates and drives the reaction.'),
 Q('Aldol condensation needs the aldehyde or ketone to have:',['At least one α-hydrogen','No α-hydrogen','A benzene ring','An OH group'],'The enolate forms at the α-carbon.'),
 Q('Cross aldol between benzaldehyde and ethanal gives mainly:',['Cinnamaldehyde (3-phenylprop-2-enal) after dehydration','Benzyl alcohol','Benzoic acid','Butanal'],'Claisen–Schmidt condensation.'),
 Q('The Hofmann bromamide reaction uses:',['Br₂ and NaOH','Br₂ and FeBr₃','HBr','NBS'],'Amide → amine with one fewer carbon.'),
 Q('Decarboxylation with soda lime is a way to:',['Remove one carbon, giving an alkane','Add a carbon','Make an alcohol','Make a ketone'],'RCOONa → RH.'),
 Q('Which named reaction converts benzene into toluene?',['Friedel–Crafts alkylation with CH₃Cl/AlCl₃','Wurtz reaction','Kolbe reaction','Etard reaction'],'A methyl group is added.'),
 Q('Rosenmund reduction stops at the aldehyde because:',['BaSO₄ (and sometimes quinoline) poisons the Pd catalyst','The aldehyde is unreactive','H₂ is in excess','The temperature is too low'],'Prevents over-reduction to the alcohol.')]});
})();
