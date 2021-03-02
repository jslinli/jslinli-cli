const path = require('path')
const fs = require('fs-extra')
const { downloadDirectory } = require('./constants')
const { colourLog } = require('./utils')

module.exports = () => {
  if (!fs.existsSync(downloadDirectory)) {
    colourLog('暂无缓存模板', 'yellow')
    return
  }
  const dirContent = fs.readdirSync(downloadDirectory)
  console.log(dirContent)
}