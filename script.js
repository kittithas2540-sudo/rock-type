// ------------------ คีย์คำตอบ ------------------
const ANSWER_KEY = {
  "หินอัคนีแทรกซอน": ["หินแกรนิต", "หินแกบโบร"],
  "หินอัคนีพุ": ["หินบะซอลต์", "หินพัมมิซ"], // ใช้ชื่อ "หินพัมมิซ"
  "หินตะกอนผสม": ["หินทราย", "หินดินดาน"],
  "หินตะกอนประสาน": ["หินปูน"],
  "หินแปรสภาพแบบไพศาล": ["หินไนส์", "หินชีสต์"],
  "หินแปรสภาพแบบสัมผัส": ["หินอ่อน"]
};

let dragged = null;
let timerInterval = null;
let secondsElapsed = 0;
let playerName = "";

// ------------------ Timer ------------------
function startTimer(){
  stopTimer();
  secondsElapsed = 0;
  updateTimerLabel();
  timerInterval = setInterval(() => {
    secondsElapsed++;
    updateTimerLabel();
  }, 1000);
}

function stopTimer(){
  if(timerInterval){
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimerLabel(){
  const m = String(Math.floor(secondsElapsed/60)).padStart(2,"0");
  const s = String(secondsElapsed%60).padStart(2,"0");
  document.getElementById("timerLabel").textContent = `เวลา: ${m}:${s}`;
}

// ------------------ Game ------------------
function resetGame(){
  document.getElementById("scoreLabel").textContent = "ถูกต้อง: 0/10";
  const rocks = document.querySelectorAll(".rock");
  const palette = document.getElementById("rocks");
  rocks.forEach(r => {
    r.classList.remove("right","wrong");
    palette.appendChild(r);
  });
  startTimer();
}

function setupDragAndDrop(){
  document.querySelectorAll(".rock").forEach(el=>{
    el.addEventListener("dragstart", e=>{
      dragged=el;
      e.dataTransfer.setData("text/plain", el.dataset.rock);
    });
    el.addEventListener("dragend", ()=>{ dragged=null; });
  });
  document.querySelectorAll(".dropzone").forEach(zone=>{
    zone.addEventListener("dragover", e=>e.preventDefault());
    zone.addEventListener("drop", e=>{
      e.preventDefault();
      if(dragged) zone.appendChild(dragged);
    });
  });
}

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
        correctCount++; // นับคะแนนตามหินที่ถูก
      } else {
        r.classList.remove("right");
        r.classList.add("wrong"); // ไฮไลท์หินผิด
      }
    });
  });

  document.getElementById("scoreLabel").textContent = `ถูกต้อง: ${correctCount}/10`;

  if(correctCount === 10){
    stopTimer();
    showWinPopup();
    saveScore();
  }
}

// ------------------ Popup ------------------
function showWinPopup(){
  const m = String(Math.floor(secondsElapsed/60)).padStart(2,"0");
  const s = String(secondsElapsed%60).padStart(2,"0");
  document.getElementById("winMessage").textContent=`คุณใช้เวลา ${m}:${s}`;
  document.getElementById("winPopup").style.display="flex";
}
function closePopup(){ document.getElementById("winPopup").style.display="none"; }

// ------------------ Leaderboard ------------------
function saveScore(){
  const scores=JSON.parse(localStorage.getItem("rockScores")||"[]");
  scores.push({name:playerName,time:secondsElapsed});
  scores.sort((a,b)=>a.time-b.time);
  localStorage.setItem("rockScores",JSON.stringify(scores));
}

function showLeaderboard(){
  const scores=JSON.parse(localStorage.getItem("rockScores")||"[]");
  const list=document.getElementById("leaderboardList");
  list.innerHTML="";
  scores.forEach(s=>{
    const m=String(Math.floor(s.time/60)).padStart(2,"0");
    const sec=String(s.time%60).padStart(2,"0");
    const li=document.createElement("li");
    li.textContent=`${s.name} - ${m}:${sec}`;
    list.appendChild(li);
  });
  document.getElementById("leaderboard").style.display="flex";
}
function closeLeaderboard(){ document.getElementById("leaderboard").style.display="none"; }

// ------------------ Start ------------------
document.addEventListener("DOMContentLoaded",()=>{
  document.getElementById("startBtn").addEventListener("click",()=>{
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
});
