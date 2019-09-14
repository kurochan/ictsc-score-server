import Vue from 'vue'
import { mapGetters, mapMutations } from 'vuex'

// 各コンポーネントで多用するメソッドをmixinする
// やりすぎ注意

Vue.mixin({
  filters: {
    tickDuration(sec, format) {
      if (sec >= 0) {
        // eslint-disable-next-line no-undef
        return $nuxt.$moment.utc(sec * 1000).format(format)
      } else {
        // eslint-disable-next-line no-undef
        return '-' + $nuxt.$moment.utc(-sec * 1000).format(format)
      }
    }
  },
  computed: {
    ...mapGetters('session', [
      'currentTeamId',
      'isStaff',
      'isAudience',
      'isPlayer',
      'isNoLogin'
    ])
  },
  methods: {
    ...mapMutations('notification', [
      'addNotification',
      'notifySuccess',
      'notifyInfo',
      'notifyWarning',
      'notifyError'
    ]),

    currentDateTimeString() {
      return this.$moment(new Date()).format('MM-DD HH:mm:ss')
    },

    download(type, filename, data) {
      const blob = new Blob([data], { type })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = filename
      link.click()
    },

    // sort
    sortByCode(list) {
      return this.$_.sortBy(list, 'code')
    },
    sortByOrder(list) {
      return this.$_.sortBy(list, 'order')
    },
    sortByNumber(list) {
      return this.$_.sortBy(list, 'number')
    },
    // 古い順
    sortByCreatedAt(list) {
      return this.$_.sortBy(list, e => Date.parse(e.createdAt))
    },
    sortByUpdatedAt(list) {
      return this.$_.sortBy(list, e => Date.parse(e.updatedAt))
    },

    // filter
    findOlder(records) {
      if (records.length === 0) {
        return null
      }

      // mixはanswersが[]の場合-Inifnityになる
      return this.$_.min(records, record => new Date(record.createdAt))
    },
    findNewer(records) {
      if (records.length === 0) {
        return null
      }

      // maxはanswersが[]の場合-Inifnityになる
      return this.$_.max(records, record => new Date(record.createdAt))
    },

    findEffectAnswer(answers) {
      // TODO: 予選はとりあえずこれ
      return this.findNewer(answers)
    }
  }
})
