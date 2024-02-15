
import { GRID_SIZE, MARGIN, DRAG_INDEX, STATIC_INDEX, DEFAULT_MEMO, PROJECTS } from "./board_globals";
import { snapToGrid, checkBounds, generateUUID, decreaseAllMemoIndexes, copyText, countTextLength } from "./board_utils";
import { MemoStorage} from "./storage";

let activeMemoView;
let main, canvas, board, selection;
let currentMousePos, currentMemoViewSize;
let db = null;


/*
  Generic Event Handlers
*/

function onBoardMouseDown(e) {
  if (e.target === board) {
    handleBoardDragStart(e);
  } else {
    if (e.target.classList[0] === "drag") {
      handleMemoViewDragStart(e);
    } else if (e.target.classList[0] === "resize") {
      handleMemoViewResizeStart(e);
    }
  }
};

/*
  Memo Functions and Handlers
*/

function createMemoView(id, text, position, size) {　

  const options = {priority: 0, char_counter: true, draggable: false};
  const memoView = document.createElement("div");
        memoView.setAttribute("data-id", id);
        memoView.classList.add("memo");
        memoView.style.top = (position && position.top) ? `${position.top}px` : `80px`;
        memoView.style.left = (position && position.left) ? `${position.left}px` : `80px`;
        memoView.style.width = (size && size.width) ? `${size.width}px` : `80px`;
        memoView.style.height = (size && size.height) ? `${size.height}px` : `80px`;
        memoView.style.zIndex = STATIC_INDEX;

  const textarea = document.createElement("textarea");
  //const textarea = document.createElement("div");
  //textarea.setAttribute("contentEditable", true);
  //textarea.innerHTML = "<h1>aiu</h1>";
  textarea.classList.add("input");
  textarea.setAttribute("name", "text-"+id);
  textarea.setAttribute("placeholder", "Enter text...");
  textarea.setAttribute("autocomplete", true);

  const char_counter = document.createElement("div");

  if (options.char_counter) {
    char_counter.classList.add("counter");
    //counter.innerHTML = (text) ? text.length : "0"; 
    char_counter.innerHTML = (text) ? countTextLength(text) : "0";
    memoView.appendChild(char_counter);
  }

  if (text) { textarea.innerHTML = text; }
    textarea.addEventListener("focus", function (e) {
    e.target.classList.add("active");
    decreaseAllMemoIndexes();
    activeMemoView = e.target.parentNode;
    activeMemoView.style.zIndex = STATIC_INDEX;
    });
    textarea.addEventListener("blur", function (e) { e.target.classList.remove("active"); }, { passive: false, useCapture: false });
    textarea.addEventListener("input", function (e) {
                                                  const input_text = e.target.value; //e.target.innerHTML;
                                                  if (options.char_counter) {
                                                    char_counter.innerHTML = input_text ? countTextLength(input_text) : "0"; 
                                                  }
                                                  /***********************************************************************/
                                                  db.newValue(id, input_text);
                                                  /***********************************************************************/
                                                }, { passive: false, useCapture: false }
    );

    memoView.appendChild(textarea);

    const drag = document.createElement("div");
    drag.classList.add("drag");
     
    //drag.addEventListener("mousedown", onMouseDown);
    //drag.addEventListener("touchstart", onMouseDown);
    memoView.appendChild(drag);
    
    const close = document.createElement("div");
    close.classList.add("close");
    close.innerHTML = "×"; //"−";
    close.addEventListener("mouseup", handleMemoClose);
    close.addEventListener("touchend", handleMemoClose);
    memoView.appendChild(close);

    const menu = document.createElement("div");
    menu.classList.add("menu");
    menu.innerHTML = "☰"; 
    menu.addEventListener("click", function (e) { copyText(e.target.parentNode.querySelector(".input")) }); //e.target.parentNode.querySelector(".input").value
    memoView.appendChild(menu);
  
    const resize = document.createElement("div");
    resize.classList.add("resize");
   // resize.addEventListener("mousedown", onMouseDown);
   // resize.addEventListener("touchstart", onMouseDown);
    memoView.appendChild(resize);


  return memoView;
};

