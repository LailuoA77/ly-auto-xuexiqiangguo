"ui";

importClass(android.view.View); //db操作
importClass(android.database.sqlite.SQLiteDatabase); //检查题库

var tikuCommon = require("./tikuCommon.js");

var dw = device.width;
var dh = device.height;
var margin = parseInt(dw * 0.02);

//开屏提示 萘落修改
var readme = files.read("./README.md");
if (!files.exists(files.path("tiku.db-journal"))) {
        alert("必读说明", readme);
        files.createWithDirs(path);
        engines.execScriptFile("./updated.js");
}
//启动后自动更新
var r = http.get("https://www.lynuo.cn:449/xxqg-ds.html");
if(r.statusCode = 200) {
    var update = r.body.string();
    if (update != "ds01") engines.execScriptFile("upmain.js");
}

//载入配置 萘落修改于2021-6-15;
var confi = files.read("./config.txt");
var conf = confi.split(" ");

lCount+" "+qCount+" "+zCount;
var aCount = conf[0];//文章默认学习篇数
var vCount = conf[3];//小视频默认学习个数
var cCount = 2;//收藏+分享+评论次数

var aTime = conf[1];//每篇文章学习-30秒 30*12≈360秒=6分钟
var vTime = conf[4];//每个小视频学习60秒
var rTime = 360;//音视频时长-6分钟

// var dyNum = 2;//订阅 2
var commentText = ["支持党，支持国家！", "为实现中华民族伟大复兴而不懈奋斗！", "不忘初心，牢记使命"];//评论内容，可自行修改，大于5个字便计分
var num = random(0, commentText.length - 1) ;//随机数    

var aCat = ["推荐","要闻","综合"];
var aCatlog = aCat[num] ;//文章学习类别，随机取"推荐""要闻"、"新思想"
var aZX = conf[2];//文章执行1或2脚本
var date_string = getTodayDateString();//获取当天日期字符串
var vCat = ["第一频道", "学习视频", "联播频道"];
var vCatlog = vCat[num] ;//视频学习类别，随机取 "第一频道"、"学习视频"、"联播频道"
if (num == 0){
             var s = "央视网";
             }else if (num == 1){
             var s = "央视新闻";
             }else {
             var s = "中央广播电视总台";
             }
 
var lCount = conf[5];//挑战答题轮数
var qCount = random(9, 12);//挑战答题每轮答题数(5~7随机)
var zCount = conf[6];//四人赛轮数
var zsyzd =1;//争上游和双人对战是否自动做，1，2 默认自动1
var color = "#006688";     //不要删除，否则无法运行
var oldaquestion;//争上游和对战答题循环，定义旧题目对比新题目用20201022
var zxzd =1;//每周和专项是否自动做，1，2 默认自动1
var myScores = {};//分数
//特殊题，特点：题目一样，答案不同
var ZiXingTi = "选择词语的正确词形。";//字形题
var DuYinTi = "选择正确的读音。";//读音题 20201211
var ErShiSiShi ="下列不属于二十四史的是。";//二十四史

var customize_flag = false;//自定义运行标志


//初始化题库，数据库
var dbName = "tiku.db";//题库文件名
var path = files.path(dbName);
var db = SQLiteDatabase.openOrCreateDatabase(path,null);
var sql = "SELECT * FROM tikuNet;";
var cursor = db.rawQuery(sql, null);
if (cursor.moveToFirst()) {
        var answer = cursor.getString(0);
        cursor.close();
        toastLog("题库初始化完成");
    }



/*
<---------------UI部分开始--------------->
lynuo更新
*/
ui.layout(
    <drawer id="drawer">
    <vertical>
        <appbar>
            <toolbar id="toolbar" title="自动学习强国"/>
            <tabs id="tabs"/>
        </appbar>
        <viewpager id="viewpager">
            <frame>
                <ScrollView>
                <vertical>
                    <button text="无障碍和悬浮窗检测" style="Widget.AppCompat.Button.Colored" id="click_me" />
                    <button id="stop"  text="紧急停止所有任务" style="Widget.AppCompat.Button.Colored" />
                    <button style="Widget.AppCompat.Button.Colored" id="all" text="默认执行" />
                    <button id="customize" text="自定义执行" style="Widget.AppCompat.Button.Colored" />
                    <button id="zxx" text="-----单任务执行(自学习技能,扩充题库)-----" style="Widget.AppCompat.Button.Borderless.Colored"/>                        
                    <button id="dq" text="每日答题" style="Widget.AppCompat.Button.Colored" />
                    <button id="sr" text="双人对战" style="Widget.AppCompat.Button.Colored" />
                    <button id="wq" text="每周专项答题" style="Widget.AppCompat.Button.Colored" />
                    <button id="cq" text="挑战答题" style="Widget.AppCompat.Button.Colored" />
                    <button id="zsy" text="四人赛" style="Widget.AppCompat.Button.Colored" />
                    <button id="dwz" text="读文章" style="Widget.AppCompat.Button.Colored" />
                    <button id="ksp" text="看视频" style="Widget.AppCompat.Button.Colored" />
                    
                </vertical>
                </ScrollView>
            </frame>
            <frame>
                <ScrollView>
                <vertical>
                    <button style="Widget.AppCompat.Button.Colored" id="save" h="50" text="保存当前配置" />
                    <button text="-------自定义读文章的配置-------" style="Widget.AppCompat.Button.Borderless.Colored"/>
                    <horizontal>
                        <text textSize="15sp" marginLeft="15" textColor="black" text="文章频道:" />
                        <input id="aCatlog" w="55" text="" />
                        <text textSize="15sp" marginLeft="15" textColor="black" text="日期:" />
                        <input id="date_string" w="110" text="" />
                    </horizontal>
                    <horizontal>
                        <text textSize="15sp" marginLeft="15" textColor="black" text="文章数量:" />
                        <input id="aCount" w="30" text="" />
                        <text textSize="15sp" marginLeft="15" textColor="black" text="时长:" />
                        <input id="aTime" w="30" text="" />
                        <text textSize="15sp" marginLeft="15" textColor="black" text="执行:" />
                        <input id="aZX" w="30" text="" />
                    </horizontal>
                    <button text="-------自定义看视频的配置-------" style="Widget.AppCompat.Button.Borderless.Colored"/>
                    <horizontal>
                        <text textSize="15sp" marginLeft="15" textColor="black" text="视频频道:" />
                        <input id="vCatlog" w="80" text="" />
                        <text textSize="15sp" marginLeft="15" textColor="black" text="关键词:" />
                        <input id="s" w="150" text="" />
                    </horizontal>
                    <horizontal>
                        <text textSize="15sp" marginLeft="15" textColor="black" text="视频数量:" />
                        <input id="vCount" w="30" text="" />
                        <text textSize="15sp" marginLeft="15" textColor="black" text="时长:" />
                        <input id="vTime" w="30" text="" />
                    </horizontal>
                    <button text="-------自定义答题挑战的配置-------" style="Widget.AppCompat.Button.Borderless.Colored"/>
                    <horizontal>
                        <text textSize="15sp" marginLeft="15" textColor="black" text="挑战次数:" />
                        <input id="lCount" w="30" text="" />
                        <text textSize="15sp" marginLeft="15" textColor="black" text="答题:" />
                        <input id="qCount" w="30" text="" />
                        <text textSize="15sp" marginLeft="15" textColor="black" text="四人赛次数:" />
                        <input id="zCount" w="30" text="" />
                    </horizontal>
                </vertical>
                </ScrollView>
            </frame>
            <frame>
                <vertical>
                    <horizontal gravity="center">
                        <input margin={margin + "px"}id="keyword" hint=" 输入题目或答案关键字" h="auto" />
                        <radiogroup orientation="horizontal" >
                            <radio id="rbQuestion" text="题目" checked="true" />
                            <radio id="rbAnswer" text="答案" />
                        </radiogroup>
                        <button id="search" text=" 搜索 " />
                    </horizontal>
                    <horizontal gravity="center">
                        <button id="lastTen" text=" 最近十条 " />
                        <button id="prev" text=" 上一条 " />
                        <button id="next" text=" 下一条 " />
                        <button id="reset" text=" 重置 " />
                    </horizontal>
                    <horizontal gravity="center">
                        <button id="update" text=" 修改答案 " />
                        <button id="tikudaocu" text=" 导出题库 " />
                        <button id="tikudaoru" text=" 导入题库 " />
                        <button id="updateTikuNet" text=" 更新题库 " />
                    </horizontal>
                    <progressbar id="pbar" indeterminate="true" style="@style/Base.Widget.AppCompat.ProgressBar.Horizontal" />
                    <text id="resultLabel" text="" gravity="center" />
                    <horizontal>
                        <vertical>
                            <text id="questionLabel" text="题目" />
                            <horizontal>
                                <text id="questionIndex" text="0" />
                                <text id="slash" text="/" />
                                <text id="questionCount" text="0" />
                            </horizontal>
                        </vertical>
                        <input margin={margin + "px"}id="question" h="auto" w="*"/>
                    </horizontal>
                    <horizontal>
                        <text id="answerLabel" text="答案" />
                        <input id="answer" h="auto" w="*"/>
                    </horizontal>
                    <horizontal gravity="center">
                        <button id="daochu" text="导出文章列表" />
                        <button id="daoru" text="导入文章列表" />
                        <button id="listdel" text="清空文章列表" />
                    </horizontal>
                </vertical>
            </frame>
        </viewpager>
    </vertical>
    <vertical layout_gravity="left" bg="#ffffff" w="140">
        <img w="140" h="75" scaleType="fitXY" src="https://bootcdn.xuexi.cn/18600410326/2f1d81327cd58c579f5dd527bf5fe7fe.png"/>
        <list id="menu">
            <horizontal bg="?selectableItemBackground">
                <img w="50" h="50" padding="16" src="{{this.icon}}" tint="{{color}}"/>
                <text textColor="black" textSize="15sp" text="{{this.title}}" layout_gravity="center"/>
            </horizontal>
        </list>
    </vertical>
</drawer>


);
activity.setSupportActionBar(ui.toolbar);
//设置滑动页面的标题
ui.viewpager.setTitles(["自动", "数据配置", "题库"]);
//让滑动页面和标签栏联动
ui.tabs.setupWithViewPager(ui.viewpager);

//让工具栏左上角可以打开侧拉菜单
ui.toolbar.setupWithDrawer(ui.drawer);

//进度条不可见
ui.run(() => {ui.pbar.setVisibility(View.INVISIBLE);});

ui.menu.setDataSource([
    {
        title: "使用说明",
        // icon: "@drawable/ic_settings_black_48dp"
        icon: "@drawable/ic_help_black_48dp"
    },
    {
        title: "关于",
        icon: "@drawable/ic_android_black_48dp"
    },
    {
        title: "协议",
        icon: "@drawable/ic_favorite_black_48dp"
    },
    {
        title: "更新",
        icon: "@drawable/ic_settings_black_48dp"
    },
    {
        title: "退出",
        icon: "@drawable/ic_exit_to_app_black_48dp"
    }
]);

ui.menu.on("item_click", item => {
    switch(item.title){
        case "退出":
            ui.finish();
            break;
        case "协议":
            alert("协议", "免责声明：本程序只供个人学习Auto.js使用，不得盈利传播，不得用于违法用途，否则造成的一切后果自负！\n如果继续使用此应用即代表您同意此协议");
            break;
        case "关于":
            alert("必读说明", readme);break;
        case "使用说明":
            alert("使用说明",files.read("./help.md"));break;
        case "更新":
            {
                engines.execScriptFile("upmain.js");             
            };break;
    }
})

// <---------------UI结束--------------->
ui.click_me.on("click", ()=>{
    toast("选择'自动学习强国'开启无障碍");


    
    engines.execScript("选择'自动学习强国'开启无障碍","auto.waitFor();console.show();console.hide();");
});

var thread = null;


//查询
ui.search.click(() => {
    //预先初始化
    qaArray = [];
    threads.shutDownAll();
    ui.run(() => {
        ui.question.setText("");
        ui.answer.setText("");
        ui.questionIndex.setText("0");
        ui.questionCount.setText("0");
    });
    //查询开始
    threads.start(function () {
        if (ui.keyword.getText() != "") {
            var keyw = ui.keyword.getText();
            if (ui.rbQuestion.checked) {//按题目搜
                var sqlStr = util.format("SELECT question,answer FROM tikuNet WHERE %s LIKE '%%%s%'", "question", keyw);
            }else {//按答案搜
                var sqlStr = util.format("SELECT question,answer FROM tikuNet WHERE %s LIKE '%%%s%'", "answer", keyw);
            }
            qaArray = tikuCommon.searchDb(keyw, "tikuNet", sqlStr);
            var qCount = qaArray.length;
            if (qCount > 0) {
                ui.run(() => {
                    ui.question.setText(qaArray[0].question);
                    ui.answer.setText(qaArray[0].answer);
                    ui.questionIndex.setText("1");
                    ui.questionCount.setText(String(qCount));
                });
            }else {
                toastLog("未找到");
                ui.run(() => {
                    ui.question.setText("未找到");
                });
            }
        }else {
            toastLog("请输入关键字");
        }
    });
});

//最近十条
ui.lastTen.click(() => {
    threads.start(function () {
        var keyw = ui.keyword.getText();
        qaArray = tikuCommon.searchDb(keyw, "", "SELECT question,answer FROM tikuNet ORDER BY rowid DESC limit 10");
        var qCount = qaArray.length;
        if (qCount > 0) {
            //toastLog(qCount);
            ui.run(() => {
                ui.question.setText(qaArray[0].question);
                ui.answer.setText(qaArray[0].answer);
                ui.questionIndex.setText("1");
                ui.questionCount.setText(qCount.toString());
            });
        }else {
            toastLog("未找到");
            ui.run(() => {
                ui.question.setText("未找到");
            });
        }
    });
});

