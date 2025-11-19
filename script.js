// ------------------ คีย์คำตอบ ------------------
const ANSWER_KEY = {
  "หินอัคนีแทรกซอน": ["หินแกรนิต", "หินแกบโบร"],
  "หินอัคนีพุ": ["หินบะซอลต์", "หินพัมมิซ"],
  "หินตะกอนผสม": ["หินทราย", "หินดินดาน"],
  "หินตะกอนประสาน": ["หินปูน"],
  "หินแปรสภาพแบบไพศาล": ["หินไนส์", "หินชีสต์"],
  "หินแปรสภาพแบบสัมผัส": ["หินอ่อน"]
};

let dragged = null;
let timerInterval = null;
let centisecondsElapsed = 0; // หน่วยเป็น 1/100 วินาที
let playerName = "";

// ------------------ Timer ------------------
function startTimer(){
  stopTimer();
  centisecondsElapsed = 0;
  updateTimerLabel();
  timerInterval = setInterval(() => {
    centisecondsElapsed++;
    updateTimerLabel();
  }, 10); // อัปเดตทุก 10ms
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
  const totalSeconds = Math.floor(centisecondsElapsed / 100);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2,"0");
  const seconds = String(totalSeconds % 60).padStart(2,"0");
  const centis = String(centisecondsElapsed % 100).padStart(2,"0");
  document.getElementById("winMessage").textContent=`คุณใช้เวลา ${minutes}.${seconds}.${centis}`;
  document.getElementById("winPopup").style.display="flex";
}
function closePopup(){ document.getElementById("winPopup").style.display="none"; }

// ------------------ Leaderboard ------------------
function saveScore(){
  const scores=JSON.parse(localStorage.getItem("rockScores")||"[]");
  scores.push({name:playerName,time:centisecondsElapsed});
  scores.sort((a,b)=>a.time-b.time);
  localStorage.setItem("rockScores",JSON.stringify(scores));
}

function showLeaderboard(){
  const scores=JSON.parse(localStorage.getItem("rockScores")||"[]");
  const list=document.getElementById("leaderboardList");
  list.innerHTML="";
  scores.forEach(s=>{
    const totalSeconds = Math.floor(s.time / 100);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2,"0");
    const seconds = String(totalSeconds % 60).padStart(2,"0");
    const centis = String(s.time % 100).padStart(2,"0");
    const li=document.createElement("li");
    li.textContent=`${s.name} - ${minutes}.${seconds}.${centis}`;
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
  document.getElementById("leaderboardBtnHome").addEventListener("click",showLeaderboard); // ปุ่มหน้าแรก
});