function handleMemoViewDragStart(e) {
  if (e.which === 1 || e.touches) {
    decreaseAllMemoIndexes();
    activeMemoView = e.target.parentNode;
    activeMemoView.classList.add("active");
    activeMemoView.style.zIndex = STATIC_INDEX;

    const textarea = activeMemoView.querySelectorAll(".input")[0];
    textarea.blur();

    e.target.style.backgroundColor = "var(--gray)";
    e.target.style.cursor = "grabbing";

    document.body.style.cursor = "grabbing";

    const x = (e.touches && e.touches.length > 0) ? snapToGrid(e.touches[0].clientX, GRID_SIZE) : snapToGrid(e.clientX, GRID_SIZE);
    const y = (e.touches && e.touches.length > 0) ? snapToGrid(e.touches[0].clientY, GRID_SIZE) : snapToGrid(e.clientY, GRID_SIZE);

    currentMousePos = { x, y };

    document.addEventListener("mousemove", handleMemoViewDragMove, { passive: false, useCapture: false });
    document.addEventListener("touchmove", handleMemoViewDragMove, { passive: false, useCapture: false });

    document.addEventListener("mouseup", handleMemoViewDragEnd, { passive: false, useCapture: false });
    document.addEventListener("touchcancel", handleMemoViewDragEnd, { passive: false, useCapture: false });
    document.addEventListener("touchend", handleMemoViewDragEnd, { passive: false, useCapture: false });
  }
};

function handleMemoViewDragMove(e) {
  const isActive = activeMemoView.classList.contains("active");

  if (isActive) {
    const x = (e.touches && e.touches.length > 0) ? snapToGrid(e.touches[0].clientX, GRID_SIZE) : snapToGrid(e.clientX, GRID_SIZE);
    const y = (e.touches && e.touches.length > 0) ? snapToGrid(e.touches[0].clientY, GRID_SIZE) : snapToGrid(e.clientY, GRID_SIZE);

    activeMemoView.style.top = `${activeMemoView.offsetTop - (currentMousePos.y - y)}px`;
    activeMemoView.style.left = `${activeMemoView.offsetLeft - (currentMousePos.x - x)}px`;

    currentMousePos = { x, y };
  }
};

function handleMemoViewDragEnd(e) {
  const bounds = checkBounds(board.getBoundingClientRect(), activeMemoView.getBoundingClientRect());

  const x = (e.touches && e.touches.length > 0) ? snapToGrid(e.touches[0].clientX, GRID_SIZE) : snapToGrid(e.clientX, GRID_SIZE);
  const y = (e.touches && e.touches.length > 0) ? snapToGrid(e.touches[0].clientY, GRID_SIZE) : snapToGrid(e.clientY, GRID_SIZE);

  let top = activeMemoView.offsetTop - (currentMousePos.y - y);
  let left = activeMemoView.offsetLeft - (currentMousePos.x - x);

  if (bounds) {
    if (bounds.edges.includes("top")) {
      top = bounds.offset_y;
    } else if (bounds.edges.includes("bottom")) {
      top = bounds.offset_y;
    }
    if (bounds.edges.includes("left")) {
      left = bounds.offset_x;
    } else if (bounds.edges.includes("right")) {
      left = bounds.offset_x;
    }
  }

  activeMemoView.style.top = `${top}px`;
  activeMemoView.style.left = `${left}px`;
  activeMemoView.classList.remove("active");

  const drag = activeMemoView.querySelectorAll(".drag")[0];
  drag.style.cursor = "grab";
  drag.style.backgroundColor = "transparent";

  const textarea = activeMemoView.querySelectorAll(".input")[0];
  textarea.focus();

  /************************************************************************/
  db.newPosition(activeMemoView.dataset.id, top, left);
  /************************************************************************/

  document.body.style.cursor = null;
  activeMemoView = null;
  currentMousePos = null;

  document.removeEventListener("mousemove", handleMemoViewDragMove);
  document.removeEventListener("touchmove", handleMemoViewDragMove);

  document.removeEventListener("mouseup", handleMemoViewDragEnd);
  document.removeEventListener("touchcancel", handleMemoViewDragEnd);
  document.removeEventListener("touchend", handleMemoViewDragEnd);
};

