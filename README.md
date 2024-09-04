# ae-script

一些自制 AE 脚本

## 安装

有 2 种安装方式：

### 使用 [setup.ps1](setup.ps1)（建议）

这是一个辅助安装的 PowerShell 脚本，它用于将本仓库脚本下载至对应本地路径。

- 网络安装（只需联网）
- 本地安装（需要下载整个仓库）

### 直接下载

单击 [脚本列表](#脚本列表) 内的链接，把脚本文件放到对应安装路径中，见 [脚本类型](#脚本类型)。

参考：

- https://helpx.adobe.com/cn/after-effects/using/scripts.html
- https://www.baidu.com/s?wd=如何安装ae脚本

## 脚本类型

本仓库有 2 种脚本类型，不同类型分别对应不同安装路径。

|      脚本名 | 安装路径                                  |
| ----------: | :---------------------------------------- |
|    _\*.jsx_ | `./Support Files/Scripts`                 |
| _\*.ui.jsx_ | `./Support Files/Scripts/ScriptUI Panels` |

<!-- | _\*.lib.jsx_ | `./Support Files/Scripts/Startup`         | -->

## 脚本列表

| 原版                                    | 压缩版                                          | 描述         |
| --------------------------------------- | ----------------------------------------------- | ------------ |
| _[toolbox.ui.jsx](dist/toolbox.ui.jsx)_ | _[toolbox.ui.min.jsx](dist/toolbox.ui.min.jsx)_ | 自制工具面板 |

## 最佳实践

- [文档](https://docs.yuelili.com/#/post/Ae/scripting/zh/General/Application.md)
- [工具库](https://raymondclr.github.io/Soil/modules/soil.html)
