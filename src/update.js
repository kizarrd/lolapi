// import fetch from "node-fetch";

const updateBtn = document.getElementById('update__button');
const summonerName_h1 = document.getElementById('basicInfo__summoner-name');

const handleUpdateButtonClick = async () => {
    const { username } = summonerName_h1.dataset;
    console.log("from handleUpdateButtonClick: ", username);
    // encodeURI(encodeURIComponent(username)) 얘는 뭔가 다름. 
    // encodeURI(username) 이게 내가 원하는대로 작동하는거 같고
    const { statusCode } = await fetch(`/api/summoners/${username}/update`, {
        method: "POST",
    });

    if(statusCode == 200){
        location.reload();
    }else if(statusCode == 400){
        alert(`summoner name is required\nstatus code: ${statusCode}`);
    }else if(statusCode == 404){
        alert(`The summoner name is invalid or is valid but not found in db.\nIf summoner name is valid, search must be done before updating.\nTo do so, go to monster.gg\nstatus code: ${statusCode}`);
    }

    // encryptedAccountId?를 바로 보내주면 api요청을 줄일 수 있고 코드도 편할거 같기는 한데. 그랬다가는 url에 encryptedAccountId를 써야 한다는 건데 문제는 만약 누군가 invalid한 accountid로 계속 api url접속을 시도한다면 서버가 계속 invalid한 id로 riot api에 요청을 시도하게 되는데, 그러한 경우 riot api측에서 밴할 수 있다고 했기 때문에 만약을 위해 username을 넘기도록 함. 

};

updateBtn.addEventListener('click', handleUpdateButtonClick);