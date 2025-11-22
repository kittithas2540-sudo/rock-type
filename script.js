// ------------------ คีย์คำตอบ ------------------
const ANSWER_KEY = {
  "หินอัคนีแทรกซอน": ["หินแกรนิต", "หินแกบโบร"],
  "หินอัคนีพุ": ["หินบะซอลต์", "หินพัมมิซ"],
  "หินตะกอนผสม": ["หินทราย", "หินดินดาน"],
  "หินตะกอนประสาน": ["หินปูน"],
  "หินแปรสภาพแบบไพศาล": ["หินไนส์", "หินชีสต์"],
  "หินแปรสภาพแบบสัมผัส": ["หินอ่อน"]
  // 👉 ถ้ามี dropzone ใหม่ ให้เพิ่มตรงนี้
};

// ------------------ จำนวนหินทั้งหมด ------------------
const TOTAL_ROCKS = Object.values(ANSWER_KEY).reduce((sum, arr)=> sum + arr.length, 0);

let dragged = null;
let timerInterval = null;
let centisecondsElapsed = 0;
let playerName = "";

// ------------------ Timer ------------------
function startTimer(){
  stopTimer();
  centisecondsElapsed = 0;
  updateTimerLabel();
  timerInterval = setInterval(() => {
    centisecondsElapsed++;
    updateTimerLabel();
  }, 10);
}

function stopTimer(){
  if(timerInterval){
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimerLabel(){
  const totalSeconds = Math.floor(centisecondsElapsed / 100);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2,"0");
  const seconds = String(totalSeconds % 60).padStart(2,"0");
  const centis = String(centisecondsElapsed % 100).padStart(2,"0");
  document.getElementById("timerLabel").textContent = `เวลา: ${minutes}.${seconds}.${centis}`;
}

// ------------------ Game ------------------
function resetGame(){
  document.getElementById("scoreLabel").textContent = `ถูกต้อง: 0/${TOTAL_ROCKS}`;
  const rocks = document.querySelectorAll(".rock");
  const palette = document.getElementById("rocks");
  rocks.forEach(r => {
    r.classList.remove("right","wrong");
    palette.appendChild(r);
    r.style.position="static";
    r.style.zIndex="";
  });
  startTimer();
}

// ------------------ Drag & Drop (PC + Mobile) ------------------
function setupDragAndDrop(){
  document.querySelectorAll(".rock").forEach(el=>{
    el.addEventListener("dragstart", e=>{
      dragged=el;
      e.dataTransfer.setData("text/plain", el.dataset.rock);
    });
    el.addEventListener("dragend", ()=>{ dragged=null; });

    // Touch Drag สำหรับมือถือ
    setupTouchDrag(el);
  });

  document.querySelectorAll(".dropzone").forEach(zone=>{
    zone.addEventListener("dragover", e=>{
      e.preventDefault();
      zone.classList.add("dragover");
    });
    zone.addEventListener("dragleave", ()=>{
      zone.classList.remove("dragover");
    });
    zone.addEventListener("drop", e=>{
      e.preventDefault();
      zone.classList.remove("dragover");
      if(dragged) {
        zone.appendChild(dragged);
        dragged.style.position="static";
        dragged.style.zIndex="";
      }
    });
  });
}

// ------------------ Touch Drag (Mobile) ------------------
function setupTouchDrag(el){
  let offsetX, offsetY;

  el.addEventListener("touchstart", e=>{
    const touch = e.touches[0];
    offsetX = touch.clientX - el.getBoundingClientRect().left;
    offsetY = touch.clientY - el.getBoundingClientRect().top;
    el.style.position = "absolute";
    el.style.zIndex = 1000;
  });

  el.addEventListener("touchmove", e=>{
    e.preventDefault(); // 🚫 ป้องกัน scroll/รีเฟรชบน iOS
    const touch = e.touches[0];
    el.style.left = (touch.clientX - offsetX) + "px";
    el.style.top  = (touch.clientY - offsetY) + "px";

    document.querySelectorAll(".dropzone").forEach(zone=>{
      const rect = zone.getBoundingClientRect();
      if(touch.clientX > rect.left && touch.clientX < rect.right &&
         touch.clientY > rect.top  && touch.clientY < rect.bottom){
        zone.classList.add("dragover");
      } else {
        zone.classList.remove("dragover");
      }
    });
  }, { passive:false }); // 👈 ต้องใส่ passive:false เพื่อให้ preventDefault ทำงานบน iOS

  el.addEventListener("touchend", e=>{
    const touch = e.changedTouches[0];
    const dropzones = document.querySelectorAll(".dropzone");
    let dropped = false;

    dropzones.forEach(zone=>{
      const rect = zone.getBoundingClientRect();
      zone.classList.remove("dragover");
      if(touch.clientX > rect.left && touch.clientX < rect.right &&
         touch.clientY > rect.top  && touch.clientY < rect.bottom){
        zone.appendChild(el);
        el.style.position="static";
        el.style.zIndex="";
        dropped = true;
      }
    });

    if(!dropped){
      document.getElementById("rocks").appendChild(el);
      el.style.position="static";
      el.style.zIndex="";
    }
  });
}

// ------------------ ตรวจคำตอบ ------------------
function checkAnswers(){
  let correctCount = 0;

  document.querySelectorAll(".category").forEach(cat=>{
    const name = cat.dataset.category;
    const placed = [...cat.querySelectorAll(".rock")];
    const correctSet = new Set(ANSWER_KEY[name] || []);

    placed.forEach(r=>{
      if(correctSet.has(r.dataset.rock)){
        r.classList.remove("wrong");
        r.classList.add("right");
        correctCount++;
      } else {
        r.classList.remove("right");
        r.classList.add("wrong");
      }
    });
  });

  document.getElementById("scoreLabel").textContent = `ถูกต้อง: ${correctCount}/${TOTAL_ROCKS}`;

  if(correctCount === TOTAL_ROCKS){
    stopTimer();
    showWinPopup();
    saveScore();
  }
}

// ------------------ Popup ------------------
function showWinPopup(){
  const totalSeconds = Math.floor(centisecondsElapsed / 100);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2,"0");
  const seconds = String(totalSeconds % 60).padStart(2,"0");
  const centis = String(centisecondsElapsed % 100).padStart(2,"0");
  document.getElementById("winMessage").textContent=`คุณใช้เวลา ${minutes}.${seconds}.${centis}`;
  document.getElementById("winPopup").style.display="flex";
}
function closePopup(){ document.getElementById("winPopup").style.display="none"; }