function handleMemoClose(e) { 
             // if (confirm("Are you sure you want to remove this memo?")) {
                    db.remove(e.target.parentNode.dataset.id);
                    board.removeChild(e.target.parentNode);
             // }
};

function handleMemoViewResizeStart(e) {
  if (e.which === 1 || e.touches) {
    decreaseAllMemoIndexes();

    activeMemoView = e.target.parentNode;
    activeMemoView.classList.add("active");
    activeMemoView.style.zIndex = STATIC_INDEX;

    const textarea = activeMemoView.querySelectorAll(".input")[0];
    textarea.blur();

    document.body.style.cursor = "nw-resize";
    e.target.style.backgroundColor = "var(--gray)";

    const x = (e.touches && e.touches.length > 0) ? snapToGrid(e.touches[0].clientX, GRID_SIZE) : snapToGrid(e.clientX, GRID_SIZE);
    const y = (e.touches && e.touches.length > 0) ? snapToGrid(e.touches[0].clientY, GRID_SIZE) : snapToGrid(e.clientY, GRID_SIZE);

    const rect = activeMemoView.getBoundingClientRect();
    const width = parseInt(rect.width, 10);
    const height = parseInt(rect.height, 10);

    currentMousePos = { x, y };
    currentMemoViewSize = { width, height };

    document.addEventListener("mousemove", handleMemoViewResizeMove, { passive: false, useCapture: false });
    document.addEventListener("touchmove", handleMemoViewResizeMove, { passive: false, useCapture: false });

    document.addEventListener("mouseup", handleMemoViewResizeEnd, { passive: false, useCapture: false });
    document.addEventListener("touchcancel", handleMemoViewResizeEnd, { passive: false, useCapture: false });
    document.addEventListener("touchend", handleMemoViewResizeEnd, { passive: false, useCapture: false }); ;
  }
};

function handleMemoViewResizeMove(e) {
  const isActive = activeMemoView.classList.contains("active");

  if (isActive) {
    const x = (e.touches && e.touches.length > 0) ? snapToGrid(e.touches[0].clientX, GRID_SIZE) : snapToGrid(e.clientX, GRID_SIZE);
    const y = (e.touches && e.touches.length > 0) ? snapToGrid(e.touches[0].clientY, GRID_SIZE) : snapToGrid(e.clientY, GRID_SIZE);

    const width = (currentMemoViewSize.width + (x - currentMousePos.x)) - 2;
    const height = (currentMemoViewSize.height + (y - currentMousePos.y)) - 2;
    //console.log(width + 1, height + 1);

    activeMemoView.style.width = `${width}px`;
    activeMemoView.style.height = `${height}px`;
  }
};

