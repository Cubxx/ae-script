# ae-script

一些自制 AE 脚本

## 安装

有 2 种安装方式：

### 使用 [setup.ps1](setup.ps1)（建议）

这是一个辅助安装的 PowerShell 脚本，它用于将本仓库脚本下载至对应本地路径。

可单独使用。

### 直接下载

单击 [脚本列表](#脚本列表) 内的链接，注意有些脚本还需要下载依赖。

把脚本文件放到对应安装路径中，见 [脚本类型](#脚本类型)。

参考：

-   https://helpx.adobe.com/cn/after-effects/using/scripts.html
-   https://www.baidu.com/s?wd=如何安装ae脚本

## 脚本类型

本仓库有 3 种脚本类型，不同类型分别对应不同安装路径。

|       脚本名 | 安装路径                                  |
| -----------: | :---------------------------------------- |
| _\*.lib.jsx_ | `./Support Files/Scripts/Startup`         |
|  _\*.ui.jsx_ | `./Support Files/Scripts/ScriptUI Panels` |
|     _\*.jsx_ | `./Support Files/Scripts`                 |

## 脚本列表

有些脚本还需要下载安装依赖。

| 脚本                                | 依赖 | 描述                                              |
| ----------------------------------- | ---- | ------------------------------------------------- |
| _[cubx.lib.jsx](dist/cubx.lib.jsx)_ |      | 封装了一些常用模块：文件系统、UI 构建、工具函数等 |

## json2.jsx

来自：https://github.com/douglascrockford/JSON-js

# UI 脚本

## Toolbox.jsx

个人工具箱

## LayerSaver.jsx

图层存储，目前支持：形状层、文本层

> 依赖模块：json2.jsx

# 普通脚本
