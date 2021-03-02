const { name, version } = require('../package.json')

// 模板项目仓库用户名
const repoUser = 'jslinli'

// 模板头部名称
const templateHeader = 'yuqing'

// 模板存储的位置
const downloadDirectory = `${process.env[process.platform === 'darwin' ? 'HOME' : 'USERPROFILE']}/.yuqingrc`

module.exports = {
  name,
  version,
  downloadDirectory,
  repoUser,
  templateHeader,
}