function handleMemoViewResizeEnd(e) {
  const x = (e.touches && e.touches.length > 0) ? snapToGrid(e.touches[0].clientX, GRID_SIZE) : snapToGrid(e.clientX, GRID_SIZE);
  const y = (e.touches && e.touches.length > 0) ? snapToGrid(e.touches[0].clientY, GRID_SIZE) : snapToGrid(e.clientY, GRID_SIZE);

  const width = (currentMemoViewSize.width + (x - currentMousePos.x)) - 2;
  const height = (currentMemoViewSize.height + (y - currentMousePos.y)) - 2;

  activeMemoView.style.width = `${width}px`;
  activeMemoView.style.height = `${height}px`;

  const bounds = checkBounds(board.getBoundingClientRect(), activeMemoView.getBoundingClientRect());

  if (bounds) {
      let top = activeMemoView.offsetTop;
      let left = activeMemoView.offsetLeft;

      if (bounds.edges.includes("top")) {
        top = bounds.offset_y;
      } else if (bounds.edges.includes("bottom")) {
        top = bounds.offset_y;
      }
      if (bounds.edges.includes("left")) {
        left = bounds.offset_x;
      } else if (bounds.edges.includes("right")) {
        left = bounds.offset_x;
      }

    activeMemoView.style.top = `${top}px`;
    activeMemoView.style.left = `${left}px`;
  }

  const resize = activeMemoView.querySelectorAll(".resize")[0];
  resize.style.cursor = "nw-resize";
  resize.style.backgroundColor = "transparent";

  activeMemoView.classList.remove("active");
  const textarea = activeMemoView.querySelectorAll(".input")[0];
  textarea.focus();

  /************************************************************************/
  db.newSize(activeMemoView.dataset.id, width, height);
  /************************************************************************/

  document.body.style.cursor = null;
  activeMemoView = null;
  currentMemoViewSize = null;

  document.removeEventListener("mousemove", handleMemoViewResizeMove, { passive: false, useCapture: false });
  document.removeEventListener("touchmove", handleMemoViewResizeMove, { passive: false, useCapture: false });

  document.removeEventListener("mouseup", handleMemoViewResizeEnd, { passive: false, useCapture: false });
  document.removeEventListener("touchcancel", handleMemoViewResizeEnd, { passive: false, useCapture: false });
  document.removeEventListener("touchend", handleMemoViewResizeEnd, { passive: false, useCapture: false });
};

/*
  Board Functions and Handlers
*/

function handleBoardDragStart(e) {
  if (e.which === 1 || e.touches) {
    document.body.style.cursor = "crosshair";

    board.classList.add("active");

    const rect = board.getBoundingClientRect();
    const x = (e.touches && e.touches.length > 0) ? snapToGrid(e.touches[0].clientX - rect.left, GRID_SIZE) : snapToGrid(e.clientX - rect.left, GRID_SIZE);
    const y = (e.touches && e.touches.length > 0) ? snapToGrid(e.touches[0].clientY - rect.top, GRID_SIZE) : snapToGrid(e.clientY - rect.top, GRID_SIZE);

    currentMousePos = { x, y };

    selection = document.createElement("div");
    selection.setAttribute("id", "selection");
    selection.style.zIndex = DRAG_INDEX;

    board.appendChild(selection);

    document.addEventListener("mousemove", handleBoardDragMove);
    document.addEventListener("touchmove", handleBoardDragMove);

    document.addEventListener("mouseup", handleBoardDragEnd);
    document.addEventListener("touchcancel", handleBoardDragEnd);
    document.addEventListener("touchend", handleBoardDragEnd);
  }
};

function handleBoardDragMove(e) {
  const rect = board.getBoundingClientRect();
  const x = (e.touches && e.touches.length > 0) ? snapToGrid(e.touches[0].clientX - rect.left, GRID_SIZE) : snapToGrid(e.clientX - rect.left, GRID_SIZE);
  const y = (e.touches && e.touches.length > 0) ? snapToGrid(e.touches[0].clientY - rect.top, GRID_SIZE) : snapToGrid(e.clientY - rect.top, GRID_SIZE);

  const top = (y - currentMousePos.y < 0) ? y : currentMousePos.y;
  const left = (x - currentMousePos.x < 0) ? x : currentMousePos.x;
  const width = Math.abs(x - currentMousePos.x) + 1;
  const height = Math.abs(y - currentMousePos.y) + 1;

  selection.style.top = `${top}px`;
  selection.style.left = `${left}px`;
  selection.style.width = `${width}px`;
  selection.style.height = `${height}px`;
};

