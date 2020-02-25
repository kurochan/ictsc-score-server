export default {
  state() {
    return {
      competitionTime: [],
      gradingDelaySec: 0,
      resetDelaySec: 0,
      hideAllScore: false,
      realtimeGrading: false,
      textSizeLimit: 0,
      deleteTimeLimitSec: 0,
      guidePage: ''
    }
  },
  mutations: {
    // GraphQLでまとも手取得したContestInfoをstateに割り振る
    setContestInfo(state, contestInfo) {
      state.competitionTime = contestInfo.competitionTime.map(daterange =>
        daterange.map(date => new Date(date))
      )
      state.gradingDelaySec = contestInfo.gradingDelaySec
      state.resetDelaySec = contestInfo.resetDelaySec
      state.hideAllScore = contestInfo.hideAllScore
      state.realtimeGrading = contestInfo.realtimeGrading
      state.textSizeLimit = contestInfo.textSizeLimit
      state.deleteTimeLimitSec = contestInfo.deleteTimeLimitSec
      state.guidePage = contestInfo.guidePage
    }
  },
  actions: {
    async fetchContestInfo({ commit, dispatch }) {
      const query = `
        query ContestInfo {
          contestInfo {
            competitionTime
            gradingDelaySec
            resetDelaySec
            hideAllScore
            realtimeGrading
            textSizeLimit
            deleteTimeLimitSec
            guidePage
          }
        }
      `

      try {
        const res = await dispatch(
          'entities/simpleQuery',
          { query, bypassCache: true },
          { root: true }
        )

        commit('setContestInfo', res.contestInfo)
      } catch (error) {
        // セッションが無い、ネットワーク疎通がないなど
        console.info(error)
      }
    }
  },
  getters: {
    gradingDelaySec: state => state.gradingDelaySec,
    gradingDelayString: (state, getters) =>
      $nuxt.timeSimpleStringJp(getters.gradingDelaySec),
    resetDelaySec: state => state.resetDelaySec,
    resetDelayString: (state, getters) =>
      $nuxt.timeSimpleStringJp(getters.resetDelaySec),

    deleteTimeLimitSec: state => state.deleteTimeLimitSec,
    deleteTimeLimitMsec: state => state.deleteTimeLimitSec * 1000,
    deleteTimeLimitString: (state, getters) => {
      return getters.deleteTimeLimitSec < 60
        ? `${getters.deleteTimeLimitSec}秒`
        : `${Math.floor(getters.deleteTimeLimitSec / 60)}分`
    },

    competitionTime: state => state.competitionTime,
    competitionTimeString: (state, getters) => {
      return JSON.stringify(getters.competitionTime)
    },

    hideAllScore: state => state.hideAllScore,
    realtimeGrading: state => state.realtimeGrading,
    textSizeLimit: state => state.textSizeLimit,
    guidePage: state => state.guidePage
  }
}
