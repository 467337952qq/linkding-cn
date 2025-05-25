
<div align="center">
    <br>
    <a href="https://github.com/sissbruecker/linkding">
        <img src="assets/header.svg" height="50">
    </a>
    <br>
</div>

## 简介

linkding 是一款可自行托管的书签管理器，其设计理念为极简、快速且易于通过 Docker 进行设置。

而现在这个是一个汉化文件包，主要的是linkdingdata_HGYc7.zip  这个文件包，其他的都是旧的源码文件

他的，所有介绍，在这里：https://deepwiki.com/467337952qq/linkding-cn/4.1-bookmark-views
其名称来源于：
- *link*（在日常用语中常作为 URL 和书签的同义词）
- *Ding*（德语中意为“事物”）
- ……因此从根本上来说，它是用于管理链接的工具

**功能概述：**
- 为可读性优化的简洁用户界面
- 通过标签整理书签
- 批量编辑、Markdown 笔记、稍后阅读功能
- 与其他用户或访客共享书签
- 自动获取书签网站的标题、描述和图标
- 自动存档网站，可保存为本地 HTML 文件或存至互联网档案馆
- 以 Netscape HTML 格式导入和导出书签
- 可作为渐进式 Web 应用（PWA）安装
- 支持 [Firefox](https://addons.mozilla.org/firefox/addon/linkding-extension/) 和 [Chrome](https://chrome.google.com/webstore/detail/linkding-extension/beakmhbijpdhipnjhnclmhgjlddhidpe) 浏览器扩展及书签工具
- 通过 OIDC 或身份验证代理支持单点登录（SSO）
- 提供用于开发第三方应用的 REST API
- 支持用户自助服务和原始数据访问的管理面板

**演示地址：** https://demo.linkding.link/

**屏幕截图：**

![屏幕截图](/docs/public/linkding-screenshot.png?raw=true "屏幕截图")

## 快速入门

以下链接可帮助您快速上手 linkding：
- [在您自己的服务器上安装 linkding](https://linkding.link/installation) 或 [查看托管选项](https://linkding.link/managed-hosting)
- [安装浏览器扩展](https://linkding.link/browser-extension)
- [查看社区项目](https://linkding.link/community)，其中包括移动应用、浏览器扩展、库等

## 文档

完整文档现已在 [linkding.link](https://linkding.link/) 提供。

如果您想为文档做出贡献，可以在 `docs` 文件夹中找到源文件。

如果您想贡献社区项目，欢迎[提交拉取请求](https://github.com/sissbruecker/linkding/edit/master/docs/src/content/docs/community.md)。

## 贡献

我们始终欢迎小规模的改进、错误修复和文档完善。如果您想贡献较大的功能，建议先打开一个问题进行讨论。对于与项目目标不一致或我不想维护的功能，我可能会忽略相关拉取请求。

## 开发

该应用程序使用 Django 网络框架构建。您可以通过查看优秀的 [Django 文档](https://docs.djangoproject.com/en/4.1/) 开始开发。`bookmarks` 文件夹包含实际的书签应用程序。除此之外，代码应该是自解释的/标准的 Django 内容 🙂。

### 先决条件
- Python 3.12
- Node.js

### 设置

为应用程序创建一个虚拟环境（https://docs.python.org/3/tutorial/venv.html）：
```
python3 -m venv ~/environments/linkding
```
为您的 shell 激活环境：
```
source ~/environments/linkding/bin/activate[.csh|.fish]
```
在激活的环境中，从应用程序文件夹安装应用程序依赖项：
```
pip3 install -r requirements.txt -r requirements.dev.txt
```
安装前端依赖项：
```
npm install
```
初始化数据库：
```
mkdir -p data
python3 manage.py migrate
```
为前端创建用户：
```
python3 manage.py createsuperuser --username=joe --email=joe@example.com
```
使用以下命令启动 Node.js 开发服务器（用于编译标签自动完成等 JavaScript 组件）：
```
npm run dev
```
使用以下命令启动 Django 开发服务器：
```
python3 manage.py runserver
```
前端现在可在 http://localhost:8000 访问。

### 测试

使用 pytest 运行所有测试：
```
make test
```

### 格式化

使用 black 格式化 Python 代码，使用 prettier 格式化 JavaScript 代码：
```
make format
```

### DevContainers

本存储库还支持 DevContainers：[![在远程容器中打开](https://img.shields.io/static/v1?label=Remote%20-%20Containers&message=Open&color=blue&logo=visualstudiocode)](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/sissbruecker/linkding.git)

检出后，只需执行以下命令即可开始：

为前端创建用户：
```
python3 manage.py createsuperuser --username=joe --email=joe@example.com
```
使用以下命令启动 Node.js 开发服务器（用于编译标签自动完成等 JavaScript 组件）：
```
npm run dev
```
使用以下命令启动 Django 开发服务器：
```
python3 manage.py runserver
```
前端现在可在 http://localhost:8000 访问。
