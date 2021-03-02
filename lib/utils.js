const ora = require('ora')
const chalk = require('chalk')
const shell = require('shelljs')

/**
 * 彩色打印
 * @param {string} content 打印内容
 * @param {string} color 打印内容的颜色
 */
function colourLog(content, color = 'green') {
  console.log(chalk[color](content))
}

/**
 * 睡眠函数
 * @param {number} n 睡眠多久 毫秒
 */
async function sleep(n) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, n)
  })
}

// loading计数器
let loadingCount = 0

/**
 * 加载loading函数
 * @param {function} fn 执行的异步函数
 * @param {*} loadingMasg loading时打印的信息
 * @param {*} successMsg 成功后打印的信息
 * @param {*} errMsg 失败后打印的信息
 * @param  {...any} params 异步函数的参数
 */
async function wrapLoading(fn, loadingMasg, successMsg, errMsg, ...params) {
  const spinner = ora(chalk.yellowBright(loadingMasg))
  spinner.start()
  try {
    const repos = await fn(...params)
    spinner.succeed(chalk.green(successMsg)) // 成功
    return repos
  } catch (error) {
    spinner.fail(chalk.red(errMsg))
    loadingCount++
    if (loadingCount > 5) {
      return
    }
    await sleep(1000)
    return wrapLoading(fn, loadingMasg, successMsg, errMsg, ...params)
  }
}

/**
 * 初始化git
 */
function gitInit (projectName) {
  shell.cd(projectName);
  if (!shell.which('git')) {
      shell.echo('请检查本机git环境是否正常');
      shell.exit(1);
  } else {
      shell.exec('git init')
      shell.exec('git add .')
      shell.exec('git commit -m "init"')
  }
}

const spawn = async (...args) => {
  const { spawn } = require('child_process')
  return new Promise(resolve => {
    const proc = spawn(...args)
    proc.stdout.pipe(process.stdout)
    proc.stderr.pipe(process.stderr)
    proc.on('close', () => {
      resolve()
    })
  })
}

/**
 * 依赖包安装
 */
async function npmInstall (projectName) {
  colourLog('🔨安装依赖中...','yellow')
  await spawn('npm', ['install'], { cwd: `./${projectName}` })
  console.log(`=====安装完成=====`)
}

module.exports = {
  colourLog,
  sleep,
  wrapLoading,
  gitInit,
  npmInstall,
  spawn,
}