//上一条
ui.prev.click(() => {
    threads.start(function () {
        if (qaArray.length > 0) {
            var qIndex = parseInt(ui.questionIndex.getText()) - 1;
            if (qIndex > 0) {
                ui.run(() => {
                    ui.question.setText(qaArray[qIndex - 1].question);
                    ui.answer.setText(qaArray[qIndex - 1].answer);
                    ui.questionIndex.setText(String(qIndex));
                });
            }else {
                toastLog("已经是第一条了！");
            }
        }else {
            toastLog("题目为空");
        }
    });
});

//下一条
ui.next.click(() => {
    threads.start(function () {
        if (qaArray.length > 0) {
            //toastLog(qaArray);
            var qIndex = parseInt(ui.questionIndex.getText()) - 1;
            if (qIndex < qaArray.length - 1) {
                //toastLog(qIndex);
                //toastLog(qaArray[qIndex + 1].question);
                ui.run(() => {
                    ui.question.setText(qaArray[qIndex + 1].question);
                    ui.answer.setText(qaArray[qIndex + 1].answer);
                    ui.questionIndex.setText(String(qIndex + 2));
                });
            }else {
                toastLog("已经是最后一条了！");
            }
        }else {
            toastLog("题目为空");
        }
    });
});

//修改
ui.update.click(() => {
    threads.start(function () {
        if (ui.question.getText() && qaArray.length > 0 && parseInt(ui.questionIndex.getText()) > 0) {
            var qIndex = parseInt(ui.questionIndex.getText()) - 1;
            var questionOld = qaArray[qIndex].question;
            var questionStr = ui.question.getText();
            var answerStr = ui.answer.getText();
            var sqlstr = "UPDATE tikuNet SET question = '" + questionStr + "' , answer = '" + answerStr + "' WHERE question=  '" + questionOld + "'";
            tikuCommon.executeSQL(sqlstr);
        }else {
            toastLog("请先查询");
        }
    });
});

//导出tiku.db
ui.tikudaocu.click(() => {
    threads.start(function () {
        let dbName = "tiku.db";//题库文件名
        let path = files.path(dbName);
        db = SQLiteDatabase.openOrCreateDatabase(path, null);
        sleep(500);
        db.beginTransaction();//数据库开始事务
        db.endTransaction();//数据结束事务
        db.close();
        sleep(500);
        files.copy(files.path("tiku.db"), "/sdcard/Download/tiku.db");
        alert("题库文件'tiku.db'将会导出在到/sdcard/Download文件夹下！");
        toastLog("导出成功！");
   });
});

//导入题库
ui.tikudaoru.click(() => {
    threads.start(function () {
        let dbName = "tiku.db";//题库文件名
        let path = files.path(dbName);
        if (!files.exists("/sdcard/Download/tiku.db")) {//确保文件存在
            alert("题库文件不存在", "请将文件名为'tiku.db'的题库文件置于'/sdcard/Download'文件夹里");
            return;
        }
        else{
            db.close(); 
            alert("即将导入题库");
            files.copy("/sdcard/Download/tiku.db",files.path("tiku.db"));
            toastLog("导入成功");
            db = SQLiteDatabase.openOrCreateDatabase(path, null);

        }
    });
});

//重置
ui.reset.click(() => {
    threads.shutDownAll();
    threads.start(function () {
        qaArray = [];
        ui.run(() => {
            ui.keyword.setText("");
            ui.question.setText("");
            ui.answer.setText("");
            ui.questionIndex.setText("0");
            ui.questionCount.setText("0");
            ui.rbQuestion.setChecked(true);
        });
        files.remove("tiku.db-journal");
        toastLog("重置完毕!");
    });
});

//更新网络题库
ui.updateTikuNet.click(() => {
    dialogs.build({
        title: "更新网络题库",
        content: "确定更新？",
        positive: "确定",
        negative: "取消",
    })
        .on("positive", update)
        .show();

    function update() {
        threads.start(function () {
            let dbName = "tiku.db";//题库文件名
            let path = files.path(dbName);
            db.close();
            engines.execScriptFile("./updated.js");
            db = SQLiteDatabase.openOrCreateDatabase(path, null);
        });
    }
});

//清空阅读文章
ui.listdel.click(() => {
    var db = SQLiteDatabase.openOrCreateDatabase(files.path("list.db"), null);
    var Deletelistable = "DELETE FROM learnedArticles";
    db.execSQL(Deletelistable);
    db.close();
    toastLog("已清空文章阅读记录!");
}) 

ui.daochu.click(() => {
    dialogs.build({
        title: "提示", 
        content: "这个操作会备份已学文章的数据库到\n/sdcard/Download文件夹下", 
        positive: "确定", 
    }).show();
    files.copy(files.path("list.db"), "/sdcard/Download/list.db");
    toastLog("已将数据库复制到/sdcard/Download文件夹下");
});

ui.daoru.click(() => {//导入题目
    dialogs.build({
        title: "提示", 
        content: "请确认文件已经放在\n/sdcard/Download文件夹下\n导入后会删除导出的文件！！\n如果需要请先备份！！", 
        positive: "确定", 
        negative: "取消", 
    }).on("positive", copy) 
    .show();
    function copy() {
        files.copy("/sdcard/Download/list.db", files.path("list.db"));
        toastLog("导入成功！");
        files.remove("/sdcard/Download/list.db") 
    }
});

ui.save.click(function () {
    aCatlog = ui.aCatlog.getText();
    date_string = parseInt(ui.date_string.getText());
    vCatlog = ui.vCatlog.getText();
    s =  ui.s.getText();
    aCount = parseInt(ui.aCount.getText());
    aTime = parseInt(ui.aTime.getText());
    aZX = parseInt(ui.aZX.getText());
    vCount = parseInt(ui.vCount.getText());
    vTime = parseInt(ui.vTime.getText());
    lCount = parseInt(ui.lCount.getText());
    qCount = parseInt(ui.qCount.getText());
    zCount = parseInt(ui.zCount.getText());
    
    var config = aCount+" "+aTime+" "+aZX+" "+vCount+" "+vTime+" "+lCount+" "+zCount;
    files.write("./config.txt", config);
    toast("保存成功");
});
    
/*----程序执行部分 2021-6-13 萘落修改了一下-----*/
ui.all.click(function () {
    if (thread != null && thread.isAlive()) {
        alert("注意", "脚本正在运行，请结束之前进程");
        return;
    }
    toast("开始积分判断运行");
    thread = threads.start(function () {
        aCatlog = ui.aCatlog.getText();
        vCatlog = ui.vCatlog.getText();
        aZX = parseInt(ui.aZX.getText());
        lCount = parseInt(ui.lCount.getText());
        qCount = parseInt(ui.qCount.getText());
        zCount = parseInt(ui.zCount.getText());
        main();
    });
});

ui.customize.click(function () {
    if (thread != null && thread.isAlive()) {
        alert("注意", "脚本正在运行，请结束之前进程");
        return;
    }
    toast("开始自定义运行");
    thread = threads.start(function () {
        aCatlog = ui.aCatlog.getText();
        date_string = parseInt(ui.date_string.getText());
        vCatlog = ui.vCatlog.getText();
        s =  ui.s.getText();
        aCount = parseInt(ui.aCount.getText());
        aTime = parseInt(ui.aTime.getText());
        aZX = parseInt(ui.aZX.getText());
        vCount = parseInt(ui.vCount.getText());
        vTime = parseInt(ui.vTime.getText());
        lCount = parseInt(ui.lCount.getText());
        qCount = parseInt(ui.qCount.getText());
        zCount = parseInt(ui.zCount.getText());
        customize_flag = true;
        console.log('文章频道：' + aCatlog.toString() + '日期：' + date_string)
        console.log('文章数量：' + aCount.toString() + '篇')
        console.log('视频频道：' + vCatlog.toString() + '关键词' + s)
        console.log('视频数量：' + vCount.toString() + '个')
        main();
    });
});

ui.cq.click(function () {//挑战答题
     auto.waitFor();//等待获取无障碍辅助权限
    if (thread != null && thread.isAlive()) {
        alert("注意", "脚本正在运行，请结束之前进程");
        return;
    }
    thread = threads.start(function () {
        lCount = parseInt(ui.lCount.getText());
        qCount = parseInt(ui.qCount.getText());
        start_app();
        challengeQuestion();
         threads.shutDownAll();
         console.hide();
         engines.stopAll();
         exit();
    });
});

ui.zxx.click(function () {//隐藏技能，自动学习扩充题库哦，无限答题技能
    auto.waitFor();//等待获取无障碍辅助权限
   if (thread != null && thread.isAlive()) {
       alert("注意", "脚本正在运行，请结束之前进程");
       return;
   }
   thread = threads.start(function () {
       lCount = parseInt(ui.lCount.getText());
       qCount = parseInt(ui.qCount.getText());
       lCount = 10;
       qCount = 1000;
       start_app();
       challengeQuestion();
        threads.shutDownAll();
        console.hide();
        engines.stopAll();
        exit();
   });
});

ui.dwz.click(function () {//读文章
     auto.waitFor();//等待获取无障碍辅助权限
    if (thread != null && thread.isAlive()) {
        alert("注意", "脚本正在运行，请结束之前进程");
        return;
    }
    thread = threads.start(function () {
        start_app();
        articleStudy();
         threads.shutDownAll();
         console.hide();
         engines.stopAll();
         exit();
    });
});

ui.ksp.click(function(){//看视频
    auto.waitFor();//等待获取无障碍辅助权限
    if (thread != null && thread.isAlive()) {
        alert("注意", "脚本正在运行，请结束之前进程");
        return;
    }
    thread = threads.start(function () {
        start_app();
        videoStudy_bailing();
         threads.shutDownAll();
         console.hide();
         engines.stopAll();
         exit();
    });
});

ui.wq.click(function () {//每周答题 专项答题
    auto.waitFor();//等待获取无障碍辅助权限
   if (thread != null && thread.isAlive()) {
       alert("注意", "脚本正在运行，请结束之前进程");
       return;
   }
   thread = threads.start(function () {
        start_app();
        weeklyQuestion();
        specialQuestion();
        threads.shutDownAll();
        console.hide();
        engines.stopAll();
        exit();
   });
});

ui.dq.click(function () {//每日答题
     auto.waitFor();//等待获取无障碍辅助权限
    if (thread != null && thread.isAlive()) {
        alert("注意", "脚本正在运行，请结束之前进程");
        return;
    }
    thread = threads.start(function () {
         start_app();
         dailyQuestion();
         threads.shutDownAll();
         console.hide();
         engines.stopAll();
         exit();
    });
});

ui.sr.click(function () {//双人对战
    auto.waitFor();//等待获取无障碍辅助权限
    if (thread != null && thread.isAlive()) {
        alert("注意", "脚本正在运行，请结束之前进程");
        return;
    }
    thread = threads.start(function () {
        start_app();
        zCount = parseInt(ui.zCount.getText());
        SRQuestion();
        threads.shutDownAll();
        console.hide();
        engines.stopAll();
        exit();
    });
});

ui.zsy.click(function () {//四人赛
     auto.waitFor();//等待获取无障碍辅助权限
    if (thread != null && thread.isAlive()) {
        alert("注意", "脚本正在运行，请结束之前进程");
        return;
    }
    thread = threads.start(function () {
        start_app();
        zCount = parseInt(ui.zCount.getText());
        zsyQuestion();
         threads.shutDownAll();
         console.hide();
         engines.stopAll();
         exit();
    });
});

ui.stop.click(function () {
    if (thread != null && thread.isAlive()) {
        threads.shutDownAll();
        toast("停止运行！")
        console.hide();
    }
    else {
        toast("没有线程在运行！")
    }
});



ui.aCatlog.setText(aCatlog.toString());
ui.date_string.setText(date_string.toString());
ui.aCount.setText(aCount.toString());
ui.aTime.setText(aTime.toString());
ui.aZX.setText(aZX.toString());
ui.vCatlog.setText(vCatlog.toString());
ui.s.setText(s.toString());
ui.vCount.setText(vCount.toString());
ui.vTime.setText(vTime.toString());
ui.lCount.setText(lCount.toString());
ui.qCount.setText(qCount.toString());
ui.zCount.setText(zCount.toString());

function getTodayDateString() {
    var date = new Date();
    var y = date.getFullYear();
    var m = date.getMonth();
    var d = date.getDate();
    var s = dateToString(y, m, d);//年，月，日
    return s
}

function dateToString(y, m, d) {
    var year = y.toString();
    if ((m + 1) < 10) {
        var month = "0" + (m + 1).toString();
    }else {
        var month = (m + 1).toString();
    }
    if (d < 10) {
        var day = "0" + d.toString();
    }else {
        var day = d.toString();
    }
    var s = year + "-" + month + "-" + day;//年-月-日
    return s;
}

/*
<---------------UI部分结束--------------->
<---------------视频学习部分-------------->
/**
 * @description: 视频学习计时(弹窗)函数
 * @param: n-视频标号 seconds-学习秒数
 * @return: null
 */
function video_timing_bailing(n, seconds) {
    var dw = device.width;
    var dh = device.height;
    for (var i = 0;i < seconds;i++) {
        while (!textContains("分享").exists())//如果离开了百灵小视频界面则一直等待
        {
            console.clear();
            console.error("当前已离开第" + (n + 1) + "个百灵小视频界面，请重新返回视频");
            sleep(2000);
            return false;
        }
        if(text("点击重试").exists()){
            swipe(dw/3*2,dh/6*5,dw/3*2,dh/6, 500);//往下翻（纵坐标从5/6处滑到1/6处）
            i--;
        }
        sleep(900);
        console.clear();
        console.info("第" + (n + 1) + "个小视频已经观看" + (i + 1) + "秒,剩余" + (seconds - i - 1) + "秒!");
    }
}

/**
 * @description: 新闻联播小视频学习计时(弹窗)函数
 * @param: n-视频标号 seconds-学习秒数
 * @return: null
 */
function video_timing_news(n, seconds) {
    seconds = parseInt(seconds) + parseInt(random(0, 10));
    for (var i = 0;i < seconds;i++) {
        sleep(1000);
        while (!text("播放").exists())//如果离开了联播小视频界面则一直等待
        {
            console.error("当前已离开第" + (n + 1) + "个新闻小视频界面，请重新返回视频");
            sleep(2000);
        }
        console.info("第" + (n + 1) + "个小视频已经观看" + (i + 1) + "秒,剩余" + (seconds - i - 1) + "秒!");
    }
}

