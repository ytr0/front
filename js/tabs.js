import { boardInit } from './board.js';
import { downloadLocalStorage } from './storage.js';


export function loadTabs(tabs) {
    const tabBar = generateTabBar(tabs);
    const tabContents = generateTabContents(tabs);

    document.getElementById('tabBarContainer').appendChild(tabBar);
    document.getElementById('tabContentsContainer').appendChild(tabContents);
}

  // タブバーを生成する関数
  function generateTabBar(tabs) {
    const tabBar = document.createElement('div');
    tabBar.className = 'tab-bar';
  
    tabs.forEach(tabInfo => {
      const tabItem = document.createElement('div');
      tabItem.className = 'tab-item';
      tabItem.textContent = tabInfo.title;
      tabItem.onclick = () => activateTab(tabInfo.id);
      tabBar.appendChild(tabItem);
    });
  
    const plusBtn = document.createElement('div');
    plusBtn.className = 'plus-btn';
    plusBtn.textContent = '+';
    plusBtn.onclick = addNewTab;
    tabBar.appendChild(plusBtn);
  
    const dlBtn = document.createElement('div');
    dlBtn.className = 'dl-btn';
    dlBtn.textContent = '↓';
    dlBtn.onclick = downloadLocalStorage;
    tabBar.appendChild(dlBtn);
  
    return tabBar;
  }
  
  // タブコンテンツを生成する関数
  function generateTabContents(tabs) {
    const tabContents = document.createElement('div');
    tabContents.className = 'tab-contents';
  
    tabs.forEach(tabInfo => {
      const tabContent = document.createElement('div');
      tabContent.className = 'tab-content';
      tabContent.id = tabInfo.id;
      tabContent.textContent = tabInfo.content;
      tabContents.appendChild(tabContent);
    });
  
    return tabContents;
  }
  
  /*
  function activateTab(tabId) {
    tabs.forEach(tabInfo => {
      const tabContent = document.getElementById(tabInfo.id);
      //const tabItem = document.querySelector(`.tab-item[data-id="${tabInfo.id}"]`);
      if (tabInfo.id === tabId) {
        tabContent.classList.add('active');
       // tabItem.classList.add('active');
      } else {
        tabContent.classList.remove('active');
       // tabItem.classList.remove('active');
      }
    });
  }*/

  function activateTab(tabId) {
    /*tabs.forEach(tabInfo => {
      const tabContent = document.getElementById(tabInfo.id);
      //const tabItem = document.querySelector(`.tab-item[data-id="${tabInfo.id}"]`);
     
      if (tabInfo.id === tabId) {
        tabContent.classList.add('active');
       // tabItem.classList.add('active');
      } else {
        tabContent.classList.remove('active');
       // tabItem.classList.remove('active');
      }
    });*/
  
    const tabContent = document.getElementById("tab1");
    tabContent.classList.add('active');
    var num = parseInt(tabId.match(/\d+/)[0]) - 1;
  
   // if (board) {
     boardInit(num);
    //}
  }
  
  // 新しいタブを追加する関数
  function addNewTab() {
    const newTabId = 'tab' + (tabs.length + 1);
    const newTabInfo = { id: newTabId, title: 'New Tab', content: '' };
    tabs.push(newTabInfo);
  
    // タブバーとタブコンテンツを再生成
    const tabBar = generateTabBar();
    const tabContents = generateTabContents();
  
    // 現在の要素を置き換える
    const currentTabBar = document.querySelector('.tab-bar');
    const currentTabContents = document.querySelector('.tab-contents');
    currentTabBar.replaceWith(tabBar);
    currentTabContents.replaceWith(tabContents);
  
    // 新しいタブをアクティブにする
    activateTab(newTabId);
  }
  
  export { generateTabBar, generateTabContents, activateTab };