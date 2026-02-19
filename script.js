let currentUser=null;

function show(id){
['auth','mine','ref','with','dash'].forEach(x=>document.getElementById(x).style.display='none');
document.getElementById(id).style.display='block';
}

let h=0;
setInterval(()=>{h+=Math.floor(Math.random()*5);document.getElementById("hash").innerHTML=h+" H/s";},1000);

function register(){
let email=document.getElementById("email").value;
let wallet=document.getElementById("wallet").value;
let refCode=document.getElementById("refCode").value||"";
if(email.length<5||wallet.length<10){document.getElementById("authMsg").innerHTML="❌ Invalid input";return;}
auth.createUserWithEmailAndPassword(email,"SindhCoin123").then(cred=>{
currentUser=cred.user;
db.collection("users").doc(currentUser.uid).set({wallet,email,balance:0,referrals:[],lastClaim:0,referrer:refCode});
if(refCode){db.collection("users").doc(refCode).get().then(doc=>{if(doc.exists){db.collection("users").doc(refCode).update({balance:firebase.firestore.FieldValue.increment(1000),referrals:firebase.firestore.FieldValue.arrayUnion(currentUser.uid)});}});}
document.getElementById("authMsg").innerHTML="✅ Registered! Use Login";
}).catch(e=>{document.getElementById("authMsg").innerHTML=e.message});
}

function login(){
let email=document.getElementById("email").value;
auth.signInWithEmailAndPassword(email,"SindhCoin123").then(cred=>{currentUser=cred.user;document.getElementById("authMsg").innerHTML="✅ Logged in!";loadDashboard();}).catch(e=>{document.getElementById("authMsg").innerHTML=e.message});
}

function mineCoins(){
if(!currentUser){document.getElementById("mineMsg").innerHTML="❌ Login first";return;}
let docRef=db.collection("users").doc(currentUser.uid);
docRef.get().then(doc=>{let now=Date.now();if(now-doc.data().lastClaim<24*60*60*1000){document.getElementById("mineMsg").innerHTML="❌ Already claimed today";}else{docRef.update({balance:firebase.firestore.FieldValue.increment(300),lastClaim:now});document.getElementById("mineMsg").innerHTML="✅ 300 SINDH Added!";loadDashboard();}});
}

function loadDashboard(){
if(!currentUser) return;
db.collection("users").doc(currentUser.uid).get().then(doc=>{let data=doc.data();document.getElementById("dashMined").innerHTML="Total Mined: "+data.balance;document.getElementById("dashRefs").innerHTML="Referrals: "+data.referrals.length;document.getElementById("dashBal").innerHTML="Balance: "+data.balance+" SINDH";document.getElementById("referralLink").value=window.location.href+"?ref="+currentUser.uid;});
}

function withdraw(){
if(!currentUser){document.getElementById("withdrawMsg").innerHTML="❌ Login first";return;}
let wallet=document.getElementById("withdrawWallet").value;
let amt=parseInt(document.getElementById("withdrawAmount").value);
if(amt<5000){document.getElementById("withdrawMsg").innerHTML="❌ Minimum 5000";return;}
db.collection("withdrawRequests").add({userId:currentUser.uid,amount:amt,wallet,status:"pending",timestamp:Date.now()});
document.getElementById("withdrawMsg").innerHTML="✅ Request Submitted!";
}

setInterval(loadDashboard,5000);