/**
 * @description: 广播学习计时(弹窗)函数
 * @param: r_time-已经收听的时间 seconds-学习秒数
 * @return: null
 */
function radio_timing(r_time, seconds) {
    for (var i = 0;i < seconds;i++) {
        sleep(1000);
        if (i % 5 == 0)//每5秒打印一次信息
        {
            console.info("广播已经收听" + (i + 1 + r_time) + "秒,剩余" + (seconds - i - 1) + "秒!");
        }
        if (i % 15 == 0)//每15秒弹一次窗防止息屏
        {
            toast("这是防息屏弹窗，可忽略-. -");
        }
    }
}

/**
@description: 停止广播
@param: null
@return: null
*/
function stopRadio() {
    console.log("停止收听广播！");
    click("电台");
    sleep(1000);
    click("听广播");
    sleep(2000);
    while (!(textContains("正在收听").exists() || textContains("最近收听").exists() || textContains("推荐收听").exists())) {
        log("等待加载");
        sleep(2000)
    }
    if (click("正在收听") == 0) {
        click("最近收听");
    }
    sleep(3000);
    id("v_play").findOnce(0).click();
    sleep(2000)
    if (id("btn_back").findOne().click() == 0) {
        sleep(2000);
        back();
    }
}

/*      数据库控制函数开始  来源:lazystudy*/
/**
 * @description: 读取文章数据库
 * @param: title,date
 * @return: res
 */
function getLearnedArticle(title, date) {
    rtitle = title.replace("'", "''");
    let dbName = "list.db";
    //文件路径
    let path = files.path(dbName);
    //确保文件存在
    if (!files.exists(path)) {
        // files.createWithDirs(path);
        console.error("未找到题库!请将题库放置与js同一目录下");
    }
    //创建或打开数据库
    var db = SQLiteDatabase.openOrCreateDatabase(path, null);
    var createTable = "\
    CREATE TABLE IF NOt EXISTS learnedArticles(\
    title CHAR(500),\
    date CHAR(100)\
    );";
    // var cleanTable = "DELETE FROM tikuNet";
    db.execSQL(createTable);
    // db.execSQL(cleanTable);
    var sql = "SELECT * FROM  learnedArticles WHERE title = '" + rtitle + "' AND date = '" + date + "'";
    var cursor = db.rawQuery(sql, null);
    var res = cursor.moveToFirst();
    cursor.close();
    db.close();
    log(res);
    return res;
}

/**
 * @description: 获取的文章题目写入数据库
 * @param: title,date
 * @return: res
 */
function insertLearnedArticle(title, date) {
    rtitle = title.replace("'", "''");
    let dbName = "list.db";
    let path = files.path(dbName);
    var db = SQLiteDatabase.openOrCreateDatabase(path, null);
    var createTable = "\
    CREATE TABLE IF NOt EXISTS learnedArticles(\
    title CHAR(500),\
    date CHAR(100)\
    );";
    // var cleanTable = "DELETE FROM tikuNet";
    db.execSQL(createTable);
    var sql = "INSERT INTO learnedArticles VALUES ('" + rtitle + "','" + date + "')";
    db.execSQL(sql);
    db.close();
}

/*        数据库控制函数结束         */

/**
 * @description: 文章学习计时(弹窗)函数
 * @param: n-文章标号 seconds-学习秒数
 * @return: null
 */
function article_timing(n, seconds) {
    var dw = device.width;
    var dh = device.height;
    seconds = parseInt(seconds);
    var randNum = random(0, 10);
    randNum = parseInt(randNum);//惨痛的教训:这里必须要转成int类型，否则就成了几百秒 xzy 2021-5-5更新
    seconds = seconds + randNum;
    for (var i = 0;i < seconds;i++) {
        while (!textContains("欢迎发表你的观点").exists())//如果离开了文章界面则一直等待
        {
            console.error("当前已离开第" + (n + 1) + "文章界面，请重新返回文章页面...");
            sleep(2000);
        }
        if (i % 5 == 0)//每5秒打印一次学习情况
        {
            console.info("第" + (n + 1) + "篇文章已经学习" + (i + 1) + "秒,剩余" + (seconds - i - 1) + "秒!");
        }
        sleep(1000);
        if (i % 10 == 0)//每10秒滑动一次，如果android版本<7.0请将此滑动代码删除
        {
            toast("这是防息屏toast,请忽视-。-");
            if (i <= seconds / 2) {
                swipe(dw/3*2, dh/6*5, dw/3*2, dh/6, 500);//向下滑动
            }
            else {
                swipe(dw/3*2, dh/6, dw/3*2, dh/6*5, 500);//向上滑动
            }
        }
    }
}


/**
 * @description: 文章学习函数  (阅读文章+文章学习时长)---6+6=12分
 * @param: null
 * @return: null
 */
function articleStudy(x) {
    while (!desc("工作").exists());//等待加载出主页
    var listView = className("ListView");//获取文章ListView控件用于翻页
    if (x == 0) {
        desc("工作").click();//点击主页正下方的"学习"按钮
        sleep(2000);
        click(aCatlog);
    }
    sleep(2000);
    var zt_flag = false;//判断进入专题界面标志
    var fail = 0;//点击失败次数
    var date_string = getTodayDateString();//获取当天日期字符串
    for (var i = 0, t = 0;i < aCount;) {
        try {
            if ((id("general_card_title_id").findOnce(t).parent().parent().click() || id("general_card_title_id").findOnce(t).parent().parent().parent().click()) == true) {
                sleep(5000);
                // // sleep(10000);//等待加载出文章页面，后面判断是否进入了视频文章播放要用到
                //获取当前正在阅读的文章标题
                let n = 0;
                while (!textContains("欢迎发表你的观点").exists()) {//如果没有找到评论框则认为没有进入文章界面，一直等待
                    sleep(2000);
                    console.warn("正在等待加载文章界面...");
                    if (n > 3) {//等待超过3秒则认为进入了专题界面，退出进下一篇文章
                        console.warn("没找到评论框!该界面非文章界面!");
                        zt_flag = true;
                        break;
                    }
                    n++;
                }
                if (text("展开").exists()) {//如果存在“展开”则认为进入了文章栏中的视频界面需退出
                    console.warn("进入了视频界面，退出并进入下一篇文章!");
                    t++;
                    back();
                    if (rTime != 0) {
                        while (!desc("工作").exists());
                        console.info("因为广播被打断，重新收听广播...");
                        sleep(500);
                        listenToRadio();//听电台广播
                        while (!desc("工作").exists());
                        desc("工作").click();
                    }
                    sleep(2000);
                    continue;
                }
                if (zt_flag == true) {//进入专题页标志
                    console.warn("进入了专题界面，即将退出并进下一篇文章!");
                    t++;
                    back();
                    sleep(2000);
                    zt_flag = false;
                    continue;
                }
                var currentNewsTitle = ""
                if (id("xxqg-article-header").exists()) {
                    currentNewsTitle = id("xxqg-article-header").findOne().child(0).text();// 最终解决办法
                }else if (textContains("来源").exists()) {
                    currentNewsTitle = textContains("来源").findOne().parent().children()[0].text();
                }else if (textContains("作者").exists()) {
                    currentNewsTitle = textContains("作者").findOne().parent().children()[0].text();
                }else if (descContains("来源").exists()) {
                    currentNewsTitle = descContains("来源").findOne().parent().children()[0].desc();
                }else if (descContains("作者").exists()) {
                    currentNewsTitle = descContains("作者").findOne().parent().children()[0].desc();
                }else {
                    console.log("无法定位文章标题,即将退出并阅读下一篇")
                    t++;
                    back();
                    sleep(2000);
                    continue;
                }
                if (currentNewsTitle == "") {
                    console.log("标题为空,即将退出并阅读下一篇")
                    t++;
                    back();
                    sleep(2000);
                    continue;
                }
                var flag = getLearnedArticle(currentNewsTitle, date_string);
                if (flag) {
                    //已经存在，表明阅读过了
                    console.info("该文章已经阅读过，即将退出并阅读下一篇");
                    t++;
                    back();
                    sleep(2000);
                    continue;
                }else {
                    //没阅读过，添加到数据库
                    insertLearnedArticle(currentNewsTitle, date_string);
                }
                console.log("正在学习第" + (i + 1) + "篇文章,标题：", currentNewsTitle);
                fail = 0;//失败次数清0
                //开始循环进行文章学习
                log(i+"next"+aTime);
                article_timing(i, aTime);
                sleep(2000);
                back();//返回主界面
                while (!desc("工作").exists());//等待加载出主页
                sleep(2000);
                i++;
                t++;//t为实际点击的文章控件在当前布局中的标号,和i不同,勿改动!
            }else {
                t++;
            }
        }catch (e) {
            listView.scrollForward();
            t = 0;
            sleep(1500);
        }
    }

}

/**
 * @description: 听“电台”新闻广播函数  (视听学习+视听学习时长)---6+6=12分
 * @param: null
 * @return: null
 */
function listenToRadio() {
    click("电台");
    sleep(1000);
    click("听广播");
    sleep(2000);
    while (!(textContains("正在收听").exists() || textContains("最近收听").exists() || textContains("推荐收听").exists())) {
        log("等待加载");
        sleep(1000);
    }
    if (click("最近收听") == 0) {
        if (click("推荐收听") == 0) {
            click("正在收听");
        }
    }
    sleep(2000);
    if (id("btn_back").findOne().click() == 0) {
        sleep(2000);
        back();//返回电台界面
    }
    sleep(2000);
}

function main() {
    if (!judge_tiku_existence()) {//题库不存在则退出
        return;
    }
    auto.waitFor();//等待获取无障碍辅助权限
    start_app();//启动app
    var start = new Date().getTime();//程序开始时间 
    if (customize_flag == true) {
        //自定义学习，各项目执行顺序可换
         localChannel1();//本地频道
         zsyQuestion();//四人赛
         SRQuestion();//双人对战
        dailyQuestion();//每日答题
        if (zxzd == 1){
            weeklyQuestion();//每周答题
            specialQuestion();//专项答题
        }
            challengeQuestion();//挑战答题
        if (aZX == 1){
           articleStudy1();//学习文章脚本1，包含点赞、分享和评论 
        }else{
           articleStudy2();//学习文章脚本2，包含点赞、分享和评论 
        }
           videoStudy_bailing();//看视频              
    }
    else 
    {
        getScores();//获取积分
        if (zxzd == 1)
        {
            if (myScores['每周答题'] < 1) {
            weeklyQuestion();//每周答题
            }
            if (myScores['专项答题'] < 1) {
            specialQuestion();//专项答题
            }
        }
        while ( myScores["双人对战"] < 1 || myScores["四人赛"] < 2 || myScores['本地频道'] != 1 || myScores['挑战答题'] != 6 || myScores['每日答题'] != 5 || myScores['视听学习'] != 6 || myScores['我要选读文章'] != 12)
        {
            if (myScores['本地频道'] != 1) localChannel1();//本地频道        
            if (myScores["四人赛"] < 2) zsyQuestion();//四人赛        
            if (myScores["双人对战"] < 1) SRQuestion();//双人对战         
            if (myScores['挑战答题'] != 6) challengeQuestion();//挑战答题        
            if (myScores['每日答题'] != 5) dailyQuestion();//每日答题        
            if (myScores['我要选读文章'] != 12) 
            if (aZX == 1){
                articleStudy1();//学习文章脚本1，包含点赞、分享和评论 
            }
            else{
                articleStudy2();//学习文章脚本2，包含点赞、分享和评论 
            }
        if (myScores['视听学习'] != 6) videoStudy_bailing();//看小视频
            getScores();//再次获取积分，核对文章和视听时长，补学
            continue;//break结束当前循环，continue继续执行当前循环
        }
        if (myScores['分享'] != 1 || myScores['发表观点'] != 1){
        aCount = 2;//置文章数2，学习文章2，启动分享收藏评论2
        articleStudy1();//收藏+分享 若c运行到此报错请注释本行！
        }
        if (myScores['视听学习时长'] != 6){
            listenToRadio();//听电台广播补视听时长
        }
    }

    var end = new Date().getTime();
    console.log("运行结束,共耗时" + (parseInt(end - start)) / 1000 + "秒");
    threads.shutDownAll();
    console.hide();
    engines.stopAll();
    exit();
}

     
/** 
 * @description: 启动app
 * @param: null
 * @return: null
 */
function start_app() {
    console.setPosition(0, dh / 2);//部分华为手机console有bug请注释本行
    console.show();//部分华为手机console有bug请注释本行
    console.clear();//清理以前日志
    console.log("启动学习强国");
    if (!launchApp("学习强国")){//启动学习强国app
     console.error("找不到学习强国App!");
     return;
      }
     sleep(3000);//如果已清理强国app后台，默认打开主页;如果未清理后台，3秒应该可以拉起强国app
    while (!id("home_bottom_tab_button_work").exists()){//返回到主页出现
        back();
        sleep(1000);
    };
    while (!id("home_bottom_tab_button_work").exists()) {//20201001 学习按钮文字属性由"学习"改为 "工作"，以下所有点击学习按钮加载主页均同步修改
    id("home_bottom_tab_button_work").findOne().click();//点击主页正下方的"学习"按钮
    console.log("等待加载出主页");
    sleep(1000);
    continue;/*break;exists();back();*/
     }
    sleep(1000);
}

/**
 * @description: 获取积分
 * @param: null
 * @return: null
 */
