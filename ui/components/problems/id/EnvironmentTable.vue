<template>
  <v-data-table
    :headers="headers"
    :items="environments"
    :search="!!search ? search : ''"
    :sort-by="sortBy"
    :items-per-page="itemsPerPage"
    :footer-props="{ 'items-per-page-options': [10, 20, 30, -1] }"
    :hide-default-footer="isPlayer"
    :disable-sort="environments.length <= 1"
    :mobile-breakpoint="0"
    dense
    multi-sort
    class="elevation-2 text-no-wrap"
  >
    <template v-slot:top>
      <v-text-field
        v-if="isStaff"
        v-model="search"
        label="Search"
        append-icon="mdi-table-search"
        autofocus
        clearable
        single-line
        hide-details
        class="mt-0 py-1 px-2"
      />
    </template>

    <!-- ボタン -->
    <template v-slot:item.action="{ item }">
      <environment-modal :item="item" :problem="problem">
        <template v-slot:activator="{ on }">
          <v-btn icon x-small @click="on">
            <v-icon small>mdi-pen</v-icon>
          </v-btn>
        </template>
      </environment-modal>

      <countdown-delete-button
        :item="item"
        :submit="deleteEnvironment"
        btn-class="ml-4"
      >
        <ul class="black--text">
          <li>問題: {{ problem.displayTitle }}</li>
          <li>チーム: {{ item.displayName || '共通' }}</li>
          <li>種類: {{ item.service }}</li>
          <li>名前: {{ item.name }}</li>
        </ul>
      </countdown-delete-button>
    </template>

    <!-- チーム -->
    <template v-slot:item.team.displayName="{ value }">
      <template v-if="!!value">
        {{ value }}
      </template>
      <template v-else>
        <v-icon small>mdi-link-variant</v-icon>
        共通
      </template>
    </template>

    <!-- パスワード -->
    <template v-slot:item.password="{ value }">
      <v-row align="center" class="flex-nowrap">
        <v-btn
          v-clipboard:copy="value"
          v-clipboard:success="onCopySuccess"
          v-clipboard:error="onCopyError"
          :disabled="isMarkdown(value)"
          icon
          small
        >
          <v-icon>mdi-clipboard-text-outline</v-icon>
        </v-btn>

        <markdown v-if="isMarkdown(value)" :content="value" dense />
        <div v-else class="text-truncate" style="max-width: 8em">
          {{ value }}
        </div>
      </v-row>
    </template>

    <!-- ポート -->
    <template v-slot:item.port="{ value }">
      <template v-if="!!value">
        {{ value }}
      </template>
    </template>

    <!-- チーム -->
    <template v-slot:item.team="{ value }">
      <v-icon v-if="!!value" small>mdi-check</v-icon>
    </template>

    <!-- 運営用メモ -->
    <template v-slot:item.secretText="{ value }">
      <markdown :content="value" dense />
    </template>

    <!-- コピーボタン -->
    <template v-slot:item.copy="{ item }">
      <v-tooltip
        top
        open-delay="500"
        content-class="pa-0 elevation-8 opacity-1"
      >
        <template v-slot:activator="{ on }">
          <v-btn
            v-clipboard:copy="item.copyText.text"
            v-clipboard:success="onCopySuccess"
            v-clipboard:error="onCopyError"
            :disabled="!item.copyText.text"
            icon
            small
            v-on="on"
          >
            <v-icon>mdi-clipboard-text-outline</v-icon>
          </v-btn>

          {{
            item.copyText.display ? item.copyText.display : item.copyText.text
          }}
        </template>

        <v-card v-if="item.copyText.tooltip">
          <v-card-text class="black--text">
            {{ item.copyText.tooltip }}
          </v-card-text>
        </v-card>
      </v-tooltip>
    </template>
  </v-data-table>
</template>
<script>
import orm from '~/orm'

import CountdownDeleteButton from '~/components/commons/CountdownDeleteButton'
import EnvironmentModal from '~/components/misc/EnvironmentModal'
import Markdown from '~/components/commons/Markdown'

export default {
  name: 'EnvironmentTable',
  components: {
    CountdownDeleteButton,
    EnvironmentModal,
    Markdown,
  },
  props: {
    problem: {
      type: Object,
      required: true,
    },
    environments: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      search: undefined,
    }
  },
  computed: {
    itemsPerPage() {
      return this.isPlayer ? -1 : 10
    },
    sortBy() {
      return this.isStaff ? ['team.number'] : []
    },
    headers() {
      const commons = [
        { text: '種類', value: 'service' },
        { text: '名前', value: 'name' },
        { text: '便利コピー', value: 'copy' },
        { text: 'パスワード', value: 'password' },
        { text: 'ホスト', value: 'host' },
        { text: 'ポート', value: 'port' },
        { text: 'ユーザー', value: 'user' },
      ]

      if (this.isStaff) {
        return [
          { text: 'action', value: 'action', sortable: false },
          { text: 'チーム名', value: 'team.displayName' },
          { text: '状態', value: 'status' },
          ...commons,
          { text: '更新時刻', value: 'updatedAtSimple' },
          { text: '運営用メモ', value: 'secretText' },
        ]
      } else {
        return [
          { text: 'チーム専用', value: 'team', align: 'center', class: 'pr-0' },
          ...commons,
        ]
      }
    },
  },
  methods: {
    onCopySuccess(event) {
      // 長すぎると通知が画面いっぱいになるので適当にカット
      let text = event.text.replace(/[\n\r]/g, ' ')
      text = this.stringTruncate(text, 100)

      this.notifyInfo({
        message: `コピーしました\n${text}`,
        timeout: 3000,
      })
    },
    onCopyError(e) {
      this.notifyWarning({ message: 'コピーに失敗しました' })
    },

    isMarkdown(str) {
      // 無いよりまし
      // [hoge](path)があればMarkdownとして判断する
      return /\[.*\]\(.*\)/.test(str)
    },

    async deleteEnvironment(item) {
      await orm.Mutations.deleteProblemEnvironment({
        action: '接続情報削除',
        params: { problemEnvironmentId: item.id },
      })
    },
  },
}
</script>
