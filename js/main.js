import "../style/index.scss";
import { onLoadBoard, onResizeBoard } from "./board"
import { activateTab, loadTabs } from "./tabs"
import { handleDragOver, handleFileSelect, applyColorTheme, onBoardKeydown } from "./board_utils";

//const initialTabId = 'tab1';
//let currentTabId = '';
const tabs = [
    { id: 'tab1', title: '1', content: '' }, //Bio-IxDesigner
    { id: 'tab2', title: '2', content: '' },
    { id: 'tab3', title: '3', content: '' },
    { id: 'tab4', title: '4', content: '' },
];

function main() {

    applyColorTheme();
    loadTabs(tabs);
    activateTab('tab1');

    // For keyboard shortcuts
    window.addEventListener("keydown", onBoardKeydown);

    // For drag and drop file upload
    window.addEventListener('dragover', handleDragOver, false);
    window.addEventListener('drop', handleFileSelect, false);
    
    // For load and resize board
    window.addEventListener("load", onLoadBoard);
    window.addEventListener("resize", onResizeBoard);

    /*window.addEventListener('beforeunload', function() {
        localStorage.clear();
    });*/
}

main();