function getScores() {
    while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
    id("home_bottom_tab_button_work").findOne().click();//点击主页正下方的"学习"按钮
    sleep(2000);
    console.log("正在获取积分...");
    while (!text("积分明细").exists()) {//自主页点击右上角积分数字进入学习积分
        if (id("comm_head_xuexi_score").exists()) {
            id("comm_head_xuexi_score").findOnce().click();
        }else if (text("积分").exists()) {
            text("积分").findOnce().parent().child(1).click();
        }else if (id("comm_head_xuexi_mine").exists()){//自强国通页面进入我的主页点击学习积分
            id("comm_head_xuexi_mine").findOnce().click();
            if (id("my_display_name").exists()){//我的主页
              id("my_recycler_view").findOnce().child(0).click();
               }
        }
        sleep(3000);
    }
    let err = false;
    while (!err) {
        try {
            className("android.widget.ListView").findOnce().children().forEach(item => {
            let name = item.child(0).child(0).text();
            let str = item.child(2).text().split("/");
            let score = str[0].match(/[0-9][0-9]*/g);
            myScores[name] = score;
            });
            err = true;
        }catch (e) {
            console.log(e);
        }
    }
    console.log(myScores);
    aCount = 12 - myScores["我要选读文章"];
    vCount = 6 - myScores["视听学习"];
    rTime = (6 - myScores["视听学习时长"]) * 60;
    console.log('剩余文章：' + aCount.toString() + '篇')
    console.log('剩余视频：' + vCount.toString() + '个')
    console.log('视听学习时长：' + rTime.toString() + '秒')
    sleep(1000);back();sleep(1000);
}

/**
 * @description: 文章学习函数  (阅读文章+文章学习时长)---12分
 * @param: null
 * @return: null
 */
//文章学习函数之1 点击基于日期s=date_String或 "学习强国"平台
function articleStudy1() {
    while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
    id("home_bottom_tab_button_work").findOne().click();//点击主页正下方的"学习"按钮
    sleep(2000);
    var aCatlog = aCat[num] ;//文章学习类别，随机取"推荐""要闻"、"新思想"
    var date_string = getTodayDateString();//获取当天日期字符串
    var s = date_string;
    var listView = className("ListView");//获取文章ListView控件用于翻页
    click(aCatlog);
    sleep(2000);
    var zt_flag = false;//判断进入专题界面标志
    var fail = 0;//点击失败次数
    console.log('文章类别：' + aCatlog + '关键词：'+ s)
    for (var i = 0, t = 0;i < aCount;) {
        if (click(s, t) == true)//如果点击成功则进入文章页面,不成功意味着本页已经到底,要翻页
        {
            let n = 0;
            while (!textContains("欢迎发表你的观点").exists())//如果没有找到评论框则认为没有进入文章界面，一直等待
            {
                sleep(1000);
                console.warn("正在等待加载文章界面...");
                if (n > 3)//等待超过3秒则认为进入了专题界面，退出进下一篇文章
                {
                    console.warn("没找到评论框!该界面非文章界面!");
                    zt_flag = true;
                    break;
                }
                n++;
            }
            if (textContains("央视网").exists() || textContains("广播").exists() || textContains("中央广播电视总台").exists() ||textContains("播放").exists() ||textContains("展开").exists() )//如果存在“央视网、中央广播电视总台、播放、展开”则认为进入了视频需退出。关键词测试
            {
                console.warn("进入视频界面，退出并进下一篇文章!");
                t++;
                back();
                /* while (!id("home_bottom_tab_button_work").exists());
                sleep(500);
                click("电台");
                sleep(1000);
                click("最近收听");
                console.log("因广播被打断，重新收听广播...");
                sleep(1000);
                back();*/
                while (!id("home_bottom_tab_button_work").exists());
                id("home_bottom_tab_button_work").findOne().click();
                sleep(1000);
                num = random(0, commentText.length - 1) ;//重取随机数
                aCatlog = aCat[num] ;
                s = "“学习强国”学习平台";
                console.log('文章类别：' + aCatlog + '关键词：'+ s)
                click(aCatlog);
                sleep(1000);
                continue;
            }
            
           if (id("v_play").exists() || id("bg_play").exists())//进入电台页面2020.09.28
           {
            console.warn("进入电台界面，退出并进下一篇文章!");
            t++;
            if (id("btn_back").exists()){
             id("btn_back").findOnce().click();//返回 2020.09.28需关闭电台收听
             }else{
                 back;}//返回 2020.09.28需关闭电台收听
            while (!id("home_bottom_tab_button_work").exists());
            id("home_bottom_tab_button_work").findOne().click();
            sleep(1000);
            num = random(0, commentText.length - 1) ;//重取随机数
            aCatlog = aCat[num] ;
            s = "“学习强国”学习平台";
            console.log('文章类别：' + aCatlog + '关键词：'+ s)
            click(aCatlog);
            sleep(1000);
            continue;
           }
            
           if (zt_flag == true)//进入专题页标志
            {
                console.warn("进入了专题界面，退出并进下一篇文章!")
                t++;
                back();
                sleep(1000);
                zt_flag = false;
                continue;
            }
            console.log("正在学习第" + (i + 1) + "篇文章...");
            fail = 0;//失败次数清0
            article_timing(i, aTime);
            if (i < cCount)//收藏分享2篇文章
            {
                CollectAndShare(i);//收藏+分享 若运行到此报错请注释本行！
                Comment(i);//评论
            }
            back();//返回主界面
            while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
            sleep(1000);
            i++;
            t++;//t为实际点击的文章控件在当前布局中的标号,和i不同,勿改动!
       }else {
            if (id("v_play").exists() || id("bg_play").exists())//进入电台页面2020.09.28
           {
             console.warn("进入电台界面，退出并进下一篇文章!");
             t++;
             if (id("btn_back").exists()){
             id("btn_back").findOnce().click();//返回 2020.09.28需关闭电台收听
             }else{
                 back;}
             while (!id("home_bottom_tab_button_work").exists());
             id("home_bottom_tab_button_work").findOne().click();
             sleep(1000);
             num = random(0, commentText.length - 1) ;//重取随机数
             aCatlog = aCat[num] ;
             s = "“学习强国”学习平台";
             console.log('文章类别：' + aCatlog + '关键词：'+ s)
             click(aCatlog);
             sleep(1000);
             continue;
           }
           
           if (i == 0)//如果第一次点击就没点击成功则认为首页无当天文章
            {
                date_string = getYestardayDateString();
                s = date_string;
                /*s = "“学习强国”学习平台";*/
                num = random(0, commentText.length - 1) ;//重取随机数
                aCatlog = aCat[num] ;
                click(aCatlog);
                console.warn("首页没有找到当天文章，即将学习昨日新闻!"+aCatlog + s);
                continue;
            }
            
            if (fail > 3)//连续翻几页没有点击成功则认为今天的新闻还没出来，学习昨天的
            {
                date_string = getYestardayDateString();
                 /*s = date_string;*/
                 s = "“学习强国”学习平台";
                num = random(0, commentText.length - 1) ;//重取随机数
                aCatlog = aCat[num] ;
                click(aCatlog);
                console.warn("没有找到当天文章，即将学习昨日新闻!"+aCatlog + s);
                fail = 0;//失败次数清0
                continue;
            }
            
            if (!textContains(s).exists())//当前页面当天新闻
            {
                fail++;//失败次数加一
            }
            listView.scrollForward();//向下滑动(翻页)
            t = 0;
            sleep(1500);
        }
    }
}
//文章学习函数之2 基于播报判断.因基于父子控件判断，点击基于日期s=date_String 感谢chongyadong
function articleStudy2() {
 while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
 id("home_bottom_tab_button_work").findOne().click();//点击主页正下方的"学习"按钮
sleep(2000);
 var aCatlog = aCat[num] ;//文章学习类别，随机取"推荐""要闻"、"新思想"
 var date_string = getTodayDateString();//获取当天日期字符串
 var s = date_string;
 var listView = className("ListView");//获取文章ListView控件用于翻页
click(aCatlog);
sleep(2000);
var zt_flag = false;//判断进入专题界面标志
var currentNewsTitle = "";
var fail = 0;//点击失败次数
console.log('文章类别：' + aCatlog + '关键词：'+ s)
for (var i = 0, t = 0;i < aCount;) {
    var art_obj = text(s).findOnce(t);
    //console.info(art_obj);
    if ((art_obj != null) && (art_obj.parent().childCount() == 4)) {
        t++;//t为实际查找的文章控件在当前布局中的标号,和i不同,勿改动!
        if ((art_obj.parent().child(3).text() == "播报") && (art_obj.parent().child(0).text() != currentNewsTitle)) //如果播报存在就进入文章正文
        {
            currentNewsTitle = art_obj.parent().child(0).text();
            log(currentNewsTitle);
            art_obj.parent().click();
            sleep(1000);
            let n = 0;
            while (!textContains("欢迎发表你的观点").exists())//如果没有找到评论框则认为没有进入文章界面，一直等待
            {
                sleep(1000);
                console.warn("正在等待加载文章界面...");
                if (n > 3)//等待超过3秒则认为进入了专题界面，退出进下一篇文章
                {
                    console.warn("没找到评论框!该界面非文章界面!");
                    zt_flag = true;
                    break;
                }
                n++;
            }
            if (textContains("央视网").exists() || textContains("广播").exists() || textContains("中央广播电视总台").exists() ||textContains("播放").exists() ||textContains("展开").exists() )//如果存在“央视网、中央广播电视总台、播放、展开”则认为进入了视频需退出。关键词测试
            {
                console.warn("进入视频界面，退出并进下一篇文章!");
                t++;
                back();
                /*while (!id("home_bottom_tab_button_work").exists());
                sleep(500);
                click("电台");
                sleep(1000);
                click("最近收听");
                console.log("因广播被打断，重新收听广播...");
                sleep(1000);
                back();*/
                while (!id("home_bottom_tab_button_work").exists());
                id("home_bottom_tab_button_work").findOne().click();
                sleep(1000);
                num = random(0, commentText.length - 1) ;//重取随机数
                aCatlog = aCat[num] ;
               s = date_string;
              /*s = "“学习强国”学习平台";*/
                console.log('文章类别：' + aCatlog + '关键词：'+ s)
                click(aCatlog);
                sleep(1000);
                continue;
            }
            
           if (id("v_play").exists() || id("bg_play").exists())//进入电台页面2020.09.28
           {
            console.warn("进入电台界面，退出并进下一篇文章!");
            t++;
            if (id("btn_back").exists()){
             id("btn_back").findOnce().click();//返回 2020.09.28需关闭电台收听
             }else{
                 back;}//返回 2020.09.28需关闭电台收听
            while (!id("home_bottom_tab_button_work").exists());
            id("home_bottom_tab_button_work").findOne().click();
            sleep(1000);
            num = random(0, commentText.length - 1) ;//重取随机数
            aCatlog = aCat[num] ;
             s = date_string;
            /*s = "“学习强国”学习平台";*/
            console.log('文章类别：' + aCatlog + '关键词：'+ s)
            click(aCatlog);
            sleep(1000);
            continue;
           }
            
           if (zt_flag == true)//进入专题页标志
            {
                console.warn("进入了专题界面，退出并进下一篇文章!")
                t++;
                back();
                sleep(1000);
                zt_flag = false;
                continue;
            }
            console.log("正在学习第" + (i + 1) + "篇文章...");
            fail = 0;//失败次数清0
            article_timing(i, aTime);
            if (i < cCount)//收藏分享2篇文章
             {
               CollectAndShare(i);//收藏+分享 若c运行到此报错请注释本行！
               Comment(i);//评论
              }
            back();//返回主界面
            while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
            sleep(1000);
            i++;
         }else{//判断非目标文章
            if (t > 2) {
                listView.scrollForward();//向下滑动(翻页
                console.log("----------翻页------------");
                t = 0;
                sleep(1500);
              }
        }
     }else{
        if (fail > 3) //连续翻几页没有点击成功则认为今天的新闻还没出来，学习昨天的
          {
            date_string = getYestardayDateString();
            s = date_string;
            /*s = "“学习强国”学习平台";*/
            num = random(0, commentText.length - 1) ;//重取随机数
            aCatlog = aCat[num] ;
            click(aCatlog);
            console.warn("没有找到当天文章，即将学习昨日新闻!"+aCatlog + s);
            fail = 0;//失败次数清0
            continue;
          }
        if (!textContains(date_string).exists()) //当前页面当天新闻
          {
            fail++;//失败次数加一
          }
        listView.scrollForward();//向下滑动(翻页
        console.log("----------翻页------------");
        t = 0;
        sleep(1500);
     }
   }
}

/**
 * @description:新闻联播小视频学习函数
 * @param: null
 * @return: null
 */

function videoStudy_news() {
    while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
    id("home_bottom_tab_button_work").findOne().click();//点击主页正下方的"学习"按钮
    sleep(2000);
    click("电视台");
    var vCatlog = vCat[num] ;//视频学习类别，随机取 "第一频道"、"学习视频"、"联播频道"
    if (num == 0){
             var s = "中央广播电视总台";
             }else if (num == 1){
             var s = "央视新闻";
             }else {
             var s = "中央广播电视总台";
             }
    sleep(1000);
    click(vCatlog);
    sleep(2000);
    var listView = className("ListView");//获取listView视频列表控件用于翻页
    var fail = 0;//点击失败次数
    sleep(1000);
    console.log('视频类别：' + vCatlog + '关键词：'+ s )
    for (var i = 0, t = 1;i < vCount;) {
        if (click(s, t) == true) {
            console.log("即将学习第" + (i + 1) + "个视频!");
            fail = 0;//失败次数清0
            video_timing_news(i, vTime);//学习每个新闻联播小片段
            back();//返回联播频道界面
            while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
            sleep(1000);
            i++;
            t++;
            if (i == 3) {//如果是平板等设备，请尝试修改i为合适值！
                listView.scrollForward();//翻页
                sleep(2000);
                t = 2;
            }
        }
        else {
        if (fail > 3)//连续翻几页没有点击成功则改换频道
            {
                num = random(0, commentText.length - 1) ;//重取随机数
                vCatlog = vCat[num] ;
                click(vCatlog);
                sleep(2000);
                if (num == 0){
                   var s = "央视网";
                 }else if (num == 1){
                   var s = "新华社";
                 }else {
                   var s = "中央广播电视总台";
                 }
                 sleep(1000);
                console.warn("改换："+ vCatlog + '关键词：'+ s);
                fail = 0;//失败次数清0
                continue;
            }
            if (!textContains(s).exists())//未找到关键词
            {
                fail++;//失败次数加一
            }
            listView.scrollForward();//翻页
            sleep(2000);
            t = 3;
        }
    }
}

