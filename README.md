# 超强 Scratch 3 作品分析器 （EPSA）

简体中文 | [English](README-InEnglish.md)

它可以分析Scratch 3项目，并且获取关于积木数量的信息、内部扩展源代码和扩展信息（TurboWarp）、角色、造型、声音、变量、列表和函数的数量；等等。

你甚至可以把这份报告导出为SVG、PNG、JPG、Markdown （Base 64编码）！

---

## 网站

在  [Scratch 作品分析器](https://clyain.netlify.app/epsa/)  上查看可视化的页面以及更多的功能

<img src='screenshot.png'></img>
*注：这个源代码只是这个网站的一部分，并且功能没有它的多。*

<img src='EPSIS Ver.0.5.1_17.sb3 - EPSA 分析报告.svg'></img>
*注：作者已经很尽量地去还原HTML的显示效果了。*



---

## 在你的网站中使用

#### 准备

如需引用，请在明显的位置介绍作者（我）的信息。

将文件夹`Analyzer`里面的资源下载好；当然除了 `index.html` ，不过它可以为你提供一些参考。

就像 `index.html` 一样：
然后，你需要在你的作品中引用这些JavaScript文件，就像这样：

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<script src="main.js"></script>
<script src="LoadExtensionsSource.js"></script>
<script src="GetExtensionsInfo.js"></script>
<script src="Stats.js"></script>`
```

> 备注:
> `index.html` 这一行实现文件的上传：
>
> ```html
> <input type="file" id="fileInput" accept=".sb3">
> ```
>
> `main.js` 这一行实现事件监听：
>
> ```javascript
> document.getElementById('fileInput').addEventListener('change', function (e) {
>    const file = e.target.files[0];  // 获取选中的第一个文件
>    if (!file) return;
>    // ...
> });
> ```

#### 获取值的方式

在 `main.js` 这个文件中，你需要在几乎末尾的位置找到这几行代码：

```javascript
//完成
//完成
//完成
```

这里已经完成所有的统计任务了，你可以在之后通过以下代码获取关于这个作品的信息：

1. 获取总共的积木数量：`stats.BlocksNum`；
2. 获取有效的积木数量：`stats.TrueBlocksNum`；
3. 总积木段数：`stats.PilesNum`；
4. 有效积木段数：`stats.TruePilesNum` ；
5. 函数定义数量：`stats.FuncDefinitions`；
6. 变量定义数量：`variableCount()`；
7. 列表定义数量：`listCount()`；
8. 造型数量：`costumeCount()` ；
9. 声音数量：`soundCount()`；
10. 文件大小（单位：MB）：`fileSizeMB`；
11. 作品内部的`project.json`文件：`ProjectData`；
12. 作品使用的拓展：`ProjectExtensions`；
13. 不同类别积木的数量：`stats.BlocksNumInType`；
14. 使用拓展的积木数量：`stats.ExtBlocksNumInType`。
