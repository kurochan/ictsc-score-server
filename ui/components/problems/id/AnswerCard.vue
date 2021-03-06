<template>
  <expandable-card v-model="opened" color="white">
    <!-- カードの帯 -->
    <template v-slot:button>
      <v-row align="center">
        <v-col cols="4">
          <span v-if="!realtimeGrading && isPlayer"> 提出済 </span>
          <span v-else>
            <template v-if="answer.hasPoint">
              <v-icon v-if="answer.solved" small> mdi-check-bold </v-icon>
              得点 {{ answer.point }} ({{ answer.percent }}%)
            </template>
            <template v-else-if="isStaff"> 未採点 </template>
            <template v-else> 採点中 </template>
          </span>
        </v-col>

        <v-col cols="4">
          <div v-if="answer.showTimer(problem)">
            {{ answer.delayTickDuration }}
          </div>
        </v-col>

        <v-col cols="4">
          <!-- 提出時刻 -->
          <p class="text-right caption mb-0">
            提出時刻: {{ answer.createdAtShort }}
          </p>
        </v-col>
      </v-row>
    </template>

    <!-- 採点フォーム -->
    <template v-if="isStaff">
      <grading-form :answer="answer" :problem="problem" class="px-2" />
    </template>

    <!-- 解答本体 -->
    <template v-if="problem.modeIsTextbox">
      <!-- Markdown ↔ Raw 切り替えボタン -->
      <v-row class="px-2">
        <v-spacer />
        <v-btn
          :color="textboxAsMarkdown ? 'primary' : undefined"
          text
          icon
          large
          class="always-active-color"
          @click="textboxAsMarkdown = !textboxAsMarkdown"
        >
          <v-icon>mdi-language-markdown-outline</v-icon>
        </v-btn>
      </v-row>

      <markdown v-if="textboxAsMarkdown" :content="textboxContent" readonly />
      <raw-text v-else :content="textboxContent" class="pa-2" />
    </template>

    <answer-form-radio-button
      v-else-if="problem.modeIsRadioButton"
      v-model="answer.bodies"
      :candidates-groups="problem.candidates"
      readonly
      class="pb-2"
    />

    <answer-form-checkbox
      v-else-if="problem.modeIsCheckbox"
      v-model="answer.bodies"
      :candidates-groups="problem.candidates"
      readonly
      class="pb-2"
    />

    <template v-else> 未実装の問題タイプです </template>
  </expandable-card>
</template>
<script>
import { mapGetters } from 'vuex'

import AnswerFormRadioButton from '~/components/problems/id/AnswerFormRadioButton'
import AnswerFormCheckbox from '~/components/problems/id/AnswerFormCheckbox'
import ExpandableCard from '~/components/commons/ExpandableCard'
import GradingForm from '~/components/problems/id/GradingForm'
import Markdown from '~/components/commons/Markdown'
import RawText from '~/components/commons/RawText'

export default {
  name: 'AnswerCard',
  components: {
    AnswerFormCheckbox,
    AnswerFormRadioButton,
    ExpandableCard,
    GradingForm,
    Markdown,
    RawText,
  },
  props: {
    answer: {
      type: Object,
      required: true,
    },
    problem: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      opened: null,
      textboxAsMarkdown: true,
    }
  },
  computed: {
    ...mapGetters('contestInfo', ['realtimeGrading']),

    textboxContent() {
      return this.answer.bodies[0][0]
    },
  },
  created() {
    // dateではcomputed(isStaff)が使えない
    this.opened = this.isStaff && !this.answer.hasPoint
  },
}
</script>
