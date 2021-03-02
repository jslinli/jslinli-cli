## 需要的第三方库

```
// 终端样式库
chalk
// 参数解析 例如--help
commander
// 命令行交互
inquirer
// 从git拉模板
download-git-repo
// fs操作扩展
fs-extra
// 日志输出
log-symbols
// 加载图标
ora
// 读取所有文件 实现模板渲染
metalsmith
// 统一模板引擎
consolidate
// 检测npm名字取的对不对
```

## 脚手架搭建过程

- 创建可执行的脚本 #! /usr/bin/env node
- 配置package.json中的bin字段
- npm link 链接到本地环境
    - link 命令相当于将当前本地模块链接到npm目录下，这个npm目录可以直接访问，所有当前包就可以直接访问了
