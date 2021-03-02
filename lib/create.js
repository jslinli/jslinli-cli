const path = require('path')
const { promisify } = require('util')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const figlet = promisify(require('figlet'))
const clear = require('clear')
const Creator = require('./Creator')
const { colourLog, wrapLoading } = require('./utils')

const projectList = [
  {
    name: 'action', // 选择完后的结果
    type: 'list', // 展示方式
    message: '是否需要覆盖当前文件夹?', // 提示信息
    choices: [ // 选项
      { name: '覆盖', value: 'overwrite' },
      { name: '取消', value: false },
    ]
  }
]

module.exports = async (name, options) => {
  // 清屏
  clear()
  // 打印欢迎界面
  const data = await figlet('Welcome yuqing-cli')
  colourLog(data)
  // 获取当前命令执行时的目录
  const cwd = process.cwd()
  // 得到目标目录
  const targetDir = path.join(cwd, name)

  // 如果目标目录存在
  if (fs.existsSync(targetDir)) {
    // 如果是强制模式
    if (options.force) {
      // 删除之前的目录
      // await fs.remove(targetDir)
      const err = await wrapLoading(fs.remove, '正在删除...', '删除成功', '删除失败', targetDir)
      if (err) {
        return
      }
    } else {
      // 提示用户是否需要覆盖
      const { action } = await inquirer.prompt(projectList)
      if (!action) {
        return
      } else if (action === 'overwrite') {
        const err = await wrapLoading(fs.remove, '正在删除...', '删除成功', '删除失败', targetDir)
        if (err) {
          return
        }
      }
    }
  }

  // 创建项目
  const creator = new Creator(name, targetDir)
  creator.create()
}