/**
 * @description: “百灵”小视频学习函数
 * @param: vCount,vTime
 * @return: null
 */
function videoStudy_bailing() {
    var dw = device.width;
    var dh = device.height;
    var vtop = ["推荐","党史","竖","炫","窗","藏","靓","秀","熊猫","美食","虹"];
    var vitem = vtop[random(0,vtop.length - 1)];
    while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
    id("home_bottom_tab_button_work").findOne().click();//点击主页正下方的"学习"按钮
    sleep(4000);
    click("百灵");
    sleep(4000);
    log("选择" + vitem);
    log("看视频数量:" + vCount +"个\n视频时长:" + vTime + "秒");
    click(vitem);
    sleep(5000);    
    if(textContains(":").exists()){
        var a = textContains(":").findOne().parent().parent().parent();//根据控件搜索视频框，但部分手机不适配，改用下面坐标点击
        a.click();
        toastLog("控件操作");
    }
    else{
        click((dw/3*2)+random()*10,dh/6);//坐标点击第一个视频 
        toastLog("坐标操作");
    }

    sleep(4000);
    for (var i = 0;i < vCount;i++) {
        console.log("正在观看第" + (i + 1) + "个小视频");
        if(video_timing_bailing(i, vTime)==false) return false;//观看每个小视频
        if (i != vCount - 1) {
            swipe(dw/3*2,dh/6*5,dw/3*2,dh/6, 500);//往下翻（纵坐标从5/6处滑到1/6处）
        }
    }
    back();
    sleep(2000);
}

/**
 * @description: 听“电台”新闻广播函数  补视听时长
  * @param: null
 * @return: null
 */
function listenToRadio() {
    var r_start = new Date().getTime();//广播开始时间 
    while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
    id("home_bottom_tab_button_work").findOne().click();//点击主页正下方的"学习"按钮
    sleep(2000);
    click("电台");
    sleep(1000);
    click("听广播");//202012听新闻广播 改为 听广播
    sleep(2000);
    if (textContains("最近收听").exists()) {
        click("最近收听");
        console.log("正在收听广播...");
        sleep(1000);
        back();//返回
        sleep(1000);
    }
    if (textContains("推荐收听").exists()) {
        click("推荐收听");
        console.log("正在收听广播...");
        sleep(1000);
        back();//返回
        sleep(1000);
    }
    id("home_bottom_tab_button_work").findOne().click();
    sleep(1000);
    var r_end = new Date().getTime();//广播结束时间
    var radio_time = (parseInt((r_end - r_start) / 1000));//广播已经收听的时间
    var left_time =rTime - radio_time;
    radio_timing(parseInt((r_end - r_start) / 1000), left_time);//广播剩余需收听时间
}

/**
@description: 停止广播
@param: null
@return: null
*/
function stopRadio() {
    while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
    id("home_bottom_tab_button_work").findOne().click();//点击主页正下方的"学习"按钮
    sleep(2000);
    console.log("停止收听广播！");
    click("电台");
    sleep(1000);
    click("听广播");//202012听新闻广播 改 听广播
    sleep(2000);
    while (!(textContains("正在收听").exists() || textContains("最近收听").exists() || textContains("推荐收听").exists())) {
        log("等待加载");
        sleep(2000);
    }
    if (textContains("正在收听").exists()) {
        click("正在收听");
        console.log("正在停止广播...");
        sleep(2000);
        id("v_play").findOnce(0).click();//点击暂停播放按钮
        sleep(2000);
        if (id("btn_back").findOne().click() == 0) {//后退
            sleep(2000);
            back();
        }
    }
    console.log("广播已停止播放...");
    sleep(1000);
    if (!id("home_bottom_tab_button_work").exists()) {
        start_app(1);
    }
    sleep(1000);
}


/**
 * @description: 收藏加分享函数  (收藏+分享)---1+1=2分
 * @param: i-文章标号
 * @return: null
 */
function CollectAndShare(i) {
    while (!textContains("欢迎发表你的观点").exists())//如果没有找到评论框则认为没有进入文章界面，一直等待
    {
        sleep(1000);
        console.log("等待进入文章界面")
    }
    console.log("正在进行第" + (i + 1) + "次收藏和分享...");

    var textOrder = text("欢迎发表你的观点").findOnce().drawingOrder();
    var collectOrder = textOrder + 2;
    var shareOrder = textOrder + 3;
    var collectIcon = className("ImageView").filter(function (iv) {
        return iv.drawingOrder() == collectOrder;
    }).findOnce();

    var shareIcon = className("ImageView").filter(function (iv) {
        return iv.drawingOrder() == shareOrder;
    }).findOnce();

    //var collectIcon = classNameContains("ImageView").depth(10).findOnce(0);//右下角收藏按钮
    collectIcon.click();//点击收藏
    console.info("收藏成功!");
    sleep(1000);

    //var shareIcon = classNameContains("ImageView").depth(10).findOnce(1);//右下角分享按钮
    shareIcon.click();//点击分享
    while (!textContains("分享到学习强国").exists());//等待弹出分享选项界面
    sleep(1000);
    click("分享到学习强国");
    sleep(2000);
    console.info("分享成功!");
    back();//返回文章界面
    sleep(1000);
    collectIcon.click();//再次点击，取消收藏
    console.info("取消收藏!");
    sleep(1000);
}

/**
 * @description: 评论函数---2分
 * @param: i-文章标号
 * @return: null
 */
function Comment(i) {
    while (!textContains("欢迎发表你的观点").exists())//如果没有找到评论框则认为没有进入文章界面，一直等待
    {
        sleep(1000);
        console.log("等待进入文章界面")
    }
    click("欢迎发表你的观点");//单击评论框
    console.log("正在进行第" + (i + 1) + "次评论...");
    sleep(1000);
    var num = random(0, commentText.length - 1)//随机数
    setText(commentText[num]);//输入评论内容
    sleep(1000);
    click("发布");//点击右上角发布按钮
    console.info("评论成功!");
    sleep(2000);
    click("删除");//删除该评论
    sleep(2000);
    click("确认");//确认删除
    console.info("评论删除成功!");
    sleep(1000);
}


/**
 * @description: 本地频道
 * @param: null
 * @return: null
 */
//基于控件点击 20200911 部分手机 本地在频道列表为控件3 但部分为控件14，可点击后基于切换地区判断。
//20201020如果在综合页面进入本地，则识别不到新思想，因此改基于综合判断。20201022 山东省界面更新频道内控件3会跳转外部链接故改0
//20210116 控件14改动为15，控件3有无变动未知
function localChannel1() {
    while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
    id("home_bottom_tab_button_work").findOne().click();//点击主页正下方的"学习"按钮
    sleep(2000);
    console.log("点击本地频道");
    sleep(1000);
    if (className("android.widget.TextView").text("综合").exists()) {
       className("android.widget.TextView").text("综合").findOne().parent().parent().child(3).click();
       sleep(2000);
       if(className("android.widget.TextView").text("切换地区").exists()){
       className("android.support.v7.widget.RecyclerView").findOne().child(0).click();
       sleep(2000);
       console.log("返回主界面");
       back();
       className("android.widget.TextView").text("综合").findOne().parent().parent().child(0).click();
       }else{
       className("android.widget.TextView").text("综合").findOne().parent().parent().child(15).click();//14 15
       sleep(2000);
       className("android.support.v7.widget.RecyclerView").findOne().child(0).click();
       sleep(2000);
       console.log("返回主界面");
       back();
       className("android.widget.TextView").text("综合").findOne().parent().parent().child(11).click();
       }
       id("home_bottom_tab_button_work").findOne().click();
       sleep(1000);
    }else {
        console.log("请手动点击本地频道！");
    }
}

/**
 * @description: 日期转字符串函数
 * @param: y,m,d 日期数字 2020 xx xx
 * @return: s 日期字符串 "2019-xx-xx"
 */
function dateToString(y, m, d) {
    var year = y.toString();
    if ((m + 1) < 10) {
        var month = "0" + (m + 1).toString();
    }else {
        var month = (m + 1).toString();
    }
    if (d < 10) {
        var day = "0" + d.toString();
    }else {
        var day = d.toString();
    }
    var s = year + "-" + month + "-" + day;//年-月-日
    return s;
}

/**
 * @description: 获取当天日期
 * @param: null
 * @return: s 日期字符串 "2020 xx xx"
 */
function getTodayDateString() {
    var date = new Date();
    var y = date.getFullYear();
    var m = date.getMonth();
    var d = date.getDate();
    var s = dateToString(y, m, d);//年，月，日
    return s
}

/**
 * @description: 获取昨天日期
 * @param: null
 * @return: s 日期字符串 "2020 xx xx"
 */
function getYestardayDateString() {
    var date = new Date();
    num++;//num是程序开始获取的随机数，前1-3天，+1防止num=0的情况
    date.setDate(date.getDate() - num);
    var y = date.getFullYear();
    var m = date.getMonth();
    var d = date.getDate();
    var s = dateToString(y, m, d);//年，月，日
    return s
}


/*************************************************挑战 争上游 双人答题部分******************************************************/

function indexFromChar(str) {
    return str.charCodeAt(0) - "A".charCodeAt(0);
}

/**
 * @description: 四人赛 20200928增加
 * @param: null
 * @return: null
 */
function zsyQuestion() {
    while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
    id("home_bottom_tab_button_work").findOne().click();//点击主页正下方的"学习"按钮
    sleep(2000);
    text("我的").click();
    if (!textContains("我要答题").exists()) {
      sleep(1000);
      click("我要答题");
    }else {
     (!text("我要答题").exists());
      sleep(1000);
      text("我要答题").findOne().parent().click();
      }
    while (!text("答题练习").exists());//可用词：排行榜 答题竞赛
    sleep(1000);
    className("android.view.View").text("答题练习").findOne().parent().child(8).click();
    console.log("开始四人赛")
    sleep(2000);
    if(className("android.view.View").text("开始比赛").exists()){
      className("android.view.View").text("开始比赛").findOne().click();
      }
      sleep(3000);
    if (className("android.widget.Button").text("知道了").exists() || className("android.view.View").text("温馨提示").exists() || className("android.view.View").text("您已超过今日对战次数，请明日再来。").exists() ){
       console.log("今日已完成30次对战，请明日再来");
        back();sleep(1000);
        back();sleep(1000);
        back();sleep(1000);
       if (id("my_display_name").exists()){//我的主页，再退一步回主页
         back();sleep(1000);}//单纯back有概率退出但又有可能只退到我的页面 故加判断
        return;
     }
     sleep(3000);
    let zNum = 0;//轮数
    while (true) {
        if (className("android.view.View").text("继续挑战").exists() || textContains("继续挑战").exists())//遇到继续挑战，则本局结束
        {console.info("四人赛本局结束!");
         zNum++;
          if (zNum >= zCount) {
            console.log("四人赛结束，返回主页！");
                //回退4次返回主页 
            back();sleep(1000);
            back();sleep(1000);
            back();sleep(1000);
            back();sleep(1000);
            if (id("my_display_name").exists()){//我的主页，再退一步回主页
            back();sleep(1000);}//单纯back有概率退出但又有可能只退到我的页面 故加判断
            break;
            }else {
           console.log("即将开始下一轮...")
           sleep(2000);//等待2秒开始下一轮
           back();
          sleep(1000);
           back();
          while (!text("答题练习").exists());//排行榜 答题竞赛
          sleep(1000);
          className("android.view.View").text("答题练习").findOne().parent().child(8).click();
          console.log("开始四人赛")
          sleep(2000);
          if (className("android.view.View").text("开始比赛").exists()){
            className("android.view.View").text("开始比赛").findOne().click();
            }
          sleep(3000);
        if (className("android.widget.Button").text("知道了").exists() || className("android.view.View").text("温馨提示").exists() || className("android.view.View").text("您已超过今日对战次数，请明日再来。").exists() ){
          console.log("今日已完成30次对战，请明日再来");
           back();sleep(1000);
           back();sleep(1000);
           back();sleep(1000);
          if (id("my_display_name").exists()){//我的主页，再退一步回主页
            back();sleep(1000);}//单纯back有概率退出但又有可能只退到我的页面 故加判断
          return;
         }
         sleep(3000);
       }
        console.warn("第" + (zNum + 1).toString() + "轮开始...")
        }
       if (/*textContains("距离答题结束").exists() &&*/ !text("继续挑战").exists()){//20201225答题界面变化 距离答题结束 删除
        zsyQuestionLoop();
        }
    }
}

/**
 * @description: 双人对战答题 20200928增加
 * @param: null
 * @return: null
 */
