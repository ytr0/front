
let tabCounter = 3;

function activateTab(tabId) {
    const tabs = document.querySelectorAll('.tab-item');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');

    // タブのインデックスを取得して、該当するタブをアクティブにする
    const tabIndex = [...contents].findIndex(content => content.id === tabId);
    tabs[tabIndex].classList.add('active');

    const iframe = document.getElementById("contentFrame");
    switch (tabId) {
        case "tab1":
            iframe.src = "./board.html";  // 読み込むHTMLファイルのパスを指定します
            break;
        case "tab2":
            iframe.src = "path_to_your_html_file2.html";
            break;
        // 他のタブに対しても同様に行います
    }
}

function addNewTab() {
    tabCounter++;

    const newTab = document.createElement("div");
    newTab.className = "tab-item";
    newTab.innerText = "Tab " + tabCounter;
    newTab.setAttribute("onclick", `activateTab('tab${tabCounter}')`);
    document.querySelector('.tab-bar').insertBefore(newTab, document.querySelector('.plus-btn'));

    const newContent = document.createElement("div");
    newContent.className = "tab-content";
    newContent.id = "tab" + tabCounter;
    newContent.textContent = `This is the content for Tab ${tabCounter}.`;
    document.body.appendChild(newContent);
}


function loadMainContent(overviewName) {
    const iframe = document.getElementById("contentAreaFrame");
    switch (overviewName) {
        case "About":
            iframe.src = "path_to_about.html"; // こちらに適切なパスを設定してください
            break;
        case "Project Map":
            iframe.src = "./project-map.html"; // こちらに適切なパスを設定してください
            break;
    }
}

// すべてのoverview-itemに対してクリックイベントを追加
document.querySelectorAll('.general-item').forEach(item => {
    item.addEventListener('click', function() {
        loadMainContent(item.textContent);
    });
});


// すべてのproject-itemに対してクリックイベントを追加
document.querySelectorAll('.project-item').forEach(item => {
    item.addEventListener('click', function() {
        // contentAreaFrameを非表示
        document.getElementById('contentAreaFrame').style.display = 'none';
        
        // タブバーを表示
        document.querySelector('.tab-bar').style.display = 'flex';
    });
});

// すべてのoverview-itemに対してクリックイベントを追加
document.querySelectorAll('.general-item').forEach(item => {
    item.addEventListener('click', function() {
        loadMainContent(item.textContent);
        
        // contentAreaFrameを表示
        document.getElementById('contentAreaFrame').style.display = 'block';

        // タブバーを非表示
        document.querySelector('.tab-bar').style.display = 'none';
    });
});


let projectsExpanded = true;  // Projectsが初めて展開されていると仮定
let devicesExpanded = true;

function toggleProjects() {
    const projects = document.querySelectorAll('.project-item');
    const arrowhead = document.querySelector('.arrowhead');

    if (projectsExpanded) {
        projects.forEach(project => project.style.display = 'none');
        arrowhead.classList.add('closed');
    } else {
        projects.forEach(project => project.style.display = 'block');
        arrowhead.classList.remove('closed');
    }

    projectsExpanded = !projectsExpanded;
}
/*function toggleDevices() {
    const devices = document.querySelectorAll('.project-item');
    const arrowhead = document.querySelector('.arrowhead');

    if (devicesExpanded) {
        devices.forEach(project => project.style.display = 'none');
        arrowhead.classList.add('closed');
    } else {
        projects.forEach(project => project.style.display = 'block');
        arrowhead.classList.remove('closed');
    }

    devicesExpanded = !devicesExpanded;
}*/



function main() {
    activateTab("tab1");
    loadMainContent("Project Map");
}

main();