function handleBoardDragEnd(e) {
  const boardRect = board.getBoundingClientRect();
  const selectionRect = selection.getBoundingClientRect();

  const width = selectionRect.width - 2;
  const height = selectionRect.height - 2;

  let top = selectionRect.top - boardRect.top;
  let left = selectionRect.left - boardRect.left;

  const bounds = checkBounds(boardRect, selectionRect);

  if (bounds) {
    if (bounds.edges.includes("top")) {
      top = bounds.offset_y;
    } else if (bounds.edges.includes("bottom")) {
      top = bounds.offset_y;
    }
    if (bounds.edges.includes("left")) {
      left = bounds.offset_x;
    } else if (bounds.edges.includes("right")) {
      left = bounds.offset_x;
    }
  }

  if (width >= 80 && height >= 80) { //これより大きかったら作る
    const id = generateUUID();
    const memo = createMemoView(id, null, { top, left }, { width, height });
    board.appendChild(memo);

    const textarea = memo.querySelectorAll(".input")[0];
    textarea.focus();

    /************************************************************************************************ */
    db.update(id, { text: null, position: { top, left }, size: { width, height } });
    /************************************************************************************************ */

    activeMemoView = memo;
  }

  document.body.style.cursor = null;
  board.classList.remove("active");
  board.removeChild(selection);

  document.removeEventListener("mousemove", handleBoardDragMove, { passive: false, useCapture: false });
  document.removeEventListener("touchmove", handleBoardDragMove, { passive: false, useCapture: false });

  document.removeEventListener("mouseup", handleBoardDragEnd, { passive: false, useCapture: false });
  document.removeEventListener("touchcancel", handleBoardDragEnd, { passive: false, useCapture: false });
  document.removeEventListener("touchend", handleBoardDragEnd, { passive: false, useCapture: false });
};



/******************************************************** MAIN ******************************************************** */

function onLoadBoard() { //generateBoardDom

  let targetDOM = document.querySelector('.tab-content.active');

  main = document.createElement("main");
  main.setAttribute("id", "app");

  canvas = document.createElement("canvas");
  canvas.setAttribute("id", "grid");

  board = document.createElement("section");
  board.setAttribute("id", "board");

  board.addEventListener("mousedown", onBoardMouseDown, { passive: false, useCapture: false });
  board.addEventListener("touchstart", onBoardMouseDown, { passive: false, useCapture: false });

  main.appendChild(canvas);
  main.appendChild(board);
  //document.body.appendChild(main);
  targetDOM.appendChild(main);

  document.body.addEventListener("touchmove", function (event) {
    event.preventDefault();
  }, { passive: false, useCapture: false });


  boardInit(0);
};


async function boardInit(projectId) { // LOAD ALL MEMOS at onLoad().

  clearBoard();
  if (board) {
      db = new MemoStorage(PROJECTS[projectId].id); //memostorageも切り出せそう　引数に入れる
      console.log(PROJECTS[projectId].name);
      const memos = db.get();
      const DATA_NOT_FOUND = (!memos || Object.keys(memos).length === 0);

      if (DATA_NOT_FOUND) {
        console.log("data not found")
       // const memo = createMemoView(DEFAULT_MEMO.id, DEFAULT_MEMO.text, DEFAULT_MEMO.position, DEFAULT_MEMO.size);
       // board.appendChild(memo);
        /**!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */
        //db.update(DEFAULT_MEMO.id, { text: DEFAULT_MEMO.text, position: DEFAULT_MEMO.position, size: DEFAULT_MEMO.size, projectId: DEFAULT_MEMO.projectId });
        /**!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */

      } else {
            for (const key of Object.keys(memos)) {
              const memo = createMemoView(key, memos[key].text, memos[key].position, memos[key].size);
              board.appendChild(memo);
            }
      }
      onResizeBoard(window.innerWidth, window.innerHeight) 
  } else {
    console.log("board is not found");
  }

}

