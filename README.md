-   [介绍](#介绍)
-   [模块](#模块)
    -   [cubx.jsx](#cubxjsx)
    -   [json2.jsx](#json2jsx)
-   [UI 脚本](#ui脚本)
    -   [Toolbox.jsx](#toolboxjsx)
    -   [LayerSaver.jsx](#layersaverjsx)
-   [普通脚本](#普通脚本)

---

# 介绍

本项目用于存储一些自制 AE 脚本

所有脚本放在**dist 文件夹**

这些脚本都需要模块: cubx.jsx，请到[lib](dist/lib)文件夹中自行下载安装

有些脚本还需要其他依赖模块，这些模板在[lib](dist/lib)文件夹均有提供

| 脚本类型              | 项目文件夹            | 本地文件夹                                |
| :-------------------- | :-------------------- | :---------------------------------------- |
| [模块](#模块)         | [lib](dist/lib)       | `.\Support Files\Scripts\Startup`         |
| [UI 脚本](#UI脚本)    | [UI](dist/UI)         | `.\Support Files\Scripts\ScriptUI Panels` |
| [普通脚本](#普通脚本) | [script](dist/script) | `.\Support Files\Scripts`                 |

# 模块

## cubx.jsx

封装了一些常用模块：文件系统、UI 构建、工具函数等

## json2.jsx

来自：https://github.com/douglascrockford/JSON-js

# UI 脚本

## Toolbox.jsx

个人工具箱

## LayerSaver.jsx

图层存储，目前支持：形状层、文本层

> 依赖模块：json2.jsx

# 普通脚本
