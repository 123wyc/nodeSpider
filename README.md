# nodeSpider
nodejs版本的爬虫，为了绕过验证环境，在windows机器上提前对目标网站完成登录操作，利用chrome可以暴露端口通过程序操作的特点，使用nodejs对浏览器操作。
需要手动安装环境
准备工作
使用puppeteer-core
连接已经打开的浏览器


安装node.js环境(略)
安装puppeteer-core以及mysql等依赖
npm init -f
npm i puppeteer-core
npm i mysql
npm i node-fetch
安装grpc和grpc-loader
npm i grpc
npm install @grpc/proto-loader


window环境: 选择chrome.exe->右键->[属性]->[快捷方式]->[目标]->"..\Application\chrome.exe" **--remote-debugging-port=9222 -- "%1"**->[确定]