function onResizeBoard(w, h) { // Redraw the canvas
  w = window.innerWidth * 2;
  h = window.innerHeight - 10;
  main.style.width = `${w}px`;
  main.style.height = `${h}px`;

  const width = (w - MARGIN) + 0; //- 1;
  const height = (h - MARGIN) + 0;

  board.style.top = `${MARGIN / 2}px`;
  board.style.left = `${MARGIN / 2}px`;
  board.style.width = `${width}px`;
  board.style.height = `${height}px`;
  
  //Canvasはグリッドとbgcolorのため
  canvas.setAttribute("width", width);
  canvas.setAttribute("height", height);
  canvas.style.top = `${MARGIN / 2}px`;
  canvas.style.left = `${MARGIN / 2}px`;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

    /*const context = canvas.getContext("2d");
    for (let x = 0; x <= width; x += GRID_SIZE) {
      for (let y = 0; y <= height; y += GRID_SIZE) {
        context.fillStyle = theme === "light" ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.4)";
        context.beginPath();
        context.rect(x, y, 1, 1);
        context.fill();
      }
    }*/
  
  currentMousePos = null;
  currentMemoViewSize = null;
};


function clearBoard() {
    // Remove all existing memoView elements
    const memoViews = document.querySelectorAll('.memo');
    memoViews.forEach(memoView => memoView.remove());
}



export { onLoadBoard, onResizeBoard, boardInit, clearBoard };





/*function main () {
  window.addEventListener("resize", onResizeBoard);
  window.addEventListener("load", onLoadBoard);
  window.addEventListener("keydown", onBoardKeydown);

  //onLoadBoard();
  //boardInit();
  //onResizeBoard();
  //activateTab();
}*/







//import { getProjects } from "../lib/db";
/*
  App Functions
*/



// svelte markdown https://codepen.io/borntofrappe/pen/VwwyGzR


//https://danburzo.ro/dom-gestures/ DOM GESTURE LOGGER

/*
async function getProjects() {
      try {
      await fetch("/api/projects", {
        method: "POST",
      //body: JSON.stringify(data),
      })
      .then((response) => response.json())
      .then((result) => 
          {
          console.log(result)
          projects = JSON.stringify(result);
          return projects;
          }
        );
      } catch (error) {
      console.log("Oops. We failed.");
      }
  }*/


// Google Calendarには残すが、データベースには残さない。
// → サーバの負担なくマネタイズできそう

// HTML5 Large Canvas Scrolling
//https://konvajs.org/docs/sandbox/Canvas_Scrolling.html
//https://stackoverflow.com/questions/36219632/html5-canvas-scrolling-vertically-and-horizontally
//https://dev.to/sip3/how-to-achieve-top-notch-scrolling-performance-using-html5-canvas-k49

//https://bom-shibuya.hatenablog.com/entry/2018/05/15/203446


//https://code.tutsplus.com/articles/21-ridiculously-impressive-html5-canvas-experiments--net-14210
//https://web.dev/css-scroll-snap/

//http://k-ichikawa.blog.enjoy.jp/etc/HP/js/memo/scroll/srl.html //mouse wheel

// index.js というより　view.jsという感じにする
// https://stackoverflow.com/questions/59624611/how-do-i-make-a-div-contenteditable-on-doubleclick-using-svelte
// 優先度高め

// make it work, make it better
// minimalな完成はどの段階？？
//  ->自分で使えること
//  ->とすると、①データがファイルに保存される。　②サーバで動く
//  の2つが条件。③にプロジェクト管理機能、という感じ。

// タブでプロジェクト切り替え

// title の情報はどこにもたせる？？
// title は　いっそなくていいかも。　markdownにする
// ファイル名をつける手間がなくなる
// projectId, parentId

// tabキーの挙動

// いま　light と　dark　で　テーマを切り替えてる。
// これをいっそプロジェクト名にする感じで手っ取り早く実装する。

// 優先度低め
// 今日の日付のテキストが自動でつながっていくやつ
// 画像
// 少なくとも縦方向の無限スクロール

// 最終的にmemoはmodeで切り替えられるのが理想かな。
//  input, edit, command_repr, position_fixed, chat
//  などなど

//　余白が大事な全画面集中モード
//  アコーディオン　https://coco-factory.jp/ugokuweb/move01/9-2-1/

// TODO: textareaの依存関係を整理する。contentEditableにできるように。

// fixで固定メモ
// コンソール、コマンド機能、正規表現でハイライト

// ドラッグでメモを追加するだけでなく、選択と移動ができるようにとか。
// bezierのやつが参考になりそう。