// ------------------ Leaderboard (Google Sheets) ------------------
const API_URL = "https://script.google.com/macros/s/AKfycbwwhtEGmPMt7OJ8j65zbeCzTXpZ-SXLQanDn0G76L6CfL8-SOancmQFwODBVKRY0l7oaA/exec"; // ใส่ URL จาก Apps Script

function saveScore(){
  const payload = {
    name: playerName,
    score: TOTAL_ROCKS,
    time: centisecondsElapsed
  };

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  }).then(res => console.log("Score saved"));
}

async function showLeaderboard(){
  const res = await fetch(API_URL);
  const scores = await res.json();

  scores.sort((a,b)=>a.time-b.time);

  const list=document.getElementById("leaderboardList");
  list.innerHTML="";
  scores.forEach((s, index)=>{
    const totalSeconds = Math.floor(s.time / 100);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2,"0");
    const seconds = String(totalSeconds % 60).padStart(2,"0");
    const centis = String(s.time % 100).padStart(2,"0");

    const medal = index===0 ? "🥇" : index===1 ? "🥈" : index===2 ? "🥉" : `${index+1}.`;
    const li=document.createElement("li");
    li.textContent=`${medal} ${s.name} - ${minutes}.${seconds}.${centis}`;
    list.appendChild(li);
  });

  document.getElementById("leaderboard").style.display="flex";
}
function closeLeaderboard(){ document.getElementById("leaderboard").style.display="none"; }

// ------------------ Start ------------------
document.addEventListener("DOMContentLoaded",()=>{
  const startBtn = document.getElementById("startBtn");
  if(startBtn){
    startBtn.addEventListener("click",()=>{
      playerName=document.getElementById("playerName").value.trim()||"ผู้เล่น";
      document.getElementById("playerInput").style.display="none";
      document.getElementById("gameArea").style.display="block";
      document.getElementById("controls").style.display="flex";
      setupDragAndDrop();
      resetGame();
    });
  document.getElementById("checkBtn").addEventListener("click",checkAnswers);
  document.getElementById("resetBtn").addEventListener("click",resetGame);
  document.getElementById("leaderboardBtn").addEventListener("click",showLeaderboard);
  document.getElementById("leaderboardBtnHome").addEventListener("click",showLeaderboard);
});
