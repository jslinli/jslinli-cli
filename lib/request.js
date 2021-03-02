const axios = require('axios')
const { repoUser } = require('./constants')

axios.interceptors.response.use(res => {
  return res.data
})

// 请求仓库列表
const fetchRepoList = async () => {
  return axios.get(`https://api.github.com/users/${repoUser}/repos`)
}

module.exports = {
  fetchRepoList,
}