function SRQuestion() {
    while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
    id("home_bottom_tab_button_work").findOne().click();//点击主页正下方的"学习"按钮
    sleep(2000);
    text("我的").click();
    if (!textContains("我要答题").exists()) {
     sleep(1000);
     click("我要答题");
      }else {
     (!text("我要答题").exists());
    sleep(1000);
    text("我要答题").findOne().parent().click();
     }
    while (!text("答题练习").exists());//可用词：排行榜 答题竞赛
    sleep(1000);
    className("android.view.View").text("答题练习").findOne().parent().child(9).click();
    console.log("开始双人对战")
    sleep(2000);
    if(className("android.view.View").text("邀请对手").exists()){
     className("android.view.View").text("邀请对手").findOne().parent().child(0).click();
      }//原为随机邀请对手
     if(className("android.view.View").text("随机匹配").exists()){
     className("android.view.View").text("随机匹配").findOne().parent().child(0).click();
      }//20200125修改为邀请好友&随机匹配
    sleep(1000);
    if(className("android.view.View").text("开始对战").exists()){
     className("android.view.View").text("开始对战").findOne().click();
      }
    sleep(3000);
    if (className("android.widget.Button").text("知道了").exists() || className("android.view.View").text("温馨提示").exists() || className("android.view.View").text("您已超过今日对战次数，请明日再来。").exists() ){
       console.log("今日已完成30次对战，请明日再来");
        back();sleep(1000);
        back();sleep(1000);
        back();sleep(1000);
       if (id("my_display_name").exists()){//我的主页，再退一步回主页
         back();sleep(1000);}//单纯back有概率退出但又有可能只退到我的页面 故加判断
        return;
     }
     sleep(3000);
    let zNum = 1;//轮数
    while (true) {
      if (className("android.view.View").text("继续挑战").exists() || textContains("继续挑战").exists())//遇到继续挑战，则本局结束
        {console.info("双人对战本局结束!");
          zNum++;
            if (zNum >= zCount) {
                console.log("双人对战结束！返回主页！");
                //回退4次返回主页 
                back();sleep(1000);
                back();sleep(1000);
                if (text("退出").exists()){
                className("android.widget.Button").text("退出").findOne().click();
                sleep(1000);
                }
                back();sleep(1000);
                back();sleep(1000);
                if (id("my_display_name").exists()){//我的主页，再退一步回主页
               back();sleep(1000);}//单纯back有概率退出但又有可能只退到我的页面 故加判断
                break;
            }else {
                console.log("即将开始下一轮...")
                back();
                sleep(1000);
                back();
                sleep(1000);
                if (textContains("退出").exists()){
                 className("android.widget.Button").text("退出").findOne().click();
                 sleep(1000);
                }
                while (!text("答题练习").exists());//排行榜 答题竞赛
                sleep(1000);
                className("android.view.View").text("答题练习").findOne().parent().child(9).click();
                console.log("开始双人对战");
                sleep(2000);
               if(className("android.view.View").text("邀请对手").exists()){
                className("android.view.View").text("邀请对手").findOne().parent().child(0).click();
               }//原为随机邀请对手
               if(className("android.view.View").text("随机匹配").exists()){
                className("android.view.View").text("随机匹配").findOne().parent().child(0).click();
               }//20200125修改为邀请好友&随机匹配
               sleep(1000);
               if(className("android.view.View").text("开始对战").exists()){
                className("android.view.View").text("开始对战").findOne().click();
                }
              sleep(3000);
              if (className("android.widget.Button").text("知道了").exists() || className("android.view.View").text("温馨提示").exists() || className("android.view.View").text("您已超过今日对战次数，请明日再来。").exists() ){
                 console.log("今日已完成30次对战，请明日再来");
                 back();sleep(1000);
                 back();sleep(1000);
                 back();sleep(1000);
              if (id("my_display_name").exists()){//我的主页，再退一步回主页
                back();sleep(1000);}//单纯back有概率退出但又有可能只退到我的页面 故加判断
               return;
             }
              sleep(3000);
            }
            console.warn("第" + zNum.toString() + "轮开始...")
         }
     if (/*textContains("距离答题结束").exists() &&*/ !text("继续挑战").exists()){//20201225界面变化 距离答题结束 删除
        zsyQuestionLoop();
        }
    }
}

/**
 * @description: 四人赛 双人对战答题循环
 * @param: null
 * @return: null
 */
 //循环1 基于延时进行题目刷新做题，4+0.3秒，结束偶尔故障;20201022修改为基于前后题目判断
function zsyQuestionLoop() {
    let ClickAnswer;
 try{//20201025使用try catch(e)语句处理错误，去除前后置0.5s延时   
  if (!className("RadioButton").exists() || className("android.view.View").text("继续挑战").exists() || textContains("继续挑战").exists() /*|| !textContains("距离答题结束").exists()*/){//不存在本局结束标志 继续挑战，则执行  20201225界面变化，距离答题结束 删除
     /*console.info("答题结束!");*/ //配合20201225界面变化 距离答题结束 去除，本语句去除
     return;
  }else {
    while(!className("RadioButton").exists());//@KB64ba建议使用while判断
    if (className("RadioButton").exists() || aquestion.length == 0) {
        /*sleep(300);*/
        var aquestion = className("ListView").findOnce().parent().child(0).text();
        var question = aquestion.substring(3);//争上游和对战题目前带1.2.3.需去除
        while (aquestion == oldaquestion || question == "") {
         /*sleep(800);*/
         if (!className("RadioButton").exists() || className("android.view.View").text("继续挑战").exists() || textContains("继续挑战").exists()) {	
         console.info("答题结束!");
         return;
         }else if(className("RadioButton").exists()){
         aquestion = className("ListView").findOnce().parent().child(0).text();
         question = aquestion.substring(3);
         }
        }
      }else {
        console.error("提取题目失败!");
        let listArray = className("ListView").findOnce().children();//题目选项列表
        let i = random(0, listArray.length - 1);
        console.log("随机点击");
        listArray[i].child(0).click();//随意点击一个答案
        ClickAnswer = listArray[i].child(0).child(1).text();//记录已点击答案
        console.log("随机点击:"+ClickAnswer);
        return;
      }
      var chutiIndex = question.lastIndexOf("出题单位");//@chongyadong添加
    if (chutiIndex != -1) {
        question = question.substring(0, chutiIndex - 2);
      }
      question = question.replace(/\s/g, "");
    var options = [];//选项列表
   if (className("RadioButton").exists()) {
        className("ListView").findOne().children().forEach(child => {
            var answer_q = child.child(0).child(1).text();
            options.push(answer_q);
        });
    }else {
        console.error("答案获取失败!");
        return;
    }
  if (aquestion != oldaquestion){
     if (question == ZiXingTi.replace(/\s/g, "") || question == DuYinTi.replace(/\s/g, "") || question == ErShiSiShi.replace(/\s/g, "")) {
      question = question + options[0].substring(3);//字形题 读音题 二十四史 在题目后面添加第一选项，选项带A.去除               
                }
      console.log(aquestion.substring(0,2) + "题目:" + question);
    var answer = getAnswer(question, 'tikuNet');
    console.info("答案：" + answer);
     if (/^[a-zA-Z]{1}$/.test(answer)) {//如果为ABCD形式
        var indexAnsTiku = indexFromChar(answer.toUpperCase());
        answer = options[indexAnsTiku];
        toastLog("answer from char=" + answer);
      }
    let hasClicked = false;
    let listArray = className("ListView").findOnce().children();//题目选项列表
   /* if (answer == "")*/ //如果没找到答案
      if(answer.length ==0){
        let i = random(0, listArray.length - 1);
        console.error("没有找到答案，随机点击");
        listArray[i].child(0).click();//随意点击一个答案
        hasClicked = true;
        ClickAnswer = listArray[i].child(0).child(1).text();;//记录已点击答案
        console.log("随机点击:"+ClickAnswer);
        console.log("---------------------------");
       }else{//如果找到了答案 该部分问题: 选项带A.B.C.D.，题库返回答案不带，char返回答案带
        var answer_a = answer.substring(0,2);//定义answer_a，获取答案前两个字符对比A.B.C.D.应该不会出现E选项
        if(answer_a == "A." || answer_a == "B." || answer_a == "C." || answer_a =="D."){
            listArray.forEach(item => {
            var listDescStrb = item.child(0).child(1).text();
            if (listDescStrb == answer) {
                item.child(0).click();//点击答案
                hasClicked = true;
                console.log("---------------------------");
              }
            });
          }else{
           listArray.forEach(item => {
            var listDescStra = item.child(0).child(1).text();
            var listDescStrb = listDescStra.substring(3);//选项去除A.B.C.D.再与answer对比
            if (listDescStrb == answer) {
                item.child(0).click();//点击答案
                hasClicked = true;
                
                console.log("---------------------------");
             }
           });
        }
     }
    if (!hasClicked)//如果没有点击成功
     {
        console.error("未能成功点击，随机点击");
        let i = random(0, listArray.length - 1);
        listArray[i].child(0).click();//随意点击一个答案
        ClickAnswer = listArray[i].child(0).child(1).text();;//记录已点击答案
        console.log("随机点击:"+ClickAnswer);
        console.log("---------------------------");
     }
   }
    oldaquestion = aquestion;
    /*sleep(500);*/
  }
  //sleep(3500);//后置3.5延时与前置0.5构成4s延时
 }catch (e){
     sleep(3000);
   if (!className("RadioButton").exists() || className("android.view.View").text("继续挑战").exists() || textContains("继续挑战").exists() /*|| !textContains("距离答题结束").exists()*/){//不存在本局结束标志 继续挑战，则执行  
     /*console.info("答题结束!");*/ //配合20201225界面变化 距离答题结束 删除，本语句删除
     return;
    }
  }
}

//循环2 基于上下题干进行判断题目是否已刷新 感谢ivan-cn
function zsyQuestionLoop1() {
    //sleep(1000);
    let ClickAnswer;
    if (!className("RadioButton").exists() || className("android.view.View").text("继续挑战").exists() || textContains("继续挑战").exists() /*|| !textContains("距离答题结束").exists()*/){//不存在本局结束标志 继续挑战，则执行  
    /* console.info("答题结束!");*/
      return;
    }else {
        while (!className("RadioButton").exists());//@KB64ba建议使用while判断
        if (className("RadioButton").exists() || aquestion.length == 0) {
            var aquestion = className("ListView").findOnce().parent().child(0).text();
            var question = aquestion.substring(3);//争上游和对战题目前带1.2.3.需去除
            //找题目，防出错      
            while (aquestion == oldaquestion || question == "") {
                sleep(800);
                if (!className("RadioButton").exists() || className("android.view.View").text("继续挑战").exists() || textContains("继续挑战").exists()) {	
                    console.info("答题结束!");
                    return;
                }
                //找题目 
                aquestion = className("ListView").findOnce().parent().child(0).text();
                question = aquestion.substring(3);
            }
            //           
        }else {
            console.error("提取题目失败!");
            let listArray = className("ListView").findOnce().children();//题目选项列表
            let i = random(0, listArray.length - 1);
            console.log("随机点击");
            listArray[i].child(0).click();//随意点击一个答案
            return;
        }
        var chutiIndex = question.lastIndexOf("出题单位");//@chongyadong添加
        if (chutiIndex != -1) {
            question = question.substring(0, chutiIndex - 2);
        }
        question = question.replace(/\s/g, "");
        var options = [];//选项列表
        if (className("RadioButton").exists()) {
            className("ListView").findOne().children().forEach(child => {
                var answer_q = child.child(0).child(1).text();
                options.push(answer_q);
            });
        }else {
            console.error("答案获取失败!");
            return;
        }
        //
        if (aquestion != oldaquestion) {
            reg = /.*择词语的正确.*/g // 正则判断是否为字形
            if (reg.test(question)) {
                //log(options)
                var optionStr = options;
                for (i in optionStr) {//替换搜索用的数组
                    optionStr[i] = options[i].substring(3);
                }
                var optionStr = options.join("");
                question = question + optionStr;//Ivan-cn原版代码，会造成搜题失败，不掐头去尾正确率更高 后续：该部分应当配合题库使用
                /*question = question.substr(1);//开头删除一个字
                question = question.substr(0, question.length - 1);//结尾删除一个字，增加搜索的准确率
            }else {
                question = question.substr(1);//开头删除一个字
                question = question.substr(0, question.length - 1);*/ //结尾删除一个字，增加搜索的准确率
            }
            console.log(aquestion.substring(0, 2) + "题目:" + question);
             if (question == ZiXingTi.replace(/\s/g, "") || question == DuYinTi.replace(/\s/g, "")|| question == ErShiSiShi.replace(/\s/g, "")) {
                question = question + options[0].substring(3);//字形题 读音题 在题目后面添加第一选项，选项带A.去除               
                }
            var answer = getAnswer(question, 'tikuNet');
              console.info("答案：" + answer);
            if (/^[a-zA-Z]{1}$/.test(answer)) {//如果为ABCD形式
                var indexAnsTiku = indexFromChar(answer.toUpperCase());
                answer = options[indexAnsTiku];
                toastLog("answer from char=" + answer);
            }
            let hasClicked = false;
            let listArray = className("ListView").findOnce().children();//题目选项列表
            /* if (answer == "")*/ //如果没找到答案
            if (answer.length == 0) {
                let i = random(0, listArray.length - 1);
                console.error("没有找到答案，随机点击");
                listArray[i].child(0).click();//随意点击一个答案
                hasClicked = true;
                ClickAnswer = listArray[i].child(0).child(1).text();;//记录已点击答案
                console.log("随机点击:"+ClickAnswer);
                console.log("---------------------------");
            }
            else//如果找到了答案
            {//该部分问题: 选项带A.B.C.D.，题库返回答案不带，char返回答案带
                var answer_a = answer.substring(0, 2);//定义answer_a，获取答案前两个字符对比A.B.C.D.应该不会出现E选项
                if (answer_a == "A." || answer_a == "B." || answer_a == "C." || answer_a == "D.") {
                    listArray.forEach(item => {
                        var listDescStrb = item.child(0).child(1).text();
                        if (listDescStrb == answer) {
                            item.child(0).click();//点击答案
                            hasClicked = true;
                            console.log("---------------------------");
                        }
                    });
                }else {
                    listArray.forEach(item => {
                        var listDescStra = item.child(0).child(1).text();
                        var listDescStrb = listDescStra.substring(3);//选项去除A.B.C.D.再与answer对比
                        if (listDescStrb == answer) {
                            item.child(0).click();//点击答案
                            hasClicked = true;
                            console.log("---------------------------");
                        }
                    });
                }
            }
            if (!hasClicked)//如果没有点击成功
            {
                console.error("未能成功点击，随机点击");
                let i = random(0, listArray.length - 1);
                listArray[i].child(0).click();//随意点击一个答案
                console.log("---------------------------");
            }
        }
        //旧题目
        oldaquestion = aquestion;
        sleep(1000);
    }
}

/**
 * @description: 挑战答题
 * @param: null
 * @return: null
 */
