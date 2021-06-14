console.show();
log("检查更新...");
var r = http.get("https://www.lynuo.cn:449/xxqg-ds.html");
if(r.statusCode != 200){ 
    log("更新失败"); exit();
}
else{
    var update = r.body.string();
    if (update != "ds01") {
        alert("检测到有更新 "+update, "检测到新版本，请前往\n https://www.lynuo.cn:449 \n 下载新版本！\n");
    }
    else{
        log("已是最新版本");
}
}
//--------------检查更新软件：来源为萘落小站--------------//


/**
 */
function updateTikunet() {
    console.show();
    var dbName = "tiku.db"; //文件路径
    var path = files.path(dbName);  //确保文件存在
    var url = "https://www.lynuo.cn:449/tiku.db";
    var res = http.get(url);
    
    log(path);
          if(res.statusCode != 200){
            toast("请求失败");exit();
        }
        files.writeBytes(path, res.body.bytes());
        toast("更新成功");
    console.hide();
}
//updateTikunet();
exports = updateTikunet();