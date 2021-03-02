const { promisify } = require('util')
const path = require('path')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const downloadGitRepo = require('download-git-repo')
const logSymbols = require('log-symbols')
const chalk = require('chalk')
const shell = require('shelljs')
const ncp = require('ncp')
const Metalsmith = require('metalsmith') // 遍历文件夹是否需要渲染
const { render } = require('consolidate').ejs // 统一了模板引擎
const { fetchRepoList } = require('./request')
const { wrapLoading, npmInstall, gitInit, colourLog, spawn } = require('./utils')
const { name, downloadDirectory, repoUser, templateHeader } = require('./constants')

// 项目package.json信息询问
const promptList = (name) => [
  {
    type: 'input',
    name: 'name',
    message: '请输入项目名称?',
    default: name,
  },
  {
    type: 'input',
    name: 'version',
    message: '请输入项目版本?',
    default: '1.0.0',
  },
  {
    type: 'confirm',
    name: 'private',
    message: '此项目是否为私有项目?',
    default: true,
  },
  {
    type: 'input',
    name: 'author',
    message: '请输入项目作者?',
  },
  {
    type: 'input',
    name: 'description',
    message: '请输入项目描述?',
  },
  {
    type: 'input',
    name: 'license',
    message: '请输入项目许可证?',
    default: 'ISO',
  }
]

class Creator {
  constructor(name, targetDir) {
    this.name = name
    this.target = targetDir
    this.downloadGitRepo = promisify(downloadGitRepo)
    this.ncp = promisify(ncp)
    this.render = promisify(render)
  }

  async fetchRepo() {
    let repos = await wrapLoading(fetchRepoList, '正在拉取项目模板...', '模板拉取成功', '拉取模板失败')
    if(repos) {
      repos = repos.filter(repo => repo.name.startsWith(templateHeader))
    }
    if (!repos) return
    repos = repos.map(item => item.name)
    const { repo } = await inquirer.prompt({
      name: 'repo',
      type: 'list',
      message: '请选择一个模板创建项目',
      choices: repos,
    })
    return repo
  }

  async downloadTemplate(repo) {
    // 拼接下载路径
    const requestUrl = `${repoUser}/${repo}#main`
    const dest = `${downloadDirectory}/${repo}`
    // 将资源下载到某个路径（增加缓存） 先下载到系统目录中，稍后使用ejs，handlerbar 渲染模板 最后生成结果再写入
    if (fs.existsSync(dest)) {
      // 有缓存优先读取缓存
      return dest
    }
    try {
      const err = await wrapLoading(this.downloadGitRepo, '正在下载模板...', '模板下载成功', '模板下载失败', requestUrl, dest)
      if (!err) {
        return dest
      }
    } catch (error) {
      console.log(logSymbols.error, chalk.red('模板项目请求失败，请重试'))
      process.exit(1)
    }
  }

  async compileTemplate(downloadUrl) {
    // 1）让用户填写信息
    // 2）根据用户信息去渲染模板
    await new Promise((resolve, reject) => {
      Metalsmith(__dirname) // 如果传入路径 默认会遍历当前路径下的src文件夹
      .source(downloadUrl) // 要遍历文件的路径
      .destination(path.resolve(this.name)) // 将文件拷贝到这个目录下
      .use(async(files, metal, done) => {
        // 弹框询问用户
        const result = await inquirer.prompt(promptList(this.name))
        const meta = metal.metadata()
        Object.assign(meta, result)
        done()
      })
      .use(async(files, metal, done) => {
        Reflect.ownKeys(files).forEach(async file => {
          // 要处理的文件
          if (file.includes('js') || file.includes('json') || file.includes('html')) {
            let content = files[file].contents.toString() // 文件的内容
            if (content.includes('<%') && content.includes('%>')) {
              const meta = metal.metadata()
              content = await render(content, meta)
              files[file].contents = Buffer.from(content) // 渲染的结果
            }
          }
        })
        done()
      })
      .build(err => {
        if (err) {
          reject()
        } else {
          resolve()
        }
      })
    })
  }

  // 真实创建项目
  async create() {
    // 1. 先去拉取模板
    const repo = await this.fetchRepo()

    // 2. 下载
    const downloadUrl = await this.downloadTemplate(repo)

    if (!downloadUrl) {
      console.log(logSymbols.error, '模板下载失败，请重试')
      process.exit(1)
    }

    // 简单模板直接拷贝
    // this.ncp(downloadUrl, path.resolve(this.name))

    // 3. 编译模板 metalsmith
    await this.compileTemplate(downloadUrl)

    // 4. 自动安装依赖
    await npmInstall(this.name)

    // 5. 创建git
    gitInit(this.name)

    // 打印项目创建成功
    console.log(`👍项目创建成功
    To get Start:
    ==================================
        cd ${chalk.cyan(this.name)}
        npm start/yarn start
    ==================================
      `)
  }
}

module.exports = Creator
