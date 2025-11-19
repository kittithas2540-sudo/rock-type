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

// ------------------ Google Script URL ------------------
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw1d1nkD4t6Z91rGaZ6sWf52EwMRPUmLn7831M6p5c0V45AAMgG_XpteL_RDr_UQRYW/exec";

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

function formatTime(cs){
  const totalSeconds = Math.floor(cs / 100);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2,"0");
  const seconds = String(totalSeconds % 60).padStart(2,"0");
  const centis = String(cs % 100).padStart(2,"0");
  return `${minutes}.${seconds}.${centis}`;
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
        correctCount++;
      } else {
        r.classList.remove("right");
        r.classList.add("wrong");
      }
    });
  });

  document.getElementById("scoreLabel").textContent = `ถูกต้อง: ${correctCount}/10`;

  if(correctCount === 10){
    stopTimer();
    showWinPopup();
    // ส่งข้อมูลไป Google Sheet ครบ name, score, time
    saveScoreToGoogleSheet(playerName, correctCount, formatTime(centisecondsElapsed));
  }
}

// ------------------ Google Sheet Integration ------------------
function saveScoreToGoogleSheet(name, score, time){
  fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({ name, score, time }),
    headers: { "Content-Type": "application/json" }
  })
  .then(res => res.text())
  .then(txt => console.log("Saved to Google Sheet:", txt))
  .catch(err => console.error("Error:", err));
}

function showLeaderboard(){
  fetch(GOOGLE_SCRIPT_URL)
    .then(res => res.json())
    .then(scores => {
      // ฟังก์ชันแปลงเวลาเป็นเซนติวินาที
      const toCentis = (t) => {
        const parts = String(t).split(".");
        const mm = parseInt(parts[0] || "0", 10);
        const ss = parseInt(parts[1] || "0", 10);
        const cc = parseInt(parts[2] || "0", 10);
        return mm*60*100 + ss*100 + cc;
      };

      // เรียงลำดับจากเวลาน้อยไปมาก (เร็วสุดอยู่บน)
      scores.sort((a,b)=> toCentis(a.playtime) - toCentis(b.playtime));

      const list=document.getElementById("leaderboardList");
      list.innerHTML="";
      scores.forEach((s, index)=>{
        const li=document.createElement("li");
        li.textContent=`#${index+1} ${s.name} - คะแนน ${s.score} - เวลา ${s.playtime}`;
        list.appendChild(li);
      });
      document.getElementById("leaderboard").style.display="flex";
    })
    .catch(err => console.error("Error loading leaderboard:", err));
}

// ------------------ Popup ------------------
function showWinPopup(){
  document.getElementById("winMessage").textContent=`คุณใช้เวลา ${formatTime(centisecondsElapsed)}`;
  document.getElementById("winPopup").style.display="flex";
}
function closePopup(){ document.getElementById("winPopup").style.display="none"; }
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
  document.getElementById("leaderboardBtnHome").addEventListener("click",showLeaderboard);
});
