export default defineAppConfig({
  pages: [
    'pages/create/index',
    'pages/templates/index',
    'pages/drafts/index',
    'pages/mine/index',
    'pages/template-detail/index',
    'pages/export-preview/index',
    'pages/export-history/index',
    'pages/favorites/index',
    'pages/feedback/index'
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#FAF7F2',
    navigationBarTitleText: '短句手账',
    navigationBarTextStyle: 'black',
    backgroundColor: '#FAF7F2'
  },
  tabBar: {
    color: '#9C958D',
    selectedColor: '#8B7355',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/create/index',
        text: '创作'
      },
      {
        pagePath: 'pages/templates/index',
        text: '模板'
      },
      {
        pagePath: 'pages/drafts/index',
        text: '草稿'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
