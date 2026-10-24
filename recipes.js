/* ============================================
   热量营养检测 - 内置菜谱库（只读，做法参考）
   营养自动从 foods.js(FOOD_DB) 同名食材汇总
   ============================================ */
(function () {
  /* v3.13.44 重建：150 道旧菜谱全部替换为 30 道常见家常菜。
     配料名全部对齐新食材库（USDA 344 条 + 调料 18 条），
     每道菜的营养都能现算出来，不会再出现「未计营养」角标。
     分类：荤菜 / 素菜 / 汤羹 / 主食 / 蛋奶 / 水产 */
  var RAW = [
    /* ===== 荤菜 ===== */
    {name:'番茄炒蛋',servingG:280,icon:'🍳',time:12,season:'盐 1小勺、白糖 半勺、食用油 2勺、葱花 少许',
     ingrs:[{name:'鸡蛋（生）',gram:110},{name:'西红柿（生）',gram:180},{name:'食用油',gram:15},{name:'盐',gram:2},{name:'白糖',gram:3},{name:'大葱（生）',gram:10}],
     steps:['鸡蛋加少许盐打散；西红柿切滚刀块。','热锅倒油，蛋液炒至刚凝固盛出。','余油下西红柿中火炒出汁，加糖和盐。','倒回鸡蛋翻匀，撒葱花出锅。']},
    {name:'青椒炒肉丝',servingG:220,icon:'🥩',time:15,season:'生抽 1勺、料酒 半勺、淀粉 1小勺、盐 少许、油 2勺',
     ingrs:[{name:'猪里脊（生）',gram:200},{name:'青甜椒（生）',gram:150},{name:'大蒜（生）',gram:10},{name:'淀粉',gram:8},{name:'生抽',gram:10},{name:'料酒',gram:5},{name:'菜籽油',gram:15}],
     steps:['里脊切丝，加生抽、料酒、淀粉抓匀腌 10 分钟。','青椒切丝，蒜切片。','热油下肉丝快炒至变色盛出。','下青椒炒断生，回肉丝加盐炒匀出锅。']},
    {name:'红烧肉',servingG:220,icon:'🍖',time:80,season:'冰糖 5粒、生抽 2勺、老抽 1勺、料酒 2勺、姜 3片',
     ingrs:[{name:'猪五花肉（生）',gram:200},{name:'生姜（生）',gram:10},{name:'大葱（生）',gram:15},{name:'白糖',gram:8},{name:'生抽',gram:20},{name:'老抽',gram:10},{name:'料酒',gram:20},{name:'菜籽油',gram:5}],
     steps:['五花肉切 3cm 方块，冷水下锅加料酒焯 5 分钟捞出。','锅中小火炒糖色，下肉块翻炒上色。','加姜葱、生抽老抽、料酒，加热水没过肉。','小火焖 60 分钟，大火收汁。']},
    {name:'宫保鸡丁',servingG:230,icon:'🍗',time:20,season:'生抽 2勺、醋 1勺、白糖 1勺、淀粉 1勺、豆瓣酱 1勺、干辣椒 3个',
     ingrs:[{name:'鸡胸肉（生）',gram:250},{name:'花生（生）',gram:40},{name:'黄甜椒（生）',gram:100},{name:'大葱（生）',gram:30},{name:'生抽',gram:15},{name:'醋',gram:10},{name:'白糖',gram:8},{name:'淀粉',gram:10},{name:'豆瓣酱',gram:10},{name:'菜籽油',gram:20}],
     steps:['鸡胸切丁，加生抽、淀粉腌 10 分钟。','调汁：生抽、醋、糖、淀粉、豆瓣酱。','热油下鸡丁炒至金黄，加葱段、干辣椒炒香。','倒入调好的汁，加花生米翻匀出锅。']},
    {name:'麻婆豆腐',servingG:320,icon:'🌶️',time:20,season:'豆瓣酱 2勺、淀粉 1勺、花椒 少许、蒜末 少许',
     ingrs:[{name:'北豆腐（生）',gram:400},{name:'猪肉馅（生）',gram:100},{name:'大葱（生）',gram:20},{name:'豆瓣酱',gram:25},{name:'淀粉',gram:10},{name:'菜籽油',gram:20}],
     steps:['豆腐切块，淡盐水浸泡 5 分钟防碎。','热油下肉馅炒散，加豆瓣酱炒出红油。','加水烧开，下豆腐小火煮 5 分钟。','水淀粉勾芡两次，撒花椒粉出锅。']},
    {name:'鱼香肉丝',servingG:220,icon:'🥕',time:20,season:'生抽 1勺、醋 1勺、白糖 1勺、淀粉 1勺、豆瓣酱 1勺、蒜末',
     ingrs:[{name:'猪里脊（生）',gram:200},{name:'胡萝卜（生）',gram:80},{name:'木耳',gram:50},{name:'大葱（生）',gram:30},{name:'生抽',gram:10},{name:'醋',gram:10},{name:'白糖',gram:8},{name:'淀粉',gram:10},{name:'豆瓣酱',gram:12},{name:'菜籽油',gram:20}],
     steps:['里脊切丝腌上浆；胡萝卜切丝。','调鱼香汁：生抽、醋、糖、淀粉、豆瓣酱。','热油下肉丝滑散，加配菜炒香。','倒鱼香汁大火收汁出锅。']},
    {name:'土豆炖牛腩',servingG:450,icon:'🥘',time:90,season:'生抽 2勺、老抽 半勺、八角 1个、姜 3片、盐 适量',
     ingrs:[{name:'牛肉（生）',gram:400},{name:'土豆（生）',gram:300},{name:'胡萝卜（生）',gram:100},{name:'洋葱（生）',gram:100},{name:'生姜（生）',gram:10},{name:'生抽',gram:20},{name:'老抽',gram:8},{name:'菜籽油',gram:15}],
     steps:['牛腩切块冷水下锅焯水，撇净浮沫捞出。','热油炒香姜片，下牛腩翻炒，加生抽老抽。','加热水没过，小火炖 60 分钟。','下土豆胡萝卜再炖 25 分钟收汁。']},
    {name:'蒜蓉西兰花',servingG:230,icon:'🥦',time:10,season:'盐 半勺、蒜 3瓣、油 1勺',
     ingrs:[{name:'西兰花（生）',gram:300},{name:'大蒜（生）',gram:15},{name:'盐',gram:2},{name:'菜籽油',gram:12}],
     steps:['西兰花切小朵，盐水泡 10 分钟。','沸水加几滴油焯 1 分钟，捞出过凉。','热油爆香蒜末，下西兰花快炒。','加盐炒匀出锅。']},
    {name:'干煸四季豆',servingG:200,icon:'🫛',time:15,season:'盐 适量、干辣椒 3个、蒜末 少许',
     ingrs:[{name:'四季豆（生）',gram:300},{name:'大蒜（生）',gram:12},{name:'盐',gram:2},{name:'菜籽油',gram:20}],
     steps:['四季豆掐两头撕筋，掰段。','中火少油煸 5 分钟至表皮起皱。','下蒜末干辣椒炒香。','加盐炒匀出锅。']},
    {name:'手撕包菜',servingG:200,icon:'🥬',time:10,season:'生抽 1勺、醋 半勺、干辣椒 3个、盐 少许',
     ingrs:[{name:'卷心菜（生）',gram:350},{name:'大蒜（生）',gram:15},{name:'生抽',gram:10},{name:'醋',gram:5},{name:'菜籽油',gram:18}],
     steps:['包菜手撕成片，洗净沥干。','热锅下油爆香蒜片干辣椒。','大火下包菜快速翻炒 1 分钟。','加生抽、醋、盐炒匀立刻出锅。']},
    {name:'可乐鸡翅',servingG:280,icon:'🥤',time:25,season:'可乐 1罐、生抽 2勺、姜 3片',
     ingrs:[{name:'鸡翅（生）',gram:400},{name:'生姜（生）',gram:10},{name:'生抽',gram:20},{name:'白砂糖',gram:10},{name:'菜籽油',gram:10}],
     steps:['鸡翅两面划刀，焯水去血沫。','热油下鸡翅煎至两面金黄。','加生抽、姜片，倒入可乐没过鸡翅。','中火煮 15 分钟，大火收汁浓稠。']},

    /* ===== 素菜 ===== */
    {name:'醋溜土豆丝',servingG:200,icon:'🥔',time:12,season:'醋 2勺、盐 少许、干辣椒 2个、蒜末',
     ingrs:[{name:'土豆（生）',gram:300},{name:'青甜椒（生）',gram:50},{name:'大蒜（生）',gram:12},{name:'醋',gram:15},{name:'盐',gram:2},{name:'菜籽油',gram:15}],
     steps:['土豆切细丝，清水冲洗两遍去淀粉。','热油爆香蒜末干辣椒。','大火下土豆丝翻炒 2 分钟。','沿锅边淋醋，加盐炒匀出锅。']},
    {name:'地三鲜',servingG:280,icon:'🍆',time:20,season:'生抽 1勺、糖 半勺、淀粉 少许、蒜末',
     ingrs:[{name:'茄子（生）',gram:250},{name:'土豆（生）',gram:150},{name:'青甜椒（生）',gram:80},{name:'大蒜（生）',gram:12},{name:'生抽',gram:10},{name:'白砂糖',gram:5},{name:'淀粉',gram:8},{name:'菜籽油',gram:25}],
     steps:['茄子切滚刀块，撒盐腌 10 分钟挤去水分（少吸油）。','土豆青椒切滚刀块。','分别过油炸至金黄，捞出。','锅内爆香蒜末，回锅加生抽糖调味，勾薄芡。']},
    {name:'红烧茄子',servingG:250,icon:'🍆',time:20,season:'生抽 1勺、老抽 半勺、糖 半勺、蒜末、葱花',
     ingrs:[{name:'茄子（生）',gram:350},{name:'大蒜（生）',gram:15},{name:'大葱（生）',gram:15},{name:'生抽',gram:12},{name:'老抽',gram:5},{name:'白砂糖',gram:6},{name:'菜籽油',gram:22}],
     steps:['茄子切条，撒盐腌 10 分钟挤干。','少油中火把茄子煎至软塌微焦。','下蒜末炒香，加生抽老抽糖和小半碗水。','小火焖 5 分钟收汁，撒葱花。']},
    {name:'清炒时蔬',servingG:200,icon:'🥬',time:8,season:'盐 半勺、蒜 2瓣、油 1勺',
     ingrs:[{name:'菠菜（生）',gram:300},{name:'大蒜（生）',gram:10},{name:'盐',gram:2},{name:'菜籽油',gram:12}],
     steps:['菠菜洗净切段，沸水焯 30 秒过凉。','热油爆香蒜片。','下菠菜大火快炒 1 分钟。','加盐炒匀立刻出锅。']},
    {name:'凉拌黄瓜',servingG:200,icon:'🥒',time:8,season:'醋 1勺、生抽 1勺、蒜末、辣椒油 少许',
     ingrs:[{name:'黄瓜（生）',gram:250},{name:'大蒜（生）',gram:10},{name:'醋',gram:10},{name:'生抽',gram:8},{name:'菜籽油',gram:8}],
     steps:['黄瓜拍裂切段，撒盐腌 10 分钟。','倒掉渗出的水。','加蒜末、醋、生抽、辣椒油拌匀。','冷藏 10 分钟更爽脆。']},
    {name:'蒸蛋羹',servingG:180,icon:'🥚',time:15,season:'盐 少许、生抽 几滴、香油 几滴',
     ingrs:[{name:'鸡蛋（生）',gram:100},{name:'大葱（生）',gram:5},{name:'盐',gram:1},{name:'生抽',gram:3},{name:'香油',gram:2}],
     steps:['鸡蛋打散，加 1.5 倍温水和盐搅匀。','过筛去泡沫，盖保鲜膜扎孔。','水开后中小火蒸 10 分钟。','淋生抽香油，撒葱花。']},

    /* ===== 汤羹 ===== */
    {name:'番茄鸡蛋汤',servingG:270,icon:'🍅',time:15,season:'盐 少许、香油 几滴、葱花',
     ingrs:[{name:'西红柿（生）',gram:200},{name:'鸡蛋（生）',gram:60},{name:'大葱（生）',gram:5},{name:'盐',gram:2},{name:'香油',gram:2},{name:'淀粉',gram:5}],
     steps:['西红柿去皮切块。','少油炒出红汁，加水烧开。','淋入蛋液成蛋花，勾薄芡。','加盐香油，撒葱花。']},
    {name:'冬瓜排骨汤',servingG:513,icon:'🍲',time:60,season:'姜 3片、料酒 1勺、盐 适量',
     ingrs:[{name:'猪肋排（生）',gram:400},{name:'冬瓜（生）',gram:300},{name:'生姜（生）',gram:10},{name:'料酒',gram:10},{name:'盐',gram:3}],
     steps:['排骨冷水下锅焯水，撇净浮沫。','加姜片料酒，小火炖 40 分钟。','下冬瓜块再炖 15 分钟。','加盐调味出锅。']},
    {name:'紫菜蛋花汤',servingG:72,icon:'🍜',time:8,season:'盐 少许、香油 几滴、虾皮 少许',
     ingrs:[{name:'紫菜（生）',gram:5},{name:'鸡蛋（生）',gram:60},{name:'大葱（生）',gram:5},{name:'盐',gram:2},{name:'香油',gram:2}],
     steps:['紫菜撕碎放碗底，加盐香油。','水烧开淋蛋液成蛋花。','冲入碗中，撒葱花。']},
    {name:'菌菇汤',servingG:218,icon:'🍲',time:15,season:'盐 少许、胡椒粉 少许、姜 2片',
     ingrs:[{name:'香菇（生）',gram:100},{name:'白蘑菇（生）',gram:100},{name:'生姜（生）',gram:8},{name:'盐',gram:2},{name:'白胡椒',gram:1}],
     steps:['菌菇切片，姜切丝。','少油炒香姜丝和菌菇。','加水烧开煮 8 分钟。','加盐白胡椒调味。']},
    {name:'玉米排骨汤',servingG:563,icon:'🌽',time:60,season:'姜 3片、盐 适量',
     ingrs:[{name:'猪肋排（生）',gram:400},{name:'甜玉米（生）',gram:250},{name:'胡萝卜（生）',gram:100},{name:'生姜（生）',gram:10},{name:'盐',gram:3}],
     steps:['排骨焯水后加姜片，小火炖 40 分钟。','下玉米段胡萝卜再炖 20 分钟。','加盐调味。']},

    /* ===== 主食 ===== */
    {name:'蛋炒饭',servingG:300,icon:'🍚',time:12,season:'盐 少许、葱花、食用油 1勺、生抽 半勺',
     ingrs:[{name:'大米（生）',gram:200},{name:'鸡蛋（生）',gram:100},{name:'胡萝卜（生）',gram:40},{name:'大葱（生）',gram:15},{name:'盐',gram:2},{name:'菜籽油',gram:15}],
     steps:['隔夜米饭用手抓散。','鸡蛋打散炒成蛋碎盛出。','下胡萝卜丁炒香，加米饭炒散。','回蛋碎，加盐生抽，撒葱花。']},
    {name:'番茄鸡蛋面',servingG:400,icon:'🍜',time:15,season:'盐 适量、生抽 1勺、葱花、香油',
     ingrs:[{name:'面粉（生）',gram:120},{name:'鸡蛋（生）',gram:100},{name:'西红柿（生）',gram:150},{name:'大葱（生）',gram:10},{name:'盐',gram:3},{name:'生抽',gram:8},{name:'香油',gram:2}],
     steps:['面粉加水和成面团，擀成面条。','锅中炒番茄鸡蛋成卤。','加水烧开下面条煮 3 分钟。','加盐生抽，淋香油撒葱花。']},
    {name:'白粥',servingG:81,icon:'🥣',time:40,season:'盐 少许',
     ingrs:[{name:'大米（生）',gram:80},{name:'盐',gram:1}],
     steps:['大米淘洗，加水大火煮开。','转小火煮 30 分钟不时搅拌防糊底。','米粒开花后加盐即可。']},
    {name:'小米粥',servingG:81,icon:'🥣',time:35,season:'盐 少许',
     ingrs:[{name:'小米（生）',gram:80},{name:'盐',gram:1}],
     steps:['小米淘洗干净，加水大火煮开。','转小火煮 25 分钟至米油浮起。','加盐调味。']},
    {name:'蒸红薯',servingG:200,icon:'🍠',time:30,season:'无',
     ingrs:[{name:'红薯（生）',gram:250}],
     steps:['红薯洗净不去皮。','上锅蒸 25 分钟至筷子能轻松插入。']},

    /* ===== 蛋奶 ===== */
    {name:'牛奶蒸蛋',servingG:180,icon:'🥛',time:15,season:'盐 少许',
     ingrs:[{name:'鸡蛋（生）',gram:80},{name:'蜂蜜',gram:8},{name:'盐',gram:1}],
     steps:['鸡蛋打散，加 1.5 倍温奶加盐。','过筛后盖膜蒸 10 分钟。','出锅淋蜂蜜。']},

    /* ===== 水产 ===== */
    {name:'清蒸鲈鱼',servingG:350,icon:'🐟',time:20,season:'蒸鱼豉油 2勺、料酒 1勺、姜丝、葱丝',
     ingrs:[{name:'鲈鱼（生）',gram:400},{name:'生姜（生）',gram:15},{name:'小葱（生）',gram:20},{name:'料酒',gram:10},{name:'生抽',gram:15},{name:'菜籽油',gram:10}],
     steps:['鲈鱼两面划刀，抹料酒腌 10 分钟。','盘底垫葱姜，鱼身摆盘。','水开大火蒸 8 分钟，倒掉腥水。','铺新葱丝，淋生抽，浇热油激香。']},
    {name:'白灼虾',servingG:250,icon:'🦐',time:12,season:'生抽 1勺、姜 3片、料酒 1勺',
     ingrs:[{name:'虾（生）',gram:400},{name:'生姜（生）',gram:10},{name:'料酒',gram:10},{name:'生抽',gram:10}],
     steps:['虾剪去须，挑出虾线。','水中加姜片料酒烧开。','下虾煮 2 分钟至变红立即捞出。','蘸生抽吃。']},
    {name:'香煎鳕鱼',servingG:220,icon:'🐟',time:15,season:'盐 少许、黑胡椒 少许、柠檬 几片',
     ingrs:[{name:'鳕鱼（生）',gram:300},{name:'黄油（无盐）',gram:10},{name:'盐',gram:2},{name:'黑胡椒',gram:1}],
     steps:['鳕鱼擦干，两面撒盐和黑胡椒，腌 10 分钟。','平底锅化黄油，中小火煎 3 分钟。','翻面再煎 2 分钟。','出锅挤柠檬汁。']},
    {name:'蒜蓉粉丝蒸虾',servingG:300,icon:'🦐',time:20,season:'蒜末 2勺、生抽 1勺、粉丝 少许',
     ingrs:[{name:'虾（生）',gram:300},{name:'大米（生）',gram:30},{name:'大蒜（生）',gram:25},{name:'生抽',gram:10},{name:'菜籽油',gram:10}],
     steps:['粉丝温水泡软铺盘底。','虾开背去虾线摆好。','蒜末用油炒香（金蒜一半、生蒜一半）铺虾身。','大火蒸 8 分钟，淋生抽。']},
    {name:'葱姜炒蛤蜊',servingG:300,icon:'🐚',time:12,season:'料酒 1勺、生抽 1勺、姜丝、葱段',
     ingrs:[{name:'蛤蜊（生）',gram:400},{name:'生姜（生）',gram:15},{name:'小葱（生）',gram:20},{name:'料酒',gram:10},{name:'生抽',gram:10},{name:'菜籽油',gram:12}],
     steps:['蛤蜊提前吐沙，洗净沥干。','热油爆香姜丝。','下蛤蜊加料酒大火炒。','壳全开后加生抽，撒葱段出锅。']},
  ];

  /* ===== 以下是原文件的计算逻辑，保持不变 ===== */
  var EXT = ['water','ash','sugar','na','ca','fe','mg','phos','k','zn','cu','mn','b1','b2','b3','b6','fol'];
  function findFood(name){
    var F = (typeof FOOD_DB !== 'undefined') ? FOOD_DB : [];
    for (var i = 0; i < F.length; i++) if (F[i].name === name) return F[i];
    return null;
  }
  function findAlias(name){
    var A = (typeof window !== 'undefined' && window.INGR_ALIAS) ? window.INGR_ALIAS : null;
    if (!A) return null;
    var t = A[name];
    if (!t) return null;
    return findFood(t);
  }
  function catOf(p, c, fi){
    if (p >= 18) return '高蛋白';
    if (fi >= 3) return '高纤维';
    if (c >= 30) return '高碳水';
    if (p >= 10) return '均衡';
    return '清淡';
  }
  function totals(ingrs){
    var t = {cal:0,p:0,c:0,f:0,fi:0,va:0,vc:0};
    EXT.forEach(function(n){t[n]=0});
    var miss = [];
    ingrs.forEach(function(g){
      var f = findFood(g.name) || findAlias(g.name);
      if (!f) { miss.push(g.name); return; }
      var k = (g.gram || 0) / 100;
      t.cal += (f.cal||0)*k; t.p += (f.p||0)*k; t.c += (f.c||0)*k;
      t.f += (f.f||0)*k; t.fi += (f.fi||0)*k; t.va += (f.va||0)*k; t.vc += (f.vc||0)*k;
      EXT.forEach(function(n){t[n] += (f[n]||0)*k});
    });
    t.miss = miss;
    return t;
  }
  var out = [];
  RAW.forEach(function(r){
    var tot = totals(r.ingrs);
    var totG = r.ingrs.reduce(function(s,x){return s+(x.gram||0)},0);
    if (totG < 1) totG = 1;
    /* servingG = 这道菜**一盘/一份**的成品重量（熟重参考）。
       配料表里的 gram 是**生料下锅量**（含会被炒掉的水分），
       所以每份的营养要按 servingG/totG 折算，不能直接用生料总和。
       没写 servingG 的就等于生料总重（凉拌/生吃类适用）。 */
    var servingG = r.servingG || totG;
    var k = servingG / totG;          /* 每份 = 整锅 × (servingG/整锅生重) */
    var kp = 100 / totG;              /* 每 100g 成品 */
    /* _per 是「每 100g 成品」的营养 —— 详情页的份量滑杆按这个换算 */
    var per = {cal:Math.round(tot.cal*kp),p:+(tot.p*kp).toFixed(1),c:+(tot.c*kp).toFixed(1),
      f:+(tot.f*kp).toFixed(1),fi:+(tot.fi*kp).toFixed(1),va:Math.round(tot.va*kp),vc:+(tot.vc*kp).toFixed(1)};
    EXT.forEach(function(n){per[n]=+(tot[n]*kp).toFixed(2)});
    /* cal/p/c/... 是「每份」的口径 —— 菜谱列表、加入菜单、记入饮食都用这个 */
    var rec = {id:'n'+(out.length+1),builtin:true,name:r.name,icon:r.icon,img:null,time:r.time||0,season:r.season||'',
      ingrs:r.ingrs,steps:r.steps||[],servingG:servingG,
      cal:Math.round(tot.cal*k),p:+(tot.p*k).toFixed(1),c:+(tot.c*k).toFixed(1),
      f:+(tot.f*k).toFixed(1),fi:+(tot.fi*k).toFixed(1),va:Math.round(tot.va*k),vc:+(tot.vc*k).toFixed(1),
      cat:catOf(tot.p*k,tot.c*k,tot.fi*k),createdAt:0,_per:per};
    /* 扩展项按「每份」另存一份（x_ 前缀），供「更多营养素」页直接读取 */
    EXT.forEach(function(n){rec['x_'+n]=+(tot[n]*k).toFixed(2)});
    if (tot.miss && tot.miss.length) rec._miss = tot.miss;
    out.push(rec);
  });
  window.BUILTIN_RECIPES = out;
  var zeroN = out.filter(function(x){return x.cal===0}).length;
  var missN = out.filter(function(x){return x._miss && x._miss.length}).length;
  console.log('[recipes.js] 内置菜谱加载',out.length,'道；0 热量道数：',zeroN,'；配料缺失道数：',missN);
  if (missN) {
    var allMiss = {};
    out.forEach(function(x){(x._miss||[]).forEach(function(m){allMiss[m]=1})});
    console.log('[recipes.js] 缺失配料:',Object.keys(allMiss).join(' '));
  }
})();
