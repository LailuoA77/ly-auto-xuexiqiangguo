let url = "https://www.lynuo.cn:449/main.js";
let res = http.get(url);                
if(res.statusCode = 200){
    files.writeBytes(files.path("main.js"), res.body.bytes());
    toastLog("更新成功");
    }
    exit();