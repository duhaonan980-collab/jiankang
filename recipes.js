/* ============================================
   热量营养检测 - 内置菜谱库（只读，做法参考）
   营养自动从 foods.js(FOOD_DB) 同名食材汇总
   ============================================ */
(function () {
  /* 做法数据（第一批 30 道）：name 需与 FOOD_DB 菜肴同名；ingrs.name 需能在 FOOD_DB 按名找到 */
  var RAW = [
    {name:'番茄炒蛋',icon:'🍳',time:10,season:'盐 1小勺、白糖 半勺、食用油 2勺、葱花 少许',
     ingrs:[{name:'鸡蛋',gram:110},{name:'西红柿(小)(熟)',gram:100},{name:'西红柿',gram:80}],
     steps:['鸡蛋加少许盐打散；番茄切滚刀块。','热锅倒油，蛋液炒至刚凝固盛出。','余油下番茄中火炒出汁，加糖和盐。','倒回鸡蛋翻匀，撒葱花出锅。']},
    {name:'红烧肉',icon:'🍖',time:80,season:'冰糖 5粒、生抽 2勺、老抽 1勺、料酒 2勺、姜 3片、八角 1个',
     ingrs:[{name:'猪肉(瘦)',gram:400},{name:'姜',gram:10},{name:'葱',gram:10}],
     steps:['五花肉切 3cm 方块，冷水下锅加料酒焯 5 分钟捞出。','锅放少许油，下冰糖小火炒至琥珀色，倒入肉块翻炒上色。','加姜片、八角、生抽老抽料酒，加热水没过肉。','小火炖 50 分钟，大火收汁至浓亮即可。']},
    {name:'宫保鸡丁',icon:'🍗',time:20,season:'生抽 1勺、醋 1勺、糖 1勺、淀粉、花椒 1把、干辣椒 5个、花生米',
     ingrs:[{name:'鸡胸肉',gram:250},{name:'黄瓜',gram:80},{name:'花生米',gram:40},{name:'干辣椒',gram:8}],
     steps:['鸡胸切丁，加料酒、生抽、淀粉抓匀腌 10 分钟。','调碗汁：生抽、醋、糖、淀粉加水拌匀。','热油下花椒干辣椒爆香，下鸡丁滑炒至变色。','加黄瓜丁翻炒，倒碗汁炒浓，下花生米出锅。']},
    {name:'麻婆豆腐',icon:'🌶️',time:15,season:'豆瓣酱 1勺、花椒粉、生抽、蒜末、水淀粉、食用油',
     ingrs:[{name:'豆腐',gram:350},{name:'猪肉(瘦)',gram:50},{name:'蒜',gram:10}],
     steps:['豆腐切 2cm 块，淡盐水焯 1 分钟捞出。','炒香肉末至出油，加豆瓣酱、蒜末炒出红油。','下豆腐轻推，加半碗水煮 3 分钟。','生抽调味，分两次淋水淀粉勾芡，撒花椒粉。']},
    {name:'鱼香肉丝',icon:'🥘',time:20,season:'生抽 1勺、醋 1勺、糖 1勺、豆瓣酱 1勺、淀粉、泡椒末',
     ingrs:[{name:'猪肉(瘦)',gram:250},{name:'胡萝卜',gram:80},{name:'木耳(干)',gram:15},{name:'青椒',gram:60}],
     steps:['瘦肉切丝，加生抽淀粉抓匀腌 10 分钟。','调鱼香汁：醋、生抽、糖、淀粉加水。','热油下肉丝滑散盛出；爆香豆瓣酱和泡椒。','下胡萝卜丝、木耳丝、青椒丝炒断生，回肉丝倒碗汁收浓。']},
    {name:'蛋炒饭',icon:'🍚',time:10,season:'盐、生抽 半勺、葱花、食用油',
     ingrs:[{name:'米饭',gram:300},{name:'鸡蛋',gram:110},{name:'葱花',gram:8}],
     steps:['隔夜饭打散，鸡蛋加盐打匀。','热油倒蛋液，半凝固时拨散。','下米饭中火翻炒，用铲压散饭团。','加盐和半勺生抽炒香，撒葱花出锅。']},
    {name:'麻辣火锅',icon:'🍲',time:15,season:'火锅底料 半包、姜蒜、干辣椒、花椒、盐',
     ingrs:[{name:'牛肉',gram:200},{name:'豆腐',gram:200},{name:'金针菇',gram:150},{name:'娃娃菜',gram:200}],
     steps:['锅内放底料和姜蒜，加约 1L 水煮开。','撇去浮沫，先下耐煮的豆腐、金针菇。','水大开后下牛肉片烫 30 秒变色即食。','娃娃菜最后下，按口味补盐。']},
    {name:'烤鸡',icon:'🍗',time:90,season:'生抽 2勺、蚝油 1勺、蜂蜜 1勺、料酒、黑胡椒、盐',
     ingrs:[{name:'鸡肉',gram:800},{name:'蒜',gram:15},{name:'柠檬',gram:30}],
     steps:['鸡洗净擦干，用盐、生抽、蚝油、黑胡椒里外抹匀腌 2 小时以上。','烤箱 200℃ 预热，鸡放烤架烤 40 分钟。','取出刷蜂蜜水，翻面再烤 20 分钟至表皮焦黄。','静置 5 分钟再切块。']},
    {name:'汉堡',icon:'🍔',time:15,season:'黑胡椒、盐、黄油、沙拉酱、番茄酱',
     ingrs:[{name:'汉堡胚',gram:100},{name:'牛肉',gram:100},{name:'生菜',gram:30},{name:'西红柿',gram:50}],
     steps:['牛肉馅加盐和黑胡椒，压成比面包略大的肉饼。','平底锅放黄油，中火每面煎 2-3 分钟。','面包胚切开烤香，抹酱铺生菜和番茄片。','放上肉饼合拢即可。']},
    {name:'披萨',icon:'🍕',time:40,season:'番茄酱、马苏里拉芝士、橄榄油、盐',
     ingrs:[{name:'面粉',gram:200},{name:'芝士',gram:80},{name:'西红柿',gram:100},{name:'洋葱',gram:40}],
     steps:['面粉加酵母温水揉成团，醒发至两倍大。','擀成圆饼，扎小孔，抹番茄酱。','铺洋葱、番茄等配料，撒满芝士。','烤箱 220℃ 烤 15 分钟至芝士金黄。']},
    {name:'寿司',icon:'🍣',time:30,season:'寿司醋、盐、糖、芥末、生抽',
     ingrs:[{name:'米饭',gram:300},{name:'三文鱼',gram:100},{name:'黄瓜',gram:50},{name:'海苔',gram:10}],
     steps:['米饭拌入少量寿司醋盐糖放凉。','黄瓜切条，三文鱼切厚片。','海苔铺饭，放馅卷紧切段。','可配芥末酱油蘸食。']},
    {name:'沙拉',icon:'🥗',time:8,season:'橄榄油、柠檬汁、盐、黑胡椒、蜂蜜',
     ingrs:[{name:'生菜',gram:150},{name:'西红柿',gram:80},{name:'黄瓜',gram:80},{name:'鸡胸肉',gram:100}],
     steps:['生菜撕块，黄瓜西红柿切块。','熟鸡胸肉撕条铺上。','淋橄榄油、柠檬汁、盐和黑胡椒拌匀。']},
    {name:'糖醋排骨',icon:'🍖',time:50,season:'冰糖、生抽、醋 2勺、料酒、姜',
     ingrs:[{name:'猪小排',gram:500},{name:'姜',gram:12},{name:'葱',gram:10}],
     steps:['排骨冷水下锅焯去血沫，捞出沥干。','热油炒冰糖至枣红色，下排骨裹匀。','加料酒、生抽、姜片和热水没过排骨，小火焖 35 分钟。','汁快收干时沿锅边淋醋，大火翻炒收汁。']},
    {name:'清蒸鱼',icon:'🐟',time:15,season:'蒸鱼豉油 2勺、姜丝、葱丝、食用油 1勺',
     ingrs:[{name:'鱼',gram:450},{name:'姜',gram:10},{name:'葱',gram:15}],
     steps:['鱼两面划刀，铺姜片水开上锅蒸 8 分钟。','倒掉盘中腥水，铺葱丝姜丝。','淋蒸鱼豉油，浇一勺热油激香。']},
    {name:'炒青菜',icon:'🥬',time:8,season:'盐、蒜末、食用油',
     ingrs:[{name:'青菜',gram:350},{name:'蒜',gram:8}],
     steps:['青菜洗净沥水，蒜拍碎。','大火热油下蒜末爆香。','下青菜快速翻炒 1 分钟。','加盐炒匀即出锅，保持脆嫩。']},
    {name:'回锅肉',icon:'🥩',time:30,season:'豆瓣酱 1勺、豆豉、生抽、糖、青蒜苗',
     ingrs:[{name:'猪肉',gram:350},{name:'青椒',gram:80},{name:'蒜',gram:10},{name:'姜',gram:10}],
     steps:['五花肉冷水下锅煮 15 分钟至筷子能插入，捞出晾凉切薄片。','锅烧热不放油，下肉片中火煸至出油微卷。','加豆瓣酱、豆豉炒出红油。','下青椒片翻炒，生抽糖调味，撒蒜苗段。']},
    {name:'水煮鱼',icon:'🐟',time:30,season:'豆瓣酱、花椒、干辣椒、淀粉、蛋清、盐、料酒',
     ingrs:[{name:'鱼',gram:500},{name:'豆芽',gram:150},{name:'干辣椒',gram:10},{name:'花椒',gram:5}],
     steps:['鱼片用盐、料酒、蛋清、淀粉抓匀腌 15 分钟。','豆芽焯水垫碗底。','炒香豆瓣酱加水煮开，下鱼骨煮 3 分钟。','转小火滑入鱼片煮至变白，连汤倒入碗中。','铺干辣椒花椒，浇热油激香。']},
    {name:'地三鲜',icon:'🍆',time:25,season:'生抽 1勺、蚝油 1勺、糖、蒜末、水淀粉',
     ingrs:[{name:'茄子',gram:250},{name:'土豆',gram:200},{name:'青椒',gram:80},{name:'蒜',gram:10}],
     steps:['土豆茄子切滚刀块，茄子撒盐略腌。','分别煎/炸至金黄捞出。','锅留底油炒香蒜末，倒入土豆茄子。','加生抽蚝油糖和水淀粉，下青椒翻炒收汁。']},
    {name:'酸辣土豆丝',icon:'🥔',time:12,season:'醋 2勺、干辣椒、花椒、盐、葱',
     ingrs:[{name:'土豆',gram:350},{name:'干辣椒',gram:6},{name:'葱',gram:8}],
     steps:['土豆切细丝，清水冲洗两遍去淀粉。','热油下干辣椒花椒爆香。','大火下土豆丝快炒 2 分钟。','沿锅边淋醋，加盐和葱段炒匀。']},
    {name:'葱爆羊肉',icon:'🥩',time:12,season:'生抽、料酒、孜然粉、盐、姜',
     ingrs:[{name:'羊肉',gram:300},{name:'大葱',gram:120},{name:'姜',gram:8}],
     steps:['羊肉切薄片，加料酒生抽抓匀。','大葱斜切段。','大火热油下姜片和羊肉爆炒至变色。','下大葱快速翻炒，加孜然和盐出锅。']},
    {name:'可乐鸡翅',icon:'🍗',time:25,season:'可乐 300ml、生抽 2勺、料酒、姜片',
     ingrs:[{name:'鸡翅',gram:450},{name:'姜',gram:10},{name:'葱',gram:8}],
     steps:['鸡翅两面划刀，冷水下锅加料酒焯水。','煎至两面金黄，下姜片。','倒入可乐和生抽没过鸡翅。','中小火收汁至浓稠裹匀即可。']},
    {name:'麻辣香锅',icon:'🍲',time:20,season:'香锅底料 2勺、干辣椒、花椒、蒜、姜、生抽',
     ingrs:[{name:'虾',gram:150},{name:'土豆',gram:150},{name:'莲藕',gram:120},{name:'木耳(干)',gram:12},{name:'洋葱',gram:80}],
     steps:['所有食材切好，土豆藕片焯至八成熟。','虾煎至变色盛出。','热油下底料干辣椒花椒蒜姜炒香。','下全部食材大火翻炒，生抽调味炒匀。']},
    {name:'小笼包',icon:'🥟',time:90,season:'盐、生抽、姜末、香油、白胡椒粉',
     ingrs:[{name:'面粉',gram:300},{name:'猪肉(瘦)',gram:250},{name:'姜',gram:10},{name:'葱',gram:10}],
     steps:['肉馅加姜末、盐、生抽、香油搅打上劲，可加水打馅。','面粉加温水揉面，醒 30 分钟后擀小圆皮。','包入馅料捏出褶子收口。','水开上锅大火蒸 8 分钟。']},
    {name:'烧卖',icon:'🥟',time:40,season:'盐、生抽、蚝油、香油、糯米',
     ingrs:[{name:'饺子皮',gram:200},{name:'糯米',gram:150},{name:'猪肉(瘦)',gram:100},{name:'香菇',gram:40}],
     steps:['糯米提前泡 2 小时蒸熟。','肉末香菇丁炒香，加生抽蚝油调味，拌入糯米。','取饺子皮包入馅，收口捏成花形。','水开蒸 8 分钟。']},
    {name:'葱油饼',icon:'🥞',time:40,season:'葱花、盐、食用油、五香粉',
     ingrs:[{name:'面粉',gram:300},{name:'葱',gram:40},{name:'食用油',gram:10}],
     steps:['面粉加温水揉成软面团，醒 30 分钟。','擀薄抹油撒盐和葱花卷起，再盘成圆饼擀开。','平底锅少油，中火烙至两面金黄酥脆。']},
    {name:'煎饼果子',icon:'🥞',time:15,season:'甜面酱、辣酱、鸡蛋、香菜、葱花',
     ingrs:[{name:'面粉',gram:100},{name:'鸡蛋',gram:110},{name:'生菜',gram:30},{name:'葱',gram:8}],
     steps:['面粉调成稀糊，平底锅抹薄油倒面糊摊开。','磕一个鸡蛋抹匀，撒葱花。','凝固后翻面，抹酱放生菜卷起。','中间切断即可。']},
    {name:'药膳鸡',icon:'🍗',time:60,season:'党参、黄芪、当归各 3g、红枣 4颗、枸杞、姜、盐',
     ingrs:[{name:'鸡肉',gram:600},{name:'姜',gram:12},{name:'红枣',gram:30}],
     steps:['鸡块焯水去浮沫。','与药材、姜片、红枣同入砂锅。','加足热水小火煲 45 分钟。','出锅前加枸杞和盐。']},
    {name:'炸鸡',icon:'🍗',time:40,season:'生抽、料酒、蒜末、五香粉、盐、淀粉、鸡蛋',
     ingrs:[{name:'鸡肉',gram:600},{name:'鸡蛋',gram:55},{name:'面粉',gram:80},{name:'蒜',gram:10}],
     steps:['鸡块加生抽、料酒、蒜末、五香粉腌 30 分钟。','裹蛋液再拍干粉，重复一次更脆。','油温六成热下锅，中小火炸 8 分钟。','捞出升高油温复炸 1 分钟上色。']},
    {name:'黄焖鸡',icon:'🍗',time:35,season:'生抽 2勺、老抽 半勺、蚝油 1勺、冰糖、姜、干香菇',
     ingrs:[{name:'鸡腿肉',gram:500},{name:'土豆',gram:200},{name:'青椒',gram:80},{name:'香菇',gram:50}],
     steps:['鸡腿肉切块，香菇泡发切片，土豆切滚刀块。','炒香姜片下鸡块煸至微黄。','加香菇、土豆、生抽老抽蚝油和冰糖。','加热水焖 20 分钟，下青椒收汁。']},
    {name:'西红柿鸡蛋面',icon:'🍜',time:15,season:'盐、糖、葱花、食用油',
     ingrs:[{name:'面条',gram:150},{name:'鸡蛋',gram:110},{name:'西红柿',gram:200},{name:'葱',gram:8}],
     steps:['面条煮熟过水备用。','鸡蛋炒散盛出，下番茄炒出汁加水煮开。','调味后倒回鸡蛋，浇在面上。']}
  ,
    {name:'皮蛋瘦肉粥',icon:'🥣',time:60,servingG:350,season:'盐、白胡椒粉、姜丝、葱花、香油少许',ingrs:[{name:'大米',gram:60},{name:'猪肉(瘦)',gram:40},{name:'姜',gram:5},{name:'葱',gram:5}],steps:['大米加少许油盐腌 20 分钟。','水开后下米，小火熬 30 分钟至开花。','肉丝加盐略腌下锅滑散煮 5 分钟。','加姜丝白胡椒粉，撒葱花淋香油。']}
    ,
    {name:'炒河粉（不喝汤）',icon:'🍜',time:10,servingG:300,season:'生抽、老抽、盐、豆芽、葱、食用油',ingrs:[{name:'米粉',gram:250},{name:'猪肉(瘦)',gram:40},{name:'豆芽',gram:50},{name:'洋葱',gram:30}],steps:['米粉温水泡软沥干。','热油炒香肉丝，加洋葱丝。','下米粉大火翻炒加生抽老抽上色。','下豆芽断生盐调味撒葱花。']}
    ,
    {name:'叉烧饭',icon:'🍚',time:20,servingG:400,season:'叉烧酱、生抽、蚝油、蜂蜜、姜、青菜',ingrs:[{name:'米饭',gram:300},{name:'猪肉(瘦)',gram:100},{name:'青菜',gram:80},{name:'姜',gram:5}],steps:['肉片用叉烧酱生抽蚝油蜂蜜腌 30 分钟。','烤箱 200℃ 烤 15 分钟中途刷蜂蜜。','米饭装碗叉烧切片铺上。','青菜焯水摆盘浇一勺卤汁。']}
    ,
    {name:'烧鹅饭',icon:'🍚',time:25,servingG:400,season:'卤水、生抽、姜、蒜',ingrs:[{name:'米饭',gram:300},{name:'鸭肉',gram:120},{name:'青菜',gram:80},{name:'蒜',gram:5}],steps:['鸭肉用盐生抽姜蒜腌 2 小时。','煎至皮金黄加水半没过焖 20 分钟。','米饭装碗鸭肉切块铺上。','青菜焯水淋焖鸭汁。']}
    ,
    {name:'炸酱面（不喝汤）',icon:'🍜',time:20,servingG:350,season:'甜面酱 2勺、黄豆酱 1勺、黄瓜丝、豆芽、葱',ingrs:[{name:'面条（去汤汁）',gram:200},{name:'猪肉(瘦)',gram:60},{name:'黄瓜',gram:30},{name:'葱',gram:10}],steps:['肉丁炒香加甜面酱黄豆酱小火炒酱。','面条煮熟过凉水。','码黄瓜丝豆芽浇上炸酱。','拌匀开吃。']}
    ,
    {name:'热干面（不喝汤）',icon:'🍜',time:12,servingG:300,season:'芝麻酱、辣椒油、生抽、醋、萝卜干、葱花',ingrs:[{name:'面条（去汤汁）',gram:200},{name:'芝麻酱',gram:10},{name:'葱',gram:8},{name:'白砂糖',gram:3}],steps:['面条煮至八成熟捞出拌油晾凉。','芝麻酱温水澥开加生抽醋辣椒油调汁。','面回滚水烫 30 秒捞出。','浇酱料撒萝卜干葱花。']}
    ,
    {name:'锅包肉',icon:'🍖',time:25,servingG:250,season:'淀粉、白醋 2勺、白糖 2勺、番茄酱、葱姜',ingrs:[{name:'猪肉(瘦)',gram:200},{name:'姜',gram:5},{name:'葱',gram:5},{name:'白砂糖',gram:10}],steps:['里脊切片裹淀粉糊。','六成油温炸定型复炸至酥脆。','锅留底油下番茄酱糖醋小火熬浓。','倒肉片快速翻裹出锅。']}
    ,
    {name:'口水鸡',icon:'🍗',time:20,servingG:250,season:'辣椒油、生抽、醋、花椒粉、蒜末、花生碎',ingrs:[{name:'鸡腿',gram:300},{name:'黄瓜',gram:30},{name:'蒜',gram:5},{name:'葱',gram:5}],steps:['鸡腿冷水下锅加姜葱煮 15 分钟焖 5 分钟。','过冰水手撕成条。','调红油汁：辣椒油生抽醋花椒粉蒜末。','浇鸡丝上撒花生碎香菜。']}
    ,
    {name:'宫保虾球',icon:'🦐',time:20,servingG:250,season:'番茄酱、糖、醋、生抽、淀粉、干辣椒',ingrs:[{name:'虾',gram:250},{name:'花生米',gram:20},{name:'葱',gram:8},{name:'蒜',gram:5}],steps:['虾开背拍薄淀粉。','炸至外壳酥脆。','调宫保汁糖醋生抽番茄酱淀粉。','爆香干辣椒葱蒜倒入虾和汁下花生米。']}
    ,
    {name:'鱼香茄子',icon:'🍆',time:20,servingG:250,season:'豆瓣酱、生抽、糖、醋、蒜末、水淀粉',ingrs:[{name:'茄子',gram:300},{name:'猪肉(瘦)',gram:40},{name:'蒜',gram:8},{name:'葱',gram:5}],steps:['茄子切条撒盐腌 10 分钟挤水。','煎软盛出。','炒香肉末豆瓣酱蒜末。','回茄子加糖醋生抽小火烧 2 分钟勾芡。']}
    ,
    {name:'干煸豆角',icon:'🥬',time:12,servingG:250,season:'蒜末、豆豉、生抽、盐、油',ingrs:[{name:'豆角',gram:300},{name:'猪肉(瘦)',gram:30},{name:'蒜',gram:10}],steps:['豆角掰段擦干。','六成油温炸至虎皮捞出。','爆香蒜末豆豉肉末。','回豆角加盐和少许生抽翻炒。']}
    ,
    {name:'蒸蛋羹',icon:'🥚',time:15,servingG:200,season:'盐、生抽、香油、温水',ingrs:[{name:'鸡蛋',gram:110},{name:'姜',gram:2},{name:'葱',gram:3}],steps:['鸡蛋加 1.5 倍温水打匀滤泡。','盖保鲜膜扎孔水开中火蒸 10 分钟。','出锅淋生抽香油撒葱花。']}
    ,
    {name:'番茄牛腩',icon:'🍲',time:50,servingG:350,season:'番茄酱、生抽、姜片、葱段、冰糖',ingrs:[{name:'牛肉(瘦)',gram:200},{name:'西红柿',gram:300},{name:'洋葱',gram:40},{name:'姜',gram:8}],steps:['牛肉切块焯水。','炒香姜葱下番茄炒出汁。','加牛肉和热水小火炖 40 分钟。','盐调味收至浓稠。']}
    ,
    {name:'酸菜鱼',icon:'🐟',time:25,servingG:400,season:'酸菜、泡椒、花椒、料酒、淀粉、蛋清',ingrs:[{name:'鱼',gram:400},{name:'酸白菜',gram:120},{name:'豆芽',gram:80},{name:'花椒',gram:3}],steps:['鱼片用盐料酒蛋清淀粉腌 15 分钟。','炒香酸菜泡椒加水煮出酸味。','下鱼骨煮 3 分钟滑入鱼片变白。','撒花椒浇热油激香。']}
    ,
    {name:'辣子鸡',icon:'🍗',time:20,servingG:250,season:'干辣椒 1把、花椒、生抽、料酒、盐、淀粉',ingrs:[{name:'鸡腿肉',gram:300},{name:'干辣椒',gram:15},{name:'花椒',gram:5},{name:'姜',gram:8}],steps:['鸡丁加料酒生抽淀粉腌 15 分钟。','炸至金黄酥脆捞出。','底油下干辣椒花椒小火炒香。','倒鸡丁翻匀加盐炒香。']}
    ,
    {name:'毛血旺',icon:'🍲',time:20,servingG:350,season:'火锅底料、豆瓣酱、花椒、干辣椒、葱姜蒜',ingrs:[{name:'鸭血',gram:100},{name:'猪血',gram:100},{name:'午餐肉',gram:50},{name:'豆芽',gram:100},{name:'毛肚',gram:80}],steps:['炒香底料豆瓣酱加高汤煮开。','下鸭血午餐肉豆芽煮 5 分钟。','毛肚烫 15 秒。','表面铺干辣椒花椒浇热油。']}
    ,
    {name:'糯米鸡',icon:'🍙',time:60,servingG:180,season:'糯米、香菇、鸡肉、荷叶/粽叶、生抽、蚝油',ingrs:[{name:'糯米',gram:150},{name:'鸡肉',gram:80},{name:'香菇',gram:20},{name:'胡萝卜',gram:20}],steps:['糯米泡 3 小时。','鸡肉香菇炒香加生抽蚝油拌糯米。','用叶包好水开蒸 40 分钟。']}
    ,
    {name:'生煎包',icon:'🥟',time:30,servingG:250,season:'肉馅、皮冻/高汤、葱姜、生抽、芝麻',ingrs:[{name:'猪肉(瘦)',gram:150},{name:'姜',gram:8},{name:'葱',gram:8}],steps:['肉馅加葱姜水生抽搅打上劲拌皮冻丁。','擀皮包馅捏褶。','平底锅刷油煎至底金黄。','加水没过一半盖盖焖 6 分钟撒芝麻。']}
    ,
    {name:'锅贴',icon:'🥟',time:25,servingG:240,season:'肉馅、姜、生抽、香油',ingrs:[{name:'猪肉(瘦)',gram:120},{name:'姜',gram:8},{name:'葱',gram:8}],steps:['肉馅调味搅打上劲。','饺子皮包馅两端不封口。','平底锅煎至底面金黄。','加少许水盖盖焖至皮透明再煎脆底。']}
    ,
    {name:'豆腐脑',icon:'🥣',time:8,servingG:300,season:'卤汁/酱油、蒜汁、辣椒油、花生碎',ingrs:[{name:'内酯豆腐',gram:250},{name:'香菜',gram:5},{name:'花生米',gram:10}],steps:['豆腐脑盛入碗中。','淋热卤汁或酱油蒜汁。','加辣椒油香菜花生碎即成。']}
    ,
    {name:'油泼面',icon:'🍜',time:20,servingG:350,season:'辣椒面、生抽、醋、蒜末、青菜、豆芽',ingrs:[{name:'面条（去汤汁）',gram:250},{name:'豆芽',gram:50},{name:'青菜',gram:40},{name:'蒜',gram:8}],steps:['面条煮好捞入碗铺蒜末辣椒面。','烧热油浇辣椒面。','加生抽醋码烫好的豆芽青菜。','拌匀开吃。']}
    ,
    {name:'羊肉泡馍',icon:'🥣',time:30,servingG:400,season:'羊肉汤、香菜、辣椒酱',ingrs:[{name:'羊肉',gram:120},{name:'饼',gram:200},{name:'粉丝',gram:30},{name:'香菜',gram:5}],steps:['羊肉切块焯水加姜炖 1 小时成汤。','死面饼掰小块泡入。','粉丝烫软铺底盛入羊肉和汤。','加盐香菜辣椒酱。']}
    ,
    {name:'红烧排骨',icon:'🍖',time:50,servingG:300,season:'冰糖、生抽、老抽、料酒、姜、八角',ingrs:[{name:'猪大排（带骨）',gram:350},{name:'姜',gram:8},{name:'葱',gram:8},{name:'冰糖',gram:8}],steps:['排骨冷水下锅焯水。','炒糖色下排骨裹匀。','加生抽老抽料酒姜八角热水没过。','小火焖 35 分钟收汁。']}
    ,
    {name:'黄瓜炒鸡蛋',icon:'🍳',time:10,servingG:250,season:'盐、葱花、食用油',ingrs:[{name:'鸡蛋',gram:110},{name:'黄瓜',gram:150},{name:'葱',gram:8}],steps:['鸡蛋打散炒熟盛出。','黄瓜切片余油快炒 1 分钟。','倒回鸡蛋加盐炒匀。','撒葱花出锅。']}
    ,
    {name:'西红柿鸡蛋汤',icon:'🍲',time:15,servingG:400,season:'盐、香油、葱花、白胡椒粉',ingrs:[{name:'西红柿',gram:200},{name:'鸡蛋',gram:110},{name:'葱',gram:5}],steps:['西红柿切块炒出汁。','加水煮开淋入蛋液成蛋花。','加盐白胡椒粉。','撒葱花淋香油。']}
    ,
    {name:'紫菜蛋花汤',icon:'🍲',time:8,servingG:350,season:'盐、香油、虾皮/紫菜、香菜',ingrs:[{name:'紫菜',gram:3},{name:'鸡蛋',gram:55},{name:'虾皮',gram:3},{name:'葱',gram:3}],steps:['水开下紫菜虾皮煮 1 分钟。','淋入蛋液搅出蛋花。','加盐调味。','滴香油撒葱花。']}
    ,
    {name:'木须肉',icon:'🥘',time:20,servingG:280,season:'鸡蛋、木耳、黄瓜丝、生抽、淀粉、葱姜',ingrs:[{name:'猪肉(瘦)',gram:100},{name:'鸡蛋',gram:110},{name:'木耳',gram:20},{name:'黄瓜',gram:30}],steps:['肉丝加淀粉抓匀滑油盛出。','炒散鸡蛋。','爆香葱姜下木耳黄瓜丝翻炒。','回肉丝鸡蛋生抽调味勾薄芡。']}
    ,
    {name:'青椒肉丝',icon:'🫑',time:12,servingG:250,season:'生抽、淀粉、料酒、盐',ingrs:[{name:'猪肉(瘦)',gram:200},{name:'青椒',gram:120},{name:'姜',gram:5}],steps:['肉丝加料酒生抽淀粉抓匀腌 10 分钟。','热油滑炒至变色盛出。','下青椒丝炒断生。','回肉丝加盐生抽炒匀。']}
    ,
    {name:'白切鸡',icon:'🍗',time:30,servingG:250,season:'姜、葱、盐、香油、沙姜蘸料',ingrs:[{name:'鸡腿',gram:350},{name:'姜',gram:10},{name:'葱',gram:10}],steps:['鸡腿加姜葱大火煮 15 分钟关火焖 10 分钟。','捞出过冰水皮紧肉嫩。','斩块配姜蓉葱油沙姜蘸料。']}
    ,
    {name:'红烧茄子',icon:'🍆',time:20,servingG:280,season:'蒜末、豆瓣酱、生抽、糖、水淀粉',ingrs:[{name:'茄子',gram:300},{name:'蒜',gram:12},{name:'葱',gram:5}],steps:['茄子切条油煎软盛出。','爆香蒜末豆瓣酱。','回茄子加生抽糖小火烧入味。','水淀粉收汁撒葱花。']}
  ,
    {name:'螺蛳粉（不喝汤）',icon:'🍜',time:20,servingG:350,season:'螺蛳汤料、酸笋、花生米、腐竹、辣椒油、葱花',ingrs:[{name:'米粉',gram:250},{name:'豆芽',gram:40},{name:'花生米',gram:10},{name:'豆腐皮',gram:20}],steps:['米粉泡软煮 2 分钟捞出。','汤料加水煮开，烫豆芽铺碗。','放酸笋、腐竹、米粉，浇热汤。','加花生米辣椒油葱花。']}
    ,
    {name:'鸡蛋面（不喝汤）',icon:'🍜',time:12,servingG:350,season:'生抽、猪油/香油、葱花、盐',ingrs:[{name:'面条（去汤汁）',gram:200},{name:'鸡蛋',gram:55},{name:'葱',gram:8},{name:'小白菜',gram:40}],steps:['面条煮至八成熟。','空碗放生抽、盐和一小勺猪油。','面汤冲开碗底，捞入面条。','卧一个荷包蛋，撒葱花。']}
    ,
    {name:'素面（不喝汤）',icon:'🍜',time:10,servingG:300,season:'生抽、素高汤/盐、香油、葱花',ingrs:[{name:'面条（去汤汁）',gram:200},{name:'青菜',gram:60},{name:'葱',gram:8}],steps:['煮面至八成熟。','碗中调生抽盐香油，舀面汤冲开。','捞面入碗，摆烫青菜。','撒葱花即可。']}
    ,
    {name:'麻辣烫（不喝汤）',icon:'🍲',time:15,servingG:400,season:'麻辣汤底、蒜泥、芝麻酱、辣椒油',ingrs:[{name:'粉丝',gram:80},{name:'金针菇',gram:80},{name:'藕片',gram:80},{name:'鱼丸',gram:60},{name:'海带',gram:40}],steps:['各种食材串好或切好。','底料加水煮开成麻辣汤。','食材按耐煮程度先后下锅烫熟。','出锅拌蒜泥麻酱辣椒油。']}
    ,
    {name:'盖浇饭',icon:'🍚',time:15,servingG:450,season:'生抽、老抽、蚝油、糖、水淀粉',ingrs:[{name:'米饭',gram:300},{name:'猪肉(瘦)',gram:80},{name:'鸡蛋',gram:55},{name:'青菜',gram:60},{name:'胡萝卜',gram:30}],steps:['肉丁炒香加生抽老抽蚝油糖和热水。','小火焖 5 分钟，水淀粉勾芡成浇头。','米饭装盘。','浇头连汁浇上，配煎蛋和烫青菜。']}
    ,
    {name:'炒米粉',icon:'🍜',time:12,servingG:350,season:'生抽、老抽、蚝油、豆芽、葱、鸡蛋',ingrs:[{name:'米粉',gram:300},{name:'鸡蛋',gram:55},{name:'豆芽',gram:60},{name:'洋葱',gram:30},{name:'葱',gram:8}],steps:['米粉泡软沥干。','炒散鸡蛋盛出。','爆香洋葱丝，下米粉大火翻炒。','加生抽老抽上色，回鸡蛋豆芽炒熟。']}
    ,
    {name:'肠粉',icon:'🥟',time:12,servingG:300,season:'肠粉豉油、蒜蓉、葱花、食用油',ingrs:[{name:'面粉',gram:80},{name:'米粉',gram:100},{name:'鸡蛋',gram:55},{name:'生菜',gram:40}],steps:['粘米粉与澄粉调成粉浆。','蒸盘刷油舀一勺浆，加蛋液和生菜。','大火蒸 2 分钟至起泡。','刮起装盘，淋豉油。']}
    ,
    {name:'兰州拉面（不喝汤）',icon:'🍜',time:25,servingG:400,season:'牛肉汤、白萝卜、香菜、辣椒油',ingrs:[{name:'面条（去汤汁）',gram:250},{name:'牛肉(瘦)',gram:80},{name:'白萝卜',gram:60},{name:'香菜',gram:5}],steps:['牛肉焯水，加姜炖 1 小时成汤。','萝卜切块入汤煮软。','面条另锅煮好捞入大碗。','浇牛肉汤和牛肉片，撒香菜辣椒油。']}
    ,
    {name:'肉夹馍',icon:'🥙',time:25,servingG:250,season:'卤肉、青椒、孜然粉、辣椒面',ingrs:[{name:'饼',gram:150},{name:'猪肉(瘦)',gram:80},{name:'青椒',gram:40},{name:'香菜',gram:5}],steps:['肉卤或烤熟切碎，青椒切末。','馅料加孜然辣椒面拌匀。','白吉馍切开，夹入满满馅料。','压紧即可。']}
    ,
    {name:'凉皮',icon:'🥡',time:10,servingG:300,season:'芝麻酱、辣椒油、蒜水、醋、黄瓜丝',ingrs:[{name:'面粉',gram:100},{name:'黄瓜',gram:30},{name:'豆芽',gram:40},{name:'蒜',gram:5}],steps:['凉皮切宽条，黄瓜切丝。','芝麻酱用蒜水澥开加醋辣椒油。','凉皮黄瓜豆芽拌匀。','淋酱汁开吃。']}
    ,
    {name:'炒年糕',icon:'🍡',time:15,servingG:350,season:'韩式辣酱或生抽、糖、白菜、胡萝卜',ingrs:[{name:'年糕',gram:300},{name:'白菜',gram:80},{name:'胡萝卜',gram:40},{name:'洋葱',gram:40}],steps:['年糕条焯软。','炒香洋葱，加白菜胡萝卜翻炒。','下年糕加一碗水与酱料煮 5 分钟。','收汁至浓稠。']}
    ,
    {name:'牛肉面（不喝汤）',icon:'🍜',time:20,servingG:400,season:'牛肉汤、白萝卜、香菜、盐',ingrs:[{name:'面条（去汤汁）',gram:250},{name:'牛肉(瘦)',gram:80},{name:'白萝卜',gram:60}],steps:['牛肉焯水加姜八角炖 1 小时。','萝卜切片煮软。','面条煮熟入碗。','浇汤放牛肉萝卜片，盐调味。']}
    ,
    {name:'酸辣粉（不喝汤）',icon:'🍜',time:12,servingG:350,season:'辣椒油、醋、花生碎、肉末、葱花',ingrs:[{name:'红薯粉',gram:100},{name:'花生米',gram:10},{name:'猪肉(瘦)',gram:30},{name:'葱',gram:8}],steps:['红薯粉煮软过凉水。','炒肉末加生抽成臊子。','碗中调醋辣椒油。','粉入碗浇臊子加花生葱花。']}
    ,
    {name:'烤肉饭',icon:'🍚',time:25,servingG:450,season:'照烧汁/烤肉酱、生菜、泡菜',ingrs:[{name:'米饭',gram:350},{name:'牛肉(瘦)',gram:100},{name:'洋葱',gram:40},{name:'生菜',gram:30}],steps:['牛肉片用烤肉酱腌 20 分钟。','煎烤至微焦，洋葱炒软。','米饭装碗铺烤肉洋葱。','配生菜泡菜。']}
    ,
    {name:'肉丸汤',icon:'🍲',time:25,servingG:300,season:'盐、白胡椒粉、姜、葱、香菜',ingrs:[{name:'猪肉(瘦)',gram:120},{name:'鸡蛋',gram:55},{name:'姜',gram:5},{name:'葱',gram:5}],steps:['肉末加姜末蛋清搅上劲，搓成小丸子。','水微开下丸子，煮至浮起。','撇沫，加盐白胡椒粉。','撒葱花香菜。']}
    ,
    {name:'干锅花菜',icon:'🥦',time:18,servingG:300,season:'蒜末、干辣椒、豆瓣酱、生抽、孜然',ingrs:[{name:'花菜',gram:400},{name:'猪肉(瘦)',gram:40},{name:'蒜',gram:10},{name:'干辣椒',gram:8}],steps:['花菜掰小朵焯 1 分钟。','干锅煸肉片出油。','下蒜末干辣椒豆瓣酱炒香。','下花菜大火翻炒，孜然生抽调味。']}
    ,
    {name:'蒜蓉西兰花',icon:'🥦',time:8,servingG:250,season:'蒜蓉、蚝油、盐、食用油',ingrs:[{name:'西兰花',gram:300},{name:'蒜',gram:10}],steps:['西兰花切小朵盐水泡 10 分钟。','开水焯 1 分钟捞出。','热油爆香蒜蓉。','下西兰花快炒，蚝油盐调味。']}
    ,
    {name:'凉拌黄瓜',icon:'🥒',time:6,servingG:200,season:'蒜末、生抽、醋、香油、辣椒油',ingrs:[{name:'黄瓜',gram:300},{name:'蒜',gram:8}],steps:['黄瓜拍裂切段。','加蒜末。','生抽醋香油辣椒油调汁淋上。','拌匀冷藏 10 分钟更入味。']}
    ,
    {name:'红烧豆腐',icon:'🧈',time:15,servingG:280,season:'生抽、老抽、糖、蚝油、蒜末',ingrs:[{name:'豆腐',gram:300},{name:'猪肉(瘦)',gram:40},{name:'蒜',gram:8},{name:'葱',gram:5}],steps:['豆腐切块煎至两面金黄。','炒香肉末蒜末。','加生抽老抽糖蚝油和半碗水。','下豆腐烧 5 分钟收汁。']}
    ,
    {name:'咖喱鸡',icon:'🍛',time:30,servingG:350,season:'咖喱块、洋葱、胡萝卜、土豆、椰浆',ingrs:[{name:'鸡肉',gram:200},{name:'土豆',gram:150},{name:'胡萝卜',gram:80},{name:'洋葱',gram:60}],steps:['鸡块炒至变色。','下洋葱土豆胡萝卜翻炒。','加水没过煮 15 分钟。','关小火放咖喱块搅化，加椰浆再煮 5 分钟。']}
    ,
    {name:'冬瓜排骨汤',icon:'🍲',time:60,servingG:400,season:'盐、姜、葱、料酒',ingrs:[{name:'冬瓜',gram:300},{name:'猪大排（带骨）',gram:250},{name:'姜',gram:8}],steps:['排骨焯水洗净。','加姜葱足水炖 40 分钟。','下冬瓜块再煮 15 分钟。','盐调味。']}
    ,
    {name:'韭菜炒鸡蛋',icon:'🥚',time:8,servingG:250,season:'盐、食用油',ingrs:[{name:'鸡蛋',gram:110},{name:'韭菜',gram:150},{name:'葱',gram:5}],steps:['韭菜切段，鸡蛋打散。','热油炒蛋半凝固盛出。','余油大火炒韭菜 30 秒。','回鸡蛋加盐炒匀。']}
    ,
    {name:'蒜苔炒肉',icon:'🥬',time:12,servingG:280,season:'生抽、蚝油、蒜、盐',ingrs:[{name:'蒜苔',gram:250},{name:'猪肉(瘦)',gram:100},{name:'蒜',gram:8}],steps:['蒜苔切段，肉切丝。','肉丝滑炒至变色盛出。','下蒜苔大火翻炒 2 分钟。','回肉丝，蒜末生抽蚝油调味。']}
    ,
    {name:'红烧鸡翅',icon:'🍗',time:25,servingG:400,season:'可乐/生抽、老抽、姜、料酒',ingrs:[{name:'鸡翅',gram:500},{name:'姜',gram:10},{name:'葱',gram:8}],steps:['鸡翅划刀焯水。','煎至两面金黄。','加生抽老抽料酒姜和热水。','小火焖 20 分钟大火收汁。']}
    ,
    {name:'铁板牛肉',icon:'🥩',time:15,servingG:280,season:'黑胡椒、蚝油、洋葱、淀粉、黄油',ingrs:[{name:'牛肉(瘦)',gram:250},{name:'洋葱',gram:80},{name:'青椒',gram:40}],steps:['牛肉切片拍松，用生抽淀粉腌。','大火快煎 1 分钟盛出。','炒洋葱青椒。','回牛肉，蚝油黑胡椒汁收浓。']}
    ,
    {name:'干锅虾',icon:'🦐',time:15,servingG:280,season:'蒜、干辣椒、花椒、生抽、蚝油',ingrs:[{name:'虾',gram:350},{name:'蒜',gram:12},{name:'干辣椒',gram:8}],steps:['虾开背去线。','热油煎虾至壳酥盛出。','爆香蒜末干辣椒。','回虾加生抽蚝油大火翻匀。']}
    ,
    {name:'西葫芦炒蛋',icon:'🥚',time:8,servingG:250,season:'盐、蒜末、食用油',ingrs:[{name:'西葫芦',gram:300},{name:'鸡蛋',gram:110},{name:'蒜',gram:6}],steps:['西葫芦切片，蛋打散。','炒蛋盛出。','蒜末爆香炒西葫芦 2 分钟。','回蛋加盐炒匀。']}
    ,
    {name:'肉末茄子',icon:'🍆',time:15,servingG:280,season:'豆瓣酱、生抽、糖、蒜末、葱花',ingrs:[{name:'茄子',gram:350},{name:'猪肉(瘦)',gram:50},{name:'蒜',gram:10}],steps:['茄子切条腌 10 分钟挤水。','煎软盛出。','炒香肉末豆瓣酱蒜末。','回茄子加生抽糖烧入味撒葱花。']}
    ,
    {name:'清炒西兰花',icon:'🥦',time:6,servingG:200,season:'蒜蓉、蚝油、盐',ingrs:[{name:'西兰花',gram:300},{name:'蒜',gram:8}],steps:['西兰花焯水 1 分钟。','热油爆蒜蓉。','下西兰花快速翻炒。','蚝油盐调味出锅。']}
    ,
    {name:'凉拌木耳',icon:'🍄',time:6,servingG:150,season:'生抽、醋、香油、蒜末',ingrs:[{name:'木耳',gram:120},{name:'黄瓜',gram:30},{name:'蒜',gram:5}],steps:['木耳泡发焯水 2 分钟过凉。','加黄瓜片蒜末。','生抽醋香油调汁淋上。','拌匀。']}
    ,
    {name:'皮蛋豆腐',icon:'🥚',time:5,servingG:250,season:'生抽、香油、葱花、辣椒油',ingrs:[{name:'内酯豆腐',gram:250},{name:'皮蛋',gram:60},{name:'葱',gram:8}],steps:['豆腐切块摆盘。','皮蛋切瓣码上。','淋生抽香油。','撒葱花辣椒油。']}
    ,
    {name:'蚝油生菜',icon:'🥬',time:5,servingG:200,season:'蚝油、蒜末、食用油',ingrs:[{name:'生菜',gram:350},{name:'蒜',gram:10}],steps:['生菜焯水 10 秒摆盘。','蒜末爆香。','加蚝油和两勺水烧开。','淋在生菜上。']}
    ,
    {name:'排骨汤',icon:'🍲',time:90,servingG:400,season:'盐、姜、葱、料酒',ingrs:[{name:'猪大排（带骨）',gram:300},{name:'玉米棒',gram:100},{name:'胡萝卜',gram:80},{name:'姜',gram:8}],steps:['排骨焯水。','加姜足水大火烧开转小火。','炖 60 分钟后下玉米胡萝卜。','再炖 20 分钟盐调味。']}
    ,
    {name:'鸡汤',icon:'🍲',time:120,servingG:400,season:'盐、姜、枸杞、红枣',ingrs:[{name:'鸡肉',gram:400},{name:'姜',gram:10},{name:'红枣',gram:20}],steps:['鸡块焯水。','加姜片足水大火烧开。','小火炖 1.5 小时。','加盐、红枣枸杞再炖 10 分钟。']}
    ,
    {name:'鱼头豆腐汤',icon:'🍲',time:40,servingG:400,season:'盐、白胡椒粉、姜、香菜、豆腐',ingrs:[{name:'鱼头',gram:300},{name:'豆腐',gram:200},{name:'姜',gram:8}],steps:['鱼头煎至两面微黄。','加姜和热水大火煮 10 分钟至奶白。','下豆腐煮 5 分钟。','盐白胡椒粉调味撒香菜。']}
    ,
    {name:'葱烧海参',icon:'🥘',time:15,servingG:200,season:'葱、姜、蚝油、高汤、淀粉',ingrs:[{name:'海参',gram:100},{name:'大葱',gram:80},{name:'姜',gram:8}],steps:['海参提前泡发处理。','葱段煎香。','加蚝油高汤和海参烧 10 分钟。','淀粉勾薄芡。']}
    ,
    {name:'蒜蓉粉丝蒸虾',icon:'🦐',time:12,servingG:250,season:'蒸鱼豉油、粉丝、蒜蓉、葱花',ingrs:[{name:'虾',gram:250},{name:'粉丝',gram:40},{name:'蒜',gram:15},{name:'葱',gram:5}],steps:['粉丝泡软垫盘。','虾开背码上。','蒜蓉炒香铺虾面。','水开蒸 5 分钟，淋豉油撒葱花。']}
    ,
    {name:'白菜炒猪肉',icon:'🥬',time:12,servingG:280,season:'生抽、盐、姜、蒜',ingrs:[{name:'猪肉(瘦)',gram:150},{name:'白菜',gram:300},{name:'姜',gram:5}],steps:['肉片用生抽淀粉抓匀。','热油滑炒肉片盛出。','下白菜帮先炒再下叶。','回肉片加盐炒匀。']}
    ,
    {name:'炸鸡腿',icon:'🍗',time:25,servingG:300,season:'生抽、五香粉、蒜、淀粉、面包糠',ingrs:[{name:'鸡腿',gram:400},{name:'鸡蛋',gram:55},{name:'面粉',gram:60},{name:'蒜',gram:10}],steps:['鸡腿用生抽蒜五香粉腌 1 小时。','裹蛋液面粉拍面包糠。','六成油温炸 12 分钟。','复炸 1 分钟更脆。']}
    ,
    {name:'糖醋里脊',icon:'🍖',time:25,servingG:250,season:'番茄酱、糖、醋、淀粉、鸡蛋',ingrs:[{name:'猪肉(瘦)',gram:250},{name:'鸡蛋',gram:55},{name:'面粉',gram:50},{name:'白砂糖',gram:15}],steps:['里脊切条腌后裹蛋液淀粉。','炸至定型复炸酥脆。','糖醋汁炒浓。','倒肉条裹匀。']}
    ,
    {name:'干烧鱼',icon:'🐟',time:20,servingG:300,season:'豆瓣酱、姜蒜、酱油、糖、辣椒',ingrs:[{name:'鱼',gram:400},{name:'姜',gram:8},{name:'蒜',gram:8}],steps:['鱼两面煎黄。','炒香豆瓣酱姜蒜。','加酱油糖和一碗水。','下鱼烧 8 分钟翻面收汁。']}
    ,
    {name:'梅菜扣肉',icon:'🥩',time:90,servingG:300,season:'生抽、老抽、料酒、糖、八角',ingrs:[{name:'猪肉',gram:400},{name:'梅菜',gram:60},{name:'姜',gram:8}],steps:['五花肉煮 20 分钟，抹老抽炸皮。','泡软切厚片码碗底。','铺炒香的梅菜，淋料汁。','蒸 60 分钟扣出。']}
    ,
    {name:'东坡肉',icon:'🥩',time:120,servingG:350,season:'生抽、老抽、冰糖、料酒、姜葱',ingrs:[{name:'猪肉',gram:500},{name:'姜',gram:10},{name:'葱',gram:10}],steps:['五花肉切块焯水。','炒糖色下肉块裹匀。','加生抽老抽料酒姜葱热水。','小火慢炖 90 分钟收汁。']}
    ,
    {name:'北京烤鸭',icon:'🦆',time:60,servingG:250,season:'甜面酱、荷叶饼、黄瓜丝、葱丝',ingrs:[{name:'鸭肉',gram:300},{name:'黄瓜',gram:30},{name:'葱',gram:10}],steps:['鸭肉腌制后刷蜂蜜水。','烤箱 200℃ 烤 40 分钟。','片鸭肉配黄瓜葱丝。','卷荷叶饼蘸甜面酱。']}
    ,
    {name:'担担面（不喝汤）',icon:'🍜',time:12,servingG:300,season:'辣椒油、花椒面、碎米芽菜、花生碎、葱花',ingrs:[{name:'面条（去汤汁）',gram:250},{name:'豆芽',gram:40},{name:'花生米',gram:10},{name:'葱',gram:8}],steps:['面条煮好沥水。','碗调辣椒油花椒面生抽醋。','码芽菜肉臊花生碎。','拌匀撒葱花。']}
  ,
    {name:'重庆小面（不喝汤）',icon:'🍜',time:12,servingG:300,season:'辣椒油、花椒面、芽菜肉臊、花生碎、葱花',ingrs:[{name:'面条（去汤汁）',gram:250},{name:'豆芽',gram:40},{name:'花生米',gram:10},{name:'葱',gram:8}],steps:['面煮好。','碗底调辣椒油花椒面生抽。','加一勺肉臊和面汤。','捞面码花生葱花拌匀。']}
    ,
    {name:'过桥米线（不喝汤）',icon:'🍜',time:20,servingG:400,season:'鸡汤/骨头汤、盐、韭菜、辣椒油',ingrs:[{name:'米粉',gram:200},{name:'鸡肉',gram:80},{name:'韭菜',gram:30},{name:'葱',gram:8}],steps:['老汤煮开保持滚沸。','米线烫 15 秒捞入大碗。','码鸡肉片烫韭菜。','浇滚汤撒葱花，可加辣椒油。']}
    ,
    {name:'刀削面（不喝汤）',icon:'🍜',time:15,servingG:350,season:'油泼辣子、蒜末、生抽、醋、青菜',ingrs:[{name:'面粉',gram:200},{name:'豆芽',gram:40},{name:'青菜',gram:40},{name:'蒜',gram:8}],steps:['面粉揉硬面团醒 30 分钟。','削成柳叶面片下锅煮 3 分钟。','碗放生抽醋蒜末和烫青菜。','加辣子浇热油激香。']}
    ,
    {name:'烩面（不喝汤）',icon:'🍜',time:15,servingG:350,season:'羊肉汤、粉丝、香菜、辣椒油',ingrs:[{name:'面条（去汤汁）',gram:250},{name:'羊肉',gram:60},{name:'木耳',gram:20},{name:'香菜',gram:5}],steps:['宽面扯好煮熟。','碗放生抽盐和羊汤。','捞面加羊肉木耳。','撒香菜辣椒油。']}
    ,
    {name:'胡辣汤',icon:'🍲',time:40,servingG:350,season:'胡椒粉、盐、淀粉、木耳、黄花菜、面筋、花生米',ingrs:[{name:'猪肉(瘦)',gram:50},{name:'木耳',gram:20},{name:'花生米',gram:10},{name:'海带',gram:30}],steps:['肉丝炒香，加高汤和配菜煮开。','加大量白胡椒粉和盐。','淀粉勾芡至浓稠。','撒花生米。']}
    ,
    {name:'炒肝',icon:'🍲',time:30,servingG:250,season:'盐、生抽、淀粉、蒜、姜、肥肠/肝',ingrs:[{name:'猪肝',gram:100},{name:'猪肉(瘦)',gram:50},{name:'木耳',gram:20},{name:'姜',gram:8}],steps:['猪肝切片泡水去腥。','炒香蒜姜，下肝片快炒。','加生抽高汤煮开。','淀粉勾浓芡。']}
    ,
    {name:'羊蝎子',icon:'🍖',time:120,servingG:500,season:'盐、花椒、八角、姜、葱、白萝卜',ingrs:[{name:'羊肉',gram:400},{name:'白萝卜',gram:200},{name:'姜',gram:10}],steps:['羊蝎子泡水去血，焯水。','加花椒八角姜足水炖 90 分钟。','下萝卜再炖 20 分钟。','盐调味。']}
    ,
    {name:'烤冷面（不喝汤）',icon:'🍜',time:8,servingG:250,season:'冷面酱/甜辣酱、鸡蛋、香菜',ingrs:[{name:'面条（去汤汁）',gram:150},{name:'鸡蛋',gram:55},{name:'香肠',gram:30},{name:'葱',gram:8}],steps:['冷面片煎软。','磕鸡蛋抹开。','刷酱放肠和葱卷起。','切段。']}
    ,
    {name:'手抓饼',icon:'🥞',time:15,servingG:200,season:'甜辣酱/沙拉酱、生菜、鸡蛋',ingrs:[{name:'面粉',gram:100},{name:'鸡蛋',gram:55},{name:'生菜',gram:30}],steps:['面糊摊圆煎定型。','翻面磕蛋抹匀烙熟。','刷酱铺生菜。','卷起趁热吃。']}
    ,
    {name:'葱油拌面（不喝汤）',icon:'🍜',time:8,servingG:300,season:'生抽、老抽、猪油、葱花',ingrs:[{name:'面条（去汤汁）',gram:250},{name:'葱',gram:20}],steps:['小葱切段，小火炸至焦黄。','面煮好拌入葱油和生抽老抽。','加一勺面汤。','撒焦葱。']}
    ,
    {name:'阳春面（不喝汤）',icon:'🍜',time:8,servingG:300,season:'盐、猪油、葱花',ingrs:[{name:'面条（去汤汁）',gram:250},{name:'葱',gram:8}],steps:['面煮好。','碗放盐和猪油冲面汤。','捞面。','撒葱花。']}
    ,
    {name:'云吞面（不喝汤）',icon:'🍜',time:15,servingG:350,season:'盐、生抽、香油、虾皮、紫菜',ingrs:[{name:'面条（去汤汁）',gram:200},{name:'猪肉(瘦)',gram:80},{name:'虾皮',gram:5},{name:'葱',gram:8}],steps:['肉馅调味包小馄饨。','水开煮馄饨至浮起。','碗放紫菜虾皮生抽香油。','连汤倒入，撒葱花。']}
    ,
    {name:'盐焗鸡',icon:'🍗',time:40,servingG:250,season:'盐焗鸡粉、姜、葱、沙姜',ingrs:[{name:'鸡腿',gram:400},{name:'姜',gram:10},{name:'葱',gram:10}],steps:['鸡腿用盐焗鸡粉内外抹匀腌 1 小时。','铺姜葱，水开中火蒸 25 分钟。','取出刷香油晾凉。','斩块。']}
    ,
    {name:'啤酒鸭',icon:'🦆',time:40,servingG:350,season:'啤酒 1罐、生抽、老抽、糖、姜蒜',ingrs:[{name:'鸭肉',gram:500},{name:'啤酒',gram:330},{name:'姜',gram:10},{name:'蒜',gram:8}],steps:['鸭块焯水。','煸炒至出油微黄。','加姜蒜生抽老抽糖和整罐啤酒。','中小火焖 30 分钟收汁。']}
    ,
    {name:'老鸭汤',icon:'🍲',time:120,servingG:400,season:'盐、姜、白胡椒粉、枸杞',ingrs:[{name:'鸭肉',gram:500},{name:'冬瓜',gram:250},{name:'姜',gram:10}],steps:['老鸭焯水洗净。','加姜足水小火炖 90 分钟。','下冬瓜再炖 20 分钟。','盐和枸杞调味。']}
    ,
    {name:'干锅鸡',icon:'🍗',time:20,servingG:280,season:'豆瓣酱、干辣椒、花椒、生抽、洋葱、青椒',ingrs:[{name:'鸡肉',gram:350},{name:'洋葱',gram:80},{name:'青椒',gram:60},{name:'干辣椒',gram:10}],steps:['鸡块煸炒至金黄。','下豆瓣酱干辣椒花椒炒香。','加洋葱青椒翻炒。','生抽调味收干。']}
    ,
    {name:'莲藕排骨汤',icon:'🍲',time:90,servingG:450,season:'盐、姜、葱',ingrs:[{name:'猪大排（带骨）',gram:250},{name:'莲藕',gram:300},{name:'姜',gram:8}],steps:['排骨焯水。','加姜大火煮开转小火 60 分钟。','下莲藕块再炖 25 分钟。','盐调味。']}
    ,
    {name:'鲫鱼豆腐汤',icon:'🍲',time:35,servingG:400,season:'盐、白胡椒粉、姜、香菜',ingrs:[{name:'鲫鱼',gram:250},{name:'豆腐',gram:250},{name:'姜',gram:8}],steps:['鲫鱼煎至两面金黄。','加姜和热水大火煮至奶白。','下豆腐煮 8 分钟。','盐白胡椒调味。']}
    ,
    {name:'丝瓜蛋汤',icon:'🍲',time:12,servingG:350,season:'盐、香油、丝瓜',ingrs:[{name:'丝瓜',gram:250},{name:'鸡蛋',gram:110},{name:'姜',gram:5}],steps:['丝瓜切滚刀块。','水开下丝瓜煮 3 分钟。','淋入蛋液成蛋花。','盐调味滴香油。']}
    ,
    {name:'卤肉饭',icon:'🍚',time:90,servingG:400,season:'生抽、老抽、糖、五香粉、洋葱、鸡蛋',ingrs:[{name:'猪肉(瘦)',gram:250},{name:'米饭',gram:300},{name:'鸡蛋',gram:55},{name:'洋葱',gram:80}],steps:['肉块焯水加料卤 60 分钟。','米饭装碗。','切卤蛋和卤肉铺上。','浇一勺卤汁。']}
    ,
    {name:'红烧牛肉',icon:'🥩',time:120,servingG:400,season:'生抽、老抽、料酒、糖、八角、姜、葱',ingrs:[{name:'牛肉(瘦)',gram:400},{name:'胡萝卜',gram:150},{name:'姜',gram:10}],steps:['牛肉切块焯水。','炒糖色下牛肉。','加香料生抽老抽料酒热水。','小火炖 90 分钟，下胡萝卜再炖 20 分钟。']}
    ,
    {name:'干锅肥肠',icon:'🍲',time:25,servingG:280,season:'干锅酱、蒜、干辣椒、青椒',ingrs:[{name:'猪肠',gram:300},{name:'青椒',gram:60},{name:'蒜',gram:10},{name:'干辣椒',gram:8}],steps:['肥肠处理干净焯水。','煸炒出油。','下干锅酱蒜干辣椒炒香。','加青椒翻炒。']}
    ,
    {name:'铁板鱿鱼',icon:'🦑',time:12,servingG:280,season:'孜然、辣椒面、洋葱、生抽',ingrs:[{name:'鱿鱼',gram:350},{name:'洋葱',gram:80},{name:'青椒',gram:40}],steps:['鱿鱼切圈焯 10 秒。','铁板/大火煎至卷曲。','下洋葱炒软。','加孜然辣椒面生抽炒匀。']}
    ,
    {name:'孜然牛肉',icon:'🥩',time:12,servingG:280,season:'孜然、辣椒面、洋葱、白芝麻',ingrs:[{name:'牛肉(瘦)',gram:250},{name:'洋葱',gram:80}],steps:['牛肉切薄片大火快炒 1 分钟。','下洋葱丝炒软。','撒孜然辣椒面。','白芝麻翻匀。']}
    ,
    {name:'蚝油牛肉',icon:'🥩',time:12,servingG:280,season:'蚝油、蒜、洋葱、黑胡椒',ingrs:[{name:'牛肉(瘦)',gram:250},{name:'洋葱',gram:80},{name:'蒜',gram:8}],steps:['牛肉切片腌 10 分钟。','大火快炒盛出。','爆蒜洋葱。','回牛肉加蚝油黑胡椒翻匀。']}
    ,
    {name:'西芹百合',icon:'🥬',time:10,servingG:200,season:'盐、蒜末、百合',ingrs:[{name:'西芹',gram:200},{name:'百合',gram:80},{name:'蒜',gram:6}],steps:['西芹切段，百合掰瓣。','焯水 30 秒。','蒜末爆香。','下西芹百合快炒盐调味。']}
    ,
    {name:'松仁玉米',icon:'🌽',time:12,servingG:200,season:'盐、糖、松仁',ingrs:[{name:'玉米粒',gram:300},{name:'松仁',gram:30}],steps:['玉米粒焯水沥干。','松仁小火烘香。','少油炒玉米粒。','加盐糖回松仁。']}
    ,
    {name:'虎皮青椒',icon:'🫑',time:10,servingG:200,season:'生抽、醋、蒜末、白糖',ingrs:[{name:'青椒',gram:300},{name:'蒜',gram:8}],steps:['青椒整只干煸至虎皮。','压扁加蒜末。','生抽醋糖调碗汁倒入。','烧 1 分钟入味。']}
    ,
    {name:'拔丝地瓜',icon:'🍠',time:20,servingG:250,season:'白糖、油、地瓜',ingrs:[{name:'红薯',gram:300},{name:'白砂糖',gram:60}],steps:['红薯切滚刀块炸熟。','糖加水小火熬至琥珀色。','倒红薯快速翻裹。','出锅拉丝，蘸凉水吃。']}
    ,
    {name:'小鸡炖蘑菇',icon:'🍲',time:60,servingG:350,season:'生抽、老抽、蚝油、姜、葱、粉条',ingrs:[{name:'鸡肉',gram:300},{name:'蘑菇',gram:150},{name:'粉条',gram:60},{name:'姜',gram:8}],steps:['鸡块焯水炒香。','下蘑菇和生抽老抽蚝油。','加水炖 30 分钟。','下泡软的粉条再炖 10 分钟收汁。']}
    ,
    {name:'猪肉炖粉条',icon:'🍲',time:60,servingG:400,season:'生抽、老抽、花椒、八角、葱姜、粉条',ingrs:[{name:'猪肉(瘦)',gram:200},{name:'粉条',gram:80},{name:'白菜',gram:300},{name:'姜',gram:8}],steps:['肉片煸炒出油。','加香料生抽老抽上色。','加水炖 20 分钟。','下白菜粉条再炖 20 分钟。']}
    ,
    {name:'酸菜白肉',icon:'🍲',time:60,servingG:350,season:'盐、花椒、姜、酸白菜',ingrs:[{name:'猪肉(瘦)',gram:200},{name:'酸白菜',gram:300},{name:'姜',gram:8}],steps:['五花肉煮 20 分钟切薄片。','酸菜丝炒香。','加热水与肉片炖 30 分钟。','盐调味。']}
    ,
    {name:'溜肉段',icon:'🥩',time:20,servingG:250,season:'淀粉、生抽、葱姜蒜、糖醋汁',ingrs:[{name:'猪肉(瘦)',gram:250},{name:'青椒',gram:40},{name:'蒜',gram:8}],steps:['肉切段裹淀粉糊。','炸定型复炸酥脆。','爆香葱蒜。','糖醋汁勾芡倒肉段翻裹。']}
    ,
    {name:'干炸丸子',icon:'🍖',time:30,servingG:300,season:'生抽、五香粉、鸡蛋、葱姜、淀粉',ingrs:[{name:'猪肉(瘦)',gram:250},{name:'鸡蛋',gram:55},{name:'姜',gram:8},{name:'葱',gram:8}],steps:['肉馅调味搅打上劲。','挤成丸子炸定型。','复炸至金黄。','可配椒盐。']}
    ,
    {name:'京酱肉丝',icon:'🥩',time:15,servingG:250,season:'甜面酱、豆皮、黄瓜丝、葱丝',ingrs:[{name:'猪肉(瘦)',gram:250},{name:'豆腐皮',gram:30},{name:'黄瓜',gram:30},{name:'葱',gram:10}],steps:['肉丝滑炒。','甜面酱炒香下肉丝裹匀。','豆皮切方。','卷肉丝配黄瓜葱丝。']}
    ,
    {name:'香菇油菜',icon:'🥬',time:8,servingG:200,season:'蒜末、蚝油、盐',ingrs:[{name:'油菜',gram:300},{name:'香菇',gram:60},{name:'蒜',gram:8}],steps:['香菇切片，油菜洗净。','蒜末爆香下香菇炒香。','下油菜大火快炒。','蚝油盐调味。']}
    ,
    {name:'蒜蓉蒸扇贝',icon:'🦪',time:15,servingG:200,season:'蒜蓉、粉丝、蒸鱼豉油、葱花',ingrs:[{name:'扇贝',gram:200},{name:'粉丝',gram:30},{name:'蒜',gram:15}],steps:['扇贝刷净，粉丝泡软。','蒜蓉炒香铺扇贝上。','粉丝垫底。','水开蒸 6 分钟淋豉油。']}
    ,
    {name:'粉蒸肉',icon:'🥩',time:90,servingG:250,season:'米粉、生抽、老抽、腐乳汁、姜、八角',ingrs:[{name:'猪肉',gram:300},{name:'米饭',gram:200},{name:'姜',gram:8}],steps:['五花切厚片拌米粉和调料。','芋头/红薯垫底。','蒸 60 分钟至酥烂。','撒葱花。']}
    ,
    {name:'腊味煲仔饭',icon:'🍚',time:25,servingG:400,season:'腊肠/腊肉、青菜、生抽、豉油',ingrs:[{name:'米饭',gram:300},{name:'香肠',gram:60},{name:'青菜',gram:60},{name:'鸡蛋',gram:55}],steps:['米洗净加适量水煮至收水。','铺腊肠腊肉。','小火焗 10 分钟。','窝蛋烫青菜淋豉油。']}
    ,
    {name:'白灼虾',icon:'🦐',time:5,servingG:200,season:'生抽、姜末、醋、蒜蓉',ingrs:[{name:'虾',gram:350},{name:'姜',gram:10},{name:'蒜',gram:10}],steps:['虾剪须去线。','水开下虾煮至变色再 1 分钟。','捞出摆盘。','姜蒜蓉加生抽醋做蘸汁。']}
    ,
    {name:'豉汁排骨',icon:'🍖',time:60,servingG:300,season:'豉汁、蒜末、生抽、糖、豆豉',ingrs:[{name:'猪大排（带骨）',gram:350},{name:'豆豉',gram:10},{name:'蒜',gram:10}],steps:['排骨泡水去血。','豆豉蒜末炒香加生抽糖拌排骨。','腌 20 分钟。','水开蒸 25 分钟。']}
    ,
    {name:'芋头扣肉',icon:'🥩',time:90,servingG:350,season:'生抽、腐乳、糖、芋头',ingrs:[{name:'猪肉',gram:300},{name:'芋头',gram:200},{name:'姜',gram:8}],steps:['五花煮后切片。','芋头切厚片。','肉片芋头相间码碗，淋料汁。','蒸 70 分钟扣盘。']}
    ,
    {name:'凉拌内酯豆腐',icon:'🥗',time:5,servingG:200,season:'生抽、香油、葱花、榨菜末',ingrs:[{name:'内酯豆腐',gram:300},{name:'葱',gram:8},{name:'榨菜',gram:15}],steps:['豆腐整盒扣入盘中。','淋生抽香油。','撒葱花榨菜末。','拌开吃。']}
    ,
    {name:'炸鸡叉骨（带骨）',icon:'🦴',time:30,servingG:300,season:'生抽、五香粉、蒜、淀粉、面包糠',ingrs:[{name:'鸡叉骨',gram:350},{name:'鸡蛋',gram:55},{name:'面粉',gram:60},{name:'蒜',gram:10}],steps:['鸡叉骨腌 1 小时。','裹蛋液拍干粉。','六成油温炸 10 分钟。','复炸 1 分钟。']}
    ,
    {name:'炸鸡排',icon:'🍗',time:25,servingG:280,season:'生抽、五香粉、蒜、淀粉',ingrs:[{name:'鸡胸肉',gram:300},{name:'鸡蛋',gram:55},{name:'面粉',gram:60},{name:'蒜',gram:10}],steps:['鸡胸片开拍松腌 20 分钟。','裹蛋液拍粉。','六成油温炸 4 分钟。','复炸至金黄。']}
  ];

  function byName(n){var hit=null;((typeof FOOD_DB!=='undefined'?FOOD_DB:[])||[]).forEach(function(f){if(f.name===n)hit=f});return hit}
  function catOf(p,c,fi){p=+p||0;c=+c||0;fi=+fi||0;if(p+c+fi<=0)return '';if(p>=c&&p>=fi)return '高蛋白';if(fi>=p&&fi>=c)return '高纤维';return '高碳水'}
  /* 配料只用于做法展示；整份营养取 FOOD_DB 同名菜肴权威每100g × 整份估重 */
  var out=[];
  RAW.forEach(function(r,idx){
    var dish=byName(r.name);
    if(!dish)console.warn('[recipes.js] 未找到同名菜肴(营养按0):',r.name);
    var per={cal:dish?(dish.cal||0):0,p:dish?(dish.p||0):0,c:dish?(dish.c||0):0,f:dish?(dish.f||0):0,fi:dish?(dish.fi||0):0,va:dish?(dish.va||0):0,vc:dish?(dish.vc||0):0};
    var ingrs=(r.ingrs||[]).map(function(x){
      var db=byName(x.name);
      return{name:x.name,icon:(db&&db.icon)||'🍽️',gram:x.gram};
    });
    var totG=ingrs.reduce(function(s,x){return s+x.gram},0)||1;
    var servingG=r.servingG||totG;
    var k=servingG/100;
    var rec={id:'b'+(idx+1),builtin:true,name:r.name,icon:r.icon||'🍳',img:null,time:r.time||10,season:r.season||'',ingrs:ingrs,steps:(r.steps||[]).slice(),servingG:servingG,
      cal:Math.round(per.cal*k),p:+(per.p*k).toFixed(1),c:+(per.c*k).toFixed(1),f:+(per.f*k).toFixed(1),fi:+(per.fi*k).toFixed(1),va:Math.round(per.va*k),vc:+(per.vc*k).toFixed(1),
      cat:catOf(per.p*k,per.c*k,per.fi*k),createdAt:0,_per:per};
    out.push(rec);
  });
  window.BUILTIN_RECIPES=out;
  console.log('[recipes.js] 内置菜谱加载',out.length,'道');
})();
