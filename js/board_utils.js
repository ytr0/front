import { GRID_SIZE } from "./board_globals";
import { boardInit } from "./board";  
import { Config} from "./storage";

const config = new Config("memex-theme");
let theme = "light";

export function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0; var v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export function snapToGrid(value, grid) {
  return (grid) * Math.round(value / (grid));
};

export function checkBounds(parent, child) {
  let bounds = null;
  let collisions = [""];
  let _offset_x = 0;
  let _offset_y = 0;

  if (parent.top > child.top) { collisions.push("top"); _offset_y = 0}
  if (parent.left > child.left) { collisions.push("left"); _offset_x = 0}
  if ((parent.top + parent.height) < (child.top + child.height)) {collisions.push("bottom"); _offset_y = snapToGrid(parent.height - child.height, GRID_SIZE) };
  if ((parent.left + parent.width) < (child.left + child.width)) {collisions.push("right"); _offset_x = snapToGrid(parent.width - child.width, GRID_SIZE) }; 

  bounds = { edges: collisions, offset_x: _offset_x, offset_y: _offset_y}
  /*if (parent.top > child.top) { bounds = { edge: "top", offset: 0 }; }
  if (parent.left > child.left) { bounds = { edge: "left", offset: 0 }; }
  if ((parent.top + parent.height) < (child.top + child.height)) { bounds = { edge: "bottom", offset: snapToGrid(parent.height - child.height, GRID_SIZE) }; }
  if ((parent.left + parent.width) < (child.left + child.width)) { bounds = { edge: "right", offset: snapToGrid(parent.width - child.width, GRID_SIZE) }; }*/
  console.log(parent, child)
  return bounds;
};

export function decreaseAllMemoIndexes() {
  const memos = document.getElementsByClassName("memo"); // ここもっと良い書き方あるきがする
  for (const memo of memos) {
    let index = memo.style.zIndex;
    memo.style.zIndex = --index;
  }
};

export function countTextLength(text) {
  var textWithoutNewlines = text.replace(/\n/g, '').replace(/\r/g, '');
  var lengthWithoutNewlines = textWithoutNewlines.length;
  return lengthWithoutNewlines;
}

export function copyText(target) {
  //let copyText = document.querySelector("#" + id + ".input");
  target.select();
  document.execCommand("copy");
  document.getSelection().removeAllRanges();
  //notify("コピーしました");
}


/*export function notify(msg) {
  //const bar = document.createElement("div");
  //bar.setAttribute("id", "snackbar");
  var bar = document.getElementById("snackbar");
  bar.innerText = msg;

  bar.className = "show";
  setTimeout(() => {
      bar.className = bar.className.replace("show", "")
  }, "3000")
}

export function confirm(text) {
  return window.confirm(text);
};*/




export function handleFileSelect(evt) {
  evt.stopPropagation();
  evt.preventDefault();

  const files = evt.dataTransfer ? evt.dataTransfer.files : evt.target.files; // FileList object.

  const file = files[0];
  if (file.type !== 'text/plain') {
    alert('Please select a text file.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result;
    const parsedContent = JSON.parse(content);
    localStorage.clear();
    saveJSONToLocalStorage(parsedContent);
    console.log(parsedContent);
  };
  reader.readAsText(file);
}

export function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

export function saveJSONToLocalStorage(json) {
  for (const key in json) {
      if (typeof json[key] === 'object') {
          saveJSONToLocalStorage(json[key]);
      } else {
          localStorage.setItem(key, json[key]);
      }
  }
  boardInit(0);
}



export function applyColorTheme() {
  const body = document.querySelector("body");
  const savedPreference = config.get(theme); 

  // Prefer saved preference over OS preference
  //if (savedPreference) {
  if (savedPreference === "dark") {
    body.classList.add("dark");
    theme = "dark";
    config.darkmode();
  } else {
    body.classList.remove("dark");
    theme = "light";
    config.lightmode();
  }
   // return;
  //}

  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    body.classList.add("dark");
    theme = "dark";
  }
}

export function toggleColorTheme() {
  const body = document.querySelector("body");
  if (theme === "light") {
    body.classList.add("dark");
    theme = "dark";
    config.darkmode();
  } else {
    body.classList.remove("dark");
    theme = "light";
    config.lightmode();
  }
}


export function onBoardKeydown(e) {
  if ((e.keyCode === 27)) { //esc
  } else if ((e.code === "KeyS" && e.altKey )) {
    downloadLocalStorage();
  } else if ((e.code === "KeyR" && e.altKey )) {
    //loadProject();
  }  else if ((e.code === "KeyI")) {
    if (edit_mode === false) {
      e.preventDefault();
    }
    edit_mode = true;
  } else if ((e.code === "KeyN") && e.altKey) {
    alert("function: add new memo");
  } else if ((e.code === "KeyT" || e.keyCode === 84) && e.altKey) {
    // パチッと音を鳴らす
    toggleColorTheme();
  } 
}
