// import fetch from "node-fetch";

const updateBtn = document.getElementById('update__button');
const summonerName_h1 = document.getElementById('basicInfo__summoner-name');

const handleUpdateButtonClick = async () => {
    const { username } = summonerName_h1.dataset;
    console.log("from handleUpdateButtonClick: ", username);
    // encodeURI(encodeURIComponent(username)) 얘는 뭔가 다름. 
    // encodeURI(username) 이게 내가 원하는대로 작동하는거 같고
    const { status } = await fetch(`/api/summoners/${username}/update`, {
        method: "POST",
    });
    // fetch 함수는 response object를 반환함. 그 안에 status라는 녀석이 있음. 그녀석을 가져오는 것. 
    console.log("status: ", status);
    if(status == 200){
        console.log("code 200 confiremd, should be reloaded!");
        location.reload();
    }else if(status == 400){
        alert(`summoner name is required\nstatus code: ${status}`);
    }else if(status == 404){
        alert(`The summoner name is invalid or is valid but not found in db.\nIf summoner name is valid, search must be done before updating.\nTo do so, go to monster.gg\nstatus code: ${status}`);
    }
    // encryptedAccountId?를 바로 보내주면 api요청을 줄일 수 있고 코드도 편할거 같기는 한데. 그랬다가는 url에 encryptedAccountId를 써야 한다는 건데 문제는 만약 누군가 invalid한 accountid로 계속 api url접속을 시도한다면 서버가 계속 invalid한 id로 riot api에 요청을 시도하게 되는데, 그러한 경우 riot api측에서 밴할 수 있다고 했기 때문에 만약을 위해 username을 넘기도록 함. 
    // 페이지 로드 할때 last update time도 넘겨받아서 (아마 dataset으로?) 2분전이면 업데이트 못하도록 하자 몇초 남았는지 알려주고.
};

updateBtn.addEventListener('click', handleUpdateButtonClick);