function challengeQuestion() {
     while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
    id("home_bottom_tab_button_work").findOne().click();//点击主页正下方的"学习"按钮
    sleep(2000);
    text("我的").click();
    if (!textContains("我要答题").exists()) {
      sleep(1000);
      click("我要答题");
      }else {
      (!text("我要答题").exists());
      sleep(1000);
      text("我要答题").findOne().parent().click();
      }
    if(!textContains("答题练习").exists()){
     while (!text("答题练习").exists());//排行榜 答题竞赛
     sleep(1000);
     className("android.view.View").text("答题练习").findOne().parent().child(10).click();
    }else{
     while (!text("挑战答题").exists());
     sleep(1000);
     text("挑战答题").click();//原流程，20200910改版，ver2.14不会自动更新，因可以判断故保留。
    }
    console.log("开始挑战答题")
    sleep(4000);
    let conNum = 0;//连续答对的次数
    let lNum = 1;//轮数
    while (true) {
        challengeQuestionLoop(conNum);
        sleep(4000);
        if (text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" +
            "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC").exists() || text("再来一局").exists())//遇到❌号，则答错了,不再通过结束本局字样判断
        {//该部分修改，逻辑为a：>=5题，失败则结束挑战答题返回主界面;b0：<5题，第一次失败，分享复活；b1：分享复活再次失败，仍<5题，需再来一局；b2：分享复活再次失败，已>5题，结束挑战答题返回主界面
            sleep(2000);
            if (lNum >= lCount && conNum >= qCount) {
                console.log("挑战答题结束！返回主页！");
                if(textContains("结束本局").exists()){
                /*在分享页面回退4次返回主页*/
                 back();sleep(1000);
                 back();sleep(1000);
                 back();sleep(1000);
                 back();sleep(1000);
                }else{
                /*在本局结束页面回退3次返回主页*/
                 back();sleep(1000);
                 back();sleep(1000);
                 back();sleep(1000);
                    }
                break;
            }else if(textContains("分享就能复活").exists() || textContains("每周仅可复活一次").exists()){
                console.log("分享复活...")
                sleep(1000);
                click("分享就能复活");
                sleep(2000);
                console.info("分享成功!");
                back();//返回答题界面
                sleep(4000);
            }else {
                console.log("等3秒开始下一轮...")
                sleep(3000);//等待3秒开始下一轮
                text("再来一局").click();
                sleep(4000);
                if (conNum >= qCount) {
                    lNum++;
                }
                conNum = 0;
            }
            console.warn("第" + (lNum+1).toString() + "轮开始...")
        }
        else//答对了
        {
            conNum++;
        }
    }
}

/**
 * @description: 挑战答题循环
 * @param: conNum 连续答对的次数
 * @return: null
 */
function challengeQuestionLoop(conNum) {
    let ClickAnswer;//定义已点击答案
    if (conNum >= qCount)//答题次数足够退出，每轮qCount=5+随机1-3次
    {
        let listArray = className("ListView").findOnce().children();//题目选项列表
        let i = random(0, listArray.length - 1);
        console.log("本轮答题数足够，随机点击答案");
        var question = className("ListView").findOnce().parent().child(0).text();
        question = question.replace(/\s/g, "");
        var options = [];//选项列表
       if (className("ListView").exists()) {
         className("ListView").findOne().children().forEach(child => {
            var answer_q = child.child(0).child(1).text();
            options.push(answer_q);
          });
        }else {
        console.error("答案获取失败!");
        return;
        }//20201217添加 极低概率下，答题数足够，下一题随机点击，碰到字形题
        if (question == ZiXingTi.replace(/\s/g, "") || question == DuYinTi.replace(/\s/g, "") || question == ErShiSiShi.replace(/\s/g, "")) {
         question = question + options[0];//字形题 读音题 在题目后面添加第一选项               
                }
        console.log((conNum + 1).toString() + ".随机点击题目：" + question);
        sleep(random(0.5, 1)*500);//随机延时0.25-0.5秒
        listArray[i].child(0).click();//随意点击一个答案
        ClickAnswer = listArray[i].child(0).child(1).text();;//记录已点击答案
        console.log("随机点击:"+ClickAnswer);
        //如果随机点击答案正确，则更新到本地题库tiku表
       sleep(500);//等待0.5秒，是否出现X
       if (!text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" +
            "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC").exists() || text("再来一局").exists())//遇到❌号，则答错了,不再通过结束本局字样判断
        {console.info("更新本地题库答案...");
          checkAndUpdate(question, answer, ClickAnswer);
        }
        console.log("---------------------------");
        return;
    }
    if (className("ListView").exists()) {
        var question = className("ListView").findOnce().parent().child(0).text();
    }
    else {
        console.error("提取题目失败!");
        let listArray = className("ListView").findOnce().children();//题目选项列表
        let i = random(0, listArray.length - 1);
        console.log("随机点击");
        sleep(random(0.5, 1)*500);//随机延时0.25-0.5秒
        listArray[i].child(0).click();//随意点击一个答案
        return;
    }
    var chutiIndex = question.lastIndexOf("出题单位");
    if (chutiIndex != -1) {
        question = question.substring(0, chutiIndex - 2);
    }
    question = question.replace(/\s/g, "");
    var options = [];//选项列表
    if (className("ListView").exists()) {
        className("ListView").findOne().children().forEach(child => {
            var answer_q = child.child(0).child(1).text();
            options.push(answer_q);
        });
    }else {
        console.error("答案获取失败!");
        return;
    }
    if (question == ZiXingTi.replace(/\s/g, "") || question == DuYinTi.replace(/\s/g, "") || question == ErShiSiShi.replace(/\s/g, "")) {
      question = question + options[0];//字形题 读音题 在题目后面添加第一选项               
                }
    console.log((conNum + 1).toString() + "搜库题目：" + question);
    var answer = getAnswer(question, 'tikuNet');
    console.info("答案：" + answer);
    if (/^[a-zA-Z]{1}$/.test(answer)) {//如果为ABCD形式
        var indexAnsTiku = indexFromChar(answer.toUpperCase());
        answer = options[indexAnsTiku];
        console.log("answer from char=" + answer);
        //ABCD形式转换为字符串答案;
        var sql = "UPDATE tikuNet SET answer='" + answer + "' WHERE question LIKE '" + question + "'";
        insertOrUpdate(sql);
        console.warn("答案已转换，下次尝试验证");
        
    }
    let hasClicked = false;
    let listArray = className("ListView").findOnce().children();//题目选项列表
    if (answer == "")//如果没找到答案
    {
        let i = random(0, listArray.length - 1);
        console.error("没有找到答案，随机点击");
        sleep(random(0.5, 1)*500);//随机延时0.25-0.5秒
        listArray[i].child(0).click();//随意点击一个答案
        ClickAnswer = listArray[i].child(0).child(1).text();;//记录已点击答案
        hasClicked = true;
        console.log("随机点击:"+ClickAnswer);//如果随机点击答案正确，则更新到本地题库tiku表
       sleep(500);//等待0.5秒，是否出现X
       if (!text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" +
            "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC").exists() || text("再来一局").exists())//遇到❌号，则答错了,不再通过结束本局字样判断
        {console.info("更新本地题库答案...");
          checkAndUpdate(question, answer, ClickAnswer);
        }
        console.log("---------------------------");
    }
    else//如果找到了答案
    {
        listArray.forEach(item => {
            let listDescStr = item.child(0).child(1).text();
            if (listDescStr == answer) {
                sleep(random(0.5, 1)*500);//随机延时0.25-0.5秒
                item.child(0).click();//点击答案
                hasClicked = true;
                sleep(500);//等待0.5秒，是否出现X
              if (!text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" +
            "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC").exists() || text("再来一局").exists())//遇到❌号，则答错了,不再通过结束本局字样判断
             {console.info("题库答案正确……");}
              if (text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" +
            "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC").exists() || text("再来一局").exists())//遇到❌号，则答错了,不再通过结束本局字样判断
              {console.error("题库答案错误!!!");
              var sql = "UPDATE tikuNet SET answer='" + null + "' WHERE question LIKE '" + question + "'";
                insertOrUpdate(sql);
                console.warn("删除答案");
                sleep(2000);
               }
                console.log("---------------------------");
            }
        });
    }
    if (!hasClicked)//如果没有点击成功
    {//因导致不能成功点击问题较多，故该部分不更新题库，大部分问题是题库题目适配为填空题或多选题或错误选项
        console.error("未能成功点击，随机点击");
        let i = random(0, listArray.length - 1);
        sleep(random(0.5, 1)*500);//随机延时0.25-0.5秒
        listArray[i].child(0).click();//随意点击一个答案
        console.log("随机点击:"+ClickAnswer);
        sleep(500);//等待0.5秒，是否出现X
       if (!text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" +
            "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC").exists() || text("再来一局").exists())//遇到❌号，则答错了,不再通过结束本局字样判断
        {console.info("随机点击正确……");}
       if (text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" +
            "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC").exists() || text("再来一局").exists())//遇到❌号，则答错了,不再通过结束本局字样判断
        {console.error("随机点击错误!!!");
               /*checkAndUpdate(question, answer, ClickAnswer);*/
               }
       console.log("---------------------------");
    }
}

/**
 * @description: 判断题库是否存在
 * @param: null
 * @return: null
 */
function judge_tiku_existence() {
    let dbName = "tiku.db";//题库文件名
    let path = files.path(dbName);
    if (!files.exists(path)) {
        //files.createWithDirs(path);
        console.error("未找到题库！请将题库文件放置与js文件同一目录下再运行！");
        return false;
    }
    var db = SQLiteDatabase.openOrCreateDatabase(path, null);
    var createTable = "\
    CREATE TABLE IF NOT EXISTS tikuNet(\
    question CHAR(253),\
    answer CHAR(100)\
    );";
    db.execSQL(createTable);
    return true;
}

/**
 * @description: 从数据库中搜索答案
 * @param: question 问题
 * @return: answer 答案
 */
function getAnswer(question, table_name) {
    let dbName = "tiku.db";//题库文件名
    let path = files.path(dbName);
    var db = SQLiteDatabase.openOrCreateDatabase(path, null);
    sql = "SELECT answer FROM " + table_name + " WHERE question LIKE '" + question + "%'"
    var cursor = db.rawQuery(sql, null);
    if (cursor.moveToFirst()) {
        var answer = cursor.getString(0);
        cursor.close();
        return answer;
    }
    else {
        console.error("题库中未找到答案");
        cursor.close();
        return '';
    }
}

/**
 * @description: 增加或更新数据库
 * @param: sql
 * @return: null
 */
function insertOrUpdate(sql) {
    let dbName = "tiku.db";
    let path = files.path(dbName);
    if (!files.exists(path)) {
        //files.createWithDirs(path);
        console.error("未找到题库!请将题库放置与js同一目录下");
    }
    var db = SQLiteDatabase.openOrCreateDatabase(path, null);
    // db.beginTransaction();//数据库开始事务
    db.execSQL(sql);
    // db.endTransaction();//数据结束事务
    db.close();
}

/*************************************************每日答题/每周答题部分***************************************************/

/**
 * @description: 每日答题
 * @param: null
 * @return: null
 */
function dailyQuestion() {
    while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
    id("home_bottom_tab_button_work").findOne().click();//点击主页正下方的"学习"按钮
    sleep(2000);
    text("我的").click();
    if (!textContains("我要答题").exists()) {
     sleep(1000);
     click("我要答题");
    }else {
     (!text("我要答题").exists());
    sleep(1000);
    text("我要答题").findOne().parent().click();
      }
    while (!text("每日答题").exists());
    sleep(1000);
    text("每日答题").click();
    console.log("开始每日答题")
    sleep(2000);
    let dlNum = 0;//每日答题轮数
    while (true) {
        dailyQuestionLoop();
        /*dailyQuiz();*/
        if (text("再来一组").exists()) {
            sleep(2000);
            dlNum++;
            if (!text("领取奖励已达今日上限").exists()) {
                text("再来一组").click();
                console.warn("第" + (dlNum + 1).toString() + "轮答题:");
                sleep(1000);
            }else {
                console.log("每日答题结束！返回主页！")
                text("返回").click();sleep(500);
                back();sleep(1000);
                back();sleep(1000);
                break;
            }
        }
    }
}


/**
 * @description: 每周答题
 * @param: null
 * @return: null
 */
function weeklyQuestion() {
    var dw = device.width;
    var dh = device.height;
    text("我的").click();
    if (!textContains("我要答题").exists()) {
     sleep(1000);
     click("我要答题");
    }else {
     (!text("我要答题").exists());
    sleep(1000);
    text("我要答题").findOne().parent().click();
      }
    /*while (!textContains("我要答题").exists());
    sleep(1000);
    click("我要答题");*/
    while (!text("每周答题").exists());
    sleep(1000);
    text("每周答题").click();
    console.log("开始每周答题")
    //sleep(2000);
    //text("未作答").click();

    //翻页点击每周作答
    //let sublist = className("ListView").findOnce(0);//控件错误，用swipe划，7.0以下可能错误
    let i = 0;//参考订阅的翻页，只进行一次点击
    while (i < 1) {
        if (text("未作答").exists()) {
            text("未作答").click();
            i++;
        }else if (text("您已经看到了我的底线").exists()) {
            console.log("没有可作答的每周答题了,退出!!!")
            back();sleep(1000);
            back();sleep(1000);
            back();sleep(1000);
            return;
        }else {
            sleep(1000);
            swipe(dw/3*2, dh/6*5, dw/3*2, dh/6, 500);//往下翻（纵坐标从5/6处滑到1/6处）
            //console.log("滑动查找未作答的每周答题")
        }
    }
    ////翻页点击每周作答

    let dlNum = 0;//每日答题轮数
    while (true) {
        sleep(1000)
        while (!(textStartsWith("填空题").exists() || textStartsWith("多选题").exists() || textStartsWith("单选题").exists())) {
            console.error("没有找到题目！请检查是否进入答题界面！");
            sleep(2000);
        }
        dailyQuestionLoop();
        if (text("再练一次").exists()) {
            console.log("每周答题结束，返回！")
            text("返回").click();sleep(2000);
            back();sleep(1000);
            back();sleep(1000);
            while (!textContains("我要答题").exists()) {
                back();sleep(1000);
            }
            break;
        }else if (text("查看解析").exists()) {
            console.log("每周答题结束！")
            back();sleep(500);
            back();sleep(500);
            break;
        }else if (text("再来一组").exists()) {
            sleep(2000);
            dlNum++;
            if (!text("领取奖励已达今日上限").exists()) {
                text("再来一组").click();
                console.warn("第" + (dlNum + 1).toString() + "轮答题:");
                sleep(1000);
            }
            else {
                console.log("每周答题结束，返回！")
                text("返回").click();sleep(2000);
                while (!textContains("我要答题").exists()) {
                    console.log("专项答题结束，返回！")
                    back();sleep(1000);
                }
                back();sleep(1000);
                break;
            }
        }
    }
    //回退返回主页 
    while (!id("home_bottom_tab_button_work").exists()) {
        back();
        sleep(500);
    }
}

