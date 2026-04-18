/* 此组件保存user信息 
store.dispatch('saveUserInfo', user); */

import { createStore } from 'vuex'
import { getLocalUser } from '@/utils/auth'
export default createStore({
  state() {
    return {
        user: getLocalUser('local-user', {
            userId: -1,
            userName: "张三",
            userGender: "male",
            userUniversity: "",
            userMajor: "",
            userInformation: ""
        })
    }
  },
  mutations: {
    UPDATE_USER(state, payload) {
      state.user = { ...state.user, ...payload };
      localStorage.setItem('local-user', JSON.stringify(state.user));
    }
  },
  actions: {
    async saveUserInfo({ commit }, userData) {
      // 
      commit('UPDATE_USER', userData)
      return true
    }
  },
  getters: {
    getUser: state => state.user,
  }
})