// import fetch from "node-fetch";

const updateBtn = document.getElementById('update__button');
const summonerName_h1 = document.getElementById('basicInfo__summoner-name');

const handleUpdateButtonClick = () => {
    const { username } = summonerName_h1.dataset;
    console.log("from handleUpdateButtonClick: ", username);
    // encodeURI(encodeURIComponent(username)) 얘는 뭔가 다름. 
    // encodeURI(username) 이게 내가 원하는대로 작동하는거 같고
    fetch(`/api/summoners/${username}/update`, {
        method: "POST",
    });
    // encryptedAccountId?를 바로 보내줘도 될거같긴 한데. 그랬다가는 url에 encryptedAccountId를 쓰게 되는데 만약 누군가 invalid한 accountid로 계속 요청을 시도한다면 riot api측에서 밴할 수 있다고 했기 때문에 만약을 위해 username을 넘기도록 함. 
};

updateBtn.addEventListener('click', handleUpdateButtonClick);