const fs = require('fs-extra')
const { downloadDirectory } = require('./constants')
const { wrapLoading } = require('./utils')

module.exports = async (template) => {
  if (!template) {
    // 清空缓存模板
    await wrapLoading(fs.remove, '清空模板缓存中...', '清空成功', '清空失败', downloadDirectory)
    return
  }
  await wrapLoading(fs.remove, '正在删除...', '删除成功', '删除失败', `${downloadDirectory}/${template}`)
}