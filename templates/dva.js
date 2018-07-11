import * as {{=it.name}} from '../../services/{{=it.path}}/{{=it.name}}';

export default {
  namespace: '{{=it.name}}',

  state: {

  },

  effects: {
    async fetch({ payload }, { put, call, select }) {
      await call({{=it.name}}.fetch, payload);
    }
  },

  reducers: {
    test(state, { payload }) {
      return { ...state, ...payload };
    },
  }
}