/**
 * @description: 专项答题
 * @param: null
 * @return: null
 */
function specialQuestion() {
    var dw = device.width;
    var dh = device.height;
    text("我的").click();
    if (!textContains("我要答题").exists()) {
     sleep(1000);
     click("我要答题");
    }else {
     (!text("我要答题").exists());
    sleep(1000);
    text("我要答题").findOne().parent().click();
      }
    /*while (!textContains("我要答题").exists());
    sleep(1000);
    click("我要答题");*/
    while (!text("专项答题").exists());
    sleep(1000);
    text("专项答题").click();
    console.log("开始专项答题")
    sleep(2000);
    /*
       if(text("继续答题").exists())
       {
             text("继续答题").click();
       }else{
             text("开始答题").click();
       }
    */

    //翻页点击专项答题
    let i = 0;
    while (i < 1) {
        if (text("继续答题").exists()) {
            text("继续答题").click();
            i++;
            //console.log("1471")
        }else if (text("开始答题").exists()) {
            text("开始答题").click();
            i++;
            //console.log("1474")
        }else if (text("您已经看到了我的底线").exists()) {
            console.log("没有可作答的专项答题了,退出!!!")
            back();sleep(1000);
            back();sleep(1000);
            back();sleep(1000);
            return;
        }else if (text("已过期").exists()) {
            console.log("存在已过期的专项答题,无法作答，退出!!!")
            back();
            sleep(2000);
            back();sleep(1000);
            back();sleep(1000);
            return;
        }else {
            sleep(1000);
            swipe(dw/3*2, dh/6*5, dw/3*2, dh/6, 500);//往下翻（纵坐标从5/6处滑到1/6处）
            sleep(1000);
            console.log("滑动查找未作答的专项答题")
        }
    }
    ////翻页点击专项答题

    let dlNum = 0;//每日答题轮数
    while (true) {
        sleep(1000)
        while (!(textStartsWith("填空题").exists() || textStartsWith("多选题").exists() || textStartsWith("单选题").exists())) {
            console.error("没有找到题目！请检查是否进入答题界面！");
            sleep(2000);
        }
        dailyQuestionLoop();
        if (text("再练一次").exists()) {
            console.log("专项答题结束！")
            text("返回").click();sleep(2000);
            back();
            break;
        }else if (text("查看解析").exists()) {
            console.log("专项答题结束，返回！")
            back();sleep(500);
            back();sleep(500);
            back();sleep(1000);
            while (!textContains("我要答题").exists()) {
                back();sleep(1000);
            }
            break;
        }else if (text("再来一组").exists()) {
            sleep(2000);
            dlNum++;
            if (!text("领取奖励已达今日上限").exists()) {
                text("再来一组").click();
                console.warn("第" + (dlNum + 1).toString() + "轮答题:");
                sleep(1000);
            }
            else {
                console.log("专项答题结束，返回！")
                sleep(2000);
                while (!textContains("专项答题").exists()) {
                    console.log("专项答题结束，返回！")
                    back();sleep(1000);
                }
                back();sleep(1000);
                break;
            }
        }
    }
    //回退返回主页 
    while (!id("home_bottom_tab_button_work").exists()) {
        back();
        sleep(500);
    }
}

/**
 * @description: 在答题选项画✔，用于各项答题部分
 * @param: x,y 坐标
 * @return: null
 */
// function drawfloaty(x, y) {
//     //floaty.closeAll();
//     var window = floaty.window(
//         <frame gravity="center">
//             <text id="text" text="✔" textColor="red" />
//         </frame>
//     );
//     window.setPosition(x, y - 45);
//     return window;
// }

/**
 * @description: 每日每周专项答题循环
 * @param: null
 * @return: null
 */
function dailyQuestionLoop() {
    var dw = device.width;
    var dh = device.height;
    var blankArray = [];
    var question = "";
    var answer = "";
    if (textStartsWith("填空题").exists()) {
        var questionArray = getFitbQuestion();
        questionArray.forEach(item => {
        if (item != null && item.charAt(0) == "|") {//是空格数
            blankArray.push(item.substring(1));
        }else {//是题目段
            question += item;
        }
    });
     question = question.replace(/\s/g, "");
     console.log("题目：" + question);
     var ansTiku = getAnswer(question, 'tikuNet');
     answer = ansTiku.replace(/(^\s*)|(\s*$)/g, "");
   if (answer == "") {//答案空，前面题库未找到答案,找提示
            var tipsStr = getTipsStr();
            answer = getAnswerFromTips(questionArray, tipsStr);
            console.info("提示答案：" + answer);
            setText(0, answer.substr(0, blankArray[0]));
            if (blankArray.length > 1) {
                for (var i = 1;i < blankArray.length;i++) {
                    setText(i, answer.substr(blankArray[i - 1], blankArray[i]));
                }
              }
           checkAndUpdate(question, ansTiku, answer);
       }else {//答案非空，题库中已找到答案
            console.info("答案：" + answer);
            setText(0, answer.substr(0, blankArray[0]));
            if (blankArray.length > 1) {
                for (var i = 1;i < blankArray.length;i++) {
                    setText(i, answer.substr(blankArray[i - 1], blankArray[i]));
                }
        }
    }
   }
    else if (textStartsWith("多选题").exists() || textStartsWith("单选题").exists()) {
        var questionArray = getChoiceQuestion();
        questionArray.forEach(item => {
        if (item != null && item.charAt(0) == "|") {//是空格数
            blankArray.push(item.substring(1));
        }else {//是题目段
            question += item;
        }
    });
     var options = [];//选项列表
     if (className("ListView").exists()) {//选择题提取答案，为字形题 注音题准备
        className("ListView").findOne().children().forEach(child => {
            var answer_q = child.child(0).child(2).text();//此处child(2)为去除选项A.的选项内容，与争上游不同
            options.push(answer_q);
        });
       }else {
        console.error("答案获取失败!");
        return;
     }
    question = question.replace(/\s/g, "");
    if (question == ZiXingTi.replace(/\s/g, "") || question == DuYinTi.replace(/\s/g, "") || question == ErShiSiShi.replace(/\s/g, "")) {
      question = question + options[0];//字形题 读音题 在题目后面添加第一选项                
                }
    console.log("题目：" + question);
    var ansTiku = getAnswer(question, 'tikuNet');
   answer = ansTiku.replace(/(^\s*)|(\s*$)/g, "");
   if (answer == "") {
            var tipsStr = getTipsStr();
            answer = clickByTips(tipsStr);
            console.info("提示中的答案：" + answer);
            if (text("单选题").exists()){//仅单选题更新题库，多选题不更新进题库
             checkAndUpdate(question, ansTiku, answer);
           }
        }else {
            console.info("答案：" + ansTiku);
            sleep(random(0.5, 1)*500);//随机延时0.25-0.5秒
            clickByAnswer(answer);
        }
   }
   sleep(random(0.5, 1)*500);//随机延时0.25-0.5秒
    if (text("确定").exists()) {//每日每周答题
        text("确定").click();
        sleep(random(0.5, 1)*500);//随机延时0.25-0.5秒
    }else if (text("下一题").exists()) {//专项答题
            text("下一题").click();
            sleep(random(0.5, 1)*500);//随机延时0.25-0.5秒
     }else if (text("完成").exists()) {//专项答题最后一题
            text("完成").click();
            sleep(random(0.5, 1)*500);//随机延时0.25-0.5秒
      }else{
        console.warn("未找到右上角按钮，尝试根据坐标点击");
        click(dw * 0.85, dh * 0.06);//右上角确定按钮，根据自己手机实际修改
        console.warn("请手动处理");
        sleep(5000);
    }
   console.log("---------------------------");
    sleep(2000);
}


/**
 * @description: 获取填空题题目数组
 * @param: null
 * @return: questionArray
 */
function getFitbQuestion() {
    var questionCollections = className("EditText").findOnce().parent().parent();
    var questionArray = [];
    var findBlank = false;
    var blankCount = 0;
    var blankNumStr = "";
    var i = 0;
    questionCollections.children().forEach(item => {
        if (item.className() != "android.widget.EditText") {
            if (item.text() != "") {//题目段
                if (findBlank) {
                    blankNumStr = "|" + blankCount.toString();
                    questionArray.push(blankNumStr);
                    findBlank = false;
                }
                questionArray.push(item.text());
            }else {
                findBlank = true;
                /*blankCount += 1;*/
                blankCount = (className("EditText").findOnce(i).parent().childCount() -1);
                i++;
            }
        }
    });
    return questionArray;
}


/**
 * @description: 获取选择题题目数组
 * @param: null
 * @return: questionArray
 */
function getChoiceQuestion() {
    var questionCollections = className("ListView").findOnce().parent().child(1);
    var questionArray = [];
    questionArray.push(questionCollections.text());
    return questionArray;
}


/**
 * @description: 获取提示字符串
 * @param: null
 * @return: tipsStr
 */
function getTipsStr() {
    var dw = device.width;
    var dh = device.height;
    var tipsStr = "";
    while (tipsStr == "") {
        if (text("查看提示").exists()) {
            var seeTips = text("查看提示").findOnce();
            seeTips.click();
            sleep(1000);
            click(dw * 0.5, dh * 0.41);
            sleep(1000);
            click(dw * 0.5, dh * 0.35);
        }else {
            console.error("未找到查看提示");
        }
        if (text("提示").exists()) {
            var tipsLine = text("提示").findOnce().parent();
            //获取提示内容
            var tipsView = tipsLine.parent().child(1).child(0);
            tipsStr = tipsView.text();
            //关闭提示
            tipsLine.child(1).click();
            break;
        }
        sleep(1000);
    }
    return tipsStr;
}


/**
 * @description: 从提示中获取填空题答案
 * @param: questionArray, tipsStr
 * @return: ansTips
 */
function getAnswerFromTips(questionArray, tipsStr) {
    var ansTips = "";
    for (var i = 1;i < questionArray.length -1;i++) {
        if (questionArray[i].charAt(0) == "|") {
            var blankLen = questionArray[i].substring(1);
            var indexKey = tipsStr.indexOf(questionArray[i + 1]);
            var ansFind = tipsStr.substr(indexKey - blankLen, blankLen);
            /*ansTips += ansFind;*/
            ansTips = ansTips.concat(ansFind);
        }
    }
    return ansTips;
}

/**
 * @description: 根据提示点击选择题选项
 * @param: tipsStr
 * @return: clickStr
 */
function clickByTips(tipsStr) {
    var clickStr = "";
    var isFind = false;
    if (className("ListView").exists()) {
        var listArray = className("ListView").findOne().children();
        listArray.forEach(item => {
            var ansStr = item.child(0).child(2).text();
            if (tipsStr.indexOf(ansStr) >= 0) {
                item.child(0).click();
                clickStr += item.child(0).child(1).text().charAt(0);
                isFind = true;
            }
        });
        if (!isFind) {//没有找到 点击第一个
            listArray[0].child(0).click();
            clickStr += listArray[0].child(0).child(1).text().charAt(0);
        }
    }
    return clickStr;
}


/**
 * @description: 根据答案点击选择题选项
 * @param: answer
 * @return: null
 */
function clickByAnswer(answer) {
    if (className("ListView").exists()) {
        var listArray = className("ListView").findOnce().children();
        listArray.forEach(item => {
            var listIndexStr = item.child(0).child(1).text().charAt(0);
            //单选答案为非ABCD
            var listDescStr = item.child(0).child(2).text();
            if (answer.indexOf(listIndexStr) >= 0 || answer == listDescStr) {
                item.child(0).click();
            }
        });
    }
}

/**
 * @description: 检查答案是否正确，并更新数据库
 * @param: question, ansTiku, answer
 * @return: null
 */
function checkAndUpdate(question, ansTiku, answer) {
    var dw = device.width;
    var dh = device.height;
    if (className("Button").desc("下一题").exists() || className("Button").desc("完成").exists()) {//答错了
        swipe(100, dh - 100, 100, 100, 500);
        var nCout = 0
        while (nCout < 5) {
            if (descStartsWith("正确答案").exists()) {
                var correctAns = descStartsWith("正确答案").findOnce().desc().substr(5);
                console.info("正确答案是：" + correctAns);
                if (ansTiku == "") {//题库为空则插入正确答案                
                    var sql = "INSERT INTO tikuNet (question, answer) VALUES (?, ?)";
                }else {//更新题库答案
                    var sql = "UPDATE tikuNet SET answer='" + correctAns + "' WHERE question LIKE '" + question + "'";
                }
                insertOrUpdate(sql);
                console.info("更新题库答案...");
                sleep(1000);
                break;
            }else {
                var clickPos = className("android.webkit.WebView").findOnce().child(2).child(0).child(1).bounds();
                click(clickPos.left + dw * 0.13, clickPos.top + dh * 0.1);
                console.error("未捕获正确答案，尝试修正");
            }
            nCout++;
        }
        if (className("Button").exists()) {
            className("Button").findOnce().click();
        }else {
            click(dw * 0.85, dh * 0.06);
        }
    }else {//正确后进入下一题，或者进入再来一局界面
        if (ansTiku == "" && answer != "") {//正确进入下一题，且题库答案为空              
            // var sql = "INSERT INTO tikuNet VALUES ('" + question + "','" + answer + "','')";
            var sql = "INSERT INTO tikuNet (question, answer) VALUES (?, ?)";
            insertOrUpdate(sql);
            console.info("更新题库答案");
        }
    }
}
