# 创建新页面的步骤

## 复制模板文件

```
templates/page-template.html → {newpage}.html
```
修改 **\<title>** 和 **\<section id="{newpage}">**

## 创建数据文件

- data/zh/{newpage}.json
- data/en/{newpage}.json

## 添加导航链接 （如需要）
在 data/zh/common.json 和 data/en/common.json 的 navbar.links 中添加
```json
"links": [
    ...
    { "text": "{newpage}", "href": "{newpage}.html" },
    ...
]
```