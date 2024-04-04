// Check for any missing settings by uncomment
// import en from '../en';
// const translation: typeof en = {
const translation = {
  translation: {
    app: {
      name: 'Bedrock Claude Chat',
      inputMessage: '请输入',
    },
    deleteDialog: {
      title: '删除确认',
      content: '您确定要删除聊天 "<Bold>title</Bold>" 吗？',
    },
    clearDialog: {
      title: '删除确认',
      content: '是否删除所有聊天记录?',
    },
    languageDialog: {
      title: '切换语言',
    },
    button: {
      newChat: '新的聊天',
      SaveAndSubmit: '保存并提交',
      resend: '重新发送',
      regenerate: '重新生成',
      delete: '删除',
      deleteAll: '全部删除',
      ok: '确定',
      cancel: '取消',
      menu: '菜单',
      language: '切换语言',
      clearConversation: '清除所有对话',
      signOut: '退出登录',
    },
    error: {
      answerResponse: '在回答时发生了错误。',
      notFoundConversation: '由于指定的聊天不存在，因此显示了新的聊天窗口。',
      notFoundPage: '找不到您要查找的页面。',
      predict: {
        general: '在预测时发生了错误。',
        invalidResponse: '收到了意外的回应。',
      },
    },
  },
};

